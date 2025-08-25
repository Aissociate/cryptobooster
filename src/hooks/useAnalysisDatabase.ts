import { useState, useCallback } from 'react';
import { EnhancedCrypto } from '../types/crypto';
import { SupabaseAnalysisService } from '../services/database/SupabaseAnalysisService';
import { AnalysisProcessor } from '../services/analysis/AnalysisProcessor';
import { Logger } from '../services/logService';
import { useAuth } from './useAuth';

export const useAnalysisDatabase = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sauvegarde une analyse en BDD
   */
  const saveAnalysisToDatabase = useCallback(async (crypto: EnhancedCrypto): Promise<boolean> => {
    if (!user?.id || !crypto.aiAnalysis) {
      Logger.warning('DATABASE_HOOK', 'Utilisateur ou analyse manquante pour sauvegarde');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const analysisData = AnalysisProcessor.convertToDatabase(crypto, user.id);
      if (!analysisData) {
        throw new Error('Impossible de convertir l\'analyse');
      }

      await SupabaseAnalysisService.saveAnalysis(analysisData);
      Logger.success('DATABASE_HOOK', `Analyse ${crypto.symbol} sauvegardée via hook`);
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de sauvegarde';
      setError(errorMessage);
      Logger.error('DATABASE_HOOK', `Erreur sauvegarde ${crypto.symbol}`, error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  /**
   * Charge une analyse depuis la BDD
   */
  const loadAnalysisFromDatabase = useCallback(async (crypto: EnhancedCrypto): Promise<EnhancedCrypto> => {
    setIsLoading(true);
    setError(null);

    try {
      const dbRecord = await SupabaseAnalysisService.getLatestAnalysis(crypto.symbol);
      if (dbRecord) {
        const enhancedCrypto = AnalysisProcessor.convertFromDatabase(dbRecord, crypto);
        Logger.success('DATABASE_HOOK', `Analyse ${crypto.symbol} chargée depuis BDD`);
        return enhancedCrypto;
      }
      return crypto;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement';
      setError(errorMessage);
      Logger.error('DATABASE_HOOK', `Erreur chargement ${crypto.symbol}`, error);
      return crypto;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Synchronise une analyse (sauvegarde + rechargement)
   */
  const syncAnalysis = useCallback(async (crypto: EnhancedCrypto): Promise<EnhancedCrypto> => {
    // 1. Sauvegarder si nouvelle analyse
    if (crypto.aiAnalysis) {
      await saveAnalysisToDatabase(crypto);
    }

    // 2. Recharger depuis BDD
    return await loadAnalysisFromDatabase(crypto);
  }, [saveAnalysisToDatabase, loadAnalysisFromDatabase]);

  /**
   * Charge toutes les analyses utilisateur
   */
  const loadUserAnalyses = useCallback(async (limit: number = 50) => {
    if (!user?.id) return [];

    setIsLoading(true);
    setError(null);

    try {
      const analyses = await SupabaseAnalysisService.getAnalyses({
        userId: user.id,
        limit,
        orderBy: 'created_at',
        direction: 'desc'
      });

      Logger.success('DATABASE_HOOK', `${analyses.length} analyses utilisateur chargées`);
      return analyses;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur de chargement';
      setError(errorMessage);
      Logger.error('DATABASE_HOOK', 'Erreur chargement analyses utilisateur', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  return {
    isLoading,
    error,
    saveAnalysisToDatabase,
    loadAnalysisFromDatabase,
    syncAnalysis,
    loadUserAnalyses,
    clearError: () => setError(null)
  };
};