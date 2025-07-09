import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, MicOff, Send, RotateCcw, ArrowLeft, Copy, Share } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import { useTranslation } from '../hooks/useTranslation';
import { useRealtime } from '../hooks/useRealtime';

interface VoiceInterfaceProps {
  mode: 'host' | 'join' | 'solo';
  roomCode: string;
  fromLanguage: string;
  toLanguage: string;
  onLanguageChange: {
    setFromLanguage: (lang: string) => void;
    setToLanguage: (lang: string) => void;
  };
  onBack: () => void;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  mode,
  roomCode,
  fromLanguage,
  toLanguage,
  onLanguageChange,
  onBack
}) => {
  // Set Spanish as default for fromLanguage and toLanguage if not provided
  const [fromLang, setFromLang] = useState(fromLanguage || 'es');
  const [toLang, setToLang] = useState(toLanguage || 'en');
  const deeplApiKey = import.meta.env.VITE_DEEPL_API_KEY;
  console.log('VoiceInterface: deeplApiKey', deeplApiKey);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showCodeButton, setShowCodeButton] = useState(mode === 'host');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState(mode === 'solo' ? 'Say something or upload a file...' : 'Ready to translate...');
  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(mode === 'solo' ? 'offline' : 'connected');
  const [generatedCode, setGeneratedCode] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const generateRoomCode = async () => {
    setIsGeneratingCode(true);
    setStatusMessage('Generating access code...');

    try {
      // In a production environment, this would be an API call to your backend
      // const response = await fetch('/api/generate-room-code', { method: 'POST' });
      // const data = await response.json();
      // const code = data.roomCode;

      // Simulating a backend API call for demonstration
      await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate network delay
      const code = Math.random().toString(36).substring(2, 8).toUpperCase(); // Still client-side for now

      setGeneratedCode(code);
      setShowCodeButton(false);
      setIsGeneratingCode(false);
      setStatusMessage('Room created successfully');
    } catch (error) {
      setStatusMessage('Failed to generate room code');
      setIsGeneratingCode(false);
    }
  };

  const handleEndSession = async () => {
    if (mode === 'host' && roomCode) {
      await sendMessage({
        type: 'session_ended',
        payload: {
          roomCode: roomCode,
          timestamp: Date.now(),
        },
        sender: 'host',
        timestamp: Date.now(),
      });
    }
    setGeneratedCode('');
    setShowCodeButton(true);
    setStatusMessage('Session ended');
    setConnectionStatus('offline');
  };


  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [sourceNode, setSourceNode] = useState<MediaStreamAudioSourceNode | null>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [rtcStream, setRtcStream] = useState<MediaStream | null>(null);
  const cleanupAudio = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    if (audioContext) {
      audioContext.close();
      setAudioContext(null);
    }
    setAnalyser(null);
    setSourceNode(null);
    setAudioLevel(0);
  }, [mediaStream, audioContext]);

  useEffect(() => {
    return () => {
      cleanupAudio();
    };
  }, [cleanupAudio]);
  const startWebRTC = useCallback(async (stream: MediaStream) => {
    try {
      const pc = new RTCPeerConnection(rtcConfig);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      setPeerConnection(pc);
      setRtcStream(stream);
      // CRITICAL: In a production environment, this is where you'd implement signaling
      // to exchange SDP offers/answers and ICE candidates with other peers via a signaling server (e.g., WebSockets).
      // Without this, WebRTC connections cannot be established between users.
      // TODO: Implement production signaling logic for offer/answer exchange
      pc.ontrack = (event) => {
        // Attach to audio element if needed
      };
    } catch (err) {
      setStatusMessage('WebRTC initialization failed');
    }
  }, []);
  const handleMicToggle = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setStatusMessage('Processing audio...');
    } else {
      try {
        setStatusMessage('Bridgit is listening...');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMediaStream(stream);
        await startWebRTC(stream);
        const context = new AudioContext();
        setAudioContext(context);
        const analyserNode = context.createAnalyser();
        setAnalyser(analyserNode);
        const source = context.createMediaStreamSource(stream);
        setSourceNode(source);
        source.connect(analyserNode);
        const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
        let rafId: number;
        const updateAudioLevel = () => {
          if (isRecording) {
            analyserNode.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            setAudioLevel(average);
            rafId = requestAnimationFrame(updateAudioLevel);
          }
        };
        rafId = requestAnimationFrame(updateAudioLevel);
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await processAudio(audioBlob);
          cleanupAudio();
          cancelAnimationFrame(rafId);
        };
        mediaRecorder.start();
        setIsRecording(true);
      } catch (error) {
        setStatusMessage('Microphone access denied');
        cleanupAudio();
      }
    }
  };

  const {
    processAudio: pipelineProcessAudio,
    playAudio,
    isProcessing: pipelineProcessing,
    currentStep,
    progress
  } = useTranslation();

  // Ably realtime integration
  const { sendMessage } = useRealtime({ ablyApiKey: import.meta.env.VITE_ABLY_API_KEY });

  const processAudio = async (audioBlob: Blob) => {
    setIsProcessing(true);
    setStatusMessage('Transcribing speech...');
    const result = await pipelineProcessAudio(audioBlob);
    if (result) {
      setTranscript(result.original);
      setTranslation(result.translated);
      setStatusMessage('Translation complete');
      // Host mode: send translation/audio to room via Ably
      if (mode === 'host' && roomCode) {
        await sendMessage({
          type: 'text',
          payload: {
            transcript: result.original,
            translation: result.translated,
            fromLanguage: fromLang,
            toLanguage: toLang,
            timestamp: Date.now(),
          },
          sender: 'host',
          timestamp: Date.now(),
        });
      }
    } else {
      setTranscript('');
      setTranslation('');
      setStatusMessage('Transcription or translation failed');
    }
    setIsProcessing(false);
  };

  const handleSend = async () => {
    setStatusMessage(mode === 'solo' ? 'Playing translation...' : 'Bridgit is sending...');
    if (mode === 'solo') {
      if (translation) {
        await playAudio(translation);
      }
      setTranscript('');
      setTranslation('');
      setStatusMessage('Say something...');
    } else {
      if (translation && roomCode) {
        await sendMessage({
          type: 'text',
          payload: {
            transcript: transcript,
            translation: translation,
            fromLanguage: fromLang,
            toLanguage: toLang,
            timestamp: Date.now(),
          },
          sender: mode,
          timestamp: Date.now(),
        });
      }
      setTranscript('');
      setTranslation('');
      setStatusMessage('Ready to translate...');
    }
  };

  const handleReRecord = () => {
    setTranscript('');
    setTranslation('');
    setStatusMessage(mode === 'solo' ? 'Say something or upload a file...' : 'Ready to translate...');
  };

  const copyRoomCode = () => {
    const codeToShare = generatedCode || roomCode;
    navigator.clipboard.writeText(codeToShare);
    setStatusMessage('Room code copied!');
  };

  const shareRoomCode = async () => {
    const codeToShare = generatedCode || roomCode;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Bridgit-AI session',
          text: `Join my real-time translation session with code: ${codeToShare}`,
          url: window.location.href
        });
      } catch (error) {
        setStatusMessage('Error sharing room code');
      }
    } else {
      copyRoomCode();
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>

          <div className="text-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              {mode.toUpperCase()} MODE
            </h1>
            {mode === 'host' && showCodeButton && (
              <button
                onClick={generateRoomCode}
                disabled={isGeneratingCode}
                className={`mt-2 px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${isGeneratingCode
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/40'
                  }`}
              >
                {isGeneratingCode ? 'Generating...' : 'GET ACCESS CODE'}
              </button>
            )}
            {mode === 'host' && !showCodeButton && generatedCode && (
              <div className="flex flex-col items-center justify-center space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Room Code:</span>
                  <span className="text-lg font-mono text-white bg-gray-900/80 border border-purple-500/30 px-3 py-1 rounded-lg shadow-lg shadow-purple-500/20">
                    {generatedCode}
                  </span>
                  <button
                    onClick={copyRoomCode}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors hover:drop-shadow-lg"
                    title="Copy room code"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    onClick={shareRoomCode}
                    className="text-purple-400 hover:text-purple-300 transition-colors hover:drop-shadow-lg"
                    title="Share room code"
                  >
                    <Share className="h-4 w-4" />
                  </button>
                </div>
                {/* Host mode input field below the generated code */}
                <input
                  type="text"
                  placeholder="Enter message to broadcast to joined users"
                  className="mt-2 w-full max-w-xs bg-black border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400/50 text-center text-base font-mono tracking-wide shadow-lg shadow-purple-500/10"
                  value={statusMessage === 'Room created successfully' ? '' : statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && statusMessage && roomCode) {
                      await sendMessage({
                        type: 'broadcast',
                        payload: {
                          message: statusMessage,
                          sender: 'host',
                          timestamp: Date.now(),
                        },
                        sender: 'host',
                        timestamp: Date.now(),
                      });
                      setStatusMessage('');
                    }
                  }}
                />
              </div>
            )}
          </div>

          {mode === 'host' && !showCodeButton ? (
            <button
              onClick={handleEndSession}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 px-4 py-2 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/30"
            >
              END
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <div className={`h-2 w-2 rounded-full ${connectionStatus === 'connected' ? 'bg-purple-400 shadow-lg shadow-purple-400/50' : 'bg-gray-500'}`} />
              <span className="text-sm text-gray-400">
                {connectionStatus === 'connected' ? 'Connected' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        {/* Language Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-2xl mx-auto">
          <LanguageSelector
            label="From"
            value={fromLang}
            onChange={(lang) => {
              setFromLang(lang);
              onLanguageChange.setFromLanguage(lang);
            }}
            apiKey={deeplApiKey}
            type="source"
          />
          <LanguageSelector
            label="To"
            value={toLang}
            onChange={(lang) => {
              setToLang(lang);
              onLanguageChange.setToLanguage(lang);
            }}
            apiKey={deeplApiKey}
            type="target"
          />
        </div>
      </div>

      {/* Voice Interface */}
      <div className="max-w-2xl mx-auto px-2 sm:px-4 md:px-6">
        {/* File upload removed for production. Mobile-first padding added. */}

        {/* Transcript Display */}
        <div className="mb-8">
          <div className="bg-gray-900/60 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6 mb-4 shadow-xl shadow-purple-500/10">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">Original</h3>
            <p className="text-base sm:text-lg text-white min-h-[2.5rem] flex items-center">
              {transcript || 'Click the microphone to start speaking...'}
            </p>
          </div>
          <div className="bg-gray-900/60 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-4 sm:p-6 shadow-xl shadow-purple-500/10">
            <h3 className="text-xs sm:text-sm font-medium text-gray-400 mb-2">Translation</h3>
            <p className="text-base sm:text-lg text-white min-h-[2.5rem] flex items-center">
              {translation || statusMessage}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center space-y-6">
          {/* Microphone Button */}
          <button
            onClick={handleMicToggle}
            disabled={isProcessing}
            className={`relative group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 overflow-hidden ${isRecording
              ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/50 scale-110'
              : 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-2xl shadow-purple-500/50 hover:scale-105 hover:shadow-purple-400/60'
              } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full" />

            {/* Animated Voice Detection Waves */}
            {isRecording && (
              <>
                <div
                  className="absolute inset-0 rounded-full border-4 animate-pulse"
                  style={{
                    borderColor: `rgba(${Math.floor(147 + audioLevel)}, ${Math.floor(51 + audioLevel * 2)}, ${Math.floor(234 + audioLevel)}, 0.6)`,
                    transform: `scale(${1 + audioLevel / 500})`
                  }}
                />
                <div
                  className="absolute inset-2 rounded-full border-2 animate-pulse"
                  style={{
                    borderColor: `rgba(${Math.floor(255 + audioLevel)}, ${Math.floor(215 - audioLevel)}, ${Math.floor(0 + audioLevel * 2)}, 0.4)`,
                    transform: `scale(${1 + audioLevel / 300})`
                  }}
                />
                <div
                  className="absolute inset-4 rounded-full border-2 animate-pulse"
                  style={{
                    borderColor: `rgba(${Math.floor(168 + audioLevel * 2)}, ${Math.floor(85 + audioLevel)}, ${Math.floor(247)}, 0.8)`,
                    transform: `scale(${1 + audioLevel / 200})`
                  }}
                />
              </>
            )}

            {isRecording ? (
              <MicOff className="h-10 w-10 text-white z-10" />
            ) : (
              <Mic className="h-10 w-10 text-white z-10" />
            )}
          </button>

          {/* Action Buttons */}
          {translation && (
            <div className="flex space-x-4">
              <button
                onClick={handleReRecord}
                className="flex items-center space-x-2 bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 hover:border-gray-500/50 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <RotateCcw className="h-5 w-5" />
                <span>Re-record</span>
              </button>

              <button
                onClick={handleSend}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-purple-400/40"
              >
                <Send className="h-5 w-5" />
                <span>{mode === 'solo' ? 'Play' : 'Send'}</span>
              </button>
            </div>
          )}

          {/* Status */}
          <div className="text-center">
            {isProcessing && (
              <div className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-400 border-t-transparent" />
                <span className="text-sm text-gray-400">Processing...</span>
              </div>
            )}

            {isRecording && (
              <p className="text-sm text-red-400 animate-pulse drop-shadow-lg">
                🔴 Recording... Click mic to stop
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }; // For production, consider dedicated STUN/TURN servers for robustness.
