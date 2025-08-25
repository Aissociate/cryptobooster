import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  Shield, 
  DollarSign, 
  Star, 
  Edit3, 
  Save, 
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { AIAnalysis } from '../../types/crypto';
import { PriceFormatter } from '../../utils/priceFormatter';

interface TradingSignalEditorProps {
  analysis: AIAnalysis;
  cryptoSymbol: string;
  onAnalysisUpdate?: (updatedAnalysis: AIAnalysis) => void;
}

export const TradingSignalEditor: React.FC<TradingSignalEditorProps> = ({
  analysis,
  cryptoSymbol,
  onAnalysisUpdate
}) => {
  const { tradingSignal } = analysis;
  const isLong = tradingSignal.direction === 'long';
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    entryPrice: tradingSignal.entryPrice,
    stopLoss: tradingSignal.stopLoss,
    takeProfit1: tradingSignal.takeProfit1,
    takeProfit2: tradingSignal.takeProfit2,
    confidence: tradingSignal.confidence,
    riskRewardRatio: tradingSignal.riskRewardRatio
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditValues({
      entryPrice: tradingSignal.entryPrice,
      stopLoss: tradingSignal.stopLoss,
      takeProfit1: tradingSignal.takeProfit1,
      takeProfit2: tradingSignal.takeProfit2,
      confidence: tradingSignal.confidence,
      riskRewardRatio: tradingSignal.riskRewardRatio
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    // Calcul automatique du Risk/Reward ratio
    const entryPrice = editValues.entryPrice;
    const stopLoss = editValues.stopLoss;
    const takeProfit1 = editValues.takeProfit1;
    
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit1 - entryPrice);
    const newRiskRewardRatio = risk > 0 ? Math.round((reward / risk) * 100) / 100 : 1;

    const updatedAnalysis: AIAnalysis = {
      ...analysis,
      isVerified: true,
      isManuallyEdited: true,
      tradingSignal: {
        ...tradingSignal,
        entryPrice: editValues.entryPrice,
        stopLoss: editValues.stopLoss,
        takeProfit1: editValues.takeProfit1,
        takeProfit2: editValues.takeProfit2,
        confidence: editValues.confidence,
        riskRewardRatio: newRiskRewardRatio
      }
    };

    onAnalysisUpdate?.(updatedAnalysis);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof typeof editValues, value: number) => {
    setEditValues(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className={`
      p-4 rounded-xl border-2 mb-4
      ${isLong 
        ? 'bg-emerald-500/10 border-emerald-500/30' 
        : 'bg-red-500/10 border-red-500/30'}
      ${isEditing ? 'ring-2 ring-blue-400/30' : ''}
    `}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLong ? (
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
          <span className="text-white font-semibold">
            {tradingSignal.direction.toUpperCase()}
          </span>
          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded-full">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-yellow-400 text-xs font-medium">
              {isEditing ? editValues.confidence : tradingSignal.confidence}%
            </span>
          </div>
        </div>
        
        {isEditing ? (
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-lg text-sm font-medium transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <Save className="w-3 h-3" />
              Sauvegarder
            </motion.button>
            <motion.button
              onClick={handleCancel}
              className="flex items-center gap-1 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 rounded-lg text-sm font-medium transition-all"
              whileHover={{ scale: 1.05 }}
            >
              <X className="w-3 h-3" />
              Annuler
            </motion.button>
          </div>
        ) : (
          <motion.button
            onClick={handleEdit}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            title="Éditer le signal"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Prix éditables */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Target className="w-3 h-3 text-gray-400" />
            <span className="text-gray-400 text-xs">Entrée</span>
          </div>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={editValues.entryPrice}
              onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-white font-mono text-xs"
            />
          ) : (
            <span className="text-white font-mono">
              {PriceFormatter.formatPrice(tradingSignal.entryPrice)}
            </span>
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-1 mb-1">
            <Shield className="w-3 h-3 text-red-400" />
            <span className="text-red-400 text-xs">SL</span>
          </div>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={editValues.stopLoss}
              onChange={(e) => handleInputChange('stopLoss', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-red-400 font-mono text-xs"
            />
          ) : (
            <span className="text-red-400 font-mono">
              {PriceFormatter.formatPrice(tradingSignal.stopLoss)}
            </span>
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs">TP1</span>
          </div>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={editValues.takeProfit1}
              onChange={(e) => handleInputChange('takeProfit1', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-emerald-400 font-mono text-xs"
            />
          ) : (
            <span className="text-emerald-400 font-mono">
              {PriceFormatter.formatPrice(tradingSignal.takeProfit1)}
            </span>
          )}
        </div>
        
        <div>
          <div className="flex items-center gap-1 mb-1">
            <DollarSign className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs">TP2</span>
          </div>
          {isEditing ? (
            <input
              type="number"
              step="0.01"
              value={editValues.takeProfit2}
              onChange={(e) => handleInputChange('takeProfit2', parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-emerald-400 font-mono text-xs"
            />
          ) : (
            <span className="text-emerald-400 font-mono">
              {PriceFormatter.formatPrice(tradingSignal.takeProfit2)}
            </span>
          )}
        </div>
      </div>

      {/* Confidence et R:R en mode édition */}
      {isEditing && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs">Confiance (%)</span>
            </div>
            <input
              type="number"
              min="0"
              max="100"
              step="1"
              value={editValues.confidence}
              onChange={(e) => handleInputChange('confidence', parseInt(e.target.value) || 0)}
              className="w-full bg-gray-800/50 border border-gray-600 rounded px-2 py-1 text-yellow-400 font-mono text-xs"
            />
          </div>
        </div>
      )}
      
      <div className="mt-3 pt-3 border-t border-gray-700/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-xs">
            R:R {isEditing ? 
              Math.round((Math.abs(editValues.takeProfit1 - editValues.entryPrice) / Math.abs(editValues.entryPrice - editValues.stopLoss)) * 100) / 100 :
              tradingSignal.riskRewardRatio
            }:1
          </span>
          {isEditing && (
            <span className="text-blue-400 text-xs">(Auto-calculé)</span>
          )}
        </div>
        <span className="text-gray-400 text-xs">
          {cryptoSymbol.toUpperCase()}
        </span>
      </div>
    </div>
  );
};