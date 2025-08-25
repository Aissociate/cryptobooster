import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Check, Star } from 'lucide-react';
import { SignalManager } from '../services/signalManager';
import { AIAnalysis } from '../types/crypto';
import { useAuth } from '../contexts/AuthContext';

interface AddToSignalsButtonProps {
  crypto: {
    id: string;
    symbol: string;
    name: string;
    image: string;
  };
  analysis: AIAnalysis;
}

export const AddToSignalsButton: React.FC<AddToSignalsButtonProps> = ({
  crypto,
  analysis
}) => {
  const { hasPermission } = useAuth();
  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Vérifier si le signal existe déjà
  useEffect(() => {
    setIsAdded(SignalManager.hasPosition(crypto.id));
  }, [crypto.id]);

  const handleAddToSignals = async () => {
    if (!hasPermission('generate_trading_signals')) {
      alert('Accès Premium requis pour sauvegarder les signaux');
      return;
    }

    if (isAdded) {
      // Ouvrir le panel des signaux si déjà ajouté
      // Cette fonctionnalité sera implémentée dans le composant parent
      return;
    }

    setIsLoading(true);
    
    try {
      // Simuler un délai pour l'effet visuel
      await new Promise(resolve => setTimeout(resolve, 800));
      
      SignalManager.addPosition(crypto, analysis);
      setIsAdded(true);
      
      // Notification de succès (optionnel)
      console.log(`Signal ajouté pour ${crypto.symbol.toUpperCase()}`);
      
    } catch (error) {
      console.error('Erreur ajout signal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isLong = analysis.tradingSignal.direction === 'long';
  const confidence = analysis.tradingSignal.confidence;

  return (
    <motion.button
      onClick={handleAddToSignals}
      disabled={isLoading}
      className={`
        w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-semibold transition-all duration-300 
        backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed
        ${isAdded
          ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/30'
          : isLong 
          ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300'
          : 'bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300'
        }
      `}
      whileHover={isLoading ? {} : { scale: 1.02 }}
      whileTap={isLoading ? {} : { scale: 0.98 }}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Target className="w-5 h-5" />
          </motion.div>
          <span>Ajout en cours...</span>
        </>
      ) : isAdded ? (
        <>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <Check className="w-5 h-5 text-emerald-400" />
          </motion.div>
          <span>Signal ajouté ✓</span>
          <div className="ml-auto flex items-center gap-1 px-2 py-1 bg-emerald-400/20 rounded-full">
            <Star className="w-3 h-3" />
            <span className="text-xs">{confidence}%</span>
          </div>
        </>
      ) : (
        <>
          <Plus className="w-5 h-5" />
          <span>
            Ajouter aux Signaux {analysis.tradingSignal.direction.toUpperCase()}
          </span>
          <div className="ml-auto flex items-center gap-1 px-2 py-1 bg-white/10 rounded-full">
            <Star className="w-3 h-3 text-yellow-400" />
            <span className="text-xs">{confidence}%</span>
          </div>
        </>
      )}
    </motion.button>
  );
};