import React, { useState, useCallback } from 'react';
import { 
  KeyboardAvoidingView, 
  Modal, 
  Platform, 
  Pressable, 
  StyleSheet, 
  Text, 
  View
} from 'react-native';
import BriefAnalysisDisplay from './BriefAnalysisDisplay';
import StructuredChatInterface from './StructuredChatInterface';
import EditableBriefView from './EditableBriefView';
import { useBriefAnalysis } from '../hooks/useBriefAnalysis';
import { useStructuredChat } from '../hooks/useStructuredChat';

interface StructuredBriefImprovementModalProps {
  visible: boolean;
  brief: any;
  onClose: () => void;
  onBriefImproved: (improvedBrief: any) => void;
}

type ModalStep = 'analysis' | 'structured-improvement';


/**
 * Modal mejorado con vista side-by-side para chat estructurado y brief editable
 */
const StructuredBriefImprovementModal: React.FC<StructuredBriefImprovementModalProps> = ({
  visible,
  brief,
  onClose,
  onBriefImproved,
}) => {
  const [currentStep, setCurrentStep] = useState<ModalStep>('analysis');
  const [workingBrief, setWorkingBrief] = useState<any>(brief);
  const [isUpdatingBrief, setIsUpdatingBrief] = useState(false);
  const [improvementsApplied, setImprovementsApplied] = useState(false);
  
  // Hook para análisis del brief
  const { analysis, loading: analysisLoading, error: analysisError, reAnalyze } = useBriefAnalysis(brief);
  
  // Hook para chat estructurado
  const { 
    messages, 
    currentQuestion,
    isTyping, 
    sendMessage, 
    clearChat, 
    isConnected, 
    error: chatError,
    progress,
  } = useStructuredChat(brief, analysis, handleBriefUpdate);

  // Función para manejar actualizaciones del brief
  function handleBriefUpdate(updatedBrief: any) {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`📝 [${timestamp}] Modal recibió actualización del brief:`, {
      hasUpdate: !!updatedBrief,
      previousFieldCount: workingBrief ? Object.keys(workingBrief).length : 0,
      newFieldCount: updatedBrief ? Object.keys(updatedBrief).length : 0,
      briefChanged: updatedBrief !== workingBrief,
      sampleFields: {
        projectTitle: updatedBrief?.projectTitle,
        briefSummary: updatedBrief?.briefSummary?.substring(0, 50) + '...',
        targetAudience: updatedBrief?.targetAudience
      }
    });
    
    if (updatedBrief) {
      setIsUpdatingBrief(true);
      setWorkingBrief(updatedBrief);
      
      // Simular tiempo de actualización visual
      setTimeout(() => {
        setIsUpdatingBrief(false);
        console.log(`✅ [${timestamp}] Modal terminó actualización visual, workingBrief sincronizado`);
      }, 500);
    } else {
      console.warn(`⚠️ [${timestamp}] Modal recibió actualización vacía o nula`);
    }
  }

  const handleStartStructuredImprovement = useCallback(() => {
    setCurrentStep('structured-improvement');
    setWorkingBrief(brief);
    setImprovementsApplied(false);
  }, [brief]);

  const handleBackToAnalysis = useCallback(() => {
    setCurrentStep('analysis');
  }, []);

  const handleCloseModal = useCallback(() => {
    // Auto-save improvements if they exist
    if (workingBrief && workingBrief !== brief) {
      onBriefImproved(workingBrief);
    }
    
    setCurrentStep('analysis');
    setWorkingBrief(brief);
    clearChat();
    onClose();
  }, [brief, clearChat, onClose, workingBrief, onBriefImproved]);

  const handleApplyImprovements = useCallback(() => {
    console.log('🚀 Aplicando mejoras del brief:', {
      hasWorkingBrief: !!workingBrief,
      workingBriefFields: workingBrief ? Object.keys(workingBrief).length : 0,
      originalBriefFields: brief ? Object.keys(brief).length : 0,
      briefChanged: workingBrief !== brief
    });
    
    if (workingBrief) {
      onBriefImproved(workingBrief);
      console.log('✅ Mejoras aplicadas correctamente');
      
      // Mostrar feedback visual al usuario
      setImprovementsApplied(true);
      setIsUpdatingBrief(true);
      setTimeout(() => {
        setIsUpdatingBrief(false);
        setTimeout(() => {
          setImprovementsApplied(false);
        }, 2000);
      }, 1000);
      
      // NO cerrar el modal automáticamente - mantener la vista abierta
      // handleCloseModal();
    } else {
      console.warn('⚠️ No hay workingBrief para aplicar');
    }
  }, [workingBrief, onBriefImproved, brief]);

  const handleManualBriefChange = useCallback((updatedBrief: any) => {
    setWorkingBrief(updatedBrief);
  }, []);

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
            {currentStep === 'structured-improvement' && (
              <Pressable 
                style={styles.backButton} 
                onPress={handleBackToAnalysis}
              >
                <Text style={styles.backButtonText}>← Análisis</Text>
              </Pressable>
            )}
            
            <Text style={styles.headerTitle}>
              {currentStep === 'analysis' ? '📊 Análisis del Brief' : '🔄 Mejora Estructurada'}
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
              currentStep === 'structured-improvement' ? styles.stepDotActive : styles.stepDotInactive
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
              onStartImprovement={handleStartStructuredImprovement}
              onReAnalyze={reAnalyze}
              brief={brief}
            />
          ) : (
            <View style={styles.sideBySideContainer}>
              {/* Panel izquierdo: Chat estructurado */}
              <View style={styles.chatPanel}>
                <View style={styles.panelHeader}>
                  <Text style={styles.panelTitle}>💬 Chat Estructurado</Text>
                  <Text style={styles.panelSubtitle}>
                    Responde las preguntas una por una
                  </Text>
                </View>
                <StructuredChatInterface
                  messages={messages}
                  currentQuestion={currentQuestion}
                  isTyping={isTyping}
                  sendMessage={sendMessage}
                  isConnected={isConnected}
                  error={chatError}
                  progress={progress}
                />
              </View>

              {/* Panel derecho: Brief editable */}
              <View style={styles.briefPanel}>
                <View style={styles.panelHeader}>
                  <Text style={styles.panelTitle}>📝 Brief en Tiempo Real</Text>
                  <Text style={styles.panelSubtitle}>
                    Se actualiza automáticamente
                  </Text>
                </View>
                <EditableBriefView
                  brief={workingBrief}
                  onBriefChange={handleManualBriefChange}
                  isUpdating={isUpdatingBrief}
                />
              </View>
            </View>
          )}
        </View>

        {/* Footer para la vista estructurada */}
        {currentStep === 'structured-improvement' && (
          <View style={styles.structuredFooter}>
            <View style={styles.footerInfo}>
              <Text style={styles.footerText}>
                {isUpdatingBrief ? '🔄 Actualizando brief...' : '💡 El brief se actualiza automáticamente con tus respuestas'}
              </Text>
              <Text style={styles.footerSubtext}>
                {improvementsApplied ? '✅ ¡Mejoras guardadas correctamente!' : 'También puedes editarlo manualmente en el panel derecho'}
              </Text>
            </View>
            <Pressable 
              style={[
                styles.applyButton,
                improvementsApplied && styles.applyButtonSuccess
              ]} 
              onPress={handleApplyImprovements}
            >
              <Text style={[
                styles.applyButtonText,
                improvementsApplied && styles.applyButtonTextSuccess
              ]}>
                {improvementsApplied ? '✅ Mejoras Aplicadas!' : '🚀 Aplicar Mejoras'}
              </Text>
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
  sideBySideContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  chatPanel: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  briefPanel: {
    flex: 1,
    backgroundColor: '#f8fafc',
    minHeight: 0, // Allows flex child to shrink
  },
  panelHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 2,
  },
  panelSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  structuredFooter: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flex: 1,
    marginRight: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    marginBottom: 2,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#6b7280',
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
  applyButtonSuccess: {
    backgroundColor: '#059669',
  },
  applyButtonTextSuccess: {
    color: '#ffffff',
  },
});

export default StructuredBriefImprovementModal;