import React, { useState } from 'react';
import { 
  FlatList, 
  Pressable, 
  StyleSheet, 
  Text, 
  View, 
  Animated,
  RefreshControl,
  ActivityIndicator,
  Dimensions 
} from 'react-native';
import { DatabaseBrief } from '../types/brief';
import { Theme } from '../constants/Theme';

const { width: screenWidth } = Dimensions.get('window');

// Union type to handle both local and Supabase briefs
type BriefItem = DatabaseBrief | {
  id: string;
  title: string;
  transcription: string;
  brief: any;
  createdAt: string;
  audioUri?: string;
};

interface ImprovedSavedBriefsListProps {
  briefs: BriefItem[];
  onSelectBrief: (brief: BriefItem) => void;
  onDeleteBrief: (id: string) => void;
  isLoading?: boolean;
  onRefresh?: () => void;
  showEmptyActions?: boolean;
}

/**
 * Improved component for displaying saved briefs with better UX
 */
const ImprovedSavedBriefsList: React.FC<ImprovedSavedBriefsListProps> = ({ 
  briefs, 
  onSelectBrief, 
  onDeleteBrief,
  isLoading = false,
  onRefresh,
  showEmptyActions = true
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleRefresh = React.useCallback(async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  }, [onRefresh]);

  const formatDate = (brief: BriefItem) => {
    const dateString = 'created_at' in brief ? brief.created_at : brief.createdAt;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const getBriefStats = (briefData: any) => {
    if (!briefData) return { sections: 0, words: 0 };
    
    const sections = Object.keys(briefData).filter(key => 
      briefData[key] && 
      key !== 'id' && 
      key !== 'created_at' && 
      key !== 'updated_at'
    ).length;
    
    const words = JSON.stringify(briefData).split(/\s+/).length;
    
    return { sections, words };
  };

  const renderBriefCard = ({ item, index }: { item: BriefItem; index: number }) => {
    const briefData = 'brief_data' in item ? item.brief_data : item.brief;
    const transcription = item.transcription || '';
    const stats = getBriefStats(briefData);
    
    return (
      <View style={styles.briefCard}>
        <Pressable
          style={styles.briefCardInner}
          onPress={() => onSelectBrief(item)}
          onPressIn={() => {}} // Prevenir event bubbling issues
        >
          {/* Header */}
          <View style={styles.briefHeader}>
            <View style={styles.briefTitleContainer}>
              <Text style={styles.briefTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.briefDate}>
                {formatDate(item)}
              </Text>
            </View>
            
            <Pressable
              style={styles.deleteButton}
              onPress={() => {
                console.log('🗑️ ImprovedSavedBriefsList: Delete button pressed for brief:', item.id, item.title);
                console.log('🗑️ ImprovedSavedBriefsList: Calling onDeleteBrief with id:', item.id);
                onDeleteBrief(item.id);
                console.log('🗑️ ImprovedSavedBriefsList: onDeleteBrief called');
              }}
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            >
              <Text style={styles.deleteIcon}>🗑️</Text>
            </Pressable>
          </View>
          
          {/* Content Preview */}
          <View style={styles.briefContent}>
            <Text style={styles.briefPreview} numberOfLines={3}>
              {transcription}
            </Text>
          </View>
          
          {/* Footer with stats */}
          <View style={styles.briefFooter}>
            <Text style={styles.briefMeta}>
              {briefData?.projectTitle || briefData?.title || 'Sin título'}
            </Text>
          </View>
        </Pressable>
      </View>
    );
  };

  const renderEmptyState = () => (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <View style={styles.emptyGraphic}>
        <View style={styles.emptyIconContainer}>
          <Text style={styles.emptyIcon}>📝</Text>
          <View style={styles.emptyIconDecoration} />
        </View>
      </View>
      
      <View style={styles.emptyContent}>
        <Text style={styles.emptyTitle}>¡Crea tu primer brief!</Text>
        <Text style={styles.emptySubtitle}>
          Tus briefs guardados aparecerán aquí para que puedas acceder a ellos cuando quieras
        </Text>
      </View>
      
      {showEmptyActions && (
        <View style={styles.emptyActions}>
          <View style={styles.emptyTips}>
            <Text style={styles.emptyTipsTitle}>💡 Consejos para tu primer brief:</Text>
            <Text style={styles.emptyTipsText}>• Describe claramente el producto o servicio</Text>
            <Text style={styles.emptyTipsText}>• Menciona el público objetivo específico</Text>
            <Text style={styles.emptyTipsText}>• Incluye objetivos medibles y KPIs</Text>
            <Text style={styles.emptyTipsText}>• Especifica presupuesto y timeline</Text>
            <Text style={styles.emptyTipsText}>• Detalla canales de comunicación preferidos</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );

  if (isLoading && briefs.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.accent} />
        <Text style={styles.loadingText}>Cargando briefs...</Text>
      </View>
    );
  }

  if (briefs.length === 0) {
    return renderEmptyState();
  }

  return (
    <FlatList
      data={briefs}
      renderItem={renderBriefCard}
      keyExtractor={(item) => `brief-${item.id}`}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.listContainer}
      style={styles.list}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Theme.colors.accent}
            colors={[Theme.colors.accent]}
          />
        ) : undefined
      }
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  separator: {
    height: 0,
  },
  
  // Brief Card Styles
  briefCard: {
    marginBottom: 16,
  },
  briefCardInner: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 20,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  briefHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.md,
  },
  briefTitleContainer: {
    flex: 1,
    marginRight: Theme.spacing.md,
  },
  briefTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  briefDate: {
    fontSize: 12,
    color: '#FFD700',
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1,
  },
  deleteButton: {
    padding: 12,
    borderRadius: 0,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  deleteIcon: {
    fontSize: 16,
  },
  briefContent: {
    marginBottom: Theme.spacing.lg,
  },
  briefPreview: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.9,
  },
  briefFooter: {
    paddingTop: 16,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  briefMeta: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  
  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#000000',
  },
  emptyGraphic: {
    alignItems: 'center',
    marginBottom: Theme.spacing['3xl'],
  },
  emptyIconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 24,
  },
  emptyIconDecoration: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 2,
    borderColor: Theme.colors.accent + '20',
    borderStyle: 'dashed',
  },
  emptyContent: {
    alignItems: 'center',
    marginBottom: Theme.spacing['4xl'],
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -1,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#FFD700',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  
  // Empty Actions
  emptyActions: {
    width: '100%',
    maxWidth: 400,
    marginTop: 32,
  },
  emptyTips: {
    backgroundColor: '#000000',
    borderRadius: 0,
    padding: 24,
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
  
  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 20,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});

export default ImprovedSavedBriefsList;