// Utilitaire de formatage des prix avec décimales dynamiques
export class PriceFormatter {
  /**
   * Formate un prix avec le nombre de décimales approprié
   * selon la valeur pour optimiser la lisibilité
   */
  static formatPrice(price: number | undefined | null): string {
    if (price === undefined || price === null || isNaN(price)) {
      return 'N/A';
    }

    // Gérer les valeurs nulles ou négatives
    if (price <= 0) {
      return '$0.00';
    }

    // Déterminer le nombre de décimales selon la valeur
    let decimals: number;
    let useCompactNotation = false;

    if (price >= 1000) {
      // Prix élevés (BTC, ETH) : 2 décimales max
      decimals = 2;
    } else if (price >= 100) {
      // Prix moyens : 2-3 décimales
      decimals = 2;
    } else if (price >= 10) {
      // Prix moyens-bas : 3 décimales
      decimals = 3;
    } else if (price >= 1) {
      // Prix unitaires : 3-4 décimales
      decimals = 3;
    } else if (price >= 0.1) {
      // Prix bas : 4 décimales
      decimals = 4;
    } else if (price >= 0.01) {
      // Prix très bas : 5 décimales
      decimals = 5;
    } else if (price >= 0.001) {
      // Prix ultra-bas : 6 décimales
      decimals = 6;
    } else if (price >= 0.0001) {
      // Meme coins niveau 1 : 7 décimales
      decimals = 7;
    } else if (price >= 0.00001) {
      // Meme coins niveau 2 : 8 décimales
      decimals = 8;
    } else {
      // Meme coins ultra-bas (PEPE, SHIB) : notation scientifique ou 10+ décimales
      if (price < 0.0000001) {
        // Utiliser la notation scientifique pour les très petites valeurs
        return `$${price.toExponential(3)}`;
      } else {
        decimals = 10;
      }
    }

    // Formater avec les décimales appropriées
    const formatted = price.toFixed(decimals);
    
    // Supprimer les zéros inutiles à la fin
    const cleaned = parseFloat(formatted).toString();
    
    return `$${this.addThousandsSeparator(cleaned)}`;
  }

  /**
   * Formate un prix de manière compacte (pour les petits espaces)
   */
  static formatCompactPrice(price: number | undefined | null): string {
    if (price === undefined || price === null || isNaN(price)) {
      return 'N/A';
    }

    if (price <= 0) {
      return '$0';
    }

    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(2)}M`;
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(1)}K`;
    } else if (price >= 1) {
      return `$${price.toFixed(2)}`;
    } else if (price >= 0.01) {
      return `$${price.toFixed(4)}`;
    } else if (price >= 0.0001) {
      return `$${price.toFixed(6)}`;
    } else {
      return `$${price.toExponential(2)}`;
    }
  }

  /**
   * Ajoute les séparateurs de milliers
   */
  private static addThousandsSeparator(numberStr: string): string {
    const parts = numberStr.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1] || '';

    // Ajouter les virgules pour les milliers
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  }

  /**
   * Formate une variation de prix (pour les pourcentages)
   */
  static formatPriceChange(change: number | undefined | null): string {
    if (change === undefined || change === null || isNaN(change)) {
      return '0.00%';
    }

    // Plus de précision pour les petites variations
    const decimals = Math.abs(change) < 0.01 ? 4 : 2;
    return `${change >= 0 ? '+' : ''}${change.toFixed(decimals)}%`;
  }

  /**
   * Détermine la couleur selon la variation
   */
  static getPriceChangeColor(change: number | undefined | null): string {
    if (!change || isNaN(change)) return 'text-gray-400';
    return change > 0 ? 'text-emerald-400' : change < 0 ? 'text-red-400' : 'text-gray-400';
  }

  /**
   * Formate une market cap ou volume
   */
  static formatMarketValue(value: number | undefined | null): string {
    if (value === undefined || value === null || isNaN(value) || value <= 0) {
      return 'N/A';
    }

    if (value >= 1e12) {
      return `$${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    } else {
      return `$${value.toFixed(2)}`;
    }
  }

  /**
   * Formate une supply de tokens
   */
  static formatSupply(value: number | undefined | null): string {
    if (value === undefined || value === null || isNaN(value) || value <= 0) {
      return 'N/A';
    }

    if (value >= 1e12) {
      return `${(value / 1e12).toFixed(2)}T`;
    } else if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `${(value / 1e3).toFixed(2)}K`;
    } else {
      return value.toLocaleString();
    }
  }
}