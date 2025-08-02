import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  Modal, 
  Pressable, 
  StyleSheet, 
  Text, 
  View,
  ScrollView,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  Animated
} from 'react-native';
import { combineStyles } from '../utils/styleUtils';
import EducationalBriefAnalysis from './EducationalBriefAnalysis';
import ImprovedStructuredChatInterface from './ImprovedStructuredChatInterface';
import EditableBriefView from './EditableBriefView';
import { useEducationalBriefAnalysis } from '../hooks/useEducationalBriefAnalysis';
import { useStructuredChat } from '../hooks/useStructuredChat';

interface StructuredBriefImprovementModalProps {
  visible: boolean;
  brief: any;
  onClose: () => void;
  onBriefImproved: (improvedBrief: any) => void;
}

type ModalStep = 'analysis' | 'structured-improvement';
type ViewMode = 'chat-focus' | 'brief-focus' | 'side-by-side';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isTablet = screenWidth > 768;

/**
 * Modal mejorado con vista side-by-side para chat estructurado y brief editable
 * NUEVA VERSIÓN CON UX OPTIMIZADA
 */
const StructuredBriefImprovementModal: React.FC<StructuredBriefImprovementModalProps> = ({
  visible,
  brief,
  onClose,
  onBriefImproved,
}) => {
  if (__DEV__) {
    console.log('🎯 [Modal] Props recibidas:', {
      visible,
      briefExists: !!brief,
      briefKeys: brief ? Object.keys(brief).length : 0,
      briefContent: brief ? Object.keys(brief) : [],
      timestamp: new Date().toLocaleTimeString()
    });
  }

  const [currentStep, setCurrentStep] = useState<ModalStep>('analysis');
  const [viewMode, setViewMode] = useState<ViewMode>(isTablet ? 'side-by-side' : 'chat-focus');
  const [workingBrief, setWorkingBrief] = useState<any>(brief || {});
  const [isUpdatingBrief, setIsUpdatingBrief] = useState(false);
  const [improvementsApplied, setImprovementsApplied] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Animations
  const slideAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  // Sync working brief with prop
  useEffect(() => {
    if (brief && (!workingBrief || Object.keys(workingBrief).length === 0)) {
      if (__DEV__) {
        console.log('📋 Inicializando workingBrief con brief recibido:', brief);
      }
      setWorkingBrief(brief);
    }
  }, [brief]);

  // Analysis hook
  const briefToAnalyze = useMemo(() => {
    return workingBrief && Object.keys(workingBrief).length > 0 ? workingBrief : brief;
  }, [workingBrief, brief]);

  const shouldAnalyze = visible && briefToAnalyze && Object.keys(briefToAnalyze).length > 0;
  const { 
    analysis: educationalAnalysis, 
    loading: educationalAnalysisLoading, 
    error: educationalAnalysisError, 
    reAnalyze: reAnalyzeEducational 
  } = useEducationalBriefAnalysis(shouldAnalyze ? briefToAnalyze : null);

  // Chat hook
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

  function handleBriefUpdate(updatedBrief: any) {
    const timestamp = new Date().toLocaleTimeString();
    if (__DEV__) {
      console.log(`📝 [${timestamp}] Modal recibió actualización del brief:`, {
        hasUpdate: !!updatedBrief,
        previousFieldCount: workingBrief ? Object.keys(workingBrief).length : 0,
        newFieldCount: updatedBrief ? Object.keys(updatedBrief).length : 0,
        briefChanged: updatedBrief !== workingBrief,
      });
    }
    
    if (updatedBrief && updatedBrief !== workingBrief) {
      setWorkingBrief(updatedBrief);
      setIsUpdatingBrief(true);
      
      // Animate update
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => setIsUpdatingBrief(false), 1500);
    }
  }

  const handleStartStructuredImprovement = useCallback((selectedAreas: string[]) => {
    if (__DEV__) {
      console.log('🎯 Iniciando mejoras estructuradas para áreas:', selectedAreas);
      console.log('📋 Brief actual para mejoras:', brief);
    }
    
    setCurrentStep('structured-improvement');
    
    if (brief && Object.keys(brief).length > 0) {
      setWorkingBrief(brief);
      if (__DEV__) {
        console.log('✅ workingBrief actualizado con brief actual');
      }
    }
    
    setImprovementsApplied(false);
    
    // Animate transition
    Animated.spring(slideAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start();
    
    setTimeout(() => {
      initializeChat();
    }, 300);
  }, [brief, initializeChat, slideAnim]);

  const handleBackToAnalysis = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 8,
    }).start(() => {
      setCurrentStep('analysis');
    });
  }, [slideAnim]);

  const handleCloseModal = useCallback(() => {
    if (workingBrief && workingBrief !== brief) {
      onBriefImproved(workingBrief);
    }
    
    // Reset state
    setCurrentStep('analysis');
    setWorkingBrief(brief);
    setViewMode(isTablet ? 'side-by-side' : 'chat-focus');
    slideAnim.setValue(0);
    fadeAnim.setValue(1);
    clearChat();
    setShowSuccessMessage(false);
    onClose();
  }, [brief, clearChat, onClose, workingBrief, onBriefImproved, slideAnim, fadeAnim]);

  const handleApplyImprovements = useCallback(() => {
    if (__DEV__) {
      console.log('🚀 Aplicando mejoras del brief:', {
        hasWorkingBrief: !!workingBrief,
        workingBriefFields: workingBrief ? Object.keys(workingBrief).length : 0,
        originalBriefFields: brief ? Object.keys(brief).length : 0,
        briefChanged: workingBrief !== brief
      });
    }
    
    if (workingBrief) {
      setImprovementsApplied(true);
      setIsUpdatingBrief(true);
      setShowSuccessMessage(true);
      
      const consolidatedBrief = {
        ...brief,
        ...workingBrief,
        briefSummary: workingBrief.briefSummary || brief?.briefSummary || '',
        updatedAt: new Date().toISOString(),
        improvedAt: new Date().toISOString(),
        improvementMetadata: {
          originalBriefFields: brief ? Object.keys(brief).length : 0,
          improvedBriefFields: Object.keys(workingBrief).length,
          improvementDate: new Date().toISOString(),
          structuredImprovementApplied: true,
          improvementIterations: (brief?.improvementMetadata?.improvementIterations || 0) + 1,
          previousScores: brief?.improvementMetadata?.previousScores || [],
          currentScore: null
        }
      };
      
      if (__DEV__) {
        console.log('🎯 Brief consolidado creado:', {
          originalFields: brief ? Object.keys(brief).length : 0,
          improvedFields: Object.keys(workingBrief).length,
          consolidatedFields: Object.keys(consolidatedBrief).length,
          hasBriefSummary: !!consolidatedBrief.briefSummary
        });
      }
      
      onBriefImproved(consolidatedBrief);
      
      setTimeout(() => {
        setIsUpdatingBrief(false);
        setShowSuccessMessage(false);
      }, 3000);
      
      setTimeout(() => {
        setImprovementsApplied(false);
      }, 5000);
    }
  }, [workingBrief, onBriefImproved, brief]);

  const handleManualBriefChange = useCallback((updatedBrief: any) => {
    if (__DEV__) {
      console.log('🖊️ Cambio manual desde EditableBriefView:', {
        timestamp: new Date().toLocaleTimeString(),
        camposActualizados: Object.keys(updatedBrief).length
      });
    }
    setWorkingBrief(updatedBrief);
  }, []);

  const toggleViewMode = () => {
    if (isTablet) {
      setViewMode(viewMode === 'side-by-side' ? 'chat-focus' : 'side-by-side');
    } else {
      setViewMode(viewMode === 'chat-focus' ? 'brief-focus' : 'chat-focus');
    }
  };

  // Effect para logging cuando el modal se abre/cierra
  useEffect(() => {
    if (__DEV__) {
      if (visible) {
        console.log('👀 [Modal] MODAL ABIERTO - Estado inicial:', {
          currentStep,
          workingBriefExists: !!workingBrief,
          workingBriefFields: workingBrief ? Object.keys(workingBrief).length : 0,
          briefExists: !!brief
        });
      } else {
        console.log('🔒 [Modal] MODAL CERRADO');
      }
    }
  }, [visible, currentStep, workingBrief, brief]);

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
        {/* Compact Header */}
        <View style={styles.compactHeader}>
          <View style={styles.compactHeaderContent}>
            {currentStep === 'structured-improvement' && (
              <Pressable 
                style={styles.compactBackButton} 
                onPress={handleBackToAnalysis}
              >
                <Text style={styles.backIcon}>←</Text>
              </Pressable>
            )}
            
            <View style={styles.compactHeaderCenter}>
              <Text style={styles.compactTitle}>
                {currentStep === 'analysis' ? 'Análisis' : 'Mejora del Brief'}
              </Text>
            </View>
            
            <Pressable 
              style={styles.compactCloseButton} 
              onPress={handleCloseModal}
            >
              <Text style={styles.closeIcon}>✕</Text>
            </Pressable>
          </View>
        </View>

        {/* Success Message */}
        {showSuccessMessage && (
          <Animated.View style={combineStyles(styles.successBanner, { opacity: fadeAnim })}>
            <Text style={styles.successText}>✅ Brief mejorado exitosamente</Text>
          </Animated.View>
        )}

        {/* Main Content */}
        <View style={styles.modernContent}>
          {currentStep === 'analysis' ? (
            <ScrollView 
              style={styles.analysisContainer}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.analysisContent}
            >
              <EducationalBriefAnalysis
                analysis={educationalAnalysis}
                loading={educationalAnalysisLoading}
                error={educationalAnalysisError}
                onStartImprovement={handleStartStructuredImprovement}
                onReAnalyze={reAnalyzeEducational}
                brief={brief}
              />
            </ScrollView>
          ) : (
            <View style={styles.improvementContainer}>
              {/* View Mode Toggle for Mobile */}
              {!isTablet && (
                <View style={styles.mobileToggle}>
                  <Pressable
                    style={[
                      styles.toggleButton,
                      viewMode === 'chat-focus' && styles.toggleButtonActive
                    ]}
                    onPress={() => setViewMode('chat-focus')}
                  >
                    <Text style={[
                      styles.toggleText,
                      viewMode === 'chat-focus' && styles.toggleTextActive
                    ]}>
                      💬 Chat
                    </Text>
                  </Pressable>
                  
                  <Pressable
                    style={[
                      styles.toggleButton,
                      viewMode === 'brief-focus' && styles.toggleButtonActive
                    ]}
                    onPress={() => setViewMode('brief-focus')}
                  >
                    <Text style={[
                      styles.toggleText,
                      viewMode === 'brief-focus' && styles.toggleTextActive
                    ]}>
                      📝 Brief
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Tablet Toggle */}
              {isTablet && (
                <View style={styles.tabletToggle}>
                  <Pressable
                    style={styles.viewToggleButton}
                    onPress={toggleViewMode}
                  >
                    <Text style={styles.viewToggleText}>
                      {viewMode === 'side-by-side' ? '🔍 Enfocar Chat' : '👁️ Vista Completa'}
                    </Text>
                  </Pressable>
                </View>
              )}

              {/* Content Based on View Mode */}
              <View style={styles.contentArea}>
                {viewMode === 'chat-focus' && (
                  <View style={styles.singlePanel}>
                    <View style={styles.modernPanelHeader}>
                      <View style={styles.panelHeaderContent}>
                        <Text style={styles.modernPanelTitle}>💬 Chat Estructurado</Text>
                        <Text style={styles.modernPanelSubtitle}>
                          Responde las preguntas para mejorar tu brief
                        </Text>
                      </View>
                      {progress && (
                        <View style={styles.progressBadge}>
                          <Text style={styles.progressBadgeText}>{Math.round(progress * 100)}%</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.chatContainer}>
                      <ImprovedStructuredChatInterface
                        messages={messages}
                        currentQuestion={currentQuestion}
                        isTyping={isTyping}
                        sendMessage={sendMessage}
                        isConnected={isConnected}
                        error={chatError}
                        progress={progress}
                      />
                    </View>
                  </View>
                )}

                {viewMode === 'brief-focus' && (
                  <View style={styles.singlePanel}>
                    <Animated.View style={[
                      styles.modernPanelHeader,
                      { opacity: isUpdatingBrief ? fadeAnim : 1 }
                    ]}>
                      <View style={styles.panelHeaderContent}>
                        <Text style={styles.modernPanelTitle}>📝 Brief en Tiempo Real</Text>
                        <Text style={styles.modernPanelSubtitle}>
                          {isUpdatingBrief ? 'Actualizando...' : 'Se actualiza automáticamente'}
                        </Text>
                      </View>
                      {isUpdatingBrief && (
                        <View style={styles.updateIndicator}>
                          <Text style={styles.updateIndicatorText}>🔄</Text>
                        </View>
                      )}
                    </Animated.View>
                    <View style={styles.briefContainer}>
                      <EditableBriefView
                        brief={workingBrief}
                        onBriefChange={handleManualBriefChange}
                        isUpdating={isUpdatingBrief}
                      />
                    </View>
                  </View>
                )}

                {viewMode === 'side-by-side' && (
                  <View style={styles.sideBySideLayout}>
                    {/* Chat Panel */}
                    <View style={styles.leftPanel}>
                      <View style={styles.modernPanelHeader}>
                        <View style={styles.panelHeaderContent}>
                          <Text style={styles.modernPanelTitle}>💬 Chat</Text>
                          <Text style={styles.modernPanelSubtitle}>
                            Preguntas estructuradas
                          </Text>
                        </View>
                        {progress && (
                          <View style={styles.progressBadge}>
                            <Text style={styles.progressBadgeText}>{Math.round(progress * 100)}%</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.panelContent}>
                        <ImprovedStructuredChatInterface
                          messages={messages}
                          currentQuestion={currentQuestion}
                          isTyping={isTyping}
                          sendMessage={sendMessage}
                          isConnected={isConnected}
                          error={chatError}
                          progress={progress}
                        />
                      </View>
                    </View>

                    {/* Brief Panel */}
                    <View style={styles.rightPanel}>
                      <Animated.View style={[
                        styles.modernPanelHeader,
                        { opacity: isUpdatingBrief ? fadeAnim : 1 }
                      ]}>
                        <View style={styles.panelHeaderContent}>
                          <Text style={styles.modernPanelTitle}>📝 Brief</Text>
                          <Text style={styles.modernPanelSubtitle}>
                            {isUpdatingBrief ? 'Actualizando...' : 'En tiempo real'}
                          </Text>
                        </View>
                        {isUpdatingBrief && (
                          <View style={styles.updateIndicator}>
                            <Text style={styles.updateIndicatorText}>🔄</Text>
                          </View>
                        )}
                      </Animated.View>
                      <View style={styles.panelContent}>
                        <EditableBriefView
                          brief={workingBrief}
                          onBriefChange={handleManualBriefChange}
                          isUpdating={isUpdatingBrief}
                        />
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>

        {/* Modern Footer */}
        {currentStep === 'structured-improvement' && (
          <View style={styles.modernFooter}>
            <View style={styles.footerContent}>
              <View style={styles.footerInfo}>
                <Text style={styles.footerMainText}>
                  {improvementsApplied ? '✅ Mejoras aplicadas correctamente' : 
                   isUpdatingBrief ? '🔄 Actualizando brief...' : 
                   '💡 El brief se actualiza automáticamente'}
                </Text>
                {!improvementsApplied && !isUpdatingBrief && (
                  <Text style={styles.footerSecondaryText}>
                    También puedes editarlo manualmente
                  </Text>
                )}
              </View>
              
              <Pressable 
                style={[
                  styles.modernApplyButton,
                  improvementsApplied && styles.modernApplyButtonSuccess,
                  (workingBrief && workingBrief !== brief) && styles.modernApplyButtonHasChanges
                ]} 
                onPress={handleApplyImprovements}
              >
                <Text style={styles.modernApplyButtonText}>
                  {improvementsApplied 
                    ? '✅ ¡Aplicado!' 
                    : (workingBrief && workingBrief !== brief) 
                      ? '🚀 Aplicar Mejoras' 
                      : '📋 Guardar Brief'
                  }
                </Text>
              </Pressable>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  
  // Ultra Compact Header
  compactHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 44 : 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  compactHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
    minHeight: 40,
  },
  compactBackButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginRight: 8,
  },
  compactHeaderCenter: {
    flex: 1,
    alignItems: 'center',
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  compactCloseButton: {
    padding: 4,
    marginLeft: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  modernBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 16,
  },
  backIcon: {
    fontSize: 16,
    color: '#374151',
    marginRight: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  modernTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  modernSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  modernCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
  },
  closeIcon: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  
  // Progress
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  progressLabelActive: {
    color: '#10B981',
  },
  
  // Success Banner
  successBanner: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D1FAE5',
  },
  successText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
  },
  
  // Content
  modernContent: {
    flex: 1,
  },
  analysisContainer: {
    flex: 1,
  },
  analysisContent: {
    padding: 24,
  },
  improvementContainer: {
    flex: 1,
  },
  
  // Mobile Toggle - Ultra Compact
  mobileToggle: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    marginHorizontal: 8,
    marginTop: 4,
    marginBottom: 4,
    borderRadius: 4,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 3,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#111827',
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  
  // Tablet Toggle - Minimal
  tabletToggle: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  viewToggleButton: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  viewToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
  },
  
  // Content Area - Maximized
  contentArea: {
    flex: 1,
    marginHorizontal: isTablet ? 12 : 8,
    marginBottom: 8,
    backgroundColor: '#F8FAFC',
  },
  
  // Single Panel
  singlePanel: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  
  // Side by Side Layout
  sideBySideLayout: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  leftPanel: {
    flex: isTablet ? 0.65 : 0.7, // More space for chat
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    minWidth: isTablet ? 400 : 280, // Minimum width for readability
  },
  rightPanel: {
    flex: isTablet ? 0.35 : 0.3, // Less space for brief view
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    minWidth: 250,
  },
  
  // Panel Headers - Minimal
  modernPanelHeader: {
    backgroundColor: '#F9FAFB',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  panelHeaderContent: {
    flex: 1,
  },
  modernPanelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  modernPanelSubtitle: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },
  progressBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  updateIndicator: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  updateIndicatorText: {
    fontSize: 16,
  },
  
  // Panel Content
  panelContent: {
    flex: 1,
  },
  chatContainer: {
    flex: 1,
  },
  briefContainer: {
    flex: 1,
  },
  
  // Modern Footer - Compact
  modernFooter: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  footerInfo: {
    flex: 1,
  },
  footerMainText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  footerSecondaryText: {
    fontSize: 12,
    color: '#6B7280',
  },
  modernApplyButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modernApplyButtonSuccess: {
    backgroundColor: '#10B981',
  },
  modernApplyButtonHasChanges: {
    backgroundColor: '#F59E0B',
  },
  modernApplyButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  // Legacy compatibility (mantenemos algunos estilos antiguos por si son referenciados)
  header: {
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  content: {
    flex: 1,
  },
});

export default StructuredBriefImprovementModal;