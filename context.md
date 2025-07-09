# Contexto del Proyecto: BriefBoy App

## Resumen del Proyecto
Aplicación móvil (React Native + Expo, TypeScript) para creativos publicitarios y ejecutivos de marketing. Permite grabar audio y generar briefs de campañas publicitarias usando IA (transcripción con Whisper de OpenAI).

## Estado Actual
- Proyecto inicializado con Expo y TypeScript en el folder `briefboy-app`.
- Módulo funcional para grabar audio usando `expo-av`.
- Integración pendiente de transcripción con Whisper y almacenamiento en Supabase.
- Pruebas unitarias y de integración se almacenan en el folder `tests` dentro de `briefboy-app`.
- Archivo `.env` para la API key de OpenAI.
- Reglas de desarrollo documentadas en `cursor.rules`.

## Estructura de Carpetas
```
briefboy-app/
  app/                # Pantallas y navegación principal
  assets/             # Recursos estáticos (imágenes, etc.)
  components/         # Componentes reutilizables (incluye AudioRecorder)
  constants/          # Constantes globales
  hooks/              # Custom hooks
  scripts/            # Scripts de automatización
  tests/              # Pruebas unitarias y de integración
  .env                # Variables de entorno (no versionar)
  .env.example        # Ejemplo de variables de entorno
  cursor.rules        # Reglas de trabajo y calidad
  contexto.md         # Este archivo de contexto
  ...otros archivos de configuración
```

## Decisiones y Reglas de Trabajo
- Código limpio, simple y refactorizado.
- Pruebas obligatorias para cada módulo.
- Internacionalización y responsividad desde el inicio.
- No usar datos mock.
- No eliminar archivos sin aprobación.
- Todo cambio significativo debe ser revisado.
- Consultar siempre `cursor.rules` para detalles.

## Prompt para Retomar el Contexto

```
