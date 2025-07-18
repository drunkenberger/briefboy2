// Knowledge Base Service para BriefBoy
// Contiene extractos clave de mejores prácticas de briefs publicitarios

interface KnowledgeSection {
  source: string;
  topic: string;
  content: string;
}

class KnowledgeBaseService {
  private knowledgeBase: KnowledgeSection[] = [];
  private isLoaded: boolean = false;

  constructor() {
    this.initializeKnowledgeBase();
  }

  private initializeKnowledgeBase(): void {
    // Extractos clave de los archivos de knowledge base
    this.knowledgeBase = [
      {
        source: "Ogilvy DO Brief",
        topic: "estructura_brief",
        content: `Un brief efectivo debe responder:
- Task: ¿Cuál es la tarea específica? (lanzamiento, reposicionamiento, etc.)
- Success Criteria: ¿Cómo se medirá el éxito? ¿Están las métricas en su lugar?
- Why is this brief here?: ¿Qué mantiene despierto al cliente? ¿Cuál es el gran problema brillante que podemos resolver?
- Target Audience: No solo demografía, sino insights profundos sobre comportamiento y motivaciones
- Single Minded Proposition: Una idea única y poderosa que guíe toda la comunicación
- Support: Evidencia que respalde la proposición
- Tone & Manner: Cómo debe sentirse la comunicación`
      },
      {
        source: "Creative Brief Best Practices",
        topic: "elementos_criticos",
        content: `El Creative Brief es la pieza de papel más importante en una agencia. Elementos críticos:
1. Business Objective: Objetivo de negocio claro y medible
2. Communication Objective: ¿Qué queremos que la audiencia piense, sienta o haga?
3. Target Insight: Un insight profundo sobre la audiencia que desbloquee la creatividad
4. Brand Truth: La verdad fundamental de la marca que debe brillar
5. Creative Challenge: El desafío creativo expresado de forma inspiradora
6. Mandatories: Elementos obligatorios (logo, tagline, etc.)
7. Deliverables: Entregables específicos con fechas`
      },
      {
        source: "TBWA Disruption",
        topic: "estrategia_disruptiva", 
        content: `La estrategia disruptiva busca:
- Convention: Identificar la convención de la categoría
- Disruption: Encontrar la idea que rompa esa convención
- Vision: Crear una visión del futuro de la marca
- Media Arts: Pensar más allá de la publicidad tradicional
- Cultural Tension: Identificar tensiones culturales relevantes
- Brand Behavior: Definir comportamientos de marca, no solo comunicación`
      },
      {
        source: "Impact BBDO",
        topic: "problema_solucion",
        content: `Un gran brief debe:
- Definir el problema real del negocio, no el síntoma
- Incluir datos duros que soporten el desafío
- Tener una hipótesis clara de cómo la comunicación puede resolver el problema
- Definir el cambio de comportamiento específico requerido
- Establecer KPIs claros y alcanzables
- Inspirar a los creativos con un desafío emocionante`
      },
      {
        source: "Brief Writing Guide",
        topic: "errores_comunes",
        content: `Errores comunes en briefs:
- Ser demasiado genérico ("aumentar ventas")
- No incluir insights reales sobre la audiencia
- Objetivos no medibles
- Demasiada información irrelevante
- Falta de contexto competitivo
- No definir el problema real del negocio
- Ausencia de presupuesto o timeline claro
- No involucrar a los creativos temprano`
      },
      {
        source: "Agency Best Practices",
        topic: "proceso_ideal",
        content: `Proceso ideal de briefing:
1. Pre-brief: Reunión informal con creativos para explorar el desafío
2. Brief escrito: Documento claro y conciso (máximo 2 páginas)
3. Briefing session: Presentación inspiradora del brief
4. Q&A: Espacio para preguntas y clarificaciones
5. Tissue session: Primera revisión de ideas iniciales
6. Refinamiento: Ajustes basados en feedback inicial`
      }
    ];
    
    this.isLoaded = true;
  }

  getRelevantContext(topic: string): string {
    const relevantSections = this.knowledgeBase.filter(section => 
      section.topic.includes(topic.toLowerCase()) || 
      section.content.toLowerCase().includes(topic.toLowerCase())
    );
    
    return relevantSections
      .map(section => `[${section.source}]\n${section.content}`)
      .join('\n\n');
  }

  getBriefStructureGuidance(): string {
    const structureSections = this.knowledgeBase.filter(section => 
      section.topic === 'estructura_brief' || 
      section.topic === 'elementos_criticos'
    );
    
    return structureSections
      .map(section => section.content)
      .join('\n\n');
  }

  getCommonMistakes(): string {
    const mistakeSection = this.knowledgeBase.find(section => 
      section.topic === 'errores_comunes'
    );
    
    return mistakeSection ? mistakeSection.content : '';
  }

  getStrategyInsights(): string {
    const strategySections = this.knowledgeBase.filter(section => 
      section.topic.includes('estrategia') || 
      section.topic === 'problema_solucion'
    );
    
    return strategySections
      .map(section => `[${section.source}]\n${section.content}`)
      .join('\n\n');
  }

  getAllKnowledge(): string {
    return `CONOCIMIENTO DE MEJORES PRÁCTICAS DE BRIEFS PUBLICITARIOS:

${this.knowledgeBase
  .map(section => `[${section.source} - ${section.topic}]\n${section.content}`)
  .join('\n\n---\n\n')}

RESUMEN DE PUNTOS CLAVE:
1. Un brief debe definir el problema real del negocio, no síntomas
2. Incluir insights profundos sobre la audiencia, no solo demografía
3. Objetivos claros, medibles y con KPIs específicos
4. Una proposición única y poderosa que guíe la creatividad
5. Contexto competitivo y cultural relevante
6. Presupuesto y timeline realistas
7. Inspirar a los creativos con un desafío emocionante`;
  }
}

export const knowledgeBaseService = new KnowledgeBaseService();