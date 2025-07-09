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
  constructor() {}



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
        `${API_CONFIG.DEEPL_API_URL}/detect`,
        {
          text: [text],
        },
        {
          headers: {
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