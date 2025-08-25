import React from 'react';
import { motion } from 'framer-motion';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-20">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-16 h-16 border-4 border-gray-700 rounded-full" />
        <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full" />
        <motion.div
          className="absolute inset-2 w-12 h-12 border-4 border-purple-500 border-r-transparent rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
};