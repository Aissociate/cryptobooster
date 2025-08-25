import { useState } from 'react';
import { LocalStorageService, STORAGE_KEYS } from '../utils/localStorage';

export const useAppState = () => {
  // États avec persistance localStorage
  const [selectedAIModel, setSelectedAIModel] = useState(() => 
    LocalStorageService.getItem(STORAGE_KEYS.AI_MODEL, 'deepseek/deepseek-chat-v3.1')
  );
  
  const [aiConfig, setAiConfig] = useState(() => 
    LocalStorageService.getItem(STORAGE_KEYS.AI_CONFIG, {
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9
    })
  );
  
  const [analysisPrompt, setAnalysisPrompt] = useState(() => 
    LocalStorageService.getItem(STORAGE_KEYS.ANALYSIS_PROMPT, `Analyze this cryptocurrency `)
  );

  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showSignalsPanel, setShowSignalsPanel] = useState(false);
  const [analyzeAllLimit, setAnalyzeAllLimit] = useState(3);

  // Fonctions avec sauvegarde localStorage
  const handleModelChange = (modelId: string) => {
    setSelectedAIModel(modelId);
    LocalStorageService.setItem(STORAGE_KEYS.AI_MODEL, modelId);
  };

  const handleConfigChange = (config: typeof aiConfig) => {
    setAiConfig(config);
    LocalStorageService.setItem(STORAGE_KEYS.AI_CONFIG, config);
  };

  const handlePromptChange = (prompt: string) => {
    setAnalysisPrompt(prompt);
    LocalStorageService.setItem(STORAGE_KEYS.ANALYSIS_PROMPT, prompt);
  };

  return {
    // States
    selectedAIModel,
    aiConfig,
    analysisPrompt,
    showAdminPanel,
    showAuthModal,
    authModalMode,
    showSignalsPanel,
    analyzeAllLimit,
    
    // Setters
    setShowAdminPanel,
    setShowAuthModal,
    setAuthModalMode,
    setShowSignalsPanel,
    setAnalyzeAllLimit,
    
    // Handlers
    handleModelChange,
    handleConfigChange,
    handlePromptChange
  };
};