import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, 
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Database,
  Star,
  Edit3
} from 'lucide-react';
import { AIAnalysis } from '../types/crypto';
import { AddToSignalsButton } from './AddToSignalsButton';
import { TradingSignalEditor } from './analysis/TradingSignalEditor';
import { JsonDisplay } from './analysis/JsonDisplay';

interface AIAnalysisCardProps {
  analysis: AIAnalysis;
  cryptoSymbol: string;
  onAnalysisUpdate?: (updatedAnalysis: AIAnalysis) => void;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({ 
  analysis, 
  cryptoSymbol,
  onAnalysisUpdate 
}) => {
  const [showRawJson, setShowRawJson] = useState(true);

  const sentimentConfig = {
    'very-bullish': { color: 'text-emerald-400', bg: 'bg-emerald-500/20', icon: '🚀' },
    'bullish': { color: 'text-emerald-300', bg: 'bg-emerald-500/15', icon: '📈' },
    'neutral': { color: 'text-gray-400', bg: 'bg-gray-500/15', icon: '⚖️' },
    'bearish': { color: 'text-red-300', bg: 'bg-red-500/15', icon: '📉' },
    'very-bearish': { color: 'text-red-400', bg: 'bg-red-500/20', icon: '💥' }
  };

  const sentiment = sentimentConfig[analysis.sentiment];

  // Fonction pour nettoyer et formater le JSON
  const formatJsonData = (data: any): any => {
    if (data === null || data === undefined) {
      return '';
    }
    if (Array.isArray(data)) {
      return data.map(item => formatJsonData(item));
    }
    if (typeof data === 'object') {
      const cleaned: any = {};
      Object.keys(data).forEach(key => {
        cleaned[key] = formatJsonData(data[key]);
      });
      return cleaned;
    }
    return data;
  };

  // Créer un objet JSON organisé de toutes les données
  const getStructuredJsonData = () => {
    const structuredData = {
      // Métadonnées
      crypto_info: {
        symbol: cryptoSymbol.toUpperCase(),
        analysis_timestamp: new Date().toISOString(),
        is_verified: analysis.isVerified || false,
        is_manually_edited: analysis.isManuallyEdited || false
      },
      
      // Format compatible avec la BDD
      Crypto: cryptoSymbol.toUpperCase(),
      score: Math.round((analysis.tradingSignal.confidence / 10) * 100) / 100,
      confiance: `${analysis.tradingSignal.confidence}%`,
      direction: analysis.tradingSignal.direction.toUpperCase(),
      entree: analysis.tradingSignal.entryPrice,
      sl: analysis.tradingSignal.stopLoss,
      tp1: analysis.tradingSignal.takeProfit1,
      tp2: analysis.tradingSignal.takeProfit2,
      
      // Analyse par timeframes
      Weekly: analysis.patternAnalysis?.details?.patterns?.Weekly || '',
      Daily: analysis.patternAnalysis?.details?.patterns?.Daily || '',
      "12H": analysis.patternAnalysis?.details?.patterns?.["12H"] || '',
      "4H": analysis.patternAnalysis?.details?.patterns?.["4H"] || '',
      "1H": analysis.patternAnalysis?.details?.patterns?.["1H"] || '',
      
      // Signaux globaux
      signal_global: analysis.sentiment.replace('-', ' ') || '',
      score_bullish: analysis.patternAnalysis?.bull || 0,
      score_bearish: analysis.patternAnalysis?.bear || 0,
      pattern_plus_fort: analysis.patternAnalysis?.details?.strongestPattern || '',
      timeframes_dominants: analysis.patternAnalysis?.details?.dominantTimeframes || [],
      convergence_signaux: `Positive sur ${analysis.patternAnalysis?.details?.dominantTimeframes?.length || 0}/5 timeframes`,
      
      // Niveaux techniques
      support_principal: analysis.tradingSignal.stopLoss,
      resistance_principale: analysis.tradingSignal.takeProfit1,
      support_secondaire: Math.round(analysis.tradingSignal.stopLoss * 1.02 * 100) / 100,
      resistance_secondaire: analysis.tradingSignal.takeProfit2,
      
      // Analyse complète
      market_analysis: {
        sentiment: analysis.sentiment || '',
        market_context: analysis.marketContext || '',
        technical_analysis: analysis.technicalAnalysis || '',
        fundamental_factors: analysis.fundamentalFactors || []
      },
      
      // Réponse IA brute
      raw_ai_response: analysis.rawAIResponse || '',
      
      // Horodatage
      generated_at: new Date().toISOString()
    };

    return formatJsonData(structuredData);
  };


  const jsonData = getStructuredJsonData();

  return (
    <motion.div
      className="p-6 bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700/50"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/30 rounded-lg border border-blue-500/20">
            <Brain className="w-5 h-5 text-blue-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">
                AI Analysis for {cryptoSymbol.toUpperCase()}
              </h3>
              {analysis.isVerified && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30"
                >
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-medium">Verified</span>
                </motion.div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-gray-400">Market Sentiment:</span>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${sentiment.bg}`}>
                <span className="text-sm">{sentiment.icon}</span>
                <span className={`text-sm font-medium ${sentiment.color}`}>
                  {analysis.sentiment.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center gap-1 px-3 py-1 bg-yellow-500/20 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 text-sm font-medium">
              {tradingSignal.confidence}% Confidence
            </span>
          </motion.div>
          
          {!isEditing && (
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
      </div>

      {/* JSON Data Display */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-medium flex items-center gap-2">
            <Database className="w-4 h-4 text-purple-400" />
            Données Structurées JSON
            <span className="text-xs bg-purple-500/20 px-2 py-1 rounded-full text-purple-300">
              Sauvegardé en BDD
            </span>
          </h4>
          <motion.button
            onClick={() => setShowRawJson(!showRawJson)}
            className="flex items-center gap-1 px-3 py-1 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-gray-300 text-sm transition-colors"
            whileHover={{ scale: 1.05 }}
          >
            {showRawJson ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showRawJson ? 'Masquer' : 'Afficher'} JSON
          </motion.button>
        </div>

        {showRawJson && (
          <JsonDisplay jsonData={jsonData} cryptoSymbol={cryptoSymbol} />
        )}
      </div>

      {/* Trading Signal Editor */}
      <TradingSignalEditor
        analysis={analysis}
        cryptoSymbol={cryptoSymbol}
        onAnalysisUpdate={onAnalysisUpdate}
      />

      {/* Bouton d'ajout aux signaux */}
      <motion.div
        className="mt-4 pt-4 border-t border-gray-700/30"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <AddToSignalsButton 
          crypto={{ 
            id: cryptoSymbol.toLowerCase(), 
            symbol: cryptoSymbol, 
            name: cryptoSymbol.toUpperCase(),
            image: `https://assets.coingecko.com/coins/images/1/small/${cryptoSymbol}.png`
          }}
          analysis={analysis}
        />
      </motion.div>
    </motion.div>
  );
};