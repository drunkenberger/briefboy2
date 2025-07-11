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
    { key: 'creativeStrategy.bigIdea', label: 'Gran Idea Creativa', required: true },
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

  // Generar preguntas estructuradas basadas en el brief completo
  const generateStructuredQuestions = useCallback((briefData: any, analysisData: any): StructuredQuestion[] => {
    const questions: StructuredQuestion[] = [];
    
    console.log('Generando preguntas para todo el brief:', { briefData });
    
    // Usar la función centralizada para obtener todos los campos
    const allBriefFields = getAllBriefFields();
    
    // Generar preguntas para cada campo usando la lógica inteligente
    allBriefFields.forEach((field) => {
      const fieldQuestions = generateQuestionsForBriefField(field, briefData);
      questions.push(...fieldQuestions);
    });
    
    // Ordenar por prioridad (requeridos primero)
    const sortedQuestions = questions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    console.log('Preguntas generadas después de filtros inteligentes:', sortedQuestions.length, sortedQuestions.map(q => `${q.field}: ${q.question.substring(0, 50)}...`));
    
    return sortedQuestions;
  }, [getArrayFields]);
  
  // Función para generar preguntas adicionales basadas en campos faltantes o débiles
  const generateAdditionalQuestions = useCallback((briefData: any, completedQuestionsSet?: Set<string>): StructuredQuestion[] => {
    const questions: StructuredQuestion[] = [];
    const questionsToCheck = completedQuestionsSet || completedQuestions;
    
    // Usar la función centralizada para obtener todos los campos
    const allBriefFields = getAllBriefFields();
    
    // Revisar cada campo y generar preguntas si es necesario
    allBriefFields.forEach((field) => {
      const questionId = `field-${field.key}`;
      
      // Solo generar si no está ya completada
      if (!questionsToCheck.has(questionId)) {
        const fieldQuestions = generateQuestionsForBriefField(field, briefData);
        
        // Filtrar preguntas que no hayan sido completadas
        const newQuestions = fieldQuestions.filter(q => !questionsToCheck.has(q.id));
        questions.push(...newQuestions);
      }
    });
    
    console.log('🔄 Preguntas adicionales generadas:', {
      totalGenerated: questions.length,
      questionsFields: questions.map(q => q.field),
      briefFieldsAnalyzed: allBriefFields.length,
      completedQuestionsCount: questionsToCheck.size,
      sampleBriefContent: {
        projectTitle: briefData?.projectTitle,
        strategicObjectives: briefData?.strategicObjectives,
        targetAudience: briefData?.targetAudience
      }
    });
    
    return questions;
  }, [completedQuestions, getAllBriefFields]);
  
  // Función para evaluar si un campo necesita mejora basado en su contenido y tipo
  const needsImprovement = (fieldKey: string, currentValue: any): boolean => {
    if (!currentValue) return false;
    
    // Diferentes criterios según el tipo de campo
    switch (fieldKey) {
      case 'projectTitle':
        // Un título es bueno si tiene al menos 3 palabras significativas y no es genérico
        const titleWords = currentValue.split(' ').filter((w: string) => w.length > 2);
        const isGeneric = currentValue.toLowerCase().includes('proyecto') &&
                         currentValue.toLowerCase().includes('campaña') &&
                         currentValue.toLowerCase().includes('brief');
        const isTooShort = titleWords.length < 2;
        const isVeryGeneric = currentValue.toLowerCase() === 'proyecto' || 
                             currentValue.toLowerCase() === 'campaña' ||
                             currentValue.toLowerCase() === 'brief';
        
        // Solo necesita mejora si es realmente débil
        return isTooShort || isVeryGeneric || (isGeneric && titleWords.length < 4);
      
      case 'briefSummary':
        // Un resumen debe tener al menos 100 caracteres y ser descriptivo
        return currentValue.length < 100 || 
               !currentValue.includes('objetivo') ||
               currentValue.split('.').length < 3;
      
      case 'businessChallenge':
        // Un desafío debe explicar un problema específico
        return currentValue.length < 80 ||
               !currentValue.toLowerCase().includes('problema') ||
               !currentValue.toLowerCase().includes('necesita');
      
      case 'strategicObjectives':
        // Objetivos deben ser específicos y medibles
        if (Array.isArray(currentValue)) {
          return currentValue.length < 3 ||
                 currentValue.some((obj: string) => obj.length < 30 || !obj.includes('%'));
        }
        return true;
      
      case 'targetAudience.primary':
        // Audiencia debe incluir demografía y psicografía
        return currentValue.length < 100 ||
               !currentValue.toLowerCase().includes('edad') ||
               !currentValue.toLowerCase().includes('inter');
      
      case 'targetAudience.insights':
        // Insights deben ser profundos y específicos
        if (Array.isArray(currentValue)) {
          return currentValue.length < 2 ||
                 currentValue.some((insight: string) => insight.length < 50);
        }
        return true;
      
      case 'brandPositioning':
        // Posicionamiento debe ser claro y diferenciado
        return currentValue.length < 80 ||
               !currentValue.toLowerCase().includes('competencia') ||
               !currentValue.toLowerCase().includes('único');
      
      case 'creativeStrategy.bigIdea':
        // Gran idea debe ser impactante y memorable
        return currentValue.length < 60 ||
               currentValue.split(' ').length < 8;
      
      case 'creativeStrategy.messageHierarchy':
        // Mensajes deben estar jerarquizados
        if (Array.isArray(currentValue)) {
          return currentValue.length < 3 ||
                 currentValue.some((msg: string) => msg.length < 20);
        }
        return true;
      
      case 'creativeStrategy.toneAndManner':
        // Tono debe ser específico y detallado
        return currentValue.length < 60 ||
               currentValue.split(',').length < 3;
      
      case 'channelStrategy.integratedApproach':
        // Enfoque integrado debe explicar sinergia
        return currentValue.length < 100 ||
               !currentValue.toLowerCase().includes('canal') ||
               !currentValue.toLowerCase().includes('integra');
      
      case 'successMetrics.primary':
        // KPIs deben ser específicos y medibles
        if (Array.isArray(currentValue)) {
          return currentValue.length < 3 ||
                 currentValue.some((kpi: string) => kpi.length < 20 || !kpi.includes('%'));
        }
        return true;
      
      case 'successMetrics.measurementFramework':
        // Framework debe explicar metodología
        return currentValue.length < 100 ||
               !currentValue.toLowerCase().includes('medición') ||
               !currentValue.toLowerCase().includes('método');
      
      case 'nextSteps':
        // Próximos pasos deben ser actionables
        if (Array.isArray(currentValue)) {
          return currentValue.length < 3 ||
                 currentValue.some((step: string) => step.length < 30 || !step.includes('semana'));
        }
        return true;
      
      // Campos que normalmente están vacíos en briefs iniciales
      case 'riskAssessment.risks':
      case 'implementationRoadmap.phases':
      case 'budgetConsiderations.estimatedRange':
      case 'budgetConsiderations.keyInvestments':
      case 'budgetConsiderations.costOptimization':
      case 'channelStrategy.recommendedMix':
      case 'successMetrics.secondary':
      case 'appendix.assumptions':
      case 'appendix.references':
        // Estos campos casi siempre necesitan trabajo
        return true;
      
      default:
        // Para campos no especificados, usar criterio general
        if (Array.isArray(currentValue)) {
          return currentValue.length < 2;
        }
        return currentValue.length < 50;
    }
  };
  
  // Función para generar preguntas para un campo específico del brief
  const generateQuestionsForBriefField = (fieldConfig: any, briefData: any): StructuredQuestion[] => {
    const questions: StructuredQuestion[] = [];
    
    // Obtener el valor actual del campo
    let currentValue: any;
    if (fieldConfig.key.includes('.')) {
      const [parent, child] = fieldConfig.key.split('.');
      currentValue = briefData[parent]?.[child];
    } else {
      currentValue = briefData[fieldConfig.key];
    }
    
    // Determinar si el campo necesita mejora
    const isEmpty = !currentValue || 
      (Array.isArray(currentValue) && currentValue.length === 0) ||
      (typeof currentValue === 'string' && currentValue.trim() === '') ||
      (typeof currentValue === 'object' && Object.keys(currentValue).length === 0);
    
    // Lógica inteligente para determinar si un campo es débil basado en su tipo
    const isWeak = !isEmpty && needsImprovement(fieldConfig.key, currentValue);
    
    // Generar pregunta solo si el campo está vacío o realmente necesita mejora
    if (isEmpty || isWeak) {
      const priority = fieldConfig.required ? 'high' : 'medium';
      const question = generateQuestionForField(fieldConfig.key, fieldConfig.label, currentValue, isEmpty);
      
      console.log(`Campo ${fieldConfig.key}: isEmpty=${isEmpty}, isWeak=${isWeak}, valor="${currentValue}", pregunta generada=${!!question}`);
      
      if (question) {
        questions.push({
          id: `field-${fieldConfig.key}`,
          field: fieldConfig.key,
          question,
          priority,
          completed: false,
        });
      }
    } else {
      console.log(`Campo ${fieldConfig.key}: NO necesita mejora - valor="${currentValue}"`);
    }
    
    return questions;
  };
  
  // Función para generar la pregunta específica para cada campo
  const generateQuestionForField = (fieldKey: string, fieldLabel: string, currentValue: any, isEmpty: boolean): string => {
    if (isEmpty) {
      // Preguntas para campos vacíos
      const emptyQuestions: { [key: string]: string } = {
        'projectTitle': 'Necesitamos un título específico para el proyecto. ¿Cuál es el nombre oficial de la campaña o proyecto?',
        'briefSummary': 'Falta el resumen ejecutivo. ¿Puedes describir en 2-3 párrafos qué es este proyecto, por qué es importante y qué se espera lograr?',
        'businessChallenge': 'No veo definido el desafío de negocio. ¿Cuál es el problema específico que esta campaña debe resolver?',
        'strategicObjectives': 'Necesitamos objetivos estratégicos claros. ¿Cuáles son los 3-5 objetivos principales que quieres alcanzar con esta campaña?',
        'targetAudience.primary': 'Falta definir la audiencia primaria. ¿Quién es exactamente tu audiencia objetivo principal? Incluye demografía, psicografía y comportamientos.',
        'targetAudience.insights': 'Necesitamos insights sobre la audiencia. ¿Qué motivaciones, necesidades o comportamientos clave has identificado en tu audiencia?',
        'brandPositioning': 'No hay posicionamiento de marca definido. ¿Cómo quieres que tu marca sea percibida en relación a la competencia?',
        'creativeStrategy.bigIdea': 'Falta la gran idea creativa. ¿Cuál es el concepto central que guiará toda la campaña?',
        'creativeStrategy.messageHierarchy': 'Necesitamos la jerarquía de mensajes. ¿Cuáles son los mensajes clave ordenados por importancia?',
        'creativeStrategy.toneAndManner': 'No está definido el tono y manera. ¿Cómo debe sonar y sentirse la comunicación de la marca?',
        'channelStrategy.integratedApproach': 'Falta el enfoque integrado de canales. ¿Cómo se complementarán los diferentes canales de comunicación?',
        'successMetrics.primary': 'No hay KPIs primarios definidos. ¿Cuáles son las métricas principales para medir el éxito de la campaña?',
        'successMetrics.measurementFramework': 'Falta el framework de medición. ¿Cómo medirás el éxito de manera integral?',
        'riskAssessment.risks': 'No hay análisis de riesgos. ¿Qué riesgos potenciales identificas para este proyecto y cómo los mitigarías?',
        'implementationRoadmap.phases': 'Falta la hoja de ruta de implementación. ¿Cuáles serían las fases principales para ejecutar esta campaña?',
        'nextSteps': 'No hay próximos pasos definidos. ¿Cuáles son las acciones inmediatas que se deben tomar?',
        'budgetConsiderations.estimatedRange': 'No hay estimación presupuestaria. ¿Cuál es el rango de presupuesto disponible para esta campaña?',
        'budgetConsiderations.keyInvestments': 'Faltan las inversiones clave. ¿En qué áreas principales se debe invertir el presupuesto?',
        'appendix.assumptions': 'No hay supuestos documentados. ¿Qué supuestos clave estás considerando para este proyecto?',
      };
      
      return emptyQuestions[fieldKey] || `Necesitamos información sobre ${fieldLabel}. ¿Puedes proporcionar detalles específicos?`;
    } else {
      // Preguntas para campos que necesitan mejora
      const improvementQuestions: { [key: string]: string } = {
        'projectTitle': `El título "${currentValue}" podría ser más específico. ¿Hay un nombre más descriptivo que capture mejor la esencia del proyecto?`,
        'briefSummary': `El resumen actual necesita más contexto estratégico. ¿Puedes ampliar explicando el contexto de negocio, el problema que resuelve y el impacto esperado?`,
        'businessChallenge': `El desafío descrito necesita más especificidad. ¿Puedes profundizar en las causas del problema y por qué es crítico resolverlo ahora?`,
        'strategicObjectives': `Los objetivos actuales necesitan ser más específicos y medibles. ¿Puedes reformularlos con métricas concretas y plazos?`,
        'targetAudience.primary': `La descripción de la audiencia necesita más detalle. ¿Puedes añadir información sobre edad, ubicación, intereses, comportamientos de compra y canales preferidos?`,
        'targetAudience.insights': `Los insights actuales necesitan profundidad. ¿Qué insights específicos tienes sobre motivaciones, barreras o triggers de compra?`,
        'brandPositioning': `El posicionamiento necesita ser más diferenciado. ¿Cómo se distingue tu marca específicamente de la competencia?`,
        'creativeStrategy.bigIdea': `La gran idea creativa necesita ser más impactante. ¿Hay un concepto más memorable que conecte emocionalmente con la audiencia?`,
        'creativeStrategy.messageHierarchy': `Los mensajes necesitan mejor jerarquización. ¿Cuál es el mensaje principal y cómo se apoyan los secundarios?`,
        'creativeStrategy.toneAndManner': `El tono necesita ser más específico. ¿Puedes describir con más detalle la personalidad de marca y cómo debe sonar?`,
        'channelStrategy.integratedApproach': `El enfoque integrado necesita más detalle. ¿Cómo se complementarán específicamente los canales para maximizar el impacto?`,
        'successMetrics.primary': `Los KPIs necesitan ser más específicos. ¿Puedes definir métricas concretas con targets numéricos?`,
        'successMetrics.measurementFramework': `El framework de medición necesita más estructura. ¿Cómo medirás el éxito a corto, mediano y largo plazo?`,
        'nextSteps': `Los próximos pasos necesitan ser más específicos. ¿Puedes definir acciones concretas con responsables y fechas?`,
      };
      
      return improvementQuestions[fieldKey] || `La información sobre ${fieldLabel} necesita más detalle. ¿Puedes ampliar con información más específica?`;
    }
  };
  
  
  
  

  // Inicializar chat y preguntas
  useEffect(() => {
    if (brief && analysis && messages.length === 0) {
      console.log('🚀 Inicializando chat estructurado...');
      const generatedQuestions = generateStructuredQuestions(brief, analysis);
      setQuestions(generatedQuestions);
      setWorkingBrief(normalizeBrief(brief));
      
      if (generatedQuestions.length > 0) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `¡Hola! Voy a hacerte preguntas específicas para completar y mejorar tu brief hasta alcanzar el 100% de completitud.

📊 **Nuevo sistema inteligente:**
- Analizo TODOS los campos del brief (no solo 5 preguntas)
- Continúo hasta que el brief esté completamente optimizado
- Muestro tu progreso en tiempo real
- El brief se actualiza automáticamente, pero puedes editarlo manualmente

**Empecemos con las primeras optimizaciones:**`,
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
        console.log('✅ Chat inicializado con', generatedQuestions.length, 'preguntas');
      } else {
        console.log('⚠️ No se generaron preguntas - brief podría estar completo');
      }
    }
  }, [brief, analysis, generateStructuredQuestions]);

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
      // Obtener el workingBrief más actualizado directamente del estado
      const currentWorkingBrief = workingBrief;
      
      // Procesar respuesta y actualizar brief
      const responseData = await processUserResponse(
        messageContent.trim(),
        currentQuestion.id,
        currentQuestion.field,
        currentWorkingBrief
      );
      
      // Marcar pregunta como completada
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
      
      // Usar el brief actualizado directamente de la respuesta
      const briefToEvaluate = responseData.updatedBrief;
      
      // ACTUALIZACIÓN ATÓMICA: Estado local + Modal
      console.log('🔁 SINCRONIZANDO ESTADO:', {
        campo: currentQuestion.field,
        timestamp: new Date().toLocaleTimeString()
      });
      
      // 1. Actualizar estado local del hook
      setWorkingBrief(briefToEvaluate);
      
      // 2. Notificar al modal inmediatamente
      onBriefChange(briefToEvaluate);
      
      // 3. Verificación exhaustiva
      const verificationValue = getFieldValue(briefToEvaluate, currentQuestion.field);
      const updateSuccess = verificationValue !== undefined && verificationValue !== null && 
                           (Array.isArray(verificationValue) ? verificationValue.length > 0 : true);
      
      console.log('🎯 VERIFICACIÓN POST-ACTUALIZACIÓN:', {
        campo: currentQuestion.field,
        actualizacionExitosa: updateSuccess,
        valor: verificationValue,
        tipo: Array.isArray(verificationValue) ? 'array' : typeof verificationValue,
        longitud: Array.isArray(verificationValue) ? verificationValue.length : 
                 typeof verificationValue === 'string' ? verificationValue.length : 'N/A',
        briefCompleto: Object.keys(briefToEvaluate).length + ' campos',
        timestamp: new Date().toLocaleTimeString()
      });
      
      // 4. Alerta si hay problemas (excepto campos opcionales)
      const camposOpcionales = ['targetAudience.secondary', 'creativeStrategy.creativeMandatories', 
                               'budgetConsiderations.estimatedRange', 'appendix.assumptions'];
      
      if (!updateSuccess && !camposOpcionales.includes(currentQuestion.field)) {
        console.error('🚨 FALLO CRÍTICO EN ACTUALIZACIÓN:', {
          campo: currentQuestion.field,
          mensajeUsuario: messageContent,
          valorEsperado: 'algún valor',
          valorObtenido: verificationValue,
          briefAntes: Object.keys(workingBrief || {}).length + ' campos',
          briefDespues: Object.keys(briefToEvaluate).length + ' campos'
        });
      }
      
      console.log('🔄 SendMessage: Brief actualizado y sincronizado:', {
        field: currentQuestion.field,
        updatedValue: getFieldValue(briefToEvaluate, currentQuestion.field),
        briefFieldCount: Object.keys(briefToEvaluate).length,
        briefUpdated: true
      });
      
      // Procesar siguiente pregunta
      setTimeout(async () => {
        try {
          console.log('Procesando siguiente pregunta. Brief actualizado:', briefToEvaluate);
          
          // Marcar la pregunta actual como completada
          const currentQuestion = questions[currentQuestionIndex];
          if (currentQuestion) {
            setCompletedQuestions(prev => new Set([...prev, currentQuestion.id]));
            
            // También marcar en el array de preguntas
            setQuestions(prev => prev.map(q => 
              q.id === currentQuestion.id 
                ? { ...q, completed: true }
                : q
            ));
          }
          
          // Buscar la siguiente pregunta no completada
          const nextIndex = currentQuestionIndex + 1;
          const updatedCompletedQuestions = new Set([...completedQuestions, currentQuestion?.id]);
          const nextUncompletedQuestion = questions.slice(nextIndex).find(q => !updatedCompletedQuestions.has(q.id));
          
          if (nextUncompletedQuestion) {
            // Continuar con la siguiente pregunta existente
            const nextQuestionIndex = questions.findIndex(q => q.id === nextUncompletedQuestion.id);
            setCurrentQuestionIndex(nextQuestionIndex);
            
            const nextQuestionMessage: ChatMessage = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: nextUncompletedQuestion.question,
              timestamp: Date.now(),
              questionId: nextUncompletedQuestion.id,
              briefField: nextUncompletedQuestion.field,
            };
            
            setMessages(prev => [...prev, nextQuestionMessage]);
            
          } else {
            // No hay más preguntas, generar nuevas si es necesario
            console.log('🔍 Generando preguntas adicionales con brief actualizado:', {
              briefFieldCount: Object.keys(briefToEvaluate).length,
              completedQuestions: updatedCompletedQuestions.size
            });
            
            const newQuestions = generateAdditionalQuestions(briefToEvaluate, updatedCompletedQuestions);
            
            if (newQuestions.length > 0) {
              const nextQuestion = newQuestions[0];
              
              console.log('🎯 Nueva pregunta generada:', {
                field: nextQuestion.field,
                question: nextQuestion.question.substring(0, 100) + '...'
              });
              
              const nextQuestionMessage: ChatMessage = {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: `Continuemos optimizando: ${nextQuestion.question}`,
                timestamp: Date.now(),
                questionId: nextQuestion.id,
                briefField: nextQuestion.field,
              };
              
              setMessages(prev => [...prev, nextQuestionMessage]);
              setQuestions(prev => [...prev, ...newQuestions]);
              setCurrentQuestionIndex(questions.length);
              
            } else {
              // Evaluar completitud final
              const evaluation = await evaluateBrief(briefToEvaluate);
              
              if (evaluation.isComplete) {
                const finalMessage: ChatMessage = {
                  id: (Date.now() + 2).toString(),
                  role: 'assistant',
                  content: `¡Excelente! Tu brief está completo con un puntaje de ${evaluation.completionScore}%. 

He analizado toda la información y el brief está listo para producción. ¿Hay algún aspecto específico que te gustaría revisar o ajustar?`,
                  timestamp: Date.now(),
                };
                
                setMessages(prev => [...prev, finalMessage]);
              } else {
                // Generar preguntas basadas en la evaluación de IA
                if (evaluation.nextQuestions.length > 0) {
                  const nextQuestion = evaluation.nextQuestions[0];
                  const newQuestion: StructuredQuestion = {
                    id: `ai-generated-${Date.now()}`,
                    field: 'general',
                    question: nextQuestion,
                    priority: 'medium',
                    completed: false,
                  };
                  
                  const nextQuestionMessage: ChatMessage = {
                    id: (Date.now() + 2).toString(),
                    role: 'assistant',
                    content: `Puntaje actual: ${evaluation.completionScore}%. ${nextQuestion}`,
                    timestamp: Date.now(),
                    questionId: newQuestion.id,
                    briefField: newQuestion.field,
                  };
                  
                  setMessages(prev => [...prev, nextQuestionMessage]);
                  setQuestions(prev => [...prev, newQuestion]);
                  setCurrentQuestionIndex(questions.length);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing next question:', error);
          // Fallback simple: continuar con la siguiente pregunta
          const nextIndex = currentQuestionIndex + 1;
          if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
            
            const nextQuestion: ChatMessage = {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: questions[nextIndex].question,
              timestamp: Date.now(),
              questionId: questions[nextIndex].id,
              briefField: questions[nextIndex].field,
            };
            
            setMessages(prev => [...prev, nextQuestion]);
          }
        }
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
  }, [questions, currentQuestionIndex, processUserResponse, workingBrief]);

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
    console.log('🔄 Reinicializando chat estructurado...');
    
    // Limpiar estado actual
    setMessages([]);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setCompletedQuestions(new Set());
    setError(null);
    setIsConnected(true);
    setIsTyping(false);
    
    // Inicializar con el brief actual
    if (brief && analysis) {
      const generatedQuestions = generateStructuredQuestions(brief, analysis);
      setQuestions(generatedQuestions);
      setWorkingBrief(normalizeBrief(brief));
      
      if (generatedQuestions.length > 0) {
        const welcomeMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `¡Hola! Voy a hacerte preguntas específicas para completar y mejorar tu brief hasta alcanzar el 100% de completitud.

📊 **Nuevo sistema inteligente:**
- Analizo TODOS los campos del brief (no solo 5 preguntas)
- Continúo hasta que el brief esté completamente optimizado
- Muestro tu progreso en tiempo real
- El brief se actualiza automáticamente, pero puedes editarlo manualmente

**Empecemos con las primeras optimizaciones:**`,
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
        console.log('✅ Chat reinicializado con', generatedQuestions.length, 'preguntas');
      } else {
        console.log('⚠️ No se generaron preguntas - brief podría estar completo');
        
        // Mostrar mensaje de brief completo
        const completeBriefMessage: ChatMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `¡Excelente! Tu brief parece estar muy completo. 

¿Hay algún aspecto específico que te gustaría revisar o mejorar?`,
          timestamp: Date.now(),
        };
        
        setMessages([completeBriefMessage]);
      }
    }
  }, [brief, analysis, generateStructuredQuestions]);

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
