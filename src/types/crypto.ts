import type { ChartUrls } from '../services/chart/chartTypes';
import type { AnalysisResult as PatternAnalysisResult } from '../services/patternAnalyzer';

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_percentage_1h_in_currency?: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_30d_in_currency?: number;
  volume_24h: number;
  circulating_supply: number;
  total_supply: number;
}

export interface TimeframeData {
  '1W': number;
  '1D': number;
  '12H': number;
  '4H': number;
  '1H': number;
}

export interface TrendIndicator {
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number; // 1-10
}

export interface TradingSignal {
  direction: 'long' | 'short';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  riskRewardRatio: number;
  confidence: number; // 1-100
}

export interface AIAnalysis {
  marketContext: string;
  technicalAnalysis: string;
  fundamentalFactors: string[];
  sentiment: 'very-bullish' | 'bullish' | 'neutral' | 'bearish' | 'very-bearish';
  tradingSignal: TradingSignal;
  rawAIResponse?: string; // Réponse brute de l'IA
  isManuallyEdited?: boolean; // Indique si le signal a été édité manuellement
  isVerified?: boolean; // Indique si le signal a été vérifié manuellement
  patternAnalysis?: PatternAnalysisResult; // Analyse de patterns chartistes
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  enabled: boolean;
}

export interface AIConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
}

export interface EnhancedCrypto extends CryptoData {
  timeframes: TimeframeData;
  trends: Record<keyof TimeframeData, TrendIndicator>;
  aiAnalysis?: AIAnalysis;
  aiScore: number; // Score AI en pourcentage
  chartUrls?: ChartUrls;
  analysisPrompt?: string;
}