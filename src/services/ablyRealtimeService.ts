import { ApiError } from '../types';

const ABLY_API_URL = 'https://rest.ably.io';

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

export interface AblyMessage {
  type: 'text' | 'audio';
  payload: any;
  sender: string;
  timestamp: number;
}

export class AblyRealtimeService {
  private apiKey: string;
  private client: any;
  private participants: Set<string> = new Set();

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initialize(): Promise<void> {
    try {
      const { Realtime } = await import('ably');
      this.client = new Realtime({ key: this.apiKey });
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async createRoom(): Promise<string> {
    try {
      // Generate a cryptographically secure random string for the room code
      let roomCode = '';
      let exists = true;
      const maxAttempts = 5;
      let attempts = 0;
      while (exists && attempts < maxAttempts) {
        const array = new Uint8Array(6);
        window.crypto.getRandomValues(array);
        roomCode = Array.from(array, b => ('0' + b.toString(16)).slice(-2)).join('').toUpperCase();
        // Check if channel exists by querying Ably REST API for presence
        const response = await fetch(`${ABLY_API_URL}/channels/translation-${roomCode}/presence`, {
          headers: {
            'Authorization': `Basic ${btoa(this.apiKey + ':')}`,
            'Accept': 'application/json'
          }
        });
        if (response.status === 404) {
          exists = false;
        } else if (response.ok) {
          const data = await response.json();
          exists = Array.isArray(data.items) && data.items.length > 0;
        } else {
          throw new Error('Failed to check Ably channel existence');
        }
        attempts++;
      }
      if (exists) {
        throw new Error('Could not generate a unique room code after several attempts');
      }
      return roomCode;
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async joinRoom(roomCode: string, onMessage: (data: AblyMessage) => void, participantId: string): Promise<void> {
    try {
      const channel = this.client.channels.get(`translation-${roomCode}`);
      await channel.subscribe('translation', (msg: any) => {
        if (msg.data && msg.data.type && msg.data.sender) {
          this.participants.add(msg.data.sender);
        }
        onMessage(msg.data);
      });
      // Announce join
      await channel.publish('translation', {
        type: 'participant-join',
        payload: null,
        sender: participantId,
        timestamp: Date.now(),
      });
      this.participants.add(participantId);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async sendMessage(roomCode: string, data: AblyMessage): Promise<void> {
    try {
      const channel = this.client.channels.get(`translation-${roomCode}`);
      await channel.publish('translation', data);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  async leaveRoom(roomCode: string, participantId: string): Promise<void> {
    try {
      const channel = this.client.channels.get(`translation-${roomCode}`);
      await channel.publish('translation', {
        type: 'participant-leave',
        payload: null,
        sender: participantId,
        timestamp: Date.now(),
      });
      await channel.unsubscribe();
      this.participants.delete(participantId);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  getParticipants(): string[] {
    return Array.from(this.participants);
  }
}