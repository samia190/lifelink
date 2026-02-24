'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, AlertTriangle } from 'lucide-react';
import { useChatStore } from '@/lib/store';
import { chatAPI } from '@/lib/api';

export default function AIChatWidget() {
  const { isOpen, messages, toggle, addMessage, conversationId, setConversationId } = useChatStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setIsLoading(true);

    try {
      const { data } = await chatAPI.send({
        message: userMessage,
        conversationId,
      });

      if (data.data.conversationId) {
        setConversationId(data.data.conversationId);
      }

      addMessage({ role: 'assistant', content: data.data.response });
    } catch {
      addMessage({
        role: 'assistant',
        content: 'I apologize, I\'m having trouble connecting. If you\'re in crisis, please call our helpline at +254 700 000 000.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button — CSS transitions only */}
      {!isOpen && (
        <button
          onClick={toggle}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-navy-700 to-navy-800 text-white shadow-xl shadow-navy-700/30 flex items-center justify-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-pulse-gold"
          aria-label="Open AI Chat"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel — CSS transitions only */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl border border-charcoal-100 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-navy-800 to-navy-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gold-400/20 flex items-center justify-center">
                <Bot size={20} className="text-gold-400" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">LifeLink AI Assistant</h3>
                <p className="text-navy-300 text-xs">Always here to help</p>
              </div>
            </div>
            <button onClick={toggle} className="p-1 hover:bg-navy-700 rounded-lg transition-colors" aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Bot size={40} className="mx-auto text-navy-300 mb-3" />
                <h4 className="font-semibold text-navy-700 mb-2">Welcome to LifeLink</h4>
                <p className="text-charcoal-500 text-sm mb-4">
                  I&apos;m your AI mental health assistant. I can help with:
                </p>
                <div className="space-y-2 text-left max-w-xs mx-auto">
                  {[
                    'Finding the right service for you',
                    'Understanding our therapy options',
                    'Booking guidance',
                    'General mental health information',
                  ].map((item, i) => (
                    <p key={i} className="text-xs text-charcoal-500 flex items-start gap-2">
                      <span className="text-gold-500 mt-0.5">•</span> {item}
                    </p>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-xs text-amber-700 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    In a crisis? Call <a href="tel:+254700000000" className="font-bold underline">+254 700 000 000</a>
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-navy-700 text-white rounded-br-md'
                    : 'bg-charcoal-50 text-charcoal-800 rounded-bl-md'
                }`}>
                  <div className="flex items-center gap-2 mb-1">
                    {msg.role === 'assistant' ? <Bot size={12} className="text-gold-500" /> : <User size={12} />}
                    <span className="text-[10px] opacity-60">
                      {msg.role === 'user' ? 'You' : 'LifeLink AI'}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-charcoal-50 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-navy-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-charcoal-100">
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 rounded-xl border border-charcoal-200 bg-charcoal-50 text-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-xl bg-navy-700 text-white flex items-center justify-center hover:bg-navy-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
            <p className="text-[10px] text-charcoal-400 mt-2 text-center">
              AI responses are for guidance only. Not a substitute for professional advice.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
