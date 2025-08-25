import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Brain, Check, Sparkles } from 'lucide-react';
import { AIModel, AIConfig } from '../types/crypto';
import { LogViewer } from './LogViewer';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  aiConfig: AIConfig;
  onConfigChange: (config: AIConfig) => void;
  analysisPrompt: string;
  onPromptChange: (prompt: string) => void;
  analyzeAllLimit: number;
  onAnalyzeAllLimitChange: (limit: number) => void;
}

interface AdminPanelState {
  showLogs: boolean;
}

const availableModels: AIModel[] = [
  {
    id: 'deepseek/deepseek-chat-v3.1',
    name: 'DeepSeek Chat v3.1',
    provider: 'DeepSeek',
    description: 'Advanced reasoning model optimized for financial analysis',
    enabled: true
  },
  {
    id: 'anthropic/claude-opus-4.1',
    name: 'Claude Opus 4.1',
    provider: 'Anthropic',
    description: 'Most powerful Claude model for complex market analysis',
    enabled: true
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    description: 'Balanced performance for comprehensive crypto analysis',
    enabled: true
  }
];

export const AdminPanel: React.FC<AdminPanelProps> = ({
  isOpen,
  onClose,
  selectedModel,
  onModelChange,
  aiConfig,
  onConfigChange,
  analysisPrompt,
  onPromptChange,
  analyzeAllLimit,
  onAnalyzeAllLimitChange
}) => {
  const [showLogs, setShowLogs] = React.useState(false);

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
            <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 max-w-5xl w-full mx-4 max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/30 rounded-lg border border-blue-500/20">
                    <Settings className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Admin Panel</h2>
                    <p className="text-gray-400 text-sm">Configuration avancée de l'IA</p>
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

              <div className="space-y-6">
              {/* Logs Viewer */}
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <LogViewer 
                  isVisible={showLogs}
                  onToggle={() => setShowLogs(!showLogs)}
                />
              </div>

              {/* OpenRouter Status */}
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-white font-medium">OpenRouter Status</span>
                </div>
                <div className="text-sm text-gray-300">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span>Service actif - Multiple AI models disponibles</span>
                  </div>
                  <p className="text-gray-400 mt-1">
                    API Key: {import.meta.env.VITE_OPENROUTER_API_KEY ? '✓ Configurée' : '✗ Non configurée'}
                  </p>
                </div>
              </div>

              {/* Model Selector */}
              <div>
                <h3 className="text-white font-semibold flex items-center gap-2">
                  <Brain className="w-4 h-4 text-blue-300" />
                  Sélecteur de Modèle IA
                </h3>
                <p className="text-gray-400 text-sm mb-4">
                  Choisissez le modèle d'IA pour l'analyse des cryptomonnaies
                </p>

                <div className="grid gap-3">
                  {availableModels.map((model) => (
                    <motion.div
                      key={model.id}
                      className={`
                        p-4 rounded-xl border cursor-pointer transition-all duration-300
                        ${selectedModel === model.id
                          ? 'bg-blue-500/20 border-blue-400/70 ring-2 ring-blue-400/30'
                          : 'bg-gray-800/30 border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/50'
                        }
                      `}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onModelChange(model.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-medium">{model.name}</h4>
                            <span className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full">
                              {model.provider}
                            </span>
                            {selectedModel === model.id && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="p-1 bg-blue-500/30 rounded-full"
                              >
                                <Check className="w-3 h-3 text-blue-300" />
                              </motion.div>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{model.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Additional Content for Testing Scroll */}
              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Configuration Analyse All Cryptos
                </h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Limite de cryptos à analyser</span>
                      <span className="text-purple-400 text-sm">{analyzeAllLimit}</span>
                    </div>
                    <input
                      type="range"
                     min="0"
                      max="50"
                      step="1"
                      value={analyzeAllLimit}
                      onChange={(e) => onAnalyzeAllLimitChange(parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                     <span>0</span>
                      <span>25</span>
                      <span>50</span>
                    </div>
                  </div>
                  <div className="text-gray-400 text-xs p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                   <p className="mb-2">⚠️ <strong>Attention:</strong> 0 = Désactivé • Chaque crypto nécessite:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Génération de 5 graphiques (timeframes)</li>
                      <li>1 appel API OpenRouter pour l'IA</li>
                      <li>Plusieurs appels CoinGecko pour les données</li>
                    </ul>
                    <p className="mt-2 text-purple-300">
                     🚀 Recommandé: 0=OFF • 3-5 cryptos pour tester • 10+ production
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <h4 className="text-white font-semibold mb-3">Configuration Avancée</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Temperature</span>
                      <span className="text-blue-400 text-sm">{aiConfig.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiConfig.temperature}
                      onChange={(e) => onConfigChange({ ...aiConfig, temperature: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Max Tokens</span>
                      <span className="text-blue-400 text-sm">{aiConfig.maxTokens}</span>
                    </div>
                    <input
                      type="range"
                      min="512"
                      max="4096"
                      step="256"
                      value={aiConfig.maxTokens}
                      onChange={(e) => onConfigChange({ ...aiConfig, maxTokens: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Top P</span>
                      <span className="text-blue-400 text-sm">{aiConfig.topP}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.1"
                      value={aiConfig.topP}
                      onChange={(e) => onConfigChange({ ...aiConfig, topP: parseFloat(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-800/30 rounded-xl border border-gray-700/30">
                <h4 className="text-white font-semibold mb-3">Prompt d'Analyse</h4>
                <div className="space-y-3">
                  <textarea
                    value={analysisPrompt}
                    onChange={(e) => onPromptChange(e.target.value)}
                    className="
                      w-full h-48 p-3 
                      bg-gray-900/50 backdrop-blur-xl border border-gray-700/50 
                      rounded-xl text-white placeholder-gray-400 text-sm
                      focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20
                      transition-all duration-300 resize-none
                    "
                    placeholder="Entrez votre prompt d'analyse personnalisé..."
                  />
                  <p className="text-gray-400 text-xs">
                    Ce prompt sera utilisé pour guider l'analyse IA des cryptomonnaies.
                  </p>
                </div>
              </div>
              {/* Footer */}
              <div className="pt-4 border-t border-gray-700/30">
                <div className="flex items-center justify-between">
                  <p className="text-gray-500 text-xs">
                    ⚠️ Panel d'administration - Accès restreint
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-emerald-400 text-xs">
                      Paramètres sauvegardés automatiquement
                    </span>
                  </div>
                </div>
              </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};