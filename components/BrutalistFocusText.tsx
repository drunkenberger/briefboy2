import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

interface BrutalistFocusTextProps {
  sentence?: string;
  style?: any;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  blurAmount?: number;
  activeColor?: string;
  inactiveColor?: string;
  borderColor?: string;
}

const BrutalistFocusText: React.FC<BrutalistFocusTextProps> = ({
  sentence = "BRIEF BOY",
  style,
  animationDuration = 1,
  pauseBetweenAnimations = 1.5,
  activeColor = '#FFFFFF',
  inactiveColor = 'rgba(255, 255, 255, 0.3)',
  borderColor = '#FFD700',
}) => {
  const words = sentence.split(' ');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [wordLayouts, setWordLayouts] = useState<any[]>([]);
  const focusAnimation = useRef(new Animated.Value(0)).current;
  const opacityAnimations = useRef(words.map(() => new Animated.Value(0.3))).current;

  // Auto-cycle through words
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, (animationDuration + pauseBetweenAnimations) * 1000);

    return () => clearInterval(interval);
  }, [animationDuration, pauseBetweenAnimations, words.length]);

  // Animate opacity when currentIndex changes
  useEffect(() => {
    opacityAnimations.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: index === currentIndex ? 1 : 0.3,
        duration: animationDuration * 600,
        useNativeDriver: true,
      }).start();
    });

    // Animate focus frame with a subtle glow effect
    Animated.sequence([
      Animated.timing(focusAnimation, {
        toValue: 0.5,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(focusAnimation, {
        toValue: 1,
        duration: animationDuration * 400,
        useNativeDriver: false,
      }),
    ]).start();
  }, [currentIndex, animationDuration]);

  const handleLayout = (index: number, event: any) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    setWordLayouts(prev => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, y, width, height };
      return newLayouts;
    });
  };

  const getCurrentWordLayout = () => {
    return wordLayouts[currentIndex] || { x: 0, y: 0, width: 100, height: 70 };
  };

  const currentLayout = getCurrentWordLayout();
  const focusFrameStyle = {
    left: currentLayout.x - 8,
    top: currentLayout.y - 8,
    width: currentLayout.width + 16,
    height: currentLayout.height + 16,
    opacity: focusAnimation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.6, 1],
    }),
    transform: [{
      scale: focusAnimation.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [0.9, 1.05, 1],
      })
    }],
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.textContainer}>
        {words.map((word, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.word,
              {
                opacity: opacityAnimations[index],
                color: index === currentIndex ? activeColor : inactiveColor,
              },
            ]}
            onLayout={(event) => handleLayout(index, event)}
          >
            {word}
            {index < words.length - 1 && ' '}
          </Animated.Text>
        ))}
      </View>
      
      {wordLayouts.length > 0 && currentIndex >= 0 && (
        <Animated.View style={[styles.focusFrame, focusFrameStyle, { borderColor }]}>
          {/* Corner elements for brutalist effect */}
          <View style={[styles.corner, styles.topLeft, { borderColor }]} />
          <View style={[styles.corner, styles.topRight, { borderColor }]} />
          <View style={[styles.corner, styles.bottomLeft, { borderColor }]} />
          <View style={[styles.corner, styles.bottomRight, { borderColor }]} />
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    fontSize: 72,
    fontWeight: '900',
    letterSpacing: -4,
    lineHeight: 70,
  },
  focusFrame: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: 0,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderWidth: 3,
    borderRadius: 0,
  },
  topLeft: {
    top: -3,
    left: -3,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -3,
    right: -3,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -3,
    left: -3,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -3,
    right: -3,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
});

export default BrutalistFocusText;