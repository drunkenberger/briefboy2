import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import BrutalistNavHeader from '../components/BrutalistNavHeader';
import { learningPaths, type LearningPath } from '../data/learningPaths';
import { quickResources, type QuickResource } from '../data/quickResources';
import { masterClasses, type MasterClass } from '../data/masterClasses';

export default function LearnScreen() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  // Data is now imported from separate files for better maintainability

  return (
    <View style={styles.wrapper}>
      <BrutalistNavHeader currentPage="learn" />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>LEARN</Text>
          <Text style={styles.heroSubtitle}>
            ENTRENAMIENTOS QUE NO ENSEÑAN EN LAS UNIVERSIDADES
          </Text>
          <View style={styles.yellowBar} />
          <Text style={styles.heroDescription}>
            Métodos probados en trincheras reales. Técnicas que usan las agencias top 
            pero no comparten. Conocimiento que convierte juniors en seniors.
          </Text>
        </View>

        {/* Learning Paths */}
        <View style={styles.pathsSection}>
          <Text style={styles.sectionTitle}>CAMINOS DE APRENDIZAJE</Text>
          <Text style={styles.sectionSubtitle}>
            ELIGE TU ESPECIALIZACIÓN DE COMBATE
          </Text>
          
          <View style={styles.pathsGrid}>
            {learningPaths.map((path, index) => (
              <Pressable 
                key={path.id}
                style={[
                  styles.pathCard,
                  selectedPath === path.id && styles.pathCardSelected
                ]}
                onPress={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
              >
                <View style={styles.pathHeader}>
                  <Text style={styles.pathTitle}>{path.title}</Text>
                  <Text style={styles.pathSubtitle}>{path.subtitle}</Text>
                </View>
                
                <Text style={styles.pathDescription}>{path.description}</Text>
                
                <View style={styles.pathMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>NIVEL</Text>
                    <Text style={styles.metaValue}>{path.level}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>FORMATO</Text>
                    <Text style={styles.metaValue}>{path.duration}</Text>
                  </View>
                </View>

                <View style={styles.modulesList}>
                  {path.modules.map((module, moduleIndex) => (
                    <Text key={moduleIndex} style={styles.moduleItem}>
                      • {module}
                    </Text>
                  ))}
                </View>

                {selectedPath === path.id && (
                  <View style={styles.expandedContent}>
                    <Text style={styles.contentIntro}>{path.content.intro}</Text>
                    
                    {path.content.sections.map((section, sectionIndex) => (
                      <View key={sectionIndex} style={styles.contentSection}>
                        <Text style={styles.sectionHeader}>{section.title}</Text>
                        <Text style={styles.sectionContent}>{section.content}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quick Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>RECURSOS RÁPIDOS</Text>
          <Text style={styles.sectionSubtitle}>
            HERRAMIENTAS PARA USO INMEDIATO
          </Text>
          
          <View style={styles.resourcesGrid}>
            {quickResources.map((resource, index) => (
              <View key={index} style={styles.resourceCard}>
                <View style={styles.resourceHeader}>
                  <Text style={styles.resourceType}>{resource.type}</Text>
                  <Text style={styles.resourceTime}>{resource.time}</Text>
                </View>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Master Classes */}
        <View style={styles.masterClassesSection}>
          <Text style={styles.sectionTitle}>MASTER CLASSES</Text>
          <Text style={styles.sectionSubtitle}>
            SESIONES CON LOS MEJORES DEL MUNDO
          </Text>
          
          <View style={styles.masterClassesGrid}>
            {masterClasses.map((masterClass, index) => (
              <View key={index} style={styles.masterClassCard}>
                <Text style={styles.masterClassLevel}>{masterClass.level}</Text>
                <Text style={styles.masterClassTitle}>{masterClass.title}</Text>
                <Text style={styles.masterClassSpeaker}>por {masterClass.speaker}</Text>
                <Text style={styles.masterClassDescription}>{masterClass.description}</Text>
                <Text style={styles.masterClassDuration}>{masterClass.duration}</Text>
              </View>
            ))}
          </View>
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
    paddingTop: 60,
  },
  heroTitle: {
    fontSize: 80,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: -3,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 24,
    lineHeight: 32,
  },
  yellowBar: {
    width: 150,
    height: 8,
    backgroundColor: '#FFD700',
    marginBottom: 32,
  },
  heroDescription: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    fontWeight: '500',
    opacity: 0.9,
  },

  // Paths Section
  pathsSection: {
    padding: 40,
    paddingTop: 80,
    backgroundColor: '#111111',
  },
  sectionTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -2,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 48,
    letterSpacing: 1,
  },
  pathsGrid: {
    gap: 24,
  },
  pathCard: {
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 32,
  },
  pathCardSelected: {
    borderColor: '#FFD700',
  },
  pathHeader: {
    marginBottom: 16,
  },
  pathTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: -1,
  },
  pathSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    opacity: 0.8,
  },
  pathDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.9,
  },
  pathMeta: {
    flexDirection: 'row',
    gap: 32,
    marginBottom: 24,
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: 1,
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  modulesList: {
    gap: 8,
  },
  moduleItem: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    opacity: 0.8,
  },
  expandedContent: {
    marginTop: 32,
    paddingTop: 32,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  contentIntro: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 32,
    fontStyle: 'italic',
    opacity: 0.9,
  },
  contentSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 16,
    letterSpacing: 1,
  },
  sectionContent: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    opacity: 0.9,
  },

  // Resources Section
  resourcesSection: {
    padding: 40,
    paddingTop: 80,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  resourceCard: {
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 24,
    flex: 1,
    minWidth: 280,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  resourceType: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
  },
  resourceTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.7,
  },
  resourceTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    opacity: 0.8,
  },

  // Master Classes Section
  masterClassesSection: {
    padding: 40,
    paddingTop: 80,
    backgroundColor: '#111111',
  },
  masterClassesGrid: {
    gap: 24,
  },
  masterClassCard: {
    backgroundColor: '#000000',
    borderWidth: 4,
    borderColor: '#FFFFFF',
    padding: 32,
  },
  masterClassLevel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  masterClassTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  masterClassSpeaker: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  masterClassDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 16,
    opacity: 0.9,
  },
  masterClassDuration: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    opacity: 0.7,
  },
});