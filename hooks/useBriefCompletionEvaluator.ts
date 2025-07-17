import { useState, useCallback } from 'react';

export interface BriefCompletion {
  isComplete: boolean;
  completionScore: number;
  missingFields: string[];
  weakFields: string[];
  recommendations: string[];
  nextQuestions: string[];
}

export interface UseBriefCompletionEvaluatorResult {
  evaluateBrief: (brief: any) => Promise<BriefCompletion>;
  isEvaluating: boolean;
  error: string | null;
}

/**
 * Hook para evaluar si un brief está completo y sugerir mejoras adicionales
 */
export function useBriefCompletionEvaluator(): UseBriefCompletionEvaluatorResult {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const evaluateBrief = useCallback(async (brief: any): Promise<BriefCompletion> => {
    setIsEvaluating(true);
    setError(null);

    try {
      // Evaluar completitud localmente primero
      const localEvaluation = performLocalEvaluation(brief);
      
      // Si el brief está muy incompleto, no enviar a la IA
      if (localEvaluation.completionScore < 60) {
        return localEvaluation;
      }

      // Enviar a la IA para evaluación más profunda
      const aiEvaluation = await performAIEvaluation(brief);
      
      return aiEvaluation;
    } catch (err: any) {
      setError(err.message || 'Error evaluando el brief');
      // Retornar evaluación local como fallback
      return performLocalEvaluation(brief);
    } finally {
      setIsEvaluating(false);
    }
  }, []);

  return {
    evaluateBrief,
    isEvaluating,
    error,
  };
}

// Evaluación local basada en campos requeridos
function performLocalEvaluation(brief: any): BriefCompletion {
  const requiredFields = [
    { key: 'projectTitle', label: 'Título del Proyecto' },
    { key: 'briefSummary', label: 'Resumen Ejecutivo' },
    { key: 'businessChallenge', label: 'Desafío de Negocio' },
    { key: 'strategicObjectives', label: 'Objetivos Estratégicos' },
    { key: 'targetAudience.primary', label: 'Audiencia Primaria' },
    { key: 'targetAudience.insights', label: 'Insights de Audiencia' },
    { key: 'brandPositioning', label: 'Posicionamiento de Marca' },
    { key: 'creativeStrategy.bigIdea', label: 'Punto de Partida Creativo' },
    { key: 'creativeStrategy.messageHierarchy', label: 'Jerarquía de Mensajes' },
    { key: 'creativeStrategy.toneAndManner', label: 'Tono y Manera' },
    { key: 'channelStrategy.integratedApproach', label: 'Enfoque Integrado' },
    { key: 'successMetrics.primary', label: 'KPIs Primarios' },
    { key: 'successMetrics.measurementFramework', label: 'Framework de Medición' },
    { key: 'nextSteps', label: 'Próximos Pasos' },
  ];

  const missingFields: string[] = [];
  const weakFields: string[] = [];
  let completedFields = 0;

  requiredFields.forEach((field) => {
    let value: any;
    if (field.key.includes('.')) {
      const [parent, child] = field.key.split('.');
      value = brief[parent]?.[child];
    } else {
      value = brief[field.key];
    }

    const isEmpty = !value || 
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'object' && Object.keys(value).length === 0);

    if (isEmpty) {
      missingFields.push(field.label);
    } else {
      completedFields++;
      
      // Evaluar si es débil
      const isWeak = (Array.isArray(value) && value.length < 2) ||
        (typeof value === 'string' && value.length < 100);
      
      if (isWeak) {
        weakFields.push(field.label);
      }
    }
  });

  const completionScore = Math.round((completedFields / requiredFields.length) * 100);
  const isComplete = completionScore >= 95 && weakFields.length === 0;

  const recommendations: string[] = [];
  if (missingFields.length > 0) {
    recommendations.push(`Completa los campos faltantes: ${missingFields.join(', ')}`);
  }
  if (weakFields.length > 0) {
    recommendations.push(`Fortalece estos campos: ${weakFields.join(', ')}`);
  }

  const nextQuestions: string[] = [];
  if (missingFields.length > 0) {
    nextQuestions.push(`Necesitamos completar: ${missingFields.slice(0, 3).join(', ')}`);
  }

  return {
    isComplete,
    completionScore,
    missingFields,
    weakFields,
    recommendations,
    nextQuestions,
  };
}

// Evaluación con IA para análisis más profundo
async function performAIEvaluation(brief: any): Promise<BriefCompletion> {
  const openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!openaiApiKey) {
    throw new Error('No se encontró la API key de OpenAI');
  }

  const evaluationPrompt = `Eres un experto en marketing que evalúa la completitud y calidad de briefs publicitarios.

BRIEF A EVALUAR:
${JSON.stringify(brief, null, 2)}

CRITERIOS DE EVALUACIÓN:
1. Completitud: ¿Están todos los campos necesarios?
2. Calidad: ¿La información es específica y útil?
3. Coherencia: ¿Los elementos se conectan lógicamente?
4. Accionabilidad: ¿Es lo suficientemente detallado para ejecutar?

INSTRUCCIONES:
- Evalúa cada sección del brief
- Identifica campos faltantes o débiles
- Proporciona recomendaciones específicas
- Sugiere próximas preguntas para mejorar
- Asigna un puntaje de completitud (0-100)

FORMATO DE RESPUESTA (JSON):
{
  "isComplete": boolean,
  "completionScore": number,
  "missingFields": ["campo1", "campo2"],
  "weakFields": ["campo3", "campo4"],
  "recommendations": ["recomendación1", "recomendación2"],
  "nextQuestions": ["pregunta1", "pregunta2"]
}

Responde ÚNICAMENTE con JSON válido:`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiApiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: evaluationPrompt },
        { role: 'user', content: 'Evalúa este brief por favor.' },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status}`);
  }

  const data = await response.json();
  const aiResponse = data.choices?.[0]?.message?.content;

  if (!aiResponse) {
    throw new Error('No se recibió respuesta de la IA');
  }

  try {
    const evaluation = JSON.parse(aiResponse);
    return {
      isComplete: evaluation.isComplete || false,
      completionScore: evaluation.completionScore || 0,
      missingFields: evaluation.missingFields || [],
      weakFields: evaluation.weakFields || [],
      recommendations: evaluation.recommendations || [],
      nextQuestions: evaluation.nextQuestions || [],
    };
  } catch (parseError) {
    console.error('Error parsing AI evaluation:', parseError);
    // Fallback a evaluación local
    return performLocalEvaluation(brief);
  }
}