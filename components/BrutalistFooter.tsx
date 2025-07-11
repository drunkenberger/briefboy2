import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BrutalistFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <Text style={styles.footerText}>© 2024 BRIEF BOY</Text>
        <Text style={styles.footerTagline}>BRIEFS SIN BULLSHIT</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#000000',
    borderTopWidth: 4,
    borderTopColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  footerTagline: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});