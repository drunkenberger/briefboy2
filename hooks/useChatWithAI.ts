import { useEffect, useState } from 'react';
import { INDISPENSABLE_FIELDS, isFieldPoor, mergeBriefs } from './briefUtils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const BRIEF_EXAMPLE = `{
  "title": "Lanzamiento de Nueva Bebida Saludable X",
  "summary": "Desarrollar una campaña integral para posicionar la nueva Bebida Saludable X como la mejor opción para jóvenes activos, destacando beneficios funcionales, sabor único y valores de marca. El objetivo es captar cuota de mercado y fidelizar consumidores en el segmento 18-30 años, con un enfoque omnicanal y mensajes diferenciadores.",
  "brandPositioning": "Bebida Saludable X es la opción premium para jóvenes que buscan bienestar, sabor y autenticidad, alineada con un estilo de vida activo y consciente.",
  "objectives": [
    "Incrementar el reconocimiento de marca en un 30% en 6 meses",
    "Generar 10,000 registros en la web de la campaña",
    "Aumentar ventas en canal digital un 20% durante el periodo promocional"
  ],
  "problemStatement": "El mercado de bebidas saludables está saturado y los consumidores perciben poca diferenciación entre opciones. La marca es nueva y carece de posicionamiento en la mente del consumidor objetivo.",
  "targetAudience": [
    {
      "segment": "Jóvenes urbanos 18-30",
      "demographics": "18-30 años, ambos sexos, ciudades grandes",
      "psychographics": "Interesados en fitness, bienestar, vida social activa",
      "needs": "Opciones saludables, conveniencia, autenticidad",
      "mediaHabits": "Instagram, TikTok, YouTube, podcasts"
    },
    {
      "segment": "Padres jóvenes",
      "demographics": "30-40 años, con hijos pequeños",
      "psychographics": "Preocupados por la salud familiar",
      "needs": "Productos confiables, ingredientes naturales",
      "mediaHabits": "Facebook, blogs de salud, TV digital"
    }
  ],
  "successMetrics": [
    "Alcance de 2 millones de impresiones en redes sociales",
    "Tasa de conversión web superior al 5%",
    "Engagement rate en Instagram > 8%"
  ],
  "requirements": {
    "functional": [
      "Landing page responsiva con formulario de registro y validación de correo electrónico.",
      "Integración con CRM Salesforce para leads generados.",
      "Sistema de referidos para incentivar el registro de nuevos usuarios."
    ],
    "nonFunctional": [
      "Carga en menos de 2 segundos.",
      "Accesibilidad AA.",
      "Contenido disponible en español e inglés."
    ],
    "technical": [
      "Soporte para dispositivos móviles y desktop.",
      "Integración con Google Analytics y Facebook Pixel.",
      "API para conexión con sistemas de promociones."
    ],
    "security": [
      "Cumplimiento RGPD y políticas de privacidad.",
      "Encriptación de datos personales en tránsito y reposo.",
      "Validación de autenticidad de usuarios mediante reCAPTCHA."
    ]
  },
  "keyMessages": [
    "Sabor único, salud real.",
    "Energía natural para tu día a día.",
    "Sin azúcares añadidos, sin culpa."
  ],
  "timeline": "Teaser: 2 semanas. Lanzamiento: 1 mes. Sostenimiento: 3 meses. Incluye hitos de producción, aprobación creativa y optimización.",
  "channelsAndTactics": {
    "overview": "Estrategia omnicanal digital y presencial, con fuerte presencia en redes sociales, influencers y eventos universitarios.",
    "components": [
      {"name": "Instagram y TikTok Ads", "description": "Anuncios segmentados con creatividades dinámicas", "justification": "Alta concentración del público objetivo y potencial viralidad"},
      {"name": "Influencers fitness", "description": "Colaboraciones con microinfluencers", "justification": "Generar confianza y credibilidad"},
      {"name": "Eventos universitarios", "description": "Activaciones presenciales con degustaciones", "justification": "Contacto directo y experiencia de producto"}
    ],
    "technologies": ["Meta Ads Manager", "Google Analytics", "Salesforce CRM"],
    "integrations": ["API de promociones", "Integración con plataformas de email marketing"]
  },
  "riskAnalysis": {
    "risks": ["Baja participación en eventos", "Percepción de precio elevado", "Problemas logísticos en entregas"],
    "mitigations": ["Campañas de recordatorio", "Promociones de precio", "Alianzas con operadores logísticos confiables"]
  },
  "dependencies": ["Aprobación de presupuesto", "Disponibilidad de influencers", "Desarrollo de landing page"],
  "assumptions": ["El producto estará disponible en todos los puntos de venta a tiempo", "El público objetivo utiliza activamente redes sociales"],
  "outOfScope": ["Publicidad en TV", "Campañas fuera del país"],
  "campaignPhases": [
    {
      "phase": "Teaser",
      "deliverables": ["Videos cortos en redes", "Landing teaser"],
      "duration": "2 semanas"
    },
    {
      "phase": "Lanzamiento",
      "deliverables": ["Evento de lanzamiento", "Campaña de influencers", "Anuncios pagados"],
      "duration": "1 mes"
    },
    {
      "phase": "Sostenimiento",
      "deliverables": ["Contenido semanal en redes", "Newsletter", "Promociones cruzadas"],
      "duration": "3 meses"
    }
  ]
}`;

const SYSTEM_PROMPT = `You are an expert Marketing Director and Strategic Planner specialized in creating comprehensive Marketing Briefs for creative teams and AI agents.

Your task is to analyze meeting transcriptions and generate a highly detailed, actionable Marketing Brief using the following JSON structure and example. DO NOT generate the final brief until ALL fields are complete, specific, and professional. If any field is empty, ambiguous, or poor, ask the user for more details or invent realistic, professional examples. After each user response, validate the brief and repregunta ONLY for the missing or weak fields. Repeat until the brief is complete and of high quality.

RESPONSE FORMAT:
You MUST respond with ONLY valid JSON in this exact structure:
${BRIEF_EXAMPLE}

QUALITY STANDARDS:
• All fields and subfields are MANDATORY and must NEVER be empty or generic.
• If you lack information, ask the user for more details or invent realistic, professional examples.
• Brand positioning and all strategic insights MUST be included in the appropriate fields.
• Requirements and all subfields must be detailed and actionable.
• After each user response, validate the brief and repregunta ONLY for the missing or weak fields.
• Do not generate the final brief until ALL fields are complete and of high quality.
• Do not include any explanatory text outside the JSON.`;

const REQUIREMENTS_EXAMPLE = `"requirements": {
  "functional": [
    "El sistema debe permitir a los usuarios registrarse y crear un perfil personal.",
    "La campaña debe incluir un formulario de registro con validación de correo electrónico.",
    "El usuario debe poder compartir contenido en redes sociales desde la landing page."
  ],
  "nonFunctional": [
    "El sitio debe cargar en menos de 2 segundos.",
    "La campaña debe cumplir con los estándares de accesibilidad AA.",
    "El contenido debe estar disponible en español e inglés."
  ],
  "technical": [
    "Integración con Google Analytics para seguimiento de conversiones.",
    "Soporte para dispositivos móviles y desktop.",
    "Integración con CRM Salesforce para leads generados."
  ],
  "security": [
    "Cumplimiento con RGPD y políticas de privacidad.",
    "Encriptación de datos personales en tránsito y en reposo.",
    "Validación de autenticidad de usuarios mediante reCAPTCHA."
  ]
}`;

const ANALYSIS_PROMPT = `You are a senior Marketing Strategist and Creative Director with expertise in reviewing Marketing Briefs for creative teams and AI agents.

Your task is to analyze a generated Marketing Brief and identify what's missing or could be improved to make it more comprehensive and actionable for campaign development.

ANALYSIS CRITERIA:
1. Completeness: Are all necessary sections filled with meaningful content?
2. Specificity: Are objectives and requirements specific enough to execute?
3. Strategic Depth: Is there sufficient strategic and creative detail for campaign planning?
4. Risk Coverage: Are potential campaign risks adequately identified and addressed?
5. Campaign Readiness: Can a creative team start working immediately with this brief?

RESPONSE FORMAT:
You MUST respond with ONLY valid JSON in this exact structure:
{
  "completenessScore": 85,
  "missingElements": ["Specific missing element", "Another missing element"],
  "improvementSuggestions": ["Specific improvement suggestion", "Another suggestion"],
  "criticalGaps": ["Critical gap that blocks campaign development", "Another critical gap"],
  "recommendedNextSteps": ["Actionable next step", "Another next step"]
}`;

const ENHANCEMENT_PROMPT = `You are an expert Marketing Strategist and Creative Director specializing in Marketing Brief enhancement. Your task is to take an existing Marketing Brief and DRAMATICALLY IMPROVE IT by implementing all the analysis suggestions directly into the content.

COMPREHENSIVE ENHANCEMENT MANDATE:
1. PRESERVE all good existing content from the original Marketing Brief
2. IMPLEMENT every improvement suggestion directly into the relevant brief sections
3. FILL ALL GAPS with specific, actionable marketing content based on the project context
4. EXPAND every weak section with detailed, campaign-ready information
5. GENERATE concrete channel strategies, key messages, and tactical recommendations that creative teams can immediately implement
6. CREATE comprehensive content that eliminates the need for further clarification

CONTENT IMPLEMENTATION REQUIREMENTS:
• Transform vague statements into specific, measurable objectives and strategies
• Replace generic content with campaign-specific details based on the transcription or strategic notes
• Add missing channel strategies, messaging frameworks, and creative considerations
• Create specific key messages with clear calls to action
• Provide concrete performance metrics, KPIs, and success criteria
• Add realistic timelines with clear campaign phases and deliverables
• Include detailed implementation guidance and creative specifications

INTELLIGENT CONTENT GENERATION:
• Analyze the original transcription or notes to understand the actual campaign needs
• Generate content that is contextually relevant to the specific brand and campaign
• Create realistic channel and creative solutions based on modern best practices
• Provide specific examples, taglines, and messaging pillars where relevant
• Add comprehensive risk assessment, budget considerations, and approval processes

CRITICAL SUCCESS FACTORS:
• Every section should be significantly more detailed and actionable than the original
• Generate REAL marketing content, never use placeholders like "TBD" or "Define later"
• Ensure the enhanced brief could be handed to a creative team for immediate campaign execution
• Base all enhancements on the actual project context from the transcription or notes
• Make the brief at least 2-3x more comprehensive while maintaining clarity

OUTPUT: Return ONLY a valid JSON object with the dramatically enhanced Marketing Brief.`;

export function useChatWithAI(initialBrief: any, transcription?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [improvedBrief, setImprovedBrief] = useState<any | null>(null);
  const [iaSuggestions, setIaSuggestions] = useState<string | null>(null);

  useEffect(() => {
    if (!initialBrief) return;
    setMessages([
      {
        role: 'assistant',
        content:
          'He analizado tu brief. Para mejorarlo y que sea lo más completo y profesional posible, por favor responde a las preguntas que te haré. ¿Listo?'
      }
    ]);
    setImprovedBrief(null);
    setIaSuggestions(null);
  }, [initialBrief]);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    const newMessages = [...messages, { role: 'user' as const, content: userInput }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);
    try {
      const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
      // 1. Análisis del brief actual
      const analysisRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: ANALYSIS_PROMPT },
            { role: 'user', content: JSON.stringify(initialBrief) },
            ...newMessages.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.2,
          max_tokens: 1200,
        }),
      });
      const analysisData = await analysisRes.json();
      const analysis = analysisData.choices?.[0]?.message?.content;
      let analysisObj = null;
      try {
        analysisObj = JSON.parse(analysis);
      } catch {
        // Si no es JSON válido, continuar
      }
      // 2. Mejora del brief usando las sugerencias del análisis
      const enhancementRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: ENHANCEMENT_PROMPT },
            { role: 'user', content: `ORIGINAL MARKETING BRIEF:\n${JSON.stringify(initialBrief, null, 2)}\n\nANALYSIS RESULTS:\n${analysis}\n\nORIGINAL TRANSCRIPTION OR STRATEGIC NOTES (project context):\n${transcription || ''}` },
          ],
          temperature: 0.2,
          max_tokens: 1800,
        }),
      });
      const enhancementData = await enhancementRes.json();
      const aiContent = enhancementData.choices?.[0]?.message?.content || '';
      let parsed = null;
      let extraSuggestions = '';
      try {
        parsed = JSON.parse(aiContent);
      } catch {
        parsed = null;
        extraSuggestions = aiContent;
      }
      // Validación: solo aceptar si el brief mejorado es igual o mejor y todos los campos indispensables están completos
      let mergedBrief = parsed && typeof parsed === 'object' ? mergeBriefs(initialBrief, parsed) : initialBrief;
      // Si los requerimientos del mejorado están vacíos pero los del original no, conserva los del original
      if (isFieldPoor(mergedBrief.requirements) && !isFieldPoor(initialBrief.requirements)) {
        mergedBrief.requirements = initialBrief.requirements;
      }
      let needsReprompt = false;
      for (const field of INDISPENSABLE_FIELDS) {
        if (isFieldPoor(mergedBrief[field])) {
          needsReprompt = true;
          break;
        }
      }
      if (needsReprompt) {
        setMessages([...newMessages, { role: 'assistant' as const, content: 'Algunos campos siguen vacíos o poco profesionales. Por favor, proporciona más detalles o responde a las preguntas para completar el brief.' }]);
        setIaSuggestions(extraSuggestions || null);
        setLoading(false);
        return;
      }
      setImprovedBrief(mergedBrief);
      setIaSuggestions(extraSuggestions || null);
      setMessages([...newMessages, { role: 'assistant' as const, content: '¡Listo! He generado un brief mejorado y completo. Presiona "Generar" para actualizarlo.' }]);
    } catch (err: any) {
      setMessages([...messages, { role: 'assistant' as const, content: 'Ocurrió un error al comunicar con la IA.' }]);
    } finally {
      setLoading(false);
    }
  };

  return {
    messages,
    userInput,
    setUserInput,
    sendMessage,
    loading,
    improvedBrief,
    iaSuggestions,
  };
}