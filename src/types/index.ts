export interface Lab {
  id: string;
  title: string;
  description: string;
  category: 'physics' | 'chemistry' | 'biology' | 'engineering' | 'mathematics';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  xp: number;
  image: string;
  tags: string[];
  completed: boolean;
  rating: number;
  participants: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  totalXP: number;
  level: number;
  badges: Badge[];
  completedLabs: string[];
  currentStreak: number;
  joinedDate: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AnalyticsData {
  labsCompleted: number;
  totalXP: number;
  studyTime: number;
  accuracy: number;
  streak: number;
  dailyActivity: Array<{ date: string; xp: number; labs: number }>;
}