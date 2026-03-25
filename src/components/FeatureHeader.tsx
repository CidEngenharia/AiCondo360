import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface FeatureHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  children?: React.ReactNode;
}

export const FeatureHeader: React.FC<FeatureHeaderProps> = ({ icon: Icon, title, description, color, children }) => {
  return (
    <div className="mb-8 p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm transition-colors overflow-hidden relative">
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-5 blur-3xl -mr-16 -mt-16 rounded-full`} />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 relative z-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`p-4 rounded-2xl ${color} text-white shadow-lg`}
        >
          <Icon size={32} />
        </motion.div>
        
        <div className="flex-1">
          <motion.h2 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-2xl font-bold text-slate-900 dark:text-white mb-1"
          >
            {title}
          </motion.h2>
          <motion.p 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-slate-500 dark:text-slate-400 font-medium"
          >
            {description}
          </motion.p>
        </div>

        {children && (
          <div className="mt-4 sm:mt-0 flex shrink-0">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
