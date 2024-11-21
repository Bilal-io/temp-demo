"use client";
import { AudioConcatManager } from "@/utils/audio-worklet.helper";

export default function Home() {
  const handleTextToSpeech = async () => {
    try {
      const response = await fetch(
        "api/tts",
        { method: "GET" }
      );

      // Stream response chunks
      const reader = response.body?.getReader();

      if (!reader) {
        throw new Error("No response body");
      }

      const audioManager = await AudioConcatManager.create();

      let leftoverByte: number | null = null;
      async function readAndPlay() {
        const { done, value } = await reader!.read();
        if (done) {
          return;
        }

        let audioBuffer: Uint8Array;
        if (leftoverByte !== null) {
          // If we have a leftover byte, prepend it to this chunk
          const combinedBuffer = new Uint8Array(value.length + 1);
          combinedBuffer[0] = leftoverByte;
          combinedBuffer.set(value, 1);
          audioBuffer = combinedBuffer;
          leftoverByte = null;
        } else {
          audioBuffer = value;
        }

        // Check if we now have an odd length
        if (audioBuffer.length % 2 !== 0) {
          // Store the last byte for next time
          leftoverByte = audioBuffer[audioBuffer.length - 1];
          // Use all bytes except the last one
          audioBuffer = audioBuffer.slice(0, audioBuffer.length - 1);
        }

        // Play the audio chunk using the audio manager
        audioManager.playAudioChunk(audioBuffer);

        // Continue reading more audio chunks
        setTimeout(() => readAndPlay(), 0);
      }

      readAndPlay();
    } catch (error) {
      console.error("TTS Request Error:", error);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 h-screen">
      <div className="h-full px-4 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12">
        <button
          onClick={() => handleTextToSpeech()}
          type="button"
          className="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
        >
          Start Streaming
        </button>
      </div>
    </section>
  );
}
