class AudioConcatProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffers = [];
    this.cursor = 0;
    this.currentBuffer = null;
    this.wasInterrupted = false;
    this.finished = false;

    this.port.onmessage = ({ data }) => {
      switch (data.type) {
        case "buffer":
          this.buffers.push(new Int16Array(data.buffer));
          break;
        case "clearInterrupted":
          if (this.wasInterrupted) {
            this.buffers = [];
            this.currentBuffer = null;
          }
          this.wasInterrupted = false;
          break;
      }
    };
  }

  process(_, outputs) {
    const output = outputs[0][0];
    for (let i = 0; i < output.length; i++) {
      if (!this.currentBuffer) {
        if (this.buffers.length === 0) {
          this.finished = true;
          break;
        }
        this.currentBuffer = this.buffers.shift();
        this.cursor = 0;
      }
      output[i] = this.currentBuffer[this.cursor] / 32768;
      this.cursor++;
      if (this.cursor >= this.currentBuffer.length) {
        this.currentBuffer = null;
      }
    }
    return true;
  }
}

registerProcessor("audio-concat-processor", AudioConcatProcessor);