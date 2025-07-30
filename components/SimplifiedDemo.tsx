import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import SimplifiedMainScreen from './SimplifiedMainScreen';

/**
 * Demo component showing the new simplified UX approach for BriefBoy
 * 
 * This demonstrates:
 * - Unified input for all content types
 * - Clear workflow progression
 * - Modern, clean design
 * - Reduced cognitive load
 * - Better performance with optimized hooks
 */
const SimplifiedDemo: React.FC = () => {
  return (
    <View style={styles.container}>
      <SimplifiedMainScreen />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SimplifiedDemo;