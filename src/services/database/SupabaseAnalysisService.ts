import { supabase } from '../../lib/supabase';
import { Logger } from '../logService';
import { AnalysisRecord, DatabaseQuery, AnalysisInsert } from './AnalysisDatabase';

export class SupabaseAnalysisService {
  /**
   * Sauvegarde une nouvelle analyse en BDD
   */
  static async saveAnalysis(analysisData: AnalysisInsert): Promise<AnalysisRecord | null> {
    try {
      Logger.info('DATABASE', `Sauvegarde analyse ${analysisData.crypto_symbol}`, {
        userId: analysisData.created_by,
        direction: analysisData.direction,
        score: analysisData.score
      });

      const { data, error } = await supabase
        .from('crypto_analyses')
        .insert(analysisData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      Logger.success('DATABASE', `Analyse ${analysisData.crypto_symbol} sauvegardée`, {
        id: data.id,
        score: data.score
      });

      return data;
    } catch (error) {
      Logger.error('DATABASE', `Erreur sauvegarde ${analysisData.crypto_symbol}`, error);
      throw error;
    }
  }

  /**
   * Récupère la dernière analyse pour une crypto
   */
  static async getLatestAnalysis(symbol: string): Promise<AnalysisRecord | null> {
    try {
      const { data, error } = await supabase
        .from('crypto_analyses')
        .select('*')
        .eq('crypto_symbol', symbol.toLowerCase())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      Logger.error('DATABASE', `Erreur récupération ${symbol}`, error);
      return null;
    }
  }

  /**
   * Récupère plusieurs analyses selon critères
   */
  static async getAnalyses(query: DatabaseQuery): Promise<AnalysisRecord[]> {
    try {
      let supabaseQuery = supabase
        .from('crypto_analyses')
        .select('*');

      if (query.symbol) {
        supabaseQuery = supabaseQuery.eq('crypto_symbol', query.symbol.toLowerCase());
      }

      if (query.userId) {
        supabaseQuery = supabaseQuery.eq('created_by', query.userId);
      }

      const orderBy = query.orderBy || 'created_at';
      const direction = query.direction || 'desc';
      supabaseQuery = supabaseQuery.order(orderBy, { ascending: direction === 'asc' });

      if (query.limit) {
        supabaseQuery = supabaseQuery.limit(query.limit);
      }

      const { data, error } = await supabaseQuery;

      if (error) {
        throw error;
      }

      Logger.success('DATABASE', `${data?.length || 0} analyses récupérées`);
      return data || [];
    } catch (error) {
      Logger.error('DATABASE', 'Erreur récupération analyses', error);
      return [];
    }
  }

  /**
   * Met à jour une analyse existante
   */
  static async updateAnalysis(id: string, updates: Partial<AnalysisInsert>): Promise<AnalysisRecord | null> {
    try {
      const { data, error } = await supabase
        .from('crypto_analyses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        crypto_name: crypto.name || '',

      if (error) {
        throw error;
      }

      Logger.success('DATABASE', `Analyse ${id} mise à jour`);
      return data;
    } catch (error) {
      Logger.error('DATABASE', `Erreur mise à jour ${id}`, error);
      throw error;
    }
  }

  /**
   * Supprime une analyse
        support_secondaire: (crypto.aiAnalysis.tradingSignal.stopLoss || 0) * 1.02,
        resistance_secondaire: crypto.aiAnalysis.tradingSignal.takeProfit2 || 0,
   */
  static async deleteAnalysis(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('crypto_analyses')
        .upsert(analysisData, { 
          onConflict: 'crypto_symbol,created_by',
          ignoreDuplicates: false 
        });
        .eq('id', id);

      if (error) {
        throw error;
      }

      Logger.success('DATABASE', `Analyse ${id} supprimée`);
      return true;
    } catch (error) {
      Logger.error('DATABASE', `Erreur suppression ${id}`, error);
      return false;
    }
  }
}