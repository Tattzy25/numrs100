import React, { useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useToast } from './components/Toast';
import { MainMenu } from './components/MainMenu';
import { VoiceInterface } from './components/VoiceInterface';
import { VoiceLab } from './components/VoiceLab';
import { LanguageLab } from './components/LanguageLab';
import { Settings } from './components/Settings';
import { JoinRoom } from './components/JoinRoom';
import { useAppStore } from './store/useAppStore';
import { SUPPORTED_LANGUAGES } from './config/supportedLanguages';

export type AppMode = 'menu' | 'host' | 'join' | 'solo' | 'voicelab' | 'languagelab' | 'settings';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('menu');
  const [roomCode, setRoomCode] = useState<string>('');
  const [joined, setJoined] = useState<boolean>(false);
  
  const { 
    fromLanguage, 
    toLanguage, 
    setFromLanguage, 
    setToLanguage,
    lastError,
    setError 
  } = useAppStore();

  const toast = useToast();

  React.useEffect(() => {
    const validateLanguage = (langCode: string | undefined, setter: (lang: string) => void, langType: string) => {
      if (langCode) {
        const found = SUPPORTED_LANGUAGES.some(lang => lang.code === langCode);
        if (!found) {
          toast.info(`Unsupported ${langType} language: ${langCode}. Coming soon!`);
          setter('EN-US'); // Set a default supported language
        }
      }
    };

    validateLanguage(fromLanguage, setFromLanguage, 'source');
    validateLanguage(toLanguage, setToLanguage, 'target');
  }, [fromLanguage, toLanguage, setFromLanguage, setToLanguage, toast]);

  // Show error toasts
  React.useEffect(() => {
    if (lastError) {
      toast.error(lastError);
      setError(null);
    }
  }, [lastError, toast, setError]);

  const handleModeChange = (mode: AppMode) => {
    setCurrentMode(mode);
  };

  const handleHostRoom = () => {
    // Generate room code (in real app, this would come from Ably)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomCode(code);
    setCurrentMode('host');
  };

  const handleJoinRoom = (code: string) => {
    setRoomCode(code);
    setJoined(true);
    setCurrentMode('join');
  };

  const renderCurrentView = () => {
    switch (currentMode) {
      case 'menu':
        return (
          <MainMenu
            onModeChange={handleModeChange}
            onHostRoom={handleHostRoom}
          />
        );
      case 'host':
        return (
          <VoiceInterface
            mode="host"
            roomCode={roomCode}
            fromLanguage={fromLanguage}
            toLanguage={toLanguage}
            onLanguageChange={{ setFromLanguage, setToLanguage }}
            onBack={() => setCurrentMode('menu')}
          />
        );
      case 'join':
        if (!joined) {
          return (
            <JoinRoom
              onJoinRoom={handleJoinRoom}
              onBack={() => setCurrentMode('menu')}
            />
          );
        } else {
          return (
            <VoiceInterface
              mode="join"
              roomCode={roomCode}
              fromLanguage={fromLanguage}
              toLanguage={toLanguage}
              onLanguageChange={{ setFromLanguage, setToLanguage }}
              onBack={() => {
                setJoined(false);
                setCurrentMode('menu');
              }}
            />
          );
        }
      case 'solo':
        return (
          <VoiceInterface
            mode="solo"
            roomCode=""
            fromLanguage={fromLanguage}
            toLanguage={toLanguage}
            onLanguageChange={{ setFromLanguage, setToLanguage }}
            onBack={() => setCurrentMode('menu')}
          />
        );
      case 'voicelab':
        return <VoiceLab onBack={() => setCurrentMode('menu')} />;
      case 'languagelab':
        return <LanguageLab onBack={() => setCurrentMode('menu')} />;
      case 'settings':
        return <Settings onBack={() => setCurrentMode('menu')} />;
      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(147,51,234,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(255,215,0,0.08),transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10">
          {renderCurrentView()}
        </div>
        
        <toast.ToastContainer />
      </div>
    </ErrorBoundary>
  );
}

export default App;