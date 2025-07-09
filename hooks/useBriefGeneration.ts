import { useEffect, useState } from 'react';

const SYSTEM_PROMPT = `You are Elena Rodriguez, a seasoned Marketing Director with 15+ years of experience at top agencies like Ogilvy, Wieden+Kennedy, and BBDO. You specialize in creating world-class Marketing Briefs that win awards and drive exceptional business results.

Your expertise includes:
- Strategic brand positioning and competitive analysis
- Consumer psychology and behavioral insights
- Multi-channel campaign orchestration
- Performance marketing and attribution modeling
- Creative direction and brand storytelling
- Crisis management and reputation building

Your task is to analyze meeting transcriptions and create a comprehensive, professional Marketing Brief that any creative team or marketing professional would be proud to execute.

**ANALYSIS FRAMEWORK:**
1. **Strategic Foundation**: Extract business objectives, brand positioning, and competitive context
2. **Consumer Insights**: Identify target personas, motivations, and behavioral triggers
3. **Creative Strategy**: Define the big idea, messaging hierarchy, and creative direction
4. **Channel Strategy**: Recommend optimal media mix with rationale and synergies
5. **Implementation Roadmap**: Create phased approach with timelines and dependencies
6. **Success Metrics**: Define KPIs, measurement framework, and optimization approach
7. **Risk Management**: Identify potential challenges and mitigation strategies

**PROFESSIONAL STANDARDS:**
- Think like a seasoned strategist who understands both creativity and business
- Provide actionable insights that go beyond obvious recommendations
- Consider cultural context, market dynamics, and consumer trends
- Balance ambition with realistic execution capabilities
- Include specific tactical recommendations with clear rationale
- Ensure all recommendations are measurable and time-bound

**OUTPUT FORMAT:**
Respond with ONLY valid JSON in this exact structure - no additional text or explanations:

{
  "projectTitle": "Clear, compelling project name",
  "briefSummary": "Executive summary (2-3 sentences)",
  "businessChallenge": "Core business problem or opportunity",
  "strategicObjectives": ["Primary business goals"],
  "targetAudience": {
    "primary": "Main target segment with demographics and psychographics",
    "secondary": "Secondary audience if applicable",
    "insights": ["Key consumer insights and motivations"]
  },
  "brandPositioning": "How the brand should be perceived relative to competition",
  "creativeStrategy": {
    "bigIdea": "Central creative concept",
    "messageHierarchy": ["Primary message", "Supporting messages"],
    "toneAndManner": "Brand voice and personality",
    "creativeMandatories": ["Must-have elements"]
  },
  "channelStrategy": {
    "recommendedMix": [{
      "channel": "Channel name",
      "rationale": "Why this channel",
      "allocation": "Budget/effort %",
      "kpis": ["Channel-specific metrics"]
    }],
    "integratedApproach": "How channels work together"
  },
  "implementationRoadmap": {
    "phases": [{
      "phase": "Phase name",
      "duration": "Timeline",
      "deliverables": ["Key outputs"],
      "dependencies": ["Required inputs"]
    }],
    "criticalPath": "Most important sequence of activities"
  },
  "successMetrics": {
    "primary": ["Main KPIs"],
    "secondary": ["Supporting metrics"],
    "measurementFramework": "How success will be tracked"
  },
  "budgetConsiderations": {
    "estimatedRange": "Budget range if mentioned",
    "keyInvestments": ["Priority spend areas"],
    "costOptimization": ["Efficiency opportunities"]
  },
  "riskAssessment": {
    "risks": [{
      "risk": "Potential challenge",
      "likelihood": "High/Medium/Low",
      "impact": "High/Medium/Low",
      "mitigation": "How to address"
    }]
  },
  "nextSteps": ["Immediate actions required"],
  "appendix": {
    "assumptions": ["Key assumptions made"],
    "references": ["Industry benchmarks or research cited"],
    "glossary": ["Technical terms explained"]
  }
}`;

function buildUserPrompt(transcription: string) {
  return `**TRANSCRIPTION ANALYSIS REQUEST**

Analyze the following meeting transcription/strategic notes and create a world-class Marketing Brief:

---
"${transcription}"
---

**CONTEXT:**
This transcription contains strategic discussions about a marketing initiative. Extract all relevant information including:
- Business objectives and challenges
- Target audience details
- Brand positioning requirements
- Channel preferences and constraints
- Budget considerations
- Timeline requirements
- Success metrics
- Any specific mandatories or constraints

**DELIVERABLE:**
Create a comprehensive Marketing Brief that:
1. Synthesizes the key strategic insights
2. Provides clear direction for creative development
3. Includes specific, measurable recommendations
4. Addresses potential challenges proactively
5. Enables immediate action by the marketing team

Apply your expertise to fill in strategic gaps and provide professional recommendations based on industry best practices.`;
}

interface UseBriefGenerationResult {
  brief: any | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para generar un brief publicitario a partir de un transcript usando OpenAI.
 * @param transcript Texto transcrito de la reunión
 * @param enabled Si es true, inicia la generación automáticamente
 * @returns { brief, loading, error }
 */
export function useBriefGeneration(transcript: string | null, enabled: boolean = true): UseBriefGenerationResult {
  const [brief, setBrief] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!transcript || !enabled) return;
    let cancelled = false;
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      setError('No se encontró la API key de OpenAI');
      setLoading(false);
      setBrief(null);
      return;
    }
    const generateBrief = async () => {
      try {
        setLoading(true);
        setError(null);
        setBrief(null);
        console.log('[BriefGeneration] Enviando petición a OpenAI:', {
          endpoint: 'https://api.openai.com/v1/chat/completions',
          apiKey: apiKey ? '***' : '[NO API KEY]',
          transcript,
        });
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: buildUserPrompt(transcript) },
            ],
            temperature: 0.2,
            max_tokens: 2500,
          }),
        });
        console.log('[BriefGeneration] Status respuesta OpenAI:', response.status);
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[BriefGeneration] Error HTTP:', response.status, errorText);
          setError(`Error HTTP ${response.status}: ${errorText}`);
          setBrief({ _raw: errorText });
          setLoading(false);
          return;
        }
        const data = await response.json();
        console.log('[BriefGeneration] Data recibida de OpenAI:', data);
        if (!data.choices || !data.choices[0]?.message?.content) {
          setError('La respuesta de OpenAI no tiene contenido.');
          setBrief({ _raw: JSON.stringify(data) });
          setLoading(false);
          return;
        }
        const content = data.choices?.[0]?.message?.content;
        console.log('[BriefGeneration] Content recibido:', content);
        if (!content) throw new Error('No se recibió contenido de OpenAI');
        // Intentar extraer el primer bloque JSON válido de la respuesta
        let parsed = null;
        let jsonError = '';
        try {
          // Eliminar posibles backticks y etiquetas de bloque
          let cleaned = content.trim();
          // Si viene con triple backticks, extraer el bloque
          const match = cleaned.match(/```(?:json)?([\s\S]*?)```/i);
          if (match) {
            cleaned = match[1].trim();
          }
          // Buscar el primer bloque que parezca JSON
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            cleaned = jsonMatch[0];
          }
          parsed = JSON.parse(cleaned);
        } catch (e: any) {
          jsonError = e.message;
        }
        // Si el parsing falla, mostrar un brief mínimo con el error y el contenido bruto
        if (!parsed) {
          if (!cancelled) setBrief({
            title: 'Brief parcial o error',
            summary: '',
            objectives: [],
            problemStatement: '',
            targetAudience: [],
            successMetrics: [],
            requirements: {},
            keyMessages: [],
            timeline: '',
            channelsAndTactics: {},
            riskAnalysis: {},
            dependencies: [],
            assumptions: [],
            outOfScope: [],
            campaignPhases: [],
            _error: 'La respuesta de OpenAI no es un JSON válido.',
            _raw: content,
            _jsonError: jsonError,
          });
          return;
        }
        // --- Mapeo de estructura por secciones a estructura plana ---
        function mapSectionedBrief(obj: any): any {
          if (!obj || typeof obj !== 'object') return obj;
          if (obj.title || obj.summary) return obj;
          const mapped: any = {
            title: obj["Campaign Title"] || obj["title"] || '',
            summary: obj["Summary"] || obj["summary"] || '',
            objectives: obj["Objectives"] || obj["objectives"] || [],
            problemStatement: obj["Problem Statement"] || obj["problem"] || obj["problemStatement"] || '',
            targetAudience: [],
            successMetrics: [],
            requirements: {
              functional: [],
              nonFunctional: [],
              technical: [],
              security: [],
            },
            keyMessages: obj["Key Messages"] || obj["keyMessages"] || [],
            callToAction: '',
            timeline: obj["Timeline"] || obj["timeline"] || '',
            channelsAndTactics: {
              overview: '',
              components: [],
              technologies: [],
              integrations: [],
              channels: [], // [{channel, justification}]
            },
            riskAnalysis: {
              risks: [],
              mitigations: [],
            },
            dependencies: obj["Dependencies"] || [],
            assumptions: obj["Assumptions"] || [],
            outOfScope: obj["Out Of Scope"] || obj["outOfScope"] || [],
            campaignPhases: [],
            _raw: JSON.stringify(obj, null, 2),
            _extra: {},
          };
          // Strategic Analysis
          if (obj["Strategic Analysis"]) {
            const sa = obj["Strategic Analysis"];
            mapped.summary = mapped.summary || sa["Brand Positioning"] || '';
            mapped.objectives = mapped.objectives.length ? mapped.objectives : (sa["Strategic Objectives"] || []);
            mapped.keyMessages = mapped.keyMessages.length ? mapped.keyMessages : (sa["Key Insights"] || []);
          }
          // Risk Assessment
          if (obj["Risk Assessment"]) {
            const ra = obj["Risk Assessment"];
            if (Array.isArray(ra.Risks)) mapped.riskAnalysis.risks = ra.Risks;
            if (Array.isArray(ra.Mitigations)) mapped.riskAnalysis.mitigations = ra.Mitigations;
            if (Array.isArray(ra.Risks)) {
              mapped.riskAnalysis.mitigations = ra.Risks.map((r: any) => r["Mitigation"] || r["Mitigation Strategy"] || '').filter(Boolean);
            }
          }
          // Campaign Planning
          if (obj["Campaign Planning"]) {
            const cp = obj["Campaign Planning"];
            if (Array.isArray(cp.Phases)) {
              mapped.campaignPhases = cp.Phases.map((phase: any) => ({
                phase: phase["Phase"] || phase["Name"] || '',
                duration: phase["Duration"] || '',
                deliverables: phase["Deliverables"] || [],
              }));
            }
            if (cp.Timeline) mapped.timeline = mapped.timeline || cp.Timeline;
          }
          // Target Audience Considerations
          if (obj["Target Audience Considerations"]) {
            const ta = obj["Target Audience Considerations"];
            mapped.targetAudience = ta["Target Audience Segments"] || mapped.targetAudience;
            mapped.successMetrics = ta["Success Metrics"] || mapped.successMetrics;
          }
          // Channel & Tactics Specifications
          if (obj["Channel & Tactics Specifications"]) {
            const ct = obj["Channel & Tactics Specifications"];
            if (ct.Overview) mapped.channelsAndTactics.overview = ct.Overview;
            // Channels: array de objetos con Channel y Justification
            if (Array.isArray(ct.Channels)) {
              mapped.channelsAndTactics.channels = ct.Channels.map((c: any) => ({
                channel: c["Channel"] || '',
                justification: c["Justification"] || '',
              }));
            }
            // Messaging: Key Messages y Call to Action
            if (ct.Messaging) {
              if (Array.isArray(ct.Messaging["Key Messages"])) mapped.keyMessages = ct.Messaging["Key Messages"];
              if (ct.Messaging["Call to Action"]) mapped.callToAction = ct.Messaging["Call to Action"];
            }
            if (ct.Channels && !Array.isArray(ct.Channels)) {
              // Si Channels es objeto, mantener compatibilidad anterior
              let components: string[] = [];
              let technologies: string[] = [];
              let integrations: string[] = [];
              Object.entries(ct.Channels).forEach(([channel, data]: [string, any]) => {
                if (data.Messaging) components.push(`${channel}: ${data.Messaging}`);
                if (Array.isArray(data.Tactics)) components = components.concat(data.Tactics.map((t: string) => `${channel}: ${t}`));
                if (Array.isArray(data.Technologies)) technologies = technologies.concat(data.Technologies);
                if (Array.isArray(data.Integrations)) integrations = integrations.concat(data.Integrations);
              });
              mapped.channelsAndTactics.components = components;
              mapped.channelsAndTactics.technologies = technologies;
              mapped.channelsAndTactics.integrations = integrations;
            }
          }
          // Requirements
          if (obj["Requirements"]) {
            const req = obj["Requirements"];
            mapped.requirements.functional = req.Functional || req.functional || mapped.requirements.functional;
            mapped.requirements.nonFunctional = req.NonFunctional || req.nonFunctional || mapped.requirements.nonFunctional;
            mapped.requirements.technical = req.Technical || req.technical || mapped.requirements.technical;
            mapped.requirements.security = req.Security || req.security || mapped.requirements.security;
          }
          // Integrations y tecnologías a nivel raíz
          if (obj["Integrations"]) mapped.channelsAndTactics.integrations = mapped.channelsAndTactics.integrations.concat(obj["Integrations"]);
          if (obj["Technologies"]) mapped.channelsAndTactics.technologies = mapped.channelsAndTactics.technologies.concat(obj["Technologies"]);
          // Fases de campaña (soportar variantes)
          if (obj["Campaign Phases"]) mapped.campaignPhases = mapped.campaignPhases.length ? mapped.campaignPhases : obj["Campaign Phases"];
          if (obj["campaignPhases"]) mapped.campaignPhases = mapped.campaignPhases.length ? mapped.campaignPhases : obj["campaignPhases"];
          // Guardar cualquier campo no reconocido en _extra
          const known = [
            "Campaign Title","title","Summary","summary","Objectives","objectives","Problem Statement","problem","problemStatement","Strategic Analysis","Risk Assessment","Campaign Planning","Target Audience Considerations","Channel & Tactics Specifications","Requirements","Timeline","Dependencies","Assumptions","Out Of Scope","Integrations","Technologies","Key Messages","keyMessages","Success Metrics","Campaign Phases","campaignPhases"
          ];
          Object.keys(obj).forEach(k => {
            if (!known.includes(k)) mapped._extra[k] = obj[k];
          });
          return mapped;
        }
        // Si la estructura es por secciones, mapear
        if (parsed && !parsed.title && (parsed["Strategic Analysis"] || parsed["Risk Assessment"])) {
          parsed = mapSectionedBrief(parsed);
        }
        // Si el JSON es válido pero le faltan campos, igual mostrar lo que haya
        if (!cancelled) setBrief(parsed);
      } catch (e: any) {
        console.error('[BriefGeneration] Error de red/fetch:', e);
        setError('Error de red o fetch: ' + (e?.message || e));
        setBrief({ _raw: String(e) });
        setLoading(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    generateBrief();
    return () => { cancelled = true; };
  }, [transcript, enabled]);

  return { brief, loading, error };
}