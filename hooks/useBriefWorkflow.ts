import { useState, useCallback } from 'react';

export type InputMethod = 'audio' | 'file' | 'text' | null;
export type WorkflowStep = 'input' | 'transcribing' | 'generating' | 'reviewing' | 'improving';

interface BriefWorkflowState {
  // Core state
  inputMethod: InputMethod;
  currentStep: WorkflowStep;
  
  // Content
  audioUri: string | null;
  transcription: string | null;
  brief: any | null;
  improvedBrief: any | null;
  
  // Metadata
  briefId: string | null;
  isFromFile: boolean;
  
  // UI state
  showImprovementModal: boolean;
  showFinalEditor: boolean;
}

export function useBriefWorkflow() {
  const [state, setState] = useState<BriefWorkflowState>({
    inputMethod: null,
    currentStep: 'input',
    audioUri: null,
    transcription: null,
    brief: null,
    improvedBrief: null,
    briefId: null,
    isFromFile: false,
    showImprovementModal: false,
    showFinalEditor: false,
  });

  // State setters
  const setInputMethod = useCallback((method: InputMethod) => {
    setState(prev => ({ ...prev, inputMethod: method }));
  }, []);

  const setCurrentStep = useCallback((step: WorkflowStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const setAudioUri = useCallback((uri: string | null) => {
    setState(prev => ({ 
      ...prev, 
      audioUri: uri,
      currentStep: uri ? 'transcribing' : 'input'
    }));
  }, []);

  const setTranscription = useCallback((text: string | null, fromFile = false) => {
    setState(prev => ({ 
      ...prev, 
      transcription: text,
      isFromFile: fromFile,
      currentStep: text ? 'generating' : prev.currentStep
    }));
  }, []);

  const setBrief = useCallback((brief: any | null) => {
    setState(prev => ({ 
      ...prev, 
      brief,
      currentStep: brief ? 'reviewing' : prev.currentStep
    }));
  }, []);

  const setImprovedBrief = useCallback((brief: any | null) => {
    setState(prev => ({ 
      ...prev, 
      improvedBrief: brief,
      currentStep: brief ? 'reviewing' : prev.currentStep
    }));
  }, []);

  const setBriefId = useCallback((id: string | null) => {
    setState(prev => ({ ...prev, briefId: id }));
  }, []);

  const showImprovementModal = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showImprovementModal: true,
      currentStep: 'improving'
    }));
  }, []);

  const hideImprovementModal = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      showImprovementModal: false,
      currentStep: 'reviewing'
    }));
  }, []);

  const showFinalEditor = useCallback(() => {
    setState(prev => ({ ...prev, showFinalEditor: true }));
  }, []);

  const hideFinalEditor = useCallback(() => {
    setState(prev => ({ ...prev, showFinalEditor: false }));
  }, []);

  const reset = useCallback(() => {
    setState({
      inputMethod: null,
      currentStep: 'input',
      audioUri: null,
      transcription: null,
      brief: null,
      improvedBrief: null,
      briefId: null,
      isFromFile: false,
      showImprovementModal: false,
      showFinalEditor: false,
    });
  }, []);

  // Computed values
  const finalBrief = state.improvedBrief || state.brief;
  const hasContent = !!(state.audioUri || state.transcription);
  const isProcessing = ['transcribing', 'generating'].includes(state.currentStep);
  const canImprove = !!(state.brief) && state.currentStep === 'reviewing';

  return {
    // State
    ...state,
    
    // Computed
    finalBrief,
    hasContent,
    isProcessing,
    canImprove,
    
    // Actions
    setInputMethod,
    setCurrentStep,
    setAudioUri,
    setTranscription,
    setBrief,
    setImprovedBrief,
    setBriefId,
    showImprovementModal,
    hideImprovementModal,
    showFinalEditor,
    hideFinalEditor,
    reset,
  };
}