import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { PriceFormatter } from '../utils/priceFormatter';

interface PriceChangeProps {
  change: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const PriceChange: React.FC<PriceChangeProps> = ({ 
  change, 
  showIcon = true, 
  size = 'md' 
}) => {
  const isPositive = change > 0;
  const isNeutral = Math.abs(change) < 0.01;

  const colorClass = isNeutral 
    ? 'text-gray-400' 
    : isPositive 
    ? 'text-emerald-400' 
    : 'text-red-400';

  const bgClass = isNeutral
    ? 'bg-gray-500/10'
    : isPositive
    ? 'bg-emerald-500/10'
    : 'bg-red-500/10';

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16
  };

  return (
    <motion.div
      className={`
        inline-flex items-center gap-1 rounded-full font-medium
        ${colorClass} ${bgClass} ${sizeClasses[size]}
        backdrop-blur-sm border border-white/5
      `}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      {showIcon && !isNeutral && (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isPositive ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {isPositive ? (
            <TrendingUp size={iconSizes[size]} />
          ) : (
            <TrendingDown size={iconSizes[size]} />
          )}
        </motion.div>
      )}
      <span>
        {PriceFormatter.formatPriceChange(change)}
      </span>
    </motion.div>
  );
};