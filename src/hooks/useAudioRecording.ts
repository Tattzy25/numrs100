import { useState, useRef, useCallback } from 'react';
import { AudioProcessor, AudioLevelAnalyzer } from '../services/api';
import { useAppStore } from '../store/useAppStore';

export const useAudioRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const { settings, setError } = useAppStore();
  
  const audioProcessor = useRef(new AudioProcessor());
  const audioAnalyzer = useRef(new AudioLevelAnalyzer());
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setIsRecording(true);
      setRecordingTime(0);
      setError(null);

      await audioProcessor.current.startRecording((chunk) => {
        // Handle real-time audio chunks if needed
      });

      // Start audio level analysis
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioAnalyzer.current.initialize(stream);
      audioAnalyzer.current.startAnalyzing(setAudioLevel);

      // Start recording timer
      recordingInterval.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error: any) {
      setError(`Failed to start recording: ${error.message}`);
      setIsRecording(false);
    }
  }, [setError]);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    try {
      setIsRecording(false);
      audioAnalyzer.current.stopAnalyzing();
      setAudioLevel(0);

      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }

      const audioBlob = await audioProcessor.current.stopRecording();
      const wavBlob = await audioProcessor.current.convertToWav(audioBlob);
      
      setRecordingTime(0);
      return wavBlob;
    } catch (error: any) {
      setError(`Failed to stop recording: ${error.message}`);
      return null;
    }
  }, [setError]);

  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isRecording,
    audioLevel,
    recordingTime,
    formatTime,
    startRecording,
    stopRecording,
  };
};