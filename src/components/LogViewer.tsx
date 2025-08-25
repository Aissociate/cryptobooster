import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, 
  Download, 
  Trash2, 
  Filter,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle
} from 'lucide-react';
import { Logger, LogEntry } from '../services/logService';

interface LogViewerProps {
  isVisible: boolean;
  onToggle: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ isVisible, onToggle }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'all' | 'API' | 'AI' | 'CHART' | 'SYSTEM'>('all');
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warning' | 'error' | 'success'>('all');

  useEffect(() => {
    const unsubscribe = Logger.subscribe(setLogs);
    return unsubscribe;
  }, []);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.category !== filter) return false;
    if (levelFilter !== 'all' && log.level !== levelFilter) return false;
    return true;
  });

  const handleExport = () => {
    const data = Logger.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cryptoai-logs-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tous les logs ?')) {
      Logger.clearLogs();
    }
  };

  const getLevelIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return <Info className="w-4 h-4 text-blue-400" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      case 'error': return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'info': return 'border-l-blue-500 bg-blue-500/5';
      case 'success': return 'border-l-emerald-500 bg-emerald-500/5';
      case 'warning': return 'border-l-yellow-500 bg-yellow-500/5';
      case 'error': return 'border-l-red-500 bg-red-500/5';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header avec toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-green-400" />
          <h3 className="text-white font-semibold">Logs Système</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400 text-sm">
              {logs.length} entrées
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleExport}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            title="Exporter les logs"
          >
            <Download className="w-4 h-4 text-gray-400" />
          </motion.button>
          
          <motion.button
            onClick={handleClear}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
            title="Effacer les logs"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </motion.button>
          
          <motion.button
            onClick={onToggle}
            className="p-2 hover:bg-gray-800/50 rounded-lg transition-colors"
            whileHover={{ scale: 1.1 }}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4 text-gray-400" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400" />
            )}
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4 overflow-hidden"
          >
            {/* Filtres */}
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              
              {/* Filtre par catégorie */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="all">Toutes catégories</option>
                <option value="API">API</option>
                <option value="AI">IA</option>
                <option value="CHART">Graphiques</option>
                <option value="SYSTEM">Système</option>
              </select>
              
              {/* Filtre par niveau */}
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as any)}
                className="bg-gray-800/50 border border-gray-700/50 rounded-lg px-3 py-1 text-white text-sm"
              >
                <option value="all">Tous niveaux</option>
                <option value="info">Info</option>
                <option value="success">Succès</option>
                <option value="warning">Avertissement</option>
                <option value="error">Erreur</option>
              </select>
              
              <span className="text-gray-400 text-sm ml-auto">
                {filteredLogs.length} / {logs.length} logs affichés
              </span>
            </div>

            {/* Liste des logs */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              <AnimatePresence>
                {filteredLogs.map((log, index) => (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.02 }}
                    className={`
                      border-l-4 p-3 rounded-r-lg backdrop-blur-sm
                      ${getLevelColor(log.level)}
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getLevelIcon(log.level)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-gray-700/50 text-gray-300 text-xs px-2 py-0.5 rounded">
                            {log.category}
                          </span>
                          
                          {log.crypto && (
                            <span className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded">
                              {log.crypto.toUpperCase()}
                            </span>
                          )}
                          
                          <span className="text-gray-500 text-xs ml-auto">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-1">
                          {log.message}
                        </p>
                        
                        {log.details && (
                          <details className="mt-2">
                            <summary className="text-gray-400 text-xs cursor-pointer hover:text-gray-300">
                              Détails
                            </summary>
                            <pre className="text-gray-400 text-xs mt-1 p-2 bg-gray-800/30 rounded overflow-x-auto">
                              {typeof log.details === 'string' 
                                ? log.details 
                                : JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Aucun log correspondant aux filtres sélectionnés
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};