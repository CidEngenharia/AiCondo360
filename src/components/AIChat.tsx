import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Bot, User, Sparkles } from 'lucide-react';
import { getAIResponse } from '../services/aiService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  isTyping?: boolean;
}

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const AIChat: React.FC<AIChatProps> = ({ isOpen, onClose, userName }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: `Olá ${userName}! Sou o assistente inteligente do AiCondo360. Como posso te ajudar com o condomínio hoje?`,
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    // AI typing state
    const typingMessage: Message = {
      id: 'typing',
      text: '...',
      sender: 'ai',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const resultText = await getAIResponse(currentInput, userName);
      
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      const aiResponse: Message = {
        id: Date.now().toString(),
        text: resultText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== 'typing'));
      const errorMessage: Message = {
        id: Date.now().toString(),
        text: "Desculpe, tive um problema ao processar sua solicitação.",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[400px] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl z-[101] border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-blue-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white">
                  <Bot size={24} />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Assistente IA</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                    <span className="text-white/70 text-[10px] font-medium">Online e Pronto</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-white/80 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                      {msg.sender === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                    </div>
                    <div className={`p-3 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-600 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
              <div className="relative">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Pergunte qualquer coisa..."
                  className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-2xl py-3 pl-4 pr-12 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 top-2 p-1.5 h-8 w-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-none"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
