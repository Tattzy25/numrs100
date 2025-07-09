import { useState, useEffect, useRef, useCallback } from 'react';

interface UseMicrophoneProps {
  onAudioData: (data: Float32Array) => void;
  onAudioLevelChange: (level: number) => void;
}

export const useMicrophone = ({ onAudioData, onAudioLevelChange }: UseMicrophoneProps) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const scriptProcessorNodeRef = useRef<ScriptProcessorNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [isMicActive, setIsMicActive] = useState(false);

  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (scriptProcessorNodeRef.current) {
      scriptProcessorNodeRef.current.disconnect();
      // For AudioWorkletNode, there's no onaudioprocess to nullify directly
      // We might need to stop the worklet or handle its lifecycle differently if it's not automatically garbage collected
      scriptProcessorNodeRef.current = null;
    }
    if (analyserNodeRef.current) {
      analyserNodeRef.current.disconnect();
      analyserNodeRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsMicActive(false);
  }, []);

  const startMicrophone = useCallback(async () => {
    if (isMicActive) return;

    console.log('Attempting to start microphone...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      console.log('Microphone stream obtained:', stream);
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(stream);

      analyserNodeRef.current = audioContextRef.current.createAnalyser();
      analyserNodeRef.current.fftSize = 256;
      source.connect(analyserNodeRef.current);

      await audioContextRef.current.audioWorklet.addModule('/src/components/microphone/audio-processor.js');
      const audioWorkletNode = new AudioWorkletNode(audioContextRef.current, 'audio-processor');

      source.connect(audioWorkletNode);
      audioWorkletNode.connect(audioContextRef.current.destination);

      audioWorkletNode.port.onmessage = (event) => {
        // Assuming audio-processor.js sends Float32Array data
        onAudioData(event.data);
      };

      // Store the AudioWorkletNode reference for cleanup
      scriptProcessorNodeRef.current = audioWorkletNode as any; // Type assertion for compatibility


      const detectAudioLevel = () => {
        if (analyserNodeRef.current) {
          const dataArray = new Uint8Array(analyserNodeRef.current.frequencyBinCount);
          analyserNodeRef.current.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / dataArray.length;
          onAudioLevelChange(average);
        }
        animationFrameRef.current = requestAnimationFrame(detectAudioLevel);
      };
      animationFrameRef.current = requestAnimationFrame(detectAudioLevel);

      setIsMicActive(true);
      console.log('Microphone is active.');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      cleanupAudio();
    }
  }, [isMicActive, onAudioData, onAudioLevelChange, cleanupAudio]);

  const stopMicrophone = useCallback(() => {
    console.log('Stopping microphone...');
    cleanupAudio();
  }, [cleanupAudio]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return { isMicActive, startMicrophone, stopMicrophone, mediaStreamRef, scriptProcessorNodeRef };
};