import axios from 'axios';
import { ApiError } from '../types';
import { Realtime } from 'ably';

// Error handling utility
const handleApiError = (error: any): ApiError => {
  if (error.response) {
    return {
      code: error.response.status.toString(),
      message: error.response.data?.message || 'API request failed',
      details: error.response.data,
    };
  } else if (error.request) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      details: error.request,
    };
  } else {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message || 'An unknown error occurred',
      details: error,
    };
  }
};

// Real-time Communication Service (Ably)
export class AblyRealtimeService {
  private apiKey: string;
  private client: any;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initialize(): Promise<void> {
    try {
      // Initialize Ably client
      this.client = new Realtime({ key: this.apiKey });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async createRoom(): Promise<string> {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    return roomCode;
  }

  async joinRoom(roomCode: string, onMessage: (data: any) => void): Promise<void> {
    try {
      const channel = this.client.channels.get(`translation-${roomCode}`);
      await channel.subscribe('translation', onMessage);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async sendMessage(roomCode: string, data: any): Promise<void> {
    try {
      const channel = this.client.channels.get(`translation-${roomCode}`);
      await channel.publish('translation', data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async leaveRoom(roomCode: string): Promise<void> {
    try {
      const channel = this.client.channels.get(`translation-${roomCode}`);
      await channel.unsubscribe();
    } catch (error) {
      throw handleApiError(error);
    }
  }
}
