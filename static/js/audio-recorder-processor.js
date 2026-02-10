/**
 * AudioWorklet Processor for recording audio
 * Replaces deprecated ScriptProcessorNode
 */
class AudioRecorderProcessor extends AudioWorkletProcessor {
    constructor() {
        super();
        this.bufferSize = 4096;
        this.buffer = new Float32Array(this.bufferSize);
        this.bufferIndex = 0;
    }

    process(inputs, outputs, parameters) {
        const input = inputs[0];

        if (input.length > 0) {
            const channelData = input[0];

            for (let i = 0; i < channelData.length; i++) {
                this.buffer[this.bufferIndex++] = channelData[i];

                // When buffer is full, send it to main thread
                if (this.bufferIndex >= this.bufferSize) {
                    this.port.postMessage({
                        eventType: 'audioData',
                        audioData: this.buffer.slice(0)
                    });
                    this.bufferIndex = 0;
                }
            }
        }

        // Return true to keep processor alive
        return true;
    }
}

registerProcessor('audio-recorder-processor', AudioRecorderProcessor);
