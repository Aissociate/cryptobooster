import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { AuthModal } from './components/AuthModal';
import { RoleGuard } from './components/RoleGuard';
import { SearchAndFilters } from './components/SearchAndFilters';
import { CryptoRow } from './components/CryptoRow';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AdminPanel } from './components/AdminPanel';
import { TradingSignalsPanel } from './components/TradingSignalsPanel';
import { AuthButtons } from './components/common/AuthButtons';
import { RefreshControls } from './components/common/RefreshControls';
import { TableHeader } from './components/common/TableHeader';
import { useAuth } from './hooks/useAuth';
import { useCryptoData } from './hooks/useCryptoData';
import { useFilters } from './hooks/useFilters';
import { useAppState } from './hooks/useAppState';
import { useAnalyzeAll } from './hooks/useAnalyzeAll';

function AppContent() {
  // Show landing page for now - you can add a state to toggle between landing and app
  const [showLandingPage, setShowLandingPage] = useState(true);
  
  const { isAuthenticated, hasPermission } = useAuth();
  const { cryptos, loading, refreshing, lastRefresh, fetchCryptos, updateSingleCrypto } = useCryptoData();
  const { searchTerm, setSearchTerm, selectedFilter, setSelectedFilter, filteredCryptos } = useFilters(cryptos);
  const { 
    selectedAIModel,
    aiConfig,
    analysisPrompt,
    showAdminPanel,
    showAuthModal,
    authModalMode,
    showSignalsPanel,
    analyzeAllLimit,
    setShowAdminPanel,
    setShowAuthModal,
    setAuthModalMode,
    setShowSignalsPanel,
    setAnalyzeAllLimit,
    handleModelChange,
    handleConfigChange,
    handlePromptChange
  } = useAppState();
  
  const { isAnalyzingAll, handleAnalyzeAllCryptos } = useAnalyzeAll();

  // Show landing page
  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
  }

  const handleAnalyzeAll = () => {
    handleAnalyzeAllCryptos(
      cryptos, analyzeAllLimit, analysisPrompt, 
      selectedAIModel, aiConfig, updateSingleCrypto
    );
  };

  const handleAuthAccess = (mode: 'login' | 'register' = 'login') => {
    // Forcer l'inscription pour les visiteurs
    setAuthModalMode(isAuthenticated ? mode : 'register');
    setShowAuthModal(true);
  };

  const handleRefreshAll = async () => {
    await fetchCryptos(false);
  };

  const timeframeHeaders = ['1W', '1D', '12H', '4H', '1H'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex-1">
            <Header 
              onAdminAccess={() => setShowAdminPanel(true)}
              onAuthAccess={handleAuthAccess}
              onAnalyzeAll={handleAnalyzeAll}
              isAnalyzingAll={isAnalyzingAll}
            />
          </div>
          
          {/* User Profile / Auth Buttons */}
          <div className="flex items-center gap-4">
            <AuthButtons
              isAuthenticated={isAuthenticated}
              hasSignalPermission={hasPermission('generate_trading_signals')}
              onAuthAccess={handleAuthAccess}
              onShowSignals={() => setShowSignalsPanel(true)}
            />
          </div>
        </div>

        <SearchAndFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        <RefreshControls
          refreshing={refreshing}
          lastRefresh={lastRefresh}
          onRefreshAll={handleRefreshAll}
        />
        
        <TableHeader timeframeHeaders={timeframeHeaders} />

        {/* Crypto List */}
        <AnimatePresence mode="wait">
          {loading ? (
            <LoadingSpinner key="loading" />
          ) : (
            <motion.div
              key="crypto-list"
              className="space-y-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {filteredCryptos.length === 0 ? (
                <motion.div
                  className="text-center py-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-gray-400 text-lg">
                    No cryptocurrencies found matching your criteria.
                  </p>
                </motion.div>
              ) : (
                filteredCryptos.map((crypto, index) => (
                  <div key={crypto.id}>
                    <CryptoRow
                      crypto={crypto}
                      index={index}
                      onUpdateCrypto={updateSingleCrypto}
                      analysisPrompt={analysisPrompt}
                      showAIAnalysis={hasPermission('view_ai_analysis')}
                      onAuthRequired={() => handleAuthAccess('register')}
                    />
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.footer
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <p className="text-gray-500 text-sm">
            © 2025 Crypto Booster. Advanced cryptocurrency analysis powered by AI.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Data provided by CoinGecko API. Not financial advice.
          </p>
        </motion.footer>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultMode={authModalMode}
      />

      {/* Admin Panel */}
      <RoleGuard role="admin">
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          selectedModel={selectedAIModel}
          onModelChange={handleModelChange}
          aiConfig={aiConfig}
          onConfigChange={handleConfigChange}
          analysisPrompt={analysisPrompt}
          onPromptChange={handlePromptChange}
        analyzeAllLimit={analyzeAllLimit}
        onAnalyzeAllLimitChange={setAnalyzeAllLimit}
        />
      </RoleGuard>
      
      {/* Trading Signals Panel */}
      <TradingSignalsPanel
        isOpen={showSignalsPanel}
        onClose={() => setShowSignalsPanel(false)}
      />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;