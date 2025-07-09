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
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  list: {
    padding: 16,
  },
  briefCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  briefHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  briefTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginRight: 12,
  },
  briefDate: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'monospace',
  },
  briefPreview: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  briefFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  briefMeta: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#2563eb',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fef2f2',
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
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SavedBriefsList;