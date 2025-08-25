import { useState, useEffect, useCallback } from 'react';
import { EnhancedCrypto } from '../types/crypto';
import { CryptoService } from '../services/cryptoApi';
import { Logger } from '../services/logService';

// Liste des stablecoins à exclure
const STABLECOINS = [
  'usdt', 'usdc', 'busd', 'dai', 'tusd', 'usdp', 'gusd', 'usdd', 
  'frax', 'lusd', 'fei', 'tribe', 'mim', 'ustc', 'ust', 'susd',
  'husd', 'cusd', 'ousd', 'usdx', 'flexusd', 'nusd'
];
export const useCryptoData = () => {
  const [cryptos, setCryptos] = useState<EnhancedCrypto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchCryptos = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setRefreshing(true);
    
    try {
      const data = await CryptoService.getTopCryptos(50);
      
      // Filtrer les stablecoins
      const filteredData = data.filter(crypto => 
        !STABLECOINS.includes(crypto.symbol.toLowerCase())
      );
      
      const sorted = filteredData.sort((a, b) => b.aiScore - a.aiScore);
      setCryptos(sorted);
      setLastRefresh(new Date());
      Logger.success('SYSTEM', 'Données crypto mises à jour', { 
        count: sorted.length,
        filtered: data.length - filteredData.length,
        stablecoinsRemoved: data.length - filteredData.length
      });
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur chargement crypto', error);
    } finally {
      if (showLoader) setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const updateSingleCrypto = useCallback((updatedCrypto: EnhancedCrypto) => {
    Logger.info('SYSTEM', `Mise à jour crypto ${updatedCrypto.symbol}`, { 
      newScore: updatedCrypto.aiScore,
      signal: updatedCrypto.aiAnalysis?.tradingSignal 
    });
    
    setCryptos(prev => {
      const updated = prev.map(crypto => 
        crypto.id === updatedCrypto.id ? updatedCrypto : crypto
      );
      
      const sorted = updated.sort((a, b) => b.aiScore - a.aiScore);
      
      Logger.success('SYSTEM', 'Cryptos retriés par AI Score', {
        total: sorted.length,
        topScores: sorted.slice(0, 3).map(c => ({ symbol: c.symbol, score: c.aiScore }))
      });
      
      return sorted;
    });
  }, []);

  useEffect(() => {
    fetchCryptos();

    const autoRefreshInterval = setInterval(() => {
      Logger.info('SYSTEM', 'Auto-refresh des données crypto...');
      fetchCryptos(false);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(autoRefreshInterval);
      Logger.info('SYSTEM', 'Auto-refresh arrêté');
    };
  }, [fetchCryptos]);

  return {
    cryptos,
    loading,
    refreshing,
    lastRefresh,
    fetchCryptos,
    updateSingleCrypto
  };
};