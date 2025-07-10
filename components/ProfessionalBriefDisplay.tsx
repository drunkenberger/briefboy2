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

  // Helper functions to extract content from either AI format or normalized format
  const getTitle = () => brief.title || brief.projectTitle || 'Marketing Brief';
  const getSummary = () => brief.summary || brief.briefSummary || '';
  const getObjectives = () => brief.objectives || brief.strategicObjectives || [];
  const getTargetAudience = () => {
    console.log('👥 getTargetAudience: Analizando targetAudience:', {
      exists: !!brief.targetAudience,
      type: typeof brief.targetAudience,
      isArray: Array.isArray(brief.targetAudience),
      content: brief.targetAudience
    });
    
    // Si targetAudience es un array (formato legacy)
    if (Array.isArray(brief.targetAudience)) {
      console.log('👥 Formato array detectado, devolviendo tal cual');
      return brief.targetAudience;
    }
    
    // Si targetAudience es un objeto (nuevo formato con primary, secondary, insights)
    if (brief.targetAudience && typeof brief.targetAudience === 'object') {
      console.log('👥 Formato objeto detectado, convirtiendo a array de audiencias');
      const audiences = [];
      
      // Agregar audiencia primaria
      if (brief.targetAudience.primary) {
        audiences.push({
          segment: 'Audiencia Primaria',
          demographics: brief.targetAudience.primary,
          psychographics: brief.targetAudience.psychographics || '',
          needs: brief.targetAudience.insights ? brief.targetAudience.insights.join(', ') : '',
          mediaHabits: brief.targetAudience.mediaHabits || []
        });
      }
      
      // Agregar audiencia secundaria si existe
      if (brief.targetAudience.secondary) {
        audiences.push({
          segment: 'Audiencia Secundaria',
          demographics: brief.targetAudience.secondary,
          psychographics: '',
          needs: '',
          mediaHabits: []
        });
      }
      
      console.log('👥 Audiencias convertidas:', audiences);
      return audiences;
    }
    
    console.log('👥 No se encontró targetAudience válida, devolviendo array vacío');
    return [];
  };
  const getKeyMessages = () => brief.keyMessages || brief.creativeStrategy?.messageHierarchy || [];
  const getChannels = () => {
    // Handle array channels
    if (Array.isArray(brief.channels)) return brief.channels;
    
    // Handle object channelStrategy
    if (brief.channelStrategy) {
      if (Array.isArray(brief.channelStrategy.channels)) return brief.channelStrategy.channels;
      if (Array.isArray(brief.channelStrategy.recommendedMix)) return brief.channelStrategy.recommendedMix;
    }
    
    return [];
  };
  const getSuccessMetrics = () => {
    // Handle array success metrics
    if (Array.isArray(brief.success)) return brief.success;
    
    // Handle object successMetrics
    if (brief.successMetrics) {
      if (Array.isArray(brief.successMetrics)) return brief.successMetrics;
      if (typeof brief.successMetrics === 'object' && brief.successMetrics.primary) {
        // Combine primary and secondary metrics
        const metrics = [...(brief.successMetrics.primary || [])];
        if (brief.successMetrics.secondary) {
          metrics.push(...brief.successMetrics.secondary);
        }
        return metrics;
      }
      if (typeof brief.successMetrics === 'object' && brief.successMetrics.metrics) {
        return brief.successMetrics.metrics;
      }
    }
    
    return [];
  };
  const getBudget = () => {
    // Si es el formato antiguo (string simple)
    if (typeof brief.budget === 'string') return brief.budget;
    
    // Si es el nuevo formato (objeto budgetConsiderations)
    if (brief.budgetConsiderations) {
      return brief.budgetConsiderations;
    }
    
    return null;
  };
  const getTimeline = () => {
    // Handle string timeline
    if (typeof brief.timeline === 'string') return brief.timeline;
    
    // Handle object implementationRoadmap
    if (brief.implementationRoadmap) {
      if (typeof brief.implementationRoadmap === 'string') {
        return brief.implementationRoadmap;
      }
      // If it's an object with phases, return null to be handled separately
      if (typeof brief.implementationRoadmap === 'object' && brief.implementationRoadmap.phases) {
        return null;
      }
    }
    
    return '';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.projectTitle}>{getTitle()}</Text>
        {getSummary() && <Text style={styles.briefSummary}>{getSummary()}</Text>}
      </View>

      {getObjectives().length > 0 && (
        <Section title="Objetivos Estratégicos" icon="🚀">
          <BulletList items={getObjectives()} />
        </Section>
      )}

      {getTargetAudience().length > 0 && (
        <Section title="Audiencia Objetivo" icon="👥">
          {getTargetAudience().map((audience: any, index: number) => (
            <View key={index} style={styles.audienceCard}>
              <Text style={styles.audienceSegment}>{audience.segment || `Segmento ${index + 1}`}</Text>
              
              {audience.demographics && (
                <View style={styles.audienceField}>
                  <Text style={styles.audienceFieldLabel}>📊 Demografía:</Text>
                  <Text style={styles.audienceFieldValue}>{audience.demographics}</Text>
                </View>
              )}
              
              {audience.psychographics && (
                <View style={styles.audienceField}>
                  <Text style={styles.audienceFieldLabel}>🧠 Psicografía:</Text>
                  <Text style={styles.audienceFieldValue}>{audience.psychographics}</Text>
                </View>
              )}
              
              {audience.needs && (
                <View style={styles.audienceField}>
                  <Text style={styles.audienceFieldLabel}>💡 Necesidades:</Text>
                  <Text style={styles.audienceFieldValue}>{audience.needs}</Text>
                </View>
              )}
              
              {audience.mediaHabits && audience.mediaHabits.length > 0 && (
                <View style={styles.audienceField}>
                  <Text style={styles.audienceFieldLabel}>📱 Hábitos de Media:</Text>
                  <View style={styles.mediaHabitsList}>
                    {audience.mediaHabits.map((habit: string, habitIndex: number) => (
                      <Text key={habitIndex} style={styles.mediaHabit}>• {habit}</Text>
                    ))}
                  </View>
                </View>
              )}
            </View>
          ))}
        </Section>
      )}

      {/* Estrategia Creativa */}
      {brief.creativeStrategy && (
        <Section title="Estrategia Creativa" icon="💡">
          {brief.creativeStrategy.bigIdea && (
            <SubSection title="Gran Idea">
              <Text style={styles.text}>{brief.creativeStrategy.bigIdea}</Text>
            </SubSection>
          )}
          {brief.creativeStrategy.messageHierarchy && Array.isArray(brief.creativeStrategy.messageHierarchy) && brief.creativeStrategy.messageHierarchy.length > 0 && (
            <SubSection title="Jerarquía de Mensajes">
              <BulletList items={brief.creativeStrategy.messageHierarchy} />
            </SubSection>
          )}
          {brief.creativeStrategy.toneAndManner && (
            <SubSection title="Tono y Manera">
              <Text style={styles.text}>{brief.creativeStrategy.toneAndManner}</Text>
            </SubSection>
          )}
          {brief.creativeStrategy.creativeMandatories && Array.isArray(brief.creativeStrategy.creativeMandatories) && brief.creativeStrategy.creativeMandatories.length > 0 && (
            <SubSection title="Elementos Obligatorios">
              <BulletList items={brief.creativeStrategy.creativeMandatories} />
            </SubSection>
          )}
        </Section>
      )}

      {/* Fallback para mensajes clave legacy */}
      {!brief.creativeStrategy && getKeyMessages().length > 0 && (
        <Section title="Mensajes Clave" icon="💡">
          <BulletList items={getKeyMessages()} />
        </Section>
      )}

      {(getChannels().length > 0 || brief.channelStrategy?.integratedApproach) && (
        <Section title="Estrategia de Canales" icon="📊">
          {brief.channelStrategy?.integratedApproach && (
            <SubSection title="Enfoque Integrado">
              <Text style={styles.text}>{brief.channelStrategy.integratedApproach}</Text>
            </SubSection>
          )}
          {getChannels().length > 0 && (
            <SubSection title="Mix de Canales Recomendado">
              {getChannels().map((channel: any, index: number) => (
                <View key={index} style={styles.channelCard}>
                  <Text style={styles.channelName}>{channel.name || channel.channel || 'Canal'}</Text>
                  <Text style={styles.channelRationale}>{channel.strategy || channel.rationale || ''}</Text>
                  {channel.allocation && (
                    <Text style={styles.channelAllocation}>Asignación: {channel.allocation}</Text>
                  )}
                  {channel.kpis && Array.isArray(channel.kpis) && channel.kpis.length > 0 && (
                    <Text style={styles.channelKpis}>KPIs: {channel.kpis.join(', ')}</Text>
                  )}
                </View>
              ))}
            </SubSection>
          )}
        </Section>
      )}

      {(getSuccessMetrics().length > 0 || brief.successMetrics?.measurementFramework) && (
        <Section title="Métricas de Éxito" icon="📈">
          {brief.successMetrics && typeof brief.successMetrics === 'object' ? (
            <>
              {brief.successMetrics.primary && Array.isArray(brief.successMetrics.primary) && brief.successMetrics.primary.length > 0 && (
                <SubSection title="KPIs Primarios">
                  <BulletList items={brief.successMetrics.primary} />
                </SubSection>
              )}
              {brief.successMetrics.secondary && Array.isArray(brief.successMetrics.secondary) && brief.successMetrics.secondary.length > 0 && (
                <SubSection title="KPIs Secundarios">
                  <BulletList items={brief.successMetrics.secondary} />
                </SubSection>
              )}
              {brief.successMetrics.measurementFramework && (
                <SubSection title="Marco de Medición">
                  <Text style={styles.text}>{brief.successMetrics.measurementFramework}</Text>
                </SubSection>
              )}
            </>
          ) : getSuccessMetrics().length > 0 ? (
            <BulletList items={getSuccessMetrics()} />
          ) : null}
        </Section>
      )}

      {getBudget() && (
        <Section title="Consideraciones de Presupuesto" icon="💰">
          {(() => {
            const budget = getBudget();
            if (typeof budget === 'string') {
              return <Text style={styles.text}>{budget}</Text>;
            } else if (typeof budget === 'object' && budget !== null) {
              return (
                <>
                  {budget.estimatedRange && (
                    <SubSection title="Rango Estimado">
                      <Text style={styles.text}>{budget.estimatedRange}</Text>
                    </SubSection>
                  )}
                  {budget.keyInvestments && Array.isArray(budget.keyInvestments) && budget.keyInvestments.length > 0 && (
                    <SubSection title="Inversiones Clave">
                      <BulletList items={budget.keyInvestments} />
                    </SubSection>
                  )}
                  {budget.costOptimization && Array.isArray(budget.costOptimization) && budget.costOptimization.length > 0 && (
                    <SubSection title="Optimización de Costos">
                      <BulletList items={budget.costOptimization} />
                    </SubSection>
                  )}
                </>
              );
            }
            return null;
          })()}
        </Section>
      )}

      {(getTimeline() || (brief.implementationRoadmap && brief.implementationRoadmap.phases)) && (
        <Section title="Hoja de Ruta de Implementación" icon="🗓️">
          {(() => {
            const timeline = getTimeline();
            if (timeline) {
              return <Text style={styles.text}>{timeline}</Text>;
            } else if (brief.implementationRoadmap && brief.implementationRoadmap.phases && Array.isArray(brief.implementationRoadmap.phases)) {
              return (
                <>
                  {brief.implementationRoadmap.phases.map((phase: any, index: number) => (
                    <View key={index} style={styles.phaseCard}>
                      <Text style={styles.phaseTitle}>{phase.phase || `Fase ${index + 1}`}</Text>
                      {phase.duration && (
                        <Text style={styles.phaseDuration}>Duración: {phase.duration}</Text>
                      )}
                      {phase.deliverables && Array.isArray(phase.deliverables) && phase.deliverables.length > 0 && (
                        <Text style={styles.phaseDeliverables}>
                          Entregables: {phase.deliverables.join(', ')}
                        </Text>
                      )}
                      {phase.dependencies && Array.isArray(phase.dependencies) && phase.dependencies.length > 0 && (
                        <Text style={styles.phaseDependencies}>
                          Dependencias: {phase.dependencies.join(', ')}
                        </Text>
                      )}
                    </View>
                  ))}
                </>
              );
            }
            return null;
          })()}
        </Section>
      )}

      {/* Legacy complex structure support */}
      {brief.businessChallenge && (
        <Section title="Desafío de Negocio" icon="🎯">
          <Text style={styles.text}>{brief.businessChallenge}</Text>
        </Section>
      )}

      {brief.brandPositioning && (
        <Section title="Posicionamiento de Marca" icon="🏆">
          <Text style={styles.text}>{brief.brandPositioning}</Text>
        </Section>
      )}

      {brief.riskAssessment?.risks && (
        <Section title="Análisis de Riesgos" icon="⚠️">
          {brief.riskAssessment.risks.map((risk: any, index: number) => (
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
      )}

      {brief.nextSteps && (
        <Section title="Próximos Pasos" icon="✅">
          <BulletList items={brief.nextSteps} />
        </Section>
      )}

      {/* Sección específica para appendix */}
      {brief.appendix && (
        <Section title="Anexos" icon="📎">
          {brief.appendix.assumptions && Array.isArray(brief.appendix.assumptions) && brief.appendix.assumptions.length > 0 && (
            <SubSection title="Supuestos">
              <BulletList items={brief.appendix.assumptions} />
            </SubSection>
          )}
          {brief.appendix.references && Array.isArray(brief.appendix.references) && brief.appendix.references.length > 0 && (
            <SubSection title="Referencias">
              <BulletList items={brief.appendix.references} />
            </SubSection>
          )}
        </Section>
      )}
      
      {/* Mostrar cualquier campo adicional que no esté en el formato estándar */}
      {(() => {
        const standardFields = [
          'title', 'summary', 'objectives', 'targetAudience', 'keyMessages', 
          'channels', 'timeline', 'budget', 'success', 'projectTitle', 
          'briefSummary', 'strategicObjectives', 'creativeStrategy', 
          'channelStrategy', 'successMetrics', 'budgetConsiderations', 
          'implementationRoadmap', 'businessChallenge', 'brandPositioning',
          'riskAssessment', 'nextSteps', 'appendix', '_id', 'createdAt', 'updatedAt'
        ];
        
        const additionalFields = Object.keys(brief).filter(
          key => !standardFields.includes(key) && brief[key] != null
        );
        
        if (additionalFields.length > 0) {
          return (
            <Section title="Información Adicional" icon="📋">
              {additionalFields.map((field) => {
                const value = brief[field];
                const fieldName = field
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .trim();
                
                if (Array.isArray(value)) {
                  return (
                    <View key={field} style={styles.additionalField}>
                      <Text style={styles.additionalFieldName}>{fieldName}:</Text>
                      <BulletList items={value.map(item => 
                        typeof item === 'object' ? JSON.stringify(item) : String(item)
                      )} />
                    </View>
                  );
                } else if (typeof value === 'object') {
                  // Manejo especial para objetos conocidos
                  if (field === 'creativeStrategy' && value.bigIdea) {
                    return (
                      <View key={field} style={styles.additionalField}>
                        <Text style={styles.additionalFieldName}>{fieldName}:</Text>
                        <Text style={styles.additionalFieldValue}>Gran Idea: {value.bigIdea}</Text>
                        {value.toneAndManner && <Text style={styles.additionalFieldValue}>Tono: {value.toneAndManner}</Text>}
                      </View>
                    );
                  } else if (field === 'channelStrategy' && value.integratedApproach) {
                    return (
                      <View key={field} style={styles.additionalField}>
                        <Text style={styles.additionalFieldName}>{fieldName}:</Text>
                        <Text style={styles.additionalFieldValue}>{value.integratedApproach}</Text>
                      </View>
                    );
                  } else {
                    // Para otros objetos, intentar extraer propiedades de texto
                    const textValues = Object.entries(value)
                      .filter(([key, val]) => typeof val === 'string' && val.trim())
                      .map(([key, val]) => `${key}: ${val}`)
                      .join('\n');
                    
                    return (
                      <View key={field} style={styles.additionalField}>
                        <Text style={styles.additionalFieldName}>{fieldName}:</Text>
                        <Text style={styles.additionalFieldValue}>
                          {textValues || JSON.stringify(value, null, 2)}
                        </Text>
                      </View>
                    );
                  }
                } else {
                  return (
                    <View key={field} style={styles.additionalField}>
                      <Text style={styles.additionalFieldName}>{fieldName}:</Text>
                      <Text style={styles.additionalFieldValue}>{String(value)}</Text>
                    </View>
                  );
                }
              })}
            </Section>
          );
        }
        return null;
      })()}
      
      {/* Debug: Mostrar brief completo en desarrollo */}
      {__DEV__ && (
        <Section title="Debug: Brief Completo" icon="🐛">
          <Text style={styles.debugText}>
            {JSON.stringify(brief, null, 2)}
          </Text>
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
  audienceCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  audienceSegment: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 12,
  },
  audienceField: {
    marginBottom: 10,
  },
  audienceFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  audienceFieldValue: {
    fontSize: 14,
    color: '#075985',
    lineHeight: 20,
    marginLeft: 8,
  },
  mediaHabitsList: {
    marginLeft: 8,
    marginTop: 4,
  },
  mediaHabit: {
    fontSize: 14,
    color: '#075985',
    marginBottom: 3,
  },
  additionalField: {
    marginBottom: 16,
  },
  additionalFieldName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 6,
  },
  additionalFieldValue: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginLeft: 8,
  },
  debugText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
  },
});

export default ProfessionalBriefDisplay;