import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

type WorkflowStep = 'input' | 'transcribing' | 'generating' | 'reviewing' | 'improving';

interface BriefWorkflowProgressProps {
  currentStep: WorkflowStep;
  isFromFile?: boolean;
}

const steps = [
  { key: 'input', label: 'Entrada', icon: '📝' },
  { key: 'transcribing', label: 'Transcribiendo', icon: '🎧' },
  { key: 'generating', label: 'Generando', icon: '✨' },
  { key: 'reviewing', label: 'Revisando', icon: '👀' },
  { key: 'improving', label: 'Mejorando', icon: '🚀' },
];

const BriefWorkflowProgress: React.FC<BriefWorkflowProgressProps> = ({ 
  currentStep,
  isFromFile = false 
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const stepIndex = steps.findIndex(s => s.key === currentStep);
    const progress = (stepIndex / (steps.length - 1)) * 100;

    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 500,
      useNativeDriver: false,
    }).start();

    // Pulse animation for current step
    if (currentStep !== 'reviewing' && currentStep !== 'input') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [currentStep, progressAnim, pulseAnim]);

  const getStepMessage = () => {
    switch (currentStep) {
      case 'input':
        return 'Esperando tu contenido...';
      case 'transcribing':
        return isFromFile ? 'Procesando archivo...' : 'Transcribiendo audio con Whisper AI...';
      case 'generating':
        return 'Generando brief profesional con GPT-4...';
      case 'reviewing':
        return 'Brief generado exitosamente';
      case 'improving':
        return 'Optimizando brief con IA avanzada...';
      default:
        return '';
    }
  };

  const displaySteps = steps.filter(step => {
    // Skip transcribing step if it's from text input
    if (step.key === 'transcribing' && isFromFile === false && currentStep === 'generating') {
      return false;
    }
    return true;
  });

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={styles.progressTrack}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
        
        <View style={styles.stepsContainer}>
          {displaySteps.map((step, index) => {
            const isActive = step.key === currentStep;
            const isPast = steps.findIndex(s => s.key === step.key) < steps.findIndex(s => s.key === currentStep);
            
            return (
              <Animated.View
                key={step.key}
                style={[
                  styles.step,
                  isActive && { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <View style={[
                  styles.stepCircle,
                  isActive && styles.stepCircleActive,
                  isPast && styles.stepCirclePast,
                ]}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                </View>
                <Text style={[
                  styles.stepLabel,
                  isActive && styles.stepLabelActive,
                  isPast && styles.stepLabelPast,
                ]}>
                  {step.label}
                </Text>
              </Animated.View>
            );
          })}
        </View>
      </View>
      
      <Text style={styles.message}>{getStepMessage()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressTrack: {
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 2,
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepCircleActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  stepCirclePast: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  stepIcon: {
    fontSize: 20,
  },
  stepLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
    textAlign: 'center',
  },
  stepLabelActive: {
    color: '#10B981',
    fontWeight: '700',
  },
  stepLabelPast: {
    color: '#111827',
  },
  message: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    fontWeight: '600',
  },
});

export default BriefWorkflowProgress;