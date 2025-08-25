import React from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface SearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedFilter: 'all' | 'bullish' | 'bearish' | 'neutral';
  onFilterChange: (filter: 'all' | 'bullish' | 'bearish' | 'neutral') => void;
}

export const SearchAndFilters: React.FC<SearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedFilter,
  onFilterChange
}) => {
  const filters = [
    { key: 'all', label: 'All', icon: Filter, color: 'text-gray-400' },
    { key: 'bullish', label: 'Bullish', icon: TrendingUp, color: 'text-emerald-400' },
    { key: 'bearish', label: 'Bearish', icon: TrendingDown, color: 'text-red-400' },
    { key: 'neutral', label: 'Neutral', icon: Minus, color: 'text-gray-400' }
  ] as const;

  return (
    <motion.div
      className="flex flex-col sm:flex-row gap-4 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <motion.input
          type="text"
          placeholder="Search cryptocurrencies..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full pl-10 pr-4 py-3 
            bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 
            rounded-xl text-white placeholder-gray-400
            focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
            transition-all duration-300
          "
          whileFocus={{ scale: 1.02 }}
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {filters.map((filter) => (
          <motion.button
            key={filter.key}
            onClick={() => onFilterChange(filter.key)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-300
              ${selectedFilter === filter.key
                ? 'bg-blue-500/30 border border-blue-400/70 text-blue-300'
                : 'bg-gray-900/30 border border-gray-700/30 text-gray-400 hover:bg-gray-800/50 hover:border-gray-600/50'
              }
              backdrop-blur-xl
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <filter.icon className={`w-4 h-4 ${selectedFilter === filter.key ? 'text-blue-300' : filter.color}`} />
            <span className="hidden sm:inline">{filter.label}</span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};