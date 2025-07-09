import React, { useEffect } from 'react';
import { Button, Modal, StyleSheet, Text, View } from 'react-native';
import { useChatWithAI } from '../hooks/useChatWithAI';

interface ChatImprovementModalProps {
  visible: boolean;
  brief: any;
  onClose: () => void;
  onBriefImproved: (brief: any) => void;
  onIaSuggestions: (suggestions: string | null) => void;
}

const ChatImprovementModal: React.FC<ChatImprovementModalProps> = ({ visible, brief, onClose, onBriefImproved, onIaSuggestions }) => {
  const { messages, userInput, setUserInput, sendMessage, loading, improvedBrief, iaSuggestions } = useChatWithAI(brief);

  // Llama a onIaSuggestions cada vez que cambian las sugerencias
  useEffect(() => {
    onIaSuggestions(iaSuggestions || null);
  }, [iaSuggestions, onIaSuggestions]);

  const handleGenerate = () => {
    if (improvedBrief) {
      onBriefImproved(improvedBrief);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Mejora tu Brief</Text>
          <View style={styles.chatContainer}>
            {messages.map((msg, idx) => (
              <View key={idx} style={[styles.message, msg.role === 'user' ? styles.userMsg : styles.aiMsg]}>
                <Text style={styles.msgRole}>{msg.role === 'user' ? 'Tú' : 'IA'}:</Text>
                <Text>{msg.content}</Text>
              </View>
            ))}
          </View>
          <View style={styles.inputRow}>
            <input
              style={styles.input as any}
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
              disabled={loading}
              placeholder="Escribe tu respuesta..."
            />
            <Button title="Enviar" onPress={sendMessage} disabled={loading || !userInput} color="#1976d2" />
          </View>
          <Button title="Generar" onPress={handleGenerate} disabled={!improvedBrief} color="#388e3c" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1976d2',
    textAlign: 'center',
  },
  chatContainer: {
    flexGrow: 1,
    minHeight: 180,
    marginBottom: 12,
  },
  message: {
    marginBottom: 8,
    padding: 8,
    borderRadius: 6,
  },
  userMsg: {
    backgroundColor: '#e3f2fd',
    alignSelf: 'flex-end',
  },
  aiMsg: {
    backgroundColor: '#f1f8e9',
    alignSelf: 'flex-start',
  },
  msgRole: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginRight: 8,
  },
});

export default ChatImprovementModal;