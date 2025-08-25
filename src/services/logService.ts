// Service centralisé de logging pour les admins
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error' | 'success';
  category: 'API' | 'AI' | 'CHART' | 'SYSTEM';
  message: string;
  details?: any;
  crypto?: string;
}

class LogService {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Limite pour éviter la surcharge mémoire
  private subscribers: ((logs: LogEntry[]) => void)[] = [];

  private createLog(level: LogEntry['level'], category: LogEntry['category'], message: string, details?: any, crypto?: string): LogEntry {
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      level,
      category,
      message,
      details,
      crypto
    };
  }

  private addLog(log: LogEntry) {
    this.logs.unshift(log); // Ajouter au début pour avoir les plus récents en premier
    
    // Limiter le nombre de logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Notifier tous les subscribers
    this.notifySubscribers();
    
    // Log aussi dans la console pour debug
    const emoji = {
      info: 'ℹ️',
      warning: '⚠️', 
      error: '❌',
      success: '✅'
    };
    
    console.log(`${emoji[log.level]} [${log.category}] ${log.message}`, log.details || '');
  }

  info(category: LogEntry['category'], message: string, details?: any, crypto?: string) {
    this.addLog(this.createLog('info', category, message, details, crypto));
  }

  warning(category: LogEntry['category'], message: string, details?: any, crypto?: string) {
    this.addLog(this.createLog('warning', category, message, details, crypto));
  }

  error(category: LogEntry['category'], message: string, details?: any, crypto?: string) {
    this.addLog(this.createLog('error', category, message, details, crypto));
  }

  success(category: LogEntry['category'], message: string, details?: any, crypto?: string) {
    this.addLog(this.createLog('success', category, message, details, crypto));
  }

  // Pour les appels API spécifiques
  apiCall(crypto: string, model: string, prompt: string, config: any) {
    this.info('API', `Appel OpenRouter pour ${crypto}`, {
      model,
      promptLength: prompt.length,
      config,
      url: 'https://openrouter.ai/api/v1/chat/completions'
    }, crypto);
  }

  apiResponse(crypto: string, success: boolean, responseData?: any, error?: any) {
    if (success) {
      this.success('AI', `Analyse IA reçue pour ${crypto}`, {
        responseLength: responseData?.choices?.[0]?.message?.content?.length || 0,
        model: responseData?.model,
        usage: responseData?.usage
      }, crypto);
    } else {
      this.error('AI', `Erreur analyse IA pour ${crypto}`, error, crypto);
    }
  }

  chartGeneration(crypto: string, success: boolean, urls?: any, error?: any) {
    if (success) {
      this.success('CHART', `Graphiques générés pour ${crypto}`, {
        timeframes: Object.keys(urls || {}),
        urlsGenerated: Object.keys(urls || {}).length
      }, crypto);
    } else {
      this.error('CHART', `Erreur génération graphiques pour ${crypto}`, error, crypto);
    }
  }

  subscribe(callback: (logs: LogEntry[]) => void) {
    this.subscribers.push(callback);
    // Envoyer immédiatement les logs actuels
    callback([...this.logs]);
    
    // Retourner une fonction de désinscription
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback([...this.logs]);
    });
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.info('SYSTEM', 'Logs effacés par l\'administrateur');
  }

  // Export des logs pour debug
  exportLogs(): string {
    return JSON.stringify({
      exported: new Date().toISOString(),
      count: this.logs.length,
      logs: this.logs
    }, null, 2);
  }
}

// Instance singleton
export const Logger = new LogService();