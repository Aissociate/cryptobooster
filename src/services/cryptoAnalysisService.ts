import { EnhancedCrypto } from '../types/crypto';
import { Logger } from './logService';
import { CryptoService } from './cryptoApi';
import { generateChartUrls } from './chartService';
import { SupabaseCryptoService } from './supabaseCryptoService';

export class CryptoAnalysisService {
  /**
   * Analyse une seule crypto avec graphiques + IA
   */
  static async analyzeSingleCrypto(
    crypto: EnhancedCrypto,
    analysisPrompt: string,
    selectedModel: string,
    aiConfig: any,
    updateCallback: (updatedCrypto: EnhancedCrypto) => void
  ): Promise<EnhancedCrypto> {
    try {
      Logger.info('SYSTEM', `Analyse complète démarrée pour ${crypto.symbol}`);

      // Étape 1: Générer les graphiques
      Logger.info('CHART', `Génération graphiques pour ${crypto.symbol}`);
      const chartUrls = await generateChartUrls(crypto.id);
      
      // Mettre à jour avec les graphiques
      let updatedCrypto = {
        ...crypto,
        chartUrls
      };
      updateCallback(updatedCrypto);
      
      // Attendre un peu pour l'UI
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Étape 2: Analyse IA
      Logger.info('AI', `Analyse IA pour ${crypto.symbol}`);
      const analysis = await CryptoService.getAIAnalysis(
        updatedCrypto,
        analysisPrompt,
        chartUrls,
        selectedModel,
        aiConfig
      );

      // Mettre à jour avec l'analyse
      updatedCrypto = {
        ...updatedCrypto,
        aiAnalysis: analysis,
        aiScore: analysis.isVerified ? analysis.tradingSignal.confidence : updatedCrypto.aiScore
      };
      
      updateCallback(updatedCrypto);
      
      Logger.success('SYSTEM', `✅ Analyse complète terminée pour ${crypto.symbol}`, {
        hasCharts: !!updatedCrypto.chartUrls,
        hasAnalysis: !!updatedCrypto.aiAnalysis,
        newAiScore: updatedCrypto.aiScore
      });

      return updatedCrypto;

    } catch (error) {
      Logger.error('SYSTEM', `❌ Erreur analyse ${crypto.symbol}`, error);
      throw error;
    }
  }

  /**
   * Analyse en masse des cryptos (pour les admins)
   */
  static async analyzeAllCryptos(
    cryptos: EnhancedCrypto[],
    limit: number,
    analysisPrompt: string,
    selectedModel: string,
    aiConfig: any,
    updateCallback: (updatedCrypto: EnhancedCrypto) => void,
    userId?: string
  ): Promise<void> {
    Logger.info('SYSTEM', `🚀 ANALYSE ALL CRYPTOS démarrée (limite: ${limit})`, { 
      totalCryptos: cryptos.length,
      limit: limit,
      aiModel: selectedModel
    });

    try {
      // Prendre les N premières cryptos selon la limite
      const cryptosToAnalyze = cryptos.slice(0, limit);
      
      Logger.info('SYSTEM', `Traitement de ${cryptosToAnalyze.length} cryptos`, {
        cryptos: cryptosToAnalyze.map(c => ({ symbol: c.symbol, aiScore: c.aiScore }))
      });

      // Traitement séquentiel pour éviter de surcharger les APIs
      for (let i = 0; i < cryptosToAnalyze.length; i++) {
        const crypto = cryptosToAnalyze[i];
        
        try {
          Logger.info('SYSTEM', `[${i + 1}/${cryptosToAnalyze.length}] Traitement ${crypto.symbol}...`);

          const updatedCrypto = await this.analyzeSingleCrypto(
            crypto,
            analysisPrompt,
            selectedModel,
            aiConfig,
            updateCallback
          );

          // Sauvegarder en base si utilisateur connecté
          if (userId && import.meta.env.VITE_SUPABASE_URL) {
            try {
              await SupabaseCryptoService.saveAnalysis(updatedCrypto, userId);
              Logger.success('SYSTEM', `Analyse ${crypto.symbol} sauvegardée en Supabase`);
            } catch (error) {
              Logger.warning('SYSTEM', `Erreur sauvegarde Supabase pour ${crypto.symbol}`, error);
            }
          }

          // Pause entre chaque crypto pour éviter le rate limiting
          if (i < cryptosToAnalyze.length - 1) {
            Logger.info('SYSTEM', `Pause de 2s avant le prochain crypto...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
          }

        } catch (error) {
          Logger.error('SYSTEM', `❌ Erreur traitement ${crypto.symbol}`, error);
          // Continue avec les autres cryptos même en cas d'erreur
        }
      }

      // Sauvegarder un snapshot global si connecté
      if (userId && import.meta.env.VITE_SUPABASE_URL) {
        try {
          await SupabaseCryptoService.saveSnapshot(cryptos, userId, 'analyze_all');
          Logger.success('SYSTEM', 'Snapshot global sauvegardé en Supabase');
        } catch (error) {
          Logger.warning('SYSTEM', 'Erreur sauvegarde snapshot global', error);
        }
      }

      Logger.success('SYSTEM', `🎉 ANALYSE ALL CRYPTOS terminée !`, {
        processed: limit,
        duration: 'Plusieurs minutes',
        savedToDatabase: !!userId && !!import.meta.env.VITE_SUPABASE_URL
      });

    } catch (error) {
      Logger.error('SYSTEM', 'Erreur générale ANALYSE ALL CRYPTOS', error);
      throw error;
    }
  }
}