// Utilitaires pour la gestion du localStorage avec gestion d'erreur
export class LocalStorageService {
  private static isAvailable(): boolean {
    try {
      const test = '__test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static getItem<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) {
      return defaultValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Erreur lors de la lecture de ${key} depuis localStorage:`, error);
      return defaultValue;
    }
  }

  static setItem<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Erreur lors de l'écriture de ${key} dans localStorage:`, error);
      return false;
    }
  }

  static removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Erreur lors de la suppression de ${key} depuis localStorage:`, error);
      return false;
    }
  }
}

// Clés pour le localStorage
export const STORAGE_KEYS = {
  AI_MODEL: 'cryptoai_selected_model',
  AI_CONFIG: 'cryptoai_ai_config',
  ANALYSIS_PROMPT: 'cryptoai_analysis_prompt',
} as const;