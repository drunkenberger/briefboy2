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
  Clipboard,
  ScrollView,
  Dimensions,
  Animated
} from 'react-native';
import { ChatMessage, StructuredQuestion } from '../hooks/useStructuredChat';
import { Theme } from '../constants/Theme';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isSmallScreen = screenWidth < 375;

interface ImprovedStructuredChatInterfaceProps {
  messages: ChatMessage[];
  currentQuestion: StructuredQuestion | null;
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  isConnected: boolean;
  error: string | null;
  progress: { current: number; total: number };
}

/**
 * Improved chat interface with better readability and UX
 */
const ImprovedStructuredChatInterface: React.FC<ImprovedStructuredChatInterfaceProps> = ({
  messages,
  currentQuestion,
  isTyping,
  sendMessage,
  isConnected,
  error,
  progress,
}) => {
  const [inputText, setInputText] = useState('');
  const [inputHeight, setInputHeight] = useState(50);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  // Animate chat entry
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Auto-scroll to end when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true);
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    });
    
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false);
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
    setInputHeight(50); // Reset height
    
    try {
      await sendMessage(messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'No se pudo enviar el mensaje. Intenta de nuevo.');
    }
  };

  const copyToClipboard = (text: string) => {
    Clipboard.setString(text);
    Alert.alert('✅', 'Texto copiado al portapapeles');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const time = new Date(item.timestamp).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    return (
      <Animated.View style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.assistantMessageContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.assistantBubble]}>
          {/* Role indicator */}
          <View style={styles.messageHeader}>
            <Text style={[styles.roleText, isUser ? styles.userRole : styles.assistantRole]}>
              {isUser ? '👤 Tú' : '🤖 BriefBoy AI'}
            </Text>
            <Text style={[styles.messageTime, isUser ? styles.userTime : styles.assistantTime]}>
              {time}
            </Text>
          </View>
          
          {/* Question indicator for structured questions */}
          {!isUser && item.questionId && (
            <View style={styles.questionIndicator}>
              <Text style={styles.questionIndicatorText}>
                💡 Pregunta estratégica
              </Text>
            </View>
          )}
          
          <Text style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}>
            {item.content}
          </Text>
          
          {/* Copy button for AI messages */}
          {!isUser && (
            <Pressable
              style={styles.copyButton}
              onPress={() => copyToClipboard(item.content)}
            >
              <Text style={styles.copyButtonText}>Copiar 📋</Text>
            </Pressable>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;
    
    return (
      <View style={[styles.messageContainer, styles.assistantMessageContainer]}>
        <View style={[styles.messageBubble, styles.assistantBubble, styles.typingBubble]}>
          <View style={styles.typingIndicator}>
            <Animated.View style={[styles.typingDot, styles.typingDot1]} />
            <Animated.View style={[styles.typingDot, styles.typingDot2]} />
            <Animated.View style={[styles.typingDot, styles.typingDot3]} />
          </View>
          <Text style={styles.typingText}>BriefBoy está pensando...</Text>
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
            Mejora del Brief
          </Text>
          <Text style={styles.progressPercentage}>
            {progress.current}/{progress.total} preguntas
          </Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View 
            style={[
              styles.progressFill, 
              { 
                width: `${progressPercentage}%`,
                opacity: fadeAnim 
              }
            ]} 
          />
        </View>
      </View>
    );
  };

  const renderQuickReplies = () => {
    if (!currentQuestion || isTyping) return null;

    const quickReplies = [
      'Necesito más información',
      'No estoy seguro',
      'Prefiero no especificar',
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.quickRepliesContainer}
      >
        {quickReplies.map((reply, index) => (
          <Pressable
            key={index}
            style={styles.quickReplyButton}
            onPress={() => setInputText(reply)}
          >
            <Text style={styles.quickReplyText}>{reply}</Text>
          </Pressable>
        ))}
      </ScrollView>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Chat de Mejora de Brief</Text>
      {currentQuestion && (
        <Text style={styles.headerSubtitle}>
          Campo: {currentQuestion.field}
        </Text>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Header */}
      {renderHeader()}
      
      {/* Progress bar */}
      {renderProgressBar()}
      
      {/* Connection status */}
      {!isConnected && (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionStatusText}>⚠️ Reconectando...</Text>
        </View>
      )}
      
      {/* Error banner */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>❌ {error}</Text>
        </View>
      )}

      {/* Messages list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        style={styles.messagesList}
        contentContainerStyle={[
          styles.messagesContainer,
          { paddingBottom: keyboardVisible ? 20 : 100 }
        ]}
        showsVerticalScrollIndicator={true}
        ListFooterComponent={renderTypingIndicator}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Quick replies */}
      {renderQuickReplies()}

      {/* Input container */}
      <View style={[
        styles.inputContainer,
        keyboardVisible && styles.inputContainerKeyboard
      ]}>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={[styles.textInput, { height: Math.max(50, inputHeight) }]}
            value={inputText}
            onChangeText={setInputText}
            onContentSizeChange={(event) => {
              const height = event.nativeEvent.contentSize.height;
              setInputHeight(Math.min(height, 120)); // Max height of 120
            }}
            placeholder={
              currentQuestion 
                ? "Escribe tu respuesta aquí..." 
                : "Escribe un mensaje..."
            }
            placeholderTextColor={Theme.colors.textLight}
            multiline
            maxLength={1000}
            returnKeyType="default"
            blurOnSubmit={false}
            editable={!isTyping}
          />
          
          <Pressable 
            style={[
              styles.sendButton, 
              (!inputText.trim() || isTyping) && styles.sendButtonDisabled
            ]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isTyping}
          >
            <Text style={[
              styles.sendButtonText, 
              (!inputText.trim() || isTyping) && styles.sendButtonTextDisabled
            ]}>
              {isTyping ? '⏳' : '📤'}
            </Text>
          </Pressable>
        </View>
        
        {/* Character count */}
        {inputText.length > 0 && (
          <Text style={styles.charCount}>
            {inputText.length}/1000
          </Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  header: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
    ...Theme.shadows.sm,
  },
  headerTitle: {
    fontSize: Theme.typography.fontSize.lg,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  headerSubtitle: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
  },
  progressContainer: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  progressText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
    color: Theme.colors.text,
  },
  progressPercentage: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.accent,
  },
  progressBar: {
    height: 6,
    backgroundColor: Theme.colors.surfaceDark,
    borderRadius: Theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Theme.colors.accent,
    borderRadius: Theme.borderRadius.sm,
  },
  connectionStatus: {
    backgroundColor: Theme.colors.warning + '20',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
  },
  connectionStatusText: {
    color: Theme.colors.warning,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: Theme.colors.error + '20',
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
  },
  errorText: {
    color: Theme.colors.error,
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.medium,
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContainer: {
    paddingVertical: Theme.spacing.lg,
  },
  messageContainer: {
    paddingHorizontal: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  assistantMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '85%',
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    ...Theme.shadows.sm,
  },
  userBubble: {
    backgroundColor: Theme.colors.accent,
  },
  assistantBubble: {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  typingBubble: {
    paddingVertical: Theme.spacing.xl,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  roleText: {
    fontSize: Theme.typography.fontSize.xs,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  userRole: {
    color: Theme.colors.surface,
  },
  assistantRole: {
    color: Theme.colors.textSecondary,
  },
  messageTime: {
    fontSize: Theme.typography.fontSize.xs,
  },
  userTime: {
    color: Theme.colors.surface,
    opacity: 0.8,
  },
  assistantTime: {
    color: Theme.colors.textTertiary,
  },
  questionIndicator: {
    backgroundColor: Theme.colors.info + '20',
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.sm,
    marginBottom: Theme.spacing.sm,
    alignSelf: 'flex-start',
  },
  questionIndicatorText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.info,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  messageText: {
    fontSize: Theme.typography.fontSize.base,
    lineHeight: Theme.typography.fontSize.base * Theme.typography.lineHeight.relaxed,
  },
  userText: {
    color: Theme.colors.surface,
  },
  assistantText: {
    color: Theme.colors.text,
  },
  copyButton: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.sm,
    marginTop: Theme.spacing.md,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  copyButtonText: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textSecondary,
    fontWeight: Theme.typography.fontWeight.medium,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.accent,
    marginHorizontal: 3,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  typingText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
    fontStyle: 'italic',
  },
  quickRepliesContainer: {
    backgroundColor: Theme.colors.surface,
    paddingVertical: Theme.spacing.sm,
    paddingHorizontal: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    maxHeight: 50,
  },
  quickReplyButton: {
    backgroundColor: Theme.colors.background,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    marginRight: Theme.spacing.sm,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  quickReplyText: {
    fontSize: Theme.typography.fontSize.sm,
    color: Theme.colors.textSecondary,
  },
  inputContainer: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    paddingTop: Theme.spacing.md,
    paddingBottom: Theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.border,
    ...Theme.shadows.lg,
  },
  inputContainerKeyboard: {
    paddingBottom: Theme.spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    fontSize: Theme.typography.fontSize.base,
    backgroundColor: Theme.colors.background,
    color: Theme.colors.text,
    minHeight: 50,
    maxHeight: 120,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: Theme.borderRadius.full,
    backgroundColor: Theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Theme.spacing.sm,
    ...Theme.shadows.md,
  },
  sendButtonDisabled: {
    backgroundColor: Theme.colors.surfaceDark,
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: Theme.typography.fontSize.xl,
  },
  sendButtonTextDisabled: {
    opacity: 0.5,
  },
  charCount: {
    fontSize: Theme.typography.fontSize.xs,
    color: Theme.colors.textLight,
    textAlign: 'right',
    marginTop: Theme.spacing.xs,
    marginRight: 60, // Account for send button width
  },
});

export default ImprovedStructuredChatInterface;