import { CryptoData, EnhancedCrypto, TimeframeData, TrendIndicator } from '../../types/crypto';

export class CryptoDataEnhancer {
  /**
   * Enhances raw crypto data with additional calculated fields
   */
  static enhanceCryptoData(cryptoData: CryptoData): EnhancedCrypto {
    // Generate timeframe data based on price changes
    const timeframes: TimeframeData = {
      '1W': cryptoData.price_change_percentage_7d_in_currency || 0,
      '1D': cryptoData.price_change_percentage_24h_in_currency || 0,
      '12H': (cryptoData.price_change_percentage_24h_in_currency || 0) * 0.6, // Estimate 12h from 24h
      '4H': (cryptoData.price_change_percentage_24h_in_currency || 0) * 0.25, // Estimate 4h from 24h
      '1H': cryptoData.price_change_percentage_1h_in_currency || 0
    };

    // Generate trend indicators based on price changes
    const trends: Record<keyof TimeframeData, TrendIndicator> = {
      '1W': this.calculateTrend(timeframes['1W']),
      '1D': this.calculateTrend(timeframes['1D']),
      '12H': this.calculateTrend(timeframes['12H']),
      '4H': this.calculateTrend(timeframes['4H']),
      '1H': this.calculateTrend(timeframes['1H'])
    };

    // Calculate AI Score based on multiple factors
    const aiScore = this.calculateAIScore(cryptoData, timeframes);

    return {
      ...cryptoData,
      timeframes,
      trends,
      aiScore
    };
  }

  /**
   * Calculate trend indicator based on price change percentage
   */
  private static calculateTrend(changePercent: number): TrendIndicator {
    const absChange = Math.abs(changePercent);
    
    if (changePercent > 5) {
      return { trend: 'bullish', strength: Math.min(10, Math.round(absChange / 2)) };
    } else if (changePercent > 2) {
      return { trend: 'bullish', strength: Math.min(8, Math.round(absChange)) };
    } else if (changePercent > -2) {
      return { trend: 'neutral', strength: Math.max(1, Math.round(absChange)) };
    } else if (changePercent > -5) {
      return { trend: 'bearish', strength: Math.min(8, Math.round(absChange)) };
    } else {
      return { trend: 'bearish', strength: Math.min(10, Math.round(absChange / 2)) };
    }
  }

  /**
   * Calculate AI Score based on various factors
   */
  private static calculateAIScore(crypto: CryptoData, timeframes: TimeframeData): number {
    let score = 50; // Base score

    // Market cap rank bonus (lower rank = higher score)
    if (crypto.market_cap_rank <= 10) {
      score += 15;
    } else if (crypto.market_cap_rank <= 50) {
      score += 10;
    } else if (crypto.market_cap_rank <= 100) {
      score += 5;
    }

    // Price momentum score
    const avgChange = (
      timeframes['1H'] + 
      timeframes['4H'] + 
      timeframes['1D'] + 
      timeframes['1W']
    ) / 4;

    if (avgChange > 10) {
      score += 20;
    } else if (avgChange > 5) {
      score += 15;
    } else if (avgChange > 0) {
      score += 10;
    } else if (avgChange > -5) {
      score -= 5;
    } else {
      score -= 15;
    }

    // Volume factor
    if (crypto.volume_24h && crypto.market_cap) {
      const volumeRatio = crypto.volume_24h / crypto.market_cap;
      if (volumeRatio > 0.5) {
        score += 10;
      } else if (volumeRatio > 0.2) {
        score += 5;
      }
    }

    // Ensure score is between 1 and 95
    return Math.max(1, Math.min(95, Math.round(score)));
  }
}