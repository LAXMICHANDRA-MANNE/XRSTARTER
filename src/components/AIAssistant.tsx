import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Bot, 
  Volume2, 
  VolumeX,
  Sparkles,
  Lightbulb,
  BookOpen,
  Calculator
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { ChatMessage } from '../types';

const AIAssistant: React.FC = () => {
  const { 
    chatMessages, 
    addChatMessage, 
    isAIAssistantOpen, 
    setIsAIAssistantOpen 
  } = useApp();
  
  const [inputMessage, setInputMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickActions = [
    {
      icon: Lightbulb,
      label: 'Explain this concept',
      prompt: 'Can you explain this concept in simple terms?',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Calculator,
      label: 'Solve this problem',
      prompt: 'Help me solve this step by step',
      color: 'from-blue-500 to-purple-500',
    },
    {
      icon: BookOpen,
      label: 'Related topics',
      prompt: 'What other topics are related to this?',
      color: 'from-green-500 to-teal-500',
    },
    {
      icon: Sparkles,
      label: 'Fun fact',
      prompt: 'Tell me an interesting fact about this topic',
      color: 'from-pink-500 to-rose-500',
    },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    if (isAIAssistantOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAIAssistantOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (message: string = inputMessage) => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };

    addChatMessage(userMessage);
    setInputMessage('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: generateAIResponse(message),
        timestamp: new Date().toISOString(),
      };
      addChatMessage(aiResponse);
      setIsTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    // Simple response generation based on keywords
    const message = userMessage.toLowerCase();
    
    if (message.includes('quantum')) {
      return "Quantum mechanics is fascinating! It deals with the behavior of matter and energy at the smallest scales. Key concepts include superposition, entanglement, and wave-particle duality. Would you like me to explain any of these concepts in more detail?";
    }
    
    if (message.includes('chemistry') || message.includes('molecule')) {
      return "Chemistry is all about understanding how atoms and molecules interact! Molecular bonds, chemical reactions, and the periodic table are fundamental concepts. What specific area of chemistry interests you most?";
    }
    
    if (message.includes('biology') || message.includes('cell')) {
      return "Biology explores the incredible world of living organisms! From cellular processes to ecosystems, there's so much to discover. Are you interested in learning about a specific biological system or process?";
    }
    
    if (message.includes('help') || message.includes('explain')) {
      return "I'm here to help you understand complex scientific concepts! You can ask me about physics, chemistry, biology, mathematics, or any other topic. I can explain concepts, solve problems, or suggest related learning materials.";
    }
    
    return "That's an interesting question! I'd be happy to help you explore this topic further. Could you provide more specific details about what you'd like to learn or understand better?";
  };

  const handleVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      if (isListening) {
        recognition.stop();
        setIsListening(false);
      } else {
        recognition.start();
        setIsListening(true);
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage(transcript);
          setIsListening(false);
        };
        
        recognition.onerror = () => {
          setIsListening(false);
        };
        
        recognition.onend = () => {
          setIsListening(false);
        };
      }
    }
  };

  const handleTextToSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking) {
        speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <AnimatePresence>
      {isAIAssistantOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setIsAIAssistantOpen(false)}
          />

          {/* Assistant Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 400 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-500 to-secondary-500">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Irma AI</h3>
                  <p className="text-sm text-white/80">Your Learning Assistant</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsAIAssistantOpen(false)}
                className="p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  }`}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    {message.type === 'assistant' && (
                      <div className="flex items-center justify-end mt-2 space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleTextToSpeech(message.content)}
                          className="p-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                        >
                          {isSpeaking ? (
                            <VolumeX className="w-3 h-3" />
                          ) : (
                            <Volume2 className="w-3 h-3" />
                          )}
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSendMessage(action.prompt)}
                      className={`p-3 rounded-xl bg-gradient-to-r ${action.color} text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-200`}
                    >
                      <Icon className="w-4 h-4 mx-auto mb-1" />
                      <span className="block">{action.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask me anything about science..."
                    className="w-full px-4 py-3 pr-12 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all duration-200"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleVoiceInput}
                    className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors duration-200 ${
                      isListening
                        ? 'text-red-500 bg-red-100 dark:bg-red-900/20'
                        : 'text-gray-400 hover:text-primary-500'
                    }`}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </motion.button>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Send className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIAssistant;