import React, { useState, useEffect } from 'react';
import { ArrowLeft, Headphones, Mic, Library, Save, Play, Pause, Download, Search } from 'lucide-react';

interface VoiceLabProps {
  onBack: () => void;
}

export const VoiceLab: React.FC<VoiceLabProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'clone' | 'library' | 'saved'>('clone');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [voiceFilter, setVoiceFilter] = useState({ gender: 'all', age: 'all', category: 'all' });
  const [selectedVoice, setSelectedVoice] = useState<string | null>(null);
  const [hasRecording, setHasRecording] = useState(false);

  const voiceLibrary = [
    { id: '1', name: 'Professional Male', category: 'Business', gender: 'male', age: 'adult', tier: 'basic', preview: 'preview1.mp3' },
    { id: '2', name: 'Warm Female', category: 'Casual', gender: 'female', age: 'adult', tier: 'basic', preview: 'preview2.mp3' },
    { id: '3', name: 'Young Adult', category: 'Education', gender: 'male', age: 'young', tier: 'basic', preview: 'preview3.mp3' },
    { id: '4', name: 'Narrator', category: 'Storytelling', gender: 'female', age: 'mature', tier: 'premium', preview: 'preview4.mp3' },
    { id: '5', name: 'Executive Voice', category: 'Business', gender: 'male', age: 'mature', tier: 'premium', preview: 'preview5.mp3' },
    { id: '6', name: 'Friendly Assistant', category: 'Customer Service', gender: 'female', age: 'young', tier: 'premium', preview: 'preview6.mp3' },
  ];

  const savedVoices = [
    { id: 's1', name: 'My Voice Clone', date: '2024-01-15', status: 'Ready', type: 'cloned', isDefault: true, category: 'Personal' },
    { id: 's2', name: 'Client Voice', date: '2024-01-10', status: 'Processing', type: 'cloned', isDefault: false, category: 'Personal' },
    { id: 's3', name: 'Professional Male', date: '2024-01-08', status: 'Ready', type: 'library', isDefault: false, category: 'Business' },
    { id: 's4', name: 'Warm Female', date: '2024-01-05', status: 'Ready', type: 'library', isDefault: false, category: 'Casual' },
  ];

  const handleRecordToggle = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordingTime >= 30) {
        setHasRecording(true);
      }
    } else {
      setIsRecording(true);
      setRecordingTime(0);
      setHasRecording(false);
    }
  };

  const handleSaveVoice = () => {
    // Save the voice clone
    setHasRecording(false);
    setRecordingTime(0);
    // Add to saved voices logic here
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredVoices = voiceLibrary.filter(voice => {
    const matchesSearch = voice.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         voice.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = voiceFilter.gender === 'all' || voice.gender === voiceFilter.gender;
    const matchesAge = voiceFilter.age === 'all' || voice.age === voiceFilter.age;
    const matchesCategory = voiceFilter.category === 'all' || voice.category === voiceFilter.category;
    
    return matchesSearch && matchesGender && matchesAge && matchesCategory;
  });

  const basicVoices = filteredVoices.filter(voice => voice.tier === 'basic');
  const premiumVoices = filteredVoices.filter(voice => voice.tier === 'premium');
  const tabs = [
    { id: 'clone', label: 'Clone Voice', icon: Mic },
    { id: 'library', label: 'Voice Library', icon: Library },
    { id: 'saved', label: 'Saved Voices', icon: Save },
  ];

  const renderCloneVoice = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-lg shadow-purple-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Create Voice Clone</h3>
        <p className="text-gray-400 mb-6">
          Record at least 30 seconds of clear speech to create a high-quality voice clone.
        </p>
        
        <div className="flex flex-col items-center space-y-4">
          <button
            onClick={handleRecordToggle}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
              isRecording
                ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-2xl shadow-red-500/50 scale-110'
                : 'bg-gradient-to-br from-purple-500 to-purple-700 shadow-2xl shadow-purple-500/50 hover:scale-105'
            }`}
          >
            <Mic className="h-8 w-8 text-white" />
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {isRecording ? `Recording... ${formatTime(recordingTime)} / 0:30` : hasRecording ? `Recorded: ${formatTime(recordingTime)}` : 'Click to start recording'}
            </p>
            <div className="w-64 bg-gray-800 rounded-full h-2 mt-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-700 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min((recordingTime / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Recording Controls */}
          {hasRecording && recordingTime >= 30 && (
            <div className="flex space-x-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex items-center space-x-2 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 px-4 py-2 rounded-lg transition-colors shadow-lg"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button 
                onClick={handleSaveVoice}
                className="flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-purple-500/30"
              >
                <Save className="h-4 w-4" />
                <span>Save</span>
              </button>
              <button className="flex items-center space-x-2 bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 px-4 py-2 rounded-lg transition-colors shadow-lg shadow-yellow-500/30">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-lg shadow-purple-500/20">
        <h3 className="text-lg font-semibold text-white mb-4">Voice Name</h3>
        <input
          type="text"
          placeholder="Enter a name for your voice clone"
          className="w-full bg-black border border-purple-500/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg shadow-purple-500/10"
        />
      </div>
    </div>
  );

  const renderVoiceLibrary = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search voices..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-black border border-purple-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-lg shadow-purple-500/10"
          />
        </div>
        {/* Filters can be added here if needed */}
      </div>
      <div>
        <h4 className="text-md font-semibold text-purple-300 mb-2">Basic Voices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {basicVoices.map(voice => (
            <div
              key={voice.id}
              className={`flex items-center justify-between p-4 rounded-xl border border-purple-500/20 bg-gradient-to-br from-gray-900/60 to-purple-900/10 shadow-lg shadow-purple-500/10 transition-all duration-200 ${selectedVoice === voice.id ? 'ring-2 ring-purple-400' : ''}`}
              onClick={() => setSelectedVoice(voice.id)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="font-medium text-white">{voice.name}</div>
                <div className="text-xs text-gray-400">{voice.category}</div>
              </div>
              <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 p-2 rounded-full shadow-lg shadow-purple-500/20">
                <Headphones className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-md font-semibold text-yellow-300 mb-2">Premium Voices</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {premiumVoices.map(voice => (
            <div
              key={voice.id}
              className={`flex items-center justify-between p-4 rounded-xl border border-yellow-500/20 bg-gradient-to-br from-gray-900/60 to-yellow-900/10 shadow-lg shadow-yellow-500/10 transition-all duration-200 ${selectedVoice === voice.id ? 'ring-2 ring-yellow-400' : ''}`}
              onClick={() => setSelectedVoice(voice.id)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <div className="font-medium text-white">{voice.name}</div>
                <div className="text-xs text-gray-400">{voice.category}</div>
              </div>
              <button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 p-2 rounded-full shadow-lg shadow-yellow-500/20">
                <Headphones className="h-5 w-5 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSavedVoices = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-white mb-4">Saved Voices</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedVoices.map(voice => (
          <div
            key={voice.id}
            className={`flex items-center justify-between p-4 rounded-xl border border-purple-500/20 bg-gradient-to-br from-gray-900/60 to-purple-900/10 shadow-lg shadow-purple-500/10 transition-all duration-200 ${voice.isDefault ? 'ring-2 ring-purple-400' : ''}`}
          >
            <div>
              <div className="font-medium text-white">{voice.name}</div>
              <div className="text-xs text-gray-400">{voice.category} • {voice.date} • {voice.status}</div>
            </div>
            <div className="flex space-x-2">
              {voice.status === 'Ready' && (
                <button className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 p-2 rounded-full shadow-lg shadow-purple-500/20">
                  <Play className="h-5 w-5 text-white" />
                </button>
              )}
              <button className="bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 p-2 rounded-full shadow-lg shadow-yellow-500/20">
                <Download className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </button>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Voice Lab</h2>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm rounded-xl p-1 border border-purple-500/30 shadow-lg shadow-purple-500/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'clone' | 'library' | 'saved')}
            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg shadow-purple-500/30'
                : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-purple-800/30'
            }`}
          >
            <tab.icon className="h-5 w-5" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'clone' && renderCloneVoice()}
      {activeTab === 'library' && renderVoiceLibrary()}
      {activeTab === 'saved' && renderSavedVoices()}
    </div>
  );
};