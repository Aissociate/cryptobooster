import { useState } from 'react';
import { useAuth } from './useAuth';
import { CryptoAnalysisService } from '../services/cryptoAnalysisService';
import { EnhancedCrypto } from '../types/crypto';

export const useAnalyzeAll = () => {
  const [isAnalyzingAll, setIsAnalyzingAll] = useState(false);
  const { user, hasPermission } = useAuth();

  const handleAnalyzeAllCryptos = async (
    cryptos: EnhancedCrypto[],
    analyzeAllLimit: number,
    analysisPrompt: string,
    selectedAIModel: string,
    aiConfig: any,
    updateSingleCrypto: (crypto: EnhancedCrypto) => void
  ) => {
    if (!hasPermission('access_admin_panel')) {
      return;
    }

    if (isAnalyzingAll) {
      return;
    }

    setIsAnalyzingAll(true);

    try {
      await CryptoAnalysisService.analyzeAllCryptos(
        cryptos,
        analyzeAllLimit,
        analysisPrompt,
        selectedAIModel,
        aiConfig,
        updateSingleCrypto,
        user?.id
      );
    } catch (error) {
      console.error('Erreur analyse all:', error);
    } finally {
      setIsAnalyzingAll(false);
    }
  };

  return {
    isAnalyzingAll,
    handleAnalyzeAllCryptos
  };
};