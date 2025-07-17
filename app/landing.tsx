import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions, Image, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import BrutalistFocusText from '../components/BrutalistFocusText';
import BrutalistNavHeader from '../components/BrutalistNavHeader';
import MatrixBriefTerms from '../components/MatrixBriefTerms';
import ElevenLabsDirectWidget from '../components/ElevenLabsDirectWidget';
import ZohoSalesIQWidget from '../components/ZohoSalesIQWidget';
import { InstagramIcon, LinkedInIcon, TwitterIcon, YouTubeIcon } from '../components/SocialIcons';

const { width } = Dimensions.get('window');

export default function LandingPage() {
  const router = useRouter();

  const navigateToApp = () => {
    router.push('/(tabs)');
  };

  const openSocialMedia = (platform: string) => {
    const urls: { [key: string]: string } = {
      instagram: 'https://instagram.com/briefboy',
      linkedin: 'https://linkedin.com/company/briefboy',
      twitter: 'https://twitter.com/briefboy_ai',
      youtube: 'https://youtube.com/@BriefBoyChannel'
    };

    const url = urls[platform];
    if (url) {
      Linking.openURL(url).catch(err => 
        console.error('Error opening URL:', err)
      );
    }
  };

  return (
    <View style={styles.wrapper}>
      <BrutalistNavHeader currentPage="home" />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroContainer}>
            <View style={styles.heroContent}>
              <View style={styles.heroLeft}>
                <BrutalistFocusText 
                  sentence="BRIEF BOY"
                  style={styles.heroTitleContainer}
                  animationDuration={1.2}
                  pauseBetweenAnimations={2}
                  activeColor="#FFFFFF"
                  inactiveColor="rgba(255, 255, 255, 0.4)"
                  borderColor="#FFD700"
                />
                <View style={styles.yellowBar} />
                <Text style={styles.heroSubtitle}>
                  GENERA BRIEFS PUBLICITARIOS PROFESIONALES EN SEGUNDOS. 
                  SIN RODEOS. SIN COMPLICACIONES.
                </Text>
                <Pressable style={styles.ctaButton} onPress={navigateToApp}>
                  <Text style={styles.ctaButtonText}>CREAR BRIEF AHORA</Text>
                </Pressable>
              </View>
              <View style={styles.heroRight}>
                <View style={styles.heroAnimationWrapper}>
                  <View style={styles.heroAnimationContainer}>
                    <MatrixBriefTerms containerHeight={400} />
                  </View>
                  <Text style={styles.animationSubtitle}>STOP THE BULLSHIT</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Problem Section */}
        <View style={styles.problemSection}>
          <View style={styles.sectionContainer}>
            <Text style={styles.problemTitle}>¿CANSADO DE BRIEFS MEDIOCRES?</Text>
            <View style={styles.problemGrid}>
              <View style={styles.problemCard}>
                <Text style={styles.problemIcon}>😤</Text>
                <Text style={styles.problemText}>Horas perdidas estructurando información</Text>
              </View>
              <View style={styles.problemCard}>
                <Text style={styles.problemIcon}>📝</Text>
                <Text style={styles.problemText}>Briefs inconsistentes y poco profesionales</Text>
              </View>
              <View style={styles.problemCard}>
                <Text style={styles.problemIcon}>⏰</Text>
                <Text style={styles.problemText}>Deadlines perdidos por procesos lentos</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Solution Section */}
        <View style={styles.solutionSection}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>LA SOLUCIÓN</Text>
            <Text style={styles.sectionSubtitle}>
              TODO LO QUE NECESITAS PARA CREAR BRIEFS DE CLASE MUNDIAL
            </Text>
            <View style={styles.benefitsGrid}>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitIconText}>⚡</Text>
                </View>
                <Text style={styles.benefitTitle}>VELOCIDAD BRUTAL</Text>
                <Text style={styles.benefitText}>
                  De grabación de voz a brief profesional en menos de 60 segundos.
                </Text>
                <View style={styles.yellowAccent} />
              </View>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitIconText}>🧠</Text>
                </View>
                <Text style={styles.benefitTitle}>IA AVANZADA</Text>
                <Text style={styles.benefitText}>
                  GPT-4o analiza y estructura tu información automáticamente.
                </Text>
                <View style={styles.yellowAccent} />
              </View>
              <View style={styles.benefitCard}>
                <View style={styles.benefitIcon}>
                  <Text style={styles.benefitIconText}>📄</Text>
                </View>
                <Text style={styles.benefitTitle}>FORMATO PRO</Text>
                <Text style={styles.benefitText}>
                  Exporta en TXT, MD, HTML o JSON. Listo para presentar.
                </Text>
                <View style={styles.yellowAccent} />
              </View>
            </View>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.howItWorksSection}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>CÓMO FUNCIONA</Text>
            <Text style={styles.sectionSubtitle}>
              CUATRO PASOS PARA EL BRIEF PERFECTO
            </Text>
            <View style={styles.stepsContainer}>
              <View style={styles.stepRow}>
                <View style={styles.step}>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepNumber}>01</Text>
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepTitle}>GRABA TU IDEA</Text>
                      <Text style={styles.stepText}>
                        Habla libremente sobre tu proyecto publicitario
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepNumber}>02</Text>
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepTitle}>IA PROCESA</Text>
                      <Text style={styles.stepText}>
                        Whisper + GPT-4o estructuran tu brief profesionalmente
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.stepRow}>
                <View style={styles.step}>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepNumber}>03</Text>
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepTitle}>JUNTO CON LA IA MEJORAS</Text>
                      <Text style={styles.stepText}>
                        Chat inteligente te ayuda a perfeccionar cada sección
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepNumber}>04</Text>
                    <View style={styles.stepInfo}>
                      <Text style={styles.stepTitle}>EXPORTA Y PRESENTA</Text>
                      <Text style={styles.stepText}>
                        Descarga en múltiples formatos y comparte con tu equipo
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>


        {/* Social Proof */}
        <View style={styles.testimonialsSection}>
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>TESTIMONIOS</Text>
            <Text style={styles.sectionSubtitle}>
              LO QUE DICEN NUESTROS USUARIOS
            </Text>
            <View style={styles.testimonialsGrid}>
              <View style={styles.testimonialCard}>
                <Text style={styles.testimonialText}>
                  "BRIEF BOY cambió completamente mi flujo de trabajo. 
                  Lo que antes tomaba horas ahora lo hago en minutos."
                </Text>
                <Text style={styles.testimonialAuthor}>— CARLOS M., DIRECTOR CREATIVO</Text>
              </View>
              <View style={styles.testimonialCard}>
                <Text style={styles.testimonialText}>
                  "La calidad de los briefs es impresionante. 
                  Mis clientes quedaron sorprendidos con el nivel de detalle."
                </Text>
                <Text style={styles.testimonialAuthor}>— MARÍA L., ACCOUNT MANAGER</Text>
              </View>
              <View style={styles.testimonialCard}>
                <Text style={styles.testimonialText}>
                  "Es como tener un estratega senior disponible 24/7. 
                  Indispensable para agencias modernas."
                </Text>
                <Text style={styles.testimonialAuthor}>— JUAN P., CEO AGENCIA DIGITAL</Text>
              </View>
            </View>
          </View>
        </View>


        {/* Final CTA */}
        <View style={styles.finalCTA}>
          <View style={styles.finalCTAContainer}>
            <Text style={styles.finalCTATitle}>
              DEJA DE PERDER TIEMPO{'\n'}EMPIEZA A CREAR
            </Text>
            <Text style={styles.finalCTASubtitle}>
              Únete a miles de profesionales que ya están creando briefs más rápido
            </Text>
            <Pressable style={styles.finalCTAButton} onPress={navigateToApp}>
              <Text style={styles.finalCTAButtonText}>USAR BRIEF BOY GRATIS</Text>
            </Pressable>
            <Text style={styles.finalCTANote}>
              Sin tarjeta de crédito • Sin instalación • Empieza en 30 segundos
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerText}>© 2024 BRIEF BOY</Text>
            <Text style={styles.footerTagline}>BRIEFS SIN BULLSHIT</Text>
          </View>
          
          <View style={styles.footerSocials}>
            <Pressable 
              style={({ pressed }) => [
                styles.socialIcon,
                pressed && styles.socialIconPressed
              ]}
              onPress={() => openSocialMedia('instagram')}
            >
              <InstagramIcon size={20} color="#FFFFFF" />
            </Pressable>
            
            <Pressable 
              style={({ pressed }) => [
                styles.socialIcon,
                pressed && styles.socialIconPressed
              ]}
              onPress={() => openSocialMedia('linkedin')}
            >
              <LinkedInIcon size={20} color="#FFFFFF" />
            </Pressable>
            
            <Pressable 
              style={({ pressed }) => [
                styles.socialIcon,
                pressed && styles.socialIconPressed
              ]}
              onPress={() => openSocialMedia('twitter')}
            >
              <TwitterIcon size={20} color="#FFFFFF" />
            </Pressable>
            
            <Pressable 
              style={({ pressed }) => [
                styles.socialIcon,
                pressed && styles.socialIconPressed
              ]}
              onPress={() => openSocialMedia('youtube')}
            >
              <YouTubeIcon size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Voice Assistant Widget */}
      <View style={styles.floatingWidgetContainer}>
        <ElevenLabsDirectWidget agentId="agent_01jzzt3hd7ffqrttr04n9kwn6t" />
      </View>
      
      {/* Zoho SalesIQ Support Widget */}
      <ZohoSalesIQWidget widgetCode="siqcac6ccaff06943ac0b9dc85c19f146c8382faef57bf5a58fb3189ff00dca96ab" />
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
  
  // Contenedores principales
  sectionContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  
  // Hero Section
  hero: {
    minHeight: 700,
    paddingVertical: 60,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
    justifyContent: 'center',
  },
  heroContainer: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  heroContent: {
    flexDirection: width > 768 ? 'row' : 'column',
    alignItems: 'center',
    gap: 40,
  },
  heroLeft: {
    flex: width > 768 ? 1 : 0,
    width: width > 768 ? 'auto' : '100%',
    alignItems: width > 768 ? 'flex-start' : 'center',
  },
  heroRight: {
    flex: width > 768 ? 1 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: width > 768 ? 'auto' : '100%',
  },
  heroTitleContainer: {
    marginBottom: 30,
    alignSelf: width > 768 ? 'flex-start' : 'center',
  },
  yellowBar: {
    width: width > 768 ? 200 : '100%',
    height: 8,
    backgroundColor: '#FFD700',
    marginBottom: 30,
  },
  heroSubtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 40,
    fontWeight: '500',
    textAlign: width > 768 ? 'left' : 'center',
    maxWidth: 500,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    paddingHorizontal: 48,
    alignSelf: width > 768 ? 'flex-start' : 'center',
    borderWidth: 4,
    borderColor: '#FFD700',
  },
  ctaButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  heroAnimationWrapper: {
    alignItems: 'center',
  },
  heroAnimationContainer: {
    width: Math.min(500, width > 768 ? (width - 60) / 2 : width - 40),
    height: 400,
    borderWidth: 4,
    borderColor: '#FFD700',
    overflow: 'hidden',
    backgroundColor: '#000000',
    position: 'relative',
  },
  animationSubtitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    marginTop: 16,
    textTransform: 'uppercase',
  },

  // Problem Section
  problemSection: {
    paddingVertical: 80,
    backgroundColor: '#111111',
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  problemTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 60,
    letterSpacing: -2,
  },
  problemGrid: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 30,
    justifyContent: 'center',
  },
  problemCard: {
    flex: width > 768 ? 1 : 0,
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 30,
    alignItems: 'center',
    maxWidth: width > 768 ? 350 : '100%',
  },
  problemIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  problemText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: '600',
  },

  // Solution Section
  solutionSection: {
    paddingVertical: 80,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: -2,
  },
  sectionSubtitle: {
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 60,
    fontWeight: '500',
    opacity: 0.8,
  },
  benefitsGrid: {
    flexDirection: width > 1024 ? 'row' : 'column',
    gap: 30,
    justifyContent: 'center',
  },
  benefitCard: {
    flex: width > 1024 ? 1 : 0,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 40,
    backgroundColor: '#000000',
    alignItems: 'center',
    maxWidth: width > 1024 ? 350 : '100%',
  },
  benefitIcon: {
    width: 80,
    height: 80,
    borderWidth: 4,
    borderColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },
  benefitIconText: {
    fontSize: 40,
  },
  benefitTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 25,
    textAlign: 'center',
  },
  yellowAccent: {
    width: 60,
    height: 4,
    backgroundColor: '#FFD700',
  },

  // How It Works
  howItWorksSection: {
    paddingVertical: 80,
    backgroundColor: '#111111',
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  stepsContainer: {
    gap: 20,
  },
  stepRow: {
    flexDirection: width > 768 ? 'row' : 'column',
    gap: 20,
  },
  step: {
    flex: 1,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#000000',
  },
  stepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 30,
    gap: 20,
  },
  stepNumber: {
    fontSize: 64,
    fontWeight: '900',
    color: '#FFD700',
    minWidth: 100,
    textAlign: 'center',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 10,
    letterSpacing: 1,
  },
  stepText: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    opacity: 0.9,
  },

  // Testimonials
  testimonialsSection: {
    paddingVertical: 80,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  testimonialsGrid: {
    gap: 30,
  },
  testimonialCard: {
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 40,
    backgroundColor: '#000000',
    maxWidth: 800,
    alignSelf: 'center',
  },
  testimonialText: {
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 32,
    marginBottom: 25,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  testimonialAuthor: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },



  // Final CTA
  finalCTA: {
    paddingVertical: 100,
    borderBottomWidth: 4,
    borderBottomColor: '#FFFFFF',
  },
  finalCTAContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  finalCTATitle: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 25,
    letterSpacing: -2,
    lineHeight: 60,
  },
  finalCTASubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 50,
    opacity: 0.8,
    lineHeight: 28,
  },
  finalCTAButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 30,
    paddingHorizontal: 60,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    marginBottom: 25,
  },
  finalCTAButtonText: {
    color: '#000000',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  finalCTANote: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.7,
  },

  // Footer
  footer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
    marginTop: 60,
  },
  footerLeft: {
    flexDirection: 'column',
    gap: 4,
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
  footerSocials: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  socialIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialIconPressed: {
    backgroundColor: '#FFD700',
    borderColor: '#FFD700',
  },
  socialIconText: {
    fontSize: 20,
  },

  // Floating Widget
  floatingWidgetContainer: {
    position: 'fixed',
    bottom: 30,
    left: 30,
    width: 100,
    height: 100,
    zIndex: 9999,
    elevation: 10,
  },
});