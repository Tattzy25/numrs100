import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppSettings, Voice, Language, TranslationResult } from '../types';

interface AppState {
  // Settings
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Languages
  fromLanguage: string;
  toLanguage: string;
  setFromLanguage: (lang: string) => void;
  setToLanguage: (lang: string) => void;
  
  // Voices
  selectedVoice: Voice | null;
  savedVoices: Voice[];
  setSelectedVoice: (voice: Voice | null) => void;
  addSavedVoice: (voice: Voice) => void;
  removeSavedVoice: (voiceId: string) => void;
  setDefaultVoice: (voiceId: string) => void;
  
  // Translation History
  translationHistory: TranslationResult[];
  addTranslation: (translation: TranslationResult) => void;
  clearHistory: () => void;
  
  // Connection Status
  isConnected: boolean;
  setConnectionStatus: (status: boolean) => void;
  
  // Error Handling
  lastError: string | null;
  setError: (error: string | null) => void;
}

const defaultSettings: AppSettings = {
  audio: {
    inputGain: 75,
    outputVolume: 80,
    noiseReduction: true,
    echoCancellation: true,
  },
  translation: {
    autoDetect: true,
    instantTranslation: false,
    saveTranscripts: true,
  },
  privacy: {
    storeVoiceData: false,
    shareAnalytics: true,
    cloudSync: true,
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Settings
      settings: defaultSettings,
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
      
      // Languages
      fromLanguage: 'en',
      toLanguage: 'es',
      setFromLanguage: (lang) => set({ fromLanguage: lang }),
      setToLanguage: (lang) => set({ toLanguage: lang }),
      
      // Voices
      selectedVoice: null,
      savedVoices: [],
      setSelectedVoice: (voice) => set({ selectedVoice: voice }),
      addSavedVoice: (voice) =>
        set((state) => ({
          savedVoices: [...state.savedVoices, voice],
        })),
      removeSavedVoice: (voiceId) =>
        set((state) => ({
          savedVoices: state.savedVoices.filter((v) => v.id !== voiceId),
        })),
      setDefaultVoice: (voiceId) =>
        set((state) => ({
          savedVoices: state.savedVoices.map((v) => ({
            ...v,
            isDefault: v.id === voiceId,
          })),
        })),
      
      // Translation History
      translationHistory: [],
      addTranslation: (translation) =>
        set((state) => ({
          translationHistory: [translation, ...state.translationHistory].slice(0, 100), // Keep last 100
        })),
      clearHistory: () => set({ translationHistory: [] }),
      
      // Connection Status
      isConnected: false,
      setConnectionStatus: (status) => set({ isConnected: status }),
      
      // Error Handling
      lastError: null,
      setError: (error) => set({ lastError: error }),
    }),
    {
      name: 'bridgit-ai-storage',
      partialize: (state) => ({
        settings: state.settings,
        fromLanguage: state.fromLanguage,
        toLanguage: state.toLanguage,
        savedVoices: state.savedVoices,
        translationHistory: state.translationHistory,
      }),
    }
  )
);