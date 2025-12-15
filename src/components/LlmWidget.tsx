"use client";

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPane } from './GlassPane';
import { fadeVariants, glassReveal } from './Animations';

interface LlmWidgetProps {
  placeholder?: string;
}

interface LlmResponse {
  response: string;
}

export const LlmWidget: React.FC<LlmWidgetProps> = ({
  placeholder = "Ask me anything about my services..."
}) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [chatHistory, setChatHistory] = useState<{query: string, response: string}[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;
    
    setIsLoading(true);
    setIsExpanded(true);
    
    try {
      const response = await fetch('/api/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: query.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json() as LlmResponse;
      setChatHistory([...chatHistory, {query: query, response: data.response}]);
      setQuery('');
    } catch (error) {
      console.error('Error fetching LLM response:', error);
      setChatHistory([
        ...chatHistory, 
        {
          query: query, 
          response: "Sorry, I couldn't process your request at the moment. Please try again later."
        }
      ]);
      setQuery('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      ref={containerRef}
      variants={fadeVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={6} // Higher delay for this component
      className="w-full mt-6"
    >
      <GlassPane 
        className="w-full"
        glowColor="rgba(130, 255, 200, 0.7)"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-white/90 font-medium">AI Assistant</h3>
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-white/70 hover:text-white/90 transition-colors"
            >
              {isExpanded ? 'Minimize' : 'Expand'}
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button
                type="submit"
                disabled={isLoading || !query.trim()}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Thinking...' : 'Ask'}
              </button>
            </div>
          </form>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="mt-4 overflow-hidden"
              >
                {chatHistory.length > 0 ? (
                  <div className="space-y-4">
                    {chatHistory.map((chat, index) => (
                      <motion.div 
                        key={index}
                        variants={glassReveal}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="space-y-2"
                      >
                        <div className="bg-white/20 rounded-lg p-3 text-white/90">
                          <p className="text-sm font-medium">You asked:</p>
                          <p>{chat.query}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-3 text-white/90">
                          <p className="text-sm font-medium">Response:</p>
                          <p>{chat.response}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/10 rounded-lg p-4 text-white/70 text-center">
                    Ask me anything about my services and experience!
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          {isLoading && (
            <div className="mt-4 flex justify-center">
              <div className="flex gap-2">
                <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '600ms' }} />
              </div>
            </div>
          )}
        </div>
      </GlassPane>
    </motion.div>
  );
};
