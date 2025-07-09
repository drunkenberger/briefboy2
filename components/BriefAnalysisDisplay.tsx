import React, { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BriefAnalysisResult, getScoreColor, getScoreEmoji, getStatusText } from '../hooks/useBriefAnalysis';
import BriefAnalysisDebug from './BriefAnalysisDebug';

interface BriefAnalysisDisplayProps {
  analysis: BriefAnalysisResult | null;
  loading: boolean;
  error: string | null;
  onStartImprovement: () => void;
  onReAnalyze: () => void;
  brief?: any; // Agregar brief para debug
}

/**
 * Componente para mostrar el análisis detallado de un brief
 */
const BriefAnalysisDisplay: React.FC<BriefAnalysisDisplayProps> = ({
  analysis,
  loading,
  error,
  onStartImprovement,
  onReAnalyze,
  brief,
}) => {
  const [showDebug, setShowDebug] = useState(false);
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Analizando brief...</Text>
        <Text style={styles.loadingSubtext}>Evaluando calidad y completitud</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Error en el análisis</Text>
        <Text style={styles.errorDetail}>{error}</Text>
        
        <View style={styles.errorActions}>
          <Pressable style={styles.retryButton} onPress={onReAnalyze}>
            <Text style={styles.retryButtonText}>🔄 Reintentar</Text>
          </Pressable>
          
          <Pressable 
            style={styles.debugButton} 
            onPress={() => setShowDebug(!showDebug)}
          >
            <Text style={styles.debugButtonText}>
              {showDebug ? '❌ Ocultar Debug' : '🔧 Debug'}
            </Text>
          </Pressable>
        </View>
        
        {showDebug && (
          <BriefAnalysisDebug
            brief={brief}
            analysis={analysis}
            loading={loading}
            error={error}
            onTestAnalysis={onReAnalyze}
          />
        )}
      </View>
    );
  }

  if (!analysis) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No hay análisis disponible</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header con score general */}
      <View style={styles.headerCard}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreEmoji}>{getScoreEmoji(analysis.overallScore)}</Text>
          <Text style={styles.overallScore}>{analysis.overallScore}</Text>
          <Text style={styles.scoreLabel}>/ 100</Text>
        </View>
        <Text style={styles.scoreTitle}>Score General</Text>
        <Text style={[styles.readinessText, {
          color: analysis.isReadyForProduction ? '#10b981' : '#ef4444'
        }]}>
          {analysis.isReadyForProduction ? '✅ Listo para producción' : '⚠️ Requiere mejoras'}
        </Text>
        <Text style={styles.timeEstimate}>
          Tiempo estimado de mejora: {analysis.estimatedImprovementTime}
        </Text>
      </View>

      {/* Scores detallados */}
      <View style={styles.scoresGrid}>
        <ScoreCard
          title="Completitud"
          score={analysis.completenessScore}
          icon="📋"
        />
        <ScoreCard
          title="Calidad"
          score={analysis.qualityScore}
          icon="⭐"
        />
        <ScoreCard
          title="Profesionalismo"
          score={analysis.professionalismScore}
          icon="💼"
        />
        <ScoreCard
          title="Listos para Uso"
          score={analysis.readinessScore}
          icon="🚀"
        />
      </View>

      {/* Fortalezas */}
      <Section title="Fortalezas" icon="💪" color="#10b981">
        {analysis.strengths.map((strength, index) => (
          <BulletPoint key={index} text={strength} color="#10b981" />
        ))}
      </Section>

      {/* Issues críticos */}
      {analysis.criticalIssues.length > 0 && (
        <Section title="Issues Críticos" icon="🚨" color="#ef4444">
          {analysis.criticalIssues.map((issue, index) => (
            <BulletPoint key={index} text={issue} color="#ef4444" />
          ))}
        </Section>
      )}

      {/* Debilidades */}
      {analysis.weaknesses.length > 0 && (
        <Section title="Áreas de Mejora" icon="⚠️" color="#f59e0b">
          {analysis.weaknesses.map((weakness, index) => (
            <BulletPoint key={index} text={weakness} color="#f59e0b" />
          ))}
        </Section>
      )}

      {/* Recomendaciones */}
      <Section title="Recomendaciones" icon="💡" color="#3b82f6">
        {analysis.recommendations.map((recommendation, index) => (
          <BulletPoint key={index} text={recommendation} color="#3b82f6" />
        ))}
      </Section>

      {/* Análisis por sección */}
      <Section title="Análisis por Sección" icon="📊" color="#6366f1">
        {Object.entries(analysis.sectionAnalysis).map(([sectionKey, sectionData]) => (
          <View key={sectionKey} style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionName}>{getSectionDisplayName(sectionKey)}</Text>
              <View style={styles.sectionScoreContainer}>
                <Text style={[styles.sectionScore, { color: getScoreColor(sectionData.score) }]}>
                  {sectionData.score}
                </Text>
                <Text style={[styles.sectionStatus, { color: getScoreColor(sectionData.score) }]}>
                  {getStatusText(sectionData.status)}
                </Text>
              </View>
            </View>
            
            {sectionData.issues.length > 0 && (
              <View style={styles.sectionIssues}>
                <Text style={styles.sectionIssuesTitle}>Issues:</Text>
                {sectionData.issues.map((issue, index) => (
                  <Text key={index} style={styles.sectionIssueText}>• {issue}</Text>
                ))}
              </View>
            )}
            
            {sectionData.suggestions.length > 0 && (
              <View style={styles.sectionSuggestions}>
                <Text style={styles.sectionSuggestionsTitle}>Sugerencias:</Text>
                {sectionData.suggestions.map((suggestion, index) => (
                  <Text key={index} style={styles.sectionSuggestionText}>• {suggestion}</Text>
                ))}
              </View>
            )}
          </View>
        ))}
      </Section>

      {/* Botones de acción */}
      <View style={styles.actionButtons}>
        <Pressable
          style={[styles.actionButton, styles.primaryButton]}
          onPress={onStartImprovement}
        >
          <Text style={styles.primaryButtonText}>🚀 Iniciar Mejoras</Text>
        </Pressable>
        
        <Pressable
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={onReAnalyze}
        >
          <Text style={styles.secondaryButtonText}>🔄 Re-analizar</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const ScoreCard: React.FC<{ title: string; score: number; icon: string }> = ({ title, score, icon }) => (
  <View style={styles.scoreCard}>
    <Text style={styles.scoreCardIcon}>{icon}</Text>
    <Text style={[styles.scoreCardValue, { color: getScoreColor(score) }]}>{score}</Text>
    <Text style={styles.scoreCardTitle}>{title}</Text>
  </View>
);

const Section: React.FC<{ title: string; icon: string; color: string; children: React.ReactNode }> = ({
  title,
  icon,
  color,
  children,
}) => (
  <View style={styles.section}>
    <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const BulletPoint: React.FC<{ text: string; color: string }> = ({ text, color }) => (
  <View style={styles.bulletPoint}>
    <View style={[styles.bullet, { backgroundColor: color }]} />
    <Text style={styles.bulletText}>{text}</Text>
  </View>
);

const getSectionDisplayName = (sectionKey: string): string => {
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorDetail: {
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
  emptyText: {
    fontSize: 16,
    color: '#64748b',
  },
  headerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  scoreEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  overallScore: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1e293b',
  },
  scoreLabel: {
    fontSize: 24,
    color: '#64748b',
    marginLeft: 4,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  readinessText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  timeEstimate: {
    fontSize: 14,
    color: '#64748b',
    fontStyle: 'italic',
  },
  scoresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  scoreCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  scoreCardValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  scoreCardTitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    borderLeftWidth: 4,
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  sectionContent: {
    padding: 16,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  sectionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionScoreContainer: {
    alignItems: 'flex-end',
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  sectionScore: {
    fontSize: 20,
    fontWeight: '700',
  },
  sectionStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionIssues: {
    marginTop: 8,
  },
  sectionIssuesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 4,
  },
  sectionIssueText: {
    fontSize: 13,
    color: '#dc2626',
    marginBottom: 2,
  },
  sectionSuggestions: {
    marginTop: 8,
  },
  sectionSuggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 4,
  },
  sectionSuggestionText: {
    fontSize: 13,
    color: '#2563eb',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  debugButton: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugButtonText: {
    color: '#92400e',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BriefAnalysisDisplay;