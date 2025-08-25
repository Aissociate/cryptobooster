import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  Brain,
  BarChart3,
  Edit3,
  Save,
  X,
  Eye,
  Sparkles,
  Upload,
  AlertCircle,
  Target
} from 'lucide-react';
import { EnhancedCrypto, AIAnalysis } from '../types/crypto';
import { CryptoService } from '../services/cryptoApi';
import { PriceChange } from './PriceChange';
import { TrendIndicator } from './TrendIndicator';
import { AIAnalysisCard } from './AIAnalysisCard';
import { generateChartUrls } from '../services/chartService';
import { LocalStorageService, STORAGE_KEYS } from '../utils/localStorage';
import { Logger } from '../services/logService';
import { useAuth } from '../contexts/AuthContext';
import { PatternAnalyzer } from '../services/patternAnalyzer';
import { SignalManager } from '../services/signalManager';
import { PriceFormatter } from '../utils/priceFormatter';
import { useAnalysisDatabase } from '../hooks/useAnalysisDatabase';

interface CryptoRowProps {
  crypto: EnhancedCrypto;
  index: number;
  onUpdateCrypto: (crypto: EnhancedCrypto) => void;
  analysisPrompt: string;
  showAIAnalysis: boolean;
  onAuthRequired: () => void;
}

export const CryptoRow: React.FC<CryptoRowProps> = ({ 
  crypto, 
  index, 
  onUpdateCrypto,
  analysisPrompt,
  showAIAnalysis,
  onAuthRequired
}) => {
  const { user, hasRole } = useAuth();
  const { loadAnalysisFromDatabase, saveAnalysisToDatabase } = useAnalysisDatabase();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [isEditingScore, setIsEditingScore] = useState(false);
  const [editScore, setEditScore] = useState(crypto.aiScore.toString());
  const [showCharts, setShowCharts] = useState(false);
  const [isLoadingCharts, setIsLoadingCharts] = useState(false);
  const [isLoadingOracle, setIsLoadingOracle] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasSignal, setHasSignal] = useState(false);

  // Vérifier si ce crypto a déjà un signal
  useEffect(() => {
    const checkSignal = () => {
      setHasSignal(SignalManager.hasPosition(crypto.id));
    };
    
    checkSignal();
    const unsubscribe = SignalManager.subscribe(checkSignal);
    return unsubscribe;
  }, [crypto.id]);

  const handleToggleExpand = () => {
    const willExpand = !isExpanded;
    setIsExpanded(willExpand);
    
    // Charger depuis BDD à l'ouverture
    if (willExpand) {
      loadFromDatabase();
    }
  };

  const loadFromDatabase = async () => {
    setIsLoadingAnalysis(true);
    try {
      const updatedCrypto = await loadAnalysisFromDatabase(crypto);
      onUpdateCrypto(updatedCrypto);
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur chargement BDD', error, crypto.symbol);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleGenerateAIAnalysis = async () => {
    if (!showAIAnalysis) {
      onAuthRequired();
      return;
    }

    // Le bouton IA fait juste l'analyse, pas de workflow auto
    await performAIAnalysis(crypto);
  };

  const performAIAnalysis = async (cryptoWithCharts: EnhancedCrypto) => {
    setIsLoadingAnalysis(true);
    try {
      // Générer une analyse de patterns exemple pour enrichir l'analyse
      const { selection, momentum } = PatternAnalyzer.generateRandomSelection();
      const patternAnalysis = PatternAnalyzer.analyzePatterns(selection, momentum);
      
      Logger.info('SYSTEM', 'Analyse de patterns générée', { 
        signal: patternAnalysis.signal, 
        confidence: patternAnalysis.confidence,
        strongestPattern: patternAnalysis.details.strongestPattern
      }, cryptoWithCharts.symbol);

      const selectedModel = LocalStorageService.getItem(STORAGE_KEYS.AI_MODEL, 'deepseek/deepseek-chat-v3.1');
      const aiConfig = LocalStorageService.getItem(STORAGE_KEYS.AI_CONFIG, {
        temperature: 0.7,
        maxTokens: 2048,
        topP: 0.9
      });

      // Enrichir le prompt d'analyse avec les données de patterns
      const enrichedPrompt = `${analysisPrompt}

ANALYSE DE PATTERNS CHARTISTES DÉTECTÉE:
- Signal global: ${patternAnalysis.signal} (${patternAnalysis.confidence}% de confiance)
- Score Bullish: ${patternAnalysis.bull}
- Score Bearish: ${patternAnalysis.bear}
- Pattern le plus fort: ${patternAnalysis.details.strongestPattern}
- Timeframes dominants: ${patternAnalysis.details.dominantTimeframes.join(', ')}

Utilise ces informations de patterns pour enrichir ton analyse technique.`;

      const analysis = await CryptoService.getAIAnalysis(
        cryptoWithCharts,
        enrichedPrompt,
        cryptoWithCharts.chartUrls,
        selectedModel,
        aiConfig
      );

      const updatedCrypto = {
        ...cryptoWithCharts,
        aiAnalysis: {
          ...analysis,
          patternAnalysis // Ajouter l'analyse de patterns aux données
        },
        // Mettre à jour le AI Score si le signal est vérifié
        aiScore: analysis.isVerified ? analysis.tradingSignal.confidence : cryptoWithCharts.aiScore
      };

      onUpdateCrypto(updatedCrypto);
      Logger.success('SYSTEM', `Analyse IA terminée pour ${cryptoWithCharts.symbol}`, { 
        hasAnalysis: !!updatedCrypto.aiAnalysis,
        confidence: analysis.tradingSignal.confidence
      });

      // Sauvegarder en base de données
      await saveAnalysisToDatabase(updatedCrypto);
      
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur génération analyse IA', error, cryptoWithCharts.symbol);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleAnalysisUpdate = (updatedAnalysis: AIAnalysis) => {
    const updatedCrypto = {
      ...crypto,
      aiAnalysis: updatedAnalysis,
      // Mettre à jour le AI Score avec la nouvelle confidence si vérifié
      aiScore: updatedAnalysis.isVerified ? updatedAnalysis.tradingSignal.confidence : crypto.aiScore
    };

    onUpdateCrypto(updatedCrypto);
    
    Logger.success('SYSTEM', `Signal vérifié et mis à jour pour ${crypto.symbol}`, {
      newConfidence: updatedAnalysis.tradingSignal.confidence,
      newAIScore: updatedCrypto.aiScore,
      isVerified: updatedAnalysis.isVerified
    });
  };

  const handleGenerateCharts = async () => {
    setIsLoadingCharts(true);
    try {
      const chartUrls = await generateChartUrls(crypto.id);
      
      const updatedCrypto = {
        ...crypto,
        chartUrls
      };

      onUpdateCrypto(updatedCrypto);
      setShowCharts(true);
    } catch (error) {
      console.error('Error generating charts:', error);
    } finally {
      setIsLoadingCharts(false);
    }
  };

  const handleEditScore = () => {
    setIsEditingScore(true);
    setEditScore(crypto.aiScore.toString());
  };

  const handleSaveScore = () => {
    const newScore = Math.max(1, Math.min(95, parseInt(editScore) || crypto.aiScore));
    
    const updatedCrypto = {
      ...crypto,
      aiScore: newScore,
      aiAnalysis: crypto.aiAnalysis ? {
        ...crypto.aiAnalysis,
        isManuallyEdited: true
      } : undefined
    };

    onUpdateCrypto(updatedCrypto);
    setIsEditingScore(false);
    
    Logger.success('SYSTEM', `Score modifié manuellement pour ${crypto.symbol}`, {
      oldScore: crypto.aiScore,
      newScore,
      user: user?.name
    });
  };

  const handleCancelEdit = () => {
    setIsEditingScore(false);
    setEditScore(crypto.aiScore.toString());
  };

  // Gestion Oracle
  const handleOracle = async () => {
    if (!hasRole('admin') && (!user || user.subscription !== 'premium')) {
      onAuthRequired();
      return;
    }

    // Vérifier le cooldown pour les premium
    if (user?.subscription === 'premium' && !hasRole('admin')) {
      const cooldownKey = `oracle_last_${user.id}_${crypto.id}`;
      const lastUsed = localStorage.getItem(cooldownKey);
      
      if (lastUsed) {
        const timeDiff = Date.now() - parseInt(lastUsed);
        const cooldownMs = 24 * 60 * 60 * 1000; // 24h
        
        if (timeDiff < cooldownMs) {
          const remainingHours = Math.ceil((cooldownMs - timeDiff) / (60 * 60 * 1000));
          alert(`Oracle disponible dans ${remainingHours}h pour les membres premium`);
          return;
        }
      }
    }

    setIsLoadingOracle(true);
    try {
      // Simulation Oracle (remplacer par vraie logique)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Enregistrer l'usage pour premium
      if (user?.subscription === 'premium' && !hasRole('admin')) {
        const cooldownKey = `oracle_last_${user.id}_${crypto.id}`;
        localStorage.setItem(cooldownKey, Date.now().toString());
      }
      
      Logger.success('SYSTEM', `Oracle utilisé pour ${crypto.symbol}`, { user: user?.name });
      alert('Oracle consulté avec succès ! 🔮✨');
      
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur Oracle', error, crypto.symbol);
    } finally {
      setIsLoadingOracle(false);
    }
  };

  // Gestion Publier (admin seulement)
  const handlePublish = async () => {
    if (!hasRole('admin')) {
      return; // Ne devrait pas arriver car le bouton est conditionnel
    }

    // Vérifier que nous avons les données nécessaires
    if (!crypto.chartUrls || !crypto.aiAnalysis) {
      alert('⚠️ Graphiques et analyse IA requis pour la publication');
      return;
    }

    setIsPublishing(true);
    
    try {
      // Préparer le payload pour le webhook
      const webhookPayload = {
        // Métadonnées crypto
        crypto: {
          id: crypto.id,
          symbol: crypto.symbol.toUpperCase(),
          name: crypto.name,
          current_price: crypto.current_price,
          market_cap_rank: crypto.market_cap_rank
        },
        
        // URLs des graphiques par timeframe
        charts: {
          weekly: crypto.chartUrls.W,
          daily: crypto.chartUrls.D,
          "12h": crypto.chartUrls["12H"],
          "4h": crypto.chartUrls["4H"],
          "1h": crypto.chartUrls["1H"]
        },
        
        // Analyse textuelle complète de l'IA
        ai_analysis: {
          raw_response: crypto.aiAnalysis.rawAIResponse || '',
          market_context: crypto.aiAnalysis.marketContext,
          technical_analysis: crypto.aiAnalysis.technicalAnalysis,
          fundamental_factors: crypto.aiAnalysis.fundamentalFactors,
          sentiment: crypto.aiAnalysis.sentiment,
          
          // Signal de trading
          trading_signal: {
            direction: crypto.aiAnalysis.tradingSignal.direction,
            entry_price: crypto.aiAnalysis.tradingSignal.entryPrice,
            stop_loss: crypto.aiAnalysis.tradingSignal.stopLoss,
            take_profit_1: crypto.aiAnalysis.tradingSignal.takeProfit1,
            take_profit_2: crypto.aiAnalysis.tradingSignal.takeProfit2,
            confidence: crypto.aiAnalysis.tradingSignal.confidence,
            risk_reward_ratio: crypto.aiAnalysis.tradingSignal.riskRewardRatio
          },
          
          // Métadonnées d'analyse
          metadata: {
            ai_score: crypto.aiScore,
            is_verified: crypto.aiAnalysis.isVerified || false,
            is_manually_edited: crypto.aiAnalysis.isManuallyEdited || false,
            pattern_analysis: crypto.aiAnalysis.patternAnalysis || null,
            generated_at: new Date().toISOString()
          }
        },
        
        // Informations de publication
        publication: {
          published_by: user?.name || 'Admin',
          published_at: new Date().toISOString(),
          platform: 'CryptoBooster'
        }
      };

      Logger.info('SYSTEM', `Publication webhook démarrée pour ${crypto.symbol}`, {
        hasCharts: !!crypto.chartUrls,
        hasAnalysis: !!crypto.aiAnalysis,
        payloadSize: JSON.stringify(webhookPayload).length
      }, crypto.symbol);

      // URL du webhook (à configurer via variable d'environnement)
      const webhookUrl = import.meta.env.VITE_PUBLISH_WEBHOOK_URL || 'https://hook.eu2.make.com/your-webhook-url';
      
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'CryptoBooster/1.0'
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      
      Logger.success('SYSTEM', `Publication webhook réussie pour ${crypto.symbol}`, {
        status: response.status,
        responseLength: result.length
      }, crypto.symbol);

      alert(`✅ Publication réussie pour ${crypto.symbol.toUpperCase()} !\n📊 Graphiques et analyse IA envoyés`);
      
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur publication webhook', error, crypto.symbol);
      alert(`❌ Erreur de publication pour ${crypto.symbol.toUpperCase()}\n${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsPublishing(false);
    }
    
  };

  const getOracleAccess = () => {
    if (hasRole('admin')) {
      return { canUse: true, badge: '∞', title: 'Admin - Illimité' };
    }
    if (user?.subscription === 'premium') {
      return { canUse: true, badge: '1/jour', title: 'Premium - 1 par jour' };
    }
    return { canUse: false, badge: 'Premium requis', title: 'Accès Premium requis' };
  };

  const oracleAccess = getOracleAccess();

  return (
    <motion.div
      className="bg-gray-900/30 backdrop-blur-xl border border-gray-700/30 rounded-2xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ scale: 1.01, borderColor: 'rgba(99, 102, 241, 0.3)' }}
    >
      {/* Main Row */}
      <div className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Section - Crypto Info */}
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <motion.button
              onClick={handleToggleExpand}
              className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors flex-shrink-0"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </motion.button>

            <div className="flex items-center gap-4 min-w-0 flex-1">
              <img
                src={crypto.image}
                alt={crypto.name}
                className="w-10 h-10 rounded-full flex-shrink-0"
              />
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-white truncate">
                    {crypto.name}
                  </h3>
                  <span className="text-gray-400 font-mono text-sm uppercase">
                    {crypto.symbol}
                  </span>
                  
                  {/* Indicateur signal */}
                  {hasSignal && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 rounded-full border border-emerald-500/30"
                    >
                      <Target className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 text-xs font-medium">Signal</span>
                    </motion.div>
                  )}
                  
                  <span className="text-gray-500 text-sm">
                    #{crypto.market_cap_rank}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-white font-mono font-semibold">
                    {PriceFormatter.formatPrice(crypto.current_price)}
                  </span>
                  <PriceChange 
                    change={crypto.price_change_percentage_24h_in_currency || 0} 
                    size="sm"
                  />
                </div>
              </div>
            </div>

            {/* AI Score avec édition */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {isEditingScore ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="95"
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    className="w-16 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                  />
                  <motion.button
                    onClick={handleSaveScore}
                    className="p-1 text-emerald-400 hover:text-emerald-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Save className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    onClick={handleCancelEdit}
                    className="p-1 text-red-400 hover:text-red-300"
                    whileHover={{ scale: 1.1 }}
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-300">
                      {crypto.aiScore}%
                    </div>
                    <div className="text-xs text-gray-500">AI Score</div>
                  </div>
                  <motion.button
                    onClick={handleEditScore}
                    className="p-1 text-gray-500 hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                  >
                    <Edit3 className="w-3 h-3" />
                  </motion.button>
                </div>
              )}
            </div>
          </div>

          {/* Right Section - Timeframes (Desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            {Object.entries(crypto.timeframes).map(([timeframe, change]) => (
              <div key={timeframe} className="text-center min-w-[80px]">
                <div className="text-xs text-gray-500 mb-1">{timeframe}</div>
                <PriceChange change={change} size="sm" showIcon={false} />
                <div className="mt-1">
                  <TrendIndicator trend={crypto.trends[timeframe as keyof typeof crypto.trends]} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Timeframes */}
        <div className="lg:hidden mt-4 grid grid-cols-5 gap-2">
          {Object.entries(crypto.timeframes).map(([timeframe, change]) => (
            <div key={timeframe} className="text-center">
              <div className="text-xs text-gray-500 mb-1">{timeframe}</div>
              <PriceChange change={change} size="sm" showIcon={false} />
              <div className="mt-1">
                <TrendIndicator trend={crypto.trends[timeframe as keyof typeof crypto.trends]} size="sm" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="border-t border-gray-700/30"
          >
            <div className="p-6 space-y-6">
              {/* Quick Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs">Market Cap</div>
                  <div className="text-white font-semibold">
                    {PriceFormatter.formatMarketValue(crypto.market_cap)}
                  </div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs">Volume 24h</div>
                  <div className="text-white font-semibold">
                    {PriceFormatter.formatMarketValue(crypto.volume_24h)}
                  </div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs">Circulating Supply</div>
                  <div className="text-white font-semibold">
                    {PriceFormatter.formatSupply(crypto.circulating_supply)}
                  </div>
                </div>
                <div className="bg-gray-800/30 p-3 rounded-lg">
                  <div className="text-gray-400 text-xs">Total Supply</div>
                  <div className="text-white font-semibold">
                    {PriceFormatter.formatSupply(crypto.total_supply)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={handleGenerateCharts}
                  disabled={isLoadingCharts}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 rounded-xl font-medium transition-all backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoadingCharts ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <BarChart3 className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isLoadingCharts ? 'Génération...' : 'Générer Graphiques'}
                  </span>
                </motion.button>

                <motion.button
                  onClick={handleGenerateAIAnalysis}
                  disabled={isLoadingAnalysis}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all backdrop-blur-xl disabled:opacity-50 disabled:cursor-not-allowed bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300
                  `}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isLoadingAnalysis ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Brain className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <Brain className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isLoadingAnalysis 
                      ? isLoadingCharts 
                        ? 'Génération graphiques...' 
                        : 'Analyse IA...'
                      : 'Analyse IA'
                    }
                  </span>
                </motion.button>

                {crypto.chartUrls && (
                  <motion.button
                    onClick={() => setShowCharts(!showCharts)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 rounded-xl font-medium transition-all backdrop-blur-xl"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">
                      {showCharts ? 'Masquer Graphiques' : 'Voir Graphiques'}
                    </span>
                  </motion.button>
                )}
              </div>

              {/* Charts Display */}
              {showCharts && crypto.chartUrls && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <h3 className="text-white font-semibold text-lg">Graphiques Multi-Timeframes</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(crypto.chartUrls).map(([timeframe, url]) => (
                      <div key={timeframe} className="bg-gray-800/30 rounded-xl p-4">
                        <h4 className="text-white font-medium mb-3 text-center">{timeframe}</h4>
                        <img
                          src={url}
                          alt={`${crypto.symbol} ${timeframe} Chart`}
                          className="w-full rounded-lg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZCNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycmV1ciBjaGFyZ2VtZW50IGdyYXBoaXF1ZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* AI Analysis Section */}
              {crypto.aiAnalysis ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* Header avec boutons Oracle et Publier */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold text-lg">Rapport d'Analyse IA</h3>
                    
                    <div className="flex items-center gap-3">
                      {/* Bouton Oracle */}
                      <motion.button
                        onClick={handleOracle}
                        disabled={isLoadingOracle || !oracleAccess.canUse}
                        className={`
                          flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all backdrop-blur-xl
                          ${oracleAccess.canUse
                            ? 'bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300'
                            : 'bg-gray-500/20 border border-gray-500/30 text-gray-500 cursor-not-allowed'
                          }
                        `}
                        whileHover={oracleAccess.canUse ? { scale: 1.05 } : {}}
                        whileTap={oracleAccess.canUse ? { scale: 0.95 } : {}}
                        title={oracleAccess.title}
                      >
                        {isLoadingOracle ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <Sparkles className="w-4 h-4" />
                        )}
                        <span className="text-sm">Oracle</span>
                        <span className="text-xs bg-purple-400/20 px-2 py-0.5 rounded-full">
                          {oracleAccess.badge}
                        </span>
                      </motion.button>

                      {/* Bouton Publier (admin seulement) */}
                      {hasRole('admin') && (
                        <motion.button
                          onClick={handlePublish}
                          disabled={isPublishing}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 rounded-xl font-medium transition-all backdrop-blur-xl"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isPublishing ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            >
                              <Upload className="w-4 h-4" />
                            </motion.div>
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          <span className="text-sm">
                            {isPublishing ? 'Publication...' : 'Publier'}
                          </span>
                          <span className="text-xs bg-red-400/20 px-2 py-0.5 rounded-full text-red-300">
                            Admin
                          </span>
                        </motion.button>
                      )}
                    </div>
                  </div>

                  <AIAnalysisCard
                    analysis={crypto.aiAnalysis}
                    cryptoSymbol={crypto.symbol}
                    onAnalysisUpdate={handleAnalysisUpdate}
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-6"
                >
                  <Brain className="w-10 h-10 text-gray-500 mx-auto mb-3" />
                  <h3 className="text-gray-300 font-medium mb-2">
                    Aucune analyse en base de données
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Cliquez sur "Analyse IA" pour générer une nouvelle analyse.
                  </p>
                  
                  {!showAIAnalysis ? (
                    <div className="flex items-center justify-center gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg max-w-sm mx-auto">
                      <AlertCircle className="w-4 h-4 text-blue-400" />
                      <span className="text-blue-400 text-sm">
                        Connexion requise pour accéder à l'analyse IA
                      </span>
                    </div>
                  ) : null}
                </motion.div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};