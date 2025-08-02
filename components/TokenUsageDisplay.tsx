import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TokenUsageDisplayProps {
  tokensUsed?: number;
  tokensBreakdown?: Record<string, number>;
  estimatedCost?: number;
  compact?: boolean;
}

const TokenUsageDisplay: React.FC<TokenUsageDisplayProps> = ({
  tokensUsed = 0,
  tokensBreakdown = {},
  estimatedCost = 0,
  compact = false
}) => {
  if (tokensUsed === 0 && estimatedCost === 0) {
    return null; // Don't show anything if no token data
  }

  const formatCost = (cost: number): string => {
    if (cost < 0.01) {
      return `$${cost.toFixed(4)}`;
    } else if (cost < 1) {
      return `$${cost.toFixed(3)}`;
    } else {
      return `$${cost.toFixed(2)}`;
    }
  };

  const formatTokens = (tokens: number): string => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`;
    }
    return tokens.toString();
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactTokens}>🪙 {formatTokens(tokensUsed)}</Text>
        <Text style={styles.compactCost}>{formatCost(estimatedCost)}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Uso de Tokens</Text>
        <Text style={styles.totalCost}>{formatCost(estimatedCost)}</Text>
      </View>
      
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Total</Text>
          <Text style={styles.statValue}>{tokensUsed.toLocaleString()}</Text>
        </View>
        
        {Object.entries(tokensBreakdown).map(([service, tokens]) => {
          if (service === 'total') return null;
          
          const serviceNames: Record<string, string> = {
            'whisper_transcription': 'Transcripción',
            'gpt4_generation': 'GPT-4 Generación',
            'gpt4_improvements': 'GPT-4 Mejoras',
            'gpt4_analysis': 'GPT-4 Análisis',
            'claude_generation': 'Claude Generación',
            'claude_chat': 'Claude Chat',
            'gemini_generation': 'Gemini Generación',
            'gemini_chat': 'Gemini Chat'
          };
          
          return (
            <View key={service} style={styles.statItem}>
              <Text style={styles.statLabel}>
                {serviceNames[service] || service}
              </Text>
              <Text style={styles.statValue}>{formatTokens(tokens)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
  },
  totalCost: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stats: {
    gap: 8,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  compactTokens: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
  },
  compactCost: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '700',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default TokenUsageDisplay;