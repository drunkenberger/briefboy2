import { useState, useCallback } from 'react';

export interface TokenUsage {
  service: string;
  model?: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost: number;
}

export interface TokenBreakdown {
  [key: string]: number;
  total: number;
}

interface TokenPricing {
  [model: string]: {
    input: number;  // Cost per 1K tokens
    output: number; // Cost per 1K tokens
  };
}

// Pricing per 1K tokens (in USD)
const TOKEN_PRICING: TokenPricing = {
  // OpenAI Models
  'gpt-4o': { input: 0.005, output: 0.015 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'whisper': { input: 0.006, output: 0 }, // Whisper only has input cost
  
  // Claude Models (Anthropic)
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'claude-2.1': { input: 0.008, output: 0.024 },
  
  // Gemini Models (Google)
  'gemini-1.5-pro': { input: 0.00125, output: 0.005 },
  'gemini-1.5-flash': { input: 0.00025, output: 0.001 },
  'gemini-pro': { input: 0.0005, output: 0.0015 },
};

export interface UseTokenTrackingReturn {
  currentSessionTokens: TokenBreakdown;
  totalTokensUsed: number;
  totalEstimatedCost: number;
  
  // Token counting functions
  countTokens: (text: string) => number;
  estimateWhisperTokens: (audioDurationSeconds: number) => number;
  
  // Tracking functions
  trackTokenUsage: (usage: TokenUsage) => void;
  addTokensToBreakdown: (service: string, tokens: number) => void;
  
  // Cost calculation
  calculateCost: (model: string, inputTokens: number, outputTokens: number) => number;
  
  // Reset and get functions
  resetSession: () => void;
  getSessionBreakdown: () => TokenBreakdown;
  getFormattedCost: (cost: number) => string;
}

export function useTokenTracking(): UseTokenTrackingReturn {
  const [currentSessionTokens, setCurrentSessionTokens] = useState<TokenBreakdown>({
    total: 0
  });
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const [totalEstimatedCost, setTotalEstimatedCost] = useState(0);

  // Count tokens in a text string using character-based estimation
  const countTokens = useCallback((text: string): number => {
    if (!text) return 0;
    // More accurate estimation: 1 token per ~4 characters for most languages
    // Add extra tokens for special characters and formatting
    const baseTokens = Math.ceil(text.length / 4);
    const specialCharBonus = Math.ceil((text.match(/[^\w\s]/g) || []).length / 10);
    return baseTokens + specialCharBonus;
  }, []);

  // Estimate Whisper tokens based on audio duration
  // Whisper typically uses about 25 tokens per second of audio
  const estimateWhisperTokens = useCallback((audioDurationSeconds: number): number => {
    return Math.ceil(audioDurationSeconds * 25);
  }, []);

  // Calculate cost based on model and token counts
  const calculateCost = useCallback((model: string, inputTokens: number, outputTokens: number): number => {
    const pricing = TOKEN_PRICING[model] || TOKEN_PRICING['gpt-3.5-turbo']; // Default fallback
    const inputCost = (inputTokens / 1000) * pricing.input;
    const outputCost = (outputTokens / 1000) * pricing.output;
    return inputCost + outputCost;
  }, []);

  // Add tokens to breakdown by service
  const addTokensToBreakdown = useCallback((service: string, tokens: number) => {
    setCurrentSessionTokens(prev => {
      const updated = { ...prev };
      updated[service] = (updated[service] || 0) + tokens;
      updated.total = (updated.total || 0) + tokens;
      return updated;
    });
    setTotalTokensUsed(prev => prev + tokens);
  }, []);

  // Track complete token usage with cost calculation
  const trackTokenUsage = useCallback((usage: TokenUsage) => {
    const cost = usage.estimated_cost || calculateCost(
      usage.model || 'gpt-3.5-turbo',
      usage.input_tokens,
      usage.output_tokens
    );

    // Update breakdown
    addTokensToBreakdown(usage.service, usage.total_tokens);
    
    // Update total cost
    setTotalEstimatedCost(prev => prev + cost);

    // Log for debugging
    if (__DEV__) {
      console.log(`📊 Token Usage - ${usage.service}:`, {
        model: usage.model,
        input: usage.input_tokens,
        output: usage.output_tokens,
        total: usage.total_tokens,
        cost: `$${cost.toFixed(4)}`
      });
    }
  }, [addTokensToBreakdown, calculateCost]);

  // Reset session tracking
  const resetSession = useCallback(() => {
    setCurrentSessionTokens({ total: 0 });
    setTotalTokensUsed(0);
    setTotalEstimatedCost(0);
  }, []);

  // Get current session breakdown
  const getSessionBreakdown = useCallback((): TokenBreakdown => {
    return currentSessionTokens;
  }, [currentSessionTokens]);

  // Format cost for display
  const getFormattedCost = useCallback((cost: number): string => {
    if (cost < 0.01) {
      return `$${cost.toFixed(4)}`;
    } else if (cost < 1) {
      return `$${cost.toFixed(3)}`;
    } else {
      return `$${cost.toFixed(2)}`;
    }
  }, []);

  return {
    currentSessionTokens,
    totalTokensUsed,
    totalEstimatedCost,
    countTokens,
    estimateWhisperTokens,
    trackTokenUsage,
    addTokensToBreakdown,
    calculateCost,
    resetSession,
    getSessionBreakdown,
    getFormattedCost,
  };
}

// Helper function to track OpenAI API responses
export function extractOpenAITokenUsage(response: any): Partial<TokenUsage> | null {
  if (!response?.usage) return null;
  
  return {
    input_tokens: response.usage.prompt_tokens || 0,
    output_tokens: response.usage.completion_tokens || 0,
    total_tokens: response.usage.total_tokens || 0,
  };
}

// Helper function to estimate Claude token usage
export function estimateClaudeTokens(input: string, output: string): Partial<TokenUsage> {
  // Claude uses a similar tokenizer to GPT
  const inputTokens = Math.ceil(input.length / 4);
  const outputTokens = Math.ceil(output.length / 4);
  
  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
  };
}

// Helper function to estimate Gemini token usage
export function estimateGeminiTokens(input: string, output: string): Partial<TokenUsage> {
  // Gemini also uses similar tokenization
  const inputTokens = Math.ceil(input.length / 4);
  const outputTokens = Math.ceil(output.length / 4);
  
  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    total_tokens: inputTokens + outputTokens,
  };
}