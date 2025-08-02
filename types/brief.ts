// Define the structure of the brief data based on the marketing brief format
export interface BriefData {
  projectTitle: string;
  briefSummary: string;
  businessChallenge: string;
  strategicObjectives: string[];
  targetAudience: {
    primary: string;
    secondary?: string;
    insights: string[];
  };
  brandPositioning: string;
  creativeStrategy: {
    bigIdea: string;
    messageHierarchy: string[];
    toneAndManner: string;
    creativeMandatories: string[];
  };
  channelStrategy: {
    recommendedMix: Array<{
      channel: string;
      allocation: string;
      rationale: string;
      kpis: string[];
    }>;
    integratedApproach: string;
  };
  successMetrics: {
    primary: string[];
    secondary: string[];
    measurementFramework: string;
  };
  budgetConsiderations: {
    estimatedRange: string;
    keyInvestments: string[];
    costOptimization: string[];
  };
  riskAssessment: {
    risks: Array<{
      risk: string;
      likelihood: 'Alto' | 'Medio' | 'Bajo';
      impact: 'Alto' | 'Medio' | 'Bajo';
      mitigation: string;
    }>;
  };
  implementationRoadmap: {
    phases: Array<{
      phase: string;
      duration: string;
      deliverables: string[];
      dependencies: string[];
    }>;
  };
  nextSteps: string[];
  appendix: {
    assumptions: string[];
    references: string[];
  };
}

export interface DatabaseBrief {
  id: string;
  user_id: string;
  title: string;
  transcription: string | null;
  brief_data: BriefData; // JSONB field containing the full brief structure
  audio_url: string | null;
  status: 'draft' | 'completed' | 'archived';
  tokens_used: number;
  tokens_breakdown: Record<string, number>;
  estimated_cost: number;
  created_at: string;
  updated_at: string;
}

export interface BriefInput {
  title: string;
  transcription?: string;
  brief_data: BriefData;
  audio_url?: string;
  status?: 'draft' | 'completed' | 'archived';
  tokens_used?: number;
  tokens_breakdown?: Record<string, number>;
  estimated_cost?: number;
}

export interface BriefUpdate {
  title?: string;
  transcription?: string;
  brief_data?: Partial<BriefData>;
  audio_url?: string;
  status?: 'draft' | 'completed' | 'archived';
  tokens_used?: number;
  tokens_breakdown?: Record<string, number>;
  estimated_cost?: number;
}

export interface BriefStats {
  user_id: string;
  total_briefs: number;
  completed_briefs: number;
  draft_briefs: number;
  last_brief_created: string;
  first_brief_created: string;
}

// Extend the existing brief types if they exist
export interface SavedBrief extends DatabaseBrief {
  // Add any additional computed properties if needed
}