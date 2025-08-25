import React from 'react';
import { motion } from 'framer-motion';
import { UserProfile } from '../UserProfile';
import { Target } from 'lucide-react';

interface AuthButtonsProps {
  isAuthenticated: boolean;
  hasSignalPermission: boolean;
  onAuthAccess: (mode: 'login' | 'register') => void;
  onShowSignals: () => void;
}

export const AuthButtons: React.FC<AuthButtonsProps> = ({
  isAuthenticated,
  hasSignalPermission,
  onAuthAccess,
  onShowSignals
}) => {
  return (
    <div className="flex items-center gap-4">
      {isAuthenticated ? (
        <UserProfile />
      ) : (
        <div className="flex items-center gap-3">
          <motion.button
            onClick={() => onAuthAccess('login')}
            className="px-4 py-2 text-white hover:text-blue-300 font-medium transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            Login
          </motion.button>
          <motion.button
            onClick={() => onAuthAccess('register')}
            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sign Up
          </motion.button>
        </div>
      )}
      
      {/* Bouton Signaux */}
      {isAuthenticated && hasSignalPermission && (
        <motion.button
          onClick={onShowSignals}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-xl font-medium transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Target className="w-4 h-4" />
          <span className="hidden md:inline">Mes Signaux</span>
        </motion.button>
      )}
    </div>
  );
};