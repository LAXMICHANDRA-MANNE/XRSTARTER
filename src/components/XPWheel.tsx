import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap } from 'lucide-react';

interface XPWheelProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
}

const XPWheel: React.FC<XPWheelProps> = ({ currentXP, nextLevelXP, level }) => {
  const progress = (currentXP % 1000) / 1000; // Assuming 1000 XP per level
  const circumference = 2 * Math.PI * 90; // radius of 90
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className="relative">
      <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 200 200">
        {/* Background circle */}
        <circle
          cx="100"
          cy="100"
          r="90"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-200 dark:text-gray-700"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx="100"
          cy="100"
          r="90"
          stroke="url(#xpGradient)"
          strokeWidth="8"
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full mb-2 shadow-glow">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {level}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Level
          </div>
          <div className="flex items-center justify-center mt-2 text-xs">
            <Zap className="w-3 h-3 text-accent-500 mr-1" />
            <span className="text-gray-600 dark:text-gray-400">
              {currentXP % 1000}/1000 XP
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XPWheel;