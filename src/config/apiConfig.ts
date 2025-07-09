export const API_CONFIG = {
  GROQ_API_URL: import.meta.env.VITE_GROQ_API_URL || 'https://api.groq.com/openai/v1',
  DEEPL_API_URL: import.meta.env.VITE_DEEPL_API_URL || 'https://api-free.deepl.com/v2',
  ELEVENLABS_API_URL: import.meta.env.VITE_ELEVENLABS_API_URL || 'https://api.elevenlabs.io/v1',
  ABLY_API_URL: import.meta.env.VITE_ABLY_API_URL || 'https://rest.ably.io',
};

export const API_KEYS = {
  GROQ_API_KEY: import.meta.env.VITE_GROQ_API_KEY,
  DEEPL_API_KEY: import.meta.env.VITE_DEEPL_API_KEY,
  ELEVENLABS_API_KEY: import.meta.env.VITE_ELEVENLABS_API_KEY,
  ABLY_API_KEY: import.meta.env.VITE_ABLY_API_KEY,
};
