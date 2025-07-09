import { INDISPENSABLE_FIELDS, isBetter, isBriefComplete, isFieldPoor, mergeBriefs } from '../hooks/briefUtils';

describe('briefUtils', () => {
  const fullBrief = {
    title: 'Título largo y profesional para la campaña',
    summary: 'Resumen detallado y extenso que cumple con los requisitos de calidad y longitud mínima.',
    brandPositioning: 'Posicionamiento claro y diferenciado para la marca.',
    objectives: ['Objetivo principal', 'Segundo objetivo'],
    problemStatement: 'Problema bien definido y explicado para la campaña.',
    targetAudience: ['Segmento joven', 'Segmento adulto'],
    successMetrics: ['Métrica principal', 'Métrica secundaria'],
    requirements: {
      functional: ['Funcionalidad principal', 'Funcionalidad secundaria'],
      nonFunctional: ['No funcional principal', 'No funcional secundaria'],
      technical: ['Técnico principal', 'Técnico secundario'],
      security: ['Seguridad principal', 'Seguridad secundaria']
    },
    keyMessages: ['Mensaje principal', 'Mensaje secundario'],
    timeline: 'Cronograma detallado y realista para la campaña.',
    channelsAndTactics: {
      overview: 'Estrategia omnicanal completa y detallada.',
      components: ['Componente principal', 'Componente secundario'],
      technologies: ['Tech principal', 'Tech secundaria'],
      integrations: ['Integración principal', 'Integración secundaria']
    },
    riskAnalysis: {
      risks: ['Riesgo principal', 'Riesgo secundario'],
      mitigations: ['Mitigación principal', 'Mitigación secundaria']
    },
    dependencies: ['Dependencia principal', 'Dependencia secundaria'],
    assumptions: ['Supuesto principal', 'Supuesto secundario'],
    outOfScope: ['Fuera de alcance principal', 'Fuera de alcance secundario'],
    campaignPhases: [
      { phase: 'Fase inicial extendida', deliverables: ['Entregable inicial completo'], duration: '1 semana completa y detallada' },
      { phase: 'Fase avanzada extendida', deliverables: ['Entregable avanzado completo'], duration: '2 semanas completas y detalladas' }
    ]
  };

  it('detecta campos pobres', () => {
    expect(isFieldPoor('')).toBe(true);
    expect(isFieldPoor('Uno')).toBe(true); // menos de 5 caracteres
    expect(isFieldPoor('Breve')).toBe(false); // justo 5 caracteres
    expect(isFieldPoor(['Uno'])).toBe(true);
    expect(isFieldPoor(['Uno', 'Dos'])).toBe(false);
    expect(isFieldPoor({ a: '', b: 'suficiente largo para pasar el filtro' })).toBe(true);
    expect(isFieldPoor({ a: 'suficiente largo para pasar el filtro', b: 'también largo' })).toBe(false);
  });

  it('valida brief completo', () => {
    if (!isBriefComplete(fullBrief)) {
      for (const field of INDISPENSABLE_FIELDS) {
        if (isFieldPoor((fullBrief as any)[field])) {
          // eslint-disable-next-line no-console
          console.log('Campo pobre:', field, (fullBrief as any)[field]);
        }
      }
    }
    expect(isBriefComplete(fullBrief)).toBe(true);
    const briefIncompleto = { ...fullBrief, summary: '' };
    expect(isBriefComplete(briefIncompleto)).toBe(false);
  });

  it('isBetter compara correctamente', () => {
    expect(isBetter('más largo', 'corto')).toBe(true);
    expect(isBetter(['uno', 'dos'], ['uno'])).toBe(true);
    expect(isBetter({ a: 1, b: 2 }, { a: 1 })).toBe(true);
    expect(isBetter('igual', 'igual')).toBe(false);
    expect(isBetter(['uno'], ['uno', 'dos'])).toBe(false);
  });

  it('mergeBriefs combina correctamente', () => {
    const orig = { a: 'uno', b: 'dos', c: { d: 'tres' } };
    const imp = { a: 'uno mejorado', b: 'dos', c: { d: 'tres mejorado', e: 'nuevo' }, f: 'extra' };
    const merged = mergeBriefs(orig, imp);
    expect(merged.a).toBe('uno mejorado');
    expect(merged.b).toBe('dos');
    expect(merged.c.d).toBe('tres mejorado');
    expect(merged.c.e).toBe('nuevo');
    expect(merged.f).toBe('extra');
  });
});