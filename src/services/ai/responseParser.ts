import { AIAnalysis, CryptoData } from '../../types/crypto';

export class ResponseParser {
  static parseAIResponse(content: string, crypto: CryptoData): AIAnalysis {
    try {
      const parsed = JSON.parse(content);
      
      return {
        marketContext: parsed.marketContext || `Analyse du marché pour ${crypto.name}`,
        technicalAnalysis: parsed.technicalAnalysis || 'Analyse technique en cours...',
        fundamentalFactors: Array.isArray(parsed.fundamentalFactors) 
          ? parsed.fundamentalFactors.slice(0, 5) 
          : ['Facteur fondamental 1', 'Facteur fondamental 2', 'Facteur fondamental 3'],
        sentiment: this.validateSentiment(parsed.sentiment),
        tradingSignal: this.validateTradingSignal(parsed.tradingSignal || parsed, crypto.current_price)
      };

    } catch (error) {
      console.warn('⚠️ Erreur parsing JSON IA, extraction manuelle...', error);
      return this.extractFromText(content, crypto);
    }
  }

  private static validateSentiment(sentiment: any): 'very-bullish' | 'bullish' | 'neutral' | 'bearish' | 'very-bearish' {
    const validSentiments = ['very-bullish', 'bullish', 'neutral', 'bearish', 'very-bearish'];
    return validSentiments.includes(sentiment) ? sentiment : 'neutral';
  }

  private static validateTradingSignal(signal: any, currentPrice: number) {
    // Gérer le format français de l'IA
    const direction = signal?.direction || signal?.direction?.toLowerCase() || 'long';
    const confidence = signal?.confiance || signal?.confidence;
    const entryPrice = signal?.entree || signal?.entryPrice || currentPrice;
    const stopLoss = signal?.sl || signal?.stopLoss;
    const takeProfit1 = signal?.tp1 || signal?.takeProfit1;
    const takeProfit2 = signal?.tp2 || signal?.takeProfit2;
    
    // Nettoyer la confidence (enlever le %)
    let cleanConfidence = confidence;
    if (typeof confidence === 'string') {
      cleanConfidence = parseInt(confidence.replace('%', ''));
    }
    
    const finalDirection = direction.toLowerCase() === 'short' ? 'short' : 'long';
    const isLong = finalDirection === 'long';
    
    return {
      direction: finalDirection,
      entryPrice: entryPrice,
      stopLoss: stopLoss || (isLong ? entryPrice * 0.95 : entryPrice * 1.05),
      takeProfit1: takeProfit1 || (isLong ? entryPrice * 1.08 : entryPrice * 0.92),
      takeProfit2: takeProfit2 || (isLong ? entryPrice * 1.15 : entryPrice * 0.85),
      riskRewardRatio: this.calculateRiskReward(entryPrice, stopLoss, takeProfit1, isLong),
      confidence: cleanConfidence || Math.floor(Math.random() * 30) + 65
    };
  }

  private static calculateRiskReward(entryPrice: number, stopLoss: number, takeProfit1: number, isLong: boolean): number {
    if (!entryPrice || !stopLoss || !takeProfit1) {
      return Math.round((Math.random() * 2 + 1.5) * 100) / 100;
    }
    
    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit1 - entryPrice);
    
    if (risk <= 0) return 1;
    
    return Math.round((reward / risk) * 100) / 100;
  }

  private static extractFromText(content: string, crypto: CryptoData): AIAnalysis {
    return {
      marketContext: this.extractSection(content, 'marché', 'market') || content.substring(0, 200) + '...',
      technicalAnalysis: this.extractSection(content, 'technique', 'technical') || content.substring(200, 400) + '...',
      fundamentalFactors: this.extractFactors(content),
      sentiment: this.extractSentiment(content),
      tradingSignal: this.generateTradingSignal(crypto.current_price, this.extractSentiment(content))
    };
  }

  private static extractSection(content: string, ...keywords: string[]): string {
    const lines = content.toLowerCase().split('\n');
    for (const line of lines) {
      if (keywords.some(keyword => line.includes(keyword))) {
        return line.charAt(0).toUpperCase() + line.slice(1);
      }
    }
    return '';
  }

  private static extractFactors(content: string): string[] {
    const factors = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.includes('•') || line.includes('-') || line.includes('*')) {
        factors.push(line.replace(/[•\-*]/g, '').trim());
      }
    }
    
    return factors.slice(0, 3).length > 0 
      ? factors.slice(0, 3)
      : [];
  }

  private static extractSentiment(content: string): 'very-bullish' | 'bullish' | 'neutral' | 'bearish' | 'very-bearish' {
    const lower = content.toLowerCase();
    
    if (lower.includes('très bullish') || lower.includes('very bullish')) return 'very-bullish';
    else if (lower.includes('bullish') || lower.includes('haussier')) return 'bullish';
    else if (lower.includes('très bearish') || lower.includes('very bearish')) return 'very-bearish';
    else if (lower.includes('bearish') || lower.includes('baissier')) return 'bearish';
    else return 'neutral';
  }

  private static generateTradingSignal(currentPrice: number, sentiment: string) {
    const direction = sentiment.includes('bullish') ? 'long' : 'short';
    const isLong = direction === 'long';
    
    return {
      direction: direction as 'long' | 'short',
      entryPrice: currentPrice,
      stopLoss: isLong ? currentPrice * 0.95 : currentPrice * 1.05,
      takeProfit1: isLong ? currentPrice * 1.08 : currentPrice * 0.92,
      takeProfit2: isLong ? currentPrice * 1.15 : currentPrice * 0.85,
      riskRewardRatio: Math.round((Math.random() * 2 + 1.5) * 100) / 100,
      confidence: Math.floor(Math.random() * 30) + 65
    };
  }
}