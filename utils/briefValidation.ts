/**
 * Utilidades para validar y normalizar briefs
 */

export interface NormalizedBrief {
  projectTitle: string;
  briefSummary: string;
  brandPositioning: string;
  problemStatement: string;
  strategicObjectives: string[];
  keyMessages: string[];
  targetAudience: string[];
  channels: string[];
  budget: string;
  timeline: string;
  successMetrics: string[];
  createdAt: string;
  updatedAt: string;
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
  const now = new Date().toISOString();
  
  return {
    projectTitle: extractStringField(brief?.projectTitle) || generateBriefTitle(brief),
    briefSummary: extractStringField(brief?.briefSummary) || '',
    brandPositioning: extractStringField(brief?.brandPositioning) || '',
    problemStatement: extractStringField(brief?.problemStatement) || '',
    strategicObjectives: extractArrayField(brief?.strategicObjectives),
    keyMessages: extractArrayField(brief?.keyMessages),
    targetAudience: extractArrayField(brief?.targetAudience),
    channels: extractArrayField(brief?.channels),
    budget: extractStringField(brief?.budget) || '',
    timeline: extractStringField(brief?.timeline) || '',
    successMetrics: extractArrayField(brief?.successMetrics),
    createdAt: extractStringField(brief?.createdAt) || now,
    updatedAt: now,
  };
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
    } else if (!value || value.trim() === '') {
      missingFields.push(field.name);
    }
  });
  
  // Verificar campos recomendados
  recommendedFields.forEach(field => {
    const value = normalized[field.key as keyof NormalizedBrief];
    if (Array.isArray(value)) {
      if (value.length === 0) {
        warnings.push(`Se recomienda agregar: ${field.name}`);
      }
    } else if (!value || value.trim() === '') {
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
  if (!completed.briefSummary.trim()) {
    completed.briefSummary = generateBriefSummary(completed);
  }
  
  // Generar objetivos estratégicos si faltan
  if (completed.strategicObjectives.length === 0) {
    completed.strategicObjectives = generateStrategicObjectives(completed);
  }
  
  // Generar posicionamiento de marca si falta
  if (!completed.brandPositioning.trim()) {
    completed.brandPositioning = generateBrandPositioning(completed);
  }
  
  // Generar problema a resolver si falta
  if (!completed.problemStatement.trim()) {
    completed.problemStatement = generateProblemStatement(completed);
  }
  
  // Generar mensajes clave si faltan
  if (completed.keyMessages.length === 0) {
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
  
  if (brief.strategicObjectives.length > 0) {
    parts.push(`con el objetivo de ${brief.strategicObjectives[0].toLowerCase()}`);
  }
  
  if (brief.targetAudience.length > 0) {
    parts.push(`dirigida a ${brief.targetAudience[0].toLowerCase()}`);
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
  if (brief.targetAudience.length > 0) {
    return `${brief.targetAudience[0]} necesita una solución que les permita alcanzar sus objetivos de manera efectiva y confiable.`;
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