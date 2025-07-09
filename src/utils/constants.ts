import { Language } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'EN', flag: '🇺🇸', native: 'English' },
  { code: 'es', name: 'ES', flag: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'FR', flag: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'DE', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'it', name: 'IT', flag: '🇮🇹', native: 'Italiano' },
  { code: 'pt', name: 'PT', flag: '🇵🇹', native: 'Português' },
  { code: 'ru', name: 'RU', flag: '🇷🇺', native: 'Русский' },
  { code: 'ja', name: 'JP', flag: '🇯🇵', native: '日本語' },
  { code: 'ko', name: 'KR', flag: '🇰🇷', native: '한국어' },
  { code: 'zh', name: 'CN', flag: '🇨🇳', native: '中文' },
  { code: 'ar', name: 'AR', flag: '🇸🇦', native: 'العربية' },
  { code: 'hi', name: 'IN', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'nl', name: 'NL', flag: '🇳🇱', native: 'Nederlands' },
  { code: 'sv', name: 'SE', flag: '🇸🇪', native: 'Svenska' },
  { code: 'da', name: 'DK', flag: '🇩🇰', native: 'Dansk' },
  { code: 'no', name: 'NO', flag: '🇳🇴', native: 'Norsk' },
  { code: 'fi', name: 'FI', flag: '🇫🇮', native: 'Suomi' },
  { code: 'pl', name: 'PL', flag: '🇵🇱', native: 'Polski' },
  { code: 'tr', name: 'TR', flag: '🇹🇷', native: 'Türkçe' },
  { code: 'th', name: 'TH', flag: '🇹🇭', native: 'ไทย' },
  { code: 'vi', name: 'VN', flag: '🇻🇳', native: 'Tiếng Việt' },
  { code: 'id', name: 'ID', flag: '🇮🇩', native: 'Bahasa Indonesia' },
  { code: 'ms', name: 'MY', flag: '🇲🇾', native: 'Bahasa Melayu' },
  { code: 'tl', name: 'PH', flag: '🇵🇭', native: 'Filipino' },
];

export const API_ENDPOINTS = {
  GROQ: 'https://api.groq.com/openai/v1',
  DEEPL_API_URL: '/api/proxy/deepl',
  ELEVENLABS: 'https://api.elevenlabs.io/v1',
  ABLY: 'https://rest.ably.io',
} as const;

export const AUDIO_CONSTRAINTS = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
  sampleRate: 44100,
  channelCount: 1,
} as const;

export const RECORDING_LIMITS = {
  MIN_DURATION: 1, // seconds
  MAX_DURATION: 300, // 5 minutes
  VOICE_CLONE_MIN_DURATION: 60// seconds for voice cloning
} as const;

export const ERROR_MESSAGES = {
  MICROPHONE_ACCESS_DENIED: 'Microphone access denied. Please allow microphone access to use voice features.',
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  API_KEY_MISSING: 'API key not configured. Please check your settings.',
  RECORDING_TOO_SHORT: 'Recording too short. Please speak for at least 1 second.',
  RECORDING_TOO_LONG: 'Recording too long. Maximum duration is 5 minutes.',
  UNSUPPORTED_BROWSER: 'Your browser does not support the required audio features.',
  TRANSLATION_FAILED: 'Translation failed. Please try again.',
  VOICE_SYNTHESIS_FAILED: 'Voice synthesis failed. Please try again.',
} as const;

export const STORAGE_KEYS = {
  API_KEYS: 'bridgit-ai-api-keys',
  USER_PREFERENCES: 'bridgit-ai-preferences',
  TRANSLATION_HISTORY: 'bridgit-ai-history',
  SAVED_VOICES: 'bridgit-ai-voices',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

export const VOICE_CATEGORIES = [
  'Business',
  'Casual',
  'Education',
  'Storytelling',
  'Customer Service',
  'Entertainment',
  'News',
  'Meditation',
] as const;

export const VOICE_AGES = [
  'young',
  'adult',
  'mature',
] as const;

export const VOICE_GENDERS = [
  'male',
  'female',
] as const;