// ==============================
// Analyse multi-timeframes avec Momentum Chartiste
// Port du script Python vers TypeScript
// ==============================

export interface PatternData {
  signal: 'Bullish' | 'Bearish' | 'Neutre';
  power: number;
  rarity: 'Commune' | 'Rare' | 'Historique' | 'Légendaire';
  type: 'Retournement' | 'Continuation' | 'Indécis';
}

export interface PatternSelection {
  Monthly?: string;
  Weekly?: string;
  Daily?: string;
  '4h'?: string;
  '1h'?: string;
}

export interface MomentumContext {
  Monthly?: MomentumType;
  Weekly?: MomentumType;
  Daily?: MomentumType;
  '4h'?: MomentumType;
  '1h'?: MomentumType;
}

export type MomentumType = 
  | 'Continuation_alignée'    // continuation dans le sens de la tendance
  | 'Retournement_zone'      // retournement en zone clé (sommet/creux)
  | 'Neutre'                 // pas de momentum spécifique
  | 'Retournement_contra';   // retournement contre-tendance

export interface AnalysisResult {
  signal: 'Bullish' | 'Bearish' | 'Neutre';
  bull: number;
  bear: number;
  confidence: number;
  details: {
    totalScore: number;
    dominantTimeframes: string[];
    strongestPattern: string;
    /**
     * Dictionnaire des patterns détectés par timeframe.  
     * Les clés correspondent aux noms des timeframes (Monthly, Weekly, Daily, 4h, 1h)  
     * et les valeurs au nom du pattern détecté sur ce timeframe.  
     * Cette propriété est utilisée notamment lors de la conversion de
     * l'analyse vers un format de base de données afin de conserver
     * l'information de pattern par timeframe.
     */
    patterns: Record<string, string>;
  };
}

// Base de données patterns
const PATTERNS: Record<string, PatternData> = {
  "Double Top": { signal: "Bearish", power: 80, rarity: "Commune", type: "Retournement" },
  "Double Bottom (W)": { signal: "Bullish", power: 85, rarity: "Commune", type: "Retournement" },
  "Triple Top": { signal: "Bearish", power: 75, rarity: "Rare", type: "Retournement" },
  "Triple Bottom": { signal: "Bullish", power: 80, rarity: "Rare", type: "Retournement" },
  "Tête et Épaules": { signal: "Bearish", power: 90, rarity: "Historique", type: "Retournement" },
  "Tête et Épaules Inversée": { signal: "Bullish", power: 90, rarity: "Historique", type: "Retournement" },
  "Range / Rectangle": { signal: "Neutre", power: 70, rarity: "Commune", type: "Continuation" },
  "Drapeau (Flag)": { signal: "Bullish", power: 85, rarity: "Commune", type: "Continuation" },
  "Fanion (Pennant)": { signal: "Bullish", power: 85, rarity: "Commune", type: "Continuation" },
  "Biseau Ascendant": { signal: "Bearish", power: 80, rarity: "Commune", type: "Retournement" },
  "Biseau Descendant": { signal: "Bullish", power: 80, rarity: "Commune", type: "Retournement" },
  "Triangle Symétrique": { signal: "Neutre", power: 70, rarity: "Commune", type: "Continuation" },
  "Triangle Ascendant": { signal: "Bullish", power: 85, rarity: "Commune", type: "Continuation" },
  "Triangle Descendant": { signal: "Bearish", power: 85, rarity: "Commune", type: "Continuation" },
  "Rounding Bottom (Soucoupe)": { signal: "Bullish", power: 75, rarity: "Rare", type: "Retournement" },
  "Rounding Top": { signal: "Bearish", power: 70, rarity: "Rare", type: "Retournement" },
  "Cup & Handle": { signal: "Bullish", power: 90, rarity: "Légendaire", type: "Retournement" },
  "Broadening Wedge": { signal: "Neutre", power: 65, rarity: "Rare", type: "Indécis" },
  "Diamant": { signal: "Neutre", power: 95, rarity: "Légendaire", type: "Retournement" },
};

// Pondération des timeframes
const WEIGHTS: Record<string, number> = {
  "Monthly": 4,
  "Weekly": 3,
  "Daily": 2,
  "4h": 1.5,
  "1h": 1,
};

// Bonus de rareté
const RARITY_BONUS: Record<string, number> = {
  "Commune": 1.0,
  "Rare": 1.05,
  "Historique": 1.10,
  "Légendaire": 1.15,
};

// Momentum bonus/malus
const MOMENTUM_BONUS: Record<MomentumType, number> = {
  "Continuation_alignée": 1.20,
  "Retournement_zone": 1.25,
  "Neutre": 1.0,
  "Retournement_contra": 0.90
};

export class PatternAnalyzer {
  /**
   * Analyse les patterns chartistes sur multiple timeframes
   */
  static analyzePatterns(selection: PatternSelection, momentumContext: MomentumContext): AnalysisResult {
    let bullScore = 0;
    let bearScore = 0;
    const processedPatterns: Array<{timeframe: string, pattern: string, score: number, signal: string}> = [];
    // Dictionnaire pour stocker le pattern détecté par timeframe
    const patternsByTimeframe: Record<string, string> = {};

    for (const [timeframe, pattern] of Object.entries(selection)) {
      if (!pattern) continue;

      const patternData = PATTERNS[pattern];
      if (!patternData) continue;

      let power = patternData.power;
      const signal = patternData.signal;
      const rarity = patternData.rarity;

      // Appliquer bonus rareté
      power *= RARITY_BONUS[rarity];

      // Appliquer pondération timeframe
      const weight = WEIGHTS[timeframe] || 1;
      power *= weight;

      // Appliquer momentum
      const momentumType = momentumContext[timeframe as keyof MomentumContext] || 'Neutre';
      power *= MOMENTUM_BONUS[momentumType];

      processedPatterns.push({
        timeframe,
        pattern,
        score: power,
        signal
      });

      // Enregistrer le pattern détecté pour ce timeframe dans le dictionnaire
      patternsByTimeframe[timeframe] = pattern;

      // Répartir bull/bear
      if (signal === "Bullish") {
        bullScore += power;
      } else if (signal === "Bearish") {
        bearScore += power;
      }
      // neutre = ignoré dans le calcul
    }

    // Calcul du % domination
    const total = bullScore + bearScore;
    if (total === 0) {
      return {
        signal: "Neutre",
        bull: 0,
        bear: 0,
        confidence: 0,
        details: {
          totalScore: 0,
          dominantTimeframes: [],
          strongestPattern: 'Aucun pattern détecté'
        }
      };
    }

    let orientation: 'Bullish' | 'Bearish' | 'Neutre';
    let confidence: number;

    if (bullScore > bearScore) {
      orientation = "Bullish";
      confidence = Math.round((bullScore / total) * 100 * 100) / 100;
    } else if (bearScore > bullScore) {
      orientation = "Bearish";
      confidence = Math.round((bearScore / total) * 100 * 100) / 100;
    } else {
      orientation = "Neutre";
      confidence = 50;
    }

    // Identifier les timeframes dominants et le pattern le plus fort
    const sortedPatterns = processedPatterns.sort((a, b) => b.score - a.score);
    const dominantTimeframes = sortedPatterns
      .filter(p => p.signal === orientation)
      .slice(0, 3)
      .map(p => p.timeframe);
    
    const strongestPattern = sortedPatterns[0]?.pattern || 'Aucun';

    return {
      signal: orientation,
      bull: Math.round(bullScore * 100) / 100,
      bear: Math.round(bearScore * 100) / 100,
      confidence,
      details: {
        totalScore: Math.round(total * 100) / 100,
        dominantTimeframes,
        strongestPattern
        ,
        patterns: patternsByTimeframe
      }
    };
  }

  /**
   * Génère un exemple de sélection de patterns (pour testing)
   */
  static generateExampleSelection(): { selection: PatternSelection, momentum: MomentumContext } {
    return {
      selection: {
        "Monthly": "Cup & Handle",
        "Weekly": "Tête et Épaules Inversée",
        "Daily": "Triangle Ascendant",
        "4h": "Fanion (Pennant)",
        "1h": "Double Bottom (W)"
      },
      momentum: {
        "Monthly": "Retournement_zone",
        "Weekly": "Retournement_zone",
        "Daily": "Continuation_alignée",
        "4h": "Continuation_alignée",
        "1h": "Retournement_zone"
      }
    };
  }

  /**
   * Génère une sélection aléatoire de patterns (pour demo/testing)
   */
  static generateRandomSelection(): { selection: PatternSelection, momentum: MomentumContext } {
    const patternNames = Object.keys(PATTERNS);
    const timeframes = Object.keys(WEIGHTS);
    const momentumTypes: MomentumType[] = ['Continuation_alignée', 'Retournement_zone', 'Neutre', 'Retournement_contra'];

    const selection: PatternSelection = {};
    const momentum: MomentumContext = {};

    timeframes.forEach(tf => {
      if (Math.random() > 0.3) { // 70% chance d'avoir un pattern sur ce timeframe
        selection[tf as keyof PatternSelection] = patternNames[Math.floor(Math.random() * patternNames.length)];
        momentum[tf as keyof MomentumContext] = momentumTypes[Math.floor(Math.random() * momentumTypes.length)];
      }
    });

    return { selection, momentum };
  }

  /**
   * Obtient la liste de tous les patterns disponibles
   */
  static getAvailablePatterns(): string[] {
    return Object.keys(PATTERNS);
  }

  /**
   * Obtient les détails d'un pattern spécifique
   */
  static getPatternDetails(patternName: string): PatternData | null {
    return PATTERNS[patternName] || null;
  }
}