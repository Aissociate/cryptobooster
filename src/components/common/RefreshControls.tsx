import React from 'react';
import { motion } from 'framer-motion';

interface RefreshControlsProps {
  refreshing: boolean;
  lastRefresh: Date | null;
  onRefreshAll: () => void;
}

export const RefreshControls: React.FC<RefreshControlsProps> = ({
  refreshing,
  lastRefresh,
  onRefreshAll
}) => {
  return (
    <motion.div
      className="flex items-center gap-4 mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex items-center gap-4 flex-1">
        <span className="text-gray-400 text-sm font-medium">Trié par: AI Score (Décroissant)</span>
      </div>
      
      {/* Refresh All Button */}
      <motion.button
        onClick={onRefreshAll}
        disabled={refreshing}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-300
          ${refreshing
            ? 'bg-gray-500/20 border border-gray-500/30 text-gray-500 cursor-not-allowed'
            : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 hover:border-emerald-500/50 text-emerald-300'
          }
          backdrop-blur-xl
        `}
        whileHover={refreshing ? {} : { scale: 1.05 }}
        whileTap={refreshing ? {} : { scale: 0.95 }}
      >
        <motion.div
          animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </motion.div>
        <span className="text-sm">
          {refreshing ? 'Actualisation...' : 'Refresh All'}
        </span>
      </motion.button>
      
      {/* Indicateur dernière mise à jour */}
      {lastRefresh && (
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/30 border border-gray-700/30 rounded-xl backdrop-blur-xl">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-gray-400 text-xs">
            Dernier refresh: {lastRefresh.toLocaleTimeString()}
          </span>
        </div>
      )}
    </motion.div>
  );
};