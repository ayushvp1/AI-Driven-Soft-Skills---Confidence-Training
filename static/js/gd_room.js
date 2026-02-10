let discussionHistory = [];
let audioChunks = [];
let audioContext;
let workletNode;
let input;
let stream;
let audioBlob;

// Recording constraints
const MIN_RECORDING_DURATION = 1; // seconds
const MAX_RECORDING_DURATION = 60; // seconds
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Recording state
let recordingStartTime = null;
let recordingTimer = null;
let isRecording = false;

// UI Elements
let chatWindow, recordBtn, statusMessage, player, audioPlayback, sendMessageBtn, endSessionBtn;
let visualizerContainer, canvas, canvasCtx;
let analyser, dataArray, animationId;
let recordingTimerDisplay, cancelRecordBtn;

// Pre-fetch voices for smoother start
if (window.speechSynthesis) {
    window.speechSynthesis.getVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("GD Room JS Loaded");

    chatWindow = document.getElementById('chatWindow');
    recordBtn = document.getElementById('recordBtn');
    statusMessage = document.getElementById('statusMessage');
    player = document.getElementById('player');
    audioPlayback = document.getElementById('audioPlayback');
    sendMessageBtn = document.getElementById('sendMessageBtn');
    endSessionBtn = document.getElementById('endSessionBtn');
    visualizerContainer = document.getElementById('visualizerContainer');
    canvas = document.getElementById('visualizer');
    recordingTimerDisplay = document.getElementById('recordingTimer');
    cancelRecordBtn = document.getElementById('cancelRecordBtn');

    if (!recordBtn) {
        console.error("Record button not found!");
        return;
    }

    console.log("All elements found, initializing...");
    canvasCtx = canvas.getContext('2d');

    // Setup event handlers - Click to toggle recording
    recordBtn.onclick = toggleRecording;

    const audioUpload = document.getElementById('audioUpload');
    const fileNameDisplay = document.getElementById('fileNameDisplay');

    sendMessageBtn.onclick = handleSendMessage;
    endSessionBtn.onclick = handleEndSession;
    cancelRecordBtn.onclick = cancelRecording;

    if (audioUpload) {
        audioUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                audioBlob = file;
                if (fileNameDisplay) fileNameDisplay.innerText = file.name;

                const url = URL.createObjectURL(file);
                player.src = url;
                audioPlayback.style.display = 'block';
                statusMessage.innerText = "File ready. Click 'Send Argument'.";
                statusMessage.style.color = "#059669";
            }
        });
    }

    console.log("Event handlers attached!");
});

function toggleRecording() {
    if (isRecording) {
        stopRecording();
    } else {
        startRecording();
    }
}

function draw() {
    animationId = requestAnimationFrame(draw);
    analyser.getByteTimeDomainData(dataArray);

    canvasCtx.fillStyle = '#f8fafc';
    canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

    canvasCtx.lineWidth = 2;
    canvasCtx.strokeStyle = '#6366f1';
    canvasCtx.beginPath();

    const sliceWidth = canvas.width * 1.0 / analyser.frequencyBinCount;
    let x = 0;

    for (let i = 0; i < analyser.frequencyBinCount; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;
        if (i === 0) canvasCtx.moveTo(x, y);
        else canvasCtx.lineTo(x, y);
        x += sliceWidth;
    }
    canvasCtx.lineTo(canvas.width, canvas.height / 2);
    canvasCtx.stroke();
}

async function handleEndSession() {
    statusMessage.innerText = "Generating your Group Discussion Report...";
    statusMessage.style.color = "#6366f1";
    endSessionBtn.disabled = true;

    try {
        const response = await fetch('/simulations/get_final_report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scenario_id: SCENARIO_ID,
                history: discussionHistory
            })
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.report) {
            throw new Error("No report data received from server");
        }

        const div = document.createElement('div');
        div.className = "card feedback-section";
        div.style.background = "#f0fdf4";
        div.style.marginTop = "2rem";
        div.style.padding = "1.5rem";
        div.innerHTML = `<h3>Final Performance Report</h3><div style="white-space: pre-wrap;">${data.report}</div>`;
        chatWindow.appendChild(div);
        chatWindow.scrollTop = chatWindow.scrollHeight;

        statusMessage.innerText = "GD Complete! See report below.";
        statusMessage.style.color = "#059669";
    } catch (err) {
        console.error("Report error:", err);
        statusMessage.innerText = `Failed to generate report: ${err.message}. Please try again.`;
        statusMessage.style.color = "red";
        endSessionBtn.disabled = false; // Re-enable button to allow retry
    }
}

function speakMessage(text, agentName) {
    return new Promise((resolve) => {
        if (!window.speechSynthesis) {
            resolve();
            return;
        }

        window.speechSynthesis.cancel();

        setTimeout(() => {
            const utterance = new SpeechSynthesisUtterance(text);
            const voices = window.speechSynthesis.getVoices();

            const isFemale = ['Sarah', 'Elena', 'Priya'].includes(agentName);

            const preferredVoice = voices.find(v => {
                const nameMatch = isFemale ? (v.name.includes('Female') || v.name.includes('Google US English'))
                    : (v.name.includes('Male') || v.name.includes('Daniel'));
                return v.lang.startsWith('en') && nameMatch;
            }) || voices.find(v => v.lang.startsWith('en'));

            if (preferredVoice) utterance.voice = preferredVoice;

            utterance.pitch = isFemale ? 1.1 : 0.9;
            utterance.rate = 1.1;

            utterance.onend = () => resolve();
            utterance.onerror = () => resolve();

            window.speechSynthesis.speak(utterance);
        }, 100);
    });
}

async function addMessage(sender, text, type = 'agent') {
    const div = document.createElement('div');
    div.className = `message ${type}`;
    div.innerHTML = `<span class="sender-name">${sender}</span>${text}`;
    chatWindow.appendChild(div);
    chatWindow.scrollTop = chatWindow.scrollHeight;

    discussionHistory.push({ sender, text });

    if (type === 'agent') {
        await speakMessage(text, sender);
    }
}

function setParticipantStatus(agentName, statusText, isActive) {
    const el = document.getElementById(`participant-${agentName}`);
    if (!el) return;
    const statusEl = el.querySelector('.status');
    if (!statusEl) return;

    statusEl.innerText = statusText;
    if (isActive) el.classList.add('typing');
    else el.classList.remove('typing');
}

async function triggerAgent(agentName) {
    setParticipantStatus(agentName, "Thinking...", true);

    try {
        const response = await fetch('/simulations/get_agent_response', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                scenario_id: SCENARIO_ID,
                history: discussionHistory,
                agent_name: agentName
            })
        });

        const data = await response.json();
        setParticipantStatus(agentName, "Speaking...", true);
        await addMessage(data.sender, data.text, 'agent');
        setParticipantStatus(agentName, "Waiting...", false);
    } catch (err) {
        console.error("Agent error:", err);
        setParticipantStatus(agentName, "Waiting...", false);
    }
}

async function startRecording() {
    if (isRecording) return;

    console.log("Starting recording...");
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("Microphone access granted");

        audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });

        // Load AudioWorklet module
        try {
            await audioContext.audioWorklet.addModule('/static/js/audio-recorder-processor.js');
        } catch (err) {
            console.error("AudioWorklet load error:", err);
            throw new Error("Failed to load audio processor. Please refresh the page.");
        }

        // Create analyser for visualization
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        // Create worklet node
        workletNode = new AudioWorkletNode(audioContext, 'audio-recorder-processor');
        input = audioContext.createMediaStreamSource(stream);

        // Connect: input -> analyser (for visualization)
        input.connect(analyser);
        // Connect: input -> worklet (for recording)
        input.connect(workletNode);
        workletNode.connect(audioContext.destination);

        // Listen for audio data from worklet
        audioChunks = [];
        workletNode.port.onmessage = (event) => {
            if (event.data.eventType === 'audioData') {
                audioChunks.push(new Float32Array(event.data.audioData));
            }
        };

        // Start recording state
        isRecording = true;
        recordingStartTime = Date.now();

        // Start timer display
        updateRecordingTimer();
        recordingTimer = setInterval(updateRecordingTimer, 100);

        // Show visualizer and cancel button
        visualizerContainer.style.display = 'block';
        cancelRecordBtn.style.display = 'inline-block';
        draw();

        recordBtn.innerText = "Stop Recording";
        recordBtn.style.background = "#dc2626";
        statusMessage.innerText = "Recording your argument...";
        statusMessage.style.color = "";

        // Auto-stop at max duration
        setTimeout(() => {
            if (isRecording) {
                console.log("Max duration reached, auto-stopping");
                stopRecording();
            }
        }, MAX_RECORDING_DURATION * 1000);

    } catch (err) {
        console.error("Mic error:", err);
        statusMessage.innerText = "Microphone error: " + err.message;
        statusMessage.style.color = "red";
        cleanupRecording();
    }
}

function updateRecordingTimer() {
    if (!isRecording || !recordingStartTime) return;

    const elapsed = (Date.now() - recordingStartTime) / 1000;
    const remaining = Math.max(0, MAX_RECORDING_DURATION - elapsed);

    recordingTimerDisplay.innerText = `${elapsed.toFixed(1)}s / ${MAX_RECORDING_DURATION}s`;

    // Warning color when approaching max
    if (remaining < 5) {
        recordingTimerDisplay.style.color = "#ef4444";
    } else {
        recordingTimerDisplay.style.color = "#6366f1";
    }
}

function stopRecording() {
    console.log("Stopping recording...");
    if (!isRecording) {
        console.log("Not currently recording");
        return;
    }

    // Calculate duration
    const duration = (Date.now() - recordingStartTime) / 1000;
    console.log(`Recording duration: ${duration.toFixed(2)}s`);

    // Cleanup
    cleanupRecording();

    // Validate minimum duration
    if (duration < MIN_RECORDING_DURATION) {
        statusMessage.innerText = `Recording too short! Please speak for at least ${MIN_RECORDING_DURATION} second(s).`;
        statusMessage.style.color = "red";
        recordBtn.innerText = "Start Recording";
        recordBtn.style.background = "#ef4444";

        setTimeout(() => {
            if (statusMessage.style.color === "red") {
                statusMessage.innerText = "";
            }
        }, 3000);
        return;
    }

    let length = 0;
    audioChunks.forEach(c => length += c.length);
    console.log("Audio chunks collected:", audioChunks.length, "Total samples:", length);

    if (length === 0) {
        statusMessage.innerText = "No audio recorded. Please try again.";
        statusMessage.style.color = "red";
        recordBtn.innerText = "Start Recording";
        recordBtn.style.background = "#ef4444";
        return;
    }

    let flattened = new Float32Array(length);
    let offset = 0;
    audioChunks.forEach(c => { flattened.set(c, offset); offset += c.length; });

    audioBlob = encodeWAV(flattened, 16000);
    console.log("Audio blob created:", audioBlob.size, "bytes");

    // Validate file size
    if (audioBlob.size > MAX_FILE_SIZE) {
        statusMessage.innerText = "Recording too large. Please keep it under 60 seconds.";
        statusMessage.style.color = "red";
        recordBtn.innerText = "Start Recording";
        recordBtn.style.background = "#ef4444";
        return;
    }

    // Calculate expected duration
    const expectedDuration = length / 16000;
    console.log("Expected duration:", expectedDuration.toFixed(2), "seconds");

    // Create blob URL and load it
    const blobUrl = URL.createObjectURL(audioBlob);
    player.src = blobUrl;
    player.load(); // Force load

    let loaded = false;

    // Try multiple events to ensure loading
    const showPreview = () => {
        if (loaded) return;
        loaded = true;

        console.log("Audio preview ready, duration:", player.duration || expectedDuration, "seconds");
        audioPlayback.style.display = 'block';
        recordBtn.innerText = "Start Recording";
        recordBtn.style.background = "#ef4444";
        statusMessage.innerText = `Recording ready (${expectedDuration.toFixed(1)}s). Preview below, then click 'Send Argument'`;
        statusMessage.style.color = "#059669";

        // Auto-play the preview
        player.play().catch(err => console.log("Autoplay blocked:", err));
    };

    player.onloadedmetadata = showPreview;
    player.oncanplay = showPreview;

    // Fallback timeout
    setTimeout(() => {
        if (!loaded) {
            console.log("Audio loading timeout, showing anyway");
            showPreview();
        }
    }, 500);
}

function cleanupRecording() {
    isRecording = false;

    // Clear timer
    if (recordingTimer) {
        clearInterval(recordingTimer);
        recordingTimer = null;
    }

    // Reset timer display
    if (recordingTimerDisplay) {
        recordingTimerDisplay.innerText = "0.0s / 60s";
        recordingTimerDisplay.style.color = "#6366f1";
    }

    // Hide cancel button
    if (cancelRecordBtn) {
        cancelRecordBtn.style.display = 'none';
    }

    // Disconnect audio nodes
    if (workletNode) {
        workletNode.disconnect();
        workletNode = null;
    }
    if (input) {
        input.disconnect();
        input = null;
    }
    if (stream) {
        stream.getTracks().forEach(t => t.stop());
        stream = null;
    }

    // Stop visualization
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (visualizerContainer) {
        visualizerContainer.style.display = 'none';
    }

    // Close audio context
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().catch(err => console.log("AudioContext close error:", err));
        audioContext = null;
    }
}

function cancelRecording() {
    console.log("Recording cancelled by user");
    cleanupRecording();

    recordBtn.innerText = "Start Recording";
    recordBtn.style.background = "#ef4444";
    statusMessage.innerText = "Recording cancelled.";
    statusMessage.style.color = "#64748b";

    setTimeout(() => {
        statusMessage.innerText = "";
    }, 2000);
}

async function handleSendMessage(retryCount = 0) {
    const MAX_RETRIES = 3;

    statusMessage.innerText = "Transcribing your voice...";
    sendMessageBtn.disabled = true;

    const formData = new FormData();
    const filename = audioBlob.name || 'argument.wav';
    formData.append('audio', audioBlob, filename);
    formData.append('scenario_id', SCENARIO_ID);

    try {
        statusMessage.innerText = "Uploading audio...";
        const response = await fetch(`/audio/transcribe`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }

        statusMessage.innerText = "Processing speech...";
        const data = await response.json();

        if (data.transcript) {
            if (data.transcript.startsWith("[")) {
                // Error message from transcription
                statusMessage.innerText = "Error: " + data.transcript.slice(1, -1);
                statusMessage.style.color = "red";

                // Offer retry for transcription errors
                if (retryCount < MAX_RETRIES) {
                    setTimeout(() => {
                        statusMessage.innerText = `Retrying... (${retryCount + 1}/${MAX_RETRIES})`;
                        statusMessage.style.color = "#f59e0b";
                        handleSendMessage(retryCount + 1);
                    }, 1000 * (retryCount + 1)); // Exponential backoff
                } else {
                    statusMessage.innerText = "Transcription failed after multiple attempts. Please try recording again.";
                    setTimeout(() => {
                        if (statusMessage.style.color === "red") statusMessage.innerText = "";
                    }, 5000);

                    // Reset UI to allow new recording
                    audioPlayback.style.display = 'none';
                    audioBlob = null;
                    recordBtn.disabled = false;
                    recordBtn.innerText = "Start Recording";
                    recordBtn.style.background = "#ef4444";
                    sendMessageBtn.disabled = false; // Re-enable send button
                }
            } else {
                // Success!
                statusMessage.innerText = "";
                addMessage("You", data.transcript, 'user');

                for (const agent of PARTICIPANTS) {
                    await triggerAgent(agent.name);
                }

                // Clear the audio playback after successful send
                audioPlayback.style.display = 'none';

                // Reset for next recording
                audioBlob = null;
                recordBtn.disabled = false;
                recordBtn.innerText = "Start Recording";
                recordBtn.style.background = "#ef4444";
                sendMessageBtn.disabled = false; // Re-enable send button for next recording
            }
        }
    } catch (err) {
        console.error("Send error:", err);

        // Retry on network errors
        if (retryCount < MAX_RETRIES) {
            statusMessage.innerText = `Connection error. Retrying... (${retryCount + 1}/${MAX_RETRIES})`;
            statusMessage.style.color = "#f59e0b";

            setTimeout(() => {
                handleSendMessage(retryCount + 1);
            }, 1000 * (retryCount + 1)); // Exponential backoff
        } else {
            statusMessage.innerText = "Connection error after multiple attempts. Please check your internet and try again.";
            statusMessage.style.color = "red";
            sendMessageBtn.disabled = false;
        }
    } finally {
        if (retryCount === 0) {
            sendMessageBtn.disabled = false;
        }
    }
}

function encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + samples.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, samples.length * 2, true);
    let offset = 44;
    for (let i = 0; i < samples.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, samples[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([view], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
}
