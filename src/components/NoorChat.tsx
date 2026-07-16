import React, { useState, useEffect, useRef } from 'react';
import { Send, Heart } from 'lucide-react';
import { ChatMessage } from '../types';

interface NoorChatProps {
  userName: string;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onOpenBreathingSpace: () => void;
  onOpenCrisisResources: () => void;
  isTyping?: boolean;
}

export default function NoorChat({
  userName,
  chatMessages,
  onSendMessage,
  onOpenBreathingSpace,
  onOpenCrisisResources,
  isTyping = false
}: NoorChatProps) {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    onSendMessage(text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === "Try 1-Min Breathing Space" || suggestion === "Try Breathing Space") {
      onOpenBreathingSpace();
    } else if (suggestion === "View Crisis Resources") {
      onOpenCrisisResources();
    } else {
      onSendMessage(suggestion);
    }
  };

  // Get active suggestion chips from the very last bot message if available
  const getLastBotSuggestions = (): string[] => {
    const lastMessage = [...chatMessages].reverse().find(m => m.sender === 'noor');
    if (!lastMessage) return ["Try 1-Min Breathing Space", "Suggest a tiny routine", "Tell me a story"];
    
    if (lastMessage.suggestions && lastMessage.suggestions.length > 0) {
      return lastMessage.suggestions;
    }
    
    const text = lastMessage.text.toLowerCase();
    if (text.includes("exhausted") || text.includes("tired")) {
      return ["Try 1-Min Breathing Space", "Suggest a tiny rest action", "Just sit in quiet"];
    }
    if (text.includes("overwhelmed") || text.includes("stressed")) {
      return ["Try 1-Min Breathing Space", "Give me a micro-tip for overwhelm", "Let's pause and reset"];
    }
    if (text.includes("sad") || text.includes("lonely")) {
      return ["Give me a warm comfort tip", "Try 1-Min Breathing Space", "I want to share more"];
    }
    if (text.includes("anxious") || text.includes("panic")) {
      return ["Try 1-Min Breathing Space", "A grounding exercise", "Let's talk slowly"];
    }
    if (text.includes("angry") || text.includes("fire")) {
      return ["Vent a bit more", "Suggest a physical release", "Breathing Space"];
    }
    if (text.includes("numb") || text.includes("empty")) {
      return ["Gentle sensory tip", "Just rest in silence", "Breathing Space"];
    }
    return ["Try 1-Min Breathing Space", "Suggest a routine", "I'd like to share more"];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-cream max-w-lg mx-auto">
      {/* Mini Companion header */}
      <div className="bg-white px-5 py-4 border-b border-sage-200/60 flex items-center justify-between shadow-sm rounded-t-[2rem]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sage-50 border border-sage-100 flex items-center justify-center text-sage-600 relative">
            <Heart size={18} className="fill-sage-500/10 text-sage-500" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif font-bold text-ink text-sm">Noor</span>
              <span className="text-[9px] font-bold text-sage-600 bg-sage-50 border border-sage-100 px-1.5 py-0.2 rounded-full">Companion</span>
            </div>
            <span className="text-[11px] text-ink-light font-semibold">Listening gently without judgment</span>
          </div>
        </div>

        <span className="text-[9px] text-ink-light/70 font-bold tracking-widest uppercase">SECURE & LOCAL</span>
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-5 space-y-4 custom-scrollbar"
      >
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';
          if (msg.sender === 'system') {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="text-[10px] font-semibold bg-cream border border-sage-200/50 text-ink-light px-3 py-1 rounded-full">
                  {msg.text}
                </span>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                isUser 
                  ? 'bg-sage-500 text-white rounded-tr-sm shadow-organic' 
                  : 'bg-white text-ink border border-sage-200/60 rounded-tl-sm shadow-organic'
              }`}>
                {!isUser && (
                  <div className="text-[10px] font-bold text-sage-600 uppercase tracking-widest mb-1.5">
                    Noor
                  </div>
                )}
                <p className="whitespace-pre-line font-medium">{msg.text}</p>
                <div className={`text-[9px] mt-1.5 text-right font-semibold ${
                  isUser ? 'text-white/70' : 'text-ink-light/60'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-sage-200/60 rounded-2xl p-4 text-sm shadow-organic rounded-tl-sm max-w-[85%]">
              <span className="text-[10px] font-bold text-sage-600 uppercase tracking-widest mb-1 block">
                Noor
              </span>
              <div className="flex items-center gap-1.5 py-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-sage-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Chips */}
      <div className="px-4 py-2 flex gap-1.5 overflow-x-auto whitespace-nowrap bg-gradient-to-t from-cream to-transparent custom-scrollbar">
        {getLastBotSuggestions().map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestionClick(chip)}
            className="bg-white border border-sage-200/60 hover:border-sage-400 hover:bg-sage-50 active:scale-95 text-xs text-sage-700 font-bold px-3 py-1.5 rounded-full transition-all cursor-pointer shadow-sm"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-4 bg-white border-t border-sage-200/60 rounded-b-[2rem]">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            id="chat-text-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Share what is resting on your heart today..."
            className="flex-1 bg-cream/40 border border-sage-200 focus:border-sage-400 focus:bg-white rounded-2xl px-4 py-3 text-sm text-ink placeholder-ink-light/50 outline-none transition-all font-medium"
          />
          <button
            id="send-chat-btn"
            type="submit"
            disabled={!input.trim()}
            className="bg-sage-500 hover:bg-sage-600 disabled:bg-cream disabled:text-ink-light/30 disabled:border-sage-100 disabled:shadow-none text-white p-3 rounded-2xl shadow-lg shadow-sage-500/10 hover:shadow-organic transition-all flex items-center justify-center cursor-pointer border border-transparent"
          >
            <Send size={18} />
          </button>
        </form>
        <p className="text-[10px] text-ink-light/70 text-center mt-2.5 font-semibold">
          Noor responds with empathetic baseline listening. If you are in high distress, type 'help' or view support.
        </p>
      </div>
    </div>
  );
}
