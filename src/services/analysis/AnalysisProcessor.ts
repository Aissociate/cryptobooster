import { EnhancedCrypto, AIAnalysis } from '../../types/crypto';
import { AnalysisInsert } from '../database/AnalysisDatabase';
import { Logger } from '../logService';

export class AnalysisProcessor {
  /**
   * Convertit une analyse IA en format BDD
   */
  static convertToDatabase(crypto: EnhancedCrypto, userId: string): AnalysisInsert | null {
    if (!crypto.aiAnalysis) {
      Logger.warning('PROCESSOR', `Pas d'analyse IA pour ${crypto.symbol}`);
      return null;
    }

    const analysis = crypto.aiAnalysis;
    const signal = analysis.tradingSignal;

    return {
      crypto_symbol: crypto.symbol.toLowerCase(),
      // Nom lisible de la cryptomonnaie (utile pour certaines vues ou exports)
      crypto_name: crypto.name,
      analysis_data: this.formatAnalysisData(crypto, analysis),
      score: crypto.aiScore || 0,
      confidence: signal.confidence || 0,
      direction: (signal.direction || 'long').toUpperCase(),
      entry_price: signal.entryPrice || 0,
      stop_loss: signal.stopLoss || 0,
      take_profit_1: signal.takeProfit1 || 0,
      take_profit_2: signal.takeProfit2 || 0,
      signal_global: this.extractSignalGlobal(analysis),
      score_bullish: this.extractBullishScore(analysis),
      score_bearish: this.extractBearishScore(analysis),
      pattern_plus_fort: this.extractStrongestPattern(analysis),
      convergence_signaux: this.extractConvergence(analysis),
      support_principal: signal.stopLoss || 0,
      resistance_principale: signal.takeProfit1 || 0,
      support_secondaire: this.calculateSecondarySupport(signal.stopLoss || 0),
      resistance_secondaire: signal.takeProfit2 || 0,
      created_by: userId
    };
  }

  /**
   * Convertit des données BDD en analyse crypto
   */
  static convertFromDatabase(dbRecord: any, crypto: EnhancedCrypto): EnhancedCrypto {
    if (!dbRecord) return crypto;

    const aiAnalysis: AIAnalysis = {
      marketContext: dbRecord.analysis_data?.market_analysis?.market_context || '',
      technicalAnalysis: dbRecord.analysis_data?.market_analysis?.technical_analysis || '',
      fundamentalFactors: dbRecord.analysis_data?.market_analysis?.fundamental_factors || [],
      sentiment: dbRecord.analysis_data?.market_analysis?.sentiment || 'neutral',
      tradingSignal: {
        direction: dbRecord.direction?.toLowerCase() || 'long',
        entryPrice: dbRecord.entry_price || 0,
        stopLoss: dbRecord.stop_loss || 0,
        takeProfit1: dbRecord.take_profit_1 || 0,
        takeProfit2: dbRecord.take_profit_2 || 0,
        confidence: dbRecord.confidence || 0,
        riskRewardRatio: this.calculateRiskReward(
          dbRecord.entry_price || 0,
          dbRecord.stop_loss || 0,
          dbRecord.take_profit_1 || 0
        )
      },
      rawAIResponse: dbRecord.analysis_data?.raw_ai_response || '',
      isVerified: dbRecord.analysis_data?.metadata?.is_verified || false,
      isManuallyEdited: dbRecord.analysis_data?.metadata?.is_manually_edited || false,
      patternAnalysis: dbRecord.analysis_data?.pattern_analysis || null
    };

    return {
      ...crypto,
      aiAnalysis,
      aiScore: dbRecord.score || crypto.aiScore
    };
  }

  private static formatAnalysisData(crypto: EnhancedCrypto, analysis: AIAnalysis): any {
    return {
      Crypto: crypto.symbol.toUpperCase(),
      score: crypto.aiScore || 0,
      confiance: `${analysis.tradingSignal.confidence || 0}%`,
      direction: (analysis.tradingSignal.direction || 'long').toUpperCase(),
      entree: analysis.tradingSignal.entryPrice || 0,
      sl: analysis.tradingSignal.stopLoss || 0,
      tp1: analysis.tradingSignal.takeProfit1 || 0,
      tp2: analysis.tradingSignal.takeProfit2 || 0,
      Weekly: this.extractTimeframePattern(analysis, 'Weekly'),
      Daily: this.extractTimeframePattern(analysis, 'Daily'),
      "12H": this.extractTimeframePattern(analysis, '12H'),
      "4H": this.extractTimeframePattern(analysis, '4H'),
      "1H": this.extractTimeframePattern(analysis, '1H'),
      signal_global: this.extractSignalGlobal(analysis),
      score_bullish: this.extractBullishScore(analysis),
      score_bearish: this.extractBearishScore(analysis),
      pattern_plus_fort: this.extractStrongestPattern(analysis),
      timeframes_dominants: this.extractDominantTimeframes(analysis),
      convergence_signaux: this.extractConvergence(analysis),
      support_principal: analysis.tradingSignal.stopLoss || 0,
      resistance_principale: analysis.tradingSignal.takeProfit1 || 0,
      support_secondaire: this.calculateSecondarySupport(analysis.tradingSignal.stopLoss || 0),
      resistance_secondaire: analysis.tradingSignal.takeProfit2 || 0,
      market_analysis: {
        sentiment: analysis.sentiment || '',
        market_context: analysis.marketContext || '',
        technical_analysis: analysis.technicalAnalysis || '',
        fundamental_factors: analysis.fundamentalFactors || []
      },
      raw_ai_response: analysis.rawAIResponse || '',
      metadata: {
        is_verified: analysis.isVerified || false,
        is_manually_edited: analysis.isManuallyEdited || false,
        generated_at: new Date().toISOString()
      }
    };
  }

  private static extractSignalGlobal(analysis: AIAnalysis): string {
    return analysis.sentiment?.replace('-', ' ') || '';
  }

  private static extractBullishScore(analysis: AIAnalysis): number {
    return analysis.patternAnalysis?.bull || 0;
  }

  private static extractBearishScore(analysis: AIAnalysis): number {
    return analysis.patternAnalysis?.bear || 0;
  }

  private static extractStrongestPattern(analysis: AIAnalysis): string {
    return analysis.patternAnalysis?.details?.strongestPattern || '';
  }

  private static extractConvergence(analysis: AIAnalysis): string {
    const dominantCount = analysis.patternAnalysis?.details?.dominantTimeframes?.length || 0;
    return `Positive sur ${dominantCount}/5 timeframes`;
  }

  private static extractDominantTimeframes(analysis: AIAnalysis): string[] {
    return analysis.patternAnalysis?.details?.dominantTimeframes || [];
  }

  private static extractTimeframePattern(analysis: AIAnalysis, timeframe: string): string {
    return analysis.patternAnalysis?.details?.patterns?.[timeframe] || '';
  }

  private static calculateSecondarySupport(primarySupport: number): number {
    return Math.round(primarySupport * 1.02 * 100) / 100;
  }

  private static calculateRiskReward(entry: number, stopLoss: number, takeProfit: number): number {
    const risk = Math.abs(entry - stopLoss);
    const reward = Math.abs(takeProfit - entry);
    return risk > 0 ? Math.round((reward / risk) * 100) / 100 : 1;
  }
}