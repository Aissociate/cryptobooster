import { OHLCData, PriceData } from './chartTypes';
import { CHART_CONFIG } from './chartConfig';
import { rateLimiter } from './rateLimiter';
import { ChartHttpClient } from './httpClient';
import { Logger } from '../logService';

export class ChartDataFetcher {
  private static isValidApiKey(apiKey: string | undefined): boolean {
    return !!(apiKey && 
              apiKey.trim() !== '' && 
              apiKey !== 'your_api_key_here' && 
              !apiKey.includes('placeholder'));
  }

  private static generateMockOhlcData(coinId: string, days: number): OHLCData[] {
    const data: OHLCData[] = [];
    const now = Date.now();
    const interval = days > 30 ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000; // 1h or 1d
    
    for (let i = 0; i < Math.min(days * 24, 1000); i++) {
      const ts = now - (i * interval);
      const basePrice = 50000 + Math.sin(i * 0.1) * 10000; // Simulate price movement
      const volatility = 0.02;
      
      const o = basePrice + (Math.random() - 0.5) * basePrice * volatility;
      const c = o + (Math.random() - 0.5) * o * volatility;
      const h = Math.max(o, c) + Math.random() * Math.abs(o - c);
      const l = Math.min(o, c) - Math.random() * Math.abs(o - c);
      
      data.unshift({ ts, o, h, l, c });
    }
    
    Logger.info('CHART', `Génération données OHLC mock pour ${coinId}`, { days, points: data.length });
    return data;
  }

  private static generateMockPriceData(coinId: string, days: number): PriceData[] {
    const data: PriceData[] = [];
    const now = Date.now();
    const interval = days > 30 ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
    
    for (let i = 0; i < Math.min(days * 24, 1000); i++) {
      const ts = now - (i * interval);
      const p = 50000 + Math.sin(i * 0.1) * 10000 + (Math.random() - 0.5) * 5000;
      data.unshift({ ts, p });
    }
    
    Logger.info('CHART', `Génération données price mock pour ${coinId}`, { days, points: data.length });
    return data;
  }

  static async fetchOhlc(coinId: string, days: number): Promise<OHLCData[]> {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
    
    // Check if API key is valid, if not return mock data
    if (!this.isValidApiKey(apiKey)) {
      Logger.warning('CHART', 'Clé API CoinGecko invalide ou manquante - utilisation données mock pour OHLC');
      return this.generateMockOhlcData(coinId, days);
    }
    
    const endpoint = `ohlc-${coinId}-${days}`;
    await rateLimiter.waitForRateLimit(endpoint);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'CryptoAnalyzer/1.0'
    };
    
    Logger.info('CHART', 'Utilisation clé API CoinGecko pour OHLC');
    headers['x-cg-demo-api-key'] = apiKey;

    const url = new URL(`${CHART_CONFIG.COINGECKO_BASE}/coins/${coinId}/ohlc`);
    url.searchParams.set("vs_currency", CHART_CONFIG.VS_CURRENCY);
    url.searchParams.set("days", String(days));
    
    Logger.info('CHART', `Récupération données OHLC pour ${coinId}`, { days, url: url.toString() });
    
    try {
      const r = await ChartHttpClient.fetchWithRetry(url.toString(), { headers });
      const raw = await r.json();
      
      if (!Array.isArray(raw)) {
        throw new Error('Format OHLC invalide');
      }
      
      return raw.map(([ts, o, h, l, c]: [number, number, number, number, number]) => ({ ts, o, h, l, c }));
      
    } catch (error) {
      Logger.error('CHART', `Erreur fetchOhlc pour ${coinId}`, { days, error });
      Logger.warning('CHART', 'Basculement vers données mock suite à erreur API');
      return this.generateMockOhlcData(coinId, days);
    }
  }

  static async fetchPrices(coinId: string, days: number, interval?: string): Promise<PriceData[]> {
    const apiKey = import.meta.env.VITE_COINGECKO_API_KEY;
    
    // Check if API key is valid, if not return mock data
    if (!this.isValidApiKey(apiKey)) {
      Logger.warning('CHART', 'Clé API CoinGecko invalide ou manquante - utilisation données mock pour prices');
      return this.generateMockPriceData(coinId, days);
    }
    
    const endpoint = `prices-${coinId}-${days}-${interval || 'auto'}`;
    await rateLimiter.waitForRateLimit(endpoint);
    
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'CryptoAnalyzer/1.0'
    };
    
    headers['x-cg-demo-api-key'] = apiKey;

    const url = new URL(`${CHART_CONFIG.COINGECKO_BASE}/coins/${coinId}/market_chart`);
    url.searchParams.set("vs_currency", CHART_CONFIG.VS_CURRENCY);
    url.searchParams.set("days", String(days));
    if (interval) url.searchParams.set("interval", interval);
    
    Logger.info('CHART', `Récupération données prices pour ${coinId}`, { days, interval, url: url.toString() });
    
    try {
      const r = await ChartHttpClient.fetchWithRetry(url.toString(), { headers });
      const j = await r.json();
      
      if (!j.prices || !Array.isArray(j.prices)) {
        throw new Error('Format prices invalide');
      }
      
      return j.prices.map(([ts, p]: [number, number]) => ({ ts, p }));
      
    } catch (error) {
      Logger.error('CHART', `Erreur fetchPrices pour ${coinId}`, { days, interval, error });
      Logger.warning('CHART', 'Basculement vers données mock suite à erreur API');
      return this.generateMockPriceData(coinId, days);
    }
  }
}