import axios from 'axios';
import { ApiError } from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1';

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

export class GroqSTTService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
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
        `${GROQ_API_URL}/audio/transcriptions`,
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