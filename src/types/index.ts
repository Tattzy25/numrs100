export interface Language {
  code: string;
  name: string;
  flag: string;
  native: string;
}

export interface Voice {
  id: string;
  name: string;
  category: string;
  gender: 'male' | 'female';
  age: 'young' | 'adult' | 'mature';
  tier: 'basic' | 'premium';
  preview?: string;
  isDefault?: boolean;
  type?: 'cloned' | 'library';
  status?: 'Ready' | 'Processing' | 'Failed';
  date?: string;
}

export interface TranslationSession {
  id: string;
  roomCode: string;
  participants: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface AudioChunk {
  id: string;
  blob: Blob;
  timestamp: number;
  duration: number;
}

export interface TranslationResult {
  original: string;
  translated: string;
  fromLanguage: string;
  toLanguage: string;
  confidence: number;
  timestamp: Date;
}

export interface AppSettings {
  audio: {
    inputGain: number;
    outputVolume: number;
    noiseReduction: boolean;
    echoCancellation: boolean;
  };
  translation: {
    autoDetect: boolean;
    instantTranslation: boolean;
    saveTranscripts: boolean;
  };
  privacy: {
    storeVoiceData: boolean;
    shareAnalytics: boolean;
    cloudSync: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}