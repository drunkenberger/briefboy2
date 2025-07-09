import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ProfessionalBriefDisplayProps {
  brief: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * Componente profesional para mostrar briefs de marketing con diseño limpio y estructurado
 */
const ProfessionalBriefDisplay: React.FC<ProfessionalBriefDisplayProps> = ({ brief, loading, error }) => {
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Generando brief profesional...</Text>
        <Text style={styles.loadingSubtext}>Analizando con GPT-4o</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorText}>Error al generar el brief</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  if (!brief) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📄</Text>
        <Text style={styles.emptyText}>No hay brief disponible</Text>
        <Text style={styles.emptySubtext}>Graba un audio para generar tu brief</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.projectTitle}>{brief.projectTitle || 'Marketing Brief'}</Text>
        <Text style={styles.briefSummary}>{brief.briefSummary}</Text>
      </View>

      <Section title="Desafío de Negocio" icon="🎯">
        <Text style={styles.text}>{brief.businessChallenge}</Text>
      </Section>

      <Section title="Objetivos Estratégicos" icon="🚀">
        <BulletList items={brief.strategicObjectives} />
      </Section>

      <Section title="Audiencia Objetivo" icon="👥">
        <SubSection title="Audiencia Primaria">
          <Text style={styles.text}>{brief.targetAudience?.primary}</Text>
        </SubSection>
        {brief.targetAudience?.secondary && (
          <SubSection title="Audiencia Secundaria">
            <Text style={styles.text}>{brief.targetAudience.secondary}</Text>
          </SubSection>
        )}
        <SubSection title="Insights Clave">
          <BulletList items={brief.targetAudience?.insights} />
        </SubSection>
      </Section>

      <Section title="Posicionamiento de Marca" icon="🏆">
        <Text style={styles.text}>{brief.brandPositioning}</Text>
      </Section>

      <Section title="Estrategia Creativa" icon="💡">
        <SubSection title="Gran Idea">
          <Text style={styles.highlightText}>{brief.creativeStrategy?.bigIdea}</Text>
        </SubSection>
        <SubSection title="Jerarquía de Mensajes">
          <BulletList items={brief.creativeStrategy?.messageHierarchy} />
        </SubSection>
        <SubSection title="Tono y Manera">
          <Text style={styles.text}>{brief.creativeStrategy?.toneAndManner}</Text>
        </SubSection>
        <SubSection title="Elementos Obligatorios">
          <BulletList items={brief.creativeStrategy?.creativeMandatories} />
        </SubSection>
      </Section>

      <Section title="Estrategia de Canales" icon="📊">
        <SubSection title="Mix Recomendado">
          {brief.channelStrategy?.recommendedMix?.map((channel: any, index: number) => (
            <View key={index} style={styles.channelCard}>
              <Text style={styles.channelName}>{channel.channel}</Text>
              <Text style={styles.channelAllocation}>{channel.allocation}</Text>
              <Text style={styles.channelRationale}>{channel.rationale}</Text>
              <Text style={styles.channelKpis}>KPIs: {channel.kpis?.join(', ')}</Text>
            </View>
          ))}
        </SubSection>
        <SubSection title="Enfoque Integrado">
          <Text style={styles.text}>{brief.channelStrategy?.integratedApproach}</Text>
        </SubSection>
      </Section>

      <Section title="Métricas de Éxito" icon="📈">
        <SubSection title="KPIs Primarios">
          <BulletList items={brief.successMetrics?.primary} />
        </SubSection>
        <SubSection title="KPIs Secundarios">
          <BulletList items={brief.successMetrics?.secondary} />
        </SubSection>
        <SubSection title="Framework de Medición">
          <Text style={styles.text}>{brief.successMetrics?.measurementFramework}</Text>
        </SubSection>
      </Section>

      <Section title="Consideraciones Presupuestarias" icon="💰">
        <SubSection title="Rango Estimado">
          <Text style={styles.text}>{brief.budgetConsiderations?.estimatedRange}</Text>
        </SubSection>
        <SubSection title="Inversiones Clave">
          <BulletList items={brief.budgetConsiderations?.keyInvestments} />
        </SubSection>
        <SubSection title="Optimización de Costos">
          <BulletList items={brief.budgetConsiderations?.costOptimization} />
        </SubSection>
      </Section>

      <Section title="Análisis de Riesgos" icon="⚠️">
        {brief.riskAssessment?.risks?.map((risk: any, index: number) => (
          <View key={index} style={styles.riskCard}>
            <Text style={styles.riskTitle}>{risk.risk}</Text>
            <View style={styles.riskMeta}>
              <Text style={styles.riskTag}>Probabilidad: {risk.likelihood}</Text>
              <Text style={styles.riskTag}>Impacto: {risk.impact}</Text>
            </View>
            <Text style={styles.riskMitigation}>Mitigación: {risk.mitigation}</Text>
          </View>
        ))}
      </Section>

      <Section title="Próximos Pasos" icon="✅">
        <BulletList items={brief.nextSteps} />
      </Section>

      <Section title="Hoja de Ruta" icon="🗓️">
        {brief.implementationRoadmap?.phases?.map((phase: any, index: number) => (
          <View key={index} style={styles.phaseCard}>
            <Text style={styles.phaseTitle}>{phase.phase}</Text>
            <Text style={styles.phaseDuration}>{phase.duration}</Text>
            <Text style={styles.phaseDeliverables}>
              Entregables: {phase.deliverables?.join(', ')}
            </Text>
            <Text style={styles.phaseDependencies}>
              Dependencias: {phase.dependencies?.join(', ')}
            </Text>
          </View>
        ))}
      </Section>

      {brief.appendix && (
        <Section title="Anexos" icon="📋">
          <SubSection title="Supuestos">
            <BulletList items={brief.appendix.assumptions} />
          </SubSection>
          <SubSection title="Referencias">
            <BulletList items={brief.appendix.references} />
          </SubSection>
        </Section>
      )}
    </ScrollView>
  );
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ title, icon, children }) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    <View style={styles.sectionContent}>
      {children}
    </View>
  </View>
);

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.subSection}>
    <Text style={styles.subSectionTitle}>{title}</Text>
    {children}
  </View>
);

const BulletList: React.FC<{ items?: string[] }> = ({ items }) => {
  if (!items || items.length === 0) return null;
  
  return (
    <View style={styles.bulletList}>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletItem}>
          <Text style={styles.bullet}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 32,
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
    backgroundColor: '#f8fafc',
    padding: 32,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  header: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 8,
  },
  briefSummary: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
  subSection: {
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  text: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
  },
  highlightText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2563eb',
    backgroundColor: '#dbeafe',
    padding: 12,
    borderRadius: 8,
    lineHeight: 22,
  },
  bulletList: {
    marginLeft: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bullet: {
    fontSize: 16,
    color: '#2563eb',
    marginRight: 8,
    marginTop: 2,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    color: '#475569',
    lineHeight: 20,
  },
  channelCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2563eb',
  },
  channelName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  channelAllocation: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
    marginBottom: 4,
  },
  channelRationale: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 4,
  },
  channelKpis: {
    fontSize: 13,
    color: '#64748b',
    fontStyle: 'italic',
  },
  riskCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  riskMeta: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  riskTag: {
    fontSize: 12,
    fontWeight: '500',
    color: '#b45309',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  riskMitigation: {
    fontSize: 14,
    color: '#78350f',
  },
  phaseCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 4,
  },
  phaseDuration: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0369a1',
    marginBottom: 6,
  },
  phaseDeliverables: {
    fontSize: 14,
    color: '#075985',
    marginBottom: 4,
  },
  phaseDependencies: {
    fontSize: 14,
    color: '#075985',
  },
});

export default ProfessionalBriefDisplay;