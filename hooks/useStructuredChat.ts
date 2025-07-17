import { useState, useCallback, useEffect } from 'react';
import { normalizeBrief } from '../utils/briefValidation';
import { useBriefCompletionEvaluator } from './useBriefCompletionEvaluator';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  questionId?: string;
  briefField?: string;
}

export interface StructuredQuestion {
  id: string;
  field: string;
  question: string;
  followUp?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

export interface UseStructuredChatResult {
  messages: ChatMessage[];
  currentQuestion: StructuredQuestion | null;
  isTyping: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
  initializeChat: () => void;
  isConnected: boolean;
  error: string | null;
  progress: { current: number; total: number };
  onBriefUpdate: (updatedBrief: any) => void;
}

/**
 * Hook para chat estructurado con preguntas una por una
 * Actualiza el brief automáticamente con cada respuesta
 */
export function useStructuredChat(
  brief: any, 
  analysis: any, 
  onBriefChange: (updatedBrief: any) => void
): UseStructuredChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questions, setQuestions] = useState<StructuredQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingBrief, setWorkingBrief] = useState<any>(normalizeBrief(brief));
  const [completedQuestions, setCompletedQuestions] = useState<Set<string>>(new Set());
  const { evaluateBrief } = useBriefCompletionEvaluator();

  // Definir campos que deben ser arrays (centralizado)
  const getArrayFields = useCallback(() => [
    'strategicObjectives', 'targetAudience.insights', 'creativeStrategy.messageHierarchy', 
    'creativeStrategy.creativeMandatories', 'channelStrategy.recommendedMix', 'successMetrics.primary', 'successMetrics.secondary',
    'budgetConsiderations.keyInvestments', 'budgetConsiderations.costOptimization', 
    'riskAssessment.risks', 'implementationRoadmap.phases', 'nextSteps', 'appendix.assumptions', 'appendix.references'
  ], []);

  // Definir todos los campos del brief de manera centralizada
  const getAllBriefFields = useCallback(() => [
    // Básicos
    { key: 'projectTitle', label: 'Título del Proyecto', required: true },
    { key: 'briefSummary', label: 'Resumen Ejecutivo', required: true },
    
    // Negocio  
    { key: 'businessChallenge', label: 'Desafío de Negocio', required: true },
    { key: 'strategicObjectives', label: 'Objetivos Estratégicos', required: true },
    
    // Audiencia
    { key: 'targetAudience.primary', label: 'Audiencia Primaria', required: true },
    { key: 'targetAudience.secondary', label: 'Audiencia Secundaria', required: false },
    { key: 'targetAudience.insights', label: 'Insights de Audiencia', required: true },
    
    // Posicionamiento
    { key: 'brandPositioning', label: 'Posicionamiento de Marca', required: true },
    
    // Estrategia Creativa
    { key: 'creativeStrategy.bigIdea', label: 'Punto de Partida Creativo', required: true },
    { key: 'creativeStrategy.messageHierarchy', label: 'Jerarquía de Mensajes', required: true },
    { key: 'creativeStrategy.toneAndManner', label: 'Tono y Manera', required: true },
    { key: 'creativeStrategy.creativeMandatories', label: 'Elementos Obligatorios', required: false },
    
    // Canales
    { key: 'channelStrategy.recommendedMix', label: 'Mix de Canales Recomendado', required: true },
    { key: 'channelStrategy.integratedApproach', label: 'Enfoque Integrado', required: true },
    
    // Métricas
    { key: 'successMetrics.primary', label: 'KPIs Primarios', required: true },
    { key: 'successMetrics.secondary', label: 'KPIs Secundarios', required: false },
    { key: 'successMetrics.measurementFramework', label: 'Framework de Medición', required: true },
    
    // Presupuesto
    { key: 'budgetConsiderations.estimatedRange', label: 'Rango Presupuestario', required: false },
    { key: 'budgetConsiderations.keyInvestments', label: 'Inversiones Clave', required: false },
    { key: 'budgetConsiderations.costOptimization', label: 'Optimización de Costos', required: false },
    
    // Riesgos
    { key: 'riskAssessment.risks', label: 'Análisis de Riesgos', required: true },
    
    // Implementación
    { key: 'implementationRoadmap.phases', label: 'Fases de Implementación', required: true },
    { key: 'nextSteps', label: 'Próximos Pasos', required: true },
    
    // Anexos
    { key: 'appendix.assumptions', label: 'Supuestos', required: false },
    { key: 'appendix.references', label: 'Referencias', required: false },
  ], []);

  // Generar preguntas estructuradas basadas en el análisis de la IA
  const generateStructuredQuestions = useCallback((briefData: any, analysisData: any): StructuredQuestion[] => {
    if (!analysisData) {
      console.warn("No hay datos de análisis para generar preguntas.");
      return [];
    }

    console.log('Generando preguntas inteligentes basadas en análisis:', { score: analysisData.overallScore });

    // Caso 1: El brief es excelente (score >= 95)
    if (analysisData.overallScore >= 95) {
      return [
        {
          id: 'enrichment-1',
          field: 'strategicThinking',
          question: "🚀 ¡Felicidades! Tu brief es excelente y está prácticamente listo. Para llevarlo a un nivel superior, pensemos de forma disruptiva: ¿Qué insight contraintuitivo o completamente nuevo sobre tu audiencia podría cambiar las reglas del juego para esta campaña?",
          priority: 'low',
          completed: false,
        },
        {
          id: 'enrichment-2',
          field: 'creativeHorizon',
          question: "Tu brief es muy sólido. Como un ejercicio de expansión creativa, si no tuvieras ninguna limitación (presupuesto, canales, etc.), ¿cuál sería la idea más audaz que te atreverías a proponer?",
          priority: 'low',
          completed: false,
        }
      ];
    }

    // Caso 2: El brief necesita mejoras (score < 95)
    const questions: StructuredQuestion[] = [];
    const allBriefFields = getAllBriefFields();

    if (analysisData.sectionAnalysis) {
      for (const sectionKey in analysisData.sectionAnalysis) {
        const section = analysisData.sectionAnalysis[sectionKey];
        
        // Generar preguntas solo para secciones que no son excelentes o buenas
        if (section.status === 'fair' || section.status === 'poor' || section.status === 'missing') {
          const fieldConfig = allBriefFields.find(f => f.key === sectionKey);
          const fieldLabel = fieldConfig ? fieldConfig.label : sectionKey;
          const priority = fieldConfig?.required ? 'high' : 'medium';

          // Combinar issues y suggestions en preguntas concretas
          if (section.issues && section.issues.length > 0) {
            section.issues.forEach((issue: string, index: number) => {
              questions.push({
                id: `issue-${sectionKey}-${index}`,
                field: sectionKey,
                question: `🚨 En la sección "${fieldLabel}", se identificó un problema: "${issue}". ¿Cómo podemos resolver esto o qué información adicional puedes proporcionar?`,
                priority: priority,
                completed: false,
              });
            });
          }
          
          if (section.suggestions && section.suggestions.length > 0) {
            section.suggestions.forEach((suggestion: string, index: number) => {
              questions.push({
                id: `suggestion-${sectionKey}-${index}`,
                field: sectionKey,
                question: `💡 Para mejorar la sección "${fieldLabel}", se sugiere: "${suggestion}". ¿Qué detalles puedes añadir al respecto?`,
                priority: priority,
                completed: false,
              });
            });
          }
        }
      }
    }
    
    // Si después de analizar las secciones no hay preguntas, pero el score es bajo, usar recomendaciones generales.
    if (questions.length === 0 && analysisData.recommendations && analysisData.recommendations.length > 0) {
        analysisData.recommendations.forEach((rec: string, index: number) => {
            questions.push({
                id: `rec-${index}`,
                field: 'general',
                question: `📈 Recomendación general para mejorar tu brief: ${rec} ¿Cómo podrías aplicar esto?`,
                priority: 'medium',
                completed: false,
            });
        });
    }

    // Ordenar por prioridad
    const sortedQuestions = questions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    console.log('Preguntas generadas por la nueva lógica inteligente:', sortedQuestions.length, sortedQuestions.map(q => `${q.field}: ${q.question.substring(0, 60)}...`));
    
    return sortedQuestions;
  }, [getAllBriefFields]);
  
  
  
  

  

  // Función para verificar integridad del brief
  const verifyBriefIntegrity = useCallback((brief: any, source: string) => {
    if (!brief) return;
    
    const timestamp = new Date().toLocaleTimeString();
    const camposCriticos = [
      'projectTitle', 'briefSummary', 'businessChallenge', 
      'strategicObjectives', 'targetAudience', 'creativeStrategy'
    ];
    
    const camposPresentes = camposCriticos.filter(campo => {
      const valor = brief[campo];
      return valor !== undefined && valor !== null && 
             (Array.isArray(valor) ? valor.length > 0 : 
              typeof valor === 'object' ? Object.keys(valor).length > 0 : 
              typeof valor === 'string' ? valor.trim().length > 0 : true);
    });
    
    console.log(`🔍 [${timestamp}] VERIFICACIÓN DE INTEGRIDAD - ${source}:`, {
      totalCampos: Object.keys(brief).length,
      camposCriticosPresentes: `${camposPresentes.length}/${camposCriticos.length}`,
      camposFaltantes: camposCriticos.filter(c => !camposPresentes.includes(c)),
      // Verificar campos problemáticos específicos
      businessChallenge: brief.businessChallenge ? '✅' : '❌',
      targetAudiencePrimary: brief.targetAudience?.primary ? '✅' : '❌',
      targetAudienceSecondary: brief.targetAudience?.secondary ? '✅' : '❌',
      bigIdea: brief.creativeStrategy?.bigIdea ? '✅' : '❌',
      // Muestra de contenido
      muestraContenido: {
        projectTitle: brief.projectTitle?.substring(0, 30) + '...',
        businessChallenge: brief.businessChallenge?.substring(0, 30) + '...',
        targetAudiencePrimary: brief.targetAudience?.primary?.substring(0, 30) + '...'
      }
    });
    
    return camposPresentes.length;
  }, []);

  // Monitorear cambios en workingBrief para debugging
  useEffect(() => {
    if (workingBrief) {
      verifyBriefIntegrity(workingBrief, 'Hook State Update');
    }
  }, [workingBrief, verifyBriefIntegrity]);

  // Función de validación para verificar campos antes de actualizar
  const validateFieldUpdate = useCallback((field: string, value: any, currentBrief: any) => {
    const fieldConfig = getAllBriefFields().find(f => f.key === field);
    const shouldBeArray = getArrayFields().includes(field);
    
    // Validar tipo de dato
    if (shouldBeArray && !Array.isArray(value) && typeof value === 'string') {
      // Convertir string a array si es necesario
      return value.split(/[\n,]+/).map(item => item.trim()).filter(item => item.length > 0);
    }
    
    // Validar campos requeridos
    if (fieldConfig?.required && (!value || (Array.isArray(value) && value.length === 0))) {
      console.warn(`⚠️ Campo requerido vacío: ${field}`);
    }
    
    return value;
  }, [getAllBriefFields, getArrayFields]);

  // Sistema de respaldo con múltiples modelos de IA - DECLARAR PRIMERO
  const callOpenAI = useCallback(async (systemPrompt: string, userMessage: string) => {
    const openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!openaiApiKey) {
      throw new Error('No se encontró la API key de OpenAI');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.1,
        max_tokens: 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI Error HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No se recibió respuesta de OpenAI');
    }

    try {
      const parsedResponse = JSON.parse(aiResponse);
      if (!parsedResponse.updatedBrief) {
        console.error('❌ Respuesta sin updatedBrief:', aiResponse);
        throw new Error('La respuesta de OpenAI no tiene updatedBrief');
      }
      return parsedResponse;
    } catch (parseError) {
      console.error('❌ Error parseando JSON de OpenAI:', aiResponse);
      console.error('Error detallado:', parseError);
      throw new Error(`Error parseando respuesta JSON: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
    }
  }, []);

  const callClaude = useCallback(async (systemPrompt: string, userMessage: string) => {
    const claudeApiKey = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
    if (!claudeApiKey) {
      throw new Error('No se encontró la API key de Claude');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 3000,
        messages: [
          { role: 'user', content: `${systemPrompt}\n\n${userMessage}` },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Claude Error HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.content?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No se recibió respuesta de Claude');
    }

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se encontró JSON válido en la respuesta de Claude');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    if (!parsedResponse.updatedBrief) {
      throw new Error('La respuesta de Claude no tiene updatedBrief');
    }

    return parsedResponse;
  }, []);

  const callGemini = useCallback(async (systemPrompt: string, userMessage: string) => {
    const geminiApiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    if (!geminiApiKey) {
      throw new Error('No se encontró la API key de Gemini');
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userMessage}`
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 3000,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini Error HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No se recibió respuesta de Gemini');
    }

    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se encontró JSON válido en la respuesta de Gemini');
    }

    const parsedResponse = JSON.parse(jsonMatch[0]);
    if (!parsedResponse.updatedBrief) {
      throw new Error('La respuesta de Gemini no tiene updatedBrief');
    }

    return parsedResponse;
  }, []);

  const callAIToUpdateBrief = useCallback(async (
    userResponse: string,
    questionId: string,
    briefField: string,
    currentBrief: any
  ) => {
    const arrayFields = ['strategicObjectives', 'targetAudience.insights', 'creativeStrategy.messageHierarchy', 
                        'creativeStrategy.creativeMandatories', 'channelStrategy.recommendedMix', 'successMetrics.primary', 
                        'successMetrics.secondary', 'budgetConsiderations.keyInvestments', 'budgetConsiderations.costOptimization', 
                        'riskAssessment.risks', 'implementationRoadmap.phases', 'nextSteps', 'appendix.assumptions', 'appendix.references'];

    const isArrayField = arrayFields.includes(briefField);

    const systemPrompt = `Eres un experto en marketing que actualiza briefs basado en respuestas del usuario.

BRIEF ACTUAL:
${JSON.stringify(currentBrief, null, 2)}

CAMPO A ACTUALIZAR: ${briefField}
TIPO DE CAMPO: ${isArrayField ? 'ARRAY' : 'STRING'}
RESPUESTA DEL USUARIO: ${userResponse}

INSTRUCCIONES CRÍTICAS:
1. Actualiza ÚNICAMENTE el campo "${briefField}" del brief
2. Si el campo es "${briefField}" y es de tipo ARRAY, convierte la respuesta en un array válido
3. Si el campo es "${briefField}" y es de tipo STRING, mantén como string
4. Para campos anidados (con punto), crea la estructura correcta
5. Mantén el resto del brief EXACTAMENTE igual
6. Mejora profesionalmente la información del usuario
7. SIEMPRE devuelve JSON válido

FORMATO DE RESPUESTA OBLIGATORIO:
{
  "updatedBrief": {brief_completo_actualizado},
  "followUpMessage": "✅ [Campo actualizado] - información procesada correctamente"
}`;

    const userMessage = `Campo: ${briefField}\nTipo: ${isArrayField ? 'ARRAY' : 'STRING'}\nRespuesta: ${userResponse}`;

    // Intentar con OpenAI primero
    try {
      console.log('🤖 Intentando con OpenAI...');
      const result = await callOpenAI(systemPrompt, userMessage);
      console.log('✅ OpenAI funcionó correctamente');
      return { ...result, aiModel: 'OpenAI' };
    } catch (openaiError) {
      console.warn('⚠️ OpenAI falló:', openaiError instanceof Error ? openaiError.message : String(openaiError));
    }

    // Intentar con Claude como respaldo
    try {
      console.log('🤖 Intentando con Claude (respaldo)...');
      const result = await callClaude(systemPrompt, userMessage);
      console.log('✅ Claude funcionó correctamente');
      return { ...result, aiModel: 'Claude' };
    } catch (claudeError) {
      console.warn('⚠️ Claude falló:', claudeError instanceof Error ? claudeError.message : String(claudeError));
    }

    // Intentar con Gemini como último respaldo
    try {
      console.log('🤖 Intentando con Gemini (último respaldo)...');
      const result = await callGemini(systemPrompt, userMessage);
      console.log('✅ Gemini funcionó correctamente');
      return { ...result, aiModel: 'Gemini' };
    } catch (geminiError) {
      console.warn('⚠️ Gemini falló:', geminiError instanceof Error ? geminiError.message : String(geminiError));
    }

    // Si todos fallan, lanzar error
    throw new Error('Todos los modelos de IA fallaron');
  }, [callOpenAI, callClaude, callGemini]);

  // Procesar respuesta del usuario y actualizar brief - MODO HÍBRIDO (IA + FALLBACK)
  const processUserResponse = useCallback(async (message: string, questionId: string, briefField: string, currentWorkingBrief: any) => {
    console.log('🔄 PROCESANDO RESPUESTA (HÍBRIDO):', {
      message: message.substring(0, 50) + '...',
      briefField,
      briefFieldCount: Object.keys(currentWorkingBrief || {}).length
    });
    
    // PRIMERO: Intentar procesar con IA
    try {
      const aiResponse = await callAIToUpdateBrief(message, questionId, briefField, currentWorkingBrief);
      if (aiResponse.updatedBrief) {
        console.log('✅ IA procesó exitosamente la respuesta');
        
        // Verificar que el campo se actualizó correctamente
        const fieldValue = briefField.includes('.') 
          ? aiResponse.updatedBrief[briefField.split('.')[0]]?.[briefField.split('.')[1]]
          : aiResponse.updatedBrief[briefField];
        
        // Log específico para channelStrategy
        if (briefField.includes('channelStrategy')) {
          console.log('🔍 Verificando actualización de channelStrategy:');
          console.log('Campo:', briefField);
          console.log('Valor recibido:', fieldValue);
          console.log('Tipo de dato:', Array.isArray(fieldValue) ? 'array' : typeof fieldValue);
          console.log('Brief completo channelStrategy:', aiResponse.updatedBrief.channelStrategy);
        }
        
        if (fieldValue !== undefined && fieldValue !== null && 
            !(Array.isArray(fieldValue) && fieldValue.length === 0) &&
            !(typeof fieldValue === 'string' && fieldValue.trim() === '')) {
          
          return {
            message: aiResponse.followUpMessage || '✅ Información procesada y mejorada por IA.',
            updatedBrief: normalizeBrief(aiResponse.updatedBrief),
            aiModel: aiResponse.aiModel || 'IA'
          };
        } else {
          console.warn('⚠️ IA no actualizó el campo correctamente, usando fallback');
          console.warn('Campo:', briefField, 'Valor:', fieldValue);
        }
      }
    } catch (error) {
      console.warn('⚠️ IA falló, usando método directo como fallback:', error instanceof Error ? error.message : String(error));
    }
    
    // SEGUNDO: Fallback directo si IA falla
    console.log('🔄 Usando método directo como fallback...');
    
    const updatedBrief = { ...currentWorkingBrief };
    const shouldBeArray = getArrayFields().includes(briefField);
    
    let processedValue;
    if (shouldBeArray) {
      if (Array.isArray(message)) {
        processedValue = message;
      } else if (typeof message === 'string') {
        processedValue = message.split(/[\n,]+/).map(item => item.trim()).filter(item => item.length > 0);
      } else {
        processedValue = [String(message)];
      }
    } else {
      processedValue = typeof message === 'string' ? message : String(message);
    }
    
    if (briefField.includes('.')) {
      const [parent, child] = briefField.split('.');
      if (!updatedBrief[parent]) {
        updatedBrief[parent] = {};
      }
      updatedBrief[parent][child] = processedValue;
      
      // Log específico para depuración
      console.log(`📝 Actualizando campo anidado ${briefField}:`, {
        parent,
        child,
        valorProcesado: processedValue,
        tipoEsperado: shouldBeArray ? 'array' : 'string',
        objetoPadre: updatedBrief[parent]
      });
    } else {
      updatedBrief[briefField] = processedValue;
    }
    
    const normalizedBrief = normalizeBrief(updatedBrief);
    
    // Verificación final
    const fieldValue = briefField.includes('.') 
      ? normalizedBrief[briefField.split('.')[0]]?.[briefField.split('.')[1]]
      : normalizedBrief[briefField];
    
    console.log('✅ BRIEF ACTUALIZADO (FALLBACK):', {
      field: briefField,
      valorOriginal: message,
      valorProcesado: processedValue,
      valorFinal: fieldValue,
      campoExiste: fieldValue !== undefined,
      isArray: Array.isArray(fieldValue),
      longitudArray: Array.isArray(fieldValue) ? fieldValue.length : 'N/A',
      briefFieldCount: Object.keys(normalizedBrief).length,
      updateMethod: 'FALLBACK_DIRECTO',
      timestamp: new Date().toLocaleTimeString()
    });
    
    // Garantizar que el campo se actualizó
    if (fieldValue === undefined || fieldValue === null || 
        (Array.isArray(fieldValue) && fieldValue.length === 0) ||
        (typeof fieldValue === 'string' && fieldValue.trim() === '')) {
      console.error(`❌ ERROR CRÍTICO: Campo ${briefField} no se actualizó ni con IA ni con fallback`);
      
      // Forzar actualización como último recurso
      if (briefField.includes('.')) {
        const [parent, child] = briefField.split('.');
        normalizedBrief[parent] = normalizedBrief[parent] || {};
        normalizedBrief[parent][child] = processedValue;
      } else {
        normalizedBrief[briefField] = processedValue;
      }
    }
    
    return {
      message: '✅ Información guardada correctamente en tu brief.',
      updatedBrief: normalizedBrief
    };
  }, [getArrayFields, callAIToUpdateBrief]);
  
  // Función auxiliar para obtener el valor de un campo (incluyendo anidados)
  const getFieldValue = (briefData: any, fieldKey: string) => {
    if (fieldKey.includes('.')) {
      const [parent, child] = fieldKey.split('.');
      return briefData[parent]?.[child];
    }
    return briefData[fieldKey];
  };

  const processNextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questions[nextIndex];
      const nextQuestionMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: nextQuestion.question,
        timestamp: Date.now(),
        questionId: nextQuestion.id,
        briefField: nextQuestion.field,
      };
      setMessages(prev => [...prev, nextQuestionMessage]);
    } else {
      const finalMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "✅ ¡Excelente trabajo! Hemos cubierto todos los puntos de mejora identificados. El brief está ahora mucho más robusto. Puedes cerrar esta ventana o seguir editando manualmente.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, finalMessage]);
    }
  }, [currentQuestionIndex, questions]);

  // Enviar mensaje y procesar respuesta
  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim()) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;
    
    console.log('📨 Iniciando sendMessage:', {
      field: currentQuestion.field,
      message: messageContent.substring(0, 50) + '...',
      currentBriefFieldCount: Object.keys(workingBrief || {}).length
    });
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent.trim(),
      timestamp: Date.now(),
      questionId: currentQuestion.id,
      briefField: currentQuestion.field,
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);
    
    try {
      const currentWorkingBrief = workingBrief;
      
      const responseData = await processUserResponse(
        messageContent.trim(),
        currentQuestion.id,
        currentQuestion.field,
        currentWorkingBrief
      );
      
      setQuestions(prev => prev.map(q => 
        q.id === currentQuestion.id ? { ...q, completed: true } : q
      ));
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseData.message,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      const briefToEvaluate = responseData.updatedBrief;
      
      setWorkingBrief(briefToEvaluate);
      onBriefChange(briefToEvaluate);
      
      setTimeout(() => {
        processNextQuestion();
      }, 1000);
      
      setIsConnected(true);
      
    } catch (err: any) {
      setError(err.message || 'Error en la comunicación');
      setIsConnected(false);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '❌ Disculpa, tuve un problema técnico. Por favor intenta de nuevo.',
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [questions, currentQuestionIndex, processUserResponse, workingBrief, processNextQuestion]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCompletedQuestions(new Set());
    setError(null);
    setIsConnected(true);
  }, []);

  const onBriefUpdate = useCallback((updatedBrief: any) => {
    const normalizedBrief = normalizeBrief(updatedBrief);
    setWorkingBrief(normalizedBrief);
    onBriefChange(normalizedBrief);
    console.log('onBriefUpdate called with:', normalizedBrief);
  }, [onBriefChange]);

  const initializeChat = useCallback(() => {
    console.log('🔄 Reinicializando chat estructurado con lógica inteligente...');
    
    setMessages([]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCompletedQuestions(new Set());
    setError(null);
    setIsConnected(true);
    setIsTyping(false);
    
    if (brief && analysis) {
      const generatedQuestions = generateStructuredQuestions(brief, analysis);
      setQuestions(generatedQuestions);
      setWorkingBrief(normalizeBrief(brief));
      
      let welcomeMessageContent: string;
      if (analysis.overallScore >= 95) {
        welcomeMessageContent = `🌟 **¡Excelente trabajo!** Tu brief tiene una puntuación de ${analysis.overallScore}/100. Es muy sólido.

Te haré un par de preguntas de alto nivel para explorar ideas aún más audaces y llevarlo de 'excelente' a 'excepcional'.`;
      } else {
        welcomeMessageContent = `Hola! Tu brief tiene una puntuación de ${analysis.overallScore}/100. He identificado algunas áreas de mejora.

Te haré preguntas específicas basadas en el análisis para fortalecer tu brief. ¡Empecemos!`;
      }

      if (generatedQuestions.length > 0) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: welcomeMessageContent,
          timestamp: Date.now(),
        };
        
        const firstQuestion: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: generatedQuestions[0].question,
          timestamp: Date.now(),
          questionId: generatedQuestions[0].id,
          briefField: generatedQuestions[0].field,
        };
        
        setMessages([welcomeMessage, firstQuestion]);
        console.log('✅ Chat inteligente inicializado con', generatedQuestions.length, 'preguntas.');
      } else {
        const completeBriefMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🎉 **¡Felicidades!** Tu brief ha alcanzado una puntuación de ${analysis.overallScore}/100 y no se han identificado áreas críticas para mejorar. Está listo para producción.`,
          timestamp: Date.now(),
        };
        
        setMessages([completeBriefMessage]);
        console.log('✅ Brief completo. No se generaron preguntas de mejora.');
      }
    }
  }, [brief, analysis, generateStructuredQuestions]);

  useEffect(() => {
    if (brief && analysis) {
      initializeChat();
    }
  }, [brief, analysis, initializeChat]);

  return {
    messages,
    currentQuestion: questions[currentQuestionIndex] || null,
    isTyping,
    sendMessage,
    clearChat,
    initializeChat,
    isConnected,
    error,
    progress: {
      current: completedQuestions.size,
      total: questions.length
    },
    onBriefUpdate,
  };
}
