import axios from 'axios';
import { ApiError } from '../types';

import { API_CONFIG, API_KEYS } from '../config/apiConfig';

// Error handling utility
const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      code: error.response.status.toString(),
      message: error.response.data?.message || 'API request failed',
      details: error.response.data,
    };
  } else if (error.request) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      details: error.request,
    };
  } else {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error,
    };
  }
};

// Text-to-Speech Service (ElevenLabs)
export class ElevenLabsTTSService {
  private apiKey: string;

  constructor() {
    this.apiKey = API_KEYS.ELEVENLABS_API_KEY as string;
  }

  async synthesize(text: string, voiceId: string): Promise<Blob> {
    try {
      const response = await axios.post(
        `${API_CONFIG.ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        {
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async getVoices(): Promise<any[]> {
    try {
      const response = await axios.get(
        `${API_CONFIG.ELEVENLABS_API_URL}/voices`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      return response.data.voices;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async cloneVoice(name: string, audioFiles: File[]): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('name', name);

      audioFiles.forEach((file, index) => {
        formData.append('files', file, `sample_${index}.wav`);
      });

      const response = await axios.post(
        `${API_CONFIG.ELEVENLABS_API_URL}/voices/add`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data.voice_id;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
