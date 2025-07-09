import axios from 'axios';
import { ApiError } from '../types';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

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

export class ElevenLabsTTSService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async synthesize(text: string, voiceId: string): Promise<Blob> {
    try {
      const response = await axios.post(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
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
        `${ELEVENLABS_API_URL}/voices`,
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
        `${ELEVENLABS_API_URL}/voices/add`,
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

  /**
   * Stream TTS audio using ElevenLabs WebSocket API.
   * @param voiceId The ElevenLabs voice ID
   * @param onAudioChunk Callback for each audio chunk (ArrayBuffer)
   * @param options Optional: { modelId, languageCode, voiceSettings, ... }
   * @returns Promise that resolves when the stream ends
   */
  async streamSynthesize(
    voiceId: string,
    onAudioChunk: (chunk: ArrayBuffer) => void,
    options: {
      textChunks?: string[];
      modelId?: string;
      languageCode?: string;
      enableLogging?: boolean;
      enableSsmlParsing?: boolean;
      outputFormat?: string;
      inactivityTimeout?: number;
      syncAlignment?: boolean;
      autoMode?: boolean;
      applyTextNormalization?: 'auto' | 'on' | 'off';
      seed?: number;
      voiceSettings?: {
        stability?: number;
        similarity_boost?: number;
        style?: number;
        use_speaker_boost?: boolean;
        speed?: number;
      };
      generationConfig?: {
        chunk_length_schedule?: number[];
      };
    } = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `wss://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream-input`;
      const ws = new WebSocket(wsUrl);
      let isOpen = false;
      let chunkIndex = 0;
      ws.onopen = () => {
        isOpen = true;
        // Send initial blank space as required
        ws.send(
          JSON.stringify({
            text: ' ',
            voice_settings: options.voiceSettings || {
              stability: 0.5,
              similarity_boost: 0.75,
              style: 0,
              use_speaker_boost: true,
              speed: 1,
            },
            ...options.generationConfig && { generation_config: options.generationConfig },
          })
        );
        // Send text chunks if provided
        if (options.textChunks && options.textChunks.length > 0) {
          for (const chunk of options.textChunks) {
            ws.send(JSON.stringify({ text: chunk }));
          }
        }
      };
      ws.onmessage = (event) => {
        if (typeof event.data === 'string') {
          // Handle control messages if needed
        } else if (event.data instanceof ArrayBuffer) {
          onAudioChunk(event.data);
        } else if (event.data instanceof Blob) {
          event.data.arrayBuffer().then(onAudioChunk);
        }
      };
      ws.onerror = (err) => {
        ws.close();
        reject(new Error('WebSocket error: ' + (err instanceof ErrorEvent ? err.message : 'Unknown')));
      };
      ws.onclose = () => {
        resolve();
      };
    });
  }

  /**
   * Isolate vocals/speech from audio using ElevenLabs Audio Isolation API.
   * @param audioBlob The audio file (Blob)
   * @param fileFormat Optional: 'pcm_s16le_16' | 'other'
   * @returns Promise with isolation result (JSON)
   */
  async isolateAudio(audioBlob: Blob, fileFormat: 'pcm_s16le_16' | 'other' = 'other'): Promise<any> {
    const url = 'https://api.elevenlabs.io/v1/audio-isolation';
    const form = new FormData();
    form.append('audio', audioBlob, 'audio.webm');
    form.append('file_format', fileFormat);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey
        },
        body: form
      });
      if (!response.ok) {
        throw new Error(`Audio isolation failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Advanced TTS synthesis with full parameter support (REST API).
   * @param text The text to synthesize
   * @param voiceId The ElevenLabs voice ID
   * @param options Advanced options (outputFormat, modelId, languageCode, voiceSettings, etc)
   * @returns Promise<Blob> with audio
   */
  async synthesizeAdvanced(
    text: string,
    voiceId: string,
    options: {
      outputFormat?: string;
      modelId?: string;
      languageCode?: string;
      voiceSettings?: any;
      pronunciationDictionaryLocators?: { id: string; version_id?: string }[];
      seed?: number;
      previousText?: string;
      nextText?: string;
      previousRequestIds?: string[];
      nextRequestIds?: string[];
      applyTextNormalization?: 'auto' | 'on' | 'off';
      applyLanguageTextNormalization?: boolean;
      usePvcAsIvc?: boolean;
      enableLogging?: boolean;
    } = {}
  ): Promise<Blob> {
    try {
      const payload: any = {
        text,
        model_id: options.modelId || 'eleven_multilingual_v2',
        ...options.languageCode && { language_code: options.languageCode },
        ...options.voiceSettings && { voice_settings: options.voiceSettings },
        ...options.pronunciationDictionaryLocators && { pronunciation_dictionary_locators: options.pronunciationDictionaryLocators },
        ...options.seed !== undefined && { seed: options.seed },
        ...options.previousText && { previous_text: options.previousText },
        ...options.nextText && { next_text: options.nextText },
        ...options.previousRequestIds && { previous_request_ids: options.previousRequestIds },
        ...options.nextRequestIds && { next_request_ids: options.nextRequestIds },
        ...options.applyTextNormalization && { apply_text_normalization: options.applyTextNormalization },
        ...options.applyLanguageTextNormalization !== undefined && { apply_language_text_normalization: options.applyLanguageTextNormalization },
        ...options.usePvcAsIvc !== undefined && { use_pvc_as_ivc: options.usePvcAsIvc },
        ...options.enableLogging !== undefined && { enable_logging: options.enableLogging },
      };
      const response = await axios.post(
        `${ELEVENLABS_API_URL}/text-to-speech/${voiceId}`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
          params: {
            ...(options.outputFormat && { output_format: options.outputFormat })
          }
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * List all voices (GET /v2/voices)
   * @returns Promise<any[]>
   */
  async listVoices(): Promise<any[]> {
    try {
      const response = await axios.get(
        'https://api.elevenlabs.io/v2/voices',
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

  /**
   * Delete a voice by ID (DELETE /v1/voices/:voice_id)
   * @param voiceId
   * @returns Promise<{status: string}>
   */
  async deleteVoice(voiceId: string): Promise<{status: string}> {
    try {
      const response = await axios.delete(
        `${ELEVENLABS_API_URL}/voices/${voiceId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
}