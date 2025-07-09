import axios from 'axios';
import { ApiError, TranslationResult } from '../types';

// API Configuration
const API_CONFIG = {
  GROQ_API_URL: 'https://api.groq.com/openai/v1',
  DEEPL_API_URL: 'https://api-free.deepl.com/v2',
  ELEVENLABS_API_URL: 'https://api.elevenlabs.io/v1',
  ABLY_API_URL: 'https://rest.ably.io',
};

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

// Speech-to-Text Service (Groq Whisper)
// Real-time Communication Service (Ably)
export class RealtimeService {
  private apiKey: string;
  private client: any;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Ably client
      const { Realtime } = await import('ably');
      this.client = new Realtime({ key: this.apiKey });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async createRoom(): Promise<string> {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return roomCode;
  }

  async joinRoom(roomCode: string, onMessage: (data: any) => void): Promise<void> {
    try {
      const channel = this.client.channels.get(`translation-${roomCode}`);
      await channel.subscribe('translation', onMessage);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async sendMessage(roomCode: string, data: any): Promise<void> {
    try {
      const channel = this.client.channels.get(`translation-${roomCode}`);
      await channel.publish('translation', data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async leaveRoom(roomCode: string): Promise<void> {
    try {
      const channel = this.client.channels.get(`translation-${roomCode}`);
      await channel.unsubscribe();
    } catch (error) {
      throw handleApiError(error);
    }
  }
}

// Audio Processing Utilities
export class AudioProcessor {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(onDataAvailable?: (chunk: Blob) => void): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm;codecs=opus',
      });

      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          onDataAvailable?.(event.data);
        }
      };

      this.mediaRecorder.start(1000); // Collect data every second
    } catch (error) {
      throw new Error(`Failed to start recording: ${error.message}`);
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No active recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  async convertToWav(audioBlob: Blob): Promise<Blob> {
    // Convert WebM to WAV for better API compatibility
    const audioContext = new AudioContext();
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    // Create WAV file
    const wavBuffer = this.audioBufferToWav(audioBuffer);
    return new Blob([wavBuffer], { type: 'audio/wav' });
  }

  private audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
    const length = buffer.length;
    const numberOfChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const arrayBuffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
    const view = new DataView(arrayBuffer);

    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * numberOfChannels * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numberOfChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numberOfChannels * 2, true);
    view.setUint16(32, numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * numberOfChannels * 2, true);

    // Convert audio data
    let offset = 44;
    for (let i = 0; i < length; i++) {
      for (let channel = 0; channel < numberOfChannels; channel++) {
        const sample = Math.max(-1, Math.min(1, buffer.getChannelData(channel)[i]));
        view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
        offset += 2;
      }
    }

    return arrayBuffer;
  }
}

// Audio Level Analyzer
export class AudioLevelAnalyzer {
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;

  initialize(stream: MediaStream): void {
    const audioContext = new AudioContext();
    this.analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);
    
    this.analyser.fftSize = 256;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
  }

  startAnalyzing(onLevelUpdate: (level: number) => void): void {
    if (!this.analyser || !this.dataArray) return;

    const analyze = () => {
      if (!this.analyser || !this.dataArray) return;
      
      this.analyser.getByteFrequencyData(this.dataArray);
      const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
      onLevelUpdate(average);
      
      this.animationFrame = requestAnimationFrame(analyze);
    };

    analyze();
  }

  stopAnalyzing(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}