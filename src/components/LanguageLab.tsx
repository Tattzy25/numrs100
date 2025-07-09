import React, { useState } from 'react';
import { ArrowLeft, BookOpen, Star, Search } from 'lucide-react';

interface LanguageLabProps {
  onBack: () => void;
}

export const LanguageLab: React.FC<LanguageLabProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'glossary' | 'saved'>('glossary');
  const [searchTerm, setSearchTerm] = useState('');

  const languageGlossary = [
    { code: 'en', name: 'English', native: 'English', speakers: '1.5B', region: 'Global', flag: '🇺🇸' },
    { code: 'zh', name: 'Chinese', native: '中文', speakers: '1.1B', region: 'China', flag: '🇨🇳' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', speakers: '600M', region: 'India', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', native: 'Español', speakers: '500M', region: 'Spain, Latin America', flag: '🇪🇸' },
    { code: 'fr', name: 'French', native: 'Français', speakers: '280M', region: 'France, Africa', flag: '🇫🇷' },
    { code: 'ar', name: 'Arabic', native: 'العربية', speakers: '420M', region: 'Middle East', flag: '🇸🇦' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', speakers: '230M', region: 'Bangladesh', flag: '🇧🇩' },
    { code: 'ru', name: 'Russian', native: 'Русский', speakers: '260M', region: 'Russia, Eastern Europe', flag: '🇷🇺' },
    { code: 'pt', name: 'Portuguese', native: 'Português', speakers: '260M', region: 'Brazil, Portugal', flag: '🇵🇹' },
    { code: 'ja', name: 'Japanese', native: '日本語', speakers: '125M', region: 'Japan', flag: '🇯🇵' },
    { code: 'de', name: 'German', native: 'Deutsch', speakers: '100M', region: 'Germany, Austria', flag: '🇩🇪' },
    { code: 'ko', name: 'Korean', native: '한국어', speakers: '77M', region: 'Korea', flag: '🇰🇷' },
    { code: 'it', name: 'Italian', native: 'Italiano', speakers: '65M', region: 'Italy', flag: '🇮🇹' },
    { code: 'tr', name: 'Turkish', native: 'Türkçe', speakers: '85M', region: 'Turkey', flag: '🇹🇷' },
    { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt', speakers: '95M', region: 'Vietnam', flag: '🇻🇳' },
    { code: 'th', name: 'Thai', native: 'ไทย', speakers: '69M', region: 'Thailand', flag: '🇹🇭' },
  ];

  const savedLanguages = [
    { code: 'es', name: 'Spanish', usage: 'Work meetings', lastUsed: '2024-01-15' },
    { code: 'fr', name: 'French', usage: 'Client calls', lastUsed: '2024-01-12' },
    { code: 'de', name: 'German', usage: 'Conference calls', lastUsed: '2024-01-10' },
    { code: 'ja', name: 'Japanese', usage: 'Partner meetings', lastUsed: '2024-01-08' },
  ];

  const filteredLanguages = languageGlossary.filter(lang =>
    lang.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tabs = [
    { id: 'glossary', label: 'Language Glossary', icon: BookOpen },
    { id: 'saved', label: 'Saved Languages', icon: Star },
  ];

  const renderGlossary = () => (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search languages..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-black border border-purple-500/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLanguages.map((lang) => (
          <div
            key={lang.code}
            className="bg-gray-900/60 backdrop-blur-sm border border-purple-500/20 rounded-xl p-4 hover:bg-gray-800/60 transition-colors shadow-lg shadow-purple-500/10"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <h3 className="text-white font-semibold">{lang.name}</h3>
                  <p className="text-sm text-gray-400">{lang.native}</p>
                </div>
              </div>
              <button className="p-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors" title="Save language">
                <Star className="h-4 w-4 text-white hover:text-yellow-400" />
              </button>
            </div>
            <div className="text-xs text-gray-400 space-y-1">
              <p>Speakers: {lang.speakers}</p>
              <p>Region: {lang.region}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSavedLanguages = () => (
    <div className="space-y-4">
      <div className="text-sm text-gray-400 mb-4">
        Manage your frequently used languages and set defaults
      </div>
      {savedLanguages.map((lang) => (
        <div
          key={lang.code}
          className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-4 shadow-lg shadow-purple-500/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">
                {languageGlossary.find(l => l.code === lang.code)?.flag}
              </span>
              <div>
                <h3 className="text-white font-semibold flex items-center space-x-2">
                  <span>{lang.name}</span>
                  {lang.code === 'es' && (
                    <span className="text-xs bg-gradient-to-r from-yellow-500 to-yellow-600 text-black px-2 py-0.5 rounded-full shadow-lg shadow-yellow-500/30">Default</span>
                  )}
                </h3>
                <p className="text-sm text-gray-400">{lang.usage}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <p className="text-xs text-gray-400">Last used</p>
              <p className="text-sm text-white">{lang.lastUsed}</p>
              {lang.code !== 'es' && (
                <button className="text-xs bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-3 py-1 rounded-lg transition-colors shadow-lg shadow-purple-500/30">
                  Set Default
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Language Lab
          </h1>
          
          <div className="w-16" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm rounded-xl p-1 border border-purple-500/30 shadow-lg shadow-purple-500/20">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-purple-800/30'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === 'glossary' && renderGlossary()}
          {activeTab === 'saved' && renderSavedLanguages()}
        </div>
      </div>
    </div>
  );
};