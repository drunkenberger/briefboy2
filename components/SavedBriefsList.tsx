import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SavedBrief } from '../hooks/useBriefStorage';

interface SavedBriefsListProps {
  briefs: SavedBrief[];
  onSelectBrief: (brief: SavedBrief) => void;
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
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderBriefItem = ({ item }: { item: SavedBrief }) => (
    <Pressable
      style={styles.briefCard}
      onPress={() => onSelectBrief(item)}
    >
      <View style={styles.briefHeader}>
        <Text style={styles.briefTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.briefDate}>
          {formatDate(item.createdAt)}
        </Text>
      </View>
      
      <Text style={styles.briefPreview} numberOfLines={3}>
        {item.transcription}
      </Text>
      
      <View style={styles.briefFooter}>
        <Text style={styles.briefMeta}>
          {item.brief?.projectTitle || 'Sin título'}
        </Text>
        <Pressable
          style={styles.deleteButton}
          onPress={() => onDeleteBrief(item.id)}
        >
          <Text style={styles.deleteButtonText}>🗑️</Text>
        </Pressable>
      </View>
    </Pressable>
  );

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 Briefs Guardados</Text>
        <Text style={styles.headerSubtitle}>
          {briefs.length} brief{briefs.length !== 1 ? 's' : ''} guardado{briefs.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      <FlatList
        data={briefs}
        renderItem={renderBriefItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 24,
    backgroundColor: '#000000',
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  list: {
    padding: 20,
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