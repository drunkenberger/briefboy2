import React from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import BrutalistNavHeader from '../components/BrutalistNavHeader';

// Import custom emoji
const lightningBoltEmoji = require('../assets/emoji/Lightning_Bolt_Emoji.png');

export default function AboutScreen() {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <BrutalistNavHeader currentPage="about" />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Anti-Statement */}
        <View style={styles.heroSection}>
          <Text style={styles.antiTitle}>ESTAMOS HARTOS</Text>
          <Text style={styles.heroSubtitle}>
            DE LA MALA PUBLICIDAD QUE CONTAMINA EL MUNDO
          </Text>
          <View style={styles.yellowBar} />
        </View>

        {/* Problem Statement */}
        <View style={styles.problemSection}>
          <Text style={styles.problemNumber}>01</Text>
          <View style={styles.problemContent}>
            <Text style={styles.problemTitle}>EL PROBLEMA</Text>
            <Text style={styles.problemText}>
              Hemos visto <Text style={styles.highlight}>CIENTOS DE BRIEFS</Text> pasar por nuestras manos.
              Campañas ridículas. Presupuestos desperdiciados. 
              Mensajes vacíos que insultan la inteligencia del consumidor.
            </Text>
            <Text style={styles.problemConclusion}>
              <Text style={styles.highlight}>LAS MALAS CAMPAÑAS NACEN CON UN MAL BRIEF.</Text>
            </Text>
          </View>
        </View>

        {/* Who We Are */}
        <View style={styles.teamSection}>
          <Text style={styles.teamNumber}>02</Text>
          <View style={styles.teamContent}>
            <Text style={styles.teamTitle}>QUIÉNES SOMOS</Text>
            <Text style={styles.teamText}>
              Un equipo multidisciplinario con background en:
            </Text>
            <View style={styles.skillsGrid}>
              <View style={styles.skillItem}>
                <Text style={styles.skillEmoji}>📢</Text>
                <Text style={styles.skillText}>PUBLICIDAD</Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillEmoji}>🎬</Text>
                <Text style={styles.skillText}>ENTRETENIMIENTO</Text>
              </View>
              <View style={styles.skillItem}>
                <Text style={styles.skillEmoji}>💻</Text>
                <Text style={styles.skillText}>DESARROLLO</Text>
              </View>
              <View style={styles.skillItem}>
                <Image source={lightningBoltEmoji} style={styles.skillEmojiImage} />
                <Text style={styles.skillText}>PRODUCTO</Text>
              </View>
            </View>
            <Text style={styles.teamConclusion}>
              Profesionales <Text style={styles.highlight}>CANSADOS DE DECEPCIONARNOS</Text> con el estado actual de la industria.
            </Text>
          </View>
        </View>

        {/* Solution */}
        <View style={styles.solutionSection}>
          <Text style={styles.solutionNumber}>03</Text>
          <View style={styles.solutionContent}>
            <Text style={styles.solutionTitle}>NUESTRA SOLUCIÓN</Text>
            <Text style={styles.solutionSubtitle}>BRIEF BOY</Text>
            <Text style={styles.solutionText}>
              Una herramienta que ayuda a <Text style={styles.highlight}>PREVENIR LA MALA PUBLICIDAD</Text> desde el origen.
            </Text>
            <Text style={styles.solutionText}>
              Asistimos a agencias, ejecutivos de marketing y equipos creativos 
              a generar briefs sólidos que den nacimiento a 
              <Text style={styles.highlight}> CAMPAÑAS QUE NO DEN VERGÜENZA AJENA.</Text>
            </Text>
          </View>
        </View>

        {/* Mission Statement */}
        <View style={styles.missionSection}>
          <View style={styles.missionBox}>
            <Image source={lightningBoltEmoji} style={styles.missionIconImage} />
            <Text style={styles.missionTitle}>NUESTRA MISIÓN</Text>
            <Text style={styles.missionText}>
              COMBATIR LAS MALAS CAMPAÑAS{'\n'}
              UN BRIEF A LA VEZ
            </Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.statsTitle}>DATOS QUE NOS MOTIVAN</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>73%</Text>
              <Text style={styles.statLabel}>DE CAMPAÑAS FALLAN POR BRIEFS VAGOS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>∞</Text>
              <Text style={styles.statLabel}>PRESUPUESTOS DESPERDICIADOS ANUALMENTE</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>0</Text>
              <Text style={styles.statLabel}>TOLERANCIA A LA MEDIOCRIDAD</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            ¿LISTO PARA CREAR{'\n'}BRIEFS QUE NO DEN PENA?
          </Text>
          <Pressable 
            style={styles.ctaButton} 
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.ctaButtonText}>EMPEZAR AHORA</Text>
          </Pressable>
          <Text style={styles.ctaSubtext}>
            Y ayúdanos a hacer que la publicidad sea menos horrible
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            BRIEF BOY - MEDICINA CONTRA LA MALA PUBLICIDAD
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    padding: 40,
    alignItems: 'center',
    paddingTop: 60,
  },
  antiTitle: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: -3,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 60,
  },
  heroSubtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 28,
    marginBottom: 24,
  },
  yellowBar: {
    width: 200,
    height: 8,
    backgroundColor: '#FFD700',
  },

  // Problem Section
  problemSection: {
    flexDirection: 'row',
    padding: 40,
    paddingTop: 60,
    gap: 24,
  },
  problemNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFD700',
    opacity: 0.3,
    lineHeight: 100,
    minWidth: 80,
  },
  problemContent: {
    flex: 1,
  },
  problemTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -1,
  },
  problemText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 24,
    fontWeight: '500',
  },
  problemConclusion: {
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 32,
    fontWeight: '700',
  },
  highlight: {
    color: '#FFD700',
    fontWeight: '900',
  },

  // Team Section
  teamSection: {
    flexDirection: 'row',
    padding: 40,
    paddingTop: 80,
    gap: 24,
    backgroundColor: '#111111',
  },
  teamNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFD700',
    opacity: 0.3,
    lineHeight: 100,
    minWidth: 80,
  },
  teamContent: {
    flex: 1,
  },
  teamTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 20,
    letterSpacing: -1,
  },
  teamText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 32,
    fontWeight: '500',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  skillItem: {
    backgroundColor: '#000000',
    padding: 16,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  skillEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  skillEmojiImage: {
    width: 32,
    height: 32,
    marginBottom: 8,
    resizeMode: 'contain',
  },
  skillText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  teamConclusion: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    fontWeight: '700',
  },

  // Solution Section
  solutionSection: {
    flexDirection: 'row',
    padding: 40,
    paddingTop: 80,
    gap: 24,
  },
  solutionNumber: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFD700',
    opacity: 0.3,
    lineHeight: 100,
    minWidth: 80,
  },
  solutionContent: {
    flex: 1,
  },
  solutionTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  solutionSubtitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 24,
    letterSpacing: -2,
  },
  solutionText: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 20,
    fontWeight: '500',
  },

  // Mission Section
  missionSection: {
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
  },
  missionBox: {
    backgroundColor: '#FFD700',
    padding: 48,
    alignItems: 'center',
    maxWidth: 400,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  missionIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  missionIconImage: {
    width: 64,
    height: 64,
    marginBottom: 16,
    resizeMode: 'contain',
  },
  missionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000000',
    marginBottom: 16,
    letterSpacing: 1,
  },
  missionText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 28,
  },

  // Stats Section
  statsSection: {
    padding: 40,
    paddingTop: 80,
    backgroundColor: '#111111',
  },
  statsTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: -1,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 120,
  },
  statNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 12,
    letterSpacing: -2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
    lineHeight: 16,
  },

  // CTA Section
  ctaSection: {
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -1,
    lineHeight: 44,
  },
  ctaButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 24,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  ctaButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  ctaSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
    opacity: 0.8,
  },

  // Footer
  footer: {
    padding: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
    textAlign: 'center',
  },
});