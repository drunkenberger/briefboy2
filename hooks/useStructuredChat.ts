import { useCallback, useState } from 'react';
import { knowledgeBaseService } from '../services/knowledgeBaseService';
import { normalizeBrief } from '../utils/briefValidation';

// --- INTERFACES ---
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
}

/**
 * Hook rediseñado para un chat de mejora de briefs.
 * Funciona como un "Estratega Holístico".
 * 1. Analiza el brief completo UNA VEZ para crear un plan de preguntas.
 * 2. Para cada pregunta, enriquece la respuesta del usuario usando IA antes de actualizar el brief.
 */
export function useStructuredChat(
  initialBrief: any,
  onBriefChange: (updatedBrief: any) => void
): UseStructuredChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questions, setQuestions] = useState<StructuredQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingBrief, setWorkingBrief] = useState<any>(normalizeBrief(initialBrief));

  const getArrayFields = useCallback(() => [
    'strategicObjectives', 'targetAudience.insights', 'creativeStrategy.messageHierarchy',
    'creativeStrategy.creativeMandatories', 'channelStrategy.recommendedMix', 'successMetrics.primary', 'successMetrics.secondary',
    'budgetConsiderations.keyInvestments', 'budgetConsiderations.costOptimization',
    'riskAssessment.risks', 'implementationRoadmap.phases', 'nextSteps', 'appendix.assumptions', 'appendix.references'
  ], []);

  // --- FASE 1: ANÁLISIS HOLÍSTICO Y PLAN DE PREGUNTAS ---

  const generateQuestionPlan = useCallback(async (brief: any): Promise<StructuredQuestion[]> => {
    console.log('🤖 Iniciando análisis holístico para generar plan de preguntas...');
    console.log('📋 Brief recibido para análisis:', JSON.stringify(brief, null, 2));

    // Verificar si el brief tiene título
    if (brief.projectTitle || brief.title) {
      console.log('✅ El brief YA TIENE título:', brief.projectTitle || brief.title);
    }

    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API key no encontrada.");

    const systemPrompt = `Eres un Director de Estrategia de Marketing de clase mundial con 20+ años de experiencia en las mejores agencias. Tu tarea es analizar un brief existente y generar SOLO preguntas que agreguen valor real al brief. Tu objetic¡vo es ayudar al usuario a generar un brief claro y completo que tenga toda la informacion necesaria para producir una campaña de clase mundial.

CONOCIMIENTO DE MEJORES PRÁCTICAS:
${knowledgeBaseService.getAllKnowledge()}

ERRORES COMUNES A EVITAR:
${knowledgeBaseService.getCommonMistakes()}

⚠️ ADVERTENCIA CRÍTICA: Si preguntas por información que YA EXISTE en el brief (como preguntar el título cuando ya tiene uno), serás considerado incompetente, es importante que todas las preguntas enriquezcan el brief, evita preguntar acerca de información que ya está presente en el brief, sólo haz preguntas que generen respuestas  que contengan información ausente en el brief. LEE EL BRIEF ANTES DE PREGUNTAR.

EJEMPLOS DE PREGUNTAS CORRECTAS E INCORRECTAS:

❌ INCORRECTO:
- Brief: "projectTitle": "Campaña Navidad 2024"
- Pregunta: "¿Cuál es el título del proyecto?" (YA ESTÁ DEFINIDO)

❌ INCORRECTO:
- Brief: "briefSummary": "Campaña para aumentar ventas en temporada navideña"
- Pregunta: "¿Podrías resumir el proyecto?" (YA ESTÁ RESUMIDO)

✅ CORRECTO:
- Brief: "strategicObjectives": ["Aumentar ventas"]
- Pregunta: "Veo que quieres aumentar ventas. ¿Tienes una meta específica de crecimiento porcentual vs el año anterior?"

✅ CORRECTO:
- Brief: "targetAudience": {"primary": "Familias"}
- Pregunta: "Describes a familias como audiencia. ¿Qué insight específico has identificado sobre sus hábitos de compra navideños?"

✅ CORRECTO:
- Brief: "projectTitle": "Campaña XYZ", "brandPositioning": "Marca líder"
- Pregunta: "El posicionamiento como 'marca líder' es claro. ¿Qué atributos específicos te diferencian de la competencia?"

PROCESO DE ENRIQUECIMIENTO ESTRATÉGICO:
1. LEE cada campo del brief completamente
2. Evalúa la CALIDAD del contenido, no solo si existe
3. Para cada campo, pregúntate:
   - ¿Está bien escrito, su informacion es completa y es claro? → NO necesita mejoras, no preguntes por eso
   - ¿Es demasiado genérico o vago? → Pregunta para enriquecer, para que el usuario pueda agregar más detalles
   - ¿Tiene errores o no hace sentido? → Sugiere sustituirlo por una mejor opción o agregar información que haga sentido
   - ¿Falta profundidad estratégica? → Pregunta para profundizar

EJEMPLOS DE PREGUNTAS DE ENRIQUECIMIENTO:
- Profundización: "Veo que [campo existente]. ¿Podrías agregar más detalles sobre [aspecto específico]?"
- Enriquecimiento: "El [campo] está bien definido. ¿Qué [elemento adicional] podrías agregar para fortalecerlo?"
- Conexiones: "Mencionas [A] y [B]. ¿Cómo se conectan estratégicamente?"
- Contexto: "Para [elemento existente], ¿qué contexto competitivo o cultural es importante?"
- Especificidad: "Los [objetivos/métricas] están claros. ¿Qué números específicos tienes en mente?"

NUNCA PREGUNTES POR:
- Títulos que están bien escritos y son claros
- Información que ya está completa y específica
- Campos que no necesitan mejoras obvias

Haz sólo las preguntas que consideres necesarias para que el brief quede completo y listo para produccion.

MÁXIMO 10 preguntas de enriquecimiento. Si el brief está bien estructurado, enfócate en PROFUNDIZAR, no en cambiar.

Devuelve ÚNICAMENTE un objeto JSON:
{
  "questions": [
    {
      "id": "q1",
      "field": "campo_relacionado",
      "question": "pregunta estratégica basada en mejores prácticas que AGREGA VALOR",
      "priority": "high|medium|low",
      "justification": "Explica POR QUÉ esta pregunta es necesaria y QUÉ información específica falta o necesita enriquecimiento"
    }
  ]
}`

    const userPrompt = `SISTEMA DE VALIDACIÓN DE PREGUNTAS - FASE 1: ANÁLISIS DEL BRIEF

========== CONTENIDO ACTUAL DEL BRIEF ==========
${JSON.stringify(brief, null, 2)}
================================================



REGLAS ESTRICTAS:
1. Si un campo existe con contenido específico y consideras que noecesita mas informacion o detalles → NO preguntes por ese campo
2. Solo haz preguntas de enriquecimiento sobre campos existentes si hace informacion relevante para la creacion de una campaña publicitaria sólida. Utiliza los contenidos en la knowledge base del proyecto.
3. Cada pregunta debe tener una justificación sólida


GENERA PREGUNTAS SOLO PARA CAMPOS FALTANTES O ENRIQUECIMIENTO JUSTIFICADO.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) throw new Error(`Error de la API de OpenAI: ${response.statusText}`);

      const data = await response.json();
      const plan = data.choices?.[0]?.message?.content;
      const parsedPlan = JSON.parse(plan);

      if (!parsedPlan.questions || !Array.isArray(parsedPlan.questions)) {
        throw new Error("La respuesta de la IA no contiene un array de 'questions' válido.");
      }

      console.log(`✅ Plan de ${parsedPlan.questions.length} preguntas generado.`);

      // Validar que las preguntas no sean redundantes
      const validQuestions = parsedPlan.questions.filter((q: any) => {
        const field = q.field;
        const question = q.question?.toLowerCase() || '';

        // Validaciones específicas por campo
        if (field === 'projectTitle' || field === 'title') {
          if (brief.projectTitle || brief.title) {
            console.error(`🚫 PREGUNTA RECHAZADA: "${q.question}" - El título YA EXISTE: "${brief.projectTitle || brief.title}"`);
            return false;
          }
        }

        if (field === 'briefSummary' || field === 'summary') {
          if (brief.briefSummary || brief.summary) {
            console.error(`🚫 PREGUNTA RECHAZADA: "${q.question}" - El resumen YA EXISTE`);
            return false;
          }
        }

        if (field === 'businessChallenge' || field === 'problemStatement') {
          if (brief.businessChallenge || brief.problemStatement) {
            console.error(`🚫 PREGUNTA RECHAZADA: "${q.question}" - El desafío YA EXISTE`);
            return false;
          }
        }

        // Validar que la pregunta no sea sobre información básica existente
        const basicPhrases = ['cuál es el título', 'qué es el proyecto', 'podrías decirme el nombre', 'cuál es el nombre'];
        if (basicPhrases.some(phrase => question.includes(phrase))) {
          console.error(`🚫 PREGUNTA RECHAZADA: "${q.question}" - Pregunta sobre información básica existente`);
          return false;
        }

        // Validar que la pregunta no sea genérica
        const genericPhrases = ['cuál es', 'qué es', 'podrías decirme', 'podrías definir'];
        if (genericPhrases.some(phrase => question.includes(phrase)) && !q.justification) {
          console.error(`🚫 PREGUNTA RECHAZADA: "${q.question}" - Pregunta genérica sin justificación`);
          return false;
        }

        return true;
      });

      console.log(`✅ Preguntas válidas después de filtrado: ${validQuestions.length}`);
      return validQuestions.map((q: any) => ({ ...q, completed: false }));

    } catch (e) {
      console.error("Error generando el plan de preguntas:", e);
      // Devolver un plan de respaldo más inteligente basado en el brief actual
      const fallbackQuestions = [];

      // Solo preguntar por campos que realmente faltan
      if (!brief.projectTitle && !brief.title) {
        fallbackQuestions.push({ id: 'fallback-1', field: 'projectTitle', question: "¿Cuál es el título exacto de este proyecto o campaña?", priority: 'high', completed: false });
      }

      if (!brief.briefSummary && !brief.summary) {
        fallbackQuestions.push({ id: 'fallback-2', field: 'briefSummary', question: "¿Podrías resumir en 2-3 frases de qué trata este proyecto y qué busca lograr?", priority: 'high', completed: false });
      }

      if (!brief.businessChallenge && !brief.problemStatement) {
        fallbackQuestions.push({ id: 'fallback-3', field: 'businessChallenge', question: "¿Cuál es el principal desafío de negocio que esta campaña debe resolver?", priority: 'high', completed: false });
      }

      if (!brief.strategicObjectives && !brief.objectives) {
        fallbackQuestions.push({ id: 'fallback-4', field: 'strategicObjectives', question: "¿Cuáles son los objetivos estratégicos clave que esperas alcanzar?", priority: 'high', completed: false });
      }

      if (!brief.targetAudience?.primary && !brief.targetAudience) {
        fallbackQuestions.push({ id: 'fallback-5', field: 'targetAudience.primary', question: "¿Quién es tu audiencia principal y qué sabes de sus motivaciones?", priority: 'medium', completed: false });
      }

      if (!brief.creativeStrategy?.bigIdea) {
        fallbackQuestions.push({ id: 'fallback-6', field: 'creativeStrategy.bigIdea', question: "¿Cuál es la gran idea que debería guiar la creatividad de esta campaña?", priority: 'medium', completed: false });
      }

      // Si no hay preguntas de respaldo, significa que el brief está completo
      if (fallbackQuestions.length === 0) {
        return []; // No questions needed
      }

      return fallbackQuestions;
    }
  }, []);


  // --- FASE 2: DIÁLOGO DE ENRIQUECIMIENTO ---

  const enrichUserResponse = useCallback(async (question: string, userResponse: string): Promise<string> => {
    console.log('🤖 Enriqueciendo la respuesta del usuario con IA...');
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) return userResponse;

    const systemPrompt = `Eres un experto en redacción de marketing con conocimiento de las mejores prácticas de la industria. Tu tarea es ENRIQUECER la respuesta del usuario, no reemplazarla.

CONOCIMIENTO DE MEJORES PRÁCTICAS:
${knowledgeBaseService.getBriefStructureGuidance()}

INSTRUCCIONES DE ENRIQUECIMIENTO:
- CONSERVA la esencia e intención original del usuario
- AGREGA detalles profesionales y estratégicos
- MEJORA la claridad y especificidad
- MANTÉN el tono y estructura preferidos del usuario
- SI la respuesta ya está bien, haz mejoras mínimas
- NO cambies nombres, títulos o elementos específicos que estén bien
- NO añadas etiquetas, comillas, ni formato especial
- Si es una lista, devuelve una lista mejorada
- Si es un párrafo, devuelve un párrafo enriquecido
- Responde ÚNICAMENTE con el texto enriquecido. NADA MÁS.`;

    const userMessage = `Pregunta original: "${question}"\n\nRespuesta del usuario:\n---\n${userResponse}\n---\n\nRefina y enriquece esta respuesta.`;

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
          temperature: 0.4,
          max_tokens: 500,
        }),
      });

      if (!response.ok) throw new Error(`Error de la API de OpenAI: ${response.statusText}`);

      const data = await response.json();
      const improvedText = data.choices?.[0]?.message?.content.trim();
      console.log("✅ Respuesta enriquecida:", improvedText);
      return improvedText || userResponse;

    } catch (e) {
      console.error("Error enriqueciendo la respuesta:", e);
      return userResponse; // Devolver respuesta original si la IA falla
    }
  }, []);


  // --- LÓGICA DEL CHAT ---

  const initializeChat = useCallback(async () => {
    console.log('🔄 Inicializando chat con enfoque holístico...');
    setIsTyping(true);
    setError(null);
    setMessages([]);

    const welcomeMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "He analizado tu brief completo. Voy a hacerte preguntas estratégicas sobre las áreas que necesitan más profundidad o claridad. No te preguntaré sobre información que ya está bien definida.",
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);

    const questionPlan = await generateQuestionPlan(workingBrief);
    setQuestions(questionPlan);

    if (questionPlan.length > 0) {
      const firstQuestion: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: questionPlan[0].question,
        timestamp: Date.now(),
        questionId: questionPlan[0].id,
        briefField: questionPlan[0].field,
      };
      setMessages(prev => [...prev, firstQuestion]);
    } else {
       const noQuestionsMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: "🎉 ¡Excelente! Tu brief está muy completo y bien estructurado. No he encontrado áreas críticas que requieran mejoras inmediatas. El documento tiene toda la información necesaria para ejecutar la campaña exitosamente.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, noQuestionsMessage]);
    }

    setIsTyping(false);
  }, [initialBrief, generateQuestionPlan]);

  const processNextQuestion = useCallback(() => {
    const nextIndex = currentQuestionIndex + 1;

    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = questions[nextIndex];

      const nextQuestionMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: nextQuestion.question,
        timestamp: Date.now(),
        questionId: nextQuestion.id,
        briefField: nextQuestion.field,
      };

      setMessages(prev => [...prev, nextQuestionMessage]);
    } else {
      // No hay más preguntas
      const completionMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: "🎉 ¡Excelente! Hemos completado todas las mejoras al brief. Tu documento ahora está mucho más completo y profesional. ¿Hay algo más específico que te gustaría ajustar?",
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, completionMessage]);
    }
  }, [currentQuestionIndex, questions]);

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isTyping) return;

    console.log('📨 sendMessage iniciado. currentQuestionIndex:', currentQuestionIndex, 'questions.length:', questions.length);

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) {
      console.warn('sendMessage: No current question found.');
      return;
    }

    setIsTyping(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent.trim(),
      timestamp: Date.now(),
      questionId: currentQuestion.id,
      briefField: currentQuestion.field,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // 1. Enriquecer la respuesta del usuario
      const enrichedResponse = await enrichUserResponse(currentQuestion.question, messageContent.trim());

      // 2. Actualizar el brief localmente con la respuesta enriquecida
      const updatedBrief = { ...workingBrief };
      const shouldBeArray = getArrayFields().includes(currentQuestion.field);
      const finalValue = shouldBeArray
        ? enrichedResponse.split('\n').map(item => item.replace(/^- /, '').trim()).filter(Boolean)
        : enrichedResponse;

      if (currentQuestion.field.includes('.')) {
        const [parent, child] = currentQuestion.field.split('.');
        if (!updatedBrief[parent]) updatedBrief[parent] = {};
        updatedBrief[parent][child] = finalValue;
      } else {
        updatedBrief[currentQuestion.field] = finalValue;
      }

      setWorkingBrief(updatedBrief);
      onBriefChange(updatedBrief);

      // 3. Confirmar y pasar a la siguiente pregunta
      const confirmationMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: `¡Perfecto! He refinado tu respuesta y actualizado el brief. \n\nAquí tienes la siguiente pregunta:`,
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, confirmationMessage]);

      // Avanzar a la siguiente pregunta
      setTimeout(() => {
        processNextQuestion();
      }, 500);

    } catch (err: any) {
      console.error('Error en sendMessage:', err);
      setError(err.message || 'Error en la comunicación');
      const errorMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: '❌ Disculpa, tuve un problema técnico al procesar tu respuesta.',
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  }, [
    isTyping,
    questions,
    currentQuestionIndex,
    workingBrief,
    enrichUserResponse,
    getArrayFields,
    onBriefChange,
    processNextQuestion,
  ]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setError(null);
    setWorkingBrief(normalizeBrief(initialBrief));
  }, [initialBrief]);

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
      current: currentQuestionIndex,
      total: questions.length,
    },
  };
}