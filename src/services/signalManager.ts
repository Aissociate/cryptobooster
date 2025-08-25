import { supabase } from '../lib/supabase';
import { Logger } from './logService';

export interface TradingPosition {
  id: string;
  cryptoId: string;
  cryptoSymbol: string;
  cryptoName: string;
  cryptoImage: string;
  signal: {
    direction: 'long' | 'short';
    entryPrice: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    confidence: number;
    riskRewardRatio: number;
  };
  aiAnalysis?: string;
  patternAnalysis?: any;
  status: 'pending' | 'active' | 'closed' | 'cancelled';
  addedAt: Date;
  notes?: string;
  targetHit?: 'none' | 'tp1' | 'tp2' | 'sl';
  isManuallyEdited?: boolean;
  isVerified?: boolean;
}

export interface PositionStats {
  totalPositions: number;
  activePositions: number;
  pendingPositions: number;
  winRate: number;
  avgRiskReward: number;
}

class SignalManagerService {
  private positions: TradingPosition[] = [];
  private subscribers: ((positions: TradingPosition[]) => void)[] = [];
  private currentUserId: string | null = null;

  constructor() {
    this.loadPositions();
  }

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    this.loadPositions();
  }

  private async loadPositions() {
    if (!this.currentUserId) {
      this.positions = [];
      this.notifySubscribers();
      return;
    }

    try {
      const { data, error } = await supabase
        .from('trading_positions')
        .select('*')
        .eq('user_id', this.currentUserId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      this.positions = (data || []).map((pos: any) => this.convertFromDatabase(pos));
      this.notifySubscribers();
      
      Logger.success('SYSTEM', `${this.positions.length} positions chargées depuis Supabase`);
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur chargement positions depuis Supabase', error);
      this.positions = [];
      this.notifySubscribers();
    }
  }

  private async savePosition(position: TradingPosition) {
    if (!this.currentUserId) {
      Logger.warning('SYSTEM', 'Utilisateur non connecté - impossible de sauvegarder');
      return;
    }

    try {
      const dbPosition = this.convertToDatabase(position);
      
      const { error } = await supabase
        .from('trading_positions')
        .upsert(dbPosition, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        throw error;
      }

      Logger.success('SYSTEM', `Position ${position.cryptoSymbol} sauvegardée dans Supabase`);
    } catch (error) {
      Logger.error('SYSTEM', `Erreur sauvegarde position ${position.cryptoSymbol}`, error);
      throw error;
    }
  }

  private convertToDatabase(position: TradingPosition): any {
    return {
      id: position.id,
      user_id: this.currentUserId,
      crypto_id: position.cryptoId,
      crypto_symbol: position.cryptoSymbol,
      crypto_name: position.cryptoName,
      crypto_image: position.cryptoImage,
      trading_signal: {
        direction: position.signal.direction,
        entry_price: position.signal.entryPrice,
        stop_loss: position.signal.stopLoss,
        take_profit_1: position.signal.takeProfit1,
        take_profit_2: position.signal.takeProfit2,
        confidence: position.signal.confidence,
        risk_reward_ratio: position.signal.riskRewardRatio
      },
      ai_analysis_data: position.aiAnalysis,
      pattern_analysis: position.patternAnalysis,
      status: position.status,
      target_hit: position.targetHit || 'none',
      notes: position.notes,
      is_manually_edited: position.isManuallyEdited || false,
      is_verified: position.isVerified || false
    };
  }

  private convertFromDatabase(dbPosition: any): TradingPosition {
    return {
      id: dbPosition.id,
      cryptoId: dbPosition.crypto_id,
      cryptoSymbol: dbPosition.crypto_symbol,
      cryptoName: dbPosition.crypto_name,
      cryptoImage: dbPosition.crypto_image,
      signal: {
        direction: dbPosition.trading_signal.direction,
        entryPrice: dbPosition.trading_signal.entry_price,
        stopLoss: dbPosition.trading_signal.stop_loss,
        takeProfit1: dbPosition.trading_signal.take_profit_1,
        takeProfit2: dbPosition.trading_signal.take_profit_2,
        confidence: dbPosition.trading_signal.confidence,
        riskRewardRatio: dbPosition.trading_signal.risk_reward_ratio
      },
      aiAnalysis: dbPosition.ai_analysis_data,
      patternAnalysis: dbPosition.pattern_analysis,
      status: dbPosition.status,
      addedAt: new Date(dbPosition.created_at),
      notes: dbPosition.notes,
      targetHit: dbPosition.target_hit,
      isManuallyEdited: dbPosition.is_manually_edited,
      isVerified: dbPosition.is_verified
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback([...this.positions]);
    });
  }

  async addPosition(crypto: any, analysis: any): Promise<TradingPosition> {
    const newPosition: TradingPosition = {
      id: `pos_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cryptoId: crypto.id,
      cryptoSymbol: crypto.symbol,
      cryptoName: crypto.name,
      cryptoImage: crypto.image,
      signal: {
        direction: analysis.tradingSignal.direction,
        entryPrice: analysis.tradingSignal.entryPrice,
        stopLoss: analysis.tradingSignal.stopLoss,
        takeProfit1: analysis.tradingSignal.takeProfit1,
        takeProfit2: analysis.tradingSignal.takeProfit2,
        confidence: analysis.tradingSignal.confidence,
        riskRewardRatio: analysis.tradingSignal.riskRewardRatio
      },
      aiAnalysis: analysis.rawAIResponse,
      patternAnalysis: analysis.patternAnalysis,
      status: 'pending',
      addedAt: new Date(),
      targetHit: 'none',
      isManuallyEdited: false,
      isVerified: false
    };

    this.positions.unshift(newPosition);
    await this.savePosition(newPosition);
    this.notifySubscribers();
    return newPosition;
  }

  async removePosition(positionId: string): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const { error } = await supabase
        .from('trading_positions')
        .delete()
        .eq('id', positionId)
        .eq('user_id', this.currentUserId);

      if (error) {
        throw error;
      }

      const index = this.positions.findIndex(pos => pos.id === positionId);
      if (index !== -1) {
        this.positions.splice(index, 1);
        this.notifySubscribers();
      }

      Logger.success('SYSTEM', `Position ${positionId} supprimée de Supabase`);
      return true;
    } catch (error) {
      Logger.error('SYSTEM', `Erreur suppression position ${positionId}`, error);
      return false;
    }
  }

  async updatePositionStatus(positionId: string, status: TradingPosition['status'], targetHit?: TradingPosition['targetHit']): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const updateData: any = { status };
      if (targetHit) updateData.target_hit = targetHit;

      const { error } = await supabase
        .from('trading_positions')
        .update(updateData)
        .eq('id', positionId)
        .eq('user_id', this.currentUserId);

      if (error) {
        throw error;
      }

      const position = this.positions.find(pos => pos.id === positionId);
      if (position) {
        position.status = status;
        if (targetHit) position.targetHit = targetHit;
        this.notifySubscribers();
      }

      Logger.success('SYSTEM', `Statut position ${positionId} mis à jour dans Supabase`);
      return true;
    } catch (error) {
      Logger.error('SYSTEM', `Erreur mise à jour statut position ${positionId}`, error);
      return false;
    }
  }

  async updatePositionNotes(positionId: string, notes: string): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const { error } = await supabase
        .from('trading_positions')
        .update({ notes })
        .eq('id', positionId)
        .eq('user_id', this.currentUserId);

      if (error) {
        throw error;
      }

      const position = this.positions.find(pos => pos.id === positionId);
      if (position) {
        position.notes = notes;
        this.notifySubscribers();
      }

      Logger.success('SYSTEM', `Notes position ${positionId} mises à jour dans Supabase`);
      return true;
    } catch (error) {
      Logger.error('SYSTEM', `Erreur mise à jour notes position ${positionId}`, error);
      return false;
    }
  }

  async updatePositionSignal(positionId: string, updatedSignal: TradingPosition['signal']): Promise<boolean> {
    if (!this.currentUserId) return false;

    try {
      const { error } = await supabase
        .from('trading_positions')
        .update({ 
          trading_signal: {
            direction: updatedSignal.direction,
            entry_price: updatedSignal.entryPrice,
            stop_loss: updatedSignal.stopLoss,
            take_profit_1: updatedSignal.takeProfit1,
            take_profit_2: updatedSignal.takeProfit2,
            confidence: updatedSignal.confidence,
            risk_reward_ratio: updatedSignal.riskRewardRatio
          },
          is_manually_edited: true
        })
        .eq('id', positionId)
        .eq('user_id', this.currentUserId);

      if (error) {
        throw error;
      }

      const position = this.positions.find(pos => pos.id === positionId);
      if (position) {
        position.signal = updatedSignal;
        position.isManuallyEdited = true;
        this.notifySubscribers();
      }

      Logger.success('SYSTEM', `Signal position ${positionId} mis à jour dans Supabase`);
      return true;
    } catch (error) {
      Logger.error('SYSTEM', `Erreur mise à jour signal position ${positionId}`, error);
      return false;
    }
  }

  getPosition(positionId: string): TradingPosition | undefined {
    return this.positions.find(pos => pos.id === positionId);
  }

  getAllPositions(): TradingPosition[] {
    return [...this.positions];
  }

  getPositionsByCrypto(cryptoId: string): TradingPosition[] {
    return this.positions.filter(pos => pos.cryptoId === cryptoId);
  }

  hasPosition(cryptoId: string): boolean {
    return this.positions.some(pos => pos.cryptoId === cryptoId && pos.status !== 'closed' && pos.status !== 'cancelled');
  }

  getStats(): PositionStats {
    const total = this.positions.length;
    const active = this.positions.filter(pos => pos.status === 'active').length;
    const pending = this.positions.filter(pos => pos.status === 'pending').length;
    
    const closedPositions = this.positions.filter(pos => pos.status === 'closed');
    const wins = closedPositions.filter(pos => pos.targetHit === 'tp1' || pos.targetHit === 'tp2').length;
    const winRate = closedPositions.length > 0 ? (wins / closedPositions.length) * 100 : 0;
    
    const avgRiskReward = this.positions.reduce((acc, pos) => acc + pos.signal.riskRewardRatio, 0) / Math.max(1, total);

    return {
      totalPositions: total,
      activePositions: active,
      pendingPositions: pending,
      winRate: Math.round(winRate),
      avgRiskReward: Math.round(avgRiskReward * 100) / 100
    };
  }

  subscribe(callback: (positions: TradingPosition[]) => void) {
    this.subscribers.push(callback);
    callback([...this.positions]);
    
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  async clearAllPositions() {
    if (!this.currentUserId) return;

    try {
      const { error } = await supabase
        .from('trading_positions')
        .delete()
        .eq('user_id', this.currentUserId);

      if (error) {
        throw error;
      }

      this.positions = [];
      this.notifySubscribers();
      
      Logger.success('SYSTEM', 'Toutes les positions supprimées de Supabase');
    } catch (error) {
      Logger.error('SYSTEM', 'Erreur suppression toutes positions', error);
    }
  }

  // Méthode pour vérifier les conditions de marché actuelles vs signaux
  checkSignalStatus(position: TradingPosition, currentPrice: number): { 
    status: 'waiting' | 'tp1_hit' | 'tp2_hit' | 'sl_hit' | 'entry_zone';
    priceDistance: number;
  } {
    const { signal } = position;
    const entryPrice = signal.entryPrice;
    const isLong = signal.direction === 'long';
    
    // Calculer la distance par rapport au prix d'entrée (en %)
    const priceDistance = ((currentPrice - entryPrice) / entryPrice) * 100;
    
    if (isLong) {
      if (currentPrice >= signal.takeProfit2) {
        return { status: 'tp2_hit', priceDistance };
      } else if (currentPrice >= signal.takeProfit1) {
        return { status: 'tp1_hit', priceDistance };
      } else if (currentPrice <= signal.stopLoss) {
        return { status: 'sl_hit', priceDistance };
      } else if (Math.abs(priceDistance) <= 2) { // Zone d'entrée ±2%
        return { status: 'entry_zone', priceDistance };
      }
    } else {
      if (currentPrice <= signal.takeProfit2) {
        return { status: 'tp2_hit', priceDistance };
      } else if (currentPrice <= signal.takeProfit1) {
        return { status: 'tp1_hit', priceDistance };
      } else if (currentPrice >= signal.stopLoss) {
        return { status: 'sl_hit', priceDistance };
      } else if (Math.abs(priceDistance) <= 2) {
        return { status: 'entry_zone', priceDistance };
      }
    }
    
    return { status: 'waiting', priceDistance };
  }
}

export const SignalManager = new SignalManagerService();