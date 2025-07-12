// Learning Paths Interface and Data
// This file contains all learning path definitions for the Learn section

export interface LearningPathSection {
  title: string;
  content: string;
}

export interface LearningPathContent {
  intro: string;
  sections: LearningPathSection[];
}

export interface LearningPath {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: string;
  duration: string;
  modules: string[];
  content: LearningPathContent;
}

export const learningPaths: LearningPath[] = [
  {
    id: 'brief-surgeon',
    title: 'BRIEF SURGEON',
    subtitle: 'ANATOMÍA DEL BRIEF PERFECTO',
    description: 'Disecciona briefs como un cirujano. Aprende qué órganos vitales debe tener un brief para sobrevivir en el mundo real.',
    level: 'PRINCIPIANTE',
    duration: 'LECTURA DIRECTA',
    modules: [
      'Radiografía del Brief Mortal',
      'Cirugía de Objetivos Difusos', 
      'Transplante de Insights Reales',
      'Sutura de Mensajes Coherentes'
    ],
    content: {
      intro: 'Un brief mortal es aquel que mata campañas antes de nacer. Como cirujano, debes identificar las enfermedades que lo infectan.',
      sections: [
        {
          title: 'RADIOGRAFÍA DEL BRIEF MORTAL',
          content: `**LOS 7 SÍNTOMAS DE UN BRIEF TÓXICO:**

• **OBJETIVITIS AGUDA**: "Queremos aumentar ventas y awareness y engagement"
• **AUDIENCIAPATÍA**: "Hombres y mujeres de 18 a 65 años"
• **INSIGHTOSIS**: "A la gente le gusta ahorrar dinero"
• **TONALIDAD MÚLTIPLE**: "Serio pero divertido, premium pero accesible"
• **PRESUPUESTOFOBIA**: "El presupuesto lo vemos después"
• **PLAZOANEMIA**: "Lo necesitamos para ayer"
• **COMPETENCIACEGUERA**: "No tenemos competencia directa"

**DIAGNÓSTICO RÁPIDO:**
Si tu brief tiene 3+ síntomas = ESTADO CRÍTICO
Si tiene 5+ síntomas = MUERTE CEREBRAL`
        },
        {
          title: 'CIRUGÍA DE OBJETIVOS DIFUSOS',
          content: `**TÉCNICA LÁSER PARA OBJETIVOS AFILADOS:**

**ANTES:** "Aumentar ventas y posicionamiento"
**DESPUÉS:** "Incrementar 15% las ventas Q4 en millennials urbanos mediante reposicionamiento como marca lifestyle"

**EL FRAMEWORK S.C.A.L.P.E.L:**
• **S**pecific - Un solo objetivo primario
• **C**uantificable - Métricas específicas
• **A**lcanzable - Dentro de capacidades reales
• **L**imitado en tiempo - Deadline claro
• **P**rioritario - Qué importa más
• **E**xplícito - Sin interpretaciones
• **L**ink to business - Conectado al negocio

**HERRAMIENTAS DE PRECISIÓN:**
1. One-sentence objective test
2. 5 whys de profundidad
3. Trade-off matrix
4. Success metrics hierarchy`
        },
        {
          title: 'TRANSPLANTE DE INSIGHTS REALES',
          content: `**ANATOMÍA DE UN INSIGHT VERDADERO:**

Un insight no es una observación obvia. Es una verdad humana profunda que conecta con emociones reales y comportamientos específicos.

**INSIGHT FALSO:** "A la gente le gusta ahorrar dinero"
**INSIGHT VERDADERO:** "Los padres millennials compran orgánico no por salud, sino para demostrar que no están dañando a sus hijos como creen que hicieron sus padres con ellos"

**EL PROCESO S.U.R.G.E.R.Y:**
• **S**entir - Conexión emocional genuina
• **U**niversal - Verdad reconocible
• **R**elevante - Para tu audiencia específica
• **G**enerador - De ideas creativas
• **E**jecutable - Traducible a campaña
• **R**eal - Basado en evidencia real
• **Y**ield - Genera resultados de negocio

**FUENTES DE INSIGHTS REALES:**
- Entrevistas en profundidad
- Social listening inteligente
- Etnografía digital
- Análisis de quejas/reviews
- Observación conductual`
        },
        {
          title: 'SUTURA DE MENSAJES COHERENTES',
          content: `**ARQUITECTURA DEL MENSAJE PERFECTO:**

Un mensaje coherente conecta insight, propuesta y acción en una narrativa fluida y memorable.

**ESTRUCTURA SCALPEL:**
1. **Setup** - Situación reconocible
2. **Conflict** - Tensión emocional
3. **Answer** - Tu solución
4. **Logic** - Por qué funciona
5. **Proof** - Evidencia convincente
6. **Emotion** - Conexión profunda
7. **Launch** - Call to action claro

**EJEMPLO PERFECTO:**
Setup: "Cada padre quiere lo mejor para sus hijos"
Conflict: "Pero no sabe si sus decisiones son correctas"
Answer: "Marca X te ayuda a elegir con confianza"
Logic: "Porque está respaldada por pediatras"
Proof: "9 de 10 pediatras la recomiendan"
Emotion: "Para que duermas tranquilo"
Launch: "Elige Marca X. Elige con confianza"

**HERRAMIENTAS:**
- Coherence audit checklist
- Message flow mapping
- Emotional journey validation`
        }
      ]
    }
  },
  {
    id: 'creative-hacker',
    title: 'CREATIVE HACKER',
    subtitle: 'INFILTRACIÓN PUBLICITARIA AVANZADA',
    description: 'Hackea mentes como un creative director renegado. Técnicas psicológicas y neurocientíficas que las agencias top no quieren que conozcas.',
    level: 'INTERMEDIO',
    duration: 'LECTURA DIRECTA',
    modules: [
      'Hacking Psicológico Aplicado',
      'Psicología Inversa en Campañas',
      'Neurolingüística Publicitaria',
      'Ingeniería de Dopamina'
    ],
    content: {
      intro: 'El creative hacking no es manipulación. Es comprensión profunda de cómo funciona realmente el cerebro humano para crear comunicación que genuinamente conecte.',
      sections: [
        {
          title: 'HACKING PSICOLÓGICO APLICADO',
          content: `**LOS 7 TRIGGERS PSICOLÓGICOS FUNDAMENTALES:**

**1. RECIPROCIDAD**
- La gente se siente obligada a devolver favores
- Aplicación: Contenido gratuito de valor
- Ejemplo: "Descarga gratis" antes de vender

**2. COMPROMISO Y CONSISTENCIA**
- Necesidad de actuar consistente con decisiones previas
- Aplicación: Micro-compromisos escalables
- Ejemplo: "¿Estás de acuerdo que...?" → compra

**3. VALIDACIÓN SOCIAL**
- Seguimos a otros en situaciones de incertidumbre
- Aplicación: Testimonios específicos y detallados
- Ejemplo: "María de Guadalajara dice..."

**4. AUTORIDAD**
- Obedecemos a figuras percibidas como expertas
- Aplicación: Endorsements de especialistas
- Ejemplo: "Recomendado por dermatólogos"

**5. SIMPATÍA**
- Compramos de gente que nos gusta
- Aplicación: Humanización de marca
- Ejemplo: Historia personal del fundador

**6. ESCASEZ**
- Valoramos más lo que creemos limitado
- Aplicación: Stock limitado real
- Ejemplo: "Solo quedan 3 unidades"

**7. UNITY**
- Confiamos en quienes percibimos como "nuestro grupo"
- Aplicación: Identidad tribal compartida
- Ejemplo: "Para padres que entienden"`
        },
        {
          title: 'PSICOLOGÍA INVERSA EN CAMPAÑAS',
          content: `**EL PODER DE LA PSICOLOGÍA INVERSA:**

La psicología inversa funciona porque:
- Reactancia psicológica natural
- Genera curiosidad genuina
- Reduce defensas mentales
- Presenta fortalezas como "problemas"
- Credibilidad indirecta

**FRAMEWORK DE APLICACIÓN:**
1. Identifica expectativa convencional
2. Define el opuesto lógico
3. Encuentra verdad en la inversión
4. Construye narrativa creíble
5. Ejecuta con autenticidad

**CASOS PRÁCTICOS:**
- Patagonia: "Don't buy this jacket"
- Volkswagen: "Think Small"
- Avis: "We're number 2"

**HERRAMIENTA:**
Crea un "Anti-Brief" de tu competencia`
        },
        {
          title: 'NEUROLINGÜÍSTICA PUBLICITARIA',
          content: `**PROGRAMACIÓN NEUROLINGUÍSTICA APLICADA:**

**PATRÓN 1: EMBEDDED COMMANDS**
- Comandos ocultos en conversación normal
- "Cuando COMPRES este producto..."
- "No puedes evitar SENTIRTE atraído..."
- Verbos de acción en presente

**PATRÓN 2: PRESUPPOSITIONS**
- Asume comportamientos como dados
- "Después de que lo uses por primera vez..."
- "Cuando veas los resultados..."
- Bypass al pensamiento crítico

**PATRÓN 3: SENSORY PREDICATES**
- Apela a sistemas sensoriales específicos
- Visual: "Imagina verte usando..."
- Auditivo: "Escucha lo que dicen..."
- Kinestésico: "Siente la diferencia..."

**PATRÓN 4: ANCHORING EMOCIONAL**
- Asocia emociones con palabras/imágenes
- Estado positivo + mensaje = conexión
- Repite para reforzar asociación

**PATRÓN 5: REFRAMING**
- Cambia el marco de referencia
- "No es gasto, es inversión"
- "No es trabajo, es pasión"
- Nueva perspectiva = nueva decisión

**APLICACIÓN PRÁCTICA:**
Cada copy debe incluir mínimo 3 patrones PNL`
        },
        {
          title: 'INGENIERÍA DE DOPAMINA',
          content: `**DISEÑANDO EXPERIENCIAS ADICTIVAS (ÉTICAS):**

La dopamina no se libera con la recompensa, sino con la anticipación de la recompensa.

**LOOP DE DOPAMINA PERFECTO:**
1. **Trigger** - Elemento que inicia comportamiento
2. **Action** - Comportamiento simple y claro
3. **Variable Reward** - Recompensa impredecible
4. **Investment** - Usuario invierte algo

**APLICACIÓN EN CAMPAÑAS:**
- Trigger: Notificación/urgencia
- Action: Click/compra simple
- Reward: Beneficio inesperado
- Investment: Personalización/datos

**TÉCNICAS ESPECÍFICAS:**
- Random ratio rewards
- Progress bars visuales
- Social validation delayed
- Surprise and delight moments
- Building anticipation campaigns

**EJEMPLO:**
Email: "Algo especial te espera" (trigger)
→ Click fácil (action)
→ Descuento sorpresa (variable reward)
→ Customiza tu pedido (investment)

**HERRAMIENTA:**
Dopamine Loop Audit for Campaigns`
        }
      ]
    }
  },
  {
    id: 'data-samurai',
    title: 'DATA SAMURAI',
    subtitle: 'MAESTRÍA EN INSIGHTS Y MÉTRICAS',
    description: 'Corta a través del ruido de datos como un samurai. Convierte números muertos en insights que guían estrategias ganadoras.',
    level: 'AVANZADO',
    duration: 'LECTURA DIRECTA',
    modules: [
      'Anatomía del Data Storytelling',
      'Predictive Modeling para Campañas',
      'Attribution Modeling Avanzado',
      'Real-Time Campaign Surgery'
    ],
    content: {
      intro: 'Los datos sin contexto son ruido. Un Data Samurai convierte ruido en sinfonías que guían decisiones multimillonarias.',
      sections: [
        {
          title: 'ANATOMÍA DEL DATA STORYTELLING',
          content: `**LA NARRATIVA QUE LOS DATOS ESCONDEN:**

Los datos nunca mienten, pero pueden contar historias muy diferentes según cómo los presentes.

**FRAMEWORK S.A.M.U.R.A.I:**
• **S**ituation - Contexto del negocio
• **A**ction - Qué se hizo
• **M**etrics - Qué se midió
• **U**nderstanding - Qué significa
• **R**ecommendation - Qué hacer
• **A**ction plan - Cómo ejecutar
• **I**mpact - Qué esperar

**TÉCNICAS DE VISUALIZACIÓN:**
1. **Hierarchy Visual** - Lo más importante arriba
2. **Color Psychology** - Verde = bueno, rojo = problema
3. **Progressive Disclosure** - Capas de profundidad
4. **Comparative Context** - Siempre vs algo
5. **Trend Arrows** - Dirección clara

**TIPOS DE HISTORIAS CON DATOS:**
- **Rise & Fall**: Drama de métricas
- **David vs Goliath**: Competencia
- **Phoenix**: Recuperación de crisis
- **Discovery**: Insight inesperado
- **Prediction**: Futuro probable

**HERRAMIENTAS:**
- Data story canvas
- Insight extraction framework
- Executive summary templates`
        },
        {
          title: 'PREDICTIVE MODELING PARA CAMPAÑAS',
          content: `**PREDICIENDO EL FUTURO CON DATOS DEL PASADO:**

**MODELOS BÁSICOS PARA MARKETERS:**

**1. CUSTOMER LIFETIME VALUE (CLV)**
- Predice valor total de cada cliente
- Formula: (Valor promedio orden × Frecuencia compra × Margin) × Tiempo vida
- Aplicación: Budget allocation por segmento

**2. CHURN PREDICTION**
- Identifica clientes en riesgo de abandono
- Señales: Disminución engagement, tiempo desde última compra
- Aplicación: Campañas de retención targeted

**3. PROPENSITY SCORING**
- Probabilidad de conversión por individuo
- Variables: Demográficas + comportamentales + contextuales
- Aplicación: Personalización de mensajes

**4. MARKET MIX MODELING**
- Impacto de cada canal en ventas
- Considera: Seasonality, competition, economy
- Aplicación: Optimización de budget allocation

**5. ATTRIBUTION MODELING**
- Valor de cada touchpoint en customer journey
- Modelos: First-touch, last-touch, linear, time-decay
- Aplicación: ROI real por canal

**IMPLEMENTACIÓN PRÁCTICA:**
1. Define business question específica
2. Identifica data sources necesarias
3. Limpia y prepara datos
4. Elige modelo apropiado
5. Valida con data histórica
6. Implementa en campaigns
7. Monitorea y ajusta

**HERRAMIENTAS RECOMENDADAS:**
- Google Analytics 4 (free)
- Facebook Analytics (free)
- Klaviyo (email predictive)
- Segment (data unification)
- Looker/Tableau (visualization)`
        },
        {
          title: 'ATTRIBUTION MODELING AVANZADO',
          content: `**MÁS ALLÁ DEL LAST-CLICK:**

El 95% de marketers usa last-click attribution. El 5% que entiende multi-touch attribution domina el mercado.

**MODELOS DE ATTRIBUTION:**

**1. FIRST-TOUCH**
- 100% crédito al primer touchpoint
- Útil para: Upper funnel awareness
- Problema: Ignora nurturing process

**2. LAST-TOUCH**
- 100% crédito al último touchpoint
- Útil para: Conversión inmediata
- Problema: Ignora customer journey

**3. LINEAR**
- Crédito igual distribuido entre touchpoints
- Útil para: Overview balanceado
- Problema: No refleja impacto real

**4. TIME-DECAY**
- Más crédito a touchpoints recientes
- Útil para: Ciclos de compra cortos
- Aplicación: E-commerce, subscripciones

**5. U-SHAPED (POSITION-BASED)**
- 40% first-touch, 40% last-touch, 20% middle
- Útil para: Awareness + conversion focus
- Aplicación: Productos de consideración larga

**6. W-SHAPED**
- Crédito extra en: first, lead, conversion
- Útil para: B2B complex sales
- Aplicación: Software enterprise, real estate

**7. ALGORITMIC (DATA-DRIVEN)**
- Machine learning asigna crédito
- Útil para: Máxima precisión
- Requisito: Suficiente volumen de data

**IMPLEMENTACIÓN:**
1. Mapea customer journey completo
2. Identifica todos los touchpoints
3. Define conversion goals claramente
4. Selecciona modelo según business
5. Configura tracking apropiado
6. Analiza patterns y optimiza
7. Comunica insights a stakeholders

**HERRAMIENTAS:**
- Google Analytics 4 Attribution
- Facebook Attribution Tool
- Adobe Analytics
- Custom SQL queries
- UTM parameter strategy`
        },
        {
          title: 'REAL-TIME CAMPAIGN SURGERY',
          content: `**OPTIMIZACIÓN EN TIEMPO REAL:**

**DASHBOARD DE GUERRA - MÉTRICAS CRÍTICAS:**

**UPPER FUNNEL:**
- Impressions quality score
- Click-through rate trends
- Cost per thousand (CPM)
- Audience overlap analysis

**MID FUNNEL:**
- Time on site progression
- Page depth averages
- Bounce rate by source
- Micro-conversion rates

**LOWER FUNNEL:**
- Conversion rate optimization
- Cart abandonment recovery
- Average order value trends
- Customer acquisition cost

**ALGORITMO DE DECISIÓN RÁPIDA:**

**SI CTR < 2%:**
→ Test new creative immediately
→ Refine audience targeting
→ Check ad fatigue metrics

**SI CPA > Target:**
→ Pause worst performing ads
→ Increase budget on winners
→ Test lower funnel optimization

**SI Conversion Rate < 3%:**
→ Landing page emergency audit
→ Check loading speed
→ Review value proposition match

**HERRAMIENTAS DE MONITOREO:**
- Google Analytics Real-Time
- Facebook Ads Manager live
- Custom Slack alerts
- Automated email reports
- Mobile dashboard apps

**PROCESO DE OPTIMIZACIÓN:**
1. **Monitor** (every 2 hours first 48h)
2. **Analyze** (look for patterns)
3. **Hypothesize** (why is this happening?)
4. **Test** (implement change)
5. **Measure** (give it time)
6. **Scale** (double down on winners)

**EMERGENCY PROTOCOLS:**
□ Creative fatigue detection system
□ Budget reallocation triggers
□ Audience expansion rules
□ Landing page backup versions
□ Crisis communication plan
□ Budget reallocation plan listo`
        }
      ]
    }
  },
  {
    id: 'insight-hunter',
    title: 'INSIGHT HUNTER',
    subtitle: 'CAZADOR DE VERDADES OCULTAS',
    description: 'Caza insights como un detective privado. Descubre verdades humanas que otros pasan por alto y conviértelas en campañas memorables.',
    level: 'INTERMEDIO',
    duration: 'LECTURA DIRECTA',
    modules: [
      'Arqueología del Comportamiento',
      'Neuromarketing Sin Bullshit',
      'Behavioral Economics Hacks',
      'Cultural Intelligence Mining'
    ],
    content: {
      intro: 'Un insight verdadero es como oro: valioso, raro y transformador. Los Insight Hunters saben dónde buscar y cómo refinarlo.',
      sections: [
        {
          title: 'ARQUEOLOGÍA DEL COMPORTAMIENTO',
          content: `**EXCAVANDO VERDADES ENTERRADAS:**

Los mejores insights están enterrados bajo capas de comportamiento aparentemente irracional.

**HERRAMIENTAS DEL ARQUEÓLOGO:**

**1. OBSERVACIÓN ETNOGRÁFICA**
- Ve lo que la gente hace (no lo que dice)
- Contexto natural de uso
- Rituales y rutinas inconscientes
- Contradicciones behavior vs declaraciones

**2. SOCIAL LISTENING INTELIGENTE**
- No solo menciones de marca
- Conversaciones alrededor del problema
- Lenguaje emocional específico
- Quejas no dirigidas a ti

**3. ANÁLISIS DE MOMENTOS DE VERDAD**
- Unboxing experience real
- First use frustrations
- Abandonment triggers
- Advocacy spontaneous moments

**4. DIGITAL ANTHROPOLOGY**
- Screenshots espontáneos
- Stories no promocionales
- Comments deep analysis
- Private groups infiltration (ética)

**FRAMEWORK DE EXCAVACIÓN:**
1. **Surface** - Lo que dicen que hacen
2. **Behavior** - Lo que realmente hacen
3. **Emotion** - Cómo se sienten al hacerlo
4. **Motivation** - Por qué lo hacen
5. **Barrier** - Qué los detiene
6. **Trigger** - Qué los impulsa
7. **Context** - Cuándo/dónde/con quién

**SEÑALES DE ORO:**
- Contradicciones sistemáticas
- Emociones extremas inexplicadas
- Comportamientos ritualizados
- Soluciones improvisadas (hacks)
- Lenguaje tribal específico`
        },
        {
          title: 'NEUROMARKETING SIN BULLSHIT',
          content: `**CIENCIA REAL, APLICACIÓN PRÁCTICA:**

**PRINCIPIOS NEUROCIENTÍFICOS APLICABLES:**

**1. PRIMACY & RECENCY EFFECT**
- Recordamos mejor el inicio y final
- Aplicación: Estructura de mensaje
- Técnica: Sandwich de información importante

**2. COGNITIVE LOAD THEORY**
- Capacidad limitada de procesamiento
- Aplicación: Simplificación de decisiones
- Técnica: Maximum 3 options rule

**3. LOSS AVERSION (2.5x STRONGER)**
- Perdemos el doble de lo que ganamos
- Aplicación: Fear of missing out
- Técnica: "Evita perder X" vs "Gana Y"

**4. ANCHORING BIAS**
- Primera información marca referencia
- Aplicación: Precio anchoring
- Técnica: Muestra precio alto primero

**5. AVAILABILITY HEURISTIC**
- Juzgamos probabilidad por facilidad de recuerdo
- Aplicación: Stories memorables
- Técnica: Casos específicos vs estadísticas

**6. SOCIAL PROOF SPECIFICITY**
- Validation de grupo similar
- Aplicación: Testimonials targeted
- Técnica: "Personas como tú" messaging

**7. COMMITMENT ESCALATION**
- Micro-commitments llevan a macro-commitment
- Aplicación: Progressive engagement
- Técnica: "Sí" pequeños → "Sí" grande

**HERRAMIENTAS DE MEDICIÓN:**
- Eye tracking heatmaps
- A/B testing neurocientífico
- Facial coding analysis
- EEG para engagement
- Response time measurement

**APLICACIÓN PRÁCTICA:**
Cada elemento de campaña debe basarse en mínimo 2 principios neurocientíficos validados`
        },
        {
          title: 'BEHAVIORAL ECONOMICS HACKS',
          content: `**SESGOS COGNITIVOS PARA MARKETERS:**

**HACK 1: DECOY EFFECT**
- Opción inferior para hacer otra más atractiva
- Aplicación: Pricing de 3 tiers
- Ejemplo: Pequeño $5, Mediano $6.50, Grande $7

**HACK 2: ENDOWMENT EFFECT**
- Valoramos más lo que ya "poseemos"
- Aplicación: Free trials, demos
- Técnica: "Tu carrito", "Tus selecciones"

**HACK 3: PARADOX OF CHOICE**
- Muchas opciones paralizan decisión
- Aplicación: Curated selections
- Técnica: "Elegido para ti" filtering

**HACK 4: RECIPROCITY TRIGGER**
- Obligación de devolver favores
- Aplicación: Value-first content
- Técnica: Dar antes de pedir

**HACK 5: SCARCITY PSYCHOLOGY**
- Escasez real aumenta deseo
- Aplicación: Limited availability
- Técnica: Countdown timers reales

**HACK 6: AUTHORITY BIAS**
- Seguimos a perceived experts
- Aplicación: Expert endorsements
- Técnica: Credentials highlighting

**HACK 7: CONSISTENCY PRINCIPLE**
- Actuamos consistente con compromisos previos
- Aplicación: Public commitments
- Técnica: "Dime tu objetivo" campaigns

**FRAMEWORK DE IMPLEMENTACIÓN:**
1. Identifica decision points críticos
2. Mapea sesgos aplicables
3. Diseña interventions específicas
4. Test impact en behavior
5. Scale winning combinations

**HERRAMIENTAS:**
- Behavioral audit checklist
- Bias application matrix
- A/B testing protocols
- Conversion funnel analysis`
        },
        {
          title: 'CULTURAL INTELLIGENCE MINING',
          content: `**NAVEGANDO CODES CULTURALES:**

**DIMENSIONES CULTURALES CRÍTICAS:**

**1. INDIVIDUALISMO vs COLECTIVISMO**
- Individual: "Sé único", "Tu momento"
- Colectivo: "Únete", "Juntos somos más"
- Aplicación: Message framing

**2. POWER DISTANCE**
- Alto: Respeto a autoridad/jerarquía
- Bajo: Igualdad y accessibility
- Aplicación: Spokesperson selection

**3. UNCERTAINTY AVOIDANCE**
- Alto: Guarantees, security, tradition
- Bajo: Innovation, risk-taking, adventure
- Aplicación: Value proposition focus

**4. LONG-TERM vs SHORT-TERM**
- Largo: Investment, patience, tradition
- Corto: Results now, adaptability
- Aplicación: Campaign timeline messaging

**5. MASCULINITY vs FEMININITY**
- Masculino: Competition, achievement, material
- Femenino: Cooperation, relationships, quality of life
- Aplicación: Success definition in copy

**MINING TECHNIQUES:**

**LOCAL LANGUAGE ANALYSIS:**
- Slang evolution tracking
- Meme culture integration
- Regional humor patterns
- Generational code differences

**CULTURAL MOMENT MAPPING:**
- Holiday behavior analysis
- Social movement alignment
- Economic mood correlation
- Political sentiment impact

**TRIBAL IDENTITY RESEARCH:**
- Subculture values deep-dive
- Identity symbols analysis
- Belonging triggers identification
- Exclusion fears mapping

**APLICACIÓN PRÁCTICA:**
Cada mercado requiere cultural adaptation specific, no simple translation.

**HERRAMIENTAS:**
- Cultural dimensions assessment
- Local focus groups
- Social sentiment analysis
- Cultural moment calendar
- Regional performance comparison`
        }
      ]
    }
  }
];