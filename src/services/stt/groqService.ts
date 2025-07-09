// src/services/stt/groqService.ts

import axios from 'axios';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';

export const groqService = {
  /**
   * Transcribes audio using the Groq Whisper API.
   * @param audioBlob The audio data as a Blob.
   * @param language The language of the audio (e.g., 'en').
   * @returns A promise that resolves to the transcribed text.
   */
  transcribeAudio: async (audioBlob: Blob, language: string): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm'); // Assuming webm format from MediaRecorder
      formData.append('model', 'whisper-large-v3'); // Or other suitable Whisper model
      formData.append('language', language);

      const response = await axios.post(
        `${GROQ_BASE_URL}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data.text;
    } catch (error) {
      console.error('Error transcribing audio with Groq Whisper API:', error);
      throw error;
    }
  },
};