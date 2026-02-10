// Basic WAV encoder for MediaRecorder raw data
// Credit: Minimal implementation of WAV header construction
function encodeWAV(samples, sampleRate) {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view = new DataView(buffer);

    /* RIFF identifier */
    writeString(view, 0, 'RIFF');
    /* RIFF chunk length */
    view.setUint32(4, 36 + samples.length * 2, true);
    /* RIFF type */
    writeString(view, 8, 'WAVE');
    /* format chunk identifier */
    writeString(view, 12, 'fmt ');
    /* format chunk length */
    view.setUint32(16, 16, true);
    /* sample format (raw) */
    view.setUint16(20, 1, true);
    /* channel count */
    view.setUint16(22, 1, true);
    /* sample rate */
    view.setUint32(24, sampleRate, true);
    /* byte rate (sample rate * block align) */
    view.setUint32(28, sampleRate * 2, true);
    /* block align (channel count * bytes per sample) */
    view.setUint16(32, 2, true);
    /* bits per sample */
    view.setUint16(34, 16, true);
    /* data chunk identifier */
    writeString(view, 36, 'data');
    /* data chunk length */
    view.setUint32(40, samples.length * 2, true);

    floatTo16BitPCM(view, 44, samples);

    return new Blob([view], { type: 'audio/wav' });
}

function floatTo16BitPCM(output, offset, input) {
    for (let i = 0; i < input.length; i++, offset += 2) {
        let s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
}

function writeString(view, offset, string) {
    for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
    }
}

let audioChunks = [];
let audioContext;
let processor;
let input;
let stream;

const recordBtn = document.getElementById('recordBtn');
const stopBtn = document.getElementById('stopBtn');
const submitBtn = document.getElementById('submitBtn');
const player = document.getElementById('player');
const audioUpload = document.getElementById('audioUpload');
const audioPlayback = document.getElementById('audioPlayback');

if (audioUpload) {
    audioUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            audioBlob = file;
            const url = URL.createObjectURL(file);
            player.src = url;
            audioPlayback.style.display = 'block';
            statusMessage.innerText = `File selected: ${file.name}`;
            statusMessage.style.color = '#059669';
        }
    });
}
const statusMessage = document.getElementById('statusMessage');
const feedbackSection = document.getElementById('feedbackSection');
const feedbackContent = document.getElementById('feedbackContent');
const visualizerContainer = document.getElementById('visualizerContainer');
const canvas = document.getElementById('visualizer');
const canvasCtx = canvas.getContext('2d');

let analyser;
let dataArray;
let animationId;
let audioBlob;

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

recordBtn.onclick = async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)({
            sampleRate: 16000
        });

        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        dataArray = new Uint8Array(analyser.frequencyBinCount);

        input = audioContext.createMediaStreamSource(stream);
        input.connect(analyser);

        processor = audioContext.createScriptProcessor(4096, 1, 1);
        input.connect(processor);
        processor.connect(audioContext.destination);

        audioChunks = [];
        processor.onaudioprocess = (e) => {
            const chunk = new Float32Array(e.inputBuffer.getChannelData(0));
            audioChunks.push(chunk);
        };

        visualizerContainer.style.display = 'block';
        draw();

        recordBtn.disabled = true;
        stopBtn.disabled = false;
        statusMessage.innerText = "Recording...";
        audioPlayback.style.display = 'none';
        feedbackSection.style.display = 'none';

    } catch (err) {
        console.error("Error accessing microphone:", err);
        statusMessage.innerText = "Error: Use HTTPS or check mic permissions.";
    }
};

stopBtn.onclick = () => {
    processor.disconnect();
    input.disconnect();
    stream.getTracks().forEach(track => track.stop());

    cancelAnimationFrame(animationId);
    visualizerContainer.style.display = 'none';

    // Flatten chunks
    let length = 0;
    audioChunks.forEach(chunk => length += chunk.length);
    let flattened = new Float32Array(length);
    let offset = 0;
    audioChunks.forEach(chunk => {
        flattened.set(chunk, offset);
        offset += chunk.length;
    });

    audioBlob = encodeWAV(flattened, audioContext.sampleRate);
    const audioUrl = URL.createObjectURL(audioBlob);
    player.src = audioUrl;

    console.log("WAV Created - Sample Rate:", audioContext.sampleRate, "Size:", audioBlob.size);

    audioPlayback.style.display = 'block';
    recordBtn.disabled = false;
    stopBtn.disabled = true;
    statusMessage.innerText = "Recording stopped. Preview below.";

    audioContext.close();
};

submitBtn.onclick = async () => {
    if (!audioBlob) return;

    statusMessage.innerText = "Uploading and analyzing with AI... Please wait.";
    submitBtn.disabled = true;

    const formData = new FormData();
    const filename = audioBlob.name || 'recording.wav';
    formData.append('audio', audioBlob, filename);
    formData.append('context', document.querySelector('.instructions-box p').innerText);

    try {
        const response = await fetch(`/challenges/submit/${CHALLENGE_ID}`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
            statusMessage.innerText = "Analysis Complete!";
            feedbackSection.style.display = 'block';
            feedbackContent.innerHTML = data.feedback.replace(/\n/g, '<br>');
            feedbackSection.scrollIntoView({ behavior: 'smooth' });
        } else {
            statusMessage.innerText = "Error: " + (data.error || "Unknown error");
        }
    } catch (err) {
        console.error("Submission error:", err);
        statusMessage.innerText = "Error: " + (err.message || "Could not connect to server. Please check if the server is running.");
    } finally {
        submitBtn.disabled = false;
    }
};
