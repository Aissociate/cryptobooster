export interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  model?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface AIConfig {
  temperature: number;
  maxTokens: number;
  topP: number;
}