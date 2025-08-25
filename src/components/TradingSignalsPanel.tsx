import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Users,
  Award,
  Percent,
  X
} from 'lucide-react';
import { TradingPosition, SignalManager, PositionStats } from '../services/signalManager';
import { SignalCard } from './SignalCard';
import { useCryptoData } from '../hooks/useCryptoData';

interface TradingSignalsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TradingSignalsPanel: React.FC<TradingSignalsPanelProps> = ({
  isOpen,
  onClose
}) => {
  const [positions, setPositions] = useState<TradingPosition[]>([]);
  const [stats, setStats] = useState<PositionStats>({
    totalPositions: 0,
    activePositions: 0,
    pendingPositions: 0,
    winRate: 0,
    avgRiskReward: 0
  });
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'closed'>('all');
  
  const { cryptos } = useCryptoData();

  // Mise à jour des positions
  const refreshData = () => {
    setPositions(SignalManager.getAllPositions());
    setStats(SignalManager.getStats());
  };

  useEffect(() => {
    const unsubscribe = SignalManager.subscribe(setPositions);
    refreshData();
    return unsubscribe;
  }, []);

  // Filtrer les positions
  const filteredPositions = positions.filter(position => {
    if (filter === 'all') return true;
    return position.status === filter;
  });

  // Obtenir le prix actuel d'une crypto
  const getCurrentPrice = (cryptoId: string): number | undefined => {
    const crypto = cryptos.find(c => c.id === cryptoId);
    return crypto?.current_price;
  };

  const filterButtons = [
    { key: 'all', label: 'Tous', count: positions.length },
    { key: 'pending', label: 'En attente', count: stats.pendingPositions },
    { key: 'active', label: 'Actifs', count: stats.activePositions },
    { key: 'closed', label: 'Fermés', count: positions.filter(p => p.status === 'closed').length }
  ] as const;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-6xl w-full mx-4 max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/30 rounded-lg border border-emerald-500/20">
                    <Target className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Signaux de Trading</h2>
                    <p className="text-gray-400 text-sm">Gestion de vos positions et analyses</p>
                  </div>
                </div>
                <motion.button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <X className="w-5 h-5 text-gray-400" />
                </motion.button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-2xl font-bold text-blue-400">{stats.totalPositions}</div>
                  <div className="text-gray-400 text-xs">Total</div>
                </div>
                
                <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">{stats.activePositions}</div>
                  <div className="text-gray-400 text-xs">Actifs</div>
                </div>
                
                <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingDown className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.pendingPositions}</div>
                  <div className="text-gray-400 text-xs">En attente</div>
                </div>
                
                <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-purple-400">{stats.winRate}%</div>
                  <div className="text-gray-400 text-xs">Win Rate</div>
                </div>
                
                <div className="bg-gray-800/30 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <BarChart3 className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-orange-400">{stats.avgRiskReward}</div>
                  <div className="text-gray-400 text-xs">R:R Moyen</div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 mb-6">
                <Filter className="w-4 h-4 text-gray-400" />
                {filterButtons.map(({ key, label, count }) => (
                  <motion.button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm
                      ${filter === key
                        ? 'bg-blue-500/30 border border-blue-400/70 text-blue-300'
                        : 'bg-gray-800/30 border border-gray-700/30 text-gray-400 hover:bg-gray-800/50'
                      }
                    `}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span>{label}</span>
                    <span className="text-xs bg-gray-600/50 px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  </motion.button>
                ))}
              </div>

              {/* Positions List */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {filteredPositions.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-12"
                    >
                      <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                      <h3 className="text-gray-300 font-medium mb-2">
                        {filter === 'all' 
                          ? 'Aucun signal de trading'
                          : `Aucun signal ${filter === 'pending' ? 'en attente' : filter === 'active' ? 'actif' : 'fermé'}`
                        }
                      </h3>
                      <p className="text-gray-500 text-sm">
                        Les signaux apparaîtront ici après les analyses IA
                      </p>
                    </motion.div>
                  ) : (
                    filteredPositions.map((position) => (
                      <SignalCard
                        key={position.id}
                        position={position}
                        currentPrice={getCurrentPrice(position.cryptoId)}
                        onUpdate={refreshData}
                      />
                    ))
                  )}
                </AnimatePresence>
              </div>

              {/* Actions */}
              {positions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-700/30 flex items-center justify-between">
                  <div className="text-gray-500 text-sm">
                    {filteredPositions.length} signal{filteredPositions.length !== 1 ? 's' : ''} affiché{filteredPositions.length !== 1 ? 's' : ''}
                  </div>
                  
                  <motion.button
                    onClick={() => {
                      if (confirm('Êtes-vous sûr de vouloir supprimer tous les signaux ?')) {
                        SignalManager.clearAllPositions();
                      }
                    }}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Effacer Tout
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};