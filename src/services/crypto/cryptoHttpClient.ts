import { Logger } from '../logService';
import { rateLimiter } from '../chart/rateLimiter';
import { CHART_CONFIG } from '../chart/chartConfig';
import { ChartHttpClient } from '../chart/httpClient';

export class CryptoHttpClient {
  private static readonly COINGECKO_API_KEY = import.meta.env.VITE_COINGECKO_API_KEY;

  private static isValidApiKey(apiKey: string | undefined): boolean {
    return !!(apiKey &&
              apiKey.trim() !== '' &&
              apiKey !== 'your_api_key_here' &&
              !apiKey.includes('placeholder'));
  }

  /**
   * Fetches market data for cryptocurrencies from CoinGecko.
   * @param limit The number of cryptocurrencies to fetch.
   * @returns A promise that resolves to an object containing the market data in a 'data' property.
   */
  static async fetchMarketData(limit: number): Promise<{ data: any[] }> {
    const endpoint = `market-data-${limit}`;
    await rateLimiter.waitForRateLimit(endpoint);

    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'CryptoBooster/1.0'
    };

    if (this.isValidApiKey(this.COINGECKO_API_KEY)) {
      Logger.info('API', 'Using CoinGecko API key for market data');
      headers['x-cg-demo-api-key'] = this.COINGECKO_API_KEY;
    } else {
      Logger.warning('API', 'CoinGecko API key is missing or invalid for market data. Proceeding without key.');
    }

    const url = new URL(`${CHART_CONFIG.COINGECKO_BASE}/coins/markets`);
    url.searchParams.set("vs_currency", CHART_CONFIG.VS_CURRENCY);
    url.searchParams.set("order", "market_cap_desc");
    url.searchParams.set("per_page", String(limit));
    url.searchParams.set("page", "1");
    url.searchParams.set("sparkline", "false");
    url.searchParams.set("price_change_percentage", "1h,24h,7d,30d");

    Logger.info('API', `Fetching market data from CoinGecko: ${url.toString()}`);

    try {
      const response = await ChartHttpClient.fetchWithRetry(url.toString(), { headers });
      const data = await response.json();
      Logger.success('API', `Market data fetched successfully. Count: ${data.length}`);
      return { data };
    } catch (error) {
      Logger.error('API', 'Error fetching market data from CoinGecko', error);
      throw error;
    }
  }
}