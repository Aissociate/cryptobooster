// Point d'entrée principal pour les services de graphiques
export type { ChartUrls } from './chart/chartTypes';
import { ChartOrchestrator } from './chart/chartOrchestrator';
export { ChartOrchestrator };

// Export de la fonction principale pour compatibilité
export const generateChartUrls = ChartOrchestrator.generateChartUrls;