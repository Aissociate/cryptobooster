import { CryptoData } from '../../types/crypto';
import type { ChartUrls } from '../chart/chartTypes';

export class PromptBuilder {
  static buildCryptoContext(crypto: CryptoData, chartUrls?: ChartUrls): string {
    let context = `
DONNÉES CRYPTO À ANALYSER:
- Nom: ${crypto.name} (${crypto.symbol.toUpperCase()})
- Prix actuel: $${crypto.current_price.toLocaleString()}
- Market Cap: $${crypto.market_cap.toLocaleString()}
- Rang: #${crypto.market_cap_rank}
- Volume 24h: $${crypto.volume_24h?.toLocaleString() || 'N/A'}
- Supply circulant: ${crypto.circulating_supply?.toLocaleString() || 'N/A'}
- Supply total: ${crypto.total_supply?.toLocaleString() || 'N/A'}
- Variation 1h: ${crypto.price_change_percentage_1h_in_currency?.toFixed(2) || 'N/A'}%
- Variation 24h: ${crypto.price_change_percentage_24h_in_currency?.toFixed(2) || 'N/A'}%
- Variation 7j: ${crypto.price_change_percentage_7d_in_currency?.toFixed(2) || 'N/A'}%
- Variation 30j: ${crypto.price_change_percentage_30d_in_currency?.toFixed(2) || 'N/A'}%
    `.trim();

    if (chartUrls) {
      context += `\n\nGRAPHIQUES TECHNIQUES DISPONIBLES:
- Graphique Weekly (1W): ${chartUrls.W}
- Graphique Daily (1D): ${chartUrls.D}
- Graphique 12H: ${chartUrls["12H"]}
- Graphique 4H: ${chartUrls["4H"]}
- Graphique 1H: ${chartUrls["1H"]}

NOTE: Ces graphiques montrent l'évolution des prix sur différentes unités de temps.`;
    }

    // Ajouter informations sur l'analyse de patterns
    context += `\n\nANALYSE DE PATTERNS CHARTISTES:
Patterns disponibles: Double Top/Bottom, Triangle Ascendant/Descendant, Tête et Épaules, Cup & Handle, etc.
Timeframes analysés: Monthly (4x), Weekly (3x), Daily (2x), 4H (1.5x), 1H (1x)
Momentum: Continuation alignée (+20%), Retournement zone (+25%), Neutre (0%), Contre-tendance (-10%)

NOTE: L'analyse multi-timeframes permet de détecter des convergences de patterns pour des signaux plus fiables.`;
    return context;
  }

  static buildFullPrompt(analysisPrompt: string, cryptoContext: string): string {
    return `${analysisPrompt}\n\n${cryptoContext}\n\nFournis une analyse structurée au format JSON`;
  }
}