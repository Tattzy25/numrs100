import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Save, AlertTriangle } from 'lucide-react';
import { ApiKeyStorage } from '../utils/storage';
import { validateApiKey } from '../utils/validation';
import { useToast } from './Toast';

interface ApiKeyManagerProps {
  onKeysUpdated?: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({ onKeysUpdated }) => {
  const [keys, setKeys] = useState({
    groq: '',
    deepl: '',
    elevenlabs: '',
    ably: '',
  });
  const [showKeys, setShowKeys] = useState({
    groq: false,
    deepl: false,
    elevenlabs: false,
    ably: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const toast = useToast();

  useEffect(() => {
    // Load saved API keys
    const savedKeys = ApiKeyStorage.load();
    setKeys(prev => ({ ...prev, ...savedKeys }));
  }, []);

  const handleKeyChange = (service: string, value: string) => {
    setKeys(prev => ({ ...prev, [service]: value }));
    
    // Clear error when user starts typing
    if (errors[service]) {
      setErrors(prev => ({ ...prev, [service]: '' }));
    }
  };

  const toggleKeyVisibility = (service: string) => {
    setShowKeys(prev => ({ ...prev, [service]: !prev[service] }));
  };

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate each key
    Object.entries(keys).forEach(([service, key]) => {
      if (key.trim()) {
        const error = validateApiKey(key, service.toUpperCase());
        if (error) {
          newErrors[service] = error;
        }
      }
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Save valid keys
      const keysToSave = Object.fromEntries(
        Object.entries(keys).filter(([, value]) => value.trim())
      );
      
      ApiKeyStorage.save(keysToSave);
      toast.success('API keys saved successfully');
      onKeysUpdated?.();
    } else {
      toast.error('Please fix the errors before saving');
    }
  };

  const services = [
    {
      key: 'groq',
      name: 'Groq (Speech-to-Text)',
      description: 'Required for voice transcription using Whisper',
      placeholder: 'gsk_...',
      required: true,
    },
    {
      key: 'deepl',
      name: 'DeepL (Translation)',
      description: 'Required for text translation',
      placeholder: 'your-deepl-api-key',
      required: true,
    },
    {
      key: 'elevenlabs',
      name: 'ElevenLabs (Text-to-Speech)',
      description: 'Required for voice synthesis and cloning',
      placeholder: 'your-elevenlabs-api-key',
      required: true,
    },
    {
      key: 'ably',
      name: 'Ably (Real-time Communication)',
      description: 'Required for multi-user sessions',
      placeholder: 'your-ably-api-key',
      required: false,
    },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/20 backdrop-blur-sm border border-purple-500/30 rounded-xl p-6 shadow-lg shadow-purple-500/20">
      <div className="flex items-center space-x-3 mb-6">
        <Key className="h-5 w-5 text-yellow-400" />
        <h3 className="text-lg font-semibold text-white">API Configuration</h3>
      </div>

      <div className="space-y-6">
        {services.map((service) => (
          <div key={service.key}>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                {service.name}
                {service.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              <button
                onClick={() => toggleKeyVisibility(service.key)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {showKeys[service.key] ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mb-2">{service.description}</p>
            
            <input
              type={showKeys[service.key] ? 'text' : 'password'}
              value={keys[service.key]}
              onChange={(e) => handleKeyChange(service.key, e.target.value)}
              placeholder={service.placeholder}
              className={`w-full bg-black border rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-colors ${
                errors[service.key]
                  ? 'border-red-500/50 focus:ring-red-400'
                  : 'border-purple-500/30 focus:ring-purple-400'
              }`}
            />
            
            {errors[service.key] && (
              <div className="flex items-center space-x-2 mt-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <p className="text-sm text-red-400">{errors[service.key]}</p>
              </div>
            )}
          </div>
        ))}

        <div className="pt-4 border-t border-purple-500/20">
          <button
            onClick={validateAndSave}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 px-4 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/30 flex items-center justify-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>Save API Keys</span>
          </button>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5" />
            <div className="text-sm text-yellow-200">
              <p className="font-medium mb-1">Security Notice</p>
              <p>
                API keys are stored locally in your browser and never sent to our servers. 
                Keep your keys secure and never share them publicly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};