import React, { useEffect, useState } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { DeepLTranslationService } from '../services/deeplTranslationService';

interface LanguageSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  apiKey?: string;
  type?: 'source' | 'target';
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ label, value, onChange, apiKey, type = 'target' }) => {
  const [languages, setLanguages] = useState<Array<{ code: string; name: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLanguages = async () => {
      if (!apiKey) {
        setError('DeepL API key missing');
        setLoading(false);
        return;
      }
      try {
        const service = new DeepLTranslationService(apiKey);
        const langs = await service.getSupportedLanguages(type);
        setLanguages(langs);
      } catch (err: any) {
        setError(err.message || 'Failed to load languages');
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, [apiKey, type]);

  const selectedLanguage = languages.find(lang => lang.code === value) || languages[0];

  return (
    <div className="relative w-40">
      <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center space-x-2">
        <Globe className="h-4 w-4" />
        <span>{label}</span>
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black border border-purple-500/30 rounded-xl px-3 py-2.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400/50 cursor-pointer hover:bg-gray-900/60 transition-all duration-300 shadow-lg shadow-purple-500/10 text-sm"
          disabled={loading || !!error}
          title={label}
        >
          {loading && <option>Loading...</option>}
          {error && <option>{error}</option>}
          {!loading && !error && languages.map((lang) => (
            <option key={lang.code} value={lang.code} className="bg-black text-white">
              {lang.name}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown className="h-5 w-5 text-purple-400" />
        </div>
      </div>
      <div className="mt-2 text-xs text-gray-400 flex items-center space-x-2">
        <span>{selectedLanguage ? selectedLanguage.name : ''}</span>
      </div>
    </div>
  );
};