import { OHLCData } from './chartTypes';
import { CHART_CONFIG, CHART_COLORS } from './chartConfig';
import { Logger } from '../logService';

export class ChartGenerator {
  static urlencode(obj: any): string {
    return encodeURIComponent(JSON.stringify(obj));
  }

  static quickChartUrl(title: string, ohlc: OHLCData[], { width = 1200, height = 600 } = {}): string {
    try {
      Logger.info('CHART', `Génération graphique QuickChart pour ${title}`, { 
        dataPoints: ohlc.length, 
        firstPoint: ohlc[0], 
        lastPoint: ohlc[ohlc.length - 1] 
      });
      
      if (!ohlc || ohlc.length === 0) {
        Logger.warning('CHART', `Données OHLC vides pour ${title}`);
        throw new Error('Données OHLC vides');
      }
      
      const candlestickData = ohlc.map(k => ({
        x: k.ts,
        o: Number(k.o), 
        h: Number(k.h), 
        l: Number(k.l), 
        c: Number(k.c)
      }));
      
      const cfg = {
        type: "candlestick",
        data: { 
          datasets: [{ 
            label: title, 
            data: candlestickData,
            upColor: CHART_COLORS.upColor,
            downColor: CHART_COLORS.downColor,
            borderUpColor: CHART_COLORS.upColor,
            borderDownColor: CHART_COLORS.downColor,
            wickUpColor: CHART_COLORS.upColor,
            wickDownColor: CHART_COLORS.downColor
          }] 
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: title,
              color: CHART_COLORS.textColor,
              font: { size: 16 }
            },
            legend: {
              display: true,
              labels: { color: CHART_COLORS.textColor }
            }
          },
          scales: {
            x: { 
              type: 'time',
              time: {
                displayFormats: {
                  hour: 'HH:mm',
                  day: 'MMM DD',
                  week: 'MMM DD',
                  month: 'MMM YYYY'
                }
              },
              ticks: { color: '#9ca3af' },
              grid: { 
                color: CHART_COLORS.gridColor,
                borderColor: CHART_COLORS.borderColor
              }
            },
            y: { 
              beginAtZero: false,
              ticks: { 
                color: '#9ca3af',
                callback: function(value: any) {
                  return '$' + Number(value).toLocaleString();
                }
              },
              grid: { 
                color: CHART_COLORS.gridColor,
                borderColor: CHART_COLORS.borderColor
              }
            }
          },
          interaction: {
            intersect: false,
            mode: 'index'
          }
        }
      };
      
      const encodedConfig = this.urlencode(cfg);
      const url = `${CHART_CONFIG.QUICKCHART_BASE}?width=${width}&height=${height}&format=png&version=4&backgroundColor=${encodeURIComponent(CHART_COLORS.backgroundColor)}&c=${encodedConfig}`;
      
      Logger.success('CHART', `URL QuickChart générée pour ${title}`, { 
        urlLength: url.length,
        urlPreview: url.substring(0, 200) + '...'
      });
      
      try {
        new URL(url);
        Logger.success('CHART', `URL valide pour ${title}`);
      } catch (urlError) {
        Logger.error('CHART', `URL invalide pour ${title}`, urlError);
        return this.generateErrorChart(title, width, height);
      }
      
      return url;
      
    } catch (error) {
      Logger.error('CHART', `Erreur génération graphique ${title}`, error);
      return this.generateErrorChart(title, width, height);
    }
  }

  static generateErrorChart(title: string, width = 1200, height = 600): string {
    const cfg = {
      type: 'line',
      data: {
        labels: ['Pas de données'],
        datasets: [{
          label: `${title} - Données indisponibles`,
          data: [{ x: Date.now(), y: 0 }],
          backgroundColor: 'rgba(239, 68, 68, 0.3)',
          borderColor: '#ef4444',
          borderWidth: 2
        }]
      },
      options: {
        plugins: {
          title: { 
            display: true, 
            text: `${title} - Erreur de chargement`,
            color: CHART_COLORS.textColor,
            font: { size: 16 }
          },
          legend: {
            labels: { color: CHART_COLORS.textColor }
          }
        },
        scales: { 
          y: { display: false },
          x: {
            ticks: { color: '#9ca3af' },
            grid: { display: false }
          }
        }
      }
    };
    
    return `${CHART_CONFIG.QUICKCHART_BASE}?width=${width}&height=${height}&format=png&version=4.4.1&backgroundColor=${encodeURIComponent(CHART_COLORS.backgroundColor)}&c=${this.urlencode(cfg)}`;
  }

  static generateFallbackCharts(coinId: string, errorMessage: string): any {
    Logger.warning('CHART', `Génération graphiques fallback pour ${coinId}`, { errorMessage });
    
    const fallbackUrl = this.generateErrorChart(`${coinId.toUpperCase()} - ${errorMessage}`);
    
    return {
      W: fallbackUrl,
      D: fallbackUrl,
      "12H": fallbackUrl,
      "4H": fallbackUrl,
      "1H": fallbackUrl,
    };
  }
}