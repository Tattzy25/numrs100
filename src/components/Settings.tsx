import React, { useState } from 'react';
import { ArrowLeft, Settings as SettingsIcon, Volume2, Mic, Globe, Shield } from 'lucide-react';
import { ApiKeyManager } from './ApiKeyManager';
import { useAppStore } from '../store/useAppStore';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const { settings, updateSettings } = useAppStore();

  const renderSlider = (label: string, value: number, onChange: (value: number) => void) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-sm font-medium text-gray-300">{label}</span>
        <span className="text-sm text-gray-400">{value}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
    </div>
  );

  const renderToggle = (label: string, description: string, value: boolean, onChange: (value: boolean) => void) => (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-300">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          value ? 'bg-purple-600' : 'bg-gray-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            value ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          
          <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-400 to-gray-600 bg-clip-text text-transparent">
            Settings
          </h1>
          
          <div className="w-16" />
        </div>

        <div className="space-y-6">
          {/* Audio Settings */}
          <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-lg shadow-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Volume2 className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Audio Settings</h2>
            </div>
            
            <div className="space-y-6">
              {renderSlider('Input Gain', settings.audio.inputGain, (value) => 
                updateSettings({ audio: { ...settings.audio, inputGain: value } })
              )}
              {renderSlider('Output Volume', settings.audio.outputVolume, (value) => 
                updateSettings({ audio: { ...settings.audio, outputVolume: value } })
              )}
              
              <div className="space-y-4">
                {renderToggle(
                  'Noise Reduction',
                  'Reduce background noise during recording',
                  settings.audio.noiseReduction,
                  (value) => updateSettings({ audio: { ...settings.audio, noiseReduction: value } })
                )}
                {renderToggle(
                  'Echo Cancellation',
                  'Prevent audio feedback during calls',
                  settings.audio.echoCancellation,
                  (value) => updateSettings({ audio: { ...settings.audio, echoCancellation: value } })
                )}
              </div>
            </div>
          </div>

          {/* Translation Settings */}
          <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-lg shadow-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-semibold text-white">Translation Settings</h2>
            </div>
            
            <div className="space-y-4">
              {renderToggle(
                'Auto-detect Language',
                'Automatically detect the source language',
                settings.translation.autoDetect,
                (value) => updateSettings({ translation: { ...settings.translation, autoDetect: value } })
              )}
              {renderToggle(
                'Instant Translation',
                'Translate while speaking (experimental)',
                settings.translation.instantTranslation,
                (value) => updateSettings({ translation: { ...settings.translation, instantTranslation: value } })
              )}
              {renderToggle(
                'Save Transcripts',
                'Keep history of translations',
                settings.translation.saveTranscripts,
                (value) => updateSettings({ translation: { ...settings.translation, saveTranscripts: value } })
              )}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-lg shadow-purple-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="h-5 w-5 text-yellow-400" />
              <h2 className="text-lg font-semibold text-white">Privacy & Security</h2>
            </div>
            
            <div className="space-y-4">
              {renderToggle(
                'Store Voice Data',
                'Save voice recordings for model improvement',
                settings.privacy.storeVoiceData,
                (value) => updateSettings({ privacy: { ...settings.privacy, storeVoiceData: value } })
              )}
              {renderToggle(
                'Share Analytics',
                'Help improve the app with anonymous usage data',
                settings.privacy.shareAnalytics,
                (value) => updateSettings({ privacy: { ...settings.privacy, shareAnalytics: value } })
              )}
              {renderToggle(
                'Cloud Sync',
                'Sync settings and preferences across devices',
                settings.privacy.cloudSync,
                (value) => updateSettings({ privacy: { ...settings.privacy, cloudSync: value } })
              )}
            </div>
          </div>
          
          {/* App Info */}
          <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-lg shadow-purple-500/20">
            <h2 className="text-lg font-semibold text-white mb-4">App Information</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Version</span>
                <span className="text-white">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Build</span>
                <span className="text-white">2024.01.15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">API Status</span>
                <span className="text-purple-400">Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};