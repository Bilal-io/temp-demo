export class AudioConcatManager {
  private context: AudioContext;
  private gainNode: GainNode;
  worklet: AudioWorkletNode;

  constructor(context: AudioContext, gainNode: GainNode, worklet: AudioWorkletNode) {
    this.context = context;
    this.gainNode = gainNode;
    this.worklet = worklet;
  }

  static async create(sampleRate = 16000) {
    let audioContext = null;
    try {
      audioContext = new AudioContext({ sampleRate: sampleRate });
      const gainNode = audioContext.createGain();
      gainNode.connect(audioContext.destination);
      await audioContext.audioWorklet.addModule('/audio-worklet.module.js');
      const audioConcatNode = new AudioWorkletNode(audioContext, 'audio-concat-processor');
      audioConcatNode.connect(gainNode);
      return new AudioConcatManager(audioContext, gainNode, audioConcatNode);
    } catch (error) {
      if (audioContext) {
        audioContext.close();
      }
      throw error;
    }
  }

  async close() {
    await this.context.close();
  }

  playAudioChunk(uint8Array: Uint8Array) {
    this.worklet.port.postMessage({
      type: 'buffer',
      buffer: uint8Array.buffer,
    });
  }
}
