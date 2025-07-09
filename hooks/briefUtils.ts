// Funciones puras para validación y merge de briefs

export const INDISPENSABLE_FIELDS = [
  'title',
  'summary',
  'brandPositioning',
  'objectives',
  'problemStatement',
  'targetAudience',
  'successMetrics',
  'requirements',
  'keyMessages',
  'timeline',
  'channelsAndTactics',
  'riskAnalysis',
  'dependencies',
  'assumptions',
  'outOfScope',
  'campaignPhases',
];

export function isFieldPoor(value: any): boolean {
  if (!value) return true;
  if (typeof value === 'string') return value.trim().length < 5;
  if (Array.isArray(value)) {
    if (typeof value[0] === 'string') {
      if (value.length < 2) return true;
      return value.some(v => typeof v !== 'string' || v.trim().length < 1);
    }
    if (typeof value[0] === 'object') {
      // Para arrays de objetos, solo considera pobre si algún string dentro de los objetos es pobre
      return value.some(obj =>
        Object.values(obj).some(v => typeof v === 'string' ? isFieldPoor(v) : false)
      );
    }
    return false;
  }
  if (typeof value === 'object') return Object.values(value).some(isFieldPoor);
  return false;
}

export function isBriefComplete(brief: any): boolean {
  if (!brief) return false;
  for (const field of INDISPENSABLE_FIELDS) {
    if (isFieldPoor(brief[field])) {
      return false;
    }
  }
  return true;
}

export function isBetter(newVal: any, oldVal: any): boolean {
  if (!oldVal) return !!newVal;
  if (!newVal) return false;
  if (typeof newVal === 'string' && typeof oldVal === 'string') {
    return newVal.length > oldVal.length;
  }
  if (Array.isArray(newVal) && Array.isArray(oldVal)) {
    return newVal.length > oldVal.length;
  }
  if (typeof newVal === 'object' && typeof oldVal === 'object') {
    return Object.keys(newVal).length > Object.keys(oldVal).length;
  }
  return false;
}

export function mergeBriefs(original: any, improved: any): any {
  if (!original || !improved) return original || improved;
  const result: any = Array.isArray(original) ? [] : {};
  for (const key in original) {
    if (Object.prototype.hasOwnProperty.call(improved, key)) {
      const origVal = original[key];
      const impVal = improved[key];
      if (typeof origVal === 'object' && origVal !== null && typeof impVal === 'object' && impVal !== null) {
        result[key] = mergeBriefs(origVal, impVal);
      } else if (isBetter(impVal, origVal)) {
        result[key] = impVal;
      } else {
        result[key] = origVal;
      }
    } else {
      result[key] = original[key];
    }
  }
  for (const key in improved) {
    if (!Object.prototype.hasOwnProperty.call(result, key)) {
      result[key] = improved[key];
    }
  }
  return result;
}