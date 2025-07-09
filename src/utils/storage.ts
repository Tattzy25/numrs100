import { STORAGE_KEYS } from './constants';

export class SecureStorage {
  private static encrypt(data: string): string {
    // Simple base64 encoding for demo - use proper encryption in production
    return btoa(data);
  }

  private static decrypt(data: string): string {
    try {
      return atob(data);
    } catch {
      return data; // Fallback for unencrypted data
    }
  }

  static setItem(key: string, value: any): void {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = this.encrypt(serialized);
      localStorage.setItem(key, encrypted);
    } catch (error) {
      console.error('Failed to save to storage:', error);
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return defaultValue;
      
      const decrypted = this.decrypt(encrypted);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Failed to read from storage:', error);
      return defaultValue;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from storage:', error);
    }
  }

  static clear(): void {
    try {
      // Only clear Bridgit-AI related items
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  }
}

export const ApiKeyStorage = {
  save: (keys: Record<string, string>) => {
    SecureStorage.setItem(STORAGE_KEYS.API_KEYS, keys);
  },
  
  load: (): Record<string, string> => {
    return SecureStorage.getItem(STORAGE_KEYS.API_KEYS, {});
  },
  
  get: (service: string): string | null => {
    const keys = ApiKeyStorage.load();
    return keys[service] || null;
  },
  
  set: (service: string, key: string) => {
    const keys = ApiKeyStorage.load();
    keys[service] = key;
    ApiKeyStorage.save(keys);
  },
  
  remove: (service: string) => {
    const keys = ApiKeyStorage.load();
    delete keys[service];
    ApiKeyStorage.save(keys);
  },
  
  clear: () => {
    SecureStorage.removeItem(STORAGE_KEYS.API_KEYS);
  },
};