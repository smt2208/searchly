/**
 * Custom hook for managing chat functionality
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { chatApiService } from '@/services/chatApi';
import { isValidMessage } from '@/utils';
import { DEFAULT_MESSAGES, SEARCH_STAGES, API_RESPONSE_TYPES } from '@/constants';
import type { Message, SearchInfo, ChatState, ApiResponse } from '@/types';

export const useChat = () => {
  const [chatState, setChatState] = useState<ChatState>({
    messages: [
      {
        id: 1,
        content: DEFAULT_MESSAGES.WELCOME,
        isUser: false,
        type: 'message'
      }
    ],
    currentMessage: '',
    checkpointId: null,
    isLoading: false,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Use a ref counter for message IDs to avoid stale closure issues
  const nextMessageIdRef = useRef(2); // Start after welcome message (id: 1)

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatState.messages]);

  const updateMessages = useCallback((updater: (prev: Message[]) => Message[]) => {
    setChatState(prev => ({
      ...prev,
      messages: updater(prev.messages)
    }));
  }, []);

  const setCurrentMessage = useCallback((message: string) => {
    setChatState(prev => ({
      ...prev,
      currentMessage: message
    }));
  }, []);

  const setCheckpointId = useCallback((id: string) => {
    setChatState(prev => ({
      ...prev,
      checkpointId: id
    }));
  }, []);

  const setIsLoading = useCallback((loading: boolean) => {
    setChatState(prev => ({
      ...prev,
      isLoading: loading
    }));
  }, []);

  const addUserMessage = useCallback((content: string): number => {
    const newMessageId = nextMessageIdRef.current;
    nextMessageIdRef.current += 2; // Reserve next ID for AI response

    updateMessages(prev => [
      ...prev,
      {
        id: newMessageId,
        content,
        isUser: true,
        type: 'message'
      }
    ]);

    return newMessageId;
  }, [updateMessages]);

  const addAiPlaceholder = useCallback((id: number) => {
    updateMessages(prev => [
      ...prev,
      {
        id,
        content: '',
        isUser: false,
        type: 'message',
        isLoading: true,
        searchInfo: {
          stages: [],
          query: '',
          urls: []
        }
      }
    ]);
  }, [updateMessages]);

  const updateAiMessage = useCallback((
    id: number, 
    updates: Partial<Message>
  ) => {
    updateMessages(prev =>
      prev.map(msg =>
        msg.id === id ? { ...msg, ...updates } : msg
      )
    );
  }, [updateMessages]);

  const handleApiResponse = useCallback((
    data: ApiResponse,
    aiResponseId: number,
    streamedContent: { current: string },
    searchData: { current: SearchInfo | null }
  ) => {
    switch (data.type) {
      case API_RESPONSE_TYPES.CHECKPOINT:
        if (data.checkpoint_id) {
          setCheckpointId(data.checkpoint_id);
        }
        break;

      case API_RESPONSE_TYPES.CONTENT:
        if (data.content) {
          streamedContent.current += data.content;
          updateAiMessage(aiResponseId, {
            content: streamedContent.current,
            isLoading: false
          });
        }
        break;

      case API_RESPONSE_TYPES.SEARCH_START:
        if (data.query) {
          const newSearchInfo: SearchInfo = {
            stages: [SEARCH_STAGES.SEARCHING],
            query: data.query,
            urls: []
          };
          searchData.current = newSearchInfo;
          updateAiMessage(aiResponseId, {
            searchInfo: newSearchInfo,
            isLoading: false
          });
        }
        break;

      case API_RESPONSE_TYPES.SEARCH_RESULTS:
        if (searchData.current) {
          const urls = data.urls
            ? (typeof data.urls === 'string' ? JSON.parse(data.urls) : data.urls)
            : [];
          
          const newSearchInfo: SearchInfo = {
            ...searchData.current,
            stages: [...searchData.current.stages, SEARCH_STAGES.READING],
            urls
          };
          searchData.current = newSearchInfo;
          updateAiMessage(aiResponseId, {
            searchInfo: newSearchInfo
          });
        }
        break;

      case API_RESPONSE_TYPES.SEARCH_ERROR:
        if (searchData.current) {
          const newSearchInfo: SearchInfo = {
            ...searchData.current,
            stages: [...searchData.current.stages, SEARCH_STAGES.ERROR],
            error: data.error || 'Search failed'
          };
          searchData.current = newSearchInfo;
          updateAiMessage(aiResponseId, {
            searchInfo: newSearchInfo
          });
        }
        break;

      case API_RESPONSE_TYPES.END:
        if (searchData.current) {
          const finalSearchInfo: SearchInfo = {
            ...searchData.current,
            stages: [...searchData.current.stages, SEARCH_STAGES.WRITING]
          };
          updateAiMessage(aiResponseId, {
            searchInfo: finalSearchInfo,
            isLoading: false
          });
        }
        break;
    }
  }, [setCheckpointId, updateAiMessage]);

  const sendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidMessage(chatState.currentMessage) || chatState.isLoading) {
      return;
    }

    const userInput = chatState.currentMessage;
    const newMessageId = addUserMessage(userInput);
    setCurrentMessage('');
    setIsLoading(true);

    const aiResponseId = newMessageId + 1;
    addAiPlaceholder(aiResponseId);

    const streamedContent = { current: '' };
    const searchData = { current: null as SearchInfo | null };

    try {
      await chatApiService.streamChat(
        userInput,
        chatState.checkpointId,
        {
          onData: (data) => {
            handleApiResponse(data, aiResponseId, streamedContent, searchData);
          },
          onError: (errorMessage) => {
            if (!streamedContent.current) {
              updateAiMessage(aiResponseId, {
                content: errorMessage,
                isLoading: false
              });
            }
            setIsLoading(false);
          },
          onComplete: () => {
            setIsLoading(false);
          }
        }
      );
    } catch (error) {
      console.error('Error setting up stream:', error);
      updateAiMessage(aiResponseId, {
        content: DEFAULT_MESSAGES.CONNECTION_ERROR,
        isLoading: false
      });
      setIsLoading(false);
    }
  }, [
    chatState.currentMessage,
    chatState.checkpointId,
    chatState.isLoading,
    addUserMessage,
    addAiPlaceholder,
    handleApiResponse,
    updateAiMessage,
    setCurrentMessage,
    setIsLoading
  ]);

  return {
    messages: chatState.messages,
    currentMessage: chatState.currentMessage,
    messagesEndRef,
    setCurrentMessage,
    sendMessage,
    isLoading: chatState.isLoading,
  };
};
