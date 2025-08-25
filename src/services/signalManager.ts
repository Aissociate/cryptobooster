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
  private readonly STORAGE_KEY = 'cryptoai_trading_positions';

  constructor() {
    this.loadPositions();
  }

  setCurrentUser(userId: string | null) {
    this.currentUserId = userId;
    this.loadPositions();
  }

  private loadPositions() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.positions = parsed.map((pos: any) => ({
          ...pos,
          addedAt: new Date(pos.addedAt)
        }));
      } else {
        this.positions = [];
      }
      this.notifySubscribers();
    } catch (error) {
      console.error('Erreur chargement positions:', error);
      this.positions = [];
      this.notifySubscribers();
    }
  }

  private savePositions() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.positions));
      this.notifySubscribers();
    } catch (error) {
      console.error('Erreur sauvegarde positions:', error);
    }
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback([...this.positions]);
    });
  }

  addPosition(crypto: any, analysis: any): TradingPosition {
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
    this.savePositions();
    return newPosition;
  }

  removePosition(positionId: string): boolean {
    const index = this.positions.findIndex(pos => pos.id === positionId);
    if (index !== -1) {
      this.positions.splice(index, 1);
      this.savePositions();
      return true;
    }
    return false;
  }

  updatePositionStatus(positionId: string, status: TradingPosition['status'], targetHit?: TradingPosition['targetHit']): boolean {
    const position = this.positions.find(pos => pos.id === positionId);
    if (position) {
      position.status = status;
      if (targetHit) position.targetHit = targetHit;
      this.savePositions();
      return true;
    }
    return false;
  }

  updatePositionNotes(positionId: string, notes: string): boolean {
    const position = this.positions.find(pos => pos.id === positionId);
    if (position) {
      position.notes = notes;
      this.savePositions();
      return true;
    }
    return false;
  }

  updatePositionSignal(positionId: string, updatedSignal: TradingPosition['signal']): boolean {
    const position = this.positions.find(pos => pos.id === positionId);
    if (position) {
      position.signal = updatedSignal;
      this.savePositions();
      return true;
    }
    return false;
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

  clearAllPositions() {
    this.positions = [];
    this.savePositions();
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