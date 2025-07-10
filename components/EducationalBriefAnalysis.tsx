import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Modal } from 'react-native';
import { 
  EducationalAnalysisResult, 
  BriefHealthCheck, 
  AnalysisInsight, 
  VerbalScore, 
  OverallAssessment, 
  ReadinessLevel 
} from '../hooks/useEducationalBriefAnalysis';

interface EducationalBriefAnalysisProps {
  analysis: EducationalAnalysisResult | null;
  loading: boolean;
  error: string | null;
  onStartImprovement: (focusAreas: string[]) => void;
  onReAnalyze: () => void;
  brief?: any;
}

type ViewMode = 'overview' | 'detailed' | 'learn' | 'action-plan';

const EducationalBriefAnalysis: React.FC<EducationalBriefAnalysisProps> = ({
  analysis,
  loading,
  error,
  onStartImprovement,
  onReAnalyze,
  brief,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [selectedHealthCheck, setSelectedHealthCheck] = useState<BriefHealthCheck | null>(null);
  const [selectedActions, setSelectedActions] = useState<string[]>([]);
  const [showInsightModal, setShowInsightModal] = useState(false);
  const [selectedInsight, setSelectedInsight] = useState<AnalysisInsight | null>(null);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>🔍 Analizando tu brief...</Text>
        <Text style={styles.loadingSubtext}>Evaluando cada sección con criterios profesionales</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>🤔</Text>
        <Text style={styles.errorTitle}>Algo salió mal</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={onReAnalyze}>
          <Text style={styles.retryButtonText}>🔄 Intentar de nuevo</Text>
        </Pressable>
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📚</Text>
        <Text style={styles.emptyTitle}>¡Vamos a aprender juntos!</Text>
        <Text style={styles.emptyText}>Analiza tu brief para recibir feedback educativo y tips profesionales</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header con grade y navegación */}
      <View style={styles.header}>
        <BriefGradeDisplay 
          assessment={analysis.overallAssessment}
          score={analysis.overallScore}
          readinessLevel={analysis.readinessLevel}
        />
        <ViewModeNavigation 
          currentMode={viewMode}
          onModeChange={setViewMode}
        />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {viewMode === 'overview' && (
          <OverviewSection
            analysis={analysis}
            onHealthCheckPress={setSelectedHealthCheck}
          />
        )}

        {viewMode === 'detailed' && (
          <DetailedSection
            healthChecks={analysis.healthChecks}
            onInsightPress={(insight) => {
              setSelectedInsight(insight);
              setShowInsightModal(true);
            }}
          />
        )}

        {viewMode === 'learn' && (
          <LearnSection
            didYouKnow={analysis.didYouKnow}
            bestPractices={analysis.bestPractices}
            commonMistakes={analysis.commonMistakes}
          />
        )}

        {viewMode === 'action-plan' && (
          <ActionPlanSection
            priorityActions={analysis.priorityActions}
            selectedActions={selectedActions}
            onToggleAction={(actionId) => {
              setSelectedActions(prev => 
                prev.includes(actionId)
                  ? prev.filter(id => id !== actionId)
                  : [...prev, actionId]
              );
            }}
          />
        )}
      </ScrollView>

      {/* Footer con CTA */}
      <View style={styles.footer}>
        {viewMode === 'action-plan' && selectedActions.length > 0 ? (
          <Pressable 
            style={styles.primaryButton}
            onPress={() => onStartImprovement(selectedActions)}
          >
            <Text style={styles.primaryButtonText}>
              ✨ Mejorar {selectedActions.length} área{selectedActions.length > 1 ? 's' : ''} seleccionada{selectedActions.length > 1 ? 's' : ''}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.footerButtons}>
            <Pressable 
              style={styles.secondaryButton}
              onPress={onReAnalyze}
            >
              <Text style={styles.secondaryButtonText}>🔄 Re-analizar</Text>
            </Pressable>
            <Pressable 
              style={styles.primaryButton}
              onPress={() => setViewMode('action-plan')}
            >
              <Text style={styles.primaryButtonText}>📋 Ver plan de acción</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Modal para insights detallados */}
      {showInsightModal && selectedInsight && (
        <InsightModal
          insight={selectedInsight}
          onClose={() => {
            setShowInsightModal(false);
            setSelectedInsight(null);
          }}
        />
      )}
    </View>
  );
};

// Componente para mostrar la evaluación verbal del brief
const BriefGradeDisplay: React.FC<{
  assessment: OverallAssessment;
  score: VerbalScore;
  readinessLevel: ReadinessLevel;
}> = ({ assessment, score, readinessLevel }) => {
  const getScoreColor = (score: VerbalScore) => {
    switch (score) {
      case 'excelente': return '#10b981';
      case 'muy-bueno': return '#059669';
      case 'bueno': return '#3b82f6';
      case 'regular': return '#6366f1';
      case 'puede-mejorar': return '#f59e0b';
      case 'necesita-trabajo': return '#ef4444';
      case 'incompleto': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getScoreEmoji = (score: VerbalScore) => {
    switch (score) {
      case 'excelente': return '🏆';
      case 'muy-bueno': return '🌟';
      case 'bueno': return '👍';
      case 'regular': return '👌';
      case 'puede-mejorar': return '🔧';
      case 'necesita-trabajo': return '📝';
      case 'incompleto': return '❌';
      default: return '❓';
    }
  };

  const getAssessmentInfo = (assessment: OverallAssessment) => {
    switch (assessment) {
      case 'muy-completo': return { emoji: '🏆', title: 'Brief muy completo' };
      case 'bien-estructurado': return { emoji: '✨', title: 'Brief bien estructurado' };
      case 'funcional': return { emoji: '🛠️', title: 'Brief funcional' };
      case 'basico': return { emoji: '📋', title: 'Brief básico' };
      case 'incompleto': return { emoji: '🚧', title: 'Brief en construcción' };
      default: return { emoji: '📄', title: 'Brief' };
    }
  };

  const getReadinessMessage = (level: ReadinessLevel) => {
    switch (level) {
      case 'listo-para-presentar': return '🚀 Listo para presentar';
      case 'casi-listo': return '⭐ Casi listo';
      case 'necesita-pulir': return '🔧 Necesita pulirse';
      case 'requiere-desarrollo': return '📝 Requiere desarrollo';
      default: return level;
    }
  };

  const assessmentInfo = getAssessmentInfo(assessment);

  return (
    <View style={styles.gradeDisplay}>
      <View style={styles.gradeCircle}>
        <Text style={styles.gradeEmoji}>{getScoreEmoji(score)}</Text>
        <Text style={[styles.gradeText, { color: getScoreColor(score) }]}>
          {score.replace('-', ' ')}
        </Text>
      </View>
      <View style={styles.gradeInfo}>
        <Text style={styles.readinessText}>{getReadinessMessage(readinessLevel)}</Text>
        <Text style={styles.gradeDescription}>
          {assessmentInfo.title}
        </Text>
      </View>
    </View>
  );
};

// Navegación entre modos de vista
const ViewModeNavigation: React.FC<{
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}> = ({ currentMode, onModeChange }) => {
  const modes = [
    { id: 'overview', title: 'Resumen', icon: '📊' },
    { id: 'detailed', title: 'Detallado', icon: '🔍' },
    { id: 'learn', title: 'Aprende', icon: '🎓' },
    { id: 'action-plan', title: 'Plan', icon: '📋' }
  ];

  return (
    <View style={styles.modeNavigation}>
      {modes.map((mode) => (
        <Pressable
          key={mode.id}
          style={[
            styles.modeTab,
            currentMode === mode.id && styles.activeModeTab
          ]}
          onPress={() => onModeChange(mode.id as ViewMode)}
        >
          <Text style={styles.modeIcon}>{mode.icon}</Text>
          <Text style={[
            styles.modeTitle,
            currentMode === mode.id && styles.activeModeTitle
          ]}>
            {mode.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

// Sección de overview
const OverviewSection: React.FC<{
  analysis: EducationalAnalysisResult;
  onHealthCheckPress: (healthCheck: BriefHealthCheck) => void;
}> = ({ analysis, onHealthCheckPress }) => {
  return (
    <View style={styles.overviewSection}>
      {/* Progress indicator */}
      <ProgressIndicator progress={analysis.progressIndicators} />

      {/* Health checks grid */}
      <Text style={styles.sectionTitle}>📋 Estado de tu brief</Text>
      <View style={styles.healthChecksGrid}>
        {analysis.healthChecks.map((healthCheck, index) => (
          <HealthCheckCard
            key={index}
            healthCheck={healthCheck}
            onPress={() => onHealthCheckPress(healthCheck)}
          />
        ))}
      </View>

      {/* Quick wins */}
      {analysis.priorityActions.length > 0 && (
        <View style={styles.quickWinsSection}>
          <Text style={styles.sectionTitle}>⚡ Mejoras rápidas</Text>
          <Text style={styles.sectionSubtitle}>
            Cambios pequeños que pueden hacer una gran diferencia
          </Text>
          {analysis.priorityActions.slice(0, 2).map((action, index) => (
            <QuickWinCard key={index} action={action} />
          ))}
        </View>
      )}
    </View>
  );
};

// Indicador de progreso
const ProgressIndicator: React.FC<{
  progress: EducationalAnalysisResult['progressIndicators'];
}> = ({ progress }) => {
  return (
    <View style={styles.progressCard}>
      <Text style={styles.progressTitle}>🎯 Tu progreso</Text>
      
      {progress.completedWell.length > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>✅ Áreas que dominas:</Text>
          <Text style={styles.progressText}>{progress.completedWell.join(', ')}</Text>
        </View>
      )}
      
      {progress.improvementAreas.length > 0 && (
        <View style={styles.progressSection}>
          <Text style={styles.progressLabel}>🎯 Áreas de oportunidad:</Text>
          <Text style={styles.progressText}>{progress.improvementAreas.join(', ')}</Text>
        </View>
      )}
      
      <View style={styles.progressSection}>
        <Text style={styles.progressLabel}>🚀 Siguiente paso:</Text>
        <Text style={styles.nextMilestone}>{progress.nextMilestone}</Text>
      </View>
    </View>
  );
};

// Card para health check
const HealthCheckCard: React.FC<{
  healthCheck: BriefHealthCheck;
  onPress: () => void;
}> = ({ healthCheck, onPress }) => {
  const getStatusColor = (verbalScore: VerbalScore) => {
    switch (verbalScore) {
      case 'excelente': return '#10b981';
      case 'muy-bueno': return '#059669';
      case 'bueno': return '#3b82f6';
      case 'regular': return '#6366f1';
      case 'puede-mejorar': return '#f59e0b';
      case 'necesita-trabajo': return '#ef4444';
      case 'incompleto': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (verbalScore: VerbalScore) => {
    switch (verbalScore) {
      case 'excelente': return '🏆';
      case 'muy-bueno': return '🌟';
      case 'bueno': return '👍';
      case 'regular': return '👌';
      case 'puede-mejorar': return '🔧';
      case 'necesita-trabajo': return '📝';
      case 'incompleto': return '❌';
      default: return '❓';
    }
  };

  return (
    <Pressable style={styles.healthCheckCard} onPress={onPress}>
      <View style={styles.healthCheckHeader}>
        <Text style={styles.healthCheckIcon}>{healthCheck.icon}</Text>
        <Text style={[styles.healthCheckScore, { color: getStatusColor(healthCheck.verbalScore) }]}>
          {healthCheck.verbalScore.replace('-', ' ')}
        </Text>
        <Text style={styles.statusIcon}>{getStatusIcon(healthCheck.verbalScore)}</Text>
      </View>
      <Text style={styles.healthCheckCategory}>{healthCheck.category}</Text>
      <Text style={styles.healthCheckHeadline}>{healthCheck.headline}</Text>
      {healthCheck.learningTip && (
        <Text style={styles.learningTip}>{healthCheck.learningTip}</Text>
      )}
    </Pressable>
  );
};

// Card para quick wins
const QuickWinCard: React.FC<{ action: any }> = ({ action }) => {
  return (
    <View style={styles.quickWinCard}>
      <View style={styles.quickWinHeader}>
        <Text style={styles.quickWinTitle}>{action.title}</Text>
        <Text style={styles.quickWinTime}>{action.timeToComplete}</Text>
      </View>
      <Text style={styles.quickWinWhy}>{action.why}</Text>
      <Text style={styles.quickWinHow}>{action.how}</Text>
    </View>
  );
};

// Sección detallada
const DetailedSection: React.FC<{
  healthChecks: BriefHealthCheck[];
  onInsightPress: (insight: AnalysisInsight) => void;
}> = ({ healthChecks, onInsightPress }) => {
  return (
    <View style={styles.detailedSection}>
      <Text style={styles.sectionTitle}>🔍 Análisis detallado</Text>
      <Text style={styles.sectionSubtitle}>
        Toca cualquier insight para ver ejemplos y explicaciones
      </Text>
      
      {healthChecks.map((healthCheck, index) => (
        <DetailedHealthCheckCard
          key={index}
          healthCheck={healthCheck}
          onInsightPress={onInsightPress}
        />
      ))}
    </View>
  );
};

const DetailedHealthCheckCard: React.FC<{
  healthCheck: BriefHealthCheck;
  onInsightPress: (insight: AnalysisInsight) => void;
}> = ({ healthCheck, onInsightPress }) => {
  return (
    <View style={styles.detailedCard}>
      <View style={styles.detailedHeader}>
        <Text style={styles.detailedIcon}>{healthCheck.icon}</Text>
        <View style={styles.detailedInfo}>
          <Text style={styles.detailedCategory}>{healthCheck.category}</Text>
          <Text style={styles.detailedHeadline}>{healthCheck.headline}</Text>
        </View>
        <Text style={styles.detailedScore}>{healthCheck.verbalScore.replace('-', ' ')}</Text>
      </View>
      
      <Text style={styles.detailedExplanation}>{healthCheck.explanation}</Text>
      
      <View style={styles.insightsContainer}>
        {healthCheck.insights.map((insight, index) => (
          <Pressable
            key={index}
            style={styles.insightCard}
            onPress={() => onInsightPress(insight)}
          >
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightExplanation}>{insight.explanation}</Text>
            <Text style={styles.insightCTA}>Toca para ver ejemplo →</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

// Sección de aprendizaje
const LearnSection: React.FC<{
  didYouKnow: string[];
  bestPractices: string[];
  commonMistakes: string[];
}> = ({ didYouKnow, bestPractices, commonMistakes }) => {
  return (
    <View style={styles.learnSection}>
      <Text style={styles.sectionTitle}>🎓 Centro de aprendizaje</Text>
      
      <LearningCard
        title="💡 ¿Sabías que...?"
        items={didYouKnow}
        color="#3b82f6"
      />
      
      <LearningCard
        title="✅ Mejores prácticas"
        items={bestPractices}
        color="#10b981"
      />
      
      <LearningCard
        title="⚠️ Errores comunes"
        items={commonMistakes}
        color="#f59e0b"
      />
    </View>
  );
};

const LearningCard: React.FC<{
  title: string;
  items: string[];
  color: string;
}> = ({ title, items, color }) => {
  return (
    <View style={[styles.learningCard, { borderLeftColor: color }]}>
      <Text style={styles.learningCardTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={index} style={styles.learningItem}>
          <View style={[styles.learningBullet, { backgroundColor: color }]} />
          <Text style={styles.learningText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

// Sección de plan de acción
const ActionPlanSection: React.FC<{
  priorityActions: any[];
  selectedActions: string[];
  onToggleAction: (actionId: string) => void;
}> = ({ priorityActions, selectedActions, onToggleAction }) => {
  return (
    <View style={styles.actionPlanSection}>
      <Text style={styles.sectionTitle}>📋 Tu plan de acción</Text>
      <Text style={styles.sectionSubtitle}>
        Selecciona las áreas en las que quieres trabajar
      </Text>
      
      {priorityActions.map((action, index) => (
        <ActionCard
          key={action.id}
          action={action}
          isSelected={selectedActions.includes(action.id)}
          onToggle={() => onToggleAction(action.id)}
        />
      ))}
    </View>
  );
};

const ActionCard: React.FC<{
  action: any;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ action, isSelected, onToggle }) => {
  return (
    <Pressable
      style={[
        styles.actionCard,
        isSelected && styles.selectedActionCard
      ]}
      onPress={onToggle}
    >
      <View style={styles.actionHeader}>
        <View style={styles.actionSelection}>
          <View style={[
            styles.actionCheckbox,
            isSelected && styles.checkedActionBox
          ]}>
            {isSelected && <Text style={styles.actionCheckmark}>✓</Text>}
          </View>
          <Text style={styles.actionTitle}>{action.title}</Text>
        </View>
        <View style={styles.actionBadges}>
          <Text style={styles.actionImpact}>{action.impact}</Text>
          <Text style={styles.actionTime}>{action.timeToComplete}</Text>
        </View>
      </View>
      
      <Text style={styles.actionWhy}>Por qué: {action.why}</Text>
      <Text style={styles.actionHow}>Cómo: {action.how}</Text>
    </Pressable>
  );
};

// Modal para mostrar insights detallados
const InsightModal: React.FC<{
  insight: AnalysisInsight;
  onClose: () => void;
}> = ({ insight, onClose }) => {
  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{insight.title}</Text>
            <Pressable style={styles.modalClose} onPress={onClose}>
              <Text style={styles.modalCloseText}>✕</Text>
            </Pressable>
          </View>
          
          <ScrollView style={styles.modalBody}>
            <Text style={styles.modalExplanation}>{insight.explanation}</Text>
            
            <Text style={styles.modalSectionTitle}>💡 Por qué importa:</Text>
            <Text style={styles.modalText}>{insight.whyItMatters}</Text>
            
            <Text style={styles.modalSectionTitle}>✅ Ejemplo de buena práctica:</Text>
            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>{insight.examples.good}</Text>
            </View>
            
            {insight.examples.current && (
              <>
                <Text style={styles.modalSectionTitle}>📝 Tu versión actual:</Text>
                <View style={styles.currentBox}>
                  <Text style={styles.currentText}>{insight.examples.current}</Text>
                </View>
              </>
            )}
            
            {insight.quickWin && (
              <>
                <Text style={styles.modalSectionTitle}>⚡ Acción rápida:</Text>
                <View style={styles.quickWinBox}>
                  <Text style={styles.quickWinAction}>{insight.quickWin.action}</Text>
                  <Text style={styles.quickWinMeta}>
                    Tiempo: {insight.quickWin.timeEstimate} • Dificultad: {insight.quickWin.difficulty}
                  </Text>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
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
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  gradeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  gradeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    borderWidth: 3,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  gradeText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  gradeInfo: {
    flex: 1,
  },
  readinessText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  gradeDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  modeNavigation: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  activeModeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  modeTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
  },
  activeModeTitle: {
    color: '#1e293b',
    fontWeight: '600',
  },
  overviewSection: {
    padding: 20,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#475569',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  nextMilestone: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    lineHeight: 20,
  },
  healthChecksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  healthCheckCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  healthCheckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthCheckIcon: {
    fontSize: 20,
  },
  healthCheckScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
  },
  statusIcon: {
    fontSize: 16,
  },
  healthCheckCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 4,
  },
  healthCheckHeadline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
    lineHeight: 18,
  },
  learningTip: {
    fontSize: 11,
    color: '#3b82f6',
    fontStyle: 'italic',
    lineHeight: 14,
  },
  quickWinsSection: {
    marginTop: 8,
  },
  quickWinCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickWinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickWinTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  quickWinTime: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  quickWinWhy: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 16,
  },
  quickWinHow: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  detailedSection: {
    padding: 20,
  },
  detailedCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailedIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  detailedInfo: {
    flex: 1,
  },
  detailedCategory: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 2,
  },
  detailedHeadline: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: 20,
  },
  detailedScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3b82f6',
  },
  detailedExplanation: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  insightsContainer: {
    gap: 8,
  },
  insightCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  insightExplanation: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 16,
    marginBottom: 8,
  },
  insightCTA: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '500',
  },
  learnSection: {
    padding: 20,
  },
  learningCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  learningCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  learningItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  learningBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  learningText: {
    flex: 1,
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  actionPlanSection: {
    padding: 20,
  },
  actionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedActionCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  actionSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    backgroundColor: '#ffffff',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedActionBox: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  actionCheckmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  actionBadges: {
    alignItems: 'flex-end',
  },
  actionImpact: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginBottom: 2,
  },
  actionTime: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  actionWhy: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 18,
  },
  actionHow: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    maxHeight: '80%',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  modalExplanation: {
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  modalText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  exampleBox: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    marginBottom: 16,
  },
  exampleText: {
    fontSize: 14,
    color: '#0c4a6e',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  currentBox: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
    marginBottom: 16,
  },
  currentText: {
    fontSize: 14,
    color: '#92400e',
    lineHeight: 20,
  },
  quickWinBox: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  quickWinAction: {
    fontSize: 14,
    color: '#065f46',
    fontWeight: '500',
    marginBottom: 4,
  },
  quickWinMeta: {
    fontSize: 12,
    color: '#047857',
  },
});

export default EducationalBriefAnalysis;