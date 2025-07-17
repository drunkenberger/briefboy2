import React, { useState, useCallback, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { normalizeBrief } from '../utils/briefValidation';
import { parseFormattedText, isFormattedText, getFallbackValue } from '../utils/fieldParsing';

interface EditableBriefViewProps {
  brief: any;
  onBriefChange: (updatedBrief: any) => void;
  isUpdating?: boolean;
}

interface BriefField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'array';
  placeholder: string;
  required: boolean;
}

const BRIEF_FIELDS: BriefField[] = [
  // Básicos
  { key: 'projectTitle', label: 'Título del Proyecto', type: 'text', placeholder: 'Nombre del proyecto o campaña', required: true },
  { key: 'briefSummary', label: 'Resumen Ejecutivo', type: 'textarea', placeholder: 'Descripción general del proyecto...', required: true },

  // Negocio
  { key: 'businessChallenge', label: 'Desafío de Negocio', type: 'textarea', placeholder: 'Principal desafío que debe resolver la campaña...', required: true },
  { key: 'strategicObjectives', label: 'Objetivos Estratégicos', type: 'array', placeholder: 'Objetivos principales de la campaña', required: true },

  // Audiencia
  { key: 'targetAudience.primary', label: 'Audiencia Primaria', type: 'textarea', placeholder: 'Descripción detallada de la audiencia principal...', required: true },
  { key: 'targetAudience.secondary', label: 'Audiencia Secundaria', type: 'textarea', placeholder: 'Descripción de audiencia secundaria (opcional)...', required: false },
  { key: 'targetAudience.insights', label: 'Insights de Audiencia', type: 'array', placeholder: 'Insights clave sobre la audiencia', required: true },

  // Posicionamiento
  { key: 'brandPositioning', label: 'Posicionamiento de Marca', type: 'textarea', placeholder: 'Cómo se posiciona la marca...', required: true },

  // Estrategia Creativa
  { key: 'creativeStrategy.bigIdea', label: 'Punto de Partida Creativo', type: 'textarea', placeholder: 'El punto de partida creativo que guiará toda la campaña...', required: true },
  { key: 'creativeStrategy.messageHierarchy', label: 'Jerarquía de Mensajes', type: 'array', placeholder: 'Mensajes ordenados por importancia', required: true },
  { key: 'creativeStrategy.toneAndManner', label: 'Tono y Manera', type: 'textarea', placeholder: 'Cómo debe sonar y sentirse la comunicación...', required: true },
  { key: 'creativeStrategy.creativeMandatories', label: 'Elementos Obligatorios', type: 'array', placeholder: 'Elementos que deben incluirse obligatoriamente', required: false },

  // Canales
  { key: 'channelStrategy.recommendedMix', label: 'Mix de Canales Recomendado', type: 'array', placeholder: 'Canales recomendados para la campaña', required: true },
  { key: 'channelStrategy.integratedApproach', label: 'Enfoque Integrado de Canales', type: 'textarea', placeholder: 'Cómo se integran los diferentes canales...', required: true },

  // Métricas
  { key: 'successMetrics.primary', label: 'KPIs Primarios', type: 'array', placeholder: 'Métricas principales de éxito', required: true },
  { key: 'successMetrics.secondary', label: 'KPIs Secundarios', type: 'array', placeholder: 'Métricas secundarias', required: false },
  { key: 'successMetrics.measurementFramework', label: 'Framework de Medición', type: 'textarea', placeholder: 'Cómo se medirá el éxito...', required: true },

  // Presupuesto
  { key: 'budgetConsiderations.estimatedRange', label: 'Rango Presupuestario', type: 'text', placeholder: 'Rango estimado de presupuesto', required: false },
  { key: 'budgetConsiderations.keyInvestments', label: 'Inversiones Clave', type: 'array', placeholder: 'Principales áreas de inversión', required: false },
  { key: 'budgetConsiderations.costOptimization', label: 'Optimización de Costos', type: 'array', placeholder: 'Estrategias para optimizar costos', required: false },

  // Riesgos
  { key: 'riskAssessment.risks', label: 'Análisis de Riesgos', type: 'array', placeholder: 'Riesgos potenciales y mitigaciones', required: true },

  // Implementación
  { key: 'implementationRoadmap.phases', label: 'Fases de Implementación', type: 'array', placeholder: 'Fases del proyecto', required: true },

  // Próximos Pasos
  { key: 'nextSteps', label: 'Próximos Pasos', type: 'array', placeholder: 'Acciones a seguir', required: true },

  // Anexos
  { key: 'appendix.assumptions', label: 'Supuestos', type: 'array', placeholder: 'Supuestos clave del brief', required: false },
  { key: 'appendix.references', label: 'Referencias', type: 'array', placeholder: 'Referencias y fuentes', required: false },
];

/**
 * Componente para editar el brief en tiempo real
 */
const EditableBriefView: React.FC<EditableBriefViewProps> = ({
  brief,
  onBriefChange,
  isUpdating = false,
}) => {
  const [workingBrief, setWorkingBrief] = useState(brief || {});
  const [, setEditingField] = useState<string | null>(null);

  // Sincronizar con brief externo
  useEffect(() => {
    const timestamp = new Date().toLocaleTimeString();
    if (brief) {
      const normalizedBrief = normalizeBrief(brief);
      const previousBrief = workingBrief;
      setWorkingBrief(normalizedBrief);

      console.log(`📋 [${timestamp}] EditableBriefView sincronizando:`, {
        hasNewBrief: !!brief,
        briefChanged: brief !== previousBrief,
        previousFieldCount: previousBrief ? Object.keys(previousBrief).length : 0,
        newFieldCount: Object.keys(normalizedBrief).length,
        originalBrief: brief,
        normalizedBrief: normalizedBrief,
        keyFields: {
          projectTitle: normalizedBrief.projectTitle,
          briefSummary: normalizedBrief.briefSummary ? normalizedBrief.briefSummary.substring(0, 50) + '...' : null,
          strategicObjectives: normalizedBrief.strategicObjectives,
          targetAudiencePrimary: normalizedBrief.targetAudience?.primary ? normalizedBrief.targetAudience.primary.substring(0, 50) + '...' : null
        },
        updateReceived: true
      });
    } else {
      console.warn(`⚠️ [${timestamp}] EditableBriefView recibió brief vacío o nulo`);
    }
  }, [brief]);

  const handleFieldChange = useCallback((field: string, value: any) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🔄 [${timestamp}] EditableBriefView - Actualizando campo:`, {
      field,
      value,
      valueType: Array.isArray(value) ? 'array' : typeof value
    });

    const updatedBrief = { ...workingBrief };

    // Manejar campos anidados (e.g., 'targetAudience.primary')
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      if (!updatedBrief[parent]) {
        updatedBrief[parent] = {};
      }
      updatedBrief[parent] = { ...updatedBrief[parent], [child]: value };
    } else {
      updatedBrief[field] = value;
    }

    // Verificar que el campo se actualizó correctamente
    const verificacion = field.includes('.')
      ? updatedBrief[field.split('.')[0]][field.split('.')[1]]
      : updatedBrief[field];

    console.log(`✅ Campo actualizado localmente:`, {
      field,
      valorAntes: field.includes('.')
        ? workingBrief[field.split('.')[0]]?.[field.split('.')[1]]
        : workingBrief[field],
      valorDespues: verificacion
    });

    setWorkingBrief(updatedBrief);
    onBriefChange(updatedBrief);
  }, [workingBrief, onBriefChange]);

  const handleArrayFieldChange = useCallback((field: string, index: number, value: string) => {
    // Obtener el array actual, manejando campos anidados
    let currentArray: any[] = [];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      currentArray = workingBrief[parent]?.[child] || [];
    } else {
      currentArray = workingBrief[field] || [];
    }

    const updatedArray = Array.isArray(currentArray) ? [...currentArray] : [];

    // Para channelStrategy.recommendedMix, intentar parsear el texto formateado de vuelta a objeto
    if (field === 'channelStrategy.recommendedMix' && value.includes('📺')) {
      try {
        // Extraer la información del texto formateado
        const lines = value.split('\n');
        const channelLine = lines[0] || '';
        const rationaleLines = lines.slice(1).filter(line => line.startsWith('📊'));
        const kpiLines = lines.slice(1).filter(line => line.startsWith('📈'));

        // Extraer channel y allocation
        const channelMatch = channelLine.match(/📺 (.+?) \((.+?)\)/);
        const channel = channelMatch ? channelMatch[1] : '';
        const allocation = channelMatch ? channelMatch[2] : '';

        // Extraer rationale
        const rationale = rationaleLines.length > 0 ? rationaleLines[0].replace('📊 ', '') : '';

        // Extraer KPIs
        const kpiMatch = kpiLines.length > 0 ? kpiLines[0].match(/📈 KPIs: (.+)/) : null;
        const kpis = kpiMatch ? kpiMatch[1].split(', ') : [];

        const objectValue = {
          channel,
          allocation,
          rationale,
          kpis
        };

        console.log('🔄 Convirtiendo texto formateado a objeto:', objectValue);
        updatedArray[index] = objectValue;
      } catch (e) {
        console.warn('Error procesando texto formateado:', e);
        updatedArray[index] = value;
      }
    } else {
      updatedArray[index] = value;
    }

    handleFieldChange(field, updatedArray);
  }, [workingBrief, handleFieldChange]);

  const addArrayItem = useCallback((field: string) => {
    // Obtener el array actual, manejando campos anidados
    let currentArray: any[] = [];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      currentArray = workingBrief[parent]?.[child] || [];
    } else {
      currentArray = workingBrief[field] || [];
    }

    const updatedArray = Array.isArray(currentArray) ? [...currentArray, ''] : [''];
    handleFieldChange(field, updatedArray);
  }, [workingBrief, handleFieldChange]);

  const removeArrayItem = useCallback((field: string, index: number) => {
    // Obtener el array actual, manejando campos anidados
    let currentArray: any[] = [];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      currentArray = workingBrief[parent]?.[child] || [];
    } else {
      currentArray = workingBrief[field] || [];
    }

    const updatedArray = Array.isArray(currentArray) ? currentArray.filter((_: any, i: number) => i !== index) : [];
    handleFieldChange(field, updatedArray);
  }, [workingBrief, handleFieldChange]);

  const copyToClipboard = useCallback((text: string) => {
    Clipboard.setStringAsync(text);
    Alert.alert('Copiado', 'Texto copiado al portapapeles');
  }, []);

  const pasteFromClipboard = useCallback(async (field: string) => {
    try {
      const clipboardText = await Clipboard.getStringAsync();
      if (clipboardText) {
        handleFieldChange(field, clipboardText);
      }
    } catch (error) {
      console.error('Error pasting from clipboard:', error);
    }
  }, [handleFieldChange]);

  const renderTextField = (fieldConfig: BriefField) => {
    // Obtener el valor, manejando campos anidados
    let rawValue: any;
    if (fieldConfig.key.includes('.')) {
      const [parent, child] = fieldConfig.key.split('.');
      rawValue = workingBrief[parent]?.[child];
    } else {
      rawValue = workingBrief[fieldConfig.key];
    }

    const value = typeof rawValue === 'string' ? rawValue : String(rawValue || '');

    return (
      <View key={fieldConfig.key} style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>
            {fieldConfig.label}
            {fieldConfig.required && <Text style={styles.required}> *</Text>}
          </Text>
          <View style={styles.fieldActions}>
            <Pressable
              style={styles.actionButton}
              onPress={() => copyToClipboard(value)}
            >
              <Text style={styles.actionButtonText}>📋</Text>
            </Pressable>
            <Pressable
              style={styles.actionButton}
              onPress={() => pasteFromClipboard(fieldConfig.key)}
            >
              <Text style={styles.actionButtonText}>📥</Text>
            </Pressable>
          </View>
        </View>

        {fieldConfig.type === 'textarea' ? (
          <TextInput
            style={[styles.textArea, isUpdating && styles.updating]}
            value={value}
            onChangeText={(text) => handleFieldChange(fieldConfig.key, text)}
            placeholder={fieldConfig.placeholder}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            onFocus={() => setEditingField(fieldConfig.key)}
            onBlur={() => setEditingField(null)}
          />
        ) : (
          <TextInput
            style={[styles.textInput, isUpdating && styles.updating]}
            value={value}
            onChangeText={(text) => handleFieldChange(fieldConfig.key, text)}
            placeholder={fieldConfig.placeholder}
            onFocus={() => setEditingField(fieldConfig.key)}
            onBlur={() => setEditingField(null)}
          />
        )}
      </View>
    );
  };

  // Función especializada para renderizar items de channelStrategy
  const formatChannelStrategyItem = (item: any): string => {
    if (typeof item === 'string') {
      // Verificar si es un JSON string que necesita ser parseado
      if (item.startsWith('{') && item.endsWith('}')) {
        try {
          const parsed = JSON.parse(item);
          console.log('🔧 Parseando JSON string para channelStrategy:', parsed);
          return `📺 ${parsed.channel || 'Canal'} (${parsed.allocation || '0%'})\n📊 ${parsed.rationale || 'Sin descripción'}\n📈 KPIs: ${Array.isArray(parsed.kpis) ? parsed.kpis.join(', ') : 'No definidos'}`;
        } catch (e) {
          console.warn('Error parseando JSON string:', e);
          return item;
        }
      }
      return item;
    }

    if (typeof item === 'object' && item !== null) {
      return `📺 ${item.channel || 'Canal'} (${item.allocation || '0%'})\n📊 ${item.rationale || 'Sin descripción'}\n📈 KPIs: ${Array.isArray(item.kpis) ? item.kpis.join(', ') : 'No definidos'}`;
    }

    return String(item || '');
  };

  // Función especializada para renderizar items de successMetrics
  const formatSuccessMetricItem = (item: any): string => {
    if (typeof item === 'string') {
      return item;
    }

    if (typeof item === 'object' && item !== null) {
      if (item.metric && item.target) {
        return `📊 ${item.metric}: ${item.target}${item.description ? `\n📝 ${item.description}` : ''}`;
      }
    }

    return String(item || '');
  };

  // Función especializada para renderizar items de budgetConsiderations
  const formatBudgetItem = (item: any): string => {
    if (typeof item === 'string') {
      return item;
    }

    if (typeof item === 'object' && item !== null) {
      if (item.category && item.amount) {
        return `💰 ${item.category}: ${item.amount}${item.description ? `\n📝 ${item.description}` : ''}`;
      }
    }

    return String(item || '');
  };

  // Función genérica para renderizar objetos
  const formatGenericObject = (item: any): string => {
    if (typeof item === 'string') {
      return item;
    }

    if (typeof item === 'object' && item !== null) {
      const keys = Object.keys(item);
      if (keys.length > 0) {
        return keys.map(key => `${key}: ${item[key]}`).join('\n');
      }
    }

    return String(item || '');
  };

  // Función principal para renderizar un item de array de forma inteligente
  const renderArrayItem = (item: any, fieldKey: string): string => {
    // Debug logging para channelStrategy
    if (fieldKey === 'channelStrategy.recommendedMix') {
      console.log('🎯 renderArrayItem debug para channelStrategy:', {
        item,
        itemType: typeof item,
        isObject: typeof item === 'object' && item !== null,
        itemKeys: typeof item === 'object' && item !== null ? Object.keys(item) : null,
        itemStringified: JSON.stringify(item)
      });
    }

    // Delegar a funciones especializadas según el tipo de campo
    if (fieldKey === 'channelStrategy.recommendedMix') {
      return formatChannelStrategyItem(item);
    }

    if (fieldKey.includes('successMetrics')) {
      return formatSuccessMetricItem(item);
    }

    if (fieldKey.includes('budgetConsiderations')) {
      return formatBudgetItem(item);
    }

    // Usar función genérica para otros tipos de objetos
    return formatGenericObject(item);
  };

  const renderArrayField = (fieldConfig: BriefField) => {
    // Obtener el array, manejando campos anidados
    let rawArray: any;
    if (fieldConfig.key.includes('.')) {
      const [parent, child] = fieldConfig.key.split('.');
      rawArray = workingBrief[parent]?.[child];

      // Log específico para channelStrategy
      if (fieldConfig.key === 'channelStrategy.recommendedMix') {
        console.log('🔍 Renderizando channelStrategy.recommendedMix:', {
          parent: workingBrief[parent],
          child: child,
          rawArray: rawArray,
          isArray: Array.isArray(rawArray),
          workingBriefKeys: Object.keys(workingBrief),
          channelStrategyContent: workingBrief.channelStrategy
        });
      }
    } else {
      rawArray = workingBrief[fieldConfig.key];
    }

    const array = Array.isArray(rawArray) ? rawArray : [];

    return (
      <View key={fieldConfig.key} style={styles.fieldContainer}>
        <View style={styles.fieldHeader}>
          <Text style={styles.fieldLabel}>
            {fieldConfig.label}
            {fieldConfig.required && <Text style={styles.required}> *</Text>}
          </Text>
          <Pressable
            style={styles.addButton}
            onPress={() => addArrayItem(fieldConfig.key)}
          >
            <Text style={styles.addButtonText}>+ Agregar</Text>
          </Pressable>
        </View>

        {array.map((item: any, index: number) => (
          <View key={index} style={styles.arrayItem}>
            <TextInput
              style={[styles.arrayInput, isUpdating && styles.updating]}
              value={renderArrayItem(item, fieldConfig.key)}
              onChangeText={(text) => handleArrayFieldChange(fieldConfig.key, index, text)}
              placeholder={`${fieldConfig.placeholder} ${index + 1}`}
              multiline
              onFocus={() => setEditingField(`${fieldConfig.key}-${index}`)}
              onBlur={() => setEditingField(null)}
            />
            <Pressable
              style={styles.removeButton}
              onPress={() => removeArrayItem(fieldConfig.key, index)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </Pressable>
          </View>
        ))}

        {array.length === 0 && (
          <Text style={styles.emptyArrayText}>
            No hay elementos. Toca "Agregar" para comenzar.
          </Text>
        )}
      </View>
    );
  };

  const renderField = (fieldConfig: BriefField) => {
    if (fieldConfig.type === 'array') {
      return renderArrayField(fieldConfig);
    } else {
      return renderTextField(fieldConfig);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Brief Editable</Text>
          <Text style={styles.subtitle}>
            Se actualiza automáticamente con las respuestas del chat
          </Text>
        </View>

      {isUpdating && (
        <View style={styles.updateIndicator}>
          <Text style={styles.updateText}>🔄 Actualizando con respuesta de IA...</Text>
        </View>
      )}

      <View style={styles.fieldsContainer}>
        {BRIEF_FIELDS.map(renderField)}
      </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💡 Tip: Usa los botones 📋 para copiar y 📥 para pegar contenido
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.7,
  },
  updateIndicator: {
    backgroundColor: '#2a2a2a',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 215, 0, 0.3)',
  },
  updateText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  fieldsContainer: {
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 28,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
  },
  required: {
    color: '#FFD700',
    opacity: 0.8,
  },
  fieldActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    backgroundColor: '#2a2a2a',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  actionButtonText: {
    fontSize: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
  },
  textArea: {
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
    minHeight: 100,
  },
  updating: {
    borderColor: '#FFD700',
    backgroundColor: '#333333',
  },
  addButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  arrayInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    borderRadius: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
    marginRight: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    backgroundColor: '#2a2a2a',
    borderRadius: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.5)',
    marginTop: 4,
  },
  removeButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyArrayText: {
    color: '#FFFFFF',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
    opacity: 0.6,
  },
  footer: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 215, 0, 0.3)',
  },
  footerText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default EditableBriefView;