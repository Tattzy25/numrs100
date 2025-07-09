import { RECORDING_LIMITS, ERROR_MESSAGES } from './constants';

export const validateAudioDuration = (duration: number): string | null => {
  if (duration < RECORDING_LIMITS.MIN_DURATION) {
    return ERROR_MESSAGES.RECORDING_TOO_SHORT;
  }
  if (duration > RECORDING_LIMITS.MAX_DURATION) {
    return ERROR_MESSAGES.RECORDING_TOO_LONG;
  }
  return null;
};

export const validateVoiceCloneDuration = (duration: number): string | null => {
  if (duration < RECORDING_LIMITS.VOICE_CLONE_MIN_DURATION) {
    return `Voice cloning requires at least ${RECORDING_LIMITS.VOICE_CLONE_MIN_DURATION} seconds of audio.`;
  }
  return null;
};

export const validateRoomCode = (code: string): string | null => {
  if (!code || code.length !== 6) {
    return 'Room code must be exactly 6 characters long.';
  }
  if (!/^[A-Z0-9]+$/.test(code)) {
    return 'Room code can only contain letters and numbers.';
  }
  return null;
};

export const validateApiKey = (key: string, service: string): string | null => {
  if (!key || key.trim().length === 0) {
    return `${service} API key is required.`;
  }
  if (key.length < 10) {
    return `${service} API key appears to be invalid.`;
  }
  return null;
};

export const validateVoiceName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Voice name is required.';
  }
  if (name.length > 50) {
    return 'Voice name must be 50 characters or less.';
  }
  if (!/^[a-zA-Z0-9\s\-_]+$/.test(name)) {
    return 'Voice name can only contain letters, numbers, spaces, hyphens, and underscores.';
  }
  return null;
};

export const validateFileType = (file: File, allowedTypes: string[]): string | null => {
  if (!allowedTypes.includes(file.type)) {
    return `File type ${file.type} is not supported. Allowed types: ${allowedTypes.join(', ')}.`;
  }
  return null;
};

export const validateFileSize = (file: File, maxSizeMB: number): string | null => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
  }
  return null;
};

export const isBrowserSupported = (): boolean => {
  return !!(
    navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia &&
    window.MediaRecorder &&
    window.AudioContext
  );
};

export const validateBrowserSupport = (): string | null => {
  if (!isBrowserSupported()) {
    return ERROR_MESSAGES.UNSUPPORTED_BROWSER;
  }
  return null;
};