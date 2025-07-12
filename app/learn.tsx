import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import BrutalistNavHeader from '../components/BrutalistNavHeader';

export default function LearnScreen() {
  const router = useRouter();
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const learningPaths = [
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
• **S**pecífico: Un solo objetivo primario
• **C**uantificable: Número concreto
• **A**lcanzable: Realista con recursos
• **L**imitado: Timeframe claro
• **P**ersonalizado: Audiencia específica
• **E**strategico: Alineado con negocio
• **L**ogeable: Medible post-campaña

**HERRAMIENTA PRÁCTICA:**
"Lograr [MÉTRICA] de [CANTIDAD] en [AUDIENCIA] durante [TIEMPO] mediante [ESTRATEGIA]"`
          }
        ]
      }
    },
    {
      id: 'insight-hunter',
      title: 'INSIGHT HUNTER',
      subtitle: 'CAZADOR DE VERDADES OCULTAS',
      description: 'Conviértete en un detective de comportamientos humanos. Usa técnicas forenses para encontrar insights que otros pasan por alto.',
      level: 'INTERMEDIO',
      duration: 'LECTURA DIRECTA',
      modules: [
        'Método Sherlock Holmes para Insights',
        'Antropología Digital Aplicada',
        'Neuromarketing Sin Bullshit',
        'Behavioral Economics Hacks'
      ],
      content: {
        intro: 'Los insights reales están ocultos en comportamientos, no en focus groups. Como detective, debes seguir las pistas correctas.',
        sections: [
          {
            title: 'MÉTODO SHERLOCK HOLMES PARA INSIGHTS',
            content: `**LAS 4 LUPAS DEL DETECTIVE:**

**LUPA 1: OBSERVACIÓN SIN JUICIO**
- ¿Qué hace la gente VS qué dice que hace?
- Estudia comportamientos en redes, reviews, comments
- Busca contradicciones entre palabra y acción

**LUPA 2: EL PRINCIPIO DEL PERRO QUE NO LADRÓ**
- ¿Qué NO hace tu audiencia?
- ¿Qué evita? ¿Qué rechaza?
- Los anti-comportamientos revelan más que los comportamientos

**LUPA 3: CONECTAR PUNTOS DISPERSOS**
- Relaciona datos aparentemente inconexos
- Busca patrones en múltiples fuentes
- Un insight es la intersección de 3+ observaciones

**LUPA 4: LA DEDUCCIÓN EMOCIONAL**
- ¿Qué emoción impulsa el comportamiento?
- ¿Cuál es el miedo real detrás de la decisión?
- ¿Qué necesidad emocional satisface?

**FRAMEWORK DETECTIVE:**
"Nuestra audiencia [COMPORTAMIENTO OBSERVABLE] porque en realidad [NECESIDAD EMOCIONAL OCULTA]"`
          },
          {
            title: 'ANTROPOLOGÍA DIGITAL APLICADA',
            content: `**EXCAVACIÓN EN 6 CAPAS:**

**CAPA 1: SUPERFICIE SOCIAL**
- Posts públicos, Stories, contenido compartido
- Insight nivel: BÁSICO

**CAPA 2: INTERACCIONES TRIBALES**
- Comments, reacciones, replies
- Qué conversations inicia vs participa
- Insight nivel: INTERMEDIO

**CAPA 3: RITUALES DIGITALES**
- Horarios de actividad, frecuencias
- Patterns de consumo de contenido
- Insight nivel: AVANZADO

**CAPA 4: LENGUAJE TRIBAL**
- Jergas, emojis, referencias
- Cómo modifican el lenguaje según contexto
- Insight nivel: EXPERTO

**CAPA 5: VALORES IMPLÍCITOS**
- Qué comparte vs qué consume
- Causas que apoya vs ignora
- Insight nivel: MAESTRO

**CAPA 6: CONTRADICCIONES PROFUNDAS**
- Gaps entre identidad online vs offline
- Comportamientos que no encajan
- Insight nivel: GURÚ

**HERRAMIENTA:** 
Crea un "Mapa de Contradicciones" de tu audiencia`
          },
          {
            title: 'NEUROMARKETING SIN BULLSHIT',
            content: `**PRINCIPIOS CIENTÍFICOS APLICABLES:**

**PRINCIPIO 1: SISTEMA 1 VS SISTEMA 2**
- Sistema 1: Rápido, automático, emocional
- Sistema 2: Lento, deliberativo, lógico
- 95% de decisiones = Sistema 1
- Brief debe activar Sistema 1 primero

**PRINCIPIO 2: COGNITIVE LOAD THEORY**
- Cerebro tiene capacidad limitada
- Más opciones = menos decisiones
- Simplifica hasta lo esencial
- "Rule of 3" en presentaciones

**PRINCIPIO 3: LOSS AVERSION NEUROLÓGICA**
- Pérdida duele 2.5x más que ganancia
- Activa amígdala (miedo/supervivencia)
- "Sin esto, perderás..." > "Con esto, ganarás..."
- Usa FOMO científicamente

**PRINCIPIO 4: SOCIAL BRAIN ACTIVATION**
- Cerebro social = 40% de actividad
- Testimoniales activan mirror neurons
- "Personas como tú" = identificación
- Tribu > individuo en decisiones

**PRINCIPIO 5: DOPAMINE PREDICTION ERROR**
- Sorpresa positiva = más dopamina
- Promete X, entrega X+20%
- Micro-recompensas durante proceso
- Timing impredecible = más adicción

**APLICACIONES INMEDIATAS:**

**EN COPY:**
- Headline emocional + subhead lógico
- Máximo 7 elementos por sección
- Pérdidas antes que ganancias
- Social proof específico

**EN DISEÑO:**
- Contraste = atención involuntaria
- Movimiento sutil = seguimiento ocular
- Faces = conexión automática
- Rojo/naranja = urgencia neurológica

**EN ESTRUCTURA:**
- Gancho emocional (10 segundos)
- Lógica de soporte (credibilidad)
- Acción simple y clara
- Refuerzo social final

**HERRAMIENTAS DE MEDICIÓN:**
- Heatmaps (atención visual)
- A/B testing (respuesta comportamental)
- Time on page (engagement cognitivo)
- Conversion rate (decisión final)`
          },
          {
            title: 'BEHAVIORAL ECONOMICS HACKS',
            content: `**SESGOS COGNITIVOS APLICADOS AL MARKETING:**

**SESGO 1: ANCHORING BIAS**
- Primer número influye todas las comparaciones
- Precio "tachado" vs precio real
- "Ahorra $500" vs "Descuento 20%"
- Establece ancla alta, ofrece "descuento"

**SESGO 2: AVAILABILITY HEURISTIC**
- Lo fácil de recordar = más probable
- Casos específicos > estadísticas generales
- "María aumentó ventas 47%" > "Clientes mejoran performance"
- Historias memorables = decisiones sesgadas

**SESGO 3: COMMITMENT CONSISTENCY**
- Comportamiento consistente con compromisos previos
- "¿Estás de acuerdo que...?" → "Entonces deberías..."
- Micro-compromisos llevan a macro-acciones
- Escritura > pensamiento en compromiso

**SESGO 4: SCARCITY + URGENCY**
- Escasez percibida = valor aumentado
- "Solo quedan 3" > "Disponible"
- Tiempo limitado = decisión acelerada
- FOMO = activación del sistema límbico

**SESGO 5: SOCIAL PROOF CASCADE**
- Comportamiento de otros = guía de acción
- "9 de 10 dentistas" = autoridad prestada
- "Trending ahora" = validación social
- Efecto bandwagon amplifica decisiones

**FRAMEWORK DE APLICACIÓN:**

**AUDIT DE BRIEF:**
1. ¿Qué ancla estableces?
2. ¿Tienes casos específicos memorables?
3. ¿Pides micro-compromisos?
4. ¿Creas escasez real o percibida?
5. ¿Muestras comportamiento de pares?

**TÉCNICAS AVANZADAS:**

**DECOY EFFECT:**
- 3 opciones: básica, premium, señuelo
- Señuelo hace ver premium como "ganga"
- Guía decisión hacia opción deseada

**ENDOWMENT EFFECT:**
- "Tu nuevo [producto]" vs "Este producto"
- Ownership mental antes de compra
- Trials gratuitos = propiedad psicológica

**LOSS FRAMING:**
- "No pierdas esta oportunidad"
- "Sin esto, seguirás..."
- "Recupera lo que has perdido"

**HERRAMIENTAS DE IMPLEMENTACIÓN:**
- Copy templates con sesgos integrados
- Pricing strategy con anchoring
- Email sequences con commitment escalation
- Landing pages con social proof dinámico

**MEDICIÓN DE EFECTIVIDAD:**
- Conversion rate por sesgo aplicado
- Time to decision (urgency)
- Cart abandonment (commitment)
- Repeat purchase (consistency)`
          }
        ]
      }
    },
    {
      id: 'creative-hacker',
      title: 'CREATIVE HACKER',
      subtitle: 'INFILTRACIÓN CREATIVA',
      description: 'Hackea la mente del consumidor con técnicas de persuasión no convencionales. Guerra psicológica aplicada al marketing.',
      level: 'AVANZADO',
      duration: 'LECTURA DIRECTA',
      modules: [
        'Ingeniería Social para Marcas',
        'Técnicas de Influencia de la CIA',
        'Psicología Inversa en Campañas',
        'Neurolingüística Publicitaria'
      ],
      content: {
        intro: 'La persuasión real opera en el subconsciente. Usa técnicas probadas por psicólogos, espías y manipuladores profesionales.',
        sections: [
          {
            title: 'INGENIERÍA SOCIAL PARA MARCAS',
            content: `**LOS 6 PRINCIPIOS DEL HACKER SOCIAL:**

**PRINCIPIO 1: RECIPROCIDAD ASIMÉTRICA**
- Da algo valioso ANTES de pedir
- Crea deuda psicológica inconsciente
- El valor percibido > valor real

**PRINCIPIO 2: AUTORIDAD PRESTADA**
- Usa credibilidad de terceros
- "Como dice [EXPERTO/INFLUENCER]..."
- Transferencia de confianza instantánea

**PRINCIPIO 3: ESCASEZ FABRICADA**
- No finjas escasez, crea escasez real
- Limita acceso por criterio de calidad
- "Solo para personas que [CRITERIO]"

**PRINCIPIO 4: CONSENSO SOCIAL FABRICADO**
- "9 de 10 personas como tú..."
- Usa datos reales pero presentados estratégicamente
- Crear sensación de quedarse atrás

**PRINCIPIO 5: COHERENCIA COMPROMETIDA**
- Haz que se comprometan públicamente
- "Si estás de acuerdo, comparte esto"
- Escalada de compromisos pequeños

**PRINCIPIO 6: SIMPATÍA CALCULADA**
- Encuentra puntos en común reales
- "Nosotros también [PROBLEMA COMPARTIDO]"
- Alineación de valores, no productos

**FRAMEWORK HACKER:**
"Porque [AUTORIDAD] dice que [CONSENSO] hace [ACCIÓN], y solo [ESCASEZ] pueden [BENEFICIO]"`
          },
          {
            title: 'TÉCNICAS DE INFLUENCIA DE LA CIA',
            content: `**OPERACIONES PSICOLÓGICAS ADAPTADAS:**

**TÉCNICA 1: CONDITIONING PROGRESIVO**
- Secuencia de micro-compromisos
- Cada "sí" facilita el siguiente
- Ejemplo: Newsletter → Webinar → Producto

**TÉCNICA 2: COGNITIVE ANCHORING**
- Planta el primer número/idea
- Todo lo demás se compara con eso
- Controla el punto de referencia

**TÉCNICA 3: FALSE DILEMMA CHOICE**
- Ofrece 2 opciones, ambas te benefician
- "¿Prefieres el plan básico o premium?"
- Eliminas la opción de NO comprar

**TÉCNICA 4: SOCIAL PROOF SEEDING**
- Planta testimonios estratégicos
- Usa casos específicos y verificables
- "María de México aumentó ventas 47%"

**TÉCNICA 5: AUTHORITY HIJACKING**
- Asocia tu mensaje con autoridades
- Sin mentir, pero con presentación estratégica
- "Los mismos principios que usa Google"

**TÉCNICA 6: LOSS AVERSION TRIGGER**
- Enfoca en lo que perderán, no ganarán
- "Sin esto, seguirás [DOLOR ACTUAL]"
- El miedo a perder > deseo de ganar

**CHECKLIST OPERACIONAL:**
□ Ancla establecida
□ Compromiso progresivo activado  
□ Autoridad asociada
□ Escasez/urgencia implantada
□ Prueba social visible
□ Aversión a pérdida activada`
          },
          {
            title: 'PSICOLOGÍA INVERSA EN CAMPAÑAS',
            content: `**TÉCNICAS DE PERSUASIÓN CONTRAINTUITIVA:**

**TÉCNICA 1: REVERSE PSYCHOLOGY SEEDING**
- "Este producto NO es para todo el mundo"
- Crea exclusividad mediante restricción
- Activa el deseo por lo "prohibido"

**TÉCNICA 2: ANTI-ADVERTISING**
- "Honestamente, nuestro producto es caro"
- La honestidad brutal genera confianza
- Diferenciación por transparencia

**TÉCNICA 3: NEGATIVE SPACE BRANDING**
- Define lo que NO eres
- "No somos como las otras agencias"
- Posicionamiento por contraste

**TÉCNICA 4: EXPECTATION REVERSAL**
- Promete menos, entrega más
- "Solo mejoramos 15% las ventas" → entrega 50%
- Sorpresa positiva = lealtad

**TÉCNICA 5: HUMBLE BRAGGING**
- "Nuestro problema es que vendemos demasiado"
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

**PATRÓN 6: UTILIZATION**
- Usa objeciones como ventajas
- "Precisamente porque eres escéptico..."
- "Justamente por eso es perfecto..."
- Transforma resistencia en momentum

**SCRIPT TEMPLATE:**
"Porque [VALOR] es importante para ti, y cuando [BENEFICIO FUTURO], vas a DESCUBRIR que [PRODUCTO] te ayuda a [RESULTADO DESEADO], especialmente cuando EXPERIMENTES [SENSACIÓN ESPECÍFICA]."

**HERRAMIENTAS DE APLICACIÓN:**
- Audit de copy existente
- Script templates por canal
- A/B testing de patrones
- Análisis de respuesta emocional`
          }
        ]
      }
    },
    {
      id: 'data-samurai',
      title: 'DATA SAMURAI',
      subtitle: 'GUERRERO DE LOS DATOS',
      description: 'Usa datos como espadas. Corta la ignorancia con análisis que realmente importan y métricas que predicen el futuro.',
      level: 'INTERMEDIO',
      duration: 'LECTURA DIRECTA',
      modules: [
        'Katana Analytics: Cortes Precisos',
        'Predictive Modeling para Campañas',
        'A/B Testing Ninja Techniques',
        'Attribution Modeling Avanzado'
      ],
      content: {
        intro: 'Los datos mienten cuando no sabes leerlos. Un samurai corta entre la verdad y el ruido con precisión milimétrica.',
        sections: [
          {
            title: 'KATANA ANALYTICS: CORTES PRECISOS',
            content: `**LAS 4 KATANAS DEL SAMURAI:**

**KATANA 1: WAKIZASHI (Métrica Vital)**
- Una sola métrica que define éxito/fracaso
- Ejemplo: CAC < LTV por 3x mínimo
- Todo lo demás es ruido

**KATANA 2: TANTO (Micro-Indicadores)**
- Señales tempranas de problemas
- Ejemplo: Drop-off rate en onboarding
- Detecta antes que se vuelva crisis

**KATANA 3: NODACHI (Macro-Patrones)**
- Tendencias que otros no ven
- Ejemplo: Correlación temporal entre eventos
- Predice comportamientos futuros

**KATANA 4: TESSEN (Métricas Defensivas)**
- Datos que protegen de malas decisiones
- Ejemplo: Churn rate por cohorte
- Evitan optimizar métricas vanidosas

**CÓDIGO SAMURAI:**
"Un corte preciso vale más que mil golpes ciegos"

**FRAMEWORK DE CORTE:**
1. PROBLEMA → ¿Qué métrica revela la verdad?
2. HIPÓTESIS → ¿Qué debería pasar si es correcta?
3. MEDICIÓN → ¿Qué datos necesito mínimos?
4. ACCIÓN → ¿Qué decisión tomo con este resultado?

**HERRAMIENTAS PRÁCTICAS:**
- Dashboard con máximo 5 métricas
- Alertas automáticas por umbrales
- Comparación período vs período
- Análisis de cohortes semanal`
          },
          {
            title: 'A/B TESTING NINJA TECHNIQUES',
            content: `**TÉCNICAS QUE LOS GURÚS NO ENSEÑAN:**

**TÉCNICA 1: MULTIVARIATE STRATIFIED**
- Testa múltiples variables simultáneamente
- Segmenta por características de usuario
- Encuentra combinaciones ganadoras

**TÉCNICA 2: SEQUENTIAL TESTING**
- Para cuando tienes poco tráfico
- Análisis continuo vs esperar al final
- Detecta ganadores más rápido

**TÉCNICA 3: BAYESIAN A/B**
- Incorpora conocimiento previo
- Más preciso con muestras pequeñas
- Resultado en probabilidades, no p-values

**TÉCNICA 4: MINIMUM DETECTABLE EFFECT**
- Calcula muestra necesaria ANTES de testear
- Evita tests eternos sin conclusión
- Define qué cambio vale la pena

**TÉCNICA 5: NOVELTY BIAS CORRECTION**
- Los usuarios reaccionan diferente a cambios nuevos
- Mide efecto después de 2-3 semanas
- Descarta resultados de primeros días

**CHECKLIST NINJA:**
□ Hipótesis clara antes de testear
□ Muestra calculada para detectar efecto mínimo
□ Segmentación por tipo de usuario
□ Período de estabilización incluido
□ Métricas secundarias monitoreadas
□ Plan de rollback si falla

**ERRORES MORTALES A EVITAR:**
❌ Parar test cuando parece ganar
❌ Cambiar variables durante el test
❌ Ignorar seasonalidad
❌ No considerar efectos secundarios
❌ Testear múltiples cosas sin corrección`
          },
          {
            title: 'PREDICTIVE MODELING PARA CAMPAÑAS',
            content: `**MODELOS QUE PREDICEN EL FUTURO:**

**MODELO 1: CUSTOMER LIFETIME VALUE PREDICTOR**
- Predice valor total de cliente
- Variables: frecuencia, recencia, monto
- Optimiza adspend por segmento

**MODELO 2: CHURN PREDICTION**
- Identifica clientes en riesgo
- Señales tempranas de abandono
- Campañas de retención proactivas

**MODELO 3: CONVERSION PROBABILITY SCORING**
- Score 0-100 por lead/visitante
- Personaliza mensajes por probabilidad
- Optimiza presupuesto por score

**MODELO 4: SEASONAL DEMAND FORECASTING**
- Predice demanda por temporadas
- Factores: histórico, tendencias, externos
- Planifica campañas con anticipación

**MODELO 5: ATTRIBUTION DECAY MODELING**
- Peso de cada touchpoint en conversión
- No solo first/last click
- Distribución inteligente de presupuesto

**HERRAMIENTAS PRÁCTICAS:**
- Excel templates con fórmulas
- Google Analytics 4 + BigQuery
- Python scripts básicos
- Looker Studio dashboards

**FRAMEWORK DE IMPLEMENTACIÓN:**
1. Define objetivo predictivo
2. Identifica variables disponibles
3. Recolecta data histórica (min 6 meses)
4. Entrena modelo simple (regresión)
5. Valida con datos recientes
6. Implementa predicciones en campañas
7. Monitorea accuracy y ajusta

**CASOS DE USO INMEDIATOS:**
- Predecir CAC por canal
- Identificar mejores horarios
- Optimizar frequency caps
- Personalizar ofertas

**STARTING POINT:**
Comienza con regresión lineal en Excel`
          },
          {
            title: 'ATTRIBUTION MODELING AVANZADO',
            content: `**MÁS ALLÁ DE FIRST Y LAST CLICK:**

**MODELO 1: TIME DECAY ATTRIBUTION**
- Más peso a touchpoints recientes
- Decay rate configurable
- Útil para ciclos de venta largos

**MODELO 2: POSITION-BASED (U-SHAPED)**
- 40% primer touch, 40% último touch
- 20% distribuido en el medio
- Valora awareness y conversión

**MODELO 3: DATA-DRIVEN ATTRIBUTION**
- Machine learning encuentra patrones
- Se adapta a tu negocio específico
- Requiere volumen de datos significativo

**MODELO 4: ALGORITHMIC ATTRIBUTION**
- Modelos de Markov chains
- Calcula probabilidad de conversión
- Considera secuencias de touchpoints

**MODELO 5: INCREMENTALITY TESTING**
- Testa impacto real de cada canal
- Geo-tests, audience hold-outs
- Mide lift incremental verdadero

**IMPLEMENTACIÓN PRÁCTICA:**

**PASO 1: DATA COLLECTION**
- UTM tracking consistente
- Cross-device user IDs
- Offline conversion import

**PASO 2: PATHWAY ANALYSIS**
- Mapea customer journeys
- Identifica patrones comunes
- Encuentra puntos de fricción

**PASO 3: MODEL SELECTION**
- Compara modelos disponibles
- Valida contra incrementality tests
- Elige por business objectives

**PASO 4: BUDGET REALLOCATION**
- Redistribute spend basado en attribution
- Test cambios gradualmente
- Monitorea performance total

**HERRAMIENTAS RECOMENDADAS:**
- Google Analytics 4 (Data-driven)
- Facebook Attribution Tool
- Northbeam/Triple Whale (e-commerce)
- Custom Python/R scripts

**MÉTRICAS CLAVE:**
- True incremental ROAS
- Cross-channel lift
- Customer acquisition efficiency
- Attribution model accuracy

**CHECKLIST DE IMPLEMENTACIÓN:**
□ Tracking unificado implementado
□ Baseline metrics establecidas
□ Test groups definidos
□ Attribution model seleccionado
□ Dashboard de monitoreo creado
□ Budget reallocation plan listo`
          }
        ]
      }
    }
  ];

  const quickResources = [
    {
      title: 'BRIEF AUDIT CHECKLIST',
      description: 'Lista de verificación de 47 puntos para detectar briefs tóxicos',
      type: 'CHECKLIST',
      time: '10 MIN'
    },
    {
      title: 'INSIGHT EXTRACTION FRAMEWORK',
      description: 'Metodología para extraer insights desde data social hasta neurociencia',
      type: 'FRAMEWORK',
      time: '20 MIN'
    },
    {
      title: 'CREATIVE BRIEF TEMPLATES',
      description: 'Templates probados por agencias top que no quieren que uses',
      type: 'TEMPLATES',
      time: '5 MIN'
    },
    {
      title: 'CAMPAIGN AUTOPSY GUIDE',
      description: 'Cómo hacer la autopsia de campañas fallidas para aprender',
      type: 'GUIDE',
      time: '15 MIN'
    }
  ];

  const masterClasses = [
    {
      title: 'THE BRIEF WHISPERER',
      speaker: 'DAVID DROGA MINDSET',
      description: 'Cómo leer entre líneas de un brief y encontrar la campaña oculta',
      duration: '45 MIN',
      level: 'MASTERCLASS'
    },
    {
      title: 'BEHAVIORAL TRIGGERS',
      speaker: 'NEUROMARKETING LAB',
      description: 'Los 12 triggers psicológicos que hackean decisiones de compra',
      duration: '60 MIN',
      level: 'MASTERCLASS'
    },
    {
      title: 'ANTI-ADVERTISING',
      speaker: 'DISRUPTION ACADEMY',
      description: 'Cómo crear campañas que la gente quiere ver (no evitar)',
      duration: '50 MIN',
      level: 'MASTERCLASS'
    }
  ];

  return (
    <View style={styles.wrapper}>
      <BrutalistNavHeader currentPage="learn" />
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Text style={styles.heroTitle}>LEARN</Text>
          <Text style={styles.heroSubtitle}>
            ENTRENAMIENTOS QUE NO ENSEÑAN EN LAS UNIVERSIDADES
          </Text>
          <View style={styles.yellowBar} />
          <Text style={styles.heroDescription}>
            Métodos probados en trincheras reales. Técnicas que usan las agencias top 
            pero no comparten. Conocimiento que convierte juniors en seniors.
          </Text>
        </View>

        {/* Learning Paths */}
        <View style={styles.pathsSection}>
          <Text style={styles.sectionTitle}>CAMINOS DE APRENDIZAJE</Text>
          <Text style={styles.sectionSubtitle}>
            ELIGE TU ESPECIALIZACIÓN DE COMBATE
          </Text>
          
          <View style={styles.pathsGrid}>
            {learningPaths.map((path, index) => (
              <Pressable 
                key={path.id}
                style={[
                  styles.pathCard,
                  selectedPath === path.id && styles.pathCardSelected
                ]}
                onPress={() => setSelectedPath(selectedPath === path.id ? null : path.id)}
              >
                <View style={styles.pathHeader}>
                  <Text style={styles.pathTitle}>{path.title}</Text>
                  <Text style={styles.pathSubtitle}>{path.subtitle}</Text>
                </View>
                
                <Text style={styles.pathDescription}>{path.description}</Text>
                
                <View style={styles.pathMeta}>
                  <View style={styles.pathBadge}>
                    <Text style={styles.pathLevel}>{path.level}</Text>
                  </View>
                  <Text style={styles.pathDuration}>{path.duration}</Text>
                </View>

                {selectedPath === path.id && (
                  <View style={styles.pathModules}>
                    <Text style={styles.modulesTitle}>MÓDULOS:</Text>
                    {path.modules.map((module, idx) => (
                      <Text key={idx} style={styles.moduleItem}>
                        {String(idx + 1).padStart(2, '0')}. {module}
                      </Text>
                    ))}
                    <Pressable style={styles.startButton}>
                      <Text style={styles.startButtonText}>COMENZAR ENTRENAMIENTO</Text>
                    </Pressable>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Quick Resources */}
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>RECURSOS RÁPIDOS</Text>
          <Text style={styles.sectionSubtitle}>
            HERRAMIENTAS PARA USO INMEDIATO
          </Text>
          
          <View style={styles.resourcesGrid}>
            {quickResources.map((resource, index) => (
              <Pressable key={index} style={styles.resourceCard}>
                <View style={styles.resourceHeader}>
                  <Text style={styles.resourceType}>{resource.type}</Text>
                  <Text style={styles.resourceTime}>{resource.time}</Text>
                </View>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
                <Pressable style={styles.downloadButton}>
                  <Text style={styles.downloadButtonText}>↓ DESCARGAR</Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Master Classes */}
        <View style={styles.masterClassSection}>
          <Text style={styles.sectionTitle}>MASTERCLASSES</Text>
          <Text style={styles.sectionSubtitle}>
            APRENDE DE LOS MAESTROS DEL JUEGO
          </Text>
          
          <View style={styles.masterClassGrid}>
            {masterClasses.map((masterClass, index) => (
              <View key={index} style={styles.masterClassCard}>
                <Text style={styles.masterClassLevel}>{masterClass.level}</Text>
                <Text style={styles.masterClassTitle}>{masterClass.title}</Text>
                <Text style={styles.masterClassSpeaker}>{masterClass.speaker}</Text>
                <Text style={styles.masterClassDescription}>{masterClass.description}</Text>
                <View style={styles.masterClassFooter}>
                  <Text style={styles.masterClassDuration}>{masterClass.duration}</Text>
                  <Pressable style={styles.watchButton}>
                    <Text style={styles.watchButtonText}>▶ VER AHORA</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Community Section */}
        <View style={styles.communitySection}>
          <Text style={styles.communityTitle}>ÚNETE A LA RESISTENCIA</Text>
          <Text style={styles.communitySubtitle}>
            COMUNIDAD DE PROFESIONALES QUE ODIAN LA MEDIOCRIDAD
          </Text>
          <View style={styles.communityStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>2.3K</Text>
              <Text style={styles.statLabel}>MIEMBROS ACTIVOS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>847</Text>
              <Text style={styles.statLabel}>BRIEFS AUDITADOS</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>92%</Text>
              <Text style={styles.statLabel}>MEJORA PROMEDIO</Text>
            </View>
          </View>
          <Pressable style={styles.joinButton}>
            <Text style={styles.joinButtonText}>UNIRSE A LA COMUNIDAD</Text>
          </Pressable>
          <Text style={styles.communityNote}>
            Acceso exclusivo a casos reales, feedback de expertos y networking con profesionales serios
          </Text>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>
            ¿LISTO PARA DEJAR DE SER{'\n'}UN AMATEUR?
          </Text>
          <Pressable 
            style={styles.ctaButton} 
            onPress={() => router.push('/(tabs)')}
          >
            <Text style={styles.ctaButtonText}>CREAR MI PRIMER BRIEF PRO</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#000000',
  },
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    padding: 40,
    paddingTop: 60,
  },
  heroTitle: {
    fontSize: 80,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: -3,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 24,
    lineHeight: 32,
  },
  yellowBar: {
    width: 150,
    height: 8,
    backgroundColor: '#FFD700',
    marginBottom: 32,
  },
  heroDescription: {
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 28,
    fontWeight: '500',
    opacity: 0.9,
  },

  // Paths Section
  pathsSection: {
    padding: 40,
    paddingTop: 80,
    backgroundColor: '#111111',
  },
  sectionTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -2,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 48,
    letterSpacing: 1,
  },
  pathsGrid: {
    gap: 24,
  },
  pathCard: {
    backgroundColor: '#000000',
    padding: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  pathCardSelected: {
    borderColor: '#FFD700',
    borderWidth: 4,
  },
  pathHeader: {
    marginBottom: 16,
  },
  pathTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 4,
    letterSpacing: -1,
  },
  pathSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
    opacity: 0.8,
  },
  pathDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '500',
  },
  pathMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pathBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pathLevel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  pathDuration: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  pathModules: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
  },
  modulesTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 16,
    letterSpacing: 1,
  },
  moduleItem: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '700',
  },
  startButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },

  // Resources Section
  resourcesSection: {
    padding: 40,
    paddingTop: 80,
  },
  resourcesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  resourceCard: {
    backgroundColor: '#000000',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    padding: 24,
    flex: 1,
    minWidth: 280,
  },
  resourceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resourceType: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD700',
    letterSpacing: 1,
  },
  resourceTime: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  resourceTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 22,
    marginBottom: 24,
    opacity: 0.9,
  },
  downloadButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    alignItems: 'center',
  },
  downloadButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },

  // Master Classes
  masterClassSection: {
    padding: 40,
    paddingTop: 80,
    backgroundColor: '#111111',
  },
  masterClassGrid: {
    gap: 24,
  },
  masterClassCard: {
    backgroundColor: '#000000',
    padding: 32,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  masterClassLevel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: 1,
  },
  masterClassTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: -1,
  },
  masterClassSpeaker: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
    marginBottom: 16,
    letterSpacing: 1,
  },
  masterClassDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 24,
    marginBottom: 24,
    fontWeight: '500',
  },
  masterClassFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masterClassDuration: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  watchButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  watchButtonText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },

  // Community Section
  communitySection: {
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
  },
  communityTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -1,
  },
  communitySubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
    letterSpacing: 0.5,
    lineHeight: 26,
  },
  communityStats: {
    flexDirection: 'row',
    gap: 40,
    marginBottom: 48,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFD700',
    marginBottom: 8,
    letterSpacing: -2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: 1,
  },
  joinButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 48,
    marginBottom: 16,
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
  communityNote: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 22,
    maxWidth: 400,
  },

  // CTA Section
  ctaSection: {
    padding: 40,
    paddingTop: 80,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 32,
    letterSpacing: -1,
    lineHeight: 40,
  },
  ctaButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 20,
    paddingHorizontal: 40,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 1,
  },
});