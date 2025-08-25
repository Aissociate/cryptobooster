export interface AnalysisRecord {
  id: string;
  crypto_symbol: string;
  /**
   * Nom lisible de la cryptomonnaie analysée.
   * Cette propriété est optionnelle car certaines anciennes entrées de la base
   * de données peuvent ne pas la renseigner.
   */
  crypto_name?: string;
  analysis_data: any;
  score: number;
  confidence: number;
  direction: string;
  entry_price: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  signal_global: string;
  score_bullish: number;
  score_bearish: number;
  pattern_plus_fort: string;
  convergence_signaux: string;
  support_principal: number;
  resistance_principale: number;
  support_secondaire: number;
  resistance_secondaire: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseQuery {
  symbol?: string;
  userId?: string;
  limit?: number;
  orderBy?: 'created_at' | 'score' | 'confidence';
  direction?: 'asc' | 'desc';
}

export interface AnalysisInsert {
  crypto_symbol: string;
  /**
   * Nom lisible de la cryptomonnaie analysée.  
   * Optionnel afin de permettre l'enregistrement de nouvelles analyses sans
   * cette information tout en restant compatible avec les définitions de la
   * table `crypto_analyses`.
   */
  crypto_name?: string;
  analysis_data: any;
  score: number;
  confidence: number;
  direction: string;
  entry_price: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  signal_global: string;
  score_bullish: number;
  score_bearish: number;
  pattern_plus_fort: string;
  convergence_signaux: string;
  support_principal: number;
  resistance_principale: number;
  support_secondaire: number;
  resistance_secondaire: number;
  created_by: string;
}