import React, { useState, useCallback, useEffect } from 'react';
import { 
  KeyboardAvoidingView, 
  Modal, 
  Platform, 
  Pressable, 
  StyleSheet, 
  Text, 
  View
} from 'react-native';
import EducationalBriefAnalysis from './EducationalBriefAnalysis';
import StructuredChatInterface from './StructuredChatInterface';
import EditableBriefView from './EditableBriefView';
import { useBriefAnalysis } from '../hooks/useBriefAnalysis';
import { useEducationalBriefAnalysis } from '../hooks/useEducationalBriefAnalysis';
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
  const [workingBrief, setWorkingBrief] = useState<any>(brief || {});
  const [isUpdatingBrief, setIsUpdatingBrief] = useState(false);
  const [improvementsApplied, setImprovementsApplied] = useState(false);
  
  // Sincronizar workingBrief cuando cambie el brief prop
  useEffect(() => {
    if (brief && (!workingBrief || Object.keys(workingBrief).length === 0)) {
      console.log('📋 Inicializando workingBrief con brief recibido:', brief);
      setWorkingBrief(brief);
    }
  }, [brief, workingBrief]);
  
  // Usar AMBOS hooks de análisis
  const { analysis: rawAnalysis, loading: rawAnalysisLoading, error: rawAnalysisError, reAnalyze: reAnalyzeRaw } = useBriefAnalysis(brief);
  const { analysis: educationalAnalysis, loading: educationalAnalysisLoading, error: educationalAnalysisError, reAnalyze: reAnalyzeEducational } = useEducationalBriefAnalysis(brief);
  
  // Pasar el ANÁLISIS CRUDO al chat
  const { 
    messages, 
    currentQuestion,
    isTyping, 
    sendMessage, 
    clearChat, 
    initializeChat,
    isConnected, 
    error: chatError,
    progress,
  } = useStructuredChat(workingBrief, handleBriefUpdate);

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
      // ACTUALIZACIÓN INMEDIATA sin demoras
      setWorkingBrief(updatedBrief);
      setIsUpdatingBrief(true);
      
      // Verificar inmediatamente que el brief tiene contenido
      const hasContent = Object.keys(updatedBrief).some(key => {
        const value = updatedBrief[key];
        return value && (typeof value === 'string' ? value.trim() : true);
      });
      
      console.log(`✅ [${timestamp}] Modal SINCRONIZADO:`, {
        hasContent,
        fieldCount: Object.keys(updatedBrief).length,
        briefUpdated: true
      });
      
      // Feedback visual mínimo
      setTimeout(() => {
        setIsUpdatingBrief(false);
      }, 1000);
    } else {
      console.error(`❌ [${timestamp}] Modal recibió brief NULO - esto es un error crítico`);
    }
  }

  const handleStartStructuredImprovement = useCallback((selectedAreas: string[]) => {
    console.log('🎯 Iniciando mejoras estructuradas para áreas:', selectedAreas);
    console.log('📋 Brief actual para mejoras:', brief);
    
    setCurrentStep('structured-improvement');
    // Asegurarse de que workingBrief tenga el brief actual
    if (brief && Object.keys(brief).length > 0) {
      setWorkingBrief(brief);
      console.log('✅ workingBrief actualizado con brief actual');
    } else {
      console.warn('⚠️ El brief está vacío o no definido');
    }
    setImprovementsApplied(false);
    
    // Inicializar el chat estructurado
    setTimeout(() => {
      initializeChat();
    }, 100);
  }, [brief, initializeChat]);

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
      // Mostrar feedback visual INMEDIATAMENTE
      setImprovementsApplied(true);
      setIsUpdatingBrief(true);
      
      // Verificar integridad antes de aplicar
      const camposCriticos = ['projectTitle', 'briefSummary', 'businessChallenge', 'strategicObjectives'];
      const camposPresentes = camposCriticos.filter(campo => {
        const valor = workingBrief[campo];
        return valor !== undefined && valor !== null && 
               (Array.isArray(valor) ? valor.length > 0 : 
                typeof valor === 'object' ? Object.keys(valor).length > 0 : 
                typeof valor === 'string' ? valor.trim().length > 0 : true);
      });
      
      console.log('🚀 APLICANDO MEJORAS - Verificación previa:', {
        totalCampos: Object.keys(workingBrief).length,
        camposCriticosPresentes: `${camposPresentes.length}/${camposCriticos.length}`,
        businessChallenge: workingBrief.businessChallenge ? '✅' : '❌',
        targetAudiencePrimary: workingBrief.targetAudience?.primary ? '✅' : '❌',
        bigIdea: workingBrief.creativeStrategy?.bigIdea ? '✅' : '❌',
        timestamp: new Date().toLocaleTimeString()
      });
      
      // Crear brief consolidado con mejoras aplicadas
      const consolidatedBrief = {
        ...brief, // Brief original como base
        ...workingBrief, // Aplicar todas las mejoras
        
        // Asegurar que los campos críticos estén presentes
        briefSummary: workingBrief.briefSummary || brief?.briefSummary || '',
        updatedAt: new Date().toISOString(),
        improvedAt: new Date().toISOString(),
        
        // Metadata de mejoras
        improvementMetadata: {
          originalBriefFields: brief ? Object.keys(brief).length : 0,
          improvedBriefFields: Object.keys(workingBrief).length,
          improvementDate: new Date().toISOString(),
          structuredImprovementApplied: true
        }
      };
      
      console.log('🎯 Brief consolidado creado:', {
        originalFields: brief ? Object.keys(brief).length : 0,
        improvedFields: Object.keys(workingBrief).length,
        consolidatedFields: Object.keys(consolidatedBrief).length,
        hasBriefSummary: !!consolidatedBrief.briefSummary
      });
      
      // Aplicar las mejoras consolidadas
      onBriefImproved(consolidatedBrief);
      console.log('✅ Brief consolidado aplicado correctamente');
      
      // Mantener el feedback visual por más tiempo
      setTimeout(() => {
        setIsUpdatingBrief(false);
      }, 2000);
      
      setTimeout(() => {
        setImprovementsApplied(false);
      }, 4000);
      
      // NO cerrar el modal automáticamente - mantener la vista abierta
      // handleCloseModal();
    } else {
      console.warn('⚠️ No hay workingBrief para aplicar');
    }
  }, [workingBrief, onBriefImproved, brief]);

  const handleManualBriefChange = useCallback((updatedBrief: any) => {
    console.log('🖊️ Cambio manual desde EditableBriefView:', {
      timestamp: new Date().toLocaleTimeString(),
      camposActualizados: Object.keys(updatedBrief).length
    });
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
            <EducationalBriefAnalysis
              analysis={educationalAnalysis} // Usar el análisis educativo aquí
              loading={educationalAnalysisLoading || rawAnalysisLoading} // Combinar estados de carga
              error={educationalAnalysisError || rawAnalysisError} // Combinar errores
              onStartImprovement={handleStartStructuredImprovement}
              onReAnalyze={() => {
                reAnalyzeRaw();
                reAnalyzeEducational();
              }}
              brief={brief}
            />
          ) : (
            <View style={styles.sideBySideContainer}>
              {/* Panel izquierdo: Chat estructurado */}
              <View style={styles.chatPanel}>
                <View style={[styles.panelHeader, styles.chatPanelHeader]}>
                  <View style={styles.panelTitleContainer}>
                    <View style={styles.panelIndicator} />
                    <Text style={styles.panelTitle}>💬 Chat Estructurado</Text>
                  </View>
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
                <View style={[styles.panelHeader, styles.briefPanelHeader]}>
                  <View style={styles.panelTitleContainer}>
                    <View style={[styles.panelIndicator, styles.briefPanelIndicator]} />
                    <Text style={styles.panelTitle}>📝 Brief en Tiempo Real</Text>
                  </View>
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
              <Pressable 
                style={styles.debugButton}
                onPress={() => {
                  console.log('🔧 FORZANDO SINCRONIZACIÓN MANUAL...');
                  if (workingBrief) {
                    setIsUpdatingBrief(true);
                    
                    // Verificar integridad del brief actual
                    const camposCriticos = ['projectTitle', 'briefSummary', 'businessChallenge', 'strategicObjectives', 'targetAudience', 'creativeStrategy'];
                    const camposPresentes = camposCriticos.filter(campo => {
                      const valor = workingBrief[campo];
                      return valor !== undefined && valor !== null && 
                             (Array.isArray(valor) ? valor.length > 0 : 
                              typeof valor === 'object' ? Object.keys(valor).length > 0 : 
                              typeof valor === 'string' ? valor.trim().length > 0 : true);
                    });
                    
                    console.log('🔄 ESTADO ACTUAL DEL BRIEF:', {
                      totalCampos: Object.keys(workingBrief).length,
                      camposCriticosPresentes: `${camposPresentes.length}/${camposCriticos.length}`,
                      businessChallenge: workingBrief.businessChallenge ? '✅ Presente' : '❌ Falta',
                      targetAudiencePrimary: workingBrief.targetAudience?.primary ? '✅ Presente' : '❌ Falta',
                      targetAudienceSecondary: workingBrief.targetAudience?.secondary ? '✅ Presente' : '❌ Falta',
                      bigIdea: workingBrief.creativeStrategy?.bigIdea ? '✅ Presente' : '❌ Falta',
                      briefCompleto: workingBrief
                    });
                    
                    setTimeout(() => setIsUpdatingBrief(false), 1000);
                  }
                }}
              >
                <Text style={styles.debugButtonText}>🔧 Debug Sync</Text>
              </Pressable>
            </View>
            <Pressable 
              style={[
                styles.applyButton,
                improvementsApplied && styles.applyButtonSuccess,
                (workingBrief && workingBrief !== brief) && styles.applyButtonHasChanges
              ]} 
              onPress={handleApplyImprovements}
            >
              <Text style={[
                styles.applyButtonText,
                improvementsApplied && styles.applyButtonTextSuccess
              ]}>
                {improvementsApplied 
                  ? '✅ ¡Mejoras Aplicadas!' 
                  : (workingBrief && workingBrief !== brief) 
                    ? '🚀 Aplicar Mejoras (•)' 
                    : '🚀 Aplicar Mejoras'
                }
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
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#FFD700',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  headerTitle: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  closeButtonText: {
    fontSize: 20,
    color: '#FFFFFF',
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
    backgroundColor: '#FFD700',
  },
  stepDotInactive: {
    backgroundColor: '#333333',
  },
  stepLine: {
    flex: 1,
    height: 4,
    backgroundColor: '#333333',
    marginHorizontal: 16,
  },
  content: {
    flex: 1,
  },
  sideBySideContainer: {
    flex: 1,
    flexDirection: 'row',
    minHeight: 0,
  },
  chatPanel: {
    flex: 0.55,
    backgroundColor: '#111111',
    borderRightWidth: 3,
    borderRightColor: '#FFD700',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    shadowColor: '#FFD700',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  briefPanel: {
    flex: 0.45,
    backgroundColor: '#000000',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  panelHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#000000',
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
    position: 'relative',
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  panelSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  panelTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  panelIndicator: {
    width: 4,
    height: 24,
    backgroundColor: '#FFD700',
    marginRight: 12,
    borderRadius: 0,
  },
  chatPanelHeader: {
    backgroundColor: '#111111',
  },
  briefPanelHeader: {
    backgroundColor: '#1a1a1a',
  },
  briefPanelIndicator: {
    backgroundColor: '#FFD700',
    opacity: 0.8,
  },
  structuredFooter: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.3)',
    paddingHorizontal: 20,
    paddingVertical: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerInfo: {
    flex: 1,
    marginRight: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '400',
    marginBottom: 6,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '400',
    letterSpacing: 0.5,
    lineHeight: 18,
    opacity: 0.8,
  },
  applyButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  applyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  applyButtonSuccess: {
    backgroundColor: '#FFD700',
    borderColor: '#FFFFFF',
  },
  applyButtonHasChanges: {
    backgroundColor: '#FFD700',
    borderColor: 'rgba(255, 255, 255, 0.5)',
    borderWidth: 2,
  },
  applyButtonTextSuccess: {
    color: '#000000',
  },
  successIndicator: {
    backgroundColor: '#d1fae5',
    borderBottomColor: '#10b981',
  },
  successText: {
    color: '#065f46',
    fontWeight: '600',
  },
  debugButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  debugButtonText: {
    color: '#FFD700',
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
});

export default StructuredBriefImprovementModal;