import { useState, useEffect, useRef } from 'react';

// Tipos de evaluación verbal
export type VerbalScore = 
  | 'excelente' 
  | 'muy-bueno' 
  | 'bueno' 
  | 'regular' 
  | 'puede-mejorar' 
  | 'necesita-trabajo' 
  | 'incompleto';

export type OverallAssessment = 
  | 'muy-completo' 
  | 'bien-estructurado' 
  | 'funcional' 
  | 'basico' 
  | 'incompleto';

export type ReadinessLevel = 
  | 'listo-para-presentar' 
  | 'casi-listo' 
  | 'necesita-pulir' 
  | 'requiere-desarrollo';

// Tipos para análisis educativo
export interface AnalysisInsight {
  id: string;
  title: string;
  explanation: string;
  impact: 'critico' | 'alto' | 'medio' | 'bajo';
  examples: {
    good: string;
    current?: string;
    improved?: string;
  };
  whyItMatters: string;
  quickWin?: {
    action: string;
    timeEstimate: string;
    difficulty: 'facil' | 'moderado' | 'complejo';
  };
}

export interface BriefHealthCheck {
  category: string;
  icon: string;
  verbalScore: VerbalScore;
  numericScore: number; // Mantenemos internamente para cálculos
  status: 'excelente' | 'bueno' | 'regular' | 'deficiente' | 'faltante';
  headline: string;
  explanation: string;
  insights: AnalysisInsight[];
  learningTip?: string;
}

export interface EducationalAnalysisResult {
  overallAssessment: OverallAssessment;
  overallScore: VerbalScore;
  readinessLevel: ReadinessLevel;
  
  healthChecks: BriefHealthCheck[];
  
  // Sección educativa
  didYouKnow: string[];
  bestPractices: string[];
  commonMistakes: string[];
  
  // Plan de acción detallado
  actionPlan: ActionPlan;
  
  // Actionable insights (mantener para compatibilidad)
  priorityActions: {
    id: string;
    title: string;
    why: string;
    how: string;
    impact: string;
    timeToComplete: string;
  }[];
  
  // Progreso y motivación
  progressIndicators: {
    completedWell: string[];
    improvementAreas: string[];
    nextMilestone: string;
  };
}

export interface ActionPhase {
  id: string;
  title: string;
  description: string;
  priority: 'critica' | 'alta' | 'media' | 'baja';
  estimatedTime: string;
  difficulty: 'facil' | 'moderado' | 'complejo';
  expectedImpact: string;
  tasks: DetailedTask[];
  prerequisites?: string[];
  tips: string[];
}

export interface ActionPlan {
  summary: string;
  estimatedTimeTotal: string;
  difficulty: 'facil' | 'moderado' | 'desafiante';
  expectedImprovement: string;
  phases: ActionPhase[];
}

export interface TaskResource {
  type: 'template' | 'example' | 'guide' | 'tool';
  title: string;
  description: string;
}

export interface DetailedTask {
  id: string;
  title: string;
  description: string;
  example?: string;
  checklistItems: string[];
  resources?: TaskResource[];
  successCriteria: string[];
}

// Criterios educativos para evaluar cada sección
const BRIEF_CRITERIA = {
  projectTitle: {
    category: 'Claridad y Enfoque',
    icon: '🎯',
    goodExample: 'Campaña de Awareness para Marca X - Q1 2024',
    checks: [
      {
        test: (title: string) => title && title.length > 5,
        insight: 'Un título específico ayuda a todos los involucrados a entender inmediatamente de qué se trata el proyecto'
      },
      {
        test: (title: string) => /\b(campaña|estrategia|lanzamiento|awareness|activación)\b/i.test(title),
        insight: 'Incluir el tipo de actividad (campaña, lanzamiento, etc.) clarifica el scope del proyecto'
      }
    ]
  },
  
  briefSummary: {
    category: 'Comunicación Ejecutiva',
    icon: '📄',
    goodExample: 'Desarrollar una campaña de awareness digital para aumentar el reconocimiento de marca en un 25% entre millennials urbanos, utilizando contenido emocional en redes sociales durante Q1 2024.',
    checks: [
      {
        test: (summary: string) => summary && summary.length > 100,
        insight: 'Un resumen de al menos 100 caracteres permite explicar adecuadamente el contexto y objetivos'
      },
      {
        test: (summary: string) => /\b(objetivo|meta|aumentar|generar|lograr)\b/i.test(summary),
        insight: 'Mencionar objetivos específicos en el resumen ayuda a alinear expectativas desde el inicio'
      }
    ]
  },
  
  targetAudience: {
    category: 'Conocimiento del Cliente',
    icon: '👥',
    goodExample: 'Millennials urbanos (25-35 años) con ingresos medios-altos, que valoran la sostenibilidad y buscan marcas auténticas. Se informan principalmente por Instagram y TikTok.',
    checks: [
      {
        test: (audience: any) => audience && (audience.primary || (Array.isArray(audience) && audience.length > 0)),
        insight: 'Definir claramente quién es tu audiencia es fundamental - no puedes convencer a todos de todo'
      },
      {
        test: (audience: any) => {
          const text = JSON.stringify(audience).toLowerCase();
          return /\b(edad|años|joven|adulto|mayor)\b/.test(text);
        },
        insight: 'Incluir datos demográficos como edad ayuda a seleccionar canales y tonos apropiados'
      }
    ]
  },
  
  strategicObjectives: {
    category: 'Visión Estratégica',
    icon: '🚀',
    goodExample: ['Aumentar awareness de marca del 15% al 40% en target definido', 'Generar 10,000 leads calificados en Q1', 'Posicionar la marca como líder en sostenibilidad'],
    checks: [
      {
        test: (objectives: any[]) => objectives && objectives.length >= 2,
        insight: 'Tener múltiples objetivos permite medir éxito desde diferentes ángulos y crear una estrategia integral'
      },
      {
        test: (objectives: any[]) => {
          const text = JSON.stringify(objectives).toLowerCase();
          return /\b(\d+%|aumentar|generar|lograr|\d+\s*(leads|ventas|conversiones))\b/.test(text);
        },
        insight: 'Objetivos cuantificables (con números o percentajes) permiten medir el ROI real de la campaña'
      }
    ]
  },
  
  creativeStrategy: {
    category: 'Dirección Creativa',
    icon: '🎨',
    goodExample: {
      bigIdea: 'Tu estilo, tu planeta - cada compra es un voto por el futuro',
      toneAndManner: 'Inspirador pero accesible, auténtico sin ser predicativo'
    },
    checks: [
      {
        test: (strategy: any) => strategy && strategy.bigIdea,
        insight: 'La "gran idea" es el hilo conductor que conecta todos los elementos creativos - sin ella, la campaña se siente desconectada'
      },
      {
        test: (strategy: any) => strategy && strategy.toneAndManner,
        insight: 'Definir el tono evita malentendidos entre equipos y asegura coherencia en todos los touchpoints'
      }
    ]
  },
  
  channelStrategy: {
    category: 'Distribución Inteligente',
    icon: '📢',
    goodExample: {
      recommendedMix: [
        { channel: 'Instagram', rationale: 'Alto engagement con millennials urbanos', allocation: '40%' },
        { channel: 'TikTok', rationale: 'Contenido viral y auténtico', allocation: '30%' }
      ]
    },
    checks: [
      {
        test: (strategy: any) => {
          const channels = strategy?.recommendedMix || strategy?.channels || [];
          return Array.isArray(channels) && channels.length >= 2;
        },
        insight: '❌ CRÍTICO: Necesitas al menos 2 canales específicos con detalles para una estrategia viable'
      },
      {
        test: (strategy: any) => {
          const channels = strategy?.recommendedMix || strategy?.channels || [];
          return channels.every((ch: any) => ch.channel && ch.rationale && ch.allocation);
        },
        insight: '❌ FALTA: Cada canal debe tener nombre específico, justificación estratégica y % de presupuesto'
      },
      {
        test: (strategy: any) => {
          const channels = strategy?.recommendedMix || strategy?.channels || [];
          const allocations = channels.map((ch: any) => parseFloat(ch.allocation) || 0);
          const total = allocations.reduce((sum, val) => sum + val, 0);
          return Math.abs(total - 100) < 5; // Allow 5% margin
        },
        insight: '❌ ERROR: Las asignaciones de presupuesto por canal deben sumar 100%'
      }
    ]
  },
  
  budgetConsiderations: {
    category: 'Viabilidad Financiera',
    icon: '💰',
    goodExample: {
      estimatedRange: '$50,000 - $75,000',
      keyInvestments: ['40% en pauta digital', '30% en producción de contenido', '20% en influencers', '10% en herramientas']
    },
    checks: [
      {
        test: (budget: any) => {
          if (!budget) return false;
          const hasRange = budget.estimatedRange || budget.totalBudget;
          const hasAmount = /\$[\d,]+|\d+\s*(USD|EUR|MXN)|\d+K|\d+M/i.test(JSON.stringify(budget));
          return hasRange && hasAmount;
        },
        insight: '❌ CRÍTICO: Necesitas un monto o rango presupuestario específico ($X,XXX) para evaluar viabilidad'
      },
      {
        test: (budget: any) => {
          const investments = budget?.keyInvestments || [];
          const percentages = JSON.stringify(investments).match(/\d+%/g) || [];
          const total = percentages.reduce((sum, p) => sum + parseInt(p), 0);
          return investments.length >= 3 && Math.abs(total - 100) < 10;
        },
        insight: '❌ FALTA: Desglose detallado de inversión por categorías (mín. 3) que sume ~100%'
      },
      {
        test: (budget: any) => {
          const text = JSON.stringify(budget).toLowerCase();
          return /\b(producción|pauta|media|content|creative|talent|tools|herramientas)\b/.test(text);
        },
        insight: '❌ INCOMPLETO: Especifica categorías como producción, pauta, talento, herramientas'
      }
    ]
  },
  
  successMetrics: {
    category: 'Medición de Impacto',
    icon: '📊',
    goodExample: {
      primary: ['Reach de 500K personas únicas', 'CTR superior a 2.5%', '10,000 visitas al sitio web'],
      measurementFramework: 'Reportes semanales con dashboard en tiempo real'
    },
    checks: [
      {
        test: (metrics: any) => {
          const primary = metrics?.primary || [];
          const secondary = metrics?.secondary || [];
          return Array.isArray(primary) && primary.length >= 2 && primary.some(m => /\d+/.test(m));
        },
        insight: '❌ CRÍTICO: Necesitas al menos 2 métricas primarias con valores numéricos específicos'
      },
      {
        test: (metrics: any) => {
          const text = JSON.stringify(metrics).toLowerCase();
          const hasBusinessMetrics = /\b(roi|roas|cpa|ltv|revenue|ventas|leads)\b/.test(text);
          const hasEngagementMetrics = /\b(ctr|reach|engagement|impresiones|views)\b/.test(text);
          return hasBusinessMetrics && hasEngagementMetrics;
        },
        insight: '❌ FALTA: Combina métricas de negocio (ROI, ventas) con métricas de engagement (CTR, reach)'
      },
      {
        test: (metrics: any) => metrics?.measurementFramework || metrics?.reportingSchedule,
        insight: '❌ AUSENTE: Define cómo y cuándo vas a medir (framework de reporte/dashboard)'
      }
    ]
  },

  // NUEVO: Campo crítico para timeline y ruta crítica
  timeline: {
    category: 'Ruta Crítica y Ejecución',
    icon: '📅',
    goodExample: {
      phases: [
        { phase: 'Preproducción', duration: '2 semanas', tasks: ['Brief creativo', 'Casting', 'Locaciones'] },
        { phase: 'Producción', duration: '1 semana', tasks: ['Filmación', 'Fotografía', 'Audio'] },
        { phase: 'Postproducción', duration: '2 semanas', tasks: ['Edición', 'Motion graphics', 'Aprobaciones'] },
        { phase: 'Lanzamiento', duration: '1 semana', tasks: ['Setup de campañas', 'Contenido en vivo'] }
      ],
      criticalPath: 'Aprobaciones cliente → Producción → Review final → Go-live',
      totalDuration: '6 semanas'
    },
    checks: [
      {
        test: (timeline: any) => {
          if (!timeline) return false;
          const phases = timeline.phases || timeline.milestones || [];
          return Array.isArray(phases) && phases.length >= 3;
        },
        insight: '❌ CRÍTICO: Sin timeline detallado es imposible coordinar equipos y cumplir deadlines'
      },
      {
        test: (timeline: any) => {
          const phases = timeline?.phases || timeline?.milestones || [];
          return phases.every((p: any) => p.duration || p.timeline || p.deadline);
        },
        insight: '❌ FALTA: Cada fase debe tener duración específica (días/semanas) para planificación real'
      },
      {
        test: (timeline: any) => timeline?.criticalPath || timeline?.dependencies,
        insight: '❌ AUSENTE: Identifica la ruta crítica - qué tareas bloquean todo si se retrasan'
      }
    ]
  }
};

/**
 * Hook para análisis educativo y didáctico del brief
 */
export function useEducationalBriefAnalysis(brief: any) {
  const [analysis, setAnalysis] = useState<EducationalAnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAnalyzing = useRef(false);
  const lastAnalyzedBriefRef = useRef<string>('');

  const analyzeBrief = async (briefToAnalyze: any) => {
    if (!briefToAnalyze || isAnalyzing.current) return;
    
    // Check if brief has actually changed
    const briefString = JSON.stringify(briefToAnalyze);
    if (briefString === lastAnalyzedBriefRef.current) {
      return; // Skip if same brief
    }
    
    isAnalyzing.current = true;
    setLoading(true);
    setError(null);
    
    try {
      // Add small delay to prevent rapid re-renders
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Realizar análisis educativo local (más rápido y didáctico)
      const educationalAnalysis = performEducationalAnalysis(briefToAnalyze);
      setAnalysis(educationalAnalysis);
      lastAnalyzedBriefRef.current = briefString;
      
      // Opcionalmente, enriquecer con AI para insights más profundos
      // await enrichWithAIInsights(educationalAnalysis, briefToAnalyze);
      
    } catch (err: any) {
      console.error('Error en análisis educativo:', err);
      setError('No pudimos analizar tu brief en este momento. Intenta de nuevo.');
    } finally {
      setLoading(false);
      isAnalyzing.current = false;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (brief && !isAnalyzing.current) {
        analyzeBrief(brief);
      }
    }, 500); // Debounce por 500ms

    return () => clearTimeout(timer);
  }, [brief]);

  return {
    analysis,
    loading,
    error,
    reAnalyze: () => analyzeBrief(brief)
  };
}

function performEducationalAnalysis(brief: any): EducationalAnalysisResult {
  const healthChecks: BriefHealthCheck[] = [];
  let totalScore = 0;
  let maxScore = 0;

  try {
    // Analizar cada sección del brief
    Object.entries(BRIEF_CRITERIA).forEach(([sectionKey, criteria]) => {
    const sectionData = brief[sectionKey];
    const insights: AnalysisInsight[] = [];
    let sectionScore = 0;
    let sectionMaxScore = criteria.checks.length * 20; // 20 puntos por check (más estricto)
    
    criteria.checks.forEach((check, index) => {
      const passed = check.test(sectionData);
      // Scoring más estricto: solo puntos completos si pasa TODOS los checks de la sección
      if (passed) sectionScore += 20; // Reducido de 25 a 20
      
      insights.push({
        id: `${sectionKey}_${index}`,
        title: passed ? '✅ Bien hecho' : '🔍 Oportunidad de mejora',
        explanation: check.insight,
        impact: index === 0 ? 'high' : 'medium',
        examples: {
          good: Array.isArray(criteria.goodExample) 
            ? criteria.goodExample[0] 
            : typeof criteria.goodExample === 'object' 
              ? JSON.stringify(criteria.goodExample, null, 2)
              : criteria.goodExample,
          current: sectionData ? (typeof sectionData === 'string' ? sectionData : JSON.stringify(sectionData)) : 'No definido'
        },
        whyItMatters: `Esta sección de tu brief ${passed ? 'está bien estructurada' : 'puede mejorar'} porque ${check.insight.toLowerCase()}`,
        quickWin: !passed ? {
          action: `Revisa y mejora tu ${getSectionDisplayName(sectionKey)}`,
          timeEstimate: '5-10 minutos',
          difficulty: 'easy'
        } : undefined
      });
    });

    // Determinar status y scores verbales de la sección
    const percentage = (sectionScore / sectionMaxScore) * 100;
    const verbalScore = getVerbalScore(percentage);
    const scoreInfo = getVerbalScoreInfo(verbalScore);
    
    let status: 'excelente' | 'bueno' | 'regular' | 'deficiente' | 'faltante';
    let headline: string;
    
    if (!sectionData) {
      status = 'faltante';
      headline = `Falta definir tu ${criteria.category.toLowerCase()}`;
    } else if (verbalScore === 'excelente' || verbalScore === 'muy-bueno') {
      status = 'excelente';
      headline = scoreInfo.encouragement;
    } else if (verbalScore === 'bueno' || verbalScore === 'regular') {
      status = 'bueno';
      headline = scoreInfo.encouragement;
    } else if (verbalScore === 'puede-mejorar') {
      status = 'regular';
      headline = scoreInfo.encouragement;
    } else {
      status = 'deficiente';
      headline = scoreInfo.encouragement;
    }

    healthChecks.push({
      category: criteria.category,
      icon: criteria.icon,
      verbalScore,
      numericScore: Math.round(percentage),
      status,
      headline,
      explanation: scoreInfo.description,
      insights,
      learningTip: getLearningTip(criteria.category, verbalScore)
    });

    totalScore += sectionScore;
    maxScore += sectionMaxScore;
  });

  // Calcular evaluaciones verbales
  const overallPercentage = (totalScore / maxScore) * 100;
  const overallAssessment = getOverallAssessment(overallPercentage);
  const overallScore = getVerbalScore(overallPercentage);
  const readinessLevel = getReadinessLevel(overallPercentage);

  // Generar insights educativos
  const didYouKnow = [
    "Los briefs más efectivos tienen objetivos cuantificables - las empresas que los usan ven 64% más éxito en sus campañas",
    "Un brief bien definido reduce el tiempo de revisiones en un 70% - la claridad inicial ahorra tiempo después",
    "Las campañas con audiencias bien definidas tienen 3x más engagement que las genéricas"
  ];

  const bestPractices = [
    "Siempre incluye el 'por qué' detrás de cada decisión estratégica",
    "Define éxito con números específicos, no solo con 'aumentar awareness'",
    "Agrega contexto del mercado o competencia para mejor contexto"
  ];

  const commonMistakes = [
    "Objetivos muy amplios como 'ser la marca #1' sin especificar en qué",
    "Audiencias demasiado genéricas como 'mujeres de 25-45 años'",
    "Presupuestos sin desglose - dificulta la optimización"
  ];

  // Generar plan de acción detallado
  const actionPlan = generateDetailedActionPlan(healthChecks, overallPercentage);
  
  // Generar acciones prioritarias basadas en scores verbales (mantener para compatibilidad)
  const priorityActions = generateComprehensivePriorityActions(healthChecks, overallPercentage);

  return {
    overallAssessment,
    overallScore,
    readinessLevel,
    healthChecks,
    didYouKnow,
    bestPractices,
    commonMistakes,
    actionPlan,
    priorityActions,
    progressIndicators: {
      completedWell: healthChecks.filter(hc => hc.status === 'excelente' || hc.status === 'bueno').map(hc => hc.category),
      improvementAreas: healthChecks.filter(hc => hc.status === 'regular' || hc.status === 'deficiente' || hc.status === 'faltante').map(hc => hc.category),
      nextMilestone: getNextMilestone(overallPercentage)
    }
  };
  } catch (error) {
    console.error('Error in performEducationalAnalysis:', error);
    // Return a minimal analysis result to prevent crashes
    return {
      overallAssessment: 'basico',
      overallScore: 'puede-mejorar',
      readinessLevel: 'requiere-desarrollo',
      healthChecks: [],
      didYouKnow: ['El análisis encontró un error. Por favor intenta de nuevo.'],
      bestPractices: [],
      commonMistakes: [],
      actionPlan: {
        summary: 'No se pudo completar el análisis',
        estimatedTimeTotal: '0 minutos',
        difficulty: 'facil',
        expectedImprovement: '0',
        phases: []
      },
      priorityActions: [],
      progressIndicators: {
        completedWell: [],
        improvementAreas: [],
        nextMilestone: 'Reintentar análisis'
      }
    };
  }
}

// Funciones de conversión verbal
function getVerbalScore(percentage: number): VerbalScore {
  // Scoring MÁS ESTRICTO - criterios profesionales reales
  if (percentage >= 95) return 'excelente';      // Solo 95%+ es excelente
  if (percentage >= 85) return 'muy-bueno';      // 85%+ es muy bueno  
  if (percentage >= 75) return 'bueno';          // 75%+ es bueno
  if (percentage >= 60) return 'regular';        // 60%+ es regular
  if (percentage >= 40) return 'puede-mejorar';  // 40%+ puede mejorar
  if (percentage >= 20) return 'necesita-trabajo'; // 20%+ necesita trabajo
  return 'incompleto';                           // <20% incompleto
}

function getOverallAssessment(percentage: number): OverallAssessment {
  // Assessment general más estricto
  if (percentage >= 90) return 'muy-completo';        // Solo 90%+ es muy completo
  if (percentage >= 80) return 'bien-estructurado';   // 80%+ bien estructurado
  if (percentage >= 65) return 'funcional';           // 65%+ funcional
  if (percentage >= 45) return 'basico';              // 45%+ básico
  return 'incompleto';                                // <45% incompleto
}

function getReadinessLevel(percentage: number): ReadinessLevel {
  // Readiness más estricto - estándares profesionales
  if (percentage >= 90) return 'listo-para-presentar';  // Solo 90%+ listo para cliente
  if (percentage >= 80) return 'casi-listo';            // 80%+ casi listo
  if (percentage >= 65) return 'necesita-pulir';        // 65%+ necesita pulir
  return 'requiere-desarrollo';                         // <65% requiere desarrollo
}

function getVerbalScoreInfo(verbalScore: VerbalScore): {
  emoji: string;
  color: string;
  description: string;
  encouragement: string;
} {
  switch (verbalScore) {
    case 'excelente':
      return {
        emoji: '🏆',
        color: '#10b981',
        description: 'Esta sección está perfectamente desarrollada',
        encouragement: '¡Increíble trabajo! Este es el estándar de oro.'
      };
    case 'muy-bueno':
      return {
        emoji: '🌟',
        color: '#059669',
        description: 'Muy bien estructurada, con todos los elementos clave',
        encouragement: '¡Excelente! Solo pequeños ajustes para perfeccionar.'
      };
    case 'bueno':
      return {
        emoji: '👍',
        color: '#3b82f6',
        description: 'Bien desarrollada, cumple con los requisitos básicos',
        encouragement: 'Buen trabajo. Con algunos ajustes será excepcional.'
      };
    case 'regular':
      return {
        emoji: '👌',
        color: '#6366f1',
        description: 'Tiene los elementos básicos pero puede ser más específica',
        encouragement: 'Vas por buen camino. Agregar más detalle la hará brillar.'
      };
    case 'puede-mejorar':
      return {
        emoji: '🔧',
        color: '#f59e0b',
        description: 'Necesita más desarrollo y especificidad',
        encouragement: 'Buena base. Ahora vamos a pulirla para que sea más efectiva.'
      };
    case 'necesita-trabajo':
      return {
        emoji: '📝',
        color: '#ef4444',
        description: 'Requiere atención y desarrollo adicional',
        encouragement: 'No te preocupes, todos empezamos aquí. Vamos paso a paso.'
      };
    case 'incompleto':
      return {
        emoji: '❌',
        color: '#dc2626',
        description: 'Esta sección está incompleta o faltante',
        encouragement: 'Perfecto momento para agregar contenido valioso.'
      };
  }
}

function getOverallAssessmentInfo(assessment: OverallAssessment): {
  emoji: string;
  title: string;
  description: string;
  nextStep: string;
} {
  switch (assessment) {
    case 'muy-completo':
      return {
        emoji: '🏆',
        title: 'Brief muy completo',
        description: 'Tu brief tiene todos los elementos necesarios para una campaña exitosa',
        nextStep: 'Listo para presentar a stakeholders senior'
      };
    case 'bien-estructurado':
      return {
        emoji: '✨',
        title: 'Brief bien estructurado',
        description: 'Tienes una base sólida con la mayoría de elementos clave',
        nextStep: 'Pulir algunos detalles y estarás listo'
      };
    case 'funcional':
      return {
        emoji: '🛠️',
        title: 'Brief funcional',
        description: 'Tienes las bases pero hay oportunidades de mejora importantes',
        nextStep: 'Desarrollar mejor las áreas principales'
      };
    case 'basico':
      return {
        emoji: '📋',
        title: 'Brief básico',
        description: 'Tienes algunos elementos pero necesita más desarrollo',
        nextStep: 'Completar las secciones faltantes'
      };
    case 'incompleto':
      return {
        emoji: '🚧',
        title: 'Brief en construcción',
        description: 'Estás empezando, vamos a construir juntos un brief sólido',
        nextStep: 'Definir los elementos fundamentales'
      };
  }
}

function getReadinessLevelInfo(level: ReadinessLevel): {
  emoji: string;
  message: string;
  action: string;
} {
  switch (level) {
    case 'listo-para-presentar':
      return {
        emoji: '🚀',
        message: 'Listo para presentar',
        action: 'Puedes presentar este brief con confianza'
      };
    case 'casi-listo':
      return {
        emoji: '⭐',
        message: 'Casi listo',
        action: 'Algunos ajustes menores y estará perfecto'
      };
    case 'necesita-pulir':
      return {
        emoji: '🔧',
        message: 'Necesita pulirse',
        action: 'Trabajar en las áreas identificadas mejorará mucho el resultado'
      };
    case 'requiere-desarrollo':
      return {
        emoji: '📝',
        message: 'Requiere más desarrollo',
        action: 'Vamos paso a paso para fortalecerlo'
      };
  }
}

// Funciones helper
function getSectionDisplayName(sectionKey: string): string {
  const names: { [key: string]: string } = {
    projectTitle: 'título del proyecto',
    briefSummary: 'resumen ejecutivo',
    targetAudience: 'audiencia objetivo',
    strategicObjectives: 'objetivos estratégicos',
    creativeStrategy: 'estrategia creativa',
    channelStrategy: 'estrategia de canales',
    budgetConsiderations: 'consideraciones de presupuesto',
    successMetrics: 'métricas de éxito'
  };
  return names[sectionKey] || sectionKey;
}

function getEducationalExplanation(category: string, status: string): string {
  const explanations: { [key: string]: { [status: string]: string } } = {
    'Claridad y Enfoque': {
      'excellent': 'Tu título es específico y comunicativo. Los stakeholders entienden inmediatamente el scope del proyecto.',
      'good': 'Tienes un buen título, pero podrías ser más específico sobre el tipo de actividad o timeframe.',
      'needs-work': 'Tu título necesita más especificidad. Un título claro evita confusiones y alinea expectativas.',
      'missing': 'Sin un título claro, los equipos pueden malinterpretar el alcance del proyecto.'
    },
    'Comunicación Ejecutiva': {
      'excellent': 'Tu resumen captura perfectamente la esencia del proyecto. Cualquier ejecutivo puede entender el valor.',
      'good': 'Buen resumen general, pero podrías agregar más contexto sobre objetivos específicos.',
      'needs-work': 'Tu resumen necesita más detalle. Los ejecutivos necesitan entender rápidamente el ROI esperado.',
      'missing': 'Sin resumen, es difícil conseguir buy-in de stakeholders senior.'
    }
    // ... más explicaciones para cada categoría
  };
  
  return explanations[category]?.[status] || `Tu ${category.toLowerCase()} necesita más desarrollo.`;
}

function getLearningTip(category: string, verbalScore: VerbalScore): string | undefined {
  if (verbalScore === 'excelente' || verbalScore === 'muy-bueno') return undefined;
  
  const tips: { [key: string]: string } = {
    'Claridad y Enfoque': '💡 Tip: Incluye el tipo de actividad + audiencia + timeframe en tu título',
    'Comunicación Ejecutiva': '💡 Tip: Un buen resumen responde: qué haremos, para quién, y qué lograremos',
    'Conocimiento del Cliente': '💡 Tip: Piensa en una persona específica de tu audiencia - dale nombre y características',
    'Visión Estratégica': '💡 Tip: Usa la fórmula SMART: Específico, Medible, Alcanzable, Relevante, Temporal',
    'Dirección Creativa': '💡 Tip: La gran idea debe ser memorable y repetible - algo que el equipo creativo pueda ejecutar',
    'Distribución Inteligente': '💡 Tip: Cada canal debe tener una razón de ser específica para tu audiencia'
  };
  
  return tips[category];
}



function getNextMilestone(percentage: number): string {
  if (percentage >= 90) return 'Tu brief está listo para presentar a stakeholders senior';
  if (percentage >= 75) return 'Pulir algunos detalles y estarás listo para ejecutar';
  if (percentage >= 60) return 'Desarrollar mejor las áreas débiles para mayor claridad';
  if (percentage >= 40) return 'Completar las secciones faltantes para tener una base sólida';
  return 'Definir los elementos fundamentales del brief';
}

function generateDetailedActionPlan(healthChecks: BriefHealthCheck[], overallPercentage: number): {
  summary: string;
  estimatedTimeTotal: string;
  difficulty: 'facil' | 'moderado' | 'desafiante';
  expectedImprovement: string;
  phases: ActionPhase[];
} {
  const weakSections = healthChecks.filter(hc => 
    hc.verbalScore === 'puede-mejorar' || 
    hc.verbalScore === 'necesita-trabajo' || 
    hc.verbalScore === 'incompleto'
  );

  const criticalSections = healthChecks.filter(hc => 
    hc.verbalScore === 'incompleto' || 
    hc.verbalScore === 'necesita-trabajo'
  );

  const phases: ActionPhase[] = [];
  let totalEstimatedMinutes = 0;

  // Fase 1: Corregir elementos críticos
  if (criticalSections.length > 0) {
    const criticalTasks: DetailedTask[] = criticalSections.map((section, index) => ({
      id: `critical_${index}`,
      title: `Desarrollar ${section.category}`,
      description: `Esta sección está "${section.verbalScore.replace('-', ' ')}" y necesita atención inmediata para que tu brief tenga una base sólida.`,
      example: getTaskExample(section.category),
      checklistItems: getChecklistItems(section.category, section.verbalScore),
      resources: getTaskResources(section.category),
      successCriteria: getSuccessCriteria(section.category)
    }));

    phases.push({
      id: 'phase_critical',
      title: 'Fase 1: Elementos Fundamentales',
      description: 'Primero asegurémonos de que tu brief tenga toda la información esencial. Sin estos elementos, será difícil avanzar.',
      priority: 'critica',
      estimatedTime: `${criticalSections.length * 15}-${criticalSections.length * 25} minutos`,
      difficulty: 'moderado',
      expectedImpact: `Mejorar el puntaje base en ${criticalSections.length * 8}-${criticalSections.length * 12} puntos`,
      tasks: criticalTasks,
      prerequisites: ['Tener acceso a información del proyecto', 'Conocer los objetivos del negocio'],
      tips: [
        'No te preocupes por la perfección inicialmente - primero completa, luego mejora',
        'Usa ejemplos de proyectos similares como referencia',
        'Pregunta a tu equipo si no tienes toda la información'
      ]
    });
    
    totalEstimatedMinutes += criticalSections.length * 20;
  }

  // Fase 2: Mejorar secciones existentes
  const improvableSections = healthChecks.filter(hc => 
    hc.verbalScore === 'puede-mejorar' || 
    hc.verbalScore === 'regular' || 
    hc.verbalScore === 'bueno'
  );

  if (improvableSections.length > 0) {
    const improvementTasks: DetailedTask[] = improvableSections.map((section, index) => ({
      id: `improve_${index}`,
      title: `Optimizar ${section.category}`,
      description: `Tu ${section.category.toLowerCase()} está "${section.verbalScore.replace('-', ' ')}". Vamos a pulirla para que sea más específica y efectiva.`,
      example: getTaskExample(section.category),
      checklistItems: getChecklistItems(section.category, section.verbalScore),
      resources: getTaskResources(section.category),
      successCriteria: getSuccessCriteria(section.category)
    }));

    phases.push({
      id: 'phase_improve',
      title: 'Fase 2: Optimización y Detalle',
      description: 'Ahora que tienes las bases, vamos a refinar cada sección para que sea más específica y persuasiva.',
      priority: 'alta',
      estimatedTime: `${improvableSections.length * 10}-${improvableSections.length * 15} minutos`,
      difficulty: 'facil',
      expectedImpact: `Mejorar el puntaje en ${improvableSections.length * 5}-${improvableSections.length * 8} puntos`,
      tasks: improvementTasks,
      prerequisites: ['Haber completado la Fase 1'],
      tips: [
        'Sé específico con números y datos cuando sea posible',
        'Piensa en cómo cada sección ayuda a vender tu idea',
        'Usa el lenguaje que tu audiencia entiende'
      ]
    });
    
    totalEstimatedMinutes += improvableSections.length * 12;
  }

  // Fase 3: Pulido final y coherencia
  phases.push({
    id: 'phase_polish',
    title: 'Fase 3: Pulido Final',
    description: 'Revisemos todo junto para asegurar coherencia y que tu brief cuente una historia convincente.',
    priority: 'media',
    estimatedTime: '10-15 minutos',
    difficulty: 'facil',
    expectedImpact: 'Mejorar coherencia general y presentación',
    tasks: [
      {
        id: 'polish_consistency',
        title: 'Verificar coherencia general',
        description: 'Asegúrate de que todos los elementos del brief trabajen juntos hacia el mismo objetivo.',
        checklistItems: [
          'Los objetivos estratégicos se alinean con el desafío de negocio',
          'La audiencia objetivo es consistente en todas las secciones',
          'Los canales elegidos son apropiados para la audiencia',
          'Las métricas permiten medir el logro de los objetivos',
          'El presupuesto es realista para el alcance propuesto'
        ],
        resources: [
          {
            type: 'guide',
            title: 'Checklist de coherencia',
            description: 'Lista de verificación para asegurar que tu brief sea consistente'
          }
        ],
        successCriteria: [
          'Todas las secciones se complementan entre sí',
          'No hay contradicciones en la información',
          'El brief cuenta una historia cohesiva'
        ]
      },
      {
        id: 'polish_presentation',
        title: 'Mejorar presentación',
        description: 'Ajustes finales para que tu brief se vea profesional y sea fácil de entender.',
        checklistItems: [
          'Revisar ortografía y gramática',
          'Usar un tono consistente en todo el documento',
          'Ordenar información de manera lógica',
          'Agregar ejemplos específicos donde sea útil',
          'Verificar que los números y datos sean precisos'
        ],
        resources: [
          {
            type: 'template',
            title: 'Plantilla de revisión final',
            description: 'Guía para el último repaso antes de presentar'
          }
        ],
        successCriteria: [
          'El brief es fácil de leer y entender',
          'Se ve profesional y pulido',
          'Cualquier stakeholder puede entender el contenido rápidamente'
        ]
      }
    ],
    tips: [
      'Lee todo el brief de corrido para verificar que fluya naturalmente',
      'Pídale a un colega que lo revise si es posible',
      'Imprime o exporta para ver cómo se ve el formato final'
    ]
  });

  totalEstimatedMinutes += 12;

  // Calcular métricas del plan
  const difficulty = totalEstimatedMinutes > 60 ? 'desafiante' : 
                    totalEstimatedMinutes > 30 ? 'moderado' : 'facil';
  
  const expectedImprovementPoints = Math.min(
    weakSections.length * 8 + (100 - overallPercentage) * 0.3,
    100 - overallPercentage
  );

  const summary = generatePlanSummary(overallPercentage, weakSections.length, phases.length);

  return {
    summary,
    estimatedTimeTotal: `${Math.round(totalEstimatedMinutes/5)*5}-${Math.round(totalEstimatedMinutes*1.2/5)*5} minutos`,
    difficulty,
    expectedImprovement: `Mejorar ${Math.round(expectedImprovementPoints)} puntos (${overallPercentage} → ${Math.min(100, overallPercentage + Math.round(expectedImprovementPoints))})`,
    phases
  };
}

function generatePlanSummary(currentScore: number, weakAreasCount: number, phaseCount: number): string {
  if (currentScore >= 80) {
    return `Tu brief ya está muy bien. Con algunos ajustes menores en ${weakAreasCount} área${weakAreasCount > 1 ? 's' : ''}, estará listo para presentar a cualquier stakeholder.`;
  } else if (currentScore >= 60) {
    return `Tu brief tiene una base sólida. Trabajando en ${weakAreasCount} área${weakAreasCount > 1 ? 's' : ''} clave durante ${phaseCount} fase${phaseCount > 1 ? 's' : ''}, tendrás un brief profesional y convincente.`;
  } else if (currentScore >= 40) {
    return `Tu brief está en construcción. Siguiendo este plan de ${phaseCount} fase${phaseCount > 1 ? 's' : ''}, desarrollarás las ${weakAreasCount} área${weakAreasCount > 1 ? 's' : ''} más importantes para tener un brief funcional y efectivo.`;
  } else {
    return `Empezamos desde cero, y eso está perfecto. Este plan te guiará paso a paso para construir un brief profesional, trabajando ${weakAreasCount} área${weakAreasCount > 1 ? 's' : ''} fundamentales en ${phaseCount} fase${phaseCount > 1 ? 's' : ''} bien estructuradas.`;
  }
}

function getTaskExample(category: string): string {
  const examples: { [key: string]: string } = {
    'Claridad y Enfoque': 'Ejemplo: "Campaña de Awareness Digital para Marca EcoStyle - Lanzamiento Q1 2024"',
    'Comunicación Ejecutiva': 'Ejemplo: "Aumentar reconocimiento de marca del 15% al 35% en millennials urbanos mediante contenido emocional en redes sociales, generando 50,000 impresiones y 2,000 interacciones durante Q1 2024."',
    'Conocimiento del Cliente': 'Ejemplo: "Millennials urbanos (25-35 años), profesionales con ingresos $40K-$80K, valoran sostenibilidad, se informan por Instagram/TikTok, compran online, influenciados por reviews y valores de marca."',
    'Visión Estratégica': 'Ejemplo: "1) Aumentar awareness del 15% al 35% en target, 2) Generar 2,000 leads calificados, 3) Posicionar como #1 en sostenibilidad del sector"',
    'Dirección Creativa': 'Ejemplo: "Gran idea: \'Tu estilo, tu planeta\'. Tono: Inspirador pero accesible, auténtico sin ser predicativo. Cada pieza debe conectar moda con impacto ambiental."',
    'Distribución Inteligente': 'Ejemplo: "Instagram 40% (alta engagement millennials), TikTok 30% (contenido viral), Email 20% (nurturing), Google Ads 10% (capture intent)"',
    'Viabilidad Financiera': 'Ejemplo: "$50K-$75K total: 40% pauta digital, 30% producción contenido, 20% influencers, 10% herramientas y seguimiento"',
    'Medición de Impacto': 'Ejemplo: "Reach 500K únicos, CTR >2.5%, 10K visitas web, 2K leads, NPS >8.0. Reportes semanales con dashboard tiempo real."'
  };
  
  return examples[category] || `Revisa ejemplos similares en la industria para inspirarte`;
}

function getChecklistItems(category: string, verbalScore: VerbalScore): string[] {
  const baseItems: { [key: string]: string[] } = {
    'Claridad y Enfoque': [
      'Incluir el tipo de proyecto (campaña, lanzamiento, activación)',
      'Especificar el timeframe o período',
      'Mencionar la audiencia principal',
      'Usar un lenguaje claro y directo'
    ],
    'Comunicación Ejecutiva': [
      'Responder QUÉ haremos exactamente',
      'Especificar PARA QUIÉN es la campaña',
      'Definir QUÉ LOGRAREMOS (objetivos cuantificables)',
      'Incluir CUÁNDO se ejecutará',
      'Mantener entre 2-3 oraciones máximo'
    ],
    'Conocimiento del Cliente': [
      'Definir demographics (edad, género, ingresos)',
      'Incluir psychographics (valores, intereses)',
      'Especificar comportamientos de consumo',
      'Mencionar canales donde se informan',
      'Agregar insights específicos del segmento'
    ],
    'Visión Estratégica': [
      'Hacer objetivos específicos y medibles',
      'Incluir números y porcentajes cuando sea posible',
      'Alinear con objetivos de negocio',
      'Definir timeframe claro',
      'Priorizar 2-4 objetivos principales'
    ],
    'Dirección Creativa': [
      'Definir la "gran idea" central',
      'Especificar tono y manera de comunicar',
      'Incluir elementos mandatorios',
      'Describir look & feel deseado',
      'Dar ejemplos de ejecución'
    ],
    'Distribución Inteligente': [
      'Seleccionar canales específicos',
      'Justificar por qué cada canal',
      'Incluir % de inversión por canal',
      'Definir objetivos por canal',
      'Considerar integración cross-channel'
    ],
    'Viabilidad Financiera': [
      'Definir rango presupuestario realista',
      'Desglosar inversión por categoría',
      'Incluir costos de producción',
      'Considerar costos de pauta/medios',
      'Agregar buffer para imprevistos'
    ],
    'Medición de Impacto': [
      'Definir métricas primarias',
      'Incluir métricas secundarias',
      'Especificar herramientas de medición',
      'Definir frecuencia de reportes',
      'Establecer benchmarks o metas'
    ]
  };

  const items = baseItems[category] || [];
  
  // Agregar elementos específicos según el nivel
  if (verbalScore === 'incompleto') {
    return ['Completar información básica', ...items.slice(0, 2)];
  } else if (verbalScore === 'necesita-trabajo') {
    return items.slice(0, 3);
  } else if (verbalScore === 'puede-mejorar') {
    return items.slice(0, 4);
  } else {
    return items;
  }
}

function getTaskResources(category: string): { type: 'template' | 'example' | 'guide' | 'tool'; title: string; description: string; }[] {
  const resources: { [key: string]: { type: 'template' | 'example' | 'guide' | 'tool'; title: string; description: string; }[] } = {
    'Claridad y Enfoque': [
      { type: 'template', title: 'Plantilla de título', description: 'Formato: [Tipo de proyecto] para [Marca/Producto] - [Timeframe]' },
      { type: 'example', title: 'Ejemplos de títulos efectivos', description: 'Biblioteca de títulos de proyectos exitosos' }
    ],
    'Comunicación Ejecutiva': [
      { type: 'template', title: 'Estructura de resumen', description: 'Plantilla: Objetivos + Audiencia + Estrategia + Resultados esperados' },
      { type: 'guide', title: 'Guía de escritura ejecutiva', description: 'Cómo escribir para ejecutivos y stakeholders senior' }
    ],
    'Conocimiento del Cliente': [
      { type: 'template', title: 'Perfil de audiencia', description: 'Plantilla completa para definir buyer personas' },
      { type: 'tool', title: 'Herramientas de research', description: 'Google Analytics, Facebook Insights, encuestas' }
    ],
    'Visión Estratégica': [
      { type: 'guide', title: 'Metodología SMART', description: 'Específicos, Medibles, Alcanzables, Relevantes, Temporales' },
      { type: 'template', title: 'Matriz de objetivos', description: 'Plantilla para organizar objetivos por prioridad' }
    ],
    'Dirección Creativa': [
      { type: 'example', title: 'Ejemplos de grandes ideas', description: 'Casos de estudio de campañas icónicas' },
      { type: 'guide', title: 'Desarrollo de conceptos', description: 'Metodología para crear ideas memorables' }
    ],
    'Distribución Inteligente': [
      { type: 'tool', title: 'Media planning tools', description: 'Herramientas para planificación de medios' },
      { type: 'guide', title: 'Guía de canales digitales', description: 'Fortalezas y audiencias de cada canal' }
    ],
    'Viabilidad Financiera': [
      { type: 'template', title: 'Calculadora de presupuesto', description: 'Hoja de cálculo para desglose de inversión' },
      { type: 'guide', title: 'Benchmarks de industria', description: 'Rangos típicos de inversión por canal' }
    ],
    'Medición de Impacto': [
      { type: 'template', title: 'Dashboard de métricas', description: 'Plantilla para seguimiento de KPIs' },
      { type: 'tool', title: 'Herramientas de analytics', description: 'Google Analytics, social media insights, CRM' }
    ]
  };

  return resources[category] || [];
}

function getSuccessCriteria(category: string): string[] {
  const criteria: { [key: string]: string[] } = {
    'Claridad y Enfoque': [
      'Cualquier persona puede entender de qué se trata en 5 segundos',
      'Incluye tipo de proyecto, audiencia y timeframe',
      'Es específico y no genérico'
    ],
    'Comunicación Ejecutiva': [
      'Un ejecutivo puede entender el valor en 30 segundos',
      'Incluye objetivos cuantificables',
      'Explica claramente el ROI esperado'
    ],
    'Conocimiento del Cliente': [
      'Puedes visualizar una persona real de tu audiencia',
      'Incluye datos demográficos y psicográficos',
      'Explica comportamientos de consumo específicos'
    ],
    'Visión Estratégica': [
      'Todos los objetivos son medibles',
      'Se alinean con objetivos de negocio',
      'Tienen timeframes específicos'
    ],
    'Dirección Creativa': [
      'La gran idea es memorable y repetible',
      'El tono es claro y específico',
      'Proporciona dirección clara al equipo creativo'
    ],
    'Distribución Inteligente': [
      'Cada canal tiene una justificación específica',
      'La inversión está distribuida estratégicamente',
      'Los canales se complementan entre sí'
    ],
    'Viabilidad Financiera': [
      'El presupuesto es realista y detallado',
      'Incluye todos los costos principales',
      'Permite flexibilidad para optimización'
    ],
    'Medición de Impacto': [
      'Las métricas permiten medir el éxito de los objetivos',
      'Incluye herramientas de medición específicas',
      'Define frecuencia de seguimiento'
    ]
  };

  return criteria[category] || ['La sección está completa y detallada'];
}

function generateComprehensivePriorityActions(healthChecks: BriefHealthCheck[], overallPercentage: number): {
  id: string;
  title: string;
  why: string;
  how: string;
  impact: string;
  timeToComplete: string;
}[] {
  const actions: {
    id: string;
    title: string;
    why: string;
    how: string;
    impact: string;
    timeToComplete: string;
  }[] = [];

  // Acciones generales para todos los briefs
  const generalActions = [
    {
      id: 'general_review',
      title: 'Revisar y optimizar el título del proyecto',
      why: 'Un título claro ayuda a todos los involucrados a entender inmediatamente el alcance y objetivo',
      how: 'Incluye: Tipo de proyecto + Audiencia + Timeframe. Ejemplo: "Campaña de Awareness para Millennials Urbanos - Q1 2024"',
      impact: 'Alto impacto',
      timeToComplete: '5-10 minutos'
    },
    {
      id: 'general_executive',
      title: 'Perfeccionar el resumen ejecutivo',
      why: 'Es lo primero que leen los stakeholders senior - debe vender tu idea en 30 segundos',
      how: 'Estructura: Qué haremos + Para quién + Qué lograremos + Timeframe. Máximo 3 oraciones.',
      impact: 'Alto impacto',
      timeToComplete: '10-15 minutos'
    },
    {
      id: 'general_audience',
      title: 'Definir audiencia con mayor precisión',
      why: 'Una audiencia específica permite crear mensajes más relevantes y elegir canales apropiados',
      how: 'Incluye: Demographics (edad, género, ingresos) + Psychographics (valores, intereses) + Comportamientos',
      impact: 'Alto impacto',
      timeToComplete: '15-20 minutos'
    },
    {
      id: 'general_objectives',
      title: 'Hacer objetivos más específicos y medibles',
      why: 'Objetivos claros facilitan la ejecución y permiten medir el éxito real del proyecto',
      how: 'Usa la metodología SMART: Específico, Medible, Alcanzable, Relevante, Temporal',
      impact: 'Alto impacto',
      timeToComplete: '15-25 minutos'
    },
    {
      id: 'general_creative',
      title: 'Desarrollar la dirección creativa',
      why: 'Una dirección creativa clara da coherencia a todas las piezas y facilita la ejecución',
      how: 'Define: Gran idea central + Tono de comunicación + Elementos visuales mandatorios + Ejemplos',
      impact: 'Impacto medio',
      timeToComplete: '20-30 minutos'
    },
    {
      id: 'general_channels',
      title: 'Justificar la selección de canales',
      why: 'Cada canal debe tener una razón estratégica basada en tu audiencia y objetivos',
      how: 'Para cada canal incluye: Por qué es relevante + Qué rol cumple + Cómo se integra con otros',
      impact: 'Impacto medio',
      timeToComplete: '10-20 minutos'
    },
    {
      id: 'general_budget',
      title: 'Detallar consideraciones de presupuesto',
      why: 'Un presupuesto bien estructurado muestra viabilidad y permite optimizaciones',
      how: 'Incluye: Rango presupuestario + Desglose por categorías + Costos principales + Buffer',
      impact: 'Alto impacto',
      timeToComplete: '15-25 minutos'
    },
    {
      id: 'general_metrics',
      title: 'Definir métricas de éxito específicas',
      why: 'Métricas claras permiten evaluar el ROI y optimizar durante la ejecución',
      how: 'Incluye: Métricas primarias + Métricas secundarias + Herramientas de medición + Benchmarks',
      impact: 'Alto impacto',
      timeToComplete: '10-15 minutos'
    }
  ];

  // Agregar acciones generales
  actions.push(...generalActions);

  // Acciones específicas basadas en áreas problemáticas
  const problemAreas = healthChecks.filter(hc => 
    hc.verbalScore === 'puede-mejorar' || 
    hc.verbalScore === 'necesita-trabajo' || 
    hc.verbalScore === 'incompleto'
  );

  problemAreas.forEach((hc, index) => {
    const specificActions = getSpecificActionsForCategory(hc.category, hc.verbalScore);
    specificActions.forEach((action, actionIndex) => {
      actions.push({
        id: `specific_${index}_${actionIndex}`,
        title: action.title,
        why: action.why,
        how: action.how,
        impact: hc.verbalScore === 'incompleto' ? 'Alto impacto' : 'Impacto medio',
        timeToComplete: action.timeToComplete
      });
    });
  });

  // Acciones de optimización avanzada si el brief está en buen estado
  if (overallPercentage > 70) {
    const advancedActions = [
      {
        id: 'advanced_integration',
        title: 'Verificar integración cross-channel',
        why: 'Los canales deben trabajar juntos para amplificar el mensaje y crear sinergias',
        how: 'Revisa que el mensaje central se adapte consistentemente a cada canal manteniendo coherencia',
        impact: 'Impacto medio',
        timeToComplete: '10-15 minutos'
      },
      {
        id: 'advanced_contingency',
        title: 'Desarrollar planes de contingencia',
        why: 'Anticipar escenarios alternativos permite responder rápidamente a cambios',
        how: 'Define: Qué hacer si el presupuesto se reduce 20% + Si un canal no funciona + Si cambia el timeline',
        impact: 'Impacto medio',
        timeToComplete: '15-20 minutos'
      },
      {
        id: 'advanced_stakeholder',
        title: 'Preparar presentación para stakeholders',
        why: 'Un brief bien presentado tiene más probabilidades de ser aprobado y ejecutado',
        how: 'Crea: Agenda de presentación + Slides clave + Preguntas frecuentes + Próximos pasos',
        impact: 'Alto impacto',
        timeToComplete: '20-30 minutos'
      }
    ];

    actions.push(...advancedActions);
  }

  // Acciones de fundamentos si el brief está muy básico
  if (overallPercentage < 40) {
    const fundamentalActions = [
      {
        id: 'fundamental_research',
        title: 'Investigar el mercado y competencia',
        why: 'Entender el contexto competitivo ayuda a posicionar mejor tu propuesta',
        how: 'Investiga: Qué hace la competencia + Oportunidades no cubiertas + Tendencias del mercado',
        impact: 'Alto impacto',
        timeToComplete: '30-45 minutos'
      },
      {
        id: 'fundamental_stakeholder',
        title: 'Identificar stakeholders clave',
        why: 'Conocer quién toma decisiones te permite adaptar tu mensaje y enfoque',
        how: 'Lista: Quién aprueba + Quién ejecuta + Quién usa los resultados + Qué le importa a cada uno',
        impact: 'Alto impacto',
        timeToComplete: '10-15 minutos'
      },
      {
        id: 'fundamental_timeline',
        title: 'Crear cronograma detallado',
        why: 'Un timeline realista muestra que has pensado en la ejecución práctica',
        how: 'Incluye: Milestones principales + Dependencias + Tiempo de aprobaciones + Buffer',
        impact: 'Impacto medio',
        timeToComplete: '15-25 minutos'
      }
    ];

    actions.push(...fundamentalActions);
  }

  return actions;
}

function getSpecificActionsForCategory(category: string, verbalScore: string): {
  title: string;
  why: string;
  how: string;
  timeToComplete: string;
}[] {
  const categoryActions: { [key: string]: { title: string; why: string; how: string; timeToComplete: string; }[] } = {
    'Claridad y Enfoque': [
      {
        title: 'Reescribir el título para mayor claridad',
        why: 'El título actual no comunica claramente el alcance del proyecto',
        how: 'Usa la fórmula: [Tipo de actividad] + [Audiencia] + [Timeframe]. Ejemplo: "Campaña Digital para Millennials - Q1 2024"',
        timeToComplete: '5-10 minutos'
      },
      {
        title: 'Definir el alcance específico del proyecto',
        why: 'Límites claros evitan confusión y scope creep durante la ejecución',
        how: 'Especifica: Qué SÍ incluye el proyecto + Qué NO incluye + Límites geográficos/temporales',
        timeToComplete: '10-15 minutos'
      }
    ],
    'Comunicación Ejecutiva': [
      {
        title: 'Restructurar el resumen ejecutivo',
        why: 'El resumen actual no captura la atención ni comunica el valor claramente',
        how: 'Estructura en 3 partes: 1) Qué haremos exactamente 2) Para quién y por qué 3) Qué lograremos',
        timeToComplete: '15-20 minutos'
      },
      {
        title: 'Agregar el "why" del proyecto',
        why: 'Los ejecutivos necesitan entender por qué es importante actuar ahora',
        how: 'Incluye: Oportunidad de mercado + Riesgo de no actuar + Beneficio competitivo esperado',
        timeToComplete: '10-15 minutos'
      }
    ],
    'Conocimiento del Cliente': [
      {
        title: 'Crear buyer personas detalladas',
        why: 'Una audiencia genérica lleva a mensajes genéricos y resultados mediocres',
        how: 'Para cada persona: Nombre, edad, trabajo, ingresos, dolores, motivaciones, canales preferidos',
        timeToComplete: '20-30 minutos'
      },
      {
        title: 'Incluir insights de comportamiento',
        why: 'Entender cómo, cuándo y por qué compran te permite crear mensajes más efectivos',
        how: 'Documenta: Proceso de compra + Momentos de decisión + Influenciadores + Objeciones típicas',
        timeToComplete: '15-25 minutos'
      }
    ],
    'Visión Estratégica': [
      {
        title: 'Convertir objetivos en metas SMART',
        why: 'Objetivos vagos no se pueden medir ni optimizar durante la ejecución',
        how: 'Cada objetivo debe ser: Específico, Medible, Alcanzable, Relevante, Temporal',
        timeToComplete: '15-20 minutos'
      },
      {
        title: 'Priorizar objetivos por impacto',
        why: 'Tener demasiados objetivos diluye el enfoque y los recursos',
        how: 'Clasifica en: Objetivo primario (1) + Objetivos secundarios (2-3) + Métricas de soporte',
        timeToComplete: '10-15 minutos'
      }
    ],
    'Dirección Creativa': [
      {
        title: 'Definir la "gran idea" central',
        why: 'Sin una idea central fuerte, las piezas creativas carecen de coherencia',
        how: 'La gran idea debe ser: Memorable + Repetible + Diferenciadora + Relevante para la audiencia',
        timeToComplete: '20-30 minutos'
      },
      {
        title: 'Especificar tono y personalidad',
        why: 'Un tono inconsistente confunde a la audiencia y diluye el mensaje',
        how: 'Define: Cómo hablamos + Cómo NO hablamos + Ejemplos de frases + Palabras clave',
        timeToComplete: '15-20 minutos'
      }
    ],
    'Distribución Inteligente': [
      {
        title: 'Justificar cada canal seleccionado',
        why: 'Los canales deben elegirse estratégicamente, no por default',
        how: 'Para cada canal: Por qué es relevante + Qué rol cumple + Cómo se mide + Presupuesto asignado',
        timeToComplete: '15-25 minutos'
      },
      {
        title: 'Definir la experiencia cross-channel',
        why: 'Los usuarios interactúan con múltiples touchpoints - deben sentirse coherentes',
        how: 'Mapea: Customer journey + Puntos de contacto + Mensaje por canal + Handoffs',
        timeToComplete: '20-30 minutos'
      }
    ],
    'Viabilidad Financiera': [
      {
        title: 'Crear desglose detallado del presupuesto',
        why: 'Un presupuesto sin desglose no permite optimizaciones ni control',
        how: 'Categoriza: Medios (40-60%) + Producción (20-30%) + Herramientas (5-10%) + Contingencia (10%)',
        timeToComplete: '15-25 minutos'
      },
      {
        title: 'Incluir escenarios de presupuesto',
        why: 'Los presupuestos cambian - necesitas opciones para diferentes niveles',
        how: 'Define: Escenario mínimo + Escenario óptimo + Escenario aspiracional + Qué incluye cada uno',
        timeToComplete: '20-30 minutos'
      }
    ],
    'Medición de Impacto': [
      {
        title: 'Definir métricas primarias y secundarias',
        why: 'Muchas métricas diluyen el foco - necesitas jerarquía clara',
        how: 'Primarias: 1-2 métricas que definen éxito + Secundarias: 3-4 métricas de soporte',
        timeToComplete: '10-15 minutos'
      },
      {
        title: 'Especificar herramientas de medición',
        why: 'Sin herramientas específicas, la medición queda como "buena intención"',
        how: 'Lista: Qué herramienta + Qué mide + Quién la monitorea + Frecuencia de reporte',
        timeToComplete: '15-20 minutos'
      }
    ]
  };

  return categoryActions[category] || [];
}