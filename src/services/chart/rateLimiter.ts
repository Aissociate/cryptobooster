import { Logger } from '../logService';

class RateLimitService {
  private lastRequestTime = new Map<string, number>();
  private readonly minIntervalMs = 1000;

  async waitForRateLimit(endpoint: string): Promise<void> {
    const lastTime = this.lastRequestTime.get(endpoint) || 0;
    const now = Date.now();
    const timeSinceLastRequest = now - lastTime;
    
    if (timeSinceLastRequest < this.minIntervalMs) {
      const waitTime = this.minIntervalMs - timeSinceLastRequest;
      Logger.info('CHART', `Rate limiting: attente de ${waitTime}ms pour ${endpoint}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime.set(endpoint, Date.now());
  }
}

export const rateLimiter = new RateLimitService();