import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBriefAnalysis } from '../hooks/useBriefAnalysis';
import { useChatWithAI } from '../hooks/useChatWithAI';
import BriefAnalysisDisplay from './BriefAnalysisDisplay';
import FastChatInterface from './FastChatInterface';

interface BriefImprovementModalProps {
  visible: boolean;
  brief: any;
  onClose: () => void;
  onBriefImproved: (improvedBrief: any) => void;
}

type ModalStep = 'analysis' | 'chat';

/**
 * Modal mejorado para analisis y mejora de briefs
 * Incluye analisis detallado y chat conversacional rapido
 */
const BriefImprovementModal: React.FC<BriefImprovementModalProps> = ({
  visible,
  brief,
  onClose,
  onBriefImproved,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('analysis');
  const [improvedBrief, setImprovedBrief] = useState<any>(null);

  // Hook para analisis del brief
  const { analysis, loading: analysisLoading, error: analysisError, reAnalyze } = useBriefAnalysis(brief);

  // Hook para chat con IA
  const {
    messages,
    userInput,
    setUserInput,
    sendMessage,
    loading: isTyping,
    improvedBrief: newImprovedBrief
  } = useChatWithAI(brief, brief.transcription || '');

  useEffect(() => {
    if (newImprovedBrief) {
      setImprovedBrief(newImprovedBrief);
    }
  }, [newImprovedBrief]);

  const handleCloseModal = () => {
    setCurrentStep('analysis');
    setImprovedBrief(null);
    onClose();
  };

  const handleBackToAnalysis = () => {
    setCurrentStep('analysis');
  };

  const handleStartImprovement = () => {
    setCurrentStep('chat');
  };

  const handleApplyImprovements = () => {
    if (improvedBrief) {
      onBriefImproved(improvedBrief);
      handleCloseModal();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleCloseModal}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {currentStep === 'chat' && (
              <Pressable
                style={styles.backButton}
                onPress={handleBackToAnalysis}
              >
                <Text style={styles.backButtonText}>← Analisis</Text>
              </Pressable>
            )}

            <Text style={styles.headerTitle}>
              {currentStep === 'analysis' ? '📊 Analisis del Brief' : '💬 Mejorar Brief'}
            </Text>

            <Pressable
              style={styles.closeButton}
              onPress={handleCloseModal}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </Pressable>
          </View>

          {/* Indicador de paso */}
          <View style={styles.stepIndicator}>
            <View style={[
              styles.stepDot,
              currentStep === 'analysis' ? styles.stepDotActive : styles.stepDotInactive
            ]} />
            <View style={styles.stepLine} />
            <View style={[
              styles.stepDot,
              currentStep === 'chat' ? styles.stepDotActive : styles.stepDotInactive
            ]} />
          </View>
        </View>

        {/* Contenido principal */}
        <View style={styles.content}>
          {currentStep === 'analysis' ? (
            <BriefAnalysisDisplay
              analysis={analysis}
              loading={analysisLoading}
              error={analysisError}
              onStartImprovement={handleStartImprovement}
              onReAnalyze={reAnalyze}
            />
          ) : (
            <FastChatInterface
              messages={messages}
              isTyping={isTyping}
              sendMessage={sendMessage}
              error={null}
              onBriefGenerated={setImprovedBrief}
              userInput={userInput}
              setUserInput={setUserInput}
            />
          )}
        </View>

        {/* Footer para el chat */}
        {currentStep === 'chat' && improvedBrief && (
          <View style={styles.chatFooter}>
            <Text style={styles.successText}>✅ Brief mejorado generado</Text>
            <Pressable
              style={styles.applyButton}
              onPress={handleApplyImprovements}
            >
              <Text style={styles.applyButtonText}>🚀 Aplicar Mejoras</Text>
            </Pressable>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    marginRight: 12,
  },
  backButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotActive: {
    backgroundColor: '#2563eb',
  },
  stepDotInactive: {
    backgroundColor: '#cbd5e1',
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  chatFooter: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  successText: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BriefImprovementModal;