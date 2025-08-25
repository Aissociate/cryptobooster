import { useState, useMemo } from 'react';
import { EnhancedCrypto } from '../types/crypto';

export const useFilters = (cryptos: EnhancedCrypto[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');

  const filteredCryptos = useMemo(() => {
    let filtered = cryptos;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crypto.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Trend filter based on 24h performance
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(crypto => {
        const dayTrend = crypto.trends['1D'].trend;
        return dayTrend === selectedFilter;
      });
    }

    // Toujours trier par AI Score décroissant
    filtered.sort((a, b) => b.aiScore - a.aiScore);

    return filtered;
  }, [cryptos, searchTerm, selectedFilter]);

  return {
    searchTerm,
    setSearchTerm,
    selectedFilter,
    setSelectedFilter,
    filteredCryptos
  };
};