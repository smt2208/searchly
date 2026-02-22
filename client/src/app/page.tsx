/**
 * Home Page Component - Main chat interface
 */

"use client"

import React from 'react';
import { Header, MessageArea, InputBar } from '@/components';
import { useChat } from '@/hooks/useChat';
import { UI_CONFIG } from '@/constants';

const Home: React.FC = () => {
  const {
    messages,
    currentMessage,
    messagesEndRef,
    setCurrentMessage,
    sendMessage,
    isLoading,
  } = useChat();

  return (
    <div className="flex justify-center bg-gray-100 min-h-screen py-8 px-4">
      <div className={`${UI_CONFIG.LAYOUT.CONTAINER_WIDTH} bg-white flex flex-col rounded-xl shadow-lg border border-gray-100 overflow-hidden ${UI_CONFIG.LAYOUT.CONTAINER_HEIGHT}`}>
        <Header />
        
        <MessageArea 
          messages={messages} 
          messagesEndRef={messagesEndRef} 
        />
        
        <InputBar 
          currentMessage={currentMessage} 
          setCurrentMessage={setCurrentMessage} 
          onSubmit={sendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default Home;
