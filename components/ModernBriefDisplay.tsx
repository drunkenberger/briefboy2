import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '../constants/Theme';

interface ModernBriefDisplayProps {
  brief: any;
  onImprove?: () => void;
  onExport?: () => void;
  onShare?: () => void;
}

const ModernBriefDisplay: React.FC<ModernBriefDisplayProps> = ({ 
  brief, 
  onImprove,
  onExport,
  onShare
}) => {
  const briefData = useMemo(() => {
    if (!brief) return null;
    
    return {
      title: brief.title || brief.projectTitle || 'Marketing Brief',
      summary: brief.summary || brief.briefSummary || '',
      objectives: Array.isArray(brief.objectives) ? brief.objectives : 
                   Array.isArray(brief.strategicObjectives) ? brief.strategicObjectives : [],
      audience: Array.isArray(brief.targetAudience) ? brief.targetAudience : [],
      keyMessages: Array.isArray(brief.keyMessages) ? brief.keyMessages : [],
      channels: Array.isArray(brief.channels) ? brief.channels : [],
      budget: brief.budget || brief.budgetConsiderations || null,
      timeline: brief.timeline || brief.implementationRoadmap || null,
      success: Array.isArray(brief.success) ? brief.success : 
               Array.isArray(brief.successMetrics) ? brief.successMetrics : [],
    };
  }, [brief]);

  if (!briefData) return null;

  const handlePress = (action?: () => void) => {
    if (action) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      action();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{briefData.title}</Text>
        {brief?.improvementMetadata?.structuredImprovementApplied && (
          <View style={styles.improvementBadge}>
            <Text style={styles.improvementBadgeText}>✨ Mejorado con IA</Text>
          </View>
        )}
        {briefData.summary && (
          <Text style={styles.summary}>{briefData.summary}</Text>
        )}
      </View>

      {/* Objectives */}
      {briefData.objectives.length > 0 && (
        <Section title="Objetivos Estratégicos" icon="🚀">
          <BulletList items={briefData.objectives} />
        </Section>
      )}

      {/* Target Audience */}
      {briefData.audience.length > 0 && (
        <Section title="Audiencia Objetivo" icon="👥">
          {briefData.audience.map((audience: any, index: number) => (
            <AudienceCard key={index} audience={audience} />
          ))}
        </Section>
      )}

      {/* Creative Strategy */}
      {brief.creativeStrategy && (
        <Section title="Estrategia Creativa" icon="💡">
          {brief.creativeStrategy.bigIdea && (
            <SubSection title="Concepto Principal">
              <Text style={styles.bodyText}>{brief.creativeStrategy.bigIdea}</Text>
            </SubSection>
          )}
          
          {brief.creativeStrategy.messageHierarchy && (
            <SubSection title="Mensajes Clave">
              <BulletList items={brief.creativeStrategy.messageHierarchy} />
            </SubSection>
          )}
          
          {brief.creativeStrategy.toneAndManner && (
            <SubSection title="Tono y Estilo">
              <Text style={styles.bodyText}>{brief.creativeStrategy.toneAndManner}</Text>
            </SubSection>
          )}
        </Section>
      )}

      {/* Key Messages (fallback) */}
      {!brief.creativeStrategy && briefData.keyMessages.length > 0 && (
        <Section title="Mensajes Clave" icon="💬">
          <BulletList items={briefData.keyMessages} />
        </Section>
      )}

      {/* Channels */}
      {briefData.channels.length > 0 && (
        <Section title="Canales y Medios" icon="📱">
          {briefData.channels.map((channel: any, index: number) => (
            <ChannelCard key={index} channel={channel} />
          ))}
        </Section>
      )}

      {/* Success Metrics */}
      {briefData.success.length > 0 && (
        <Section title="Métricas de Éxito" icon="📊">
          <BulletList items={briefData.success} />
        </Section>
      )}

      {/* Budget */}
      {briefData.budget && (
        <Section title="Presupuesto" icon="💰">
          <Text style={styles.bodyText}>
            {typeof briefData.budget === 'string' 
              ? briefData.budget 
              : JSON.stringify(briefData.budget, null, 2)
            }
          </Text>
        </Section>
      )}

      {/* Timeline */}
      {briefData.timeline && (
        <Section title="Cronograma" icon="📅">
          <Text style={styles.bodyText}>
            {typeof briefData.timeline === 'string' 
              ? briefData.timeline 
              : JSON.stringify(briefData.timeline, null, 2)
            }
          </Text>
        </Section>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <Pressable
          style={styles.primaryButton}
          onPress={() => handlePress(onImprove)}
        >
          <Text style={styles.primaryButtonText}>✨ Mejorar Brief</Text>
        </Pressable>
        
        <View style={styles.secondaryActions}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => handlePress(onShare)}
          >
            <Text style={styles.secondaryButtonText}>📤 Compartir</Text>
          </Pressable>
          
          <Pressable
            style={styles.secondaryButton}
            onPress={() => handlePress(onExport)}
          >
            <Text style={styles.secondaryButtonText}>💾 Exportar</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
};

const Section: React.FC<{ title: string; icon: string; children: React.ReactNode }> = ({ 
  title, 
  icon, 
  children 
}) => (
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

const SubSection: React.FC<{ title: string; children: React.ReactNode }> = ({ 
  title, 
  children 
}) => (
  <View style={styles.subSection}>
    <Text style={styles.subSectionTitle}>{title}</Text>
    {children}
  </View>
);

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <View style={styles.bulletList}>
    {items.map((item, index) => (
      <View key={index} style={styles.bulletItem}>
        <View style={styles.bullet} />
        <Text style={styles.bulletText}>{item}</Text>
      </View>
    ))}
  </View>
);

const AudienceCard: React.FC<{ audience: any }> = ({ audience }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>
      {audience.segment || 'Segmento de Audiencia'}
    </Text>
    {audience.demographics && (
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Demografía:</Text>
        <Text style={styles.cardValue}>{audience.demographics}</Text>
      </View>
    )}
    {audience.psychographics && (
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Psicografía:</Text>
        <Text style={styles.cardValue}>{audience.psychographics}</Text>
      </View>
    )}
    {audience.needs && (
      <View style={styles.cardRow}>
        <Text style={styles.cardLabel}>Necesidades:</Text>
        <Text style={styles.cardValue}>{audience.needs}</Text>
      </View>
    )}
  </View>
);

const ChannelCard: React.FC<{ channel: any }> = ({ channel }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>
      {channel.name || channel.channel || 'Canal'}
    </Text>
    {channel.strategy && (
      <Text style={styles.cardDescription}>{channel.strategy}</Text>
    )}
    {channel.rationale && (
      <Text style={styles.cardDescription}>{channel.rationale}</Text>
    )}
    {channel.allocation && (
      <View style={styles.cardTag}>
        <Text style={styles.cardTagText}>{channel.allocation}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.container.large,
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.sm,
  },
  title: {
    fontSize: Theme.typography.fontSize['4xl'],
    fontWeight: Theme.typography.fontWeight.extrabold,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    lineHeight: Theme.typography.fontSize['4xl'] * Theme.typography.lineHeight.tight,
  },
  improvementBadge: {
    backgroundColor: '#ECFDF5',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },
  improvementBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#047857',
  },
  summary: {
    fontSize: Theme.typography.fontSize.lg,
    color: Theme.colors.textSecondary,
    lineHeight: Theme.typography.fontSize.lg * Theme.typography.lineHeight.normal,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  sectionContent: {
    padding: 20,
  },
  subSection: {
    marginBottom: 20,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
    fontWeight: '400',
  },
  bulletList: {
    marginLeft: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#6B7280',
    marginTop: 10,
    marginRight: 12,
  },
  bulletText: {
    flex: 1,
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  cardRow: {
    marginBottom: 6,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 14,
    color: '#111827',
    lineHeight: 20,
  },
  cardTag: {
    backgroundColor: '#DBEAFE',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  cardTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E40AF',
  },
  actionsContainer: {
    padding: 20,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.lg,
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
    ...Theme.shadows.lg,
  },
  primaryButtonText: {
    fontSize: Theme.typography.fontSize.base,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.textInverse,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    paddingVertical: Theme.spacing.sm + 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginHorizontal: Theme.spacing.xs,
  },
  secondaryButtonText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.primaryLight,
  },
  bottomSpacer: {
    height: 40,
  },
});

export default ModernBriefDisplay;