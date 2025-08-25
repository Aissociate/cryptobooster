import { AIAnalysis, CryptoData } from '../../types/crypto';

export class MockAnalysisProvider {
  static generateMockAnalysis(crypto: CryptoData): AIAnalysis {
    const change24h = crypto.price_change_percentage_24h_in_currency || 0;
    const sentiment = change24h > 5 ? 'very-bullish' : 
                     change24h > 2 ? 'bullish' :
                     change24h > -2 ? 'neutral' :
                     change24h > -5 ? 'bearish' : 'very-bearish';

    const direction = change24h > 0 ? 'long' : 'short';
    const currentPrice = crypto.current_price;
    
    return {
      marketContext: `Analyse détaillée de ${crypto.name} (${crypto.symbol.toUpperCase()}) montrant une tendance ${sentiment === 'bullish' || sentiment === 'very-bullish' ? 'haussière' : sentiment === 'bearish' || sentiment === 'very-bearish' ? 'baissière' : 'neutre'} sur la période analysée.`,
      technicalAnalysis: `L'analyse technique révèle ${change24h > 0 ? 'une dynamique positive avec des indicateurs de momentum favorables' : 'une pression vendeuse avec des signaux de correction'}. Les niveaux de support et résistance sont clairement définis pour optimiser les points d'entrée et de sortie.`,
      fundamentalFactors: [
        'Évolution de la capitalisation de marché',
        'Volume de trading significatif',
        'Sentiment général du marché crypto',
        'Positionnement technique multi-timeframes'
      ],
      sentiment,
      rawAIResponse: `ANALYSE DÉTAILLÉE - ${crypto.name} (${crypto.symbol.toUpperCase()})

🎯 SIGNAL DE TRADING: ${direction.toUpperCase()}
💰 Prix actuel: $${currentPrice.toLocaleString()}
📊 Variation 24h: ${change24h.toFixed(2)}%
🏆 Rang marché: #${crypto.market_cap_rank}

📈 ANALYSE TECHNIQUE:
${direction === 'long' 
  ? '• Momentum haussier confirmé\n• Support technique solide\n• Volume en hausse significative\n• RSI en zone d\'achat favorable'
  : '• Pression vendeuse dominante\n• Résistance technique forte\n• Volume de distribution\n• RSI en zone de survente'
}

💡 RECOMMANDATION:
Signal ${direction.toUpperCase()} avec un niveau de confiance élevé basé sur l'analyse multi-timeframes et les patterns chartistes détectés.

⚠️ GESTION DU RISQUE:
Respecter impérativement les niveaux de stop-loss et take-profit pour une gestion optimale du risque.`,
      tradingSignal: {
        direction: direction as 'long' | 'short',
        entryPrice: currentPrice,
        stopLoss: direction === 'long' ? currentPrice * 0.95 : currentPrice * 1.05,
        takeProfit1: direction === 'long' ? currentPrice * 1.08 : currentPrice * 0.92,
        takeProfit2: direction === 'long' ? currentPrice * 1.15 : currentPrice * 0.85,
        riskRewardRatio: Math.round((Math.random() * 2.5 + 1.5) * 100) / 100,
        confidence: Math.floor(Math.random() * 30) + 65
      }
    };
  }
}