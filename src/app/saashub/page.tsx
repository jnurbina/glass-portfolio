'use client';

import { useState, useEffect, FormEvent } from 'react';
// import { v4 as uuidv4 } from 'uuid'; // REMOVED: Replaced with native crypto.randomUUID()

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export default function SaasHubPage() {
  const [sessionId, setSessionId] = useState<string>('');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [conversation, setConversation] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Generate a unique session ID when the component mounts
    // FIX: Use native browser API instead of uuid package
    setSessionId(crypto.randomUUID());
  }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      // FIX: Use native browser API instead of uuid package
      id: crypto.randomUUID(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setConversation((prevConversation) => [...prevConversation, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/saashub/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content, sessionId }),
      });

      if (!response.ok) {
        // Assuming the error response has a structure like { error: string }
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData?.error || 'Failed to get response from the assistant');
      }

      // Assuming the success response has a structure like { reply: string }
      const data = await response.json() as { reply?: string };
      if (typeof data.reply !== 'string') {
        throw new Error('Invalid response format from assistant');
      }
      const modelMessage: Message = {
        // FIX: Use native browser API instead of uuid package
        id: crypto.randomUUID(),
        role: 'model',
        content: data.reply,
        timestamp: new Date(),
      };
      setConversation((prevConversation) => [...prevConversation, modelMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        // FIX: Use native browser API instead of uuid package
        id: crypto.randomUUID(),
        role: 'model',
        content: error instanceof Error ? error.message : 'Sorry, something went wrong.',
        timestamp: new Date(),
      };
      setConversation((prevConversation) => [...prevConversation, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-center">Conversational AI</h1>
        {sessionId && <p className="text-xs text-center text-gray-500">Session ID: {sessionId}</p>}
      </header>

      <div className="flex-grow overflow-y-auto mb-4 p-4 border rounded-lg bg-gray-50">
        {conversation.map((msg) => (
          <div
            key={msg.id}
            className={`mb-3 p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user'
                ? 'bg-blue-500 text-white self-end ml-auto'
                : 'bg-gray-200 text-gray-800 self-start mr-auto'
            }`}
          >
            <p className="text-sm">{msg.content}</p>
            <p className="text-xs mt-1 opacity-70">
              {msg.timestamp.toLocaleTimeString()}
            </p>
          </div>
        ))}
        {isLoading && (
          <div className="p-3 rounded-lg bg-gray-200 text-gray-800 self-start mr-auto animate-pulse">
            <p className="text-sm">Assistant is thinking...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300"
          disabled={isLoading || !inputMessage.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}