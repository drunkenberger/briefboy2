import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { UnifiedBrief, getBriefData } from '../types/briefTypes';

interface BriefResultProps {
  brief: UnifiedBrief | null;
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
        <ActivityIndicator size="large" color="#FFD700" />
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
  
  const briefData = getBriefData(brief);
  
  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>{brief.title}</Text>
      <Text style={styles.sectionLabel}>Resumen</Text>
      {renderValue(briefData?.summary, 'summary-')}
      <Text style={styles.sectionLabel}>Objetivos</Text>
      {renderValue(briefData?.objectives, 'objectives-')}
      <Text style={styles.sectionLabel}>Problema/Oportunidad</Text>
      {renderValue(briefData?.problemStatement, 'problem-')}
      <Text style={styles.sectionLabel}>Audiencia Objetivo</Text>
      {renderValue(briefData?.targetAudience, 'audience-')}
      <Text style={styles.sectionLabel}>Métricas de Éxito</Text>
      {renderValue(briefData?.successMetrics, 'metrics-')}
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
        <Text style={[styles.listItem, { fontStyle: 'italic', color: '#FFD700' }]}>Llamado a la acción: {brief.callToAction}</Text>
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
              <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>{key}:</Text>
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
      <Text style={{ fontSize: 11, color: '#FFFFFF', marginTop: 24 }} selectable>
        {'Respuesta OpenAI (raw):\n' + (brief._raw !== undefined ? String(brief._raw) : '[Sin contenido recibido]')}
      </Text>
    </ScrollView>
  );
};

// Inspector recursivo para mostrar cualquier objeto/array de forma legible
const ObjectInspector: React.FC<{ data: any; level?: number }> = ({ data, level = 0 }) => {
  if (data === null || data === undefined) return <Text style={{ color: '#FFFFFF' }}>[vacío]</Text>;
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean') {
    return <Text style={{ color: '#FFFFFF', marginLeft: level * 12 }}>{String(data)}</Text>;
  }
  if (Array.isArray(data)) {
    if (data.length === 0) return <Text style={{ color: '#FFFFFF', marginLeft: level * 12 }}>[array vacío]</Text>;
    return (
      <View style={{ marginLeft: level * 12 }}>
        {data.map((item, i) => (
          <View key={i} style={{ marginBottom: 2 }}>
            <Text style={{ color: '#FFD700' }}>•</Text>
            <ObjectInspector data={item} level={level + 1} />
          </View>
        ))}
      </View>
    );
  }
  if (typeof data === 'object') {
    const keys = Object.keys(data);
    if (keys.length === 0) return <Text style={{ color: '#FFFFFF', marginLeft: level * 12 }}>[objeto vacío]</Text>;
    return (
      <View style={{ marginLeft: level * 12 }}>
        {keys.map((k) => (
          <View key={k} style={{ marginBottom: 2 }}>
            <Text style={{ fontWeight: 'bold', color: '#FFD700' }}>{k}:</Text>
            <ObjectInspector data={data[k]} level={level + 1} />
          </View>
        ))}
      </View>
    );
  }
  return <Text style={{ color: '#FFFFFF' }}>[tipo no soportado]</Text>;
};

const styles = StyleSheet.create({
  scroll: {
    width: '100%',
    marginTop: 24,
    backgroundColor: '#000000',
  },
  container: {
    paddingBottom: 48,
    paddingHorizontal: 16,
    backgroundColor: '#000000',
  },
  centered: {
    alignItems: 'center',
    marginTop: 32,
    backgroundColor: '#000000',
    padding: 32,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -1,
    textTransform: 'uppercase',
  },
  sectionLabel: {
    fontWeight: '900',
    fontSize: 15,
    marginTop: 16,
    color: '#FFD700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  section: {
    fontSize: 15,
    color: '#FFFFFF',
    marginTop: 4,
    marginBottom: 4,
    fontWeight: '700',
  },
  listItem: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    marginBottom: 2,
    fontWeight: '700',
  },
  requirements: {
    marginLeft: 8,
    marginBottom: 8,
    backgroundColor: '#000000',
    padding: 16,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  reqLabel: {
    fontWeight: '900',
    color: '#FFD700',
    marginTop: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  reqItem: {
    fontSize: 13,
    color: '#FFFFFF',
    marginLeft: 16,
    fontWeight: '700',
  },
  error: {
    color: '#FFD700',
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  status: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 12,
    textAlign: 'center',
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  phase: {
    marginTop: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#000000',
    borderRadius: 0,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  phaseTitle: {
    fontWeight: '900',
    color: '#FFD700',
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  phaseDuration: {
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 4,
    fontWeight: '700',
  },
  iaSuggestionsBox: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#000000',
    borderRadius: 0,
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  iaSuggestionsTitle: {
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 6,
    fontSize: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  iaSuggestionsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default BriefResult;