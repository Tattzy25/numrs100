// src/services/ablyService.ts

import * as Ably from 'ably';

const ABLY_API_KEY = import.meta.env.VITE_ABLY_API_KEY;

let ably: Ably.Realtime | null = null;
let channel: Ably.RealtimeChannel | null = null;

export const ablyService = {
  /**
   * Initializes the Ably Realtime client and connects to a channel.
   * @param channelName The name of the Ably channel to connect to.
   */
  initialize: (channelName: string) => {
    if (!ABLY_API_KEY) {
      console.error('Ably API Key is not defined.');
      return;
    }
    if (!ably) {
      ably = new Ably.Realtime({ key: ABLY_API_KEY });
      ably.connection.on('connected', () => {
        console.log('Ably connected!');
      });
      ably.connection.on('disconnected', () => {
        console.log('Ably disconnected!');
      });
      ably.connection.on('failed', () => {
        console.error('Ably connection failed!');
      });
    }
    if (ably && !channel) {
      channel = ably.channels.get(channelName);
    }
  },

  /**
   * Publishes a message to the connected Ably channel.
   * @param eventName The name of the event.
   * @param data The data to publish.
   */
  publish: (eventName: string, data: any) => {
    if (channel) {
      channel.publish(eventName, data);
    } else {
      console.warn('Ably channel not initialized. Cannot publish message.');
    }
  },

  /**
   * Subscribes to an event on the connected Ably channel.
   * @param eventName The name of the event to subscribe to.
   * @param callback The callback function to execute when the event is received.
   */
  subscribe: (eventName: string, callback: (message: Ably.Message) => void) => {
    if (channel) {
      channel.subscribe(eventName, callback);
    } else {
      console.warn('Ably channel not initialized. Cannot subscribe to messages.');
    }
  },

  /**
   * Unsubscribes from an event on the connected Ably channel.
   * @param eventName The name of the event to unsubscribe from.
   * @param callback The callback function that was used for subscription.
   */
  unsubscribe: (eventName: string, callback?: (message: Ably.Message) => void) => {
    if (channel) {
      if (callback) {
        channel.unsubscribe(eventName, callback);
      } else {
        channel.unsubscribe(eventName);
      }
    } else {
      console.warn('Ably channel not initialized. Cannot unsubscribe from messages.');
    }
  },

  /**
   * Disconnects from Ably and detaches the channel.
   */
  disconnect: () => {
    if (channel) {
      channel.detach();
      channel = null;
    }
    if (ably) {
      ably.close();
      ably = null;
    }
  },
};