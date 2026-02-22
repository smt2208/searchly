/**
 * MessageArea Component - Main chat messages display area
 */

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { TypingAnimation } from '@/components/ui/TypingAnimation';
import { SearchStages } from '@/components/chat/SearchStages';
import { DEFAULT_MESSAGES } from '@/constants';
import type { MessageAreaProps } from '@/types';

export const MessageArea: React.FC<MessageAreaProps> = ({ messages, messagesEndRef }) => {
  return (
    <div className="flex-grow overflow-y-auto bg-[#FCFCF8] border-b border-gray-100" style={{ minHeight: 0 }}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col gap-4 pb-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-5`}>
              <div className="flex flex-col max-w-md">
                
                {/* Search Status Display */}
                {!message.isUser && message.searchInfo && (
                  <SearchStages searchInfo={message.searchInfo} />
                )}

                {/* Message Content Container */}
                <div
                  className={`rounded-lg py-3 px-5 ${
                    message.isUser
                      ? 'bg-gradient-to-br from-[#5E507F] to-[#4A3F71] text-white rounded-br-none shadow-md'
                      : 'bg-[#F3F3EE] text-gray-800 border border-gray-200 rounded-bl-none shadow-sm'
                  }`}
                >
                  {message.isLoading ? (
                    <TypingAnimation />
                  ) : (
                    message.content ? (
                      message.isUser ? (
                        message.content
                      ) : (
                        <div className="prose-sm prose-gray max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 [&>h1]:text-lg [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-base [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:text-sm [&>h3]:font-bold [&>h3]:mb-1 [&>pre]:bg-gray-800 [&>pre]:text-gray-100 [&>pre]:rounded [&>pre]:p-3 [&>pre]:my-2 [&>pre]:overflow-x-auto [&>code]:bg-gray-200 [&>code]:px-1 [&>code]:rounded [&>code]:text-sm [&>blockquote]:border-l-4 [&>blockquote]:border-gray-300 [&>blockquote]:pl-3 [&>blockquote]:italic [&>a]:text-teal-600 [&>a]:underline">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <span className="text-gray-400 text-xs italic">
                        {DEFAULT_MESSAGES.LOADING}
                      </span>
                    )
                  )}
                </div>

              </div>
            </div>
          ))}
          {/* Sentinel element for auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </div>
    </div>
  );
};
