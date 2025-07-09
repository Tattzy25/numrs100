import React from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../config/supportedLanguages';

interface LanguageSelectorProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ label, value, onChange }: LanguageSelectorProps) => {
  const selectedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === value) || SUPPORTED_LANGUAGES[0];

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
          title={label}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
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