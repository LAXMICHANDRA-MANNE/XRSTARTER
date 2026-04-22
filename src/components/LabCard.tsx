import React from 'react';
import { motion } from 'framer-motion';
import Tilt from 'react-parallax-tilt';
import { Play, Clock, Users, Star, CheckCircle } from 'lucide-react';
import { Lab } from '../types';

interface LabCardProps {
  lab: Lab;
  onStartLab: (labId: string) => void;
}

const LabCard: React.FC<LabCardProps> = ({ lab, onStartLab }) => {
  const difficultyColors = {
    beginner: 'from-green-500 to-emerald-500',
    intermediate: 'from-yellow-500 to-orange-500',
    advanced: 'from-red-500 to-pink-500',
  };

  const categoryColors = {
    physics: 'from-blue-500 to-cyan-500',
    chemistry: 'from-purple-500 to-violet-500',
    biology: 'from-green-500 to-teal-500',
    engineering: 'from-orange-500 to-red-500',
    mathematics: 'from-indigo-500 to-blue-500',
  };

  return (
    <Tilt
      tiltMaxAngleX={15}
      tiltMaxAngleY={15}
      perspective={1000}
      scale={1.02}
      transitionSpeed={1000}
      gyroscope={true}
    >
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="neural-card rounded-2xl overflow-hidden hover:shadow-glow transition-all duration-300 group"
      >
        {/* Lab Image */}
        <div className="relative overflow-hidden">
          <img
            src={lab.image}
            alt={lab.title}
            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Completion Badge */}
          {lab.completed && (
            <div className="absolute top-4 right-4">
              <div className="bg-green-500 text-white p-2 rounded-full shadow-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute top-4 left-4">
            <div className={`bg-gradient-to-r ${categoryColors[lab.category]} text-white px-3 py-1 rounded-full text-sm font-medium capitalize shadow-lg`}>
              {lab.category}
            </div>
          </div>

          {/* Play Button Overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStartLab(lab.id)}
              className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-glow"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </motion.button>
          </motion.div>
        </div>

        {/* Lab Content */}
        <div className="p-6">
          {/* Title and Rating */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
              {lab.title}
            </h3>
            <div className="flex items-center space-x-1 text-yellow-400">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {lab.rating}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
            {lab.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {lab.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-lg font-medium"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Lab Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{lab.duration} min</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{lab.participants.toLocaleString()}</span>
            </div>
            <div className={`px-2 py-1 bg-gradient-to-r ${difficultyColors[lab.difficulty]} text-white text-xs rounded-lg font-medium capitalize`}>
              {lab.difficulty}
            </div>
          </div>

          {/* XP Badge */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-accent-500 to-accent-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-glow-accent">
                +{lab.xp} XP
              </div>
            </div>

            {/* Start Lab Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onStartLab(lab.id)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg"
            >
              {lab.completed ? 'Restart' : 'Start Lab'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Tilt>
  );
};

export default LabCard;