/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELEVEN_LABS_API_KEY: string;
  readonly VITE_GOOGLE_STT_API_KEY: string;
  readonly VITE_GROQ_API_KEY: string;
  readonly VITE_DEEPL_API_KEY: string;
  readonly VITE_ABLY_API_KEY: string;
  readonly VITE_DEEPL_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}