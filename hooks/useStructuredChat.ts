import { useCallback, useState, useEffect, useRef } from 'react';

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

export interface BriefQualityAssessment {
  overallScore: number;
  isExcellent: boolean;
  readyForProduction: boolean;
  strengths: string[];
  remainingGaps: string[];
  recommendation: string;
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
  briefQuality: BriefQualityAssessment | null;
  evaluateBriefQuality: () => Promise<void>;
}

/**
 * Hook dinámico para un chat de mejora de briefs.
 * Funciona como un "Estratega Dinámico" que reevalúa el brief en cada paso.
 */
export function useStructuredChat(
  initialBrief: any,
  onBriefChange: (updatedBrief: any) => void
): UseStructuredChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionHistory, setQuestionHistory] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<StructuredQuestion | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workingBrief, setWorkingBrief] = useState<any>(initialBrief);
  const [briefQuality, setBriefQuality] = useState<BriefQualityAssessment | null>(null);
  
  // Abort controller ref para cancelar requests en desmontaje
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sincronizar el workingBrief si el brief inicial cambia desde fuera
  useEffect(() => {
    setWorkingBrief(normalizeBrief(initialBrief));
  }, [initialBrief]);

  // Cleanup: cancelar requests pendientes cuando el componente se desmonta
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Helper para crear nuevo abort controller
  const createNewAbortController = useCallback(() => {
    // Cancelar el controller anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    // Crear nuevo controller
    abortControllerRef.current = new AbortController();
    return abortControllerRef.current;
  }, []);

  const getArrayFields = useCallback(() => [
    'strategicObjectives', 'targetAudience.insights', 'creativeStrategy.messageHierarchy',
    'creativeStrategy.creativeMandatories', 'channelStrategy.recommendedMix', 'successMetrics.primary', 'successMetrics.secondary',
    'budgetConsiderations.keyInvestments', 'budgetConsiderations.costOptimization',
    'riskAssessment.risks', 'implementationRoadmap.phases', 'nextSteps', 'appendix.assumptions', 'appendix.references'
  ], []);

  // --- LÓGICA DE PREGUNTAS DINÁMICAS ---

  /**
   * Intenta obtener una pregunta alternativa cuando se detecta un duplicado
   */
  const attemptAlternativeQuestion = useCallback(async (
    brief: any, 
    history: string[], 
    duplicatedQuestion: StructuredQuestion
  ): Promise<StructuredQuestion | null> => {
    const MAX_ATTEMPTS = 3;
    
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      console.log(`🔄 Intento ${attempt}/${MAX_ATTEMPTS} para obtener pregunta alternativa`);
      
      try {
        const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
        if (!apiKey) throw new Error("OpenAI API key no encontrada");

        // Prompt específico para obtener pregunta alternativa
        const systemPrompt = `Eres un Director de Estrategia de Marketing. Se detectó una pregunta DUPLICADA sobre el brief. Tu tarea es encontrar una pregunta DIFERENTE y VALIOSA.

PREGUNTA DUPLICADA DETECTADA: "${duplicatedQuestion.question}"
CAMPO QUE SE IBA A ACTUALIZAR: "${duplicatedQuestion.field}"

REGLAS CRÍTICAS:
1. NO repitas la pregunta duplicada ni variaciones similares
2. NO preguntes sobre campos que ya tienen contenido completo
3. Busca un campo DIFERENTE que esté vacío o incompleto
4. La pregunta debe ser estratégicamente valiosa
5. Si no encuentras una pregunta válida, devuelve null

FORMATO: Responde ÚNICAMENTE con JSON:
{
  "nextQuestion": {
    "id": "q-alt-123",
    "field": "campo_diferente",
    "question": "Pregunta completamente diferente...",
    "priority": "high|medium|low"
  }
}
O si no hay preguntas válidas:
{
  "nextQuestion": null
}`;

        const abortController = createNewAbortController();
        
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          signal: abortController.signal,
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: systemPrompt },
              { 
                role: 'user', 
                content: `BRIEF ACTUAL:
${JSON.stringify(brief, null, 2)}

HISTORIAL DE PREGUNTAS:
${history.map(q => `- ${q}`).join('\n')}

Encuentra una pregunta alternativa que NO sea duplicada.`
              }
            ],
            temperature: 0.7,
            max_tokens: 300
          })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content.trim());
        
        if (result.nextQuestion && !history.includes(result.nextQuestion.question)) {
          console.log(`✅ Pregunta alternativa válida encontrada en intento ${attempt}`);
          return { ...result.nextQuestion, completed: false };
        } else {
          console.log(`❌ Intento ${attempt} falló - pregunta duplicada o nula`);
        }
      } catch (error: any) {
        if (error.name === 'AbortError') {
          console.log(`⚠️ Request cancelado en intento ${attempt}`);
          return null; // Salir temprano si fue cancelado
        }
        console.error(`❌ Error en intento ${attempt}:`, error);
      }
    }
    
    console.log('❌ No se pudo obtener pregunta alternativa después de todos los intentos');
    return null;
  }, [createNewAbortController]);

  const determineNextQuestion = useCallback(async (brief: any, history: string[]): Promise<StructuredQuestion | null> => {
    console.log('🤖 Determinando la siguiente mejor pregunta...');
    console.log('📝 Historial de preguntas:', history);
    console.log('📋 Brief actual:', JSON.stringify(brief, null, 2));
    
    // Límite de seguridad para evitar loops infinitos
    const MAX_QUESTIONS = 20;
    if (history.length >= MAX_QUESTIONS) {
      console.log('⚠️ Se alcanzó el límite máximo de preguntas. Finalizando chat.');
      return null;
    }
    
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) throw new Error("OpenAI API key no encontrada.");

    const systemPrompt = `Eres un Director de Estrategia de Marketing de clase mundial. Tu objetivo es determinar la SIGUIENTE MEJOR PREGUNTA para hacerle a un usuario para mejorar un brief de marketing. Debes ser dinámico y basar tu decisión en el estado ACTUAL del brief y las preguntas YA HECHAS.

CONTEXTO:
- El usuario está en un chat interactivo para mejorar su brief.
- Tu trabajo es actuar como un consultor inteligente, no como un bot que sigue un script.
- Debes analizar el brief que se te proporciona y el historial de preguntas para decidir qué preguntar a continuación.

REGLAS CRÍTICAS:
1. NO REPETIR: NUNCA hagas una pregunta sobre un tema que ya esté en el historial. Si ya preguntaste sobre KPIs, métricas, objetivos o cualquier otro tema, NO lo vuelvas a preguntar.
2. VERIFICAR CONTENIDO: ANTES de sugerir una pregunta, verifica si ese campo ya tiene contenido en el brief. Si un campo ya tiene datos válidos (no vacío, no null, no array vacío), busca OTRO campo que esté vacío.
3. BUSCAR VACÍOS: Tu prioridad es encontrar campos que estén VACÍOS o INCOMPLETOS en el brief.
4. SER CONTEXTUAL: La pregunta debe basarse en la información existente y faltante en el brief.
5. PRIORIZAR: Enfócate en los vacíos más críticos primero (ej. objetivos, audiencia) antes de pasar a detalles menores.
6. SER CONVERSACIONAL: Formula la pregunta de una manera natural y consultiva, reconociendo lo que ya existe.
7. UNA SOLA PREGUNTA: Devuelve solo UNA pregunta, la más importante para el momento actual.
8. CAMPO CORRECTO: El campo "field" debe corresponder exactamente al campo del brief que se va a actualizar y debe estar VACÍO o INCOMPLETO.

Si hay campos vacíos, DEBES hacer una pregunta sobre uno de ellos. Solo devuelve null si:
1. No hay campos vacíos o incompletos
2. Ya se han hecho todas las preguntas relevantes
3. El brief está realmente completo y bien desarrollado

FORMATO DE SALIDA: Responde ÚNICAMENTE con un objeto JSON que contenga la siguiente pregunta, o null si no hay más.

{
  "nextQuestion": {
    "id": "q-dinamica-123",
    "field": "campo_a_mejorar",
    "question": "Tu pregunta conversacional y estratégica aquí...",
    "priority": "high|medium|low"
  }
}

O si no hay más preguntas:

{
  "nextQuestion": null
}`;

    // Identificar campos vacíos o incompletos
    const emptyFields: string[] = [];
    const checkField = (obj: any, path: string = '') => {
      Object.keys(obj).forEach(key => {
        const fullPath = path ? `${path}.${key}` : key;
        const value = obj[key];
        
        if (value === null || value === undefined || value === '' || 
            (Array.isArray(value) && value.length === 0) ||
            (typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0)) {
          emptyFields.push(fullPath);
        } else if (typeof value === 'object' && !Array.isArray(value)) {
          checkField(value, fullPath);
        }
      });
    };
    
    checkField(brief);
    
    console.log('📋 Campos vacíos detectados:', emptyFields);
    
    const userPrompt = `BRIEF ACTUAL:
${JSON.stringify(brief, null, 2)}

CAMPOS VACÍOS O INCOMPLETOS:
${emptyFields.length > 0 ? emptyFields.map(f => `- ${f}`).join('\n') : 'Ninguno'}

PREGUNTAS YA HECHAS (HISTORIAL):
${history.length > 0 ? history.map(q => `- ${q}`).join('\n') : 'Ninguna pregunta hecha aún'}

Basado en el brief actual, los campos vacíos y el historial, ¿cuál es la siguiente pregunta más valiosa y estratégica que debo hacer? 
IMPORTANTE: Enfócate en los campos que están VACÍOS o INCOMPLETOS.`;

    try {
      const abortController = createNewAbortController();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        signal: abortController.signal,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          temperature: 0.5,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) throw new Error(`Error de la API de OpenAI: ${response.status}`);
      
      const data = await response.json();
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(data.choices[0].message.content);
      } catch (parseError) {
        console.error('Error parsing JSON response:', parseError);
        throw new Error('Respuesta inválida de la API');
      }
      
      if (parsedResponse.nextQuestion) {
        const nextQ = parsedResponse.nextQuestion;
        console.log('✅ Siguiente pregunta determinada:', nextQ.question);
        console.log('📝 Campo objetivo:', nextQ.field);
        return { ...nextQ, completed: false };
      } else {
        console.log('✅ No hay más preguntas valiosas. Finalizando chat.');
        return null;
      }
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('⚠️ Request cancelado para determinar siguiente pregunta');
        return null;
      }
      console.error("Error determinando la siguiente pregunta:", e);
      setError("No pude determinar la siguiente pregunta. Intenta de nuevo.");
      return null;
    }
  }, [createNewAbortController]);

  // --- LÓGICA DE ENRIQUECIMIENTO DE RESPUESTAS ---
  const enrichUserResponse = useCallback(async (question: string, userResponse: string): Promise<string> => {
    console.log('🤖 Enriqueciendo la respuesta del usuario con IA...');
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) return userResponse;

    const systemPrompt = `Eres un Director de Estrategia Senior. Tu misión es transformar la respuesta de un usuario en contenido de CLASE MUNDIAL para un brief de marketing.

OBJETIVO: Tomar la respuesta del usuario y crear una versión que sea específica, medible, accionable y profesional. Agrega métricas, insights y contexto estratégico.

EJEMPLO:
- Pregunta: "¿Cuál es el objetivo principal?"
- Respuesta de Usuario: "Vender más"
- TU SALIDA ENRIQUECIDA: "Incrementar las ventas en un 25% vs Q4 2023, enfocándose en aumentar la frecuencia de compra de usuarios existentes y capturar un 15% de market share en el segmento premium, con un ROI mínimo de 3:1."

REGLAS:
- Mantén la intención original del usuario.
- Multiplica la profundidad y profesionalismo.
- Responde ÚNICAMENTE con el texto transformado. NADA MÁS.`;

    const userMessage = `Pregunta original: "${question}"

Respuesta del usuario:
---
${userResponse}
---

Refina y enriquece esta respuesta.`;

    try {
      const abortController = createNewAbortController();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        signal: abortController.signal,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userMessage }],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) throw new Error(`Error de la API de OpenAI: ${response.status}`);
      const data = await response.json();
      const improvedText = data.choices?.[0]?.message?.content.trim();
      console.log("✅ Respuesta enriquecida:", improvedText);
      return improvedText || userResponse;
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('⚠️ Request cancelado para enriquecer respuesta');
        return userResponse; // Devolver respuesta original si fue cancelado
      }
      console.error("Error enriqueciendo la respuesta:", e);
      return userResponse;
    }
  }, [createNewAbortController]);

  // --- LÓGICA PRINCIPAL DEL CHAT ---

  const initializeChat = useCallback(async () => {
    console.log('🔄 Inicializando chat dinámico...');
    setIsTyping(true);
    setError(null);
    setMessages([]);
    setQuestionHistory([]);
    setCurrentQuestion(null);

    const welcomeMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: "¡Hola! He analizado tu brief. Empecemos a mejorarlo juntos. Haré preguntas una por una para refinar cada sección. ¿Listo?",
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);

    const nextQuestion = await determineNextQuestion(workingBrief, []);
    if (nextQuestion) {
      setCurrentQuestion(nextQuestion);
      setQuestionHistory(prev => [...prev, nextQuestion.question]);
      const firstQuestionMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: nextQuestion.question,
        timestamp: Date.now(),
        questionId: nextQuestion.id,
        briefField: nextQuestion.field,
      };
      setMessages(prev => [...prev, firstQuestionMessage]);
    } else {
      // No hay preguntas, el brief ya es excelente
      const noQuestionsMessage: ChatMessage = {
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: "🎉 ¡Excelente! Tu brief está muy completo. No he encontrado áreas críticas que requieran mejoras inmediatas.",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, noQuestionsMessage]);
    }

    setIsTyping(false);
  }, [workingBrief, determineNextQuestion]);

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isTyping || !currentQuestion) return;

    setIsTyping(true);

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageContent.trim(),
      timestamp: Date.now(),
      questionId: currentQuestion.id,
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      // 1. Enriquecer la respuesta del usuario
      const enrichedResponse = await enrichUserResponse(currentQuestion.question, messageContent.trim());

      // 2. Actualizar el brief localmente
      const updatedBrief = { ...workingBrief };
      const field = currentQuestion.field;
      const shouldBeArray = getArrayFields().includes(field);
      const finalValue = shouldBeArray
        ? enrichedResponse.split('\n').map(item => item.replace(/^- /, '').trim()).filter(Boolean)
        : enrichedResponse;

      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (!updatedBrief[parent]) updatedBrief[parent] = {};
        
        // Validar el tipo de campo existente antes del reemplazo
        const existingValue = updatedBrief[parent][child];
        const existingIsArray = Array.isArray(existingValue);
        const newValueIsArray = Array.isArray(finalValue);
        
        if (shouldBeArray) {
          // El campo DEBERÍA ser un array según la configuración
          if (existingIsArray || existingValue === undefined || existingValue === null) {
            // Seguro reemplazar: campo existente es array, undefined o null
            updatedBrief[parent][child] = finalValue;
            console.log(`✅ Actualizado campo array ${field}:`, updatedBrief[parent][child]);
          } else {
            // Campo existente no es array pero DEBERÍA serlo - convertir o reemplazar cuidadosamente
            console.warn(`⚠️ Campo ${field} debería ser array pero tiene valor no-array:`, existingValue);
            if (typeof existingValue === 'string' && existingValue.trim()) {
              // Si es string no vacío, convertir a array combinando valores
              const existingAsArray = [existingValue.trim()];
              updatedBrief[parent][child] = newValueIsArray ? 
                [...existingAsArray, ...finalValue] : 
                [...existingAsArray, finalValue];
            } else {
              // Reemplazar completamente si no es string válido
              updatedBrief[parent][child] = finalValue;
            }
            console.log(`✅ Convertido y actualizado ${field}:`, updatedBrief[parent][child]);
          }
        } else {
          // El campo NO debería ser un array según la configuración
          if (newValueIsArray) {
            console.warn(`⚠️ Valor nuevo es array pero campo ${field} no debería ser array`);
            // Tomar el primer elemento del array o unir como string
            updatedBrief[parent][child] = finalValue.length > 0 ? 
              (finalValue.length === 1 ? finalValue[0] : finalValue.join(', ')) : 
              existingValue; // Mantener valor existente si el array está vacío
          } else {
            // Reemplazo normal para campos no-array
            updatedBrief[parent][child] = finalValue;
          }
          console.log(`✅ Actualizado campo no-array ${field}:`, updatedBrief[parent][child]);
        }
      } else {
        // Campo de nivel superior (sin punto)
        const existingValue = updatedBrief[field];
        const existingIsArray = Array.isArray(existingValue);
        const newValueIsArray = Array.isArray(finalValue);
        
        if (shouldBeArray) {
          // El campo DEBERÍA ser un array
          if (existingIsArray || existingValue === undefined || existingValue === null) {
            updatedBrief[field] = finalValue;
            console.log(`✅ Actualizado campo array ${field}:`, updatedBrief[field]);
          } else {
            console.warn(`⚠️ Campo ${field} debería ser array pero tiene valor no-array:`, existingValue);
            if (typeof existingValue === 'string' && existingValue.trim()) {
              const existingAsArray = [existingValue.trim()];
              updatedBrief[field] = newValueIsArray ? 
                [...existingAsArray, ...finalValue] : 
                [...existingAsArray, finalValue];
            } else {
              updatedBrief[field] = finalValue;
            }
            console.log(`✅ Convertido y actualizado ${field}:`, updatedBrief[field]);
          }
        } else {
          // El campo NO debería ser un array
          if (newValueIsArray) {
            console.warn(`⚠️ Valor nuevo es array pero campo ${field} no debería ser array`);
            updatedBrief[field] = finalValue.length > 0 ? 
              (finalValue.length === 1 ? finalValue[0] : finalValue.join(', ')) : 
              existingValue;
          } else {
            updatedBrief[field] = finalValue;
          }
          console.log(`✅ Actualizado campo no-array ${field}:`, updatedBrief[field]);
        }
      }

      setWorkingBrief(updatedBrief);
      onBriefChange(updatedBrief); // Notificar al componente padre

      // 3. Determinar la siguiente pregunta basada en el brief actualizado
      const nextQuestion = await determineNextQuestion(updatedBrief, questionHistory);

      if (nextQuestion) {
        // Verificar si la pregunta es duplicada O si el campo ya fue procesado recientemente
        const isDuplicateQuestion = questionHistory.includes(nextQuestion.question);
        const recentFields = questionHistory.slice(-3); // Últimos 3 campos procesados
        const isRepeatingField = recentFields.filter(q => q.includes(nextQuestion.field)).length > 1;
        
        if (isDuplicateQuestion || isRepeatingField) {
          const reason = isDuplicateQuestion ? 'pregunta duplicada' : 'campo procesado recientemente';
          console.warn(`⚠️ Se detectó ${reason}, intentando obtener una alternativa:`, nextQuestion.question);
          
          // Intentar obtener una pregunta alternativa
          const alternativeQuestion = await attemptAlternativeQuestion(updatedBrief, questionHistory, nextQuestion);
          
          if (alternativeQuestion) {
            console.log('✅ Pregunta alternativa obtenida:', alternativeQuestion.question);
            setCurrentQuestion(alternativeQuestion);
            setQuestionHistory(prev => [...prev, alternativeQuestion.question]);
            
            const alternativeQuestionMessage: ChatMessage = {
              id: `assistant-${Date.now() + 1}`,
              role: 'assistant',
              content: `¡Perfecto! He actualizado el brief con esa información.

${alternativeQuestion.question}`,
              timestamp: Date.now(),
              questionId: alternativeQuestion.id,
              briefField: alternativeQuestion.field,
            };
            setMessages(prev => [...prev, alternativeQuestionMessage]);
          } else {
            console.log('ℹ️ No se encontró pregunta alternativa válida. Finalizando chat.');
            // No hay pregunta alternativa válida, finalizar el chat
            setCurrentQuestion(null);
            const completionMessage: ChatMessage = {
              id: `assistant-${Date.now() + 1}`,
              role: 'assistant',
              content: "🎉 ¡Excelente trabajo! Hemos completado todas las mejoras disponibles. Tu brief está listo para usar.",
              timestamp: Date.now(),
            };
            setMessages(prev => [...prev, completionMessage]);
          }
        } else {
          // Pregunta no duplicada, procesar normalmente
          setCurrentQuestion(nextQuestion);
          setQuestionHistory(prev => [...prev, nextQuestion.question]);
          
          const nextQuestionMessage: ChatMessage = {
            id: `assistant-${Date.now() + 1}`,
            role: 'assistant',
            content: `¡Perfecto! He actualizado el brief con esa información.

${nextQuestion.question}`,
            timestamp: Date.now(),
            questionId: nextQuestion.id,
            briefField: nextQuestion.field,
          };
          setMessages(prev => [...prev, nextQuestionMessage]);
        }
      } else {
        // No hay más preguntas
        setCurrentQuestion(null);
        const completionMessage: ChatMessage = {
          id: `assistant-${Date.now() + 1}`,
          role: 'assistant',
          content: "🎉 ¡Hemos completado todas las mejoras! Tu brief ahora está mucho más robusto y profesional. Puedes revisarlo y aplicar los cambios.",
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, completionMessage]);
      }
    } catch (err: any) {
      console.error('Error en sendMessage:', err);
      setError(err.message || 'Error en la comunicación');
    } finally {
      setIsTyping(false);
    }
  }, [
    isTyping,
    currentQuestion,
    workingBrief,
    questionHistory,
    enrichUserResponse,
    determineNextQuestion,
    getArrayFields,
    onBriefChange,
    attemptAlternativeQuestion,
  ]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setCurrentQuestion(null);
    setQuestionHistory([]);
    setError(null);
    setBriefQuality(null);
    setWorkingBrief(normalizeBrief(initialBrief));
  }, [initialBrief]);
  
  // Evaluate brief quality
  const evaluateBriefQuality = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      const openaiApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
      
      if (!openaiApiKey) {
        throw new Error("API key no configurada");
      }

      const abortController = createNewAbortController();
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`
        },
        signal: abortController.signal,
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `Eres un evaluador experto de briefs publicitarios. Analiza el brief y devuelve SOLO un JSON con este formato exacto:
{
  "overallScore": <número del 0 al 100>,
  "isExcellent": <true si el score es 90 o más>,
  "readyForProduction": <true si el score es 70 o más>,
  "strengths": [<array de fortalezas clave>],
  "remainingGaps": [<array de áreas de mejora>],
  "recommendation": "<recomendación breve>"
}`
            },
            {
              role: 'user',
              content: `Evalúa este brief:\n${JSON.stringify(workingBrief, null, 2)}`
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`Error en la API: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (content) {
        const quality = JSON.parse(content);
        setBriefQuality(quality);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('⚠️ Request cancelado para evaluar calidad del brief');
        return; // Salir temprano si fue cancelado
      }
      setError(err instanceof Error ? err.message : "Error evaluando calidad del brief");
      console.error('Error evaluating brief quality:', err);
    }
  }, [workingBrief, createNewAbortController]);

  return {
    messages,
    currentQuestion,
    isTyping,
    sendMessage,
    clearChat,
    initializeChat,
    isConnected,
    error,
    progress: { // Progreso ya no se basa en un plan estático
      current: questionHistory.length,
      total: questionHistory.length + (currentQuestion ? 1 : 0),
    },
    briefQuality,
    evaluateBriefQuality,
  };
}
