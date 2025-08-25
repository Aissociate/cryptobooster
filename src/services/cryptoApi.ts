import { EnhancedCrypto } from '../types/crypto';
import { CryptoHttpClient } from './crypto/cryptoHttpClient';
import { CryptoDataEnhancer } from './crypto/cryptoDataEnhancer';
import { MockDataProvider } from './crypto/mockDataProvider';
import { OpenRouterService } from './openRouterService';

export class CryptoService {
  static async getTopCryptos(limit: number = 50): Promise<EnhancedCrypto[]> {
    try {
      const response = await CryptoHttpClient.fetchMarketData(limit);
      return response.data.map((crypto: any) => CryptoDataEnhancer.enhanceCryptoData(crypto));
    } catch (error) {
      console.warn('Error fetching crypto data, using mock data:', error);
      return MockDataProvider.getMockData().map(crypto => CryptoDataEnhancer.enhanceCryptoData(crypto));
    }
  }

  static async getAIAnalysis(
    crypto: any, 
    analysisPrompt: string,
    chartUrls?: any,
    modelId: string = 'deepseek/deepseek-chat',
    config: any = { temperature: 0.7, maxTokens: 2048, topP: 0.9 }
  ) {
    return await OpenRouterService.analyzeCrypto(crypto, analysisPrompt, chartUrls, modelId, config);
  }
}