import axios from 'axios';
import { ApiError } from '../types';

import { API_CONFIG, API_KEYS } from '../config/apiConfig';

import { handleApiError } from '../utils/apiError';

// Speech-to-Text Service (Groq Whisper)
export class GroqSTTService {
  private apiKey: string;

  constructor() {
    this.apiKey = API_KEYS.GROQ_API_KEY as string;
  }

  async transcribe(audioBlob: Blob, language?: string, responseFormat: string = 'json', url?: string, prompt?: string, temperature?: number, timestampGranularities?: string[]): Promise<any> {
    try {
      const formData = new FormData();
      if (url) {
        formData.append('url', url);
      } else {
        formData.append('file', audioBlob, 'audio.webm');
      }
      formData.append('model', 'whisper-large-v3-turbo');
      if (language) formData.append('language', language);
      formData.append('response_format', responseFormat);
      if (prompt) formData.append('prompt', prompt);
      if (typeof temperature === 'number') formData.append('temperature', temperature.toString());
      if (timestampGranularities && responseFormat === 'verbose_json') {
        timestampGranularities.forEach(g => formData.append('timestamp_granularities[]', g));
      }
      const response = await axios.post(
        `${API_CONFIG.GROQ_API_URL}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
