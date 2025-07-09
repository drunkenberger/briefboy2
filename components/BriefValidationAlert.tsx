import React from 'react';
import { View, Text, StyleSheet, Pressable, Alert } from 'react-native';
import { validateBrief } from '../utils/briefValidation';

interface BriefValidationAlertProps {
  brief: any;
  onComplete?: (completedBrief: any) => void;
}

/**
 * Componente que muestra alertas de validación del brief
 */
const BriefValidationAlert: React.FC<BriefValidationAlertProps> = ({
  brief,
  onComplete,
}) => {
  if (!brief) return null;

  const validation = validateBrief(brief);
  
  // Si el brief es válido, no mostrar nada
  if (validation.isValid) return null;

  const handleAutoComplete = () => {
    Alert.alert(
      '🤖 Completar Automáticamente',
      'El sistema puede generar automáticamente el contenido faltante basándose en la información disponible. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Completar', 
          onPress: () => {
            import('../utils/briefValidation').then(({ completeBrief }) => {
              const completedBrief = completeBrief(brief);
              onComplete?.(completedBrief);
            });
          }
        }
      ]
    );
  };

  const handleShowDetails = () => {
    const details = [
      'Campos faltantes:',
      ...validation.missingFields.map(field => `• ${field}`),
      '',
      'Recomendaciones:',
      ...validation.warnings.map(warning => `• ${warning}`)
    ].join('\n');
    
    Alert.alert(
      '📋 Detalles de Validación',
      details,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>⚠️</Text>
        <Text style={styles.title}>Brief Incompleto</Text>
      </View>
      
      <Text style={styles.message}>
        Faltan {validation.missingFields.length} campos requeridos para completar el brief.
      </Text>
      
      <View style={styles.actions}>
        <Pressable style={styles.detailsButton} onPress={handleShowDetails}>
          <Text style={styles.detailsButtonText}>Ver Detalles</Text>
        </Pressable>
        
        {onComplete && (
          <Pressable style={styles.completeButton} onPress={handleAutoComplete}>
            <Text style={styles.completeButtonText}>Completar Auto</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffeaa7',
    borderRadius: 8,
    padding: 16,
    margin: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
  },
  message: {
    fontSize: 14,
    color: '#856404',
    marginBottom: 12,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  detailsButton: {
    flex: 1,
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default BriefValidationAlert;