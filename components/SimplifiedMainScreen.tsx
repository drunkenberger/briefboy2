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
import { Theme } from '../constants/Theme';

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
    backgroundColor: Theme.colors.background,
  },
  header: {
    paddingHorizontal: Theme.spacing['2xl'],
    paddingVertical: Theme.spacing.xl,
    backgroundColor: Theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    ...Theme.shadows.sm,
  },
  appTitle: {
    fontSize: Theme.typography.fontSize['3xl'],
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
    textAlign: 'center',
    marginBottom: Theme.spacing.xs,
  },
  appSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textTertiary,
    textAlign: 'center',
    fontWeight: Theme.typography.fontWeight.medium,
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
});

export default SimplifiedMainScreen;