/**
 * Utilidades para validar y normalizar briefs
 */

export interface NormalizedBrief {
  projectTitle: string;
  briefSummary: string;
  brandPositioning: string;
  businessChallenge?: string;
  strategicObjectives: string[];
  targetAudience?: {
    primary?: string;
    secondary?: string;
    insights?: string[];
  };
  creativeStrategy?: {
    bigIdea?: string;
    messageHierarchy?: string[];
    toneAndManner?: string;
    creativeMandatories?: string[];
  };
  channelStrategy?: any;
  successMetrics?: any;
  budgetConsiderations?: any;
  riskAssessment?: any;
  implementationRoadmap?: any;
  nextSteps?: string[];
  appendix?: any;
  createdAt: string;
  updatedAt: string;
  [key: string]: any; // Para permitir campos adicionales
}

/**
 * Genera un título automático para un brief basado en su contenido
 */
export function generateBriefTitle(brief: any): string {
  // Intentar usar el título del proyecto si existe
  if (brief?.projectTitle && typeof brief.projectTitle === 'string' && brief.projectTitle.trim()) {
    return brief.projectTitle.trim();
  }

  // Si no hay título, intentar generar uno basado en el contenido
  if (brief?.briefSummary && typeof brief.briefSummary === 'string' && brief.briefSummary.trim()) {
    const summary = brief.briefSummary.trim();
    const words = summary.split(' ').slice(0, 6).join(' ');
    return words.length > 3 ? `Brief: ${words}${words.length < summary.length ? '...' : ''}` : `Brief ${new Date().toLocaleDateString()}`;
  }

  // Si hay objetivos estratégicos, usar el primero
  if (brief?.strategicObjectives && Array.isArray(brief.strategicObjectives) && brief.strategicObjectives.length > 0) {
    const firstObjective = brief.strategicObjectives[0];
    if (typeof firstObjective === 'string' && firstObjective.trim()) {
      const words = firstObjective.trim().split(' ').slice(0, 5).join(' ');
      return `Brief: ${words}${words.length < firstObjective.length ? '...' : ''}`;
    }
  }

  // Si hay mensajes clave, usar el primero
  if (brief?.keyMessages && Array.isArray(brief.keyMessages) && brief.keyMessages.length > 0) {
    const firstMessage = brief.keyMessages[0];
    if (typeof firstMessage === 'string' && firstMessage.trim()) {
      const words = firstMessage.trim().split(' ').slice(0, 5).join(' ');
      return `Brief: ${words}${words.length < firstMessage.length ? '...' : ''}`;
    }
  }

  // Fallback por defecto
  return `Brief ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
}

/**
 * Normaliza un brief para asegurar que tenga todos los campos necesarios
 */
export function normalizeBrief(brief: any): NormalizedBrief {
  if (!brief) {
    const now = new Date().toISOString();
    return {
      projectTitle: '',
      briefSummary: '',
      brandPositioning: '',
      businessChallenge: '',
      strategicObjectives: [],
      targetAudience: undefined,
      creativeStrategy: undefined,
      channelStrategy: undefined,
      successMetrics: undefined,
      budgetConsiderations: undefined,
      riskAssessment: undefined,
      implementationRoadmap: undefined,
      nextSteps: undefined,
      appendix: undefined,
      createdAt: now,
      updatedAt: now
    };
  }

  const now = new Date().toISOString();

  // SOLUCIÓN: Mapear campos de la IA generada al schema normalizado
  const normalizedBrief = {
    ...brief, // Preservar TODOS los campos originales de la IA

    // Mapear campos de IA a schema normalizado (soportando ambos formatos)
    projectTitle: extractStringField(brief.projectTitle || brief.title || ''),
    briefSummary: extractStringField(brief.briefSummary || brief.summary || ''),
    brandPositioning: extractStringField(brief.brandPositioning || ''),
    businessChallenge: extractStringField(brief.businessChallenge || ''),
    strategicObjectives: extractArrayField(brief.strategicObjectives || brief.objectives || []),

    // Mapear targetAudience preservando estructura (PRESERVAR formato original de la IA)
    targetAudience: brief.targetAudience ? brief.targetAudience : undefined,

    // Mapear keyMessages a creativeStrategy
    creativeStrategy: brief.creativeStrategy || brief.keyMessages ? {
      ...brief.creativeStrategy,
      messageHierarchy: extractArrayField(brief.keyMessages || brief.creativeStrategy?.messageHierarchy || []),
      bigIdea: extractStringField(brief.creativeStrategy?.bigIdea || ''),
      toneAndManner: extractStringField(brief.creativeStrategy?.toneAndManner || ''),
      creativeMandatories: extractArrayField(brief.creativeStrategy?.creativeMandatories || [])
    } : undefined,

    // Mapear channels a channelStrategy
    channelStrategy: brief.channels || brief.channelStrategy ? {
      ...brief.channelStrategy,
      channels: brief.channels || brief.channelStrategy?.channels || []
    } : undefined,

    // Mapear success a successMetrics
    successMetrics: brief.success || brief.successMetrics ? {
      ...brief.successMetrics,
      metrics: brief.success || brief.successMetrics?.metrics || []
    } : undefined,

    // Mapear budget y timeline
    budgetConsiderations: brief.budget || brief.budgetConsiderations || undefined,
    implementationRoadmap: brief.timeline || brief.implementationRoadmap || undefined,

    // Timestamps
    createdAt: extractStringField(brief?.createdAt) || now,
    updatedAt: now,
  };

  console.log('🔧 normalizeBrief: Campos preservados:', {
    originalFields: Object.keys(brief),
    mappedTitle: { from: brief.title, to: normalizedBrief.projectTitle },
    mappedSummary: { from: brief.summary, to: normalizedBrief.briefSummary },
    mappedObjectives: { from: brief.objectives, to: normalizedBrief.strategicObjectives },
    hasTargetAudience: !!normalizedBrief.targetAudience,
    targetAudienceType: typeof brief.targetAudience,
    targetAudienceContent: brief.targetAudience,
    hasCreativeStrategy: !!normalizedBrief.creativeStrategy,
    totalFields: Object.keys(normalizedBrief).length
  });

  return normalizedBrief;
}

/**
 * Extrae un campo string de manera segura
 */
function extractStringField(field: any): string {
  if (typeof field === 'string') {
    return field;
  }
  if (field != null && typeof field === 'object') {
    return JSON.stringify(field);
  }
  if (field != null) {
    return String(field);
  }
  return '';
}

/**
 * Extrae un campo array de manera segura
 */
function extractArrayField(field: any): string[] {
  if (Array.isArray(field)) {
    return field.map(item => extractStringField(item)).filter(item => item.trim() !== '');
  }
  if (typeof field === 'string' && field.trim()) {
    // Si es un string, intentar dividirlo por comas, puntos y comas, o saltos de línea
    return field.split(/[,;\n]/).map(item => item.trim()).filter(item => item !== '');
  }
  if (field != null && typeof field === 'object') {
    // Si es un objeto, intentar extraer valores
    const values = Object.values(field).filter(value => value != null);
    return values.map(value => extractStringField(value)).filter(item => item.trim() !== '');
  }
  return [];
}

/**
 * Valida si un brief tiene el contenido mínimo requerido
 */
export function validateBrief(brief: any): { isValid: boolean; missingFields: string[]; warnings: string[] } {
  const normalized = normalizeBrief(brief);
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Campos requeridos
  const requiredFields = [
    { key: 'projectTitle', name: 'Título del Proyecto' },
    { key: 'briefSummary', name: 'Resumen del Brief' },
    { key: 'strategicObjectives', name: 'Objetivos Estratégicos' },
  ];

  // Campos recomendados
  const recommendedFields = [
    { key: 'brandPositioning', name: 'Posicionamiento de Marca' },
    { key: 'problemStatement', name: 'Problema a Resolver' },
    { key: 'keyMessages', name: 'Mensajes Clave' },
    { key: 'targetAudience', name: 'Audiencia Objetivo' },
  ];

  // Verificar campos requeridos
  requiredFields.forEach(field => {
    const value = normalized[field.key as keyof NormalizedBrief];
    if (Array.isArray(value)) {
      if (value.length === 0) {
        missingFields.push(field.name);
      }
    } else if (!value || (typeof value === 'string' && value.trim() === '') || (typeof value !== 'string' && !value)) {
      missingFields.push(field.name);
    }
  });

  // Verificar campos recomendados
  recommendedFields.forEach(field => {
    const value = normalized[field.key as keyof NormalizedBrief];

    // Manejo especial para targetAudience que es un objeto
    if (field.key === 'targetAudience') {
      if (!value || typeof value !== 'object' ||
          (!value.primary && !value.secondary && (!value.insights || !Array.isArray(value.insights) || value.insights.length === 0))) {
        warnings.push(`Se recomienda agregar: ${field.name}`);
      }
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        warnings.push(`Se recomienda agregar: ${field.name}`);
      }
    } else if (!value || (typeof value === 'string' && value.trim() === '') || (typeof value !== 'string' && !value)) {
      warnings.push(`Se recomienda agregar: ${field.name}`);
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings,
  };
}

/**
 * Completa un brief con contenido generado automáticamente para campos faltantes
 */
export function completeBrief(brief: any): NormalizedBrief {
  const normalized = normalizeBrief(brief);
  const validation = validateBrief(normalized);

  // Si el brief es válido, devolverlo como está
  if (validation.isValid) {
    return normalized;
  }

  // Completar campos faltantes con contenido generado
  const completed = { ...normalized };

  // Generar resumen del brief si falta
  if (!completed.briefSummary || (typeof completed.briefSummary === 'string' && !completed.briefSummary.trim())) {
    completed.briefSummary = generateBriefSummary(completed);
  }

  // Generar objetivos estratégicos si faltan
  if (!completed.strategicObjectives || !Array.isArray(completed.strategicObjectives) || completed.strategicObjectives.length === 0) {
    completed.strategicObjectives = generateStrategicObjectives(completed);
  }

  // Generar posicionamiento de marca si falta
  if (!completed.brandPositioning || (typeof completed.brandPositioning === 'string' && !completed.brandPositioning.trim())) {
    completed.brandPositioning = generateBrandPositioning(completed);
  }

  // Generar problema a resolver si falta
  if (!completed.problemStatement || (typeof completed.problemStatement === 'string' && !completed.problemStatement.trim())) {
    completed.problemStatement = generateProblemStatement(completed);
  }

  // Generar mensajes clave si faltan
  if (!completed.keyMessages || !Array.isArray(completed.keyMessages) || completed.keyMessages.length === 0) {
    completed.keyMessages = generateKeyMessages(completed);
  }

  return completed;
}

/**
 * Genera un resumen del brief automáticamente
 */
function generateBriefSummary(brief: NormalizedBrief): string {
  const parts = [];

  if (brief.projectTitle) {
    parts.push(`Campaña para ${brief.projectTitle}`);
  }

  if (brief.strategicObjectives && Array.isArray(brief.strategicObjectives) && brief.strategicObjectives.length > 0) {
    const firstObjective = brief.strategicObjectives[0];
    if (typeof firstObjective === 'string') {
      parts.push(`con el objetivo de ${firstObjective.toLowerCase()}`);
    }
  }

  if (brief.targetAudience && typeof brief.targetAudience === 'object' && brief.targetAudience.primary) {
    if (typeof brief.targetAudience.primary === 'string') {
      parts.push(`dirigida a ${brief.targetAudience.primary.toLowerCase()}`);
    }
  }

  if (parts.length === 0) {
    return 'Campaña publicitaria integral que busca posicionar la marca y generar engagement con la audiencia objetivo.';
  }

  return parts.join(' ') + '.';
}

/**
 * Genera objetivos estratégicos automáticamente
 */
function generateStrategicObjectives(brief: NormalizedBrief): string[] {
  const objectives = [];

  if (brief.projectTitle) {
    objectives.push(`Aumentar el reconocimiento de marca de ${brief.projectTitle}`);
  }

  objectives.push('Generar engagement con la audiencia objetivo');
  objectives.push('Incrementar la conversión y ventas');

  return objectives;
}

/**
 * Genera posicionamiento de marca automáticamente
 */
function generateBrandPositioning(brief: NormalizedBrief): string {
  if (brief.projectTitle) {
    return `${brief.projectTitle} se posiciona como una marca innovadora y confiable que ofrece soluciones de calidad para satisfacer las necesidades de sus clientes.`;
  }

  return 'Marca innovadora y confiable que ofrece soluciones de calidad para satisfacer las necesidades de sus clientes.';
}

/**
 * Genera declaración del problema automáticamente
 */
function generateProblemStatement(brief: NormalizedBrief): string {
  if (brief.targetAudience && typeof brief.targetAudience === 'object' && brief.targetAudience.primary) {
    if (typeof brief.targetAudience.primary === 'string') {
      return `${brief.targetAudience.primary} necesita una solución que les permita alcanzar sus objetivos de manera efectiva y confiable.`;
    }
  }

  return 'Existe una oportunidad en el mercado para ofrecer una solución innovadora que resuelva las necesidades no satisfechas de la audiencia objetivo.';
}

/**
 * Genera mensajes clave automáticamente
 */
function generateKeyMessages(brief: NormalizedBrief): string[] {
  const messages = [];

  if (brief.projectTitle) {
    messages.push(`${brief.projectTitle}: Tu mejor opción`);
  }

  messages.push('Calidad garantizada');
  messages.push('Innovación al servicio del cliente');
  messages.push('Resultados que superan expectativas');

  return messages;
}