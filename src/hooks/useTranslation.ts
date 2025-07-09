import { useState, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';
import { GroqSTTService } from '../services/groqSTTService';
import { DeepLTranslationService } from '../services/deeplTranslationService';
import { ElevenLabsTTSService } from '../services/elevenLabsTTSService';
import { TranslationResult } from '../types';

interface UseTranslationOptions {
  groqApiKey?: string;
  deeplApiKey?: string;
  elevenlabsApiKey?: string;
}

export const useTranslation = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [progress, setProgress] = useState(0);
  
  const {
    fromLanguage,
    toLanguage,
    selectedVoice,
    savedVoices,
    settings,
    addTranslation,
    setError,
  } = useAppStore();

  // Get API keys from env
  const deeplApiKey = import.meta.env.VITE_DEEPL_API_KEY;
  const elevenlabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
  const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;

  const sttService = groqApiKey ? new GroqSTTService(groqApiKey) : null;
  const translationService = deeplApiKey ? new DeepLTranslationService(deeplApiKey) : null;
  const ttsService = elevenlabsApiKey ? new ElevenLabsTTSService(elevenlabsApiKey) : null;

  // Helper to get fallback/default voice
  const getVoiceId = () => {
    if (selectedVoice) return selectedVoice.id;
    // Fallback order: AVI, HOPE, ADAM, ANTONI, JESSICA, SARAH
    const fallbackOrder = [
      import.meta.env.VITE_ELEVENLABS_VOICE_AVI_MALE_DEFAULT,
      import.meta.env.VITE_ELEVENLABS_VOICE_HOPE_FEMALE_DEFAULT,
      import.meta.env.VITE_ELEVENLABS_VOICE_ADAM_MALE,
      import.meta.env.VITE_ELEVENLABS_VOICE_ANTONI_MALE,
      import.meta.env.VITE_ELEVENLABS_VOICE_JESSICA_FEMALE,
      import.meta.env.VITE_ELEVENLABS_VOICE_SARAH_FEMALE,
    ];
    for (const vid of fallbackOrder) {
      if (vid) return vid;
    }
    // If none found, use first saved voice
    if (savedVoices.length > 0) return savedVoices[0].id;
    return undefined;
  };

  const processAudio = useCallback(async (audioBlob: Blob): Promise<TranslationResult | null> => {
    if (!sttService || !translationService) {
      setError('API services not configured');
      return null;
    }
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    try {
      setCurrentStep('Transcribing speech...');
      setProgress(25);
      const transcript = await sttService.transcribe(
        audioBlob,
        settings.translation.autoDetect ? undefined : fromLanguage
      );
      if (!transcript.trim()) {
        throw new Error('No speech detected in audio');
      }
      setCurrentStep('Translating text...');
      setProgress(50);
      const translatedText = await translationService.translate(
        transcript,
        toLanguage,
        fromLanguage
      );
      let audioUrl: string | undefined;
      if (ttsService) {
        setCurrentStep('Generating speech...');
        setProgress(75);
        const voiceId = getVoiceId();
        if (!voiceId) throw new Error('No valid voice ID available');
        const audioBlob = await ttsService.synthesize(translatedText, voiceId);
        audioUrl = URL.createObjectURL(audioBlob);
      }
      setCurrentStep('Complete');
      setProgress(100);
      const result: TranslationResult = {
        original: transcript,
        translated: translatedText,
        fromLanguage,
        toLanguage,
        confidence: 0.95,
        timestamp: new Date(),
      };
      if (settings.translation.saveTranscripts) {
        addTranslation(result);
      }
      return result;
    } catch (error: any) {
      setError(error.message || 'Translation failed');
      return null;
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
      setProgress(0);
    }
  }, [
    sttService,
    translationService,
    ttsService,
    fromLanguage,
    toLanguage,
    selectedVoice,
    savedVoices,
    settings.translation,
    addTranslation,
    setError,
  ]);

  const playAudio = useCallback((audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.volume = settings.audio.outputVolume / 100;
    audio.play().catch((error) => {
      setError(`Failed to play audio: ${error.message}`);
    });
  }, [settings.audio.outputVolume, setError]);

  return {
    processAudio,
    playAudio,
    isProcessing,
    currentStep,
    progress,
  };
};