/**
 * Type definitions for the Searchly application
 */

export interface SearchInfo {
  stages: string[];  // Array of search stages: ['searching', 'reading', 'writing']
  query: string;     // The actual search query that was executed
  urls: string[];    // URLs found during the search process
  error?: string;    // Optional error message
}

export interface Message {
  id: number;           // Unique identifier for the message
  content: string;      // The actual text content of the message
  isUser: boolean;      // Flag to distinguish between user messages and AI responses
  type: string;         // Message type (currently 'message', could be extended)
  isLoading?: boolean;  // Optional flag to show loading state for AI responses
  searchInfo?: SearchInfo; // Optional search metadata for AI responses
}

export interface ChatState {
  messages: Message[];
  currentMessage: string;
  checkpointId: string | null;
  isLoading: boolean;
}

export interface ApiResponse {
  type: 'checkpoint' | 'content' | 'search_start' | 'search_results' | 'search_error' | 'end';
  content?: string;
  checkpoint_id?: string;
  query?: string;
  urls?: string | string[];
  error?: string;
}

export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Component-specific prop interfaces
export interface MessageAreaProps {
  messages: Message[];
  messagesEndRef?: React.RefObject<HTMLDivElement>;
}

export interface InputBarProps {
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

export interface SearchStagesProps {
  searchInfo?: SearchInfo;
}

export interface TypingAnimationProps {
  className?: string;
}
