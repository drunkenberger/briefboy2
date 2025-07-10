import { useState, useEffect } from 'react';

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
  
  // Actionable insights
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
        test: (strategy: any) => strategy && (strategy.recommendedMix || strategy.channels),
        insight: 'Seleccionar canales específicos maximiza el presupuesto - estar en todos lados es estar en ningún lado'
      },
      {
        test: (strategy: any) => {
          const channels = strategy?.recommendedMix || strategy?.channels || [];
          return channels.some((ch: any) => ch.rationale || ch.strategy);
        },
        insight: 'Justificar por qué elegiste cada canal demuestra pensamiento estratégico, no solo intuición'
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
        test: (budget: any) => budget && (budget.estimatedRange || typeof budget === 'string'),
        insight: 'Un rango presupuestario realista evita sorpresas y permite planificar recursos adecuadamente'
      },
      {
        test: (budget: any) => {
          const text = JSON.stringify(budget).toLowerCase();
          return /\b(\d+%|pauta|producción|herramientas|personal)\b/.test(text);
        },
        insight: 'Desglosar la inversión por categorías ayuda a optimizar el ROI y justificar cada gasto'
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
        test: (metrics: any) => metrics && (metrics.primary || Array.isArray(metrics)),
        insight: 'Sin métricas claras, es imposible saber si la campaña funcionó - "me gusta" no es suficiente'
      },
      {
        test: (metrics: any) => {
          const text = JSON.stringify(metrics).toLowerCase();
          return /\b(\d+|ctr|reach|impresiones|conversiones|ventas)\b/.test(text);
        },
        insight: 'Métricas específicas y numéricas permiten optimizar la campaña en tiempo real'
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

  const analyzeBrief = async (briefToAnalyze: any) => {
    if (!briefToAnalyze) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Realizar análisis educativo local (más rápido y didáctico)
      const educationalAnalysis = performEducationalAnalysis(briefToAnalyze);
      setAnalysis(educationalAnalysis);
      
      // Opcionalmente, enriquecer con AI para insights más profundos
      // await enrichWithAIInsights(educationalAnalysis, briefToAnalyze);
      
    } catch (err: any) {
      console.error('Error en análisis educativo:', err);
      setError('No pudimos analizar tu brief en este momento. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brief) {
      analyzeBrief(brief);
    }
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

  // Analizar cada sección del brief
  Object.entries(BRIEF_CRITERIA).forEach(([sectionKey, criteria]) => {
    const sectionData = brief[sectionKey];
    const insights: AnalysisInsight[] = [];
    let sectionScore = 0;
    let sectionMaxScore = criteria.checks.length * 25; // 25 puntos por check
    
    criteria.checks.forEach((check, index) => {
      const passed = check.test(sectionData);
      if (passed) sectionScore += 25;
      
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

  // Generar acciones prioritarias basadas en scores verbales
  const priorityActions = healthChecks
    .filter(hc => hc.verbalScore === 'puede-mejorar' || hc.verbalScore === 'necesita-trabajo' || hc.verbalScore === 'incompleto')
    .slice(0, 3)
    .map((hc, index) => {
      const impactLevel = hc.verbalScore === 'incompleto' || hc.verbalScore === 'necesita-trabajo' ? 'alto' : 'medio';
      const timeEstimate = impactLevel === 'alto' ? '15-30 minutos' : '10-15 minutos';
      
      return {
        id: `action_${index}`,
        title: `Mejora tu ${hc.category}`,
        why: `Tu ${hc.category.toLowerCase()} está "${hc.verbalScore.replace('-', ' ')}" - hay gran potencial de mejora aquí`,
        how: hc.insights[0]?.explanation || `Revisa los ejemplos en la sección de ${hc.category}`,
        impact: impactLevel === 'alto' ? 'Alto impacto' : 'Impacto medio',
        timeToComplete: timeEstimate
      };
    });

  return {
    overallAssessment,
    overallScore,
    readinessLevel,
    healthChecks,
    didYouKnow,
    bestPractices,
    commonMistakes,
    priorityActions,
    progressIndicators: {
      completedWell: healthChecks.filter(hc => hc.status === 'excelente' || hc.status === 'bueno').map(hc => hc.category),
      improvementAreas: healthChecks.filter(hc => hc.status === 'regular' || hc.status === 'deficiente' || hc.status === 'faltante').map(hc => hc.category),
      nextMilestone: getNextMilestone(overallPercentage)
    }
  };
}

// Funciones de conversión verbal
function getVerbalScore(percentage: number): VerbalScore {
  if (percentage >= 90) return 'excelente';
  if (percentage >= 80) return 'muy-bueno';
  if (percentage >= 70) return 'bueno';
  if (percentage >= 60) return 'regular';
  if (percentage >= 40) return 'puede-mejorar';
  if (percentage >= 20) return 'necesita-trabajo';
  return 'incompleto';
}

function getOverallAssessment(percentage: number): OverallAssessment {
  if (percentage >= 85) return 'muy-completo';
  if (percentage >= 70) return 'bien-estructurado';
  if (percentage >= 55) return 'funcional';
  if (percentage >= 35) return 'basico';
  return 'incompleto';
}

function getReadinessLevel(percentage: number): ReadinessLevel {
  if (percentage >= 85) return 'listo-para-presentar';
  if (percentage >= 70) return 'casi-listo';
  if (percentage >= 50) return 'necesita-pulir';
  return 'requiere-desarrollo';
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