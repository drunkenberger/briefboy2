import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

// Términos de briefs que caerán (movido fuera del componente para optimización)
const BRIEF_TERMS = [
  'ENGAGEMENT', 'DISRUPTIVO', 'AWARENESS', 'CONVERSIÓN', 'INSIGHT', 'TARGET', 'PUNCHY', 'MEMORABLE',
  'STORYTELLING', 'VIRALIDAD', 'BRANDING', 'IMPACTO', 'ROI', 'CREATIVIDAD', 'SINERGIAS', 'HOLÍSTICO',
  'MILLENNIALS', 'CUSTOMER JOURNEY', 'PAIN POINT', 'TOUCHPOINT', 'KPI', 'BENCHMARK', 'CENTENNIALS', 'GEN Z',
  'CALL TO ACTION', 'BRAND EQUITY', 'TOP OF MIND', 'SHARE OF VOICE', 'ENGAGEMENT RATE', 'LOVEMARK', 'WOW FACTOR',
  'OMNICHANNEL', 'PERFORMANCE', 'GROWTH HACKING', 'INFLUENCER', 'CONTENIDO', 'ALCANCE', 'VIRAL', 'TRENDING',
  '360°', 'TRANSMEDIA', 'EXPERIENCIAL', 'MINDSHARE', 'EMPODERAR', 'NARRATIVA', 'ORGÁNICO', 'AUTÉNTICO',
  'SYNERGY', 'LEVERAGE', 'PARADIGM', 'DISRUPT', 'INNOVATIVE', 'AGILE', 'PIVOT', 'ECOSYSTEM',
  'SCALABLE', 'SUSTAINABLE', 'AUTHENTIC', 'PREMIUM', 'EXCLUSIVE', 'CURATED', 'BESPOKE', 'ARTISANAL',
  'JIRIBILLA'
];

interface MatrixBriefTermsProps {
  containerHeight?: number;
}

interface FallingWord {
  id: string;
  word: string;
  x: number;
  animatedY: Animated.Value;
  opacity: Animated.Value;
  speed: number;
  size: number;
  color: string;
  animation?: Animated.CompositeAnimation;
}

const MatrixBriefTerms: React.FC<MatrixBriefTermsProps> = ({ containerHeight = 400 }) => {
  const [fallingWords, setFallingWords] = useState<FallingWord[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationsRef = useRef<Set<Animated.CompositeAnimation>>(new Set());
  const createFallingWord = useCallback(() => {
    const word = BRIEF_TERMS[Math.floor(Math.random() * BRIEF_TERMS.length)];
    const size = Math.random() > 0.7 ? 18 : Math.random() > 0.4 ? 14 : 12; // Tamaños variados
    
    // Calcular ancho estimado de la palabra basado en su longitud y tamaño de fuente
    const estimatedWordWidth = word.length * (size * 0.7) + (word.length * 2); // Incluir letter-spacing
    const containerWidth = screenWidth > 500 ? 500 : screenWidth - 40; // Ancho del contenedor
    const maxX = containerWidth - estimatedWordWidth - 30; // Dejar margen de 30px
    const x = Math.random() * Math.max(maxX, 20); // Mínimo 20px del borde izquierdo
    
    const speed = 3000 + Math.random() * 4000; // Entre 3 y 7 segundos
    const color = Math.random() > 0.5 ? '#FFD700' : '#FFFFFF';
    const opacity = Math.random() * 0.3 + 0.7; // Entre 0.7 y 1.0

    const animatedY = new Animated.Value(-50);
    const animatedOpacity = new Animated.Value(0);

    const wordId = `${Date.now()}-${Math.random()}`;

    // Crear animación
    const animation = Animated.parallel([
      Animated.timing(animatedY, {
        toValue: containerHeight + 50,
        duration: speed,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.sequence([
        Animated.timing(animatedOpacity, {
          toValue: opacity,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(animatedOpacity, {
          toValue: opacity,
          duration: speed - 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(animatedOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ]),
    ]);

    const newWord: FallingWord = {
      id: wordId,
      word,
      x,
      animatedY,
      opacity: animatedOpacity,
      speed,
      size,
      color,
      animation,
    };

    // Agregar animación al set para tracking
    animationsRef.current.add(animation);

    // Iniciar animación
    animation.start((finished) => {
      // Limpiar animación del set
      animationsRef.current.delete(animation);
      
      // Eliminar palabra solo si la animación terminó completamente
      if (finished) {
        setFallingWords(prev => prev.filter(w => w.id !== wordId));
      }
    });

    return newWord;
  }, [containerHeight]);

  // useEffect para inicialización
  useEffect(() => {
    // Crear palabras iniciales (más densidad)
    const initialWords: FallingWord[] = [];
    for (let i = 0; i < 12; i++) {
      initialWords.push(createFallingWord());
    }
    setFallingWords(initialWords);

    // Crear nuevas palabras periódicamente
    const interval = setInterval(() => {
      setFallingWords(prev => {
        if (prev.length < 25) { // Máximo 25 palabras a la vez (más densidad)
          return [...prev, createFallingWord()];
        }
        return prev;
      });
    }, 300); // Nueva palabra cada 300ms (más frecuencia)

    intervalRef.current = interval;

    return () => {
      // Limpiar interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [createFallingWord]); // Depend on createFallingWord

  // useEffect para cleanup final del componente
  useEffect(() => {
    return () => {
      // Parar todas las animaciones activas al desmontar
      animationsRef.current.forEach(animation => {
        animation.stop();
      });
      animationsRef.current.clear();

      // Limpiar palabras
      setFallingWords([]);
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.matrixOverlay} />
      {fallingWords.map((word) => (
        <Animated.View
          key={word.id}
          style={[
            styles.wordContainer,
            {
              left: word.x,
              transform: [{ translateY: word.animatedY }],
              opacity: word.opacity,
            },
          ]}
        >
          <Text
            style={[
              styles.fallingWord,
              {
                fontSize: word.size,
                color: word.color,
                textShadowColor: word.color,
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: word.size > 16 ? 10 : 5,
              },
            ]}
          >
            {word.word}
          </Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
    position: 'relative',
  },
  matrixOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  wordContainer: {
    position: 'absolute',
    top: 0,
    paddingHorizontal: 5,
  },
  fallingWord: {
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontFamily: 'monospace',
  },
});

export default MatrixBriefTerms;