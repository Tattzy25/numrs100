// src/services/tts/elevenLabsService.ts

import axios from 'axios';

const ELEVEN_LABS_API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
const ELEVEN_LABS_BASE_URL = 'https://api.elevenlabs.io/v1';

interface ElevenLabsTTSRequest {
  text: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
  };
}

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
}

export const elevenLabsService = {
  /**
   * Fetches a list of available voices from ElevenLabs.
   * @returns A promise that resolves to an array of ElevenLabsVoice objects.
   */
  getVoices: async (): Promise<ElevenLabsVoice[]> => {
    try {
      const response = await axios.get(`${ELEVEN_LABS_BASE_URL}/voices`,
        {
          headers: {
            'xi-api-key': ELEVEN_LABS_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.voices;
    } catch (error) {
      console.error('Error fetching ElevenLabs voices:', error);
      throw error;
    }
  },

  /**
   * Converts text to speech using the ElevenLabs API.
   * @param voiceId The ID of the voice to use for synthesis.
   * @param request The request body containing the text and optional settings.
   * @returns A promise that resolves to an ArrayBuffer containing the audio data.
   */
  textToSpeech: async (
    voiceId: string,
    request: ElevenLabsTTSRequest
  ): Promise<ArrayBuffer> => {
    try {
      const response = await axios.post(
        `${ELEVEN_LABS_BASE_URL}/text-to-speech/${voiceId}`,
        request,
        {
          headers: {
            'xi-api-key': ELEVEN_LABS_API_KEY,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          responseType: 'arraybuffer',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error converting text to speech with ElevenLabs:', error);
      throw error;
    }
  },
};