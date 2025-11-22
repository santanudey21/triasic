import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, User, Loader2 } from 'lucide-react';
import { askSanta, ChatMessage } from '../services/geminiService';
import { Button } from './Button';

export const SantaAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Ho ho ho! I'm Santa, your Triasic assistant. Looking for movie recommendations or just want to chat? Ask away!" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Keep only last 10 messages for context to save tokens
    const historyContext = messages.slice(-10); 
    const aiResponseText = await askSanta(userMsg.text, historyContext);

    const aiMsg: ChatMessage = { role: 'model', text: aiResponseText };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto animate-fade-in pb-2">
      {/* Header */}
      <div className="flex items-center gap-3 p-6 border-b border-md-sys-outline/10">
        <div className="w-12 h-12 rounded-2xl bg-md-sys-primaryContainer flex items-center justify-center text-md-sys-onPrimaryContainer shadow-sm">
           <Sparkles size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-md-sys-onSurface">Santa AI</h2>
            <p className="text-sm text-md-sys-onSurfaceVariant">Ask anything about movies, shows, or life!</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 
                ${msg.role === 'user' ? 'bg-md-sys-secondary text-white' : 'bg-md-sys-primary text-white'}`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] sm:max-w-[70%] p-4 rounded-2xl text-sm sm:text-base leading-relaxed shadow-sm
                ${msg.role === 'user' 
                  ? 'bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer rounded-tr-none' 
                  : 'bg-white text-md-sys-onSurface rounded-tl-none border border-md-sys-outline/10'
                }`}
            >
                {msg.text.split('\n').map((line, i) => (
                    <p key={i} className="min-h-[1rem]">{line}</p>
                ))}
            </div>
          </div>
        ))}
        
        {isLoading && (
            <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-md-sys-primary text-white flex items-center justify-center shrink-0 mt-1">
                    <Bot size={16} />
                </div>
                <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-md-sys-outline/10 flex items-center gap-2">
                    <div className="w-2 h-2 bg-md-sys-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-md-sys-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-md-sys-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 sm:p-6 bg-transparent">
        <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Santa..."
                className="w-full bg-white/80 backdrop-blur-md border border-md-sys-outline/20 rounded-full py-4 pl-6 pr-14 shadow-lg focus:outline-none focus:ring-2 focus:ring-md-sys-primary/50 text-md-sys-onSurface transition-all"
                disabled={isLoading}
            />
            <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 top-2 p-2 bg-md-sys-primary text-md-sys-onPrimary rounded-full hover:bg-md-sys-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
        </form>
      </div>
    </div>
  );
};