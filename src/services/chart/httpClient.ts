import { Logger } from '../logService';

export class ChartHttpClient {
  static async fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.pow(2, attempt - 1) * 1000;
          Logger.info('CHART', `Tentative ${attempt + 1}/${maxRetries + 1} après ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const response = await fetch(url, options);
        
        if (response.ok) {
          return response;
        }
        
        if (response.status === 429) {
          Logger.warning('CHART', 'Rate limit atteint (429), retry...');
          lastError = new Error(`Rate limit exceeded (429)`);
          continue;
        }
        
        if (response.status === 401) {
          Logger.warning('CHART', 'API key CoinGecko invalide ou manquante (401)');
          lastError = new Error(`API key invalid (401)`);
          break;
        }
        
        lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
        
      } catch (error) {
        Logger.error('CHART', `Erreur fetch tentative ${attempt + 1}`, error);
        lastError = error as Error;
      }
    }
    
    throw lastError;
  }
}