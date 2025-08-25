import type { ChartUrls } from './chartTypes';
import { TIMEFRAMES } from './chartConfig';
import { ChartDataFetcher } from './dataFetcher';
import { ChartDataProcessor } from './dataProcessor';
import { ChartGenerator } from './chartGenerator';
import { Logger } from '../logService';

export class ChartOrchestrator {
  static async generateChartUrls(coinId: string): Promise<ChartUrls> {
    Logger.info('CHART', `Début génération graphiques pour ${coinId}`);
    
    try {
      // Récupération données intraday pour 1H/4H/12H
      let intraOHLC;
      try {
        Logger.info('CHART', `Récupération données intraday (30j) pour ${coinId}`);
        intraOHLC = await ChartDataFetcher.fetchOhlc(coinId, 30);
        Logger.success('CHART', `OHLC intraday récupérées`, { dataPoints: intraOHLC.length }, coinId);
      } catch (e) {
        Logger.warning('CHART', 'OHLC intraday échec, fallback vers prices', e, coinId);
        const prices = await ChartDataFetcher.fetchPrices(coinId, 30);
        intraOHLC = ChartDataProcessor.resamplePricesToOHLC(prices, TIMEFRAMES.H1);
        Logger.success('CHART', `Prices intraday converties en OHLC`, { dataPoints: intraOHLC.length }, coinId);
      }

      // Récupération données daily/weekly
      let dayOHLC;
      try {
        Logger.info('CHART', `Récupération données daily (365j) pour ${coinId}`);
        dayOHLC = await ChartDataFetcher.fetchOhlc(coinId, 365);
        Logger.success('CHART', `OHLC daily récupérées`, { dataPoints: dayOHLC.length }, coinId);
      } catch {
        Logger.warning('CHART', 'OHLC daily échec, fallback vers prices daily', null, coinId);
        const dailyPrices = await ChartDataFetcher.fetchPrices(coinId, 365, "daily");
        dayOHLC = ChartDataProcessor.resamplePricesToOHLC(dailyPrices, TIMEFRAMES.D1);
        Logger.success('CHART', `Prices daily converties en OHLC`, { dataPoints: dayOHLC.length }, coinId);
      }

      // Resampling vers les 5 UT
      Logger.info('CHART', `Resampling vers différentes unités de temps pour ${coinId}`);

      const ohlc1h  = ChartDataProcessor.resampleOHLC(intraOHLC, TIMEFRAMES.H1).slice(-720);
      const ohlc4h  = ChartDataProcessor.resampleOHLC(intraOHLC, TIMEFRAMES.H4).slice(-360);
      const ohlc12h = ChartDataProcessor.resampleOHLC(intraOHLC, TIMEFRAMES.H12).slice(-240);
      const ohlc1d = ChartDataProcessor.resampleOHLC(dayOHLC, TIMEFRAMES.D1).slice(-180);
      const ohlc1w = ChartDataProcessor.resampleOHLC(dayOHLC, TIMEFRAMES.W1).slice(-120);

      // Génération des URLs
      Logger.info('CHART', `Génération des graphiques QuickChart pour ${coinId}`);
      const result = {
        W: ChartGenerator.quickChartUrl(`${coinId.toUpperCase()} Weekly`, ohlc1w),
        D: ChartGenerator.quickChartUrl(`${coinId.toUpperCase()} Daily`, ohlc1d),
        "12H": ChartGenerator.quickChartUrl(`${coinId.toUpperCase()} 12H`, ohlc12h),
        "4H": ChartGenerator.quickChartUrl(`${coinId.toUpperCase()} 4H`, ohlc4h),
        "1H": ChartGenerator.quickChartUrl(`${coinId.toUpperCase()} 1H`, ohlc1h),
      };
      
      Logger.chartGeneration(coinId, true, result);
      return result;
    } catch (error) {
      Logger.error('CHART', 'Erreur génération graphiques', error, coinId);
      return ChartGenerator.generateFallbackCharts(coinId, error instanceof Error ? error.message : 'Erreur inconnue');
    }
  }
}