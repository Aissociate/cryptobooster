import axios from 'axios';
import { CryptoData, AIAnalysis } from '../types/crypto';
import { Logger } from './logService';
import { PromptBuilder } from './ai/promptBuilder';
import { ResponseParser } from './ai/responseParser';
import { MockAnalysisProvider } from './ai/mockAnalysisProvider';
import { OpenRouterResponse, AIConfig } from './ai/aiTypes';

export class OpenRouterService {
  private static readonly OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
  private static readonly apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  
  static async analyzeCrypto(
    crypto: CryptoData,
    analysisPrompt: string,
    chartUrls?: any,
    modelId: string = 'deepseek/deepseek-chat',
    config: AIConfig = { temperature: 0.7, maxTokens: 2048, topP: 0.9 }
  ): Promise<AIAnalysis> {
    if (!this.apiKey) {
      Logger.warning('API', 'Clé API OpenRouter manquante, utilisation des données mock', null, crypto.symbol);
      return MockAnalysisProvider.generateMockAnalysis(crypto);
    }

    // Vérifier que la clé API n'est pas vide ou invalide
    if (this.apiKey.trim() === '' || this.apiKey === 'your_api_key_here') {
      Logger.warning('API', 'Clé API OpenRouter invalide, utilisation des données mock', null, crypto.symbol);
      return MockAnalysisProvider.generateMockAnalysis(crypto);
    }

    try {
      Logger.info('AI', `Analyse IA démarrée avec ${modelId}`, { modelId, config }, crypto.symbol);
      
      const cryptoContext = PromptBuilder.buildCryptoContext(crypto, chartUrls);
      const fullPrompt = PromptBuilder.buildFullPrompt(analysisPrompt, cryptoContext);

      Logger.apiCall(crypto.symbol, modelId, fullPrompt, config);

      const response = await axios.post(`${this.OPENROUTER_BASE_URL}/chat/completions`, {
        model: modelId,
        messages: [
          {
            role: 'system',
            content: 'Tu es un expert en analyse technique et fondamentale des cryptomonnaies. Réponds uniquement en JSON valide.'
          },
          {
            role: 'user',
            content: fullPrompt
          }
        ],
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'CryptoAI Pro'
        },
        timeout: 30000
      });

      const aiResponse = response.data as OpenRouterResponse;
      Logger.apiResponse(crypto.symbol, true, aiResponse);
      
      const content = aiResponse.choices[0]?.message?.content;
      if (!content) {
        Logger.error('AI', 'Réponse IA vide', { response: aiResponse }, crypto.symbol);
        throw new Error('Réponse IA vide');
      }

      Logger.success('AI', 'Contenu IA reçu avec succès', { 
        contentLength: content.length,
        contentPreview: content.substring(0, 200)
      }, crypto.symbol);

      const analysis = ResponseParser.parseAIResponse(content, crypto);
      analysis.rawAIResponse = content;
      
      Logger.success('AI', 'Analyse parsée avec succès', analysis, crypto.symbol);
      return analysis;

    } catch (error) {
      // Gérer spécifiquement les erreurs 403 (clé API invalide)
      if (error.response?.status === 403) {
        Logger.warning('API', 'Clé API OpenRouter refusée (403), passage au mode mock', { 
          error: error.response.data || error.message 
        }, crypto.symbol);
        return MockAnalysisProvider.generateMockAnalysis(crypto);
      }
      
      // Gérer les erreurs 401 (non autorisé)
      if (error.response?.status === 401) {
        Logger.warning('API', 'Authentification OpenRouter échouée (401), passage au mode mock', { 
          error: error.response.data || error.message 
        }, crypto.symbol);
        return MockAnalysisProvider.generateMockAnalysis(crypto);
      }

      Logger.error('API', 'Erreur analyse OpenRouter', { 
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        status: error.response?.status,
        statusText: error.response?.statusText
      }, crypto.symbol);
      
      Logger.info('AI', 'Fallback vers données mock', null, crypto.symbol);
      return MockAnalysisProvider.generateMockAnalysis(crypto);
    }
  }
}