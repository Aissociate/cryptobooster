import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  DollarSign,
  Clock,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Star,
  Save,
  X
} from 'lucide-react';
import { TradingPosition, SignalManager } from '../services/signalManager';
import { PriceFormatter } from '../utils/priceFormatter';

interface SignalCardProps {
  position: TradingPosition;
  currentPrice?: number;
  onUpdate: () => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({ 
  position, 
  currentPrice,
  onUpdate 
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingSignal, setIsEditingSignal] = useState(false);
  const [notes, setNotes] = useState(position.notes || '');
  const [editSignal, setEditSignal] = useState({
    entryPrice: position.signal.entryPrice,
    stopLoss: position.signal.stopLoss,
    takeProfit1: position.signal.takeProfit1,
    takeProfit2: position.signal.takeProfit2
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const isLong = position.signal.direction === 'long';
  const signalStatus = currentPrice ? SignalManager.checkSignalStatus(position, currentPrice) : null;

  const getStatusColor = (status: TradingPosition['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'active': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'closed': return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSignalStatusInfo = () => {
    if (!signalStatus) return null;
    
    switch (signalStatus.status) {
      case 'tp1_hit':
        return { color: 'text-emerald-400', text: 'TP1 Atteint!', icon: CheckCircle };
      case 'tp2_hit':
        return { color: 'text-emerald-500', text: 'TP2 Atteint!', icon: CheckCircle };
      case 'sl_hit':
        return { color: 'text-red-400', text: 'Stop Loss', icon: XCircle };
      case 'entry_zone':
        return { color: 'text-blue-400', text: 'Zone d\'entrée', icon: Target };
      default:
        return { color: 'text-gray-400', text: 'En attente', icon: Clock };
    }
  };

  const handleStatusChange = (newStatus: TradingPosition['status'], targetHit?: TradingPosition['targetHit']) => {
    SignalManager.updatePositionStatus(position.id, newStatus, targetHit);
    onUpdate();
  };

  const handleSaveNotes = () => {
    SignalManager.updatePositionNotes(position.id, notes);
    setIsEditingNotes(false);
    onUpdate();
  };

  const handleEditSignal = () => {
    setIsEditingSignal(true);
    setEditSignal({
      entryPrice: position.signal.entryPrice,
      stopLoss: position.signal.stopLoss,
      takeProfit1: position.signal.takeProfit1,
      takeProfit2: position.signal.takeProfit2
    });
  };

  const handleSaveSignal = () => {
    // Calculer le nouveau Risk/Reward ratio
    const risk = Math.abs(editSignal.entryPrice - editSignal.stopLoss);
    const reward = Math.abs(editSignal.takeProfit1 - editSignal.entryPrice);
    const newRiskRewardRatio = risk > 0 ? Math.round((reward / risk) * 100) / 100 : 1;

    const updatedSignal = {
      ...position.signal,
      entryPrice: editSignal.entryPrice,
      stopLoss: editSignal.stopLoss,
      takeProfit1: editSignal.takeProfit1,
      takeProfit2: editSignal.takeProfit2,
      riskRewardRatio: newRiskRewardRatio
    };

    SignalManager.updatePositionSignal(position.id, updatedSignal);
    setIsEditingSignal(false);
    onUpdate();
  };

  const handleCancelEditSignal = () => {
    setIsEditingSignal(false);
  };
  const handleDelete = () => {
    SignalManager.removePosition(position.id);
    onUpdate();
  };

  const statusInfo = getSignalStatusInfo();

  return (
    <motion.div
      layout
      className="bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={position.cryptoImage}
            alt={position.cryptoName}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2">
              {position.cryptoName}
              <span className="text-gray-400 font-mono text-sm">
                {position.cryptoSymbol.toUpperCase()}
              </span>
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`
                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border
                ${getStatusColor(position.status)}
              `}>
                {position.status.charAt(0).toUpperCase() + position.status.slice(1)}
              </div>
              {statusInfo && (
                <div className={`flex items-center gap-1 text-xs ${statusInfo.color}`}>
                  <statusInfo.icon className="w-3 h-3" />
                  {statusInfo.text}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleEditSignal}
            disabled={isEditingSignal}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.1 }}
            title="Éditer les prix du signal"
          >
            <Target className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setIsEditingNotes(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            title="Ajouter des notes"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          
          <motion.button
            onClick={() => setShowConfirmDelete(true)}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            title="Supprimer le signal"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Trading Signal */}
      <div className={`
        p-4 rounded-xl border-2 mb-4
        ${isLong 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-red-500/10 border-red-500/30'}
        ${isEditingSignal ? 'ring-2 ring-blue-400/30' : ''}
      `}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {isLong ? (
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <span className="text-white font-semibold">
              {position.signal.direction.toUpperCase()}
            </span>
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-medium">
                {position.signal.confidence}%
              </span>
            </div>
          </div>
          
          {isEditingSignal && (
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleSaveSignal}
                className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <Save className="w-3 h-3" />
                Sauvegarder
              </motion.button>
              <motion.button
                onClick={handleCancelEditSignal}
                className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all"
                whileHover={{ scale: 1.05 }}
              >
                <X className="w-3 h-3" />
                Annuler
              </motion.button>
            </div>
          )}

          {currentPrice && (
            <div className="text-right">
              <div className="text-white font-mono text-sm">
                Prix actuel: {PriceFormatter.formatPrice(currentPrice)}
              </div>
              {signalStatus && (
                <div className={`text-xs ${signalStatus.priceDistance > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {signalStatus.priceDistance > 0 ? '+' : ''}{signalStatus.priceDistance.toFixed(2)}%
                </div>
              )}
            </div>
          )}
        </div>

        {/* Prix éditables */}
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Target className="w-3 h-3 text-gray-400" />
              <span className="text-gray-400 text-xs">Entrée</span>
            </div>
            {isEditingSignal ? (
              <input
                type="number"
                step="0.01"
                value={editSignal.entryPrice}
                onChange={(e) => setEditSignal(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-white font-mono text-xs"
              />
            ) : (
            <span className="text-white font-mono">
              {PriceFormatter.formatPrice(position.signal.entryPrice)}
            </span>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Shield className="w-3 h-3 text-red-400" />
              <span className="text-red-400 text-xs">SL</span>
            </div>
            {isEditingSignal ? (
              <input
                type="number"
                step="0.01"
                value={editSignal.stopLoss}
                onChange={(e) => setEditSignal(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-red-400 font-mono text-xs"
              />
            ) : (
            <span className="text-red-400 font-mono">
              {PriceFormatter.formatPrice(position.signal.stopLoss)}
            </span>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-xs">TP1</span>
            </div>
            {isEditingSignal ? (
              <input
                type="number"
                step="0.01"
                value={editSignal.takeProfit1}
                onChange={(e) => setEditSignal(prev => ({ ...prev, takeProfit1: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-emerald-400 font-mono text-xs"
              />
            ) : (
            <span className="text-emerald-400 font-mono">
              {PriceFormatter.formatPrice(position.signal.takeProfit1)}
            </span>
            )}
          </div>
          
          <div>
            <div className="flex items-center gap-1 mb-1">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 text-xs">TP2</span>
            </div>
            {isEditingSignal ? (
              <input
                type="number"
                step="0.01"
                value={editSignal.takeProfit2}
                onChange={(e) => setEditSignal(prev => ({ ...prev, takeProfit2: parseFloat(e.target.value) || 0 }))}
                className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-emerald-400 font-mono text-xs"
              />
            ) : (
            <span className="text-emerald-400 font-mono">
              {PriceFormatter.formatPrice(position.signal.takeProfit2)}
            </span>
            )}
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-700/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">R:R {position.signal.riskRewardRatio}:1</span>
            {isEditingSignal && (
              <span className="text-blue-400 text-xs">(Auto-calculé)</span>
            )}
          </div>
          <span className="text-gray-400 text-xs">
            Ajouté le {position.addedAt.toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Status Actions */}
      {position.status === 'pending' && (
        <div className="flex gap-2 mb-4">
          <motion.button
            onClick={() => handleStatusChange('active')}
            className="flex-1 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-all"
            whileHover={{ scale: 1.02 }}
          >
            Activer Position
          </motion.button>
          <motion.button
            onClick={() => handleStatusChange('cancelled')}
            className="flex-1 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all"
            whileHover={{ scale: 1.02 }}
          >
            Annuler
          </motion.button>
        </div>
      )}

      {position.status === 'active' && (
        <div className="flex gap-2 mb-4">
          <motion.button
            onClick={() => handleStatusChange('closed', 'tp1')}
            className="flex-1 py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-xs font-medium transition-all"
            whileHover={{ scale: 1.02 }}
          >
            TP1 Hit
          </motion.button>
          <motion.button
            onClick={() => handleStatusChange('closed', 'tp2')}
            className="flex-1 py-2 px-3 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-200 rounded-lg text-xs font-medium transition-all"
            whileHover={{ scale: 1.02 }}
          >
            TP2 Hit
          </motion.button>
          <motion.button
            onClick={() => handleStatusChange('closed', 'sl')}
            className="flex-1 py-2 px-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-xs font-medium transition-all"
            whileHover={{ scale: 1.02 }}
          >
            Stop Loss
          </motion.button>
        </div>
      )}

      {/* Notes Section */}
      <div className="space-y-2">
        {isEditingNotes ? (
          <div className="space-y-2">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ajouter des notes sur ce signal..."
              className="w-full p-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white text-sm resize-none h-20"
            />
            <div className="flex gap-2">
              <motion.button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded text-xs font-medium transition-all"
                whileHover={{ scale: 1.05 }}
              >
                Sauvegarder
              </motion.button>
              <motion.button
                onClick={() => {
                  setIsEditingNotes(false);
                  setNotes(position.notes || '');
                }}
                className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-300 rounded text-xs font-medium transition-all"
                whileHover={{ scale: 1.05 }}
              >
                Annuler
              </motion.button>
            </div>
          </div>
        ) : position.notes ? (
          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <p className="text-gray-300 text-sm">{position.notes}</p>
          </div>
        ) : null}
      </div>

      {/* Delete Confirmation */}
      {showConfirmDelete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 font-medium text-sm">
              Confirmer la suppression
            </span>
          </div>
          <p className="text-gray-300 text-sm mb-3">
            Cette action est irréversible. Le signal sera définitivement supprimé.
          </p>
          <div className="flex gap-2">
            <motion.button
              onClick={handleDelete}
              className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded text-xs font-medium transition-all"
              whileHover={{ scale: 1.05 }}
            >
              Supprimer
            </motion.button>
            <motion.button
              onClick={() => setShowConfirmDelete(false)}
              className="px-3 py-1 bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 text-gray-300 rounded text-xs font-medium transition-all"
              whileHover={{ scale: 1.05 }}
            >
              Annuler
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};