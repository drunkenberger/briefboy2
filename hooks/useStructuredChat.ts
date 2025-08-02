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

  // Función para crear análisis rápido del brief para mensaje de bienvenida
  const analyzeBriefQuickly = useCallback((brief: any) => {
    const title = brief.projectTitle || 'tu proyecto';
    const hasObjectives = brief.strategicObjectives && brief.strategicObjectives.length > 0;
    const hasAudience = brief.targetAudience?.primary && brief.targetAudience.primary.length > 20;
    const hasChannels = brief.channelStrategy?.recommendedMix && brief.channelStrategy.recommendedMix.length > 0;
    
    const completedAreas = [hasObjectives, hasAudience, hasChannels].filter(Boolean).length;
    const totalAreas = 3;
    
    let summary = '';
    if (completedAreas === totalAreas) {
      summary = 'Veo que tienes una base sólida con objetivos, audiencia y canales definidos.';
    } else if (completedAreas >= 2) {
      summary = 'Tu brief tiene buenas bases, pero podemos fortalecerlo aún más.';
    } else if (completedAreas === 1) {
      summary = 'Hay algunas secciones desarrolladas, pero necesitamos profundizar más.';
    } else {
      summary = 'Perfecto, tenemos un buen punto de partida para desarrollar juntos.';
    }
    
    return {
      title,
      summary,
      completedAreas,
      totalAreas
    };
  }, []);

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

    const systemPrompt = `Eres un Director de Estrategia de Marketing de clase mundial con 20+ años de experiencia. Tu objetivo es hacer preguntas ESTRATÉGICAS y RELEVANTES para mejorar un brief de marketing.

CONTEXTO CRÍTICO:
- El usuario ya tiene un brief con contenido. Tu trabajo es MEJORARLO, no llenarlo desde cero.
- Debes analizar PROFUNDAMENTE el contenido existente antes de hacer cualquier pregunta.
- NO hagas preguntas sobre campos que ya tienen información completa y bien desarrollada.

PROCESO DE ANÁLISIS OBLIGATORIO:
1. Lee TODO el brief cuidadosamente
2. Identifica qué secciones tienen contenido COMPLETO vs SUPERFICIAL
3. Busca GAPS ESTRATÉGICOS, no solo campos vacíos
4. Considera el CONTEXTO del proyecto antes de preguntar

REGLAS INQUEBRANTABLES:
1. ANÁLISIS PROFUNDO PRIMERO: Antes de sugerir cualquier pregunta, debes:
   - Verificar si el campo tiene contenido sustancial (más de 2-3 palabras genéricas)
   - Evaluar la CALIDAD del contenido, no solo su existencia
   - Identificar si el contenido es específico y accionable o genérico

2. NO PREGUNTES SOBRE:
   - Campos que ya tienen 3+ elementos detallados (ej: 3 objetivos SMART completos)
   - Secciones con información específica y medible
   - Áreas donde el brief ya muestra profundidad estratégica
   
3. SÍ PREGUNTA SOBRE:
   - Campos con contenido GENÉRICO o VAGO (ej: "aumentar ventas" sin métricas)
   - Secciones con gaps estratégicos evidentes
   - Áreas donde falta especificidad o medibilidad
   - Conexiones faltantes entre diferentes secciones del brief

4. ESTILO DE PREGUNTAS:
   - Reconoce lo que YA EXISTE: "Veo que mencionas X..."
   - Sé ESPECÍFICO: No "¿Cuáles son tus métricas?" sino "¿Qué incremento porcentual esperas en..."
   - Conecta con el contexto: Relaciona tu pregunta con información existente en el brief

5. PRIORIZACIÓN:
   - Primero: Gaps en objetivos estratégicos MEDIBLES
   - Segundo: Definición clara de audiencia y sus pain points
   - Tercero: Métricas de éxito específicas
   - Cuarto: Estrategia creativa diferenciada
   - Último: Detalles de implementación

EJEMPLOS DE ANÁLISIS:
- Si strategicObjectives tiene ["Aumentar ventas", "Mejorar imagen", "Captar clientes"]
  → PREGUNTA porque son genéricos, faltan métricas y plazos
  
- Si strategicObjectives tiene ["Incrementar ventas online 25% en Q4 2024", "Mejorar NPS de 7.2 a 8.5 en 6 meses"]
  → NO PREGUNTES, ya son específicos y medibles

- Si targetAudience.primary dice "Millennials urbanos"
  → PREGUNTA para profundizar en comportamientos, pain points específicos
  
- Si targetAudience.primary tiene descripción detallada con demografía, psicografía y comportamientos
  → NO PREGUNTES, ya está completo

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

    // Análisis inteligente del brief - identifica GAPS ESTRATÉGICOS, no solo campos vacíos
    const analyzeContentQuality = (value: any, fieldPath: string): { isStrong: boolean, reason: string } => {
      if (!value || value === null || value === undefined || value === '') {
        return { isStrong: false, reason: 'Campo completamente vacío' };
      }
      
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return { isStrong: false, reason: 'Array vacío' };
        }
        
        // Análisis específico por tipo de campo
        if (fieldPath === 'strategicObjectives') {
          const hasSmartObjectives = value.some(obj => 
            typeof obj === 'string' && 
            obj.length > 40 && 
            /\d+/.test(obj) && // Contiene números
            (/mes|año|trimestre|%|día|semana|Q[1-4]/i.test(obj)) // Contiene tiempo
          );
          return { 
            isStrong: hasSmartObjectives && value.length >= 2, 
            reason: hasSmartObjectives ? `${value.length} objetivos SMART con métricas` : `${value.length} objetivos genéricos sin métricas específicas` 
          };
        }
        
        if (fieldPath === 'channelStrategy.recommendedMix') {
          const hasDetailedChannels = value.some(channel => 
            channel && typeof channel === 'object' &&
            channel.allocation && channel.rationale &&
            String(channel.allocation).length > 5 && 
            String(channel.rationale).length > 30
          );
          return {
            isStrong: hasDetailedChannels && value.length >= 3,
            reason: hasDetailedChannels ? `${value.length} canales con estrategia detallada` : `${value.length} canales sin justificación estratégica completa`
          };
        }
        
        if (fieldPath.includes('insights') || fieldPath === 'successMetrics.primary') {
          const hasQualityItems = value.filter(item => 
            typeof item === 'string' && item.length > 25
          ).length;
          return {
            isStrong: hasQualityItems >= 2,
            reason: `${hasQualityItems}/${value.length} elementos con profundidad suficiente`
          };
        }
        
        // Para otros arrays
        const substantialItems = value.filter(item => {
          if (typeof item === 'string') return item.trim().length > 20;
          if (typeof item === 'object') {
            return Object.values(item).some(v => v && String(v).length > 15);
          }
          return true;
        }).length;
        
        return {
          isStrong: substantialItems >= Math.min(2, value.length),
          reason: `${substantialItems}/${value.length} elementos con contenido sustancial`
        };
      }
      
      if (typeof value === 'string') {
        const trimmed = value.trim();
        
        // Detectar contenido genérico o muy corto
        const genericKeywords = ['por definir', 'tbd', 'n/a', 'na', 'pendiente', 'aumentar', 'mejorar', 'optimizar'];
        const isGeneric = genericKeywords.some(keyword => 
          trimmed.toLowerCase().includes(keyword.toLowerCase())
        ) || trimmed.length < 20;
        
        // Análisis específico por campo
        if (fieldPath === 'targetAudience.primary') {
          const hasDetailedSegmentation = trimmed.length > 80 && 
            /edad|años|ingresos|comportamiento|necesidad|problema|dolor|motivación/i.test(trimmed);
          return {
            isStrong: hasDetailedSegmentation,
            reason: hasDetailedSegmentation ? 
              'Audiencia bien segmentada con demografía y psicografía' : 
              'Audiencia muy general, falta segmentación detallada'
          };
        }
        
        if (fieldPath === 'brandPositioning') {
          const hasUniquePositioning = trimmed.length > 60 && 
            /diferencia|único|competencia|ventaja|posición|distint/i.test(trimmed);
          return {
            isStrong: hasUniquePositioning,
            reason: hasUniquePositioning ? 
              'Posicionamiento diferenciado y específico' : 
              'Posicionamiento genérico, falta diferenciación clara'
          };
        }
        
        if (fieldPath === 'creativeStrategy.bigIdea') {
          const hasCreativeDepth = trimmed.length > 50 && 
            !/^(por definir|creativo|campaña|publicidad)$/i.test(trimmed);
          return {
            isStrong: hasCreativeDepth,
            reason: hasCreativeDepth ? 
              'Big Idea creativa bien definida' : 
              'Big Idea muy genérica o superficial'
          };
        }
        
        return {
          isStrong: !isGeneric && trimmed.length > 30,
          reason: isGeneric ? 
            'Contenido genérico que necesita especificidad' : 
            `Contenido específico (${trimmed.length} caracteres)`
        };
      }
      
      if (typeof value === 'object') {
        const filledProps = Object.entries(value).filter(([k, v]) => 
          v !== null && v !== undefined && v !== '' && 
          (typeof v !== 'string' || v.trim() !== '')
        ).length;
        
        const totalProps = Object.keys(value).length;
        return {
          isStrong: filledProps >= Math.ceil(totalProps * 0.7), // 70% de propiedades llenas
          reason: `${filledProps}/${totalProps} propiedades con contenido`
        };
      }
      
      return { isStrong: true, reason: 'Valor presente y válido' };
    };
    
    // Campos críticos para analizar
    const criticalFields = [
      'strategicObjectives',
      'targetAudience.primary', 
      'targetAudience.insights',
      'brandPositioning',
      'creativeStrategy.bigIdea',
      'creativeStrategy.messageHierarchy',
      'channelStrategy.recommendedMix',
      'successMetrics.primary',
      'budgetConsiderations.estimatedRange',
      'businessChallenge'
    ];
    
    const fieldAnalysis: Record<string, { isStrong: boolean, reason: string }> = {};
    const weakFields: string[] = [];
    const strongFields: string[] = [];
    
    // Función para acceder a campos anidados
    const getNestedValue = (obj: any, path: string) => {
      return path.split('.').reduce((current, key) => {
        return current && typeof current === 'object' ? current[key] : undefined;
      }, obj);
    };
    
    // Analizar cada campo crítico
    criticalFields.forEach(fieldPath => {
      const fieldValue = getNestedValue(brief, fieldPath);
      const analysis = analyzeContentQuality(fieldValue, fieldPath);
      fieldAnalysis[fieldPath] = analysis;
      
      if (analysis.isStrong) {
        strongFields.push(fieldPath);
      } else {
        weakFields.push(fieldPath);
      }
    });
    
    console.log('🎯 Análisis de calidad del brief:');
    console.log('💪 Campos fuertes:', strongFields.length, strongFields);
    console.log('⚠️ Campos débiles:', weakFields.length, weakFields);
    console.log('📊 Detalles:', fieldAnalysis);
    
    const userPrompt = `PROYECTO: "${brief.projectTitle || 'Brief sin título'}"

ANÁLISIS DE CALIDAD DEL BRIEF:

🔴 CAMPOS DÉBILES que necesitan mejora (priorizar estas preguntas):
${weakFields.length > 0 ? 
  weakFields.map(field => `- ${field}: ${fieldAnalysis[field].reason}`).join('\n') : 
  'Ningún campo débil detectado'}

🟢 CAMPOS FUERTES que ya están bien desarrollados (NO preguntar sobre estos):
${strongFields.length > 0 ? 
  strongFields.map(field => `- ${field}: ${fieldAnalysis[field].reason}`).join('\n') : 
  'Ningún campo fuerte detectado'}

📚 HISTORIAL DE PREGUNTAS YA HECHAS (NO repetir temas):
${history.length > 0 ? history.map((q, i) => `${i + 1}. ${q}`).join('\n') : 'Esta es la primera pregunta'}

🎯 INSTRUCCIONES ESPECÍFICAS:
- SOLO pregunta sobre los campos DÉBILES listados arriba
- Reconoce el contenido existente: "Veo que ya tienes definido X, pero..."
- Haz preguntas específicas y contextuales al proyecto
- Busca profundizar en GAPS ESTRATÉGICOS, no llenar campos vacíos
- Si no hay campos débiles o todas las preguntas relevantes fueron hechas, devuelve null

BRIEF COMPLETO PARA CONTEXTO:
${JSON.stringify(brief, null, 2)}`;

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

    // Analizar el brief para crear mensaje contextual
    const briefAnalysis = analyzeBriefQuickly(workingBrief);
    
    const welcomeMessage: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: `¡Hola! Soy tu asesor estratégico de marketing. 📋

He revisado tu brief sobre "${briefAnalysis.title}". ${briefAnalysis.summary}

Voy a hacerte preguntas específicas y estratégicas para identificar oportunidades de mejora y fortalecer las áreas más críticas. Trabajemos juntos para llevarlo al siguiente nivel. 

¿Comenzamos? 🚀`,
      timestamp: Date.now(),
    };
    setMessages([welcomeMessage]);

    // Añadir delay para mejor experiencia de usuario
    setTimeout(async () => {
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
          content: "🎉 ¡Impresionante! Tu brief está muy bien desarrollado. He analizado las áreas críticas y no encuentro gaps estratégicos significativos que requieran atención inmediata. ¡Buen trabajo!",
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, noQuestionsMessage]);
      }
      setIsTyping(false);
    }, 1500);
  }, [workingBrief, determineNextQuestion, analyzeBriefQuickly]);

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
