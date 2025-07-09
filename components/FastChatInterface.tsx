import React, { useState, useRef, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, KeyboardAvoidingView, Platform, Keyboard } from 'react-native';
import type { ChatMessage } from '../hooks/useFastChat';

interface FastChatInterfaceProps {
  messages: ChatMessage[];
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  isConnected: boolean;
  error: string | null;
  onBriefGenerated: (brief: any) => void;
}

/**
 * Interfaz de chat rápida y fluida para mejorar briefs
 */
const FastChatInterface: React.FC<FastChatInterfaceProps> = ({
  messages,
  isTyping,
  sendMessage,
  isConnected,
  error,
  onBriefGenerated,
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

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const time = new Date(item.timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <View style={[styles.messageContainer, isUser ? styles.userMessageContainer : styles.assistantMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content}
          </Text>
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
        </View>
      </View>
    );
  };

  const renderQuickReplies = () => {
    if (messages.length <= 1) {
      return (
        <View style={styles.quickRepliesContainer}>
          <Text style={styles.quickRepliesTitle}>Sugerencias rápidas:</Text>
          <View style={styles.quickRepliesGrid}>
            <QuickReplyButton 
              text="Mejorar objetivos"
              onPress={() => setInputText('Ayúdame a mejorar los objetivos estratégicos del brief')}
            />
            <QuickReplyButton 
              text="Mensajes clave"
              onPress={() => setInputText('¿Cómo puedo hacer los mensajes clave más impactantes?')}
            />
            <QuickReplyButton 
              text="Audiencia objetivo"
              onPress={() => setInputText('¿Está bien definida la audiencia objetivo?')}
            />
            <QuickReplyButton 
              text="Estrategia de canales"
              onPress={() => setInputText('¿Qué opinas de la estrategia de canales propuesta?')}
            />
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
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

      {/* Respuestas rápidas */}
      {renderQuickReplies()}

      {/* Input para escribir */}
      <View style={[styles.inputContainer, { paddingBottom: keyboardHeight > 0 ? 8 : 16 }]}>
        <TextInput
          style={styles.textInput}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="#9ca3af"
          multiline
          maxLength={500}
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

const QuickReplyButton: React.FC<{ text: string; onPress: () => void }> = ({ text, onPress }) => (
  <Pressable style={styles.quickReplyButton} onPress={onPress}>
    <Text style={styles.quickReplyText}>{text}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    maxWidth: '80%',
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
  quickRepliesContainer: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quickRepliesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 8,
  },
  quickRepliesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickReplyButton: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  quickReplyText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '500',
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

export default FastChatInterface;