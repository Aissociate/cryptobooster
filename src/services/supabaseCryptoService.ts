import { supabase } from '../lib/supabase';
import { EnhancedCrypto } from '../types/crypto';
import { Logger } from './logService';

export class SupabaseCryptoService {
  /**
   * Sauvegarde une analyse crypto dans la table crypto_analyses
   */
  static async saveAnalysis(crypto: EnhancedCrypto, userId: string): Promise<void> {
    try {
      Logger.info('SUPABASE', `Sauvegarde analyse ${crypto.symbol}`, { userId }, crypto.symbol);

      if (!crypto.aiAnalysis) {
        Logger.warning('SUPABASE', 'Pas d\'analyse IA à sauvegarder', null, crypto.symbol);
        return;
      }

      const analysisData = {
        crypto_symbol: crypto.symbol,
        crypto_name: crypto.name || '',
        analysis_data: this.formatJsonForStorage(crypto.aiAnalysis),
        score: crypto.aiScore,
        confidence: crypto.aiAnalysis.tradingSignal.confidence,
        direction: crypto.aiAnalysis.tradingSignal.direction || '',
        entry_price: crypto.aiAnalysis.tradingSignal.entryPrice,
        stop_loss: crypto.aiAnalysis.tradingSignal.stopLoss,
        take_profit_1: crypto.aiAnalysis.tradingSignal.takeProfit1,
        take_profit_2: crypto.aiAnalysis.tradingSignal.takeProfit2,
        signal_global: this.extractSignalGlobal(crypto.aiAnalysis),
        score_bullish: this.extractScoreBullish(crypto.aiAnalysis),
        score_bearish: this.extractScoreBearish(crypto.aiAnalysis),
        pattern_plus_fort: this.extractStrongestPattern(crypto.aiAnalysis),
        convergence_signaux: this.extractConvergence(crypto.aiAnalysis),
        support_principal: this.extractSupportLevel(crypto.aiAnalysis),
        resistance_principale: this.extractResistanceLevel(crypto.aiAnalysis),
        support_secondaire: this.extractSecondarySupportLevel(crypto.aiAnalysis),
        resistance_secondaire: this.extractSecondaryResistanceLevel(crypto.aiAnalysis),
        chart_urls: crypto.chartUrls ? {
          weekly: crypto.chartUrls.W,
          daily: crypto.chartUrls.D,
          "12h": crypto.chartUrls["12H"],
          "4h": crypto.chartUrls["4H"],
          "1h": crypto.chartUrls["1H"]
        } : null,
        created_by: userId
      };

      const { error } = await supabase
        .from('crypto_analyses')
        .insert(analysisData);

      if (error) {
        throw error;
      }

      Logger.success('SUPABASE', `Analyse ${crypto.symbol} sauvegardée dans crypto_analyses`, null, crypto.symbol);
    } catch (error) {
      Logger.error('SUPABASE', `Erreur sauvegarde analyse ${crypto.symbol}`, error, crypto.symbol);
      throw error;
    }
  }

  /**
   * Récupère la dernière analyse pour une crypto
   */
  static async getLatestAnalysis(cryptoId: string): Promise<any | null> {
    try {
      const { data, error } = await supabase
        .from('crypto_analyses')
        .select('*')
        .eq('crypto_symbol', cryptoId.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }

      return data;
    } catch (error) {
      Logger.error('SUPABASE', `Erreur récupération analyse ${cryptoId}`, error);
      return null;
    }
  }

  /**
   * Récupère les analyses les plus récentes pour toutes les cryptos
   */
  static async getLatestAnalyses(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('crypto_analyses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      Logger.success('SUPABASE', `${data?.length || 0} analyses récupérées`);
      return data || [];
    } catch (error) {
      Logger.error('SUPABASE', 'Erreur récupération analyses', error);
      return [];
    }
  }

  // Méthodes d'extraction des données depuis l'analyse IA
  private static extractSignalGlobal(analysis: any): string {
    return analysis?.sentiment?.replace('-', ' ') || '';
  }

  private static extractScoreBullish(analysis: any): number {
    return analysis?.patternAnalysis?.bull || 0;
  }

  private static extractScoreBearish(analysis: any): number {
    return analysis?.patternAnalysis?.bear || 0;
  }

  private static extractStrongestPattern(analysis: any): string {
    return analysis?.patternAnalysis?.details?.strongestPattern || '';
  }

  private static extractConvergence(analysis: any): string {
    const dominantTimeframes = analysis?.patternAnalysis?.details?.dominantTimeframes || [];
    return `Positive sur ${dominantTimeframes.length}/5 timeframes`;
  }

  private static extractSupportLevel(analysis: any): number {
    return analysis?.tradingSignal?.stopLoss || 0;
  }

  private static extractResistanceLevel(analysis: any): number {
    return analysis?.tradingSignal?.takeProfit1 || 0;
  }

  private static extractSecondarySupportLevel(analysis: any): number {
    return (analysis?.tradingSignal?.stopLoss || 0) * 1.02;
  }

  private static extractSecondaryResistanceLevel(analysis: any): number {
    return analysis?.tradingSignal?.takeProfit2 || 0;
  }

  /**
   * Sauvegarde un snapshot global des cryptos.
   *
   * Cette méthode construit un objet snapshot contenant la liste des cryptos,
   * un résumé global et des métadonnées, puis insère cet enregistrement dans
   * la table `crypto_snapshots`. Le snapshot est identifié par un `snapshot_id`
   * unique basé sur la date et l'heure d'exécution. Si une erreur survient
   * lors de l'insertion, celle‑ci est journalisée et propagée à l'appelant.
   */
  static async saveSnapshot(cryptos: EnhancedCrypto[], userId: string, snapshotType: string = 'manual'): Promise<void> {
    try {
      Logger.info('SUPABASE', `Sauvegarde snapshot ${snapshotType}`, { 
        userId, 
        cryptoCount: cryptos.length 
      });

      const snapshotData = {
        crypto_id: `snapshot_${Date.now()}`,
        snapshot_data: {
          cryptos: cryptos.map(crypto => ({
            id: crypto.id,
            symbol: crypto.symbol,
            name: crypto.name,
            current_price: crypto.current_price,
            market_cap_rank: crypto.market_cap_rank,
            ai_score: crypto.aiScore,
            has_analysis: !!crypto.aiAnalysis,
            has_charts: !!crypto.chartUrls
          })),
          summary: {
            total_cryptos: cryptos.length,
            with_analysis: cryptos.filter(c => c.aiAnalysis).length,
            with_charts: cryptos.filter(c => c.chartUrls).length,
            avg_ai_score: cryptos.reduce((acc, c) => acc + c.aiScore, 0) / cryptos.length,
            timestamp: new Date().toISOString()
          }
        },
        snapshot_type: snapshotType,
        created_by: userId
      };

      const { error } = await supabase
        .from('crypto_snapshots')
        .insert(snapshotData);

      if (error) {
        throw error;
      }

      Logger.success('SUPABASE', `Snapshot ${snapshotType} sauvegardé`, {
        cryptoCount: cryptos.length
      });
    } catch (error) {
      Logger.error('SUPABASE', `Erreur sauvegarde snapshot ${snapshotType}`, error);
      throw error;
    }
  }

  /**
   * Formate et nettoie le JSON pour le stockage en BDD
   */
  private static formatJsonForStorage(analysis: any): any {
    if (!analysis) return {};
    
    const cleanData = (data: any): any => {
      if (data === null || data === undefined) {
        return '';
      }
      if (Array.isArray(data)) {
        return data.map(item => cleanData(item));
      }
      if (typeof data === 'object') {
        const cleaned: any = {};
        Object.keys(data).forEach(key => {
          cleaned[key] = cleanData(data[key]);
        });
        return cleaned;
      }
      return data;
    };
    
    return {
      market_analysis: {
        sentiment: analysis.sentiment || '',
        market_context: analysis.marketContext || '',
        technical_analysis: analysis.technicalAnalysis || '',
        fundamental_factors: analysis.fundamentalFactors || []
      },
      trading_signal: {
        direction: analysis.tradingSignal?.direction || '',
        entry_price: analysis.tradingSignal?.entryPrice || 0,
        stop_loss: analysis.tradingSignal?.stopLoss || 0,
        take_profit_1: analysis.tradingSignal?.takeProfit1 || 0,
        take_profit_2: analysis.tradingSignal?.takeProfit2 || 0,
        confidence: analysis.tradingSignal?.confidence || 0,
        risk_reward_ratio: analysis.tradingSignal?.riskRewardRatio || 0
      },
      pattern_analysis: analysis.patternAnalysis ? cleanData(analysis.patternAnalysis) : null,
      metadata: {
        is_verified: analysis.isVerified || false,
        is_manually_edited: analysis.isManuallyEdited || false,
        generated_at: new Date().toISOString()
      },
      raw_ai_response: analysis.rawAIResponse || ''
    };
  }

  /**
   * Récupère les analyses sauvegardées pour un utilisateur
   */
  static async getUserAnalyses(userId: string, limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('crypto_analyses')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      Logger.success('SUPABASE', `${data?.length || 0} analyses récupérées pour utilisateur ${userId}`);
      return data || [];
    } catch (error) {
      Logger.error('SUPABASE', 'Erreur récupération analyses utilisateur', error);
      return [];
    }
  }

  /**
   * Récupère les snapshots pour un utilisateur
   */
  static async getUserSnapshots(userId: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('crypto_snapshots')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw error;
      }

      Logger.success('SUPABASE', `${data?.length || 0} snapshots récupérés pour utilisateur ${userId}`);
      return data || [];
    } catch (error) {
      Logger.error('SUPABASE', 'Erreur récupération snapshots utilisateur', error);
      return [];
    }
  }
}