/**
 * API service for handling chat interactions
 */

import { API_CONFIG, API_RESPONSE_TYPES } from '@/constants';
import { safeJsonParse } from '@/utils';
import type { ApiResponse } from '@/types';

export interface StreamCallbacks {
  onData: (data: ApiResponse) => void;
  onError: (message: string) => void;
  onComplete: () => void;
}

export class ChatApiService {
  private static instance: ChatApiService;

  private constructor() {}

  static getInstance(): ChatApiService {
    if (!ChatApiService.instance) {
      ChatApiService.instance = new ChatApiService();
    }
    return ChatApiService.instance;
  }

  /**
   * Streams chat responses from the server using fetch with SSE parsing
   * Uses POST so message length is not limited by URL constraints
   * @param message - User's message
   * @param checkpointId - Optional checkpoint ID for conversation continuity
   * @param callbacks - Callbacks for stream events
   * @returns AbortController to cancel the stream
   */
  async streamChat(
    message: string,
    checkpointId: string | null,
    callbacks: StreamCallbacks
  ): Promise<AbortController> {
    const controller = new AbortController();

    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT_STREAM}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          checkpoint_id: checkpointId || undefined,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            const jsonStr = trimmed.slice(6);
            if (jsonStr) {
              const data = safeJsonParse<ApiResponse>(jsonStr);
              if (data && this.isValidResponseType(data)) {
                callbacks.onData(data);
              }
            }
          }
        }
      }

      callbacks.onComplete();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return controller;
      }
      console.error('Stream error:', error);
      callbacks.onError('Connection error occurred. Please try again.');
    }

    return controller;
  }

  /**
   * Validates API response type
   * @param response - API response to validate
   * @returns Boolean indicating if response type is valid
   */
  isValidResponseType(response: ApiResponse): boolean {
    return Object.values(API_RESPONSE_TYPES).includes(response.type as any);
  }
}

// Export singleton instance
export const chatApiService = ChatApiService.getInstance();
