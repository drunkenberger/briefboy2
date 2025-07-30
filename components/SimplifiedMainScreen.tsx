import React, { useEffect } from 'react';
import { View, StyleSheet, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import our new components
import UnifiedInput from './UnifiedInput';
import BriefWorkflowProgress from './BriefWorkflowProgress';
import ModernBriefDisplay from './ModernBriefDisplay';
import StructuredBriefImprovementModal from './StructuredBriefImprovementModal';

// Import hooks
import { useBriefWorkflow } from '../hooks/useBriefWorkflow';
import { useWhisperTranscription } from '../hooks/useWhisperTranscription';
import { useBriefGeneration } from '../hooks/useBriefGeneration';
import { useBriefStorage } from '../hooks/useBriefStorage';

// Import utilities
import { checkApiKeysOnStartup } from '../utils/apiKeyValidator';

const SimplifiedMainScreen: React.FC = () => {
  const workflow = useBriefWorkflow();
  const { saveBrief } = useBriefStorage();

  // Audio transcription hook
  const { 
    transcription, 
    loading: transcriptionLoading, 
    error: transcriptionError 
  } = useWhisperTranscription(
    workflow.audioUri,
    !!workflow.audioUri && workflow.inputMethod === 'audio'
  );

  // Brief generation hook
  const { 
    brief, 
    loading: briefLoading, 
    error: briefError 
  } = useBriefGeneration(
    workflow.transcription,
    !!workflow.transcription && workflow.currentStep === 'generating'
  );

  // Check API keys on startup
  useEffect(() => {
    checkApiKeysOnStartup();
  }, []);

  // Handle transcription completion
  useEffect(() => {
    if (transcription && !transcriptionLoading && !transcriptionError) {
      workflow.setTranscription(transcription, workflow.isFromFile);
    }
  }, [transcription, transcriptionLoading, transcriptionError]);

  // Handle brief generation completion
  useEffect(() => {
    if (brief && !briefLoading && !briefError) {
      workflow.setBrief(brief);
      
      // Auto-save brief
      const autoSave = async () => {
        try {
          const title = brief.projectTitle || brief.title || `Brief ${new Date().toLocaleDateString()}`;
          const briefId = await saveBrief(
            title, 
            workflow.transcription || '', 
            brief, 
            workflow.audioUri || undefined
          );
          workflow.setBriefId(briefId);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      };
      
      autoSave();
    }
  }, [brief, briefLoading, briefError]);

  // Handle content input from UnifiedInput
  const handleContentReady = (content: string, type: 'audio' | 'text' | 'file', audioUri?: string) => {
    workflow.setInputMethod(type);
    
    if (type === 'audio' && audioUri) {
      workflow.setAudioUri(audioUri);
    } else if (type === 'text') {
      workflow.setTranscription(content, false);
    } else if (type === 'file') {
      // Handle file processing (this would need file processing logic)
      workflow.setTranscription(content, true);
    }
  };

  // Handle brief improvement
  const handleBriefImproved = (improvedBrief: any) => {
    workflow.setImprovedBrief(improvedBrief);
  };

  // Determine what to show based on workflow state
  const renderContent = () => {
    // Show progress when processing
    if (workflow.isProcessing || transcriptionLoading || briefLoading) {
      return (
        <BriefWorkflowProgress 
          currentStep={workflow.currentStep}
          isFromFile={workflow.isFromFile}
        />
      );
    }

    // Show brief when ready
    if (workflow.finalBrief && workflow.currentStep === 'reviewing') {
      return (
        <ModernBriefDisplay
          brief={workflow.finalBrief}
          onImprove={workflow.showImprovementModal}
          onShare={() => {/* Handle share */}}
          onExport={() => {/* Handle export */}}
        />
      );
    }

    // Show input by default
    return (
      <UnifiedInput
        onContentReady={handleContentReady}
        isProcessing={workflow.isProcessing}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.appTitle}>BriefBoy</Text>
        <Text style={styles.appSubtitle}>Generador de Briefs con IA</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Modals */}
      <StructuredBriefImprovementModal
        visible={workflow.showImprovementModal}
        brief={workflow.brief}
        onClose={workflow.hideImprovementModal}
        onBriefImproved={handleBriefImproved}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
});

export default SimplifiedMainScreen;