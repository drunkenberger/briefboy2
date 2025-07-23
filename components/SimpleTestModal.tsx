import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { Brief } from '../utils/fileExporter';

interface SimpleTestModalProps {
  visible: boolean;
  brief: Brief | null;
  onClose: () => void;
  onBriefImproved: (brief: Brief) => void;
}

const SimpleTestModal: React.FC<SimpleTestModalProps> = ({
  visible,
  brief,
  onClose,
  onBriefImproved
}) => {
  console.log('🧪 [SimpleTestModal] Renderizando:', { visible, hasBrief: !!brief });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>📊 Test Modal - Análisis de Brief</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </Pressable>
        </View>
        
        <View style={styles.content}>
          <View style={styles.testCard}>
            <Text style={styles.testTitle}>🎯 Modal Funcionando Correctamente</Text>
            <Text style={styles.testText}>
              Si puedes ver este mensaje, el modal está funcionando.
            </Text>
            <Text style={styles.testText}>
              Brief recibido: {brief ? 'SÍ' : 'NO'}
            </Text>
            <Text style={styles.testText}>
              Campos en el brief: {brief ? Object.keys(brief).length : 0}
            </Text>
          </View>
          
          <Pressable 
            style={styles.actionButton}
            onPress={() => {
              console.log('🧪 Test: Simulando mejora de brief');
              if (brief) {
                onBriefImproved(brief);
              }
              onClose();
            }}
          >
            <Text style={styles.actionButtonText}>✅ Test: Simular Mejora</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FFD700',
  },
  title: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 0,
  },
  closeButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  testCard: {
    backgroundColor: '#111111',
    borderWidth: 3,
    borderColor: '#FFD700',
    padding: 30,
    marginBottom: 30,
    width: '100%',
  },
  testTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  testText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  actionButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  actionButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default SimpleTestModal;