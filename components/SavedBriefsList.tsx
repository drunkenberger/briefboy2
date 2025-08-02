import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { DatabaseBrief } from '../types/brief';
import TokenUsageDisplay from './TokenUsageDisplay';

// Union type to handle both local and Supabase briefs
type BriefItem = DatabaseBrief | {
  id: string;
  title: string;
  transcription: string;
  brief: any;
  createdAt: string;
  audioUri?: string;
};

interface SavedBriefsListProps {
  briefs: BriefItem[];
  onSelectBrief: (brief: BriefItem) => void;
  onDeleteBrief: (id: string) => void;
}

/**
 * Componente para mostrar la lista de briefs guardados
 */
const SavedBriefsList: React.FC<SavedBriefsListProps> = ({ 
  briefs, 
  onSelectBrief, 
  onDeleteBrief 
}) => {
  const formatDate = (brief: BriefItem) => {
    // Handle both local briefs (createdAt) and Supabase briefs (created_at)
    const dateString = 'created_at' in brief ? brief.created_at : brief.createdAt;
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBriefItem = ({ item }: { item: BriefItem }) => {
    // Handle both brief structures
    const briefData = 'brief_data' in item ? item.brief_data : item.brief;
    const transcription = item.transcription || '';
    
    return (
      <Pressable
        style={styles.briefCard}
        onPress={() => onSelectBrief(item)}
      >
        <View style={styles.briefHeader}>
          <Text style={styles.briefTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.briefDate}>
            {formatDate(item)}
          </Text>
        </View>
        
        <Text style={styles.briefPreview} numberOfLines={3}>
          {transcription}
        </Text>
        
        {/* Token Usage Display for Supabase briefs */}
        {'tokens_used' in item && item.tokens_used > 0 && (
          <TokenUsageDisplay
            tokensUsed={item.tokens_used}
            tokensBreakdown={item.tokens_breakdown}
            estimatedCost={item.estimated_cost}
            compact={true}
            style={styles.tokenUsage}
          />
        )}
        
        <View style={styles.briefFooter}>
          <Text style={styles.briefMeta}>
            {briefData?.projectTitle || briefData?.title || 'Sin título'}
          </Text>
          <Pressable
            style={styles.deleteButton}
            onPress={(e) => {
              if (__DEV__) {
                console.log('🗑️ SavedBriefsList: Delete button pressed for brief:', item.id);
              }
              e.stopPropagation();
              if (__DEV__) {
                console.log('🗑️ SavedBriefsList: Calling onDeleteBrief with id:', item.id);
              }
              onDeleteBrief(item.id);
              if (__DEV__) {
                console.log('🗑️ SavedBriefsList: onDeleteBrief called');
              }
            }}
          >
            <Text style={styles.deleteButtonText}>🗑️</Text>
          </Pressable>
        </View>
      </Pressable>
    );
  };

  if (briefs.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📝</Text>
        <Text style={styles.emptyTitle}>No hay briefs guardados</Text>
        <Text style={styles.emptySubtitle}>
          Graba un audio y genera tu primer brief
        </Text>
        
        <View style={styles.emptyTips}>
          <Text style={styles.emptyTipsTitle}>💡 Consejos para tu primer brief:</Text>
          <Text style={styles.emptyTipsText}>• Describe claramente el producto o servicio</Text>
          <Text style={styles.emptyTipsText}>• Menciona el público objetivo específico</Text>
          <Text style={styles.emptyTipsText}>• Incluye objetivos medibles y KPIs</Text>
          <Text style={styles.emptyTipsText}>• Especifica presupuesto y timeline</Text>
          <Text style={styles.emptyTipsText}>• Detalla canales de comunicación preferidos</Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={briefs}
      renderItem={renderBriefItem}
      keyExtractor={(item) => `brief-${item.id}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      style={styles.container}
      extraData={briefs.length} // Force re-render when count changes
      removeClippedSubviews={false} // Ensure all items are rendered
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  list: {
    padding: 20,
    flexGrow: 1,
  },
  briefCard: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 20,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  briefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  briefTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginRight: 16,
    letterSpacing: -0.5,
  },
  briefDate: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  briefPreview: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 16,
    opacity: 0.9,
  },
  tokenUsage: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  briefFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  briefMeta: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  deleteButton: {
    padding: 12,
    borderRadius: 0,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  deleteButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyTips: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 24,
    marginTop: 32,
    borderWidth: 2,
    borderColor: '#FFD700',
    width: '100%',
    maxWidth: 400,
  },
  emptyTipsTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  emptyTipsText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '700',
    lineHeight: 20,
  },
});

export default SavedBriefsList;