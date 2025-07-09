class AudioProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    if (input.length > 0) {
      // Pass through the audio data
      for (let i = 0; i < input.length; i++) {
        output[i].set(input[i]);
      }
      this.port.postMessage(input[0]);
    }
    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);