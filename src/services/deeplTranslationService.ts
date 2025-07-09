import axios from 'axios';
import { ApiError, TranslationResult } from '../types';

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

// Translation Service (DeepL)
export class DeepLTranslationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getSupportedLanguages(type: 'source' | 'target'): Promise<Array<{ code: string; name: string }>> {
    try {
      const response = await axios.get(
        `${API_CONFIG.DEEPL_API_URL}/languages`,
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
          },
          params: {
            type: type,
          },
        }
      );
      return response.data.map((lang: any) => ({
        code: lang.language.toLowerCase(),
        name: lang.name,
      }));
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async translate(text: string, targetLang: string, sourceLang?: string): Promise<string> {
    try {
      const response = await axios.post(
        `${API_CONFIG.DEEPL_API_URL}/translate`,
        {
          text: [text],
          target_lang: targetLang.toUpperCase(),
          source_lang: sourceLang?.toUpperCase(),
        },
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.translations[0].text;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const response = await axios.post(
        `${API_CONFIG.DEEPL_API_URL}/translate`,
        {
          text: [text],
          target_lang: 'EN',
        },
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.translations[0].detected_source_language.toLowerCase();
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
