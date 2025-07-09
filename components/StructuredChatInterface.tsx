import React, { useState, useRef, useEffect } from 'react';
import { 
  FlatList, 
  Pressable, 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  Keyboard,
  Alert,
  Clipboard
} from 'react-native';
import { ChatMessage, StructuredQuestion } from '../hooks/useStructuredChat';

interface StructuredChatInterfaceProps {
  messages: ChatMessage[];
  currentQuestion: StructuredQuestion | null;
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  isConnected: boolean;
  error: string | null;
  progress: { current: number; total: number };
}

/**
 * Interfaz de chat estructurada con preguntas una por una
 */
const StructuredChatInterface: React.FC<StructuredChatInterfaceProps> = ({
  messages,
  currentQuestion,
  isTyping,
  sendMessage,
  isConnected,
  error,
  progress,
}) => {
  const [inputText, setInputText] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  // Scroll automático al final cuando hay nuevos mensajes
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Listener para el teclado
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
      setKeyboardHeight(e.endCoordinates.height);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isTyping) return;
    
    const messageToSend = inputText.trim();
    setInputText('');
    
    try {
      await sendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('Copiado', 'Respuesta copiada al portapapeles');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const time = new Date(item.timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.assistantMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {/* Indicador de pregunta estructurada */}
          {!isUser && item.questionId && (
            <View style={styles.questionIndicator}>
              <Text style={styles.questionIndicatorText}>
                📋 Pregunta estructurada
              </Text>
            </View>
          )}
          
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content}
          </Text>
          
          {/* Botón de copiar para mensajes de IA */}
          {!isUser && (
            <Pressable
              style={styles.copyButton}
              onPress={() => copyToClipboard(item.content)}
            >
              <Text style={styles.copyButtonText}>📋 Copiar</Text>
            </Pressable>
          )}
          
          <Text style={[styles.messageTime, isUser ? styles.userTime : styles.assistantTime]}>
            {time}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
        <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
          <View style={styles.typingIndicator}>
            <View style={[styles.typingDot, styles.typingDot1]} />
            <View style={[styles.typingDot, styles.typingDot2]} />
            <View style={[styles.typingDot, styles.typingDot3]} />
          </View>
          <Text style={styles.typingText}>Procesando respuesta...</Text>
        </View>
      </View>
    );
  };

  const renderProgressBar = () => {
    const progressPercentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Progreso: {progress.current}/{progress.total} preguntas completadas
          </Text>
          <Text style={styles.progressPercentage}>
            {Math.round(progressPercentage)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
      </View>
    );
  };

  const renderCurrentQuestionInfo = () => {
    if (!currentQuestion) return null;
    
    return (
      <View style={styles.currentQuestionContainer}>
        <Text style={styles.currentQuestionLabel}>Pregunta Actual:</Text>
        <Text style={styles.currentQuestionField}>
          📝 {currentQuestion.field} ({currentQuestion.priority})
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Barra de progreso */}
      {renderProgressBar()}
      
      {/* Información de pregunta actual */}
      {renderCurrentQuestionInfo()}
      
      {/* Estado de conexión */}
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionStatusText}>🔴 Sin conexión - Reintentando...</Text>
        </View>
      )}
      
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* Lista de mensajes */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContainer}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={renderTypingIndicator}
      />

      {/* Input para escribir */}
      <View style={[styles.inputContainer, { paddingBottom: keyboardHeight > 0 ? 8 : 16 }]}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder={
            currentQuestion 
              ? "Escribe tu respuesta..." 
              : "Escribe tu mensaje..."
          }
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={1000}
          returnKeyType="send"
          onSubmitEditing={handleSendMessage}
          blurOnSubmit={false}
        />
        <Pressable 
          style={[styles.sendButton, (!inputText.trim() || isTyping) && styles.sendButtonDisabled]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={[styles.sendButtonText, (!inputText.trim() || isTyping) && styles.sendButtonTextDisabled]}>
            {isTyping ? '...' : '↗️'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  progressContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2563eb',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 3,
  },
  currentQuestionContainer: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fbbf24',
  },
  currentQuestionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 2,
  },
  currentQuestionField: {
    fontSize: 14,
    color: '#b45309',
  },
  connectionStatus: {
    backgroundColor: '#fef2f2',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fecaca',
  },
  connectionStatusText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#fbbf24',
  },
  errorText: {
    color: '#b45309',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: 16,
  },
  messageContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#2563eb',
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  typingBubble: {
    paddingVertical: 16,
  },
  questionIndicator: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  questionIndicatorText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#ffffff',
  },
  assistantText: {
    color: '#1e293b',
  },
  copyButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  copyButtonText: {
    fontSize: 12,
    color: '#475569',
    fontWeight: '500',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  userTime: {
    color: '#e2e8f0',
  },
  assistantTime: {
    color: '#9ca3af',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#9ca3af',
    marginHorizontal: 2,
  },
  typingDot1: {
    animationDelay: '0s',
  },
  typingDot2: {
    animationDelay: '0.2s',
  },
  typingDot3: {
    animationDelay: '0.4s',
  },
  typingText: {
    fontSize: 14,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    maxHeight: 100,
    backgroundColor: '#ffffff',
    color: '#1e293b',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#9ca3af',
  },
});

export default StructuredChatInterface;