/**
 * Utilidades para parsing y formateo de campos complejos del brief
 */

export interface ChannelStrategyItem {
  channel: string;
  allocation: string;
  rationale: string;
  kpis: string[];
}

export interface SuccessMetricItem {
  metric: string;
  target: string;
  description?: string;
}

export interface BudgetItem {
  category: string;
  amount: string;
  description?: string;
}

/**
 * Parsea un string formateado de channelStrategy de vuelta a objeto
 * @param formattedText - El texto formateado con emojis
 * @returns El objeto parseado o null si falla
 */
export function parseChannelStrategyText(formattedText: string): ChannelStrategyItem | null {
  try {
    if (!formattedText || typeof formattedText !== 'string') {
      console.warn('⚠️ parseChannelStrategyText: Input inválido', formattedText);
      return null;
    }

    // Dividir por líneas y limpiar espacios
    const lines = formattedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      console.warn('⚠️ parseChannelStrategyText: No hay líneas válidas');
      return null;
    }

    const result: ChannelStrategyItem = {
      channel: '',
      allocation: '',
      rationale: '',
      kpis: []
    };

    // Procesar cada línea
    for (const line of lines) {
      if (line.startsWith('📺')) {
        // Parsear línea de canal: "📺 Instagram (30%)"
        const channelMatch = line.match(/📺\s*(.+?)\s*\((.+?)\)/);
        if (channelMatch) {
          result.channel = channelMatch[1].trim();
          result.allocation = channelMatch[2].trim();
        } else {
          // Fallback: extraer todo después del emoji
          result.channel = line.replace('📺', '').trim();
        }
      } else if (line.startsWith('📊')) {
        // Parsear línea de rationale: "📊 Instagram is a visual platform..."
        result.rationale = line.replace('📊', '').trim();
      } else if (line.startsWith('📈')) {
        // Parsear línea de KPIs: "📈 KPIs: Engagement rate, Follower growth"
        const kpiMatch = line.match(/📈\s*KPIs:\s*(.+)/);
        if (kpiMatch) {
          result.kpis = kpiMatch[1]
            .split(',')
            .map(kpi => kpi.trim())
            .filter(kpi => kpi.length > 0);
        }
      }
    }

    // Validar que tenemos al menos channel
    if (!result.channel) {
      console.warn('⚠️ parseChannelStrategyText: No se pudo extraer el canal');
      return null;
    }

    console.log('✅ parseChannelStrategyText exitoso:', result);
    return result;

  } catch (error) {
    console.error('❌ Error en parseChannelStrategyText:', error);
    return null;
  }
}

/**
 * Parsea un string formateado de successMetrics de vuelta a objeto
 * @param formattedText - El texto formateado con emojis
 * @returns El objeto parseado o null si falla
 */
export function parseSuccessMetricText(formattedText: string): SuccessMetricItem | null {
  try {
    if (!formattedText || typeof formattedText !== 'string') {
      return null;
    }

    const lines = formattedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return null;
    }

    const result: SuccessMetricItem = {
      metric: '',
      target: '',
      description: ''
    };

    for (const line of lines) {
      if (line.startsWith('📊')) {
        // Parsear línea de métrica: "📊 CTR: 2.5%"
        const metricMatch = line.match(/📊\s*(.+?):\s*(.+)/);
        if (metricMatch) {
          result.metric = metricMatch[1].trim();
          result.target = metricMatch[2].trim();
        }
      } else if (line.startsWith('📝')) {
        // Parsear línea de descripción: "📝 Click-through rate for all campaigns"
        result.description = line.replace('📝', '').trim();
      }
    }

    if (!result.metric || !result.target) {
      return null;
    }

    return result;

  } catch (error) {
    console.error('❌ Error en parseSuccessMetricText:', error);
    return null;
  }
}

/**
 * Parsea un string formateado de budgetConsiderations de vuelta a objeto
 * @param formattedText - El texto formateado con emojis
 * @returns El objeto parseado o null si falla
 */
export function parseBudgetItemText(formattedText: string): BudgetItem | null {
  try {
    if (!formattedText || typeof formattedText !== 'string') {
      return null;
    }

    const lines = formattedText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    if (lines.length === 0) {
      return null;
    }

    const result: BudgetItem = {
      category: '',
      amount: '',
      description: ''
    };

    for (const line of lines) {
      if (line.startsWith('💰')) {
        // Parsear línea de presupuesto: "💰 Digital Media: $50,000"
        const budgetMatch = line.match(/💰\s*(.+?):\s*(.+)/);
        if (budgetMatch) {
          result.category = budgetMatch[1].trim();
          result.amount = budgetMatch[2].trim();
        }
      } else if (line.startsWith('📝')) {
        // Parsear línea de descripción: "📝 Investment in digital advertising"
        result.description = line.replace('📝', '').trim();
      }
    }

    if (!result.category || !result.amount) {
      return null;
    }

    return result;

  } catch (error) {
    console.error('❌ Error en parseBudgetItemText:', error);
    return null;
  }
}

/**
 * Función genérica para parsear texto formateado basado en el tipo de campo
 * @param formattedText - El texto a parsear
 * @param fieldKey - El campo que está siendo parseado
 * @returns El objeto parseado o null si falla
 */
export function parseFormattedText(formattedText: string, fieldKey: string): any {
  try {
    if (fieldKey === 'channelStrategy.recommendedMix') {
      return parseChannelStrategyText(formattedText);
    } else if (fieldKey.includes('successMetrics')) {
      return parseSuccessMetricText(formattedText);
    } else if (fieldKey.includes('budgetConsiderations')) {
      return parseBudgetItemText(formattedText);
    }

    // Fallback genérico para otros tipos de campos
    return null;

  } catch (error) {
    console.error('❌ Error en parseFormattedText:', error);
    return null;
  }
}

/**
 * Valida si un string parece ser texto formateado que puede ser parseado
 * @param text - El texto a validar
 * @returns true si parece ser texto formateado
 */
export function isFormattedText(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Verificar si contiene emojis de formato
  const formatEmojis = ['📺', '📊', '📈', '💰', '📝'];
  return formatEmojis.some(emoji => text.includes(emoji));
}

/**
 * Función de fallback que retorna un valor por defecto para campos que fallan en parsing
 * @param fieldKey - El campo que falló
 * @param originalValue - El valor original que falló
 * @returns Un valor de fallback apropiado
 */
export function getFallbackValue(fieldKey: string, originalValue: any): any {
  console.warn(`⚠️ Usando fallback para campo: ${fieldKey}`);
  
  if (fieldKey === 'channelStrategy.recommendedMix') {
    return {
      channel: 'Canal no especificado',
      allocation: '0%',
      rationale: 'Descripción no disponible',
      kpis: []
    };
  } else if (fieldKey.includes('successMetrics')) {
    return {
      metric: 'Métrica no especificada',
      target: 'Objetivo no definido',
      description: 'Descripción no disponible'
    };
  } else if (fieldKey.includes('budgetConsiderations')) {
    return {
      category: 'Categoría no especificada',
      amount: '$0',
      description: 'Descripción no disponible'
    };
  }

  // Fallback genérico: retornar el valor original si no sabemos qué hacer
  return originalValue;
}