import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BrutalistFooter() {
  return (
    <View style={styles.footer}>
      <View style={styles.footerContent}>
        <View style={styles.topRow}>
          <Text style={styles.footerText}>© 2025 BRIEF BOY</Text>
          <Text style={styles.footerTagline}>BRIEFS SIN BULLSHIT</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.developedText}>
            Desarrollo by <Text style={styles.wazaText}>WAZA</Text> - We are WAZA and we are coding an easier world <Text style={styles.heartEmoji}>❤️</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#000000',
    borderTopWidth: 4,
    borderTopColor: '#FFFFFF',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  footerContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  bottomRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    marginTop: 8,
  },
  footerText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footerTagline: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  developedText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 20,
  },
  wazaText: {
    color: '#FFD700',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  heartEmoji: {
    fontSize: 15,
    color: '#FFD700',
  },
});