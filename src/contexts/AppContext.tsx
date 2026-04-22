import React, { createContext, useContext, useState } from 'react';
import { User, Lab, ChatMessage } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  labs: Lab[];
  setLabs: (labs: Lab[]) => void;
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  isAIAssistantOpen: boolean;
  setIsAIAssistantOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  React.useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(data => {
         if (!data.error) {
             setUser({
                 id: data.id,
                 name: data.name,
                 email: data.email,
                 avatar: data.avatar,
                 totalXP: data.total_xp,
                 level: data.level,
                 badges: [],
                 completedLabs: ['1', '3', '5'],
                 currentStreak: data.current_streak,
                 joinedDate: '2025-01-01',
             });
         }
      })
      .catch(console.error);
  }, []);

  const [labs, setLabs] = useState<Lab[]>([
    {
      id: '1',
      title: 'Quantum Mechanics Explorer',
      description: 'Explore the fascinating world of quantum physics through interactive experiments',
      category: 'physics',
      difficulty: 'advanced',
      duration: 45,
      xp: 150,
      image: 'https://images.pexels.com/photos/5726794/pexels-photo-5726794.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['quantum', 'physics', 'experiments'],
      completed: true,
      rating: 4.8,
      participants: 1250,
    },
    {
      id: '2',
      title: 'Molecular Chemistry Lab',
      description: 'Build and manipulate molecules in 3D space to understand chemical bonds',
      category: 'chemistry',
      difficulty: 'intermediate',
      duration: 30,
      xp: 100,
      image: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['chemistry', 'molecules', '3D'],
      completed: false,
      rating: 4.6,
      participants: 890,
    },
    {
      id: '3',
      title: 'Human Anatomy VR',
      description: 'Explore the human body from inside out with immersive VR technology',
      category: 'biology',
      difficulty: 'beginner',
      duration: 25,
      xp: 80,
      image: 'https://images.pexels.com/photos/8348740/pexels-photo-8348740.jpeg?auto=compress&cs=tinysrgb&w=800',
      tags: ['anatomy', 'biology', 'VR'],
      completed: true,
      rating: 4.9,
      participants: 2100,
    },
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: 'Hello! I\'m Irma, your AI learning assistant. How can I help you explore the world of science today?',
      timestamp: new Date().toISOString(),
    }
  ]);

  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      labs,
      setLabs,
      chatMessages,
      addChatMessage,
      isAIAssistantOpen,
      setIsAIAssistantOpen,
    }}>
      {children}
    </AppContext.Provider>
  );
};