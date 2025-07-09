import { useState, useRef, useEffect, useCallback } from 'react';
import { useMicrophone } from '../microphone/useMicrophone';

interface UseVoiceActivityDetectionOptions {
  onVoiceStart: () => void;
  onVoiceEnd: (audioBlob: Blob) => void;
  onAudioLevelChange?: (level: number) => void;
  silenceThreshold?: number;
  silenceDuration?: number;
}

export const useVoiceActivityDetection = ({
  onVoiceStart,
  onVoiceEnd,
  onAudioLevelChange,
  silenceThreshold = 10,
  silenceDuration = 1000,
}: UseVoiceActivityDetectionOptions) => {
  const [isVADActive, setIsVADActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);


  const cleanupAudio = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  }, []);

  const startRecording = useCallback((microphoneMediaStream: MediaStream | null) => {
    console.log('Attempting to start recording...');

    if (!microphoneMediaStream) {
      console.error('No media stream available for recording. Cannot start recording.');
      return;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      console.log('MediaRecorder already recording.');
      return;
    }

    try {
      const newMediaRecorder = new MediaRecorder(microphoneMediaStream);
      mediaRecorderRef.current = newMediaRecorder;
      audioChunksRef.current = [];

      newMediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      newMediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        onVoiceEnd(audioBlob);
        setIsRecording(false);
        cleanupAudio();
      };

      newMediaRecorder.start();
      setIsRecording(true);
      onVoiceStart();
      console.log('MediaRecorder started.');
    } catch (error) {
      console.error('Error creating or starting MediaRecorder:', error);
    }


  }, [onVoiceEnd, onVoiceStart, cleanupAudio]);

  const stopRecording = useCallback(() => {
    console.log('Attempting to stop recording...');
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      console.log('MediaRecorder stopped.');
    } else {
      console.log('MediaRecorder not in recording state.');
    }
    setIsRecording(false);
    setIsVADActive(false);
    cleanupAudio();
  }, [cleanupAudio]);

  const handleAudioData = useCallback((audioData: Float32Array) => {
    const rms = Math.sqrt(audioData.reduce((sum, val) => sum + val * val, 0) / audioData.length);
    const average = rms * 1000;

    onAudioLevelChange?.(average);

    if (average > silenceThreshold) {
      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
      }
      if (!isRecording) {
        startRecording(mediaStreamRef.current);
      }
    } else {
      if (isRecording && !silenceTimerRef.current) {
        silenceTimerRef.current = setTimeout(() => {
          stopRecording();
        }, silenceDuration);
      }
    }
  }, [isRecording, onAudioLevelChange, silenceThreshold, silenceDuration, startRecording, stopRecording, mediaStreamRef]);

  const { startMicrophone, stopMicrophone, mediaStreamRef, scriptProcessorNodeRef } = useMicrophone({
    onAudioData: handleAudioData,
    onAudioLevelChange: onAudioLevelChange || (() => {})
  });

  const startListening = useCallback(async () => {
    console.log('Attempting to start listening...');
    if (isVADActive) {
      console.log('VAD already active.');
      return;
    }
    setIsVADActive(true);
    setIsRecording(false);
    startMicrophone();
    console.log('Listening started.');
  }, [isVADActive, startMicrophone]);

  useEffect(() => {
    return () => {
      console.log('Cleaning up VAD and microphone resources.');
      cleanupAudio();
      stopMicrophone();
    };
  }, [cleanupAudio, stopMicrophone]);

  return {
    isVADActive,
    isRecording,
    startListening,
    stopRecording,
  };
};