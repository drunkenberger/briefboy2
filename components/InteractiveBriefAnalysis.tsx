import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BriefAnalysisResult } from '../hooks/useBriefAnalysis';

interface InteractiveBriefAnalysisProps {
  analysis: BriefAnalysisResult | null;
  loading: boolean;
  error: string | null;
  onStartImprovement: (selectedAreas: string[]) => void;
  onReAnalyze: () => void;
  brief?: any;
}

interface BriefHealthMetric {
  id: string;
  title: string;
  icon: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  quickFix?: string;
}

interface ImprovementArea {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  impact: number; // 1-10 score improvement expected
  effort: 'quick' | 'medium' | 'complex';
  description: string;
  actionItems: string[];
  selected: boolean;
}

const InteractiveBriefAnalysis: React.FC<InteractiveBriefAnalysisProps> = ({
  analysis,
  loading,
  error,
  onStartImprovement,
  onReAnalyze,
  brief,
}) => {
  const [activeTab, setActiveTab] = useState<'health' | 'checklist' | 'roadmap'>('health');
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>🔍 Analizando tu brief...</Text>
        <Text style={styles.loadingSubtext}>Evaluando fortalezas y oportunidades</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Oops, algo salió mal</Text>
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
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>¡Listo para analizar!</Text>
        <Text style={styles.emptyText}>Toca "Analizar Brief" para comenzar</Text>
      </View>
    );
  }

  // Transform analysis data into health metrics
  const healthMetrics: BriefHealthMetric[] = [
    {
      id: 'completeness',
      title: 'Completitud',
      icon: '📋',
      score: analysis.completenessScore,
      status: getHealthStatus(analysis.completenessScore),
      description: 'Qué tan completa está la información',
      quickFix: analysis.completenessScore < 70 ? 'Agregar campos faltantes' : undefined
    },
    {
      id: 'clarity',
      title: 'Claridad',
      icon: '💡',
      score: analysis.qualityScore,
      status: getHealthStatus(analysis.qualityScore),
      description: 'Qué tan clara y específica es la información',
      quickFix: analysis.qualityScore < 70 ? 'Ser más específico en objetivos' : undefined
    },
    {
      id: 'strategy',
      title: 'Estrategia',
      icon: '🎯',
      score: analysis.professionalismScore,
      status: getHealthStatus(analysis.professionalismScore),
      description: 'Solidez de la estrategia planteada',
      quickFix: analysis.professionalismScore < 70 ? 'Definir mejor la audiencia' : undefined
    },
    {
      id: 'execution',
      title: 'Ejecutabilidad',
      icon: '🚀',
      score: analysis.readinessScore,
      status: getHealthStatus(analysis.readinessScore),
      description: 'Qué tan listo está para implementar',
      quickFix: analysis.readinessScore < 70 ? 'Definir pasos específicos' : undefined
    }
  ];

  // Transform analysis into improvement areas
  const improvementAreas: ImprovementArea[] = generateImprovementAreas(analysis);

  return (
    <View style={styles.container}>
      {/* Header con score general y tabs */}
      <View style={styles.header}>
        <BriefHealthScore score={analysis.overallScore} />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'health' && (
          <HealthDashboard 
            metrics={healthMetrics}
            isReadyForProduction={analysis.isReadyForProduction}
            estimatedTime={analysis.estimatedImprovementTime}
          />
        )}

        {activeTab === 'checklist' && (
          <ImprovementChecklist
            areas={improvementAreas}
            selectedAreas={selectedAreas}
            onToggleArea={(areaId) => {
              setSelectedAreas(prev => 
                prev.includes(areaId) 
                  ? prev.filter(id => id !== areaId)
                  : [...prev, areaId]
              );
            }}
          />
        )}

        {activeTab === 'roadmap' && (
          <ImprovementRoadmap
            areas={improvementAreas.filter(area => selectedAreas.includes(area.id))}
            currentScore={analysis.overallScore}
          />
        )}
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.footer}>
        {selectedAreas.length > 0 ? (
          <Pressable 
            style={styles.primaryButton}
            onPress={() => onStartImprovement(selectedAreas)}
          >
            <Text style={styles.primaryButtonText}>
              ✨ Mejorar {selectedAreas.length} área{selectedAreas.length > 1 ? 's' : ''}
            </Text>
          </Pressable>
        ) : (
          <Pressable 
            style={styles.secondaryButton}
            onPress={onReAnalyze}
          >
            <Text style={styles.secondaryButtonText}>🔄 Re-analizar</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

// Helper Components
const BriefHealthScore: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🏆';
    if (score >= 80) return '🌟';
    if (score >= 70) return '👍';
    if (score >= 60) return '⚠️';
    return '🚨';
  };

  const getHealthMessage = (score: number) => {
    if (score >= 90) return 'Excelente brief';
    if (score >= 80) return 'Muy buen brief';
    if (score >= 70) return 'Buen brief';
    if (score >= 60) return 'Brief mejorable';
    return 'Brief necesita trabajo';
  };

  return (
    <View style={styles.healthScore}>
      <Text style={styles.scoreEmoji}>{getScoreEmoji(score)}</Text>
      <View style={styles.scoreInfo}>
        <Text style={[styles.scoreValue, { color: getScoreColor(score) }]}>{score}/100</Text>
        <Text style={styles.scoreMessage}>{getHealthMessage(score)}</Text>
      </View>
    </View>
  );
};

const TabNavigation: React.FC<{
  activeTab: string;
  onTabChange: (tab: 'health' | 'checklist' | 'roadmap') => void;
}> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'health', title: 'Diagnóstico', icon: '🏥' },
    { id: 'checklist', title: 'Checklist', icon: '✅' },
    { id: 'roadmap', title: 'Plan', icon: '🗺️' }
  ];

  return (
    <View style={styles.tabNavigation}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab
          ]}
          onPress={() => onTabChange(tab.id as any)}
        >
          <Text style={styles.tabIcon}>{tab.icon}</Text>
          <Text style={[
            styles.tabTitle,
            activeTab === tab.id && styles.activeTabTitle
          ]}>
            {tab.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const HealthDashboard: React.FC<{
  metrics: BriefHealthMetric[];
  isReadyForProduction: boolean;
  estimatedTime: string;
}> = ({ metrics, isReadyForProduction, estimatedTime }) => {
  return (
    <View style={styles.healthDashboard}>
      {/* Overall Status */}
      <View style={styles.overallStatus}>
        <Text style={styles.statusIcon}>
          {isReadyForProduction ? '✅' : '⚠️'}
        </Text>
        <View style={styles.statusInfo}>
          <Text style={styles.statusTitle}>
            {isReadyForProduction ? 'Listo para producción' : 'Necesita mejoras'}
          </Text>
          <Text style={styles.statusSubtitle}>
            Tiempo estimado: {estimatedTime}
          </Text>
        </View>
      </View>

      {/* Health Metrics Grid */}
      <View style={styles.metricsGrid}>
        {metrics.map((metric) => (
          <HealthMetricCard key={metric.id} metric={metric} />
        ))}
      </View>
    </View>
  );
};

const HealthMetricCard: React.FC<{ metric: BriefHealthMetric }> = ({ metric }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return '#10b981';
      case 'good': return '#3b82f6';
      case 'warning': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={styles.metricCard}>
      <View style={styles.metricHeader}>
        <Text style={styles.metricIcon}>{metric.icon}</Text>
        <Text style={[styles.metricScore, { color: getStatusColor(metric.status) }]}>
          {metric.score}
        </Text>
      </View>
      <Text style={styles.metricTitle}>{metric.title}</Text>
      <Text style={styles.metricDescription}>{metric.description}</Text>
      {metric.quickFix && (
        <View style={styles.quickFix}>
          <Text style={styles.quickFixText}>💡 {metric.quickFix}</Text>
        </View>
      )}
    </View>
  );
};

const ImprovementChecklist: React.FC<{
  areas: ImprovementArea[];
  selectedAreas: string[];
  onToggleArea: (areaId: string) => void;
}> = ({ areas, selectedAreas, onToggleArea }) => {
  return (
    <View style={styles.checklist}>
      <Text style={styles.checklistTitle}>🎯 Áreas de mejora identificadas</Text>
      <Text style={styles.checklistSubtitle}>
        Selecciona las áreas que quieres trabajar
      </Text>
      
      {areas.map((area) => (
        <ImprovementAreaCard
          key={area.id}
          area={area}
          isSelected={selectedAreas.includes(area.id)}
          onToggle={() => onToggleArea(area.id)}
        />
      ))}
    </View>
  );
};

const ImprovementAreaCard: React.FC<{
  area: ImprovementArea;
  isSelected: boolean;
  onToggle: () => void;
}> = ({ area, isSelected, onToggle }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getEffortText = (effort: string) => {
    switch (effort) {
      case 'quick': return '⚡ Rápido (5-10 min)';
      case 'medium': return '⏱️ Moderado (20-30 min)';
      case 'complex': return '🧩 Complejo (1+ hora)';
      default: return effort;
    }
  };

  return (
    <Pressable
      style={[
        styles.areaCard,
        isSelected && styles.selectedAreaCard
      ]}
      onPress={onToggle}
    >
      <View style={styles.areaHeader}>
        <View style={styles.areaSelection}>
          <View style={[
            styles.checkbox,
            isSelected && styles.checkedBox
          ]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.areaTitle}>{area.title}</Text>
        </View>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(area.priority) }]}>
          <Text style={styles.priorityText}>
            {area.priority === 'high' ? 'ALTA' : area.priority === 'medium' ? 'MEDIA' : 'BAJA'}
          </Text>
        </View>
      </View>

      <Text style={styles.areaDescription}>{area.description}</Text>

      <View style={styles.areaMetrics}>
        <View style={styles.metricBadge}>
          <Text style={styles.metricLabel}>Impacto</Text>
          <Text style={styles.metricValue}>+{area.impact} pts</Text>
        </View>
        <View style={styles.metricBadge}>
          <Text style={styles.metricLabel}>Esfuerzo</Text>
          <Text style={styles.metricValue}>{getEffortText(area.effort)}</Text>
        </View>
      </View>

      {isSelected && (
        <View style={styles.actionItems}>
          <Text style={styles.actionItemsTitle}>📝 Pasos a seguir:</Text>
          {area.actionItems.map((item, index) => (
            <Text key={index} style={styles.actionItem}>• {item}</Text>
          ))}
        </View>
      )}
    </Pressable>
  );
};

const ImprovementRoadmap: React.FC<{
  areas: ImprovementArea[];
  currentScore: number;
}> = ({ areas, currentScore }) => {
  const potentialScore = currentScore + areas.reduce((sum, area) => sum + area.impact, 0);
  
  return (
    <View style={styles.roadmap}>
      <View style={styles.roadmapHeader}>
        <Text style={styles.roadmapTitle}>🗺️ Tu plan de mejoras</Text>
        <View style={styles.scoreProjection}>
          <Text style={styles.projectionLabel}>Mejora proyectada:</Text>
          <Text style={styles.projectionScore}>
            {currentScore} → {Math.min(potentialScore, 100)} pts
          </Text>
        </View>
      </View>

      {areas.length === 0 ? (
        <View style={styles.emptyRoadmap}>
          <Text style={styles.emptyRoadmapText}>
            👈 Selecciona áreas de mejora para ver tu plan
          </Text>
        </View>
      ) : (
        <View style={styles.roadmapSteps}>
          {areas
            .sort((a, b) => {
              // Sort by priority first, then by effort (quick first)
              const priorityOrder = { high: 3, medium: 2, low: 1 };
              const effortOrder = { quick: 3, medium: 2, complex: 1 };
              
              if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              }
              return effortOrder[b.effort] - effortOrder[a.effort];
            })
            .map((area, index) => (
              <RoadmapStep
                key={area.id}
                area={area}
                stepNumber={index + 1}
                isLast={index === areas.length - 1}
              />
            ))}
        </View>
      )}
    </View>
  );
};

const RoadmapStep: React.FC<{
  area: ImprovementArea;
  stepNumber: number;
  isLast: boolean;
}> = ({ area, stepNumber, isLast }) => {
  return (
    <View style={styles.roadmapStep}>
      <View style={styles.stepIndicator}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{stepNumber}</Text>
        </View>
        {!isLast && <View style={styles.stepConnector} />}
      </View>
      
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{area.title}</Text>
        <Text style={styles.stepDescription}>{area.description}</Text>
        <Text style={styles.stepImpact}>Mejora esperada: +{area.impact} puntos</Text>
      </View>
    </View>
  );
};

// Helper functions
function getHealthStatus(score: number): 'excellent' | 'good' | 'warning' | 'critical' {
  if (score >= 90) return 'excellent';
  if (score >= 75) return 'good';
  if (score >= 60) return 'warning';
  return 'critical';
}

function generateImprovementAreas(analysis: BriefAnalysisResult): ImprovementArea[] {
  const areas: ImprovementArea[] = [];
  
  // Generate areas based on section analysis
  Object.entries(analysis.sectionAnalysis).forEach(([sectionKey, sectionData]) => {
    if (sectionData.score < 75 && sectionData.suggestions.length > 0) {
      areas.push({
        id: sectionKey,
        title: getSectionDisplayName(sectionKey),
        priority: sectionData.score < 50 ? 'high' : sectionData.score < 70 ? 'medium' : 'low',
        impact: Math.round((75 - sectionData.score) / 10) + 2,
        effort: sectionData.issues.length > 2 ? 'complex' : sectionData.issues.length > 1 ? 'medium' : 'quick',
        description: sectionData.suggestions[0] || `Mejorar la sección de ${getSectionDisplayName(sectionKey)}`,
        actionItems: sectionData.suggestions.slice(0, 3),
        selected: false
      });
    }
  });

  // Add general improvement areas based on weaknesses
  analysis.weaknesses.forEach((weakness, index) => {
    if (index < 3) { // Limit to top 3 weaknesses
      areas.push({
        id: `weakness_${index}`,
        title: `Área general ${index + 1}`,
        priority: 'medium',
        impact: 5,
        effort: 'medium',
        description: weakness,
        actionItems: [weakness],
        selected: false
      });
    }
  });

  return areas.slice(0, 8); // Limit to max 8 areas
}

function getSectionDisplayName(sectionKey: string): string {
  const names: { [key: string]: string } = {
    projectTitle: 'Título del Proyecto',
    briefSummary: 'Resumen Ejecutivo',
    businessChallenge: 'Desafío de Negocio',
    strategicObjectives: 'Objetivos Estratégicos',
    targetAudience: 'Audiencia Objetivo',
    brandPositioning: 'Posicionamiento de Marca',
    creativeStrategy: 'Estrategia Creativa',
    channelStrategy: 'Estrategia de Canales',
    implementationRoadmap: 'Hoja de Ruta',
    successMetrics: 'Métricas de Éxito',
    budgetConsiderations: 'Consideraciones de Presupuesto',
    riskAssessment: 'Evaluación de Riesgos',
    nextSteps: 'Próximos Pasos',
  };
  return names[sectionKey] || sectionKey;
}

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
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
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
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  healthScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  scoreMessage: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 2,
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  tabTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  activeTabTitle: {
    color: '#1e293b',
    fontWeight: '600',
  },
  healthDashboard: {
    padding: 20,
  },
  overallStatus: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  statusSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
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
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  metricIcon: {
    fontSize: 24,
  },
  metricScore: {
    fontSize: 20,
    fontWeight: '700',
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 8,
  },
  quickFix: {
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    padding: 8,
  },
  quickFixText: {
    fontSize: 11,
    color: '#92400e',
    fontWeight: '500',
  },
  checklist: {
    padding: 20,
  },
  checklistTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  checklistSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  areaCard: {
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
  selectedAreaCard: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  areaSelection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
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
  checkedBox: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  areaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  areaDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 12,
    lineHeight: 20,
  },
  areaMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  metricBadge: {
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
  },
  actionItems: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  actionItemsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  actionItem: {
    fontSize: 12,
    color: '#475569',
    marginBottom: 4,
    lineHeight: 16,
  },
  roadmap: {
    padding: 20,
  },
  roadmapHeader: {
    marginBottom: 20,
  },
  roadmapTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  scoreProjection: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectionLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  projectionScore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#10b981',
  },
  emptyRoadmap: {
    alignItems: 'center',
    padding: 40,
  },
  emptyRoadmapText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  roadmapSteps: {
    marginTop: 10,
  },
  roadmapStep: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  stepConnector: {
    width: 2,
    height: 40,
    backgroundColor: '#e2e8f0',
    marginTop: 8,
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
    lineHeight: 18,
  },
  stepImpact: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InteractiveBriefAnalysis;