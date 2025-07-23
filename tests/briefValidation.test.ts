import {
    completeBrief,
    evaluateTitle,
    generateBriefTitle,
    normalizeBrief,
    validateBrief
} from '../utils/briefValidation';

describe('briefValidation', () => {
  describe('normalizeBrief', () => {
    it('should preserve targetAudience object structure', () => {
      const brief = {
        projectTitle: 'Test Project',
        briefSummary: 'Test summary',
        strategicObjectives: ['Objective 1'],
        targetAudience: {
          primary: 'Young professionals',
          secondary: 'Students',
          insights: ['Tech-savvy', 'Budget-conscious']
        }
      };

      const normalized = normalizeBrief(brief);

      expect(normalized.targetAudience).toEqual({
        primary: 'Young professionals',
        secondary: 'Students',
        insights: ['Tech-savvy', 'Budget-conscious']
      });
    });

    it('should handle empty targetAudience object', () => {
      const brief = {
        projectTitle: 'Test Project',
        briefSummary: 'Test summary',
        strategicObjectives: ['Objective 1'],
        targetAudience: {}
      };

      const normalized = normalizeBrief(brief);

      expect(normalized.targetAudience).toEqual({});
    });

    it('should handle missing targetAudience', () => {
      const brief = {
        projectTitle: 'Test Project',
        briefSummary: 'Test summary',
        strategicObjectives: ['Objective 1']
      };

      const normalized = normalizeBrief(brief);

      expect(normalized.targetAudience).toBeUndefined();
    });
  });

  describe('validateBrief', () => {
    it('should not warn when targetAudience has primary', () => {
      const brief = {
        projectTitle: 'Test Project',
        briefSummary: 'Test summary',
        strategicObjectives: ['Objective 1'],
        targetAudience: {
          primary: 'Young professionals'
        }
      };

      const validation = validateBrief(brief);

      expect(validation.warnings).not.toContain('Se recomienda agregar: Audiencia Objetivo');
    });

    it('should not warn when targetAudience has secondary', () => {
      const brief = {
        projectTitle: 'Test Project',
        briefSummary: 'Test summary',
        strategicObjectives: ['Objective 1'],
        targetAudience: {
          secondary: 'Students'
        }
      };

      const validation = validateBrief(brief);

      expect(validation.warnings).not.toContain('Se recomienda agregar: Audiencia Objetivo');
    });

    it('should not warn when targetAudience has insights', () => {
      const brief = {
        projectTitle: 'Test Project',
        briefSummary: 'Test summary',
        strategicObjectives: ['Objective 1'],
        targetAudience: {
          insights: ['Tech-savvy', 'Budget-conscious']
        }
      };

      const validation = validateBrief(brief);

      expect(validation.warnings).not.toContain('Se recomienda agregar: Audiencia Objetivo');
    });

    it('should warn when targetAudience is empty object', () => {
      const brief = {
        projectTitle: 'Test Project',
        briefSummary: 'Test summary',
        strategicObjectives: ['Objective 1'],
        targetAudience: {}
      };

      const validation = validateBrief(brief);

      expect(validation.warnings).toContain('Se recomienda agregar: Audiencia Objetivo');
    });

    it('should warn when targetAudience is missing', () => {
      const brief = {
        projectTitle: 'Test Project',
        briefSummary: 'Test summary',
        strategicObjectives: ['Objective 1']
      };

      const validation = validateBrief(brief);

      expect(validation.warnings).toContain('Se recomienda agregar: Audiencia Objetivo');
    });

    it('should warn when targetAudience has empty insights array', () => {
      const brief = {
        projectTitle: 'Test Project',
        briefSummary: 'Test summary',
        strategicObjectives: ['Objective 1'],
        targetAudience: {
          insights: []
        }
      };

      const validation = validateBrief(brief);

      expect(validation.warnings).toContain('Se recomienda agregar: Audiencia Objetivo');
    });
  });

  describe('generateBriefTitle', () => {
    it('should generate title from projectTitle', () => {
      const brief = {
        projectTitle: 'Amazing Campaign'
      };

      const title = generateBriefTitle(brief);

      expect(title).toBe('Amazing Campaign');
    });

    it('should handle brief with targetAudience object', () => {
      const brief = {
        targetAudience: {
          primary: 'Young professionals',
          secondary: 'Students'
        }
      };

      const title = generateBriefTitle(brief);

      expect(title).toMatch(/Brief \d{1,2}\/\d{1,2}\/\d{4}/);
    });
  });

  describe('completeBrief', () => {
    it('should generate content using targetAudience.primary', () => {
      const brief = {
        projectTitle: 'Test Campaign',
        targetAudience: {
          primary: 'Young professionals',
          secondary: 'Students'
        }
      };

      const completed = completeBrief(brief);

      expect(completed.briefSummary).toContain('dirigida a young professionals');
    });

    it('should generate problem statement using targetAudience.primary', () => {
      const brief = {
        projectTitle: 'Test Campaign',
        targetAudience: {
          primary: 'Small business owners'
        }
      };

      const completed = completeBrief(brief);

      expect(completed.problemStatement).toContain('Small business owners necesita una solución');
    });

    it('should handle brief without targetAudience.primary', () => {
      const brief = {
        projectTitle: 'Test Campaign',
        targetAudience: {
          secondary: 'Students'
        }
      };

      const completed = completeBrief(brief);

      expect(completed.briefSummary).not.toContain('dirigida a');
      expect(completed.problemStatement).toContain('Existe una oportunidad en el mercado');
    });

    it('should handle brief with empty targetAudience', () => {
      const brief = {
        projectTitle: 'Test Campaign',
        targetAudience: {}
      };

      const completed = completeBrief(brief);

      expect(completed.briefSummary).not.toContain('dirigida a');
      expect(completed.problemStatement).toContain('Existe una oportunidad en el mercado');
    });
  });

  describe('evaluateTitle', () => {
    it('should classify short titles as basic', () => {
      expect(evaluateTitle('Test')).toBe('basic');
      expect(evaluateTitle('Campaign')).toBe('basic');
    });

    it('should classify generic titles as basic', () => {
      expect(evaluateTitle('Campaña')).toBe('basic');
      expect(evaluateTitle('Proyecto Brief')).toBe('basic');
      expect(evaluateTitle('Sin título')).toBe('basic');
      expect(evaluateTitle('New project')).toBe('basic');
    });

    it('should classify descriptive titles as excellent', () => {
      expect(evaluateTitle('Campaña de Lanzamiento: Libera tu Espíritu')).toBe('excellent');
      expect(evaluateTitle('Revolución Digital 2024')).toBe('excellent');
      expect(evaluateTitle('La Nueva Era de la Sustentabilidad')).toBe('excellent');
      expect(evaluateTitle('Marketing Campaign for Tech Startups')).toBe('excellent');
    });

    it('should classify medium-length specific titles as good', () => {
      expect(evaluateTitle('Tech Launch')).toBe('good');
      expect(evaluateTitle('Summer Sale')).toBe('good');
    });

    it('should handle titles with special characters', () => {
      expect(evaluateTitle('Campaign 2024: Digital Revolution!')).toBe('excellent');
      expect(evaluateTitle('Innovation Summit: Digital Transformation')).toBe('excellent');
    });
  });
});