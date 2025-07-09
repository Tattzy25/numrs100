import axios from 'axios';
import { ApiError } from '../types';

const DEEPL_API_URL = 'https://api-free.deepl.com/v2';

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

export class DeepLTranslationService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async translate(text: string, targetLang: string, sourceLang?: string, glossaryId?: string): Promise<string> {
    try {
      const requestBody: any = {
        text: [text],
        target_lang: targetLang.toUpperCase(),
        source_lang: sourceLang?.toUpperCase(),
        formality: 'less',
      };
      if (glossaryId) {
        requestBody.glossary_id = glossaryId;
      }
      const response = await axios.post(
        `${DEEPL_API_URL}/translate`,
        requestBody,
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
        `${DEEPL_API_URL}/translate`,
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

  async getSupportedLanguages(type: 'source' | 'target' = 'target'): Promise<Array<{ code: string; name: string }>> {
    try {
      const response = await axios.get(
        `${DEEPL_API_URL}/languages?type=${type}`,
        {
          headers: {
            'Authorization': `DeepL-Auth-Key ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.map((lang: any) => ({ code: lang.language.toLowerCase(), name: lang.name }));
    } catch (error) {
      throw handleApiError(error);
    }
  }
}