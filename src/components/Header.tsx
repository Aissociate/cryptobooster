import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onAdminAccess: () => void;
  onAuthAccess?: (mode: 'login' | 'register') => void;
  onAnalyzeAll?: () => void;
  isAnalyzingAll?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onAdminAccess, 
  onAuthAccess, 
  onAnalyzeAll,
  isAnalyzingAll = false 
}) => {
  const [clickCount, setClickCount] = useState(0);
  const { hasRole } = useAuth();

  const handleLogoClick = () => {
    setClickCount(prev => prev + 1);
    
    if (clickCount + 1 === 5) {
      onAdminAccess();
      setClickCount(0);
    } else {
      // Reset after 3 seconds if not reaching 5 clicks
      setTimeout(() => {
        setClickCount(0);
      }, 3000);
    }
  };

  return (
    <div>
      {/* Admin Super Button */}
      {hasRole('admin') && (
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <motion.button
            onClick={onAnalyzeAll}
            disabled={isAnalyzingAll}
            className={`
              inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 backdrop-blur-xl
              ${isAnalyzingAll
                ? 'bg-gray-500/20 border border-gray-500/30 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 border border-purple-500/30 hover:border-purple-400/70 text-purple-300'
              }
            `}
            whileHover={isAnalyzingAll ? {} : { scale: 1.05 }}
            whileTap={isAnalyzingAll ? {} : { scale: 0.95 }}
          >
            {isAnalyzingAll ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Sparkles className="w-5 h-5" />
                </motion.div>
                <span>Analyse en cours... (IA + Graphiques)</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>🚀 ANALYSE ALL CRYPTOS</span>
                <span className="text-xs bg-purple-400/20 px-2 py-1 rounded-full">
                  ADMIN
                </span>
              </>
            )}
          </motion.button>
          <p className="text-gray-500 text-xs mt-2">
            Génération graphiques + analyse IA pour toutes les cryptos
          </p>
        </motion.div>
      )}

      <motion.header
        className="text-center mb-12"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="inline-flex items-center justify-center mb-4"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400 }}
          onClick={handleLogoClick}
          style={{ cursor: 'pointer' }}
        >
          <div className="relative">
            <img 
              src="/Capture.JPG" 
              alt="Crypto Booster Logo"
              className="w-16 h-16 object-cover rounded-lg"
            />
            {clickCount > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                key={clickCount}
              >
                {clickCount}
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.p
          className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Advanced cryptocurrency analysis powered by artificial intelligence. 
          Get professional trading signals with multi-timeframe analysis.
        </motion.p>

        <motion.div
          className="flex items-center justify-center gap-6 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Real-time Data</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-blue-300" />
            <span>AI Analysis</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Trading Signals</span>
          </div>
        </motion.div>
      </motion.header>
    </div>
  );
}