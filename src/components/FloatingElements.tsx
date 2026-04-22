import React from 'react';
import { motion } from 'framer-motion';
import { Atom, Dna, Zap, Brain, Microscope, Telescope } from 'lucide-react';

const FloatingElements: React.FC = () => {
  const elements = [
    { Icon: Atom, x: '10%', y: '20%', delay: 0 },
    { Icon: Dna, x: '85%', y: '15%', delay: 1 },
    { Icon: Zap, x: '15%', y: '70%', delay: 2 },
    { Icon: Brain, x: '80%', y: '65%', delay: 0.5 },
    { Icon: Microscope, x: '60%', y: '25%', delay: 1.5 },
    { Icon: Telescope, x: '25%', y: '45%', delay: 2.5 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {elements.map((element, index) => {
        const Icon = element.Icon;
        return (
          <motion.div
            key={index}
            className="absolute"
            style={{ left: element.x, top: element.y }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 8,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="p-4 rounded-full bg-gradient-to-br from-primary-400/20 to-secondary-400/20 backdrop-blur-sm border border-white/10">
              <Icon className="w-8 h-8 text-primary-500" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FloatingElements;