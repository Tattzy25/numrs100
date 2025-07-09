import React from 'react';
import { Mic, Users, Settings, BookOpen, Headphones, Zap } from 'lucide-react';
import { AppMode } from '../App';

interface MainMenuProps {
  onModeChange: (mode: AppMode) => void;
  onHostRoom: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({ onModeChange, onHostRoom }) => {
  const menuItems = [
    {
      id: 'host',
      title: 'HOST',
      description: 'Create a room and generate code',
      icon: Users,
      action: onHostRoom,
      gradient: 'from-purple-500 to-purple-700',
      glow: 'shadow-purple-500/50'
    },
    {
      id: 'join',
      title: 'JOIN',
      description: 'Join with a room code',
      icon: Users,
      action: () => onModeChange('join'),
      gradient: 'from-purple-600 to-purple-800',
      glow: 'shadow-purple-600/50'
    },
    {
      id: 'solo',
      title: 'SOLO',
      description: 'Practice mode - translate for yourself',
      icon: Mic,
      action: () => onModeChange('solo'),
      gradient: 'from-purple-600 to-purple-800',
      glow: 'shadow-purple-600/50'
    }
  ];

  const labItems = [
    {
      id: 'voicelab',
      title: 'Voice Lab',
      description: 'Clone voices & manage library',
      icon: Headphones,
      action: () => onModeChange('voicelab'),
      gradient: 'from-purple-400 to-purple-600',
      glow: 'shadow-purple-400/40'
    },
    {
      id: 'languagelab',
      title: 'Language Lab',
      description: 'Language glossary & settings',
      icon: BookOpen,
      action: () => onModeChange('languagelab'),
      gradient: 'from-purple-500 to-purple-700',
      glow: 'shadow-purple-500/40'
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'App preferences & configuration',
      icon: Settings,
      action: () => onModeChange('settings'),
      gradient: 'from-purple-600 to-purple-800',
      glow: 'shadow-purple-600/40'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 rounded-full shadow-2xl shadow-yellow-400/50">
            <Zap className="h-8 w-8 text-white" />
          </div>
        </div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-purple-400 to-purple-500 bg-clip-text text-transparent mb-4 drop-shadow-2xl">
          BRIDGIT-AI
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Break language barriers with AI-powered real-time voice translation
        </p>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 w-full max-w-4xl">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`group relative bg-gradient-to-br ${item.gradient} p-8 rounded-2xl shadow-2xl ${item.glow} transform hover:scale-105 transition-all duration-300 hover:shadow-2xl border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 text-center">
              <div className="mb-4 flex justify-center">
                <item.icon className="h-12 w-12 text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">{item.title}</h3>
              <p className="text-white/80 text-sm">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {labItems.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className={`group relative bg-gradient-to-br ${item.gradient} p-6 rounded-xl shadow-xl ${item.glow} transform hover:scale-105 transition-all duration-300 border border-purple-500/20 backdrop-blur-sm hover:border-purple-400/40`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10 text-center">
              <div className="mb-3 flex justify-center">
                <item.icon className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300 drop-shadow-lg" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-1 drop-shadow-lg">{item.title}</h3>
              <p className="text-white/70 text-xs">{item.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-16 text-center">
        <p className="text-gray-400 text-sm">
          Powered by <span className="text-purple-400">Groq</span> • <span className="text-purple-400">DeepL</span> • <span className="text-yellow-400">Eleven Labs</span> • <span className="text-purple-400">Ably</span>
        </p>
      </div>
    </div>
  );
};