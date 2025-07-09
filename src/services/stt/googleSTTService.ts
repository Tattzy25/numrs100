// src/services/stt/googleSTTService.ts

import axios from 'axios';

const GOOGLE_STT_API_KEY = import.meta.env.VITE_GOOGLE_STT_API_KEY;
const GOOGLE_STT_BASE_URL = 'https://speech.googleapis.com/v1p1beta1/speech:recognize';

interface RecognitionConfig {
  encoding: 'LINEAR16' | 'FLAC' | 'MULAW' | 'AMR' | 'AMR_WB' | 'OGG_OPUS' | 'SPEEX_WITH_HEADER_BYTE';
  sampleRateHertz: number;
  languageCode: string;
  enableAutomaticPunctuation?: boolean;
  model?: string;
}

interface RecognitionAudio {
  content?: string; // Base64-encoded audio data
  uri?: string;
}

interface RecognizeRequest {
  config: RecognitionConfig;
  audio: RecognitionAudio;
}

interface SpeechRecognitionResult {
  alternatives: Array<{ transcript: string; confidence: number }>;
}

interface RecognizeResponse {
  results: SpeechRecognitionResult[];
}

export const googleSTTService = {
  /**
   * Sends audio data to Google Speech-to-Text API for transcription.
   * @param audioContent Base64-encoded audio data.
   * @param sampleRateHertz Sample rate of the audio in Hertz.
   * @param languageCode Language code for the transcription (e.g., 'en-US').
   * @returns A promise that resolves to the transcription results.
   */
  recognize: async (
    audioContent: string,
    sampleRateHertz: number,
    languageCode: string
  ): Promise<RecognizeResponse> => {
    try {
      const requestBody: RecognizeRequest = {
        config: {
          encoding: 'LINEAR16', // Assuming LINEAR16 for simplicity, adjust as needed
          sampleRateHertz,
          languageCode,
          model: 'default', // Can be 'default', 'command_and_search', 'phone_call', 'video', etc.
        },
        audio: {
          content: audioContent,
        },
      };

      const response = await axios.post<RecognizeResponse>(
        `${GOOGLE_STT_BASE_URL}?key=${GOOGLE_STT_API_KEY}`,
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error with Google Speech-to-Text API:', error);
      throw error;
    }
  },
};