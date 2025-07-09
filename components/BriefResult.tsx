import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

interface BriefResultProps {
  brief: any | null;
  loading: boolean;
  error: string | null;
  iaSuggestions?: string | null;
}

/**
 * Muestra el resultado del brief generado a partir del transcript.
 * @param brief Brief generado (JSON)
 * @param loading Estado de carga
 * @param error Mensaje de error (si existe)
 */
// Utilidad para renderizar cualquier valor (string, array, objeto) de forma robusta
const renderValue = (value: any, keyPrefix = '') => {
  if (value === null || value === undefined) return null;
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return <Text style={styles.listItem}>{String(value)}</Text>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.map((item, i) => (
      <View key={keyPrefix + i} style={{ marginBottom: 2 }}>
        {typeof item === 'object' && item !== null ? (
          <ObjectInspector data={item} />
        ) : (
          <Text style={styles.listItem}>• {String(item)}</Text>
        )}
      </View>
    ));
  }
  if (typeof value === 'object') {
    return <ObjectInspector data={value} />;
  }
  return null;
};

const BriefResult: React.FC<BriefResultProps> = ({ brief, loading, error, iaSuggestions }) => {
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.status}>Generando brief publicitario...</Text>
      </View>
    );
  }
  if (error) {
    return <Text style={styles.error}>Error: {error}</Text>;
  }
  if (!brief) {
    return <Text style={styles.status}>No hay brief generado.</Text>;
  }
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{brief.title}</Text>
      <Text style={styles.sectionLabel}>Resumen</Text>
      {renderValue(brief.summary, 'summary-')}
      <Text style={styles.sectionLabel}>Objetivos</Text>
      {renderValue(brief.objectives, 'objectives-')}
      <Text style={styles.sectionLabel}>Problema/Oportunidad</Text>
      {renderValue(brief.problemStatement, 'problem-')}
      <Text style={styles.sectionLabel}>Audiencia Objetivo</Text>
      {renderValue(brief.targetAudience, 'audience-')}
      <Text style={styles.sectionLabel}>Métricas de Éxito</Text>
      {renderValue(brief.successMetrics, 'metrics-')}
      <Text style={styles.sectionLabel}>Requerimientos</Text>
      {brief.requirements && (
        <View style={styles.requirements}>
          <Text style={styles.reqLabel}>Funcionales:</Text>
          {renderValue(brief.requirements.functional, 'req-func-')}
          <Text style={styles.reqLabel}>No funcionales:</Text>
          {renderValue(brief.requirements.nonFunctional, 'req-nonfunc-')}
          <Text style={styles.reqLabel}>Técnicos:</Text>
          {renderValue(brief.requirements.technical, 'req-tech-')}
          <Text style={styles.reqLabel}>Seguridad:</Text>
          {renderValue(brief.requirements.security, 'req-sec-')}
        </View>
      )}
      <Text style={styles.sectionLabel}>Mensajes Clave</Text>
      {renderValue(brief.keyMessages, 'keymsg-')}
      {brief.callToAction ? (
        <Text style={[styles.listItem, { fontStyle: 'italic', color: '#1976d2' }]}>Llamado a la acción: {brief.callToAction}</Text>
      ) : null}
      <Text style={styles.sectionLabel}>Canales</Text>
      {brief.channelsAndTactics?.channels ? renderValue(brief.channelsAndTactics.channels, 'channels-') : null}
      <Text style={styles.sectionLabel}>Fases de la Campaña</Text>
      {renderValue(brief.campaignPhases, 'phases-')}
      {/* Otros datos adicionales no mapeados */}
      {brief._extra && Object.keys(brief._extra).length > 0 && (
        <View style={{ marginTop: 24 }}>
          <Text style={styles.sectionLabel}>Otros datos</Text>
          {Object.entries(brief._extra).map(([key, value]) => (
            <View key={key} style={{ marginBottom: 8, marginLeft: 8 }}>
              <Text style={{ fontWeight: 'bold', color: '#555' }}>{key}:</Text>
              <ObjectInspector data={value} />
            </View>
          ))}
        </View>
      )}
      {/* Mostrar sugerencias adicionales de la IA si existen */}
      {iaSuggestions && iaSuggestions.trim().length > 0 && (
        <View style={styles.iaSuggestionsBox}>
          <Text style={styles.iaSuggestionsTitle}>Sugerencias adicionales de la IA</Text>
          <Text style={styles.iaSuggestionsText}>{iaSuggestions}</Text>
        </View>
      )}
      {/* Mostrar contenido bruto siempre para depuración */}
      <Text style={{ fontSize: 11, color: '#888', marginTop: 24 }} selectable>
        {'Respuesta OpenAI (raw):\n' + (brief._raw !== undefined ? String(brief._raw) : '[Sin contenido recibido]')}
      </Text>
    </ScrollView>
  );
};

// Inspector recursivo para mostrar cualquier objeto/array de forma legible
const ObjectInspector: React.FC<{ data: any; level?: number }> = ({ data, level = 0 }) => {
  if (data === null || data === undefined) return <Text style={{ color: '#888' }}>[vacío]</Text>;
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <Text style={{ color: '#444', marginLeft: level * 12 }}>{String(data)}</Text>;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return <Text style={{ color: '#888', marginLeft: level * 12 }}>[array vacío]</Text>;
    return (
      <View style={{ marginLeft: level * 12 }}>
        {data.map((item, i) => (
          <View key={i} style={{ marginBottom: 2 }}>
            <Text style={{ color: '#888' }}>•</Text>
            <ObjectInspector data={item} level={level + 1} />
          </View>
        ))}
      </View>
    );
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <Text style={{ color: '#888', marginLeft: level * 12 }}>[objeto vacío]</Text>;
    return (
      <View style={{ marginLeft: level * 12 }}>
        {keys.map((k) => (
          <View key={k} style={{ marginBottom: 2 }}>
            <Text style={{ fontWeight: 'bold', color: '#1976d2' }}>{k}:</Text>
            <ObjectInspector data={data[k]} level={level + 1} />
          </View>
        ))}
      </View>
    );
  }
  return <Text style={{ color: '#888' }}>[tipo no soportado]</Text>;
};

const styles = StyleSheet.create({
  scroll: {
    width: '100%',
    marginTop: 24,
  },
  container: {
    paddingBottom: 48,
    paddingHorizontal: 16,
  },
  centered: {
    alignItems: 'center',
    marginTop: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionLabel: {
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 16,
    color: '#333',
  },
  section: {
    fontSize: 15,
    color: '#222',
    marginTop: 4,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 14,
    color: '#444',
    marginLeft: 12,
    marginBottom: 2,
  },
  requirements: {
    marginLeft: 8,
    marginBottom: 8,
  },
  reqLabel: {
    fontWeight: 'bold',
    color: '#555',
    marginTop: 8,
  },
  reqItem: {
    fontSize: 13,
    color: '#555',
    marginLeft: 16,
  },
  error: {
    color: '#d32f2f',
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
  },
  status: {
    fontSize: 16,
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  phase: {
    marginTop: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
  phaseTitle: {
    fontWeight: 'bold',
    color: '#1976d2',
    fontSize: 15,
  },
  phaseDuration: {
    fontSize: 13,
    color: '#888',
    marginBottom: 4,
  },
  iaSuggestionsBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#fffbe6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffe082',
  },
  iaSuggestionsTitle: {
    fontWeight: 'bold',
    color: '#b28704',
    marginBottom: 6,
    fontSize: 15,
  },
  iaSuggestionsText: {
    color: '#7c6f00',
    fontSize: 14,
  },
});

export default BriefResult;