import React from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  BarChart3, 
  Shield, 
  Database, 
  Code,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface JsonDisplayProps {
  jsonData: any;
  cryptoSymbol: string;
}

export const JsonDisplay: React.FC<JsonDisplayProps> = ({ jsonData, cryptoSymbol }) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-gray-800/20 rounded-xl border border-gray-700/20 overflow-hidden"
    >
      <div className="divide-y divide-gray-700/20">
        {/* Signal Principal */}
        <div className="p-4">
          <h5 className="text-blue-400 font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5" />
            Signal de Trading Principal
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Crypto</div>
              <div className="text-white font-mono text-lg font-bold">{jsonData.Crypto || cryptoSymbol.toUpperCase()}</div>
            </div>
            
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Score</div>
              <div className="text-yellow-400 font-mono text-lg font-bold">{jsonData.score || 0}</div>
            </div>
            
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Confiance</div>
              <div className="text-emerald-400 font-mono text-lg font-bold">{jsonData.confiance || '0%'}</div>
            </div>
            
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Direction</div>
              <div className={`font-mono text-lg font-bold flex items-center gap-1 ${
                jsonData.direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {jsonData.direction === 'LONG' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {jsonData.direction || 'LONG'}
              </div>
            </div>
            
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/30">
              <div className="text-gray-400 text-xs uppercase tracking-wide mb-1">Signal Global</div>
              <div className="text-purple-400 font-medium text-sm">{jsonData.signal_global || ''}</div>
            </div>
          </div>
          
          {/* Prix de trading */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
              <div className="text-blue-400 text-xs uppercase tracking-wide mb-1">Entrée</div>
              <div className="text-white font-mono text-lg">${jsonData.entree || 0}</div>
            </div>
            
            <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <div className="text-red-400 text-xs uppercase tracking-wide mb-1">Stop Loss</div>
              <div className="text-white font-mono text-lg">${jsonData.sl || 0}</div>
            </div>
            
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <div className="text-emerald-400 text-xs uppercase tracking-wide mb-1">TP1</div>
              <div className="text-white font-mono text-lg">${jsonData.tp1 || 0}</div>
            </div>
            
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <div className="text-emerald-400 text-xs uppercase tracking-wide mb-1">TP2</div>
              <div className="text-white font-mono text-lg">${jsonData.tp2 || 0}</div>
            </div>
          </div>
        </div>

        {/* Multi-Timeframes */}
        <div className="p-4">
          <h5 className="text-purple-400 font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analyse Multi-Timeframes
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
            {[
              { key: 'Weekly', label: 'WEEKLY', color: 'text-orange-400' },
              { key: 'Daily', label: 'DAILY', color: 'text-green-400' },
              { key: '12H', label: '12H', color: 'text-blue-400' },
              { key: '4H', label: '4H', color: 'text-cyan-400' },
              { key: '1H', label: '1H', color: 'text-yellow-400' }
            ].map(({ key, label, color }) => (
              <div key={key} className="bg-gray-900/40 p-3 rounded-lg border border-gray-600/20">
                <div className={`${color} text-xs font-semibold mb-1`}>{label}</div>
                <div className="text-gray-200 text-sm">{jsonData[key] || ''}</div>
              </div>
            ))}
          </div>
          
          {/* Scores et patterns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <div className="text-emerald-400 text-sm font-medium mb-1">Score Bullish</div>
              <div className="text-white font-mono text-xl">{jsonData.score_bullish || 0}</div>
            </div>
            
            <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <div className="text-red-400 text-sm font-medium mb-1">Score Bearish</div>
              <div className="text-white font-mono text-xl">{jsonData.score_bearish || 0}</div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-600/20">
              <div className="text-purple-400 text-sm font-medium mb-1">Pattern le Plus Fort</div>
              <div className="text-gray-200">{jsonData.pattern_plus_fort || ''}</div>
            </div>
            
            <div className="bg-gray-900/40 p-3 rounded-lg border border-gray-600/20">
              <div className="text-blue-400 text-sm font-medium mb-1">Convergence des Signaux</div>
              <div className="text-gray-200">{jsonData.convergence_signaux || ''}</div>
            </div>
          </div>
        </div>

        {/* Niveaux Techniques */}
        <div className="p-4">
          <h5 className="text-cyan-400 font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Niveaux Techniques
          </h5>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <div className="text-red-400 text-xs uppercase tracking-wide mb-1">Support Principal</div>
              <div className="text-white font-mono text-lg">${jsonData.support_principal || 0}</div>
            </div>
            
            <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
              <div className="text-emerald-400 text-xs uppercase tracking-wide mb-1">Résistance Principale</div>
              <div className="text-white font-mono text-lg">${jsonData.resistance_principale || 0}</div>
            </div>
            
            <div className="bg-red-400/10 p-3 rounded-lg border border-red-400/20">
              <div className="text-red-300 text-xs uppercase tracking-wide mb-1">Support Secondaire</div>
              <div className="text-white font-mono text-lg">${jsonData.support_secondaire || 0}</div>
            </div>
            
            <div className="bg-emerald-400/10 p-3 rounded-lg border border-emerald-400/20">
              <div className="text-emerald-300 text-xs uppercase tracking-wide mb-1">Résistance Secondaire</div>
              <div className="text-white font-mono text-lg">${jsonData.resistance_secondaire || 0}</div>
            </div>
          </div>
        </div>

        {/* Raw AI Response */}
        {jsonData.raw_ai_response && (
          <div className="p-4">
            <h5 className="text-orange-400 font-semibold mb-3 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Réponse IA Brute
            </h5>
            <pre className="text-gray-300 text-xs bg-gray-900/60 p-3 rounded-lg overflow-x-auto whitespace-pre-wrap border border-gray-700/30">
              {jsonData.raw_ai_response}
            </pre>
          </div>
        )}

        {/* Métadonnées */}
        <div className="p-4">
          <h5 className="text-gray-400 font-semibold mb-3 flex items-center gap-2">
            <Database className="w-5 h-5" />
            Métadonnées & Horodatage
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Généré le:</span>
              <div className="text-gray-300 font-mono text-xs mt-1">
                {jsonData.metadata?.generated_at ? 
                  new Date(jsonData.metadata.generated_at).toLocaleString('fr-FR') :
                  new Date().toLocaleString('fr-FR')
                }
              </div>
            </div>
            <div>
              <span className="text-gray-500">Statut:</span>
              <span className={`ml-2 text-xs px-2 py-1 rounded-full ${
                jsonData.metadata?.is_verified ? 
                'bg-emerald-500/20 text-emerald-400' : 
                'bg-gray-500/20 text-gray-400'
              }`}>
                {jsonData.metadata?.is_verified ? '✓ Vérifié' : '○ En attente'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};