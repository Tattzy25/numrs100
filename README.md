# Bridgit-AI Voice Flow

## Overview
Bridgit-AI is a production-grade, real-time voice translation and communication platform. It leverages browser-native audio streaming, Groq Whisper for speech-to-text, DeepL for translation, and ElevenLabs for text-to-speech, all orchestrated in a seamless loop with live room-based communication via Ably.

## Core Features
- **Live Microphone Streaming:** Uses WebRTC and getUserMedia for real-time audio chunking.
- **Speech-to-Text (STT):** Streams audio to Groq Whisper API for instant transcription.
- **Translation:** Feeds transcribed text to DeepL API for fast, accurate translation.
- **Text-to-Speech (TTS):** Sends translated text to ElevenLabs API, returning natural-sounding audio.
- **Playback:** Plays TTS audio in the user's chosen language immediately.
- **Host/Join Mode:** Publishes original/translated text to Ably for real-time, multi-user communication.
- **Responsive UI:** Modern, accessible, and high-performance front-end using React and TailwindCSS.

## Architecture
- **Frontend:** React, Vite, TailwindCSS
- **APIs:** Groq Whisper, DeepL, ElevenLabs, Ably
- **State Management:** Zustand
- **Build Tools:** Vite, pnpm

## Setup
1. Clone the repo:
   ```sh
   git clone https://github.com/Tattzy25/numrs100.git
   cd numbs100
   ```
2. Install dependencies:
   ```sh
   pnpm install
   ```
3. Configure environment variables in `.env` (see `.env.example` for required keys).
4. Start the dev server:
   ```sh
   pnpm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173).

## Production Rules
- No placeholders or toy code.
- No dead ends in the voice flow.
- All features must be production-ready.

## License
MIT