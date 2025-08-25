// Configuration pour les graphiques
export const CHART_CONFIG = {
  COINGECKO_BASE: "https://api.coingecko.com/api/v3",
  VS_CURRENCY: "usd",
  MIN_INTERVAL_MS: 1000, // 1 seconde entre les requêtes
  QUICKCHART_BASE: "https://quickchart.io/chart",
  DEFAULT_CHART_SIZE: { width: 1200, height: 600 }
} as const;

export const TIMEFRAMES = {
  H1: 60 * 60 * 1000,
  H4: 4 * 60 * 60 * 1000,
  H12: 12 * 60 * 60 * 1000,
  D1: 24 * 60 * 60 * 1000,
  W1: 7 * 24 * 60 * 60 * 1000
} as const;

export const CHART_COLORS = {
  upColor: '#10b981',
  downColor: '#ef4444',
  backgroundColor: '#111827',
  textColor: '#ffffff',
  gridColor: 'rgba(156, 163, 175, 0.1)',
  borderColor: '#374151'
} as const;