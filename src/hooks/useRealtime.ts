import { useState, useEffect, useCallback, useRef } from 'react';
import { AblyRealtimeService } from '../services/ablyRealtimeService';
import { useAppStore } from '../store/useAppStore';

interface UseRealtimeOptions {
  ablyApiKey?: string;
}

export const useRealtime = (options: UseRealtimeOptions = {}) => {
  const [roomCode, setRoomCode] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<string[]>([]);
  
  const { setError, setConnectionStatus } = useAppStore();
  
  const realtimeService = useRef<AblyRealtimeService | null>(null);

  useEffect(() => {
    if (options.ablyApiKey) {
      realtimeService.current = new AblyRealtimeService(options.ablyApiKey);
      realtimeService.current.initialize().catch((err) => setError(err.message));
    }
  }, [options.ablyApiKey, setError]);

  const createRoom = useCallback(async () => {
    if (!realtimeService.current) return;
    const code = await realtimeService.current.createRoom();
    setRoomCode(code);
    setIsConnected(true);
    setConnectionStatus('connected');
  }, [setConnectionStatus]);

  const joinRoom = useCallback(async (code: string, onMessage: (data: any) => void) => {
    if (!realtimeService.current) return;
    await realtimeService.current.joinRoom(code, onMessage);
    setRoomCode(code);
    setIsConnected(true);
    setConnectionStatus('connected');
  }, [setConnectionStatus]);

  const sendMessage = useCallback(async (data: any) => {
    if (!realtimeService.current || !roomCode) return;
    await realtimeService.current.sendMessage(roomCode, data);
  }, [roomCode]);

  const leaveRoom = useCallback(async () => {
    if (!realtimeService.current || !roomCode) return;
    await realtimeService.current.leaveRoom(roomCode);
    setIsConnected(false);
    setConnectionStatus('disconnected');
    setRoomCode('');
  }, [roomCode, setConnectionStatus]);

  return {
    roomCode,
    isConnected,
    participants,
    createRoom,
    joinRoom,
    sendMessage,
    leaveRoom,
  };
};