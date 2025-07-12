import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

interface ScrollingBriefTermsProps {
  rows?: number;
}

const ScrollingBriefTerms: React.FC<ScrollingBriefTermsProps> = ({ rows = 5 }) => {
  // Términos típicos de briefs publicitarios (el vocabulario que odiamos)
  const briefTermsRows = [
    ['ENGAGEMENT', 'DISRUPTIVO', 'AWARENESS', 'CONVERSIÓN', 'INSIGHT', 'TARGET', 'PUNCHY', 'MEMORABLE'],
    ['STORYTELLING', 'VIRALIDAD', 'BRANDING', 'IMPACTO', 'ROI', 'CREATIVIDAD', 'SINERGIAS', 'HOLÍSTICO'],
    ['MILLENNIALS', 'CUSTOMER JOURNEY', 'PAIN POINT', 'TOUCHPOINT', 'KPI', 'BENCHMARK', 'CENTENNIALS', 'GEN Z'],
    ['CALL TO ACTION', 'BRAND EQUITY', 'TOP OF MIND', 'SHARE OF VOICE', 'ENGAGEMENT RATE', 'LOVEMARK', 'WOW FACTOR'],
    ['OMNICHANNEL', 'PERFORMANCE', 'GROWTH HACKING', 'INFLUENCER', 'CONTENIDO', 'ALCANCE', 'VIRAL', 'TRENDING'],
    ['360°', 'TRANSMEDIA', 'EXPERIENCIAL', 'MINDSHARE', 'EMPODERAR', 'NARRATIVA', 'ORGÁNICO', 'AUTÉNTICO']
  ];

  const animatedValues = useRef(
    Array(rows).fill(0).map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    const animations = animatedValues.map((animatedValue, index) => {
      const direction = index % 2 === 0 ? -1 : 1;
      const baseSpeed = 15000;
      const speedVariation = index * 3000;
      const duration = baseSpeed + speedVariation;

      return Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: direction * screenWidth * 3,
            duration: duration,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          })
        ])
      );
    });

    animations.forEach(animation => animation.start());

    return () => {
      animations.forEach(animation => animation.stop());
    };
  }, []);

  const renderScrollingRow = (terms: string[], index: number) => {
    const animatedValue = animatedValues[index];
    
    // Duplicar términos para crear loop infinito
    const duplicatedTerms = [...terms, ...terms, ...terms];
    
    return (
      <View key={index} style={styles.rowContainer}>
        <Animated.View
          style={[
            styles.scrollingRow,
            {
              transform: [{
                translateX: animatedValue
              }]
            }
          ]}
        >
          {duplicatedTerms.map((term, termIndex) => (
            <View key={`${term}-${termIndex}`} style={styles.termContainer}>
              <Text style={[
                styles.termText,
                index % 2 === 0 ? styles.termTextWhite : styles.termTextYellow
              ]}>
                {term}
              </Text>
              <Text style={styles.separator}>•</Text>
            </View>
          ))}
        </Animated.View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
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
  },
  termTextYellow: {
    color: '#FFD700',
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