import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, AccessibilityInfo, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ScrollingBriefTermsProps {
  rows?: number;
  reduceMotion?: boolean;
}

const ScrollingBriefTerms: React.FC<ScrollingBriefTermsProps> = ({ rows = 5, reduceMotion = false }) => {
  const [isReduceMotionEnabled, setIsReduceMotionEnabled] = useState(reduceMotion);
  // Términos típicos de briefs publicitarios (el vocabulario que odiamos)
  const briefTermsRows = [
    ['ENGAGEMENT', 'DISRUPTIVO', 'AWARENESS', 'CONVERSIÓN', 'INSIGHT', 'TARGET', 'PUNCHY', 'MEMORABLE'],
    ['STORYTELLING', 'VIRALIDAD', 'BRANDING', 'IMPACTO', 'ROI', 'CREATIVIDAD', 'SINERGIAS', 'HOLÍSTICO'],
    ['MILLENNIALS', 'CUSTOMER JOURNEY', 'PAIN POINT', 'TOUCHPOINT', 'KPI', 'BENCHMARK', 'CENTENNIALS', 'GEN Z'],
    ['CALL TO ACTION', 'BRAND EQUITY', 'TOP OF MIND', 'SHARE OF VOICE', 'ENGAGEMENT RATE', 'LOVEMARK', 'WOW FACTOR'],
    ['OMNICHANNEL', 'PERFORMANCE', 'GROWTH HACKING', 'INFLUENCER', 'CONTENIDO', 'ALCANCE', 'VIRAL', 'TRENDING'],
    ['360°', 'TRANSMEDIA', 'EXPERIENCIAL', 'MINDSHARE', 'EMPODERAR', 'NARRATIVA', 'ORGÁNICO', 'AUTÉNTICO']
  ];

  const animatedValues = useRef<Animated.Value[]>([]);

  // Check for reduced motion preference
  useEffect(() => {
    const checkReducedMotion = async () => {
      try {
        const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
        setIsReduceMotionEnabled(reduceMotion || isReduceMotionEnabled);
      } catch {
        // Fallback to prop value if API not available
        setIsReduceMotionEnabled(reduceMotion);
      }
    };

    checkReducedMotion();

    // Listen for changes in reduced motion preference
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setIsReduceMotionEnabled(reduceMotion || enabled)
    );

    return () => subscription?.remove();
  }, [reduceMotion]);

  // Initialize animated values when rows prop changes
  useEffect(() => {
    // Create new animated values array matching current rows count
    animatedValues.current = Array(rows).fill(0).map(() => new Animated.Value(0));
  }, [rows]);

  // Update animations when rows prop changes
  useEffect(() => {
    if (isReduceMotionEnabled) {
      // For reduced motion, set static positions instead of animating
      animatedValues.current.forEach((animatedValue, index) => {
        const direction = index % 2 === 0 ? -1 : 1;
        animatedValue.setValue(direction * screenWidth * 0.1); // Small static offset
      });
      return;
    }

    // Performance optimization: limit maximum concurrent animations to reduce CPU load
    const maxAnimations = Math.min(rows, 6); // Limit to 6 concurrent animations max
    const activeAnimations: Animated.CompositeAnimation[] = [];

    animatedValues.current.slice(0, maxAnimations).forEach((animatedValue, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      
      // Optimized timing configuration for better performance
      const baseSpeed = 12000; // Slightly faster base speed
      const speedVariation = index * 2000; // Reduced variation for smoother performance
      const duration = baseSpeed + speedVariation;

      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: direction * screenWidth * 3,
            duration: duration,
            useNativeDriver: Platform.OS !== 'web', // Use native driver on native platforms only
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: Platform.OS !== 'web',
          })
        ])
      );
      
      activeAnimations.push(animation);
    });

    // Stagger animation start times to reduce initial CPU load
    activeAnimations.forEach((animation, index) => {
      setTimeout(() => animation.start(), index * 150); // 150ms stagger between starts
    });

    return () => {
      // Clean up all active animations
      activeAnimations.forEach(animation => animation.stop());
    };
  }, [rows, isReduceMotionEnabled]);

  const renderScrollingRow = (terms: string[], index: number) => {
    // Performance optimization: only render rows that have animations
    const maxAnimations = Math.min(rows, 6);
    if (index >= maxAnimations && !isReduceMotionEnabled) {
      return null; // Don't render rows beyond animation limit for better performance
    }
    
    const animatedValue = animatedValues.current[index];

    // Duplicar términos para crear loop infinito (menos duplicaciones si motion reducido)
    const duplicatedTerms = isReduceMotionEnabled
      ? [...terms] // Solo una copia para motion reducido
      : [...terms, ...terms, ...terms];

    return (
      <View
        key={index}
        style={styles.rowContainer}
        accessible={false} // El contenedor padre maneja la accesibilidad
      >
        <Animated.View
          style={[
            styles.scrollingRow,
            {
              transform: [{
                translateX: animatedValue
              }]
            }
          ]}
          accessible={false}
        >
          {duplicatedTerms.map((term, termIndex) => (
            <View
              key={`${term}-${termIndex}`}
              style={styles.termContainer}
              accessible={false}
            >
              <Text
                style={[
                  styles.termText,
                  index % 2 === 0 ? styles.termTextWhite : styles.termTextYellow
                ]}
                accessible={false}
                importantForAccessibility="no"
              >
                {term}
              </Text>
              <Text
                style={styles.separator}
                accessible={false}
                importantForAccessibility="no"
              >
                •
              </Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  // Create accessibility description
  const accessibilityLabel = isReduceMotionEnabled
    ? `Términos publicitarios estáticos: ${briefTermsRows.slice(0, rows).flat().slice(0, 10).join(', ')}`
    : `Animación de términos publicitarios en movimiento: ${briefTermsRows.slice(0, rows).flat().slice(0, 10).join(', ')}`;

  return (
    <View
      style={styles.container}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={isReduceMotionEnabled
        ? "Lista de términos publicitarios comunes mostrados de forma estática"
        : "Animación decorativa de términos publicitarios en movimiento horizontal"
      }
      importantForAccessibility="yes"
    >
      {briefTermsRows.slice(0, rows).map((terms, index) =>
        renderScrollingRow(terms, index)
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    overflow: 'hidden',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  rowContainer: {
    height: 60,
    overflow: 'hidden',
    marginVertical: 4,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.2)',
  },
  scrollingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
  },
  termContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
  },
  termText: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  termTextWhite: {
    color: '#FFFFFF',
    opacity: 0.9,
    // Ensure minimum contrast ratio of 4.5:1 for accessibility
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  termTextYellow: {
    color: '#FFD700',
    // Ensure good contrast against black background
    textShadowColor: '#000000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  separator: {
    fontSize: 16,
    color: '#FFD700',
    marginHorizontal: 15,
    fontWeight: '900',
    opacity: 0.6,
  },
});

export default ScrollingBriefTerms;