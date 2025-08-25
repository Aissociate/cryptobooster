import React from 'react';
import { motion } from 'framer-motion';
import { TrendIndicator as TrendType } from '../types/crypto';

interface TrendIndicatorProps {
  trend: TrendType;
  size?: 'sm' | 'md' | 'lg';
}

export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend, size = 'md' }) => {
  const getIcon = () => {
    switch (trend.trend) {
      case 'bullish':
        return '🟢';
      case 'bearish':
        return '🔴';
      default:
        return '⚪';
    }
  };

  const getColor = () => {
    switch (trend.trend) {
      case 'bullish':
        return 'text-emerald-400';
      case 'bearish':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  return (
    <motion.div
      className={`flex items-center gap-1 ${sizeClasses[size]}`}
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <span className="text-lg">{getIcon()}</span>
      <span className={`font-medium ${getColor()}`}>
        {trend.trend.charAt(0).toUpperCase() + trend.trend.slice(1)}
      </span>
      <span className="text-gray-500 text-xs">
        ({trend.strength}/10)
      </span>
    </motion.div>
  );
};