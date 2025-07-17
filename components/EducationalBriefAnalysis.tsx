import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View, Modal } from 'react-native';
import {
  EducationalAnalysisResult,
  BriefHealthCheck,
  AnalysisInsight,
  VerbalScore,
  OverallAssessment,
  ReadinessLevel,
  ActionPlan,
  ActionPhase,
  DetailedTask,
  TaskResource
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
        <ActivityIndicator size="large" color="#FFD700" />
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
            actionPlan={analysis.actionPlan}
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
              onPress={() => onStartImprovement([])}
            >
              <Text style={styles.primaryButtonText}>✨ Mejora Estructurada</Text>
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
      case 'bueno': return '#FFD700';
      case 'regular': return '#FFD700';
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
      case 'bueno': return '#FFD700';
      case 'regular': return '#FFD700';
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
        color="#FFD700"
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
  actionPlan: ActionPlan;
  selectedActions: string[];
  onToggleAction: (actionId: string) => void;
}> = ({ actionPlan, selectedActions, onToggleAction }) => {
  return (
    <View style={styles.actionPlanSection}>
      <Text style={styles.sectionTitle}>📋 Tu plan de acción personalizado</Text>

      {/* Resumen del plan */}
      <View style={styles.planSummaryCard}>
        <Text style={styles.planSummaryTitle}>📊 Resumen del plan</Text>
        <Text style={styles.planSummaryText}>{actionPlan.summary}</Text>

        <View style={styles.planMetrics}>
          <View style={styles.planMetric}>
            <Text style={styles.planMetricLabel}>Tiempo estimado</Text>
            <Text style={styles.planMetricValue}>{actionPlan.estimatedTimeTotal}</Text>
          </View>
          <View style={styles.planMetric}>
            <Text style={styles.planMetricLabel}>Dificultad</Text>
            <Text style={[styles.planMetricValue, { color: getDifficultyColor(actionPlan.difficulty) }]}>
              {getDifficultyLabel(actionPlan.difficulty)}
            </Text>
          </View>
          <View style={styles.planMetric}>
            <Text style={styles.planMetricLabel}>Mejora esperada</Text>
            <Text style={[styles.planMetricValue, { color: '#10b981' }]}>
              {actionPlan.expectedImprovement}
            </Text>
          </View>
        </View>
      </View>

      {/* Fases del plan */}
      {actionPlan.phases.map((phase: ActionPhase, index: number) => (
        <PhaseCard
          key={phase.id}
          phase={phase}
          phaseNumber={index + 1}
          selectedActions={selectedActions}
          onToggleAction={onToggleAction}
        />
      ))}
    </View>
  );
};

const PhaseCard: React.FC<{
  phase: ActionPhase;
  phaseNumber: number;
  selectedActions: string[];
  onToggleAction: (actionId: string) => void;
}> = ({ phase, phaseNumber, selectedActions, onToggleAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <View style={styles.phaseCard}>
      <Pressable
        style={styles.phaseHeader}
        onPress={() => setIsExpanded(!isExpanded)}
      >
        <View style={styles.phaseHeaderLeft}>
          <View style={[styles.phaseNumber, { backgroundColor: getPriorityColor(phase.priority) }]}>
            <Text style={styles.phaseNumberText}>{phaseNumber}</Text>
          </View>
          <View style={styles.phaseHeaderInfo}>
            <Text style={styles.phaseTitle}>{phase.title}</Text>
            <Text style={styles.phaseSubtitle}>{phase.description}</Text>
          </View>
        </View>
        <View style={styles.phaseHeaderRight}>
          <Text style={styles.phaseTime}>{phase.estimatedTime}</Text>
          <Text style={styles.phaseExpand}>{isExpanded ? '▼' : '▶'}</Text>
        </View>
      </Pressable>

      {isExpanded && (
        <View style={styles.phaseContent}>
          <View style={styles.phaseMetrics}>
            <View style={styles.phaseMetric}>
              <Text style={styles.phaseMetricLabel}>Impacto esperado</Text>
              <Text style={styles.phaseMetricValue}>{phase.expectedImpact}</Text>
            </View>
            <View style={styles.phaseMetric}>
              <Text style={styles.phaseMetricLabel}>Dificultad</Text>
              <Text style={[styles.phaseMetricValue, { color: getDifficultyColor(phase.difficulty) }]}>
                {getDifficultyLabel(phase.difficulty)}
              </Text>
            </View>
          </View>

          {phase.prerequisites && phase.prerequisites.length > 0 && (
            <View style={styles.phasePrerequisites}>
              <Text style={styles.phasePrerequisitesTitle}>🔑 Requisitos previos:</Text>
              {phase.prerequisites.map((prereq: string, index: number) => (
                <Text key={index} style={styles.phasePrerequisiteItem}>• {prereq}</Text>
              ))}
            </View>
          )}

          {phase.tasks.map((task: DetailedTask, taskIndex: number) => (
            <TaskCard
              key={task.id}
              task={task}
              taskNumber={taskIndex + 1}
              isSelected={selectedActions.includes(task.id)}
              onToggle={() => onToggleAction(task.id)}
            />
          ))}

          {phase.tips && phase.tips.length > 0 && (
            <View style={styles.phaseTips}>
              <Text style={styles.phaseTipsTitle}>💡 Consejos para esta fase:</Text>
              {phase.tips.map((tip: string, index: number) => (
                <Text key={index} style={styles.phaseTipItem}>• {tip}</Text>
              ))}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const TaskCard: React.FC<{
  task: DetailedTask;
  taskNumber: number;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ task, taskNumber, isSelected, onToggle }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View style={[styles.taskCard, isSelected && styles.selectedTaskCard]}>
      <Pressable
        style={styles.taskHeader}
        onPress={onToggle}
      >
        <View style={styles.taskSelection}>
          <View style={[
            styles.taskCheckbox,
            isSelected && styles.checkedTaskBox
          ]}>
            {isSelected && <Text style={styles.taskCheckmark}>✓</Text>}
          </View>
          <Text style={styles.taskNumber}>{taskNumber}.</Text>
          <Text style={styles.taskTitle}>{task.title}</Text>
        </View>
      </Pressable>

      <Text style={styles.taskDescription}>{task.description}</Text>

      {task.example && (
        <View style={styles.taskExample}>
          <Text style={styles.taskExampleTitle}>💡 Ejemplo:</Text>
          <Text style={styles.taskExampleText}>{task.example}</Text>
        </View>
      )}

      {isSelected && (
        <View style={styles.taskDetails}>
          <Pressable
            style={styles.taskDetailsToggle}
            onPress={() => setShowDetails(!showDetails)}
          >
            <Text style={styles.taskDetailsToggleText}>
              {showDetails ? '▼ Ocultar detalles' : '▶ Ver checklist completo'}
            </Text>
          </Pressable>

          {showDetails && (
            <View style={styles.taskDetailsContent}>
              <View style={styles.taskChecklist}>
                <Text style={styles.taskChecklistTitle}>✅ Checklist:</Text>
                {task.checklistItems.map((item: string, index: number) => (
                  <Text key={index} style={styles.taskChecklistItem}>• {item}</Text>
                ))}
              </View>

              <View style={styles.taskSuccess}>
                <Text style={styles.taskSuccessTitle}>🎯 Criterios de éxito:</Text>
                {task.successCriteria.map((criteria: string, index: number) => (
                  <Text key={index} style={styles.taskSuccessItem}>• {criteria}</Text>
                ))}
              </View>

              {task.resources && task.resources.length > 0 && (
                <View style={styles.taskResources}>
                  <Text style={styles.taskResourcesTitle}>📚 Recursos útiles:</Text>
                  {task.resources.map((resource: TaskResource, index: number) => (
                    <View key={index} style={styles.taskResourceItem}>
                      <Text style={styles.taskResourceType}>{getResourceEmoji(resource.type)}</Text>
                      <View style={styles.taskResourceContent}>
                        <Text style={styles.taskResourceName}>{resource.title}</Text>
                        <Text style={styles.taskResourceDescription}>{resource.description}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

// Helper functions
function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'facil': return '#10b981';
    case 'moderado': return '#f59e0b';
    case 'desafiante': return '#ef4444';
    default: return '#6b7280';
  }
}

function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'facil': return '😊 Fácil';
    case 'moderado': return '⚡ Moderado';
    case 'desafiante': return '🔥 Desafiante';
    default: return difficulty;
  }
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'critica': return '#ef4444';
    case 'alta': return '#f59e0b';
    case 'media': return '#3b82f6';
    case 'baja': return '#10b981';
    default: return '#6b7280';
  }
}

function getResourceEmoji(type: string): string {
  switch (type) {
    case 'template': return '📋';
    case 'example': return '💡';
    case 'guide': return '📚';
    case 'tool': return '🔧';
    default: return '📄';
  }
}

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
    backgroundColor: '#000000',
  },
  header: {
    backgroundColor: '#000000',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
  },
  content: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#000000',
    padding: 20,
    borderTopWidth: 4,
    borderTopColor: '#FFD700',
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
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFD700',
    margin: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFD700',
    margin: 16,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  errorText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    fontWeight: '700',
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFD700',
    margin: 16,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 14,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '700',
  },
  gradeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  gradeCircle: {
    width: 80,
    height: 80,
    borderRadius: 0,
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
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
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  gradeDescription: {
    fontSize: 14,
    color: '#FFD700',
    lineHeight: 20,
    fontWeight: '700',
  },
  modeNavigation: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 4,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 0,
  },
  activeModeTab: {
    backgroundColor: '#FFD700',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modeIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  modeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  activeModeTitle: {
    color: '#000000',
    fontWeight: '900',
  },
  overviewSection: {
    padding: 20,
    backgroundColor: '#000000',
  },
  progressCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 16,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressSection: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  progressText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    fontWeight: '700',
  },
  nextMilestone: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '900',
    lineHeight: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    marginBottom: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  healthChecksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  healthCheckCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 16,
    width: '48%',
    borderWidth: 3,
    borderColor: '#FFD700',
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
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statusIcon: {
    fontSize: 16,
  },
  healthCheckCategory: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  healthCheckHeadline: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 18,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  learningTip: {
    fontSize: 11,
    color: '#FFD700',
    fontStyle: 'italic',
    lineHeight: 14,
    fontWeight: '700',
  },
  quickWinsSection: {
    marginTop: 8,
  },
  quickWinCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 12,
    marginBottom: 8,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  quickWinHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickWinTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  quickWinTime: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
  },
  quickWinWhy: {
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 4,
    lineHeight: 16,
    fontWeight: '700',
  },
  quickWinHow: {
    fontSize: 12,
    color: '#FFD700',
    lineHeight: 16,
    fontWeight: '700',
  },
  detailedSection: {
    padding: 20,
    backgroundColor: '#000000',
  },
  detailedCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 16,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFD700',
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
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailedHeadline: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailedScore: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailedExplanation: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '700',
  },
  insightsContainer: {
    gap: 8,
  },
  insightCard: {
    backgroundColor: '#111111',
    borderRadius: 0,
    padding: 12,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  insightExplanation: {
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 16,
    marginBottom: 8,
    fontWeight: '700',
  },
  insightCTA: {
    fontSize: 11,
    color: '#FFD700',
    fontWeight: '700',
  },
  learnSection: {
    padding: 20,
    backgroundColor: '#000000',
  },
  learningCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 16,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  learningCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
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
    color: '#FFFFFF',
    lineHeight: 20,
    fontWeight: '700',
  },
  actionPlanSection: {
    padding: 20,
    backgroundColor: '#000000',
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
    backgroundColor: '#FFD700',
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  secondaryButton: {
    backgroundColor: '#000000',
    borderRadius: 0,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  secondaryButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#000000',
    borderRadius: 0,
    maxHeight: '80%',
    width: '100%',
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 4,
    borderBottomColor: '#FFD700',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 0,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '900',
  },
  modalBody: {
    padding: 20,
  },
  modalExplanation: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '700',
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  modalText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '700',
  },
  exampleBox: {
    backgroundColor: '#111111',
    borderRadius: 0,
    padding: 12,
    borderWidth: 3,
    borderColor: '#FFD700',
    marginBottom: 16,
  },
  exampleText: {
    fontSize: 14,
    color: '#FFD700',
    lineHeight: 20,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  currentBox: {
    backgroundColor: '#111111',
    borderRadius: 0,
    padding: 12,
    borderWidth: 3,
    borderColor: '#FFD700',
    marginBottom: 16,
  },
  currentText: {
    fontSize: 14,
    color: '#FFD700',
    lineHeight: 20,
    fontWeight: '700',
  },
  quickWinBox: {
    backgroundColor: '#111111',
    borderRadius: 0,
    padding: 12,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  quickWinAction: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
    marginBottom: 4,
  },
  quickWinMeta: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
  },

  // Nuevos estilos para el plan de acción mejorado
  planSummaryCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 16,
    marginBottom: 20,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  planSummaryTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  planSummaryText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 16,
    fontWeight: '700',
  },
  planMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  planMetric: {
    flex: 1,
    alignItems: 'center',
  },
  planMetricLabel: {
    fontSize: 12,
    color: '#FFD700',
    marginBottom: 4,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  planMetricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Estilos para las fases
  phaseCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  phaseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  phaseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  phaseNumberText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '900',
  },
  phaseHeaderInfo: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  phaseSubtitle: {
    fontSize: 14,
    color: '#FFD700',
    lineHeight: 18,
    fontWeight: '700',
  },
  phaseHeaderRight: {
    alignItems: 'flex-end',
  },
  phaseTime: {
    fontSize: 12,
    color: '#FFD700',
    marginBottom: 4,
    fontWeight: '700',
  },
  phaseExpand: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
  },
  phaseContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  phaseMetrics: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  phaseMetric: {
    flex: 1,
    backgroundColor: '#111111',
    borderRadius: 0,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  phaseMetricLabel: {
    fontSize: 12,
    color: '#FFD700',
    marginBottom: 4,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  phaseMetricValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  phasePrerequisites: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  phasePrerequisitesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  phasePrerequisiteItem: {
    fontSize: 12,
    color: '#78350f',
    marginBottom: 4,
  },
  phaseTips: {
    backgroundColor: '#ecfdf5',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  phaseTipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 8,
  },
  phaseTipItem: {
    fontSize: 12,
    color: '#047857',
    marginBottom: 4,
  },

  // Estilos para las tareas
  taskCard: {
    backgroundColor: '#111111',
    borderRadius: 0,
    padding: 12,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  selectedTaskCard: {
    backgroundColor: '#000000',
    borderColor: '#FFD700',
  },
  taskHeader: {
    marginBottom: 8,
  },
  taskSelection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: '#000000',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkedTaskBox: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  taskCheckmark: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '900',
  },
  taskNumber: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 8,
    letterSpacing: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
    marginBottom: 8,
    fontWeight: '700',
  },
  taskExample: {
    backgroundColor: '#111111',
    borderRadius: 0,
    padding: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  taskExampleTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskExampleText: {
    fontSize: 11,
    color: '#FFD700',
    lineHeight: 16,
    fontStyle: 'italic',
    fontWeight: '700',
  },
  taskDetails: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 3,
    borderTopColor: '#FFD700',
  },
  taskDetailsToggle: {
    paddingVertical: 4,
  },
  taskDetailsToggleText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '700',
  },
  taskDetailsContent: {
    marginTop: 8,
  },
  taskChecklist: {
    marginBottom: 12,
  },
  taskChecklistTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskChecklistItem: {
    fontSize: 11,
    color: '#FFFFFF',
    marginBottom: 3,
    fontWeight: '700',
  },
  taskSuccess: {
    marginBottom: 12,
  },
  taskSuccessTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskSuccessItem: {
    fontSize: 11,
    color: '#FFFFFF',
    marginBottom: 3,
    fontWeight: '700',
  },
  taskResources: {
    marginBottom: 12,
  },
  taskResourcesTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskResourceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskResourceType: {
    fontSize: 14,
    marginRight: 8,
  },
  taskResourceContent: {
    flex: 1,
  },
  taskResourceName: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  taskResourceDescription: {
    fontSize: 10,
    color: '#FFD700',
    fontWeight: '700',
  },
});

export default EducationalBriefAnalysis;