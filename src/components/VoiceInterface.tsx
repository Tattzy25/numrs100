import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Send, RotateCcw, ArrowLeft, Copy, Share } from 'lucide-react';
import { LanguageSelector } from './language/LanguageSelector';
import { useTranslation } from '../hooks/translation/useTranslation';
import { useRealtime } from '../hooks/useRealtime';
import { useVoiceActivityDetection } from './vad/useVoiceActivityDetection';

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
  const [fromLang, setFromLang] = useState(fromLanguage || 'es');
  const [toLang, setToLang] = useState(toLanguage || 'en');

  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [showCodeButton, setShowCodeButton] = useState(mode === 'host');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [statusMessage, setStatusMessage] = useState(mode === 'solo' ? 'Say something or upload a file...' : 'Ready to translate...');
  const [hostMessage, setHostMessage] = useState('');

  const [audioLevel, setAudioLevel] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState(mode === 'solo' ? 'offline' : 'connected');
  const [generatedCode, setGeneratedCode] = useState('');

  const generateRoomCode = async () => {
    setIsGeneratingCode(true);
    setStatusMessage('Generating access code...');

    try {
      const response = await fetch('/api/generate-room-code', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to generate room code');
      const data = await response.json();
      const code = data.roomCode;
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

  const { processAudio, isProcessing: isTranslationProcessing, currentStep, progress } = useTranslation();

  const { isVADActive, isRecording, startListening, stopRecording } = useVoiceActivityDetection({
    onVoiceStart: () => {
      setStatusMessage('Recording...');
      setTranscript('');
      setTranslation('');
    },
    onVoiceEnd: async (audioBlob) => {
      setStatusMessage('Processing audio...');
      await processAudio(audioBlob);
    },
    onAudioLevelChange: setAudioLevel,
  });

  useEffect(() => {
    if (isTranslationProcessing) {
      setStatusMessage(currentStep || 'Processing...');
    } else if (!isRecording && !isVADActive) {
      setStatusMessage(mode === 'solo' ? 'Say something or upload a file...' : 'Ready to translate...');
    } else if (isVADActive && !isRecording) {
      setStatusMessage('Bridgit is listening for your voice...');
    }
  }, [isTranslationProcessing, currentStep, isRecording, isVADActive, mode]);

  const handleMicToggle = async () => {
    if (isTranslationProcessing) {
      setStatusMessage('Please wait for current processing to finish.');
      return;
    }
    if (isRecording) {
      stopRecording();
    }
    else {
      startListening();
    }
  };

  // Ably realtime integration
  const { sendMessage } = useRealtime({ ablyApiKey: import.meta.env.VITE_ABLY_API_KEY });

  const handleSend = async () => {
    setStatusMessage(mode === 'solo' ? 'Playing translation...' : 'Bridgit is sending...');
    if (mode === 'solo') {
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
                  value={hostMessage}
                  onChange={(e) => setHostMessage(e.target.value)}
                  onKeyDown={async (e) => {
                    if (e.key === 'Enter' && hostMessage && roomCode) {
                      await sendMessage({
                        type: 'broadcast',
                        payload: {
                          message: hostMessage,
                          sender: 'host',
                          timestamp: Date.now(),
                        },
                        sender: 'host',
                        timestamp: Date.now(),
                      });
                      setHostMessage("");
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
          />
          <LanguageSelector
            label="To"
            value={toLang}
            onChange={(lang) => {
              setToLang(lang);
              onLanguageChange.setToLanguage(lang);
            }}
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
            className={`p-4 rounded-full shadow-lg transition-all duration-300
              ${isTranslationProcessing
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : isRecording
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/40 animate-pulse'
                  : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/40'
              }`}
            disabled={isTranslationProcessing}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-full" />

            {/* Animated Voice Detection Waves */}
            {isRecording && (
              <>
                <div
                  className="absolute inset-0 rounded-full border-4 animate-pulse voice-wave-1"
                  style={{
                    '--wave-color-1': `rgba(${Math.floor(147 + audioLevel)}, ${Math.floor(51 + audioLevel * 2)}, ${Math.floor(234 + audioLevel)}, 0.6)`,
                    '--wave-scale-1': `${1 + audioLevel / 500}`
                  } as React.CSSProperties}
                />
                <div
                  className="absolute inset-2 rounded-full border-2 animate-pulse voice-wave-2"
                  style={{
                    '--wave-color-2': `rgba(${Math.floor(255 + audioLevel)}, ${Math.floor(215 - audioLevel)}, ${Math.floor(0 + audioLevel * 2)}, 0.4)`,
                    '--wave-scale-2': `${1 + audioLevel / 300}`
                  } as React.CSSProperties}
                />
                <div
                  className="absolute inset-4 rounded-full border-2 animate-pulse voice-wave-3"
                  style={{
                    '--wave-color-3': `rgba(${Math.floor(168 + audioLevel * 2)}, ${Math.floor(85 + audioLevel)}, ${Math.floor(247)}, 0.8)`,
                    '--wave-scale-3': `${1 + audioLevel / 200}`
                  } as React.CSSProperties}
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
           {mode === 'host' && translation && (
              <div className="flex space-x-4">
                <button
                  onClick={handleSend}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                >
                  <Send className="h-5 w-5" />
                  <span>Send</span>
                </button>
                <button
                  onClick={handleReRecord}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span>Re-record</span>
                </button>
              </div>
            )}

          {/* Status */}
          <div className="text-center">
            {isTranslationProcessing && (
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
