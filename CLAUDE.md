# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Basic Development
- `npm start` or `npx expo start` - Start the Expo development server
- `npm run android` - Run on Android emulator/device
- `npm run ios` - Run on iOS simulator/device  
- `npm run web` - Run on web browser
- `npm run lint` - Run ESLint to check code quality

### Testing
- `npm test` - Run Jest tests
- Test files are located in the `tests/` directory
- Uses Jest with ts-jest preset and jsdom environment
- Tests cover hooks like `useWhisperTranscription` and `useBriefGeneration`

### Project Reset
- `npm run reset-project` - Move starter code to app-example and create blank app directory

## Architecture Overview

### Core Application Structure
BriefBoy is a React Native/Expo app that records audio, transcribes it using OpenAI's Whisper API, and generates marketing briefs using GPT-4o. The app follows a clean architecture with clear separation of concerns and includes professional UI components with local storage.

### Key Components & Flow
1. **AudioRecorder** (`components/AudioRecorder.tsx`) - Professional audio recording with animations and better UX
2. **useWhisperTranscription** (`hooks/useWhisperTranscription.ts`) - Transcribes audio via OpenAI Whisper API
3. **useBriefGeneration** (`hooks/useBriefGeneration.ts`) - Generates marketing briefs using GPT-4o with professional prompts
4. **TranscriptionResult** (`components/TranscriptionResult.tsx`) - Modern transcription display with loading states
5. **ProfessionalBriefDisplay** (`components/ProfessionalBriefDisplay.tsx`) - Professional brief display with structured sections
6. **BriefResult** (`components/BriefResult.tsx`) - Legacy brief display (still available)
7. **useBriefStorage** (`hooks/useBriefStorage.ts`) - Local storage management for saved briefs
8. **SavedBriefsList** (`components/SavedBriefsList.tsx`) - Display and manage saved briefs
9. **BriefImprovementModal** (`components/BriefImprovementModal.tsx`) - Advanced brief analysis and improvement system
10. **useBriefAnalysis** (`hooks/useBriefAnalysis.ts`) - AI-powered brief analysis with scoring system
11. **BriefAnalysisDisplay** (`components/BriefAnalysisDisplay.tsx`) - Professional analysis display with scores and recommendations
12. **useFastChat** (`hooks/useFastChat.ts`) - Multi-provider fast chat system (Claude, Gemini, OpenAI)
13. **FastChatInterface** (`components/FastChatInterface.tsx`) - Modern chat interface with typing indicators

### Data Flow
Audio Recording → Whisper Transcription → Brief Generation (GPT-4o) → Professional Display → Auto-save → History Management

### Navigation Structure
- **Grabador Tab** (`app/(tabs)/index.tsx`) - Main recording and brief generation
- **Historial Tab** (`app/(tabs)/history.tsx`) - View and manage saved briefs
- **Explorar Tab** (`app/(tabs)/explore.tsx`) - Additional features

### State Management
- Uses React hooks for local state management
- Custom hooks handle API calls and async operations
- Local storage via AsyncStorage for brief persistence
- No external state management library (Redux, Zustand, etc.)

### API Integration
- **OpenAI Whisper API** for audio transcription
- **OpenAI GPT-4o API** for brief generation with professional prompts
- **OpenAI GPT-4o-mini API** for fast brief analysis
- **Claude (Anthropic) API** for fast conversational chat (optional)
- **Gemini Flash API** for fast conversational chat (optional)
- **Multi-provider fallback system** for reliable chat functionality
- Improved error handling and response parsing
- Environment variables: `EXPO_PUBLIC_OPENAI_API_KEY` (required), `EXPO_PUBLIC_CLAUDE_API_KEY` (optional), `EXPO_PUBLIC_GEMINI_API_KEY` (optional)

## Development Guidelines

### Code Style (from cursor.rules)
- **Simplicity**: Prioritize simple, direct solutions over complex ones
- **File Size**: Maximum 200 lines per file - split larger files into smaller modules
- **Modular Design**: Components should be small, independent, and reusable
- **Clean Code**: Minimize comments, maintain consistent formatting
- **Error Handling**: Implement robust error handling throughout
- **Testing**: Write unit and integration tests for all functionality

### Environment Setup
- Create `.env` file with `EXPO_PUBLIC_OPENAI_API_KEY=your_api_key`
- The app uses Expo SDK ~53.0.17 with React Native 0.79.5

### File Organization
- `app/` - Main application screens using file-based routing
- `components/` - Reusable UI components
- `hooks/` - Custom React hooks for business logic
- `constants/` - App constants and theme configuration
- `assets/` - Images, fonts, and other static assets
- `tests/` - Test files

### Common Patterns
- Custom hooks for API calls with loading/error states
- TypeScript interfaces for component props and hook return types
- Expo-compatible components and APIs
- Functional components with hooks (no class components)
- Professional UI with consistent styling and animations
- Auto-save functionality for user data
- Modal-based workflows for complex interactions

## Testing Approach
- Jest with React Testing Library for component testing
- Custom hook testing using `@testing-library/react-hooks`
- Manual testing documentation in `tests/manual-*` files
- Tests should use real data or controlled test environments (no mocks per cursor.rules)
- Storage hook tests added for local persistence functionality
- Brief analysis system tests for scoring and recommendations
- Fast chat system tests with multi-provider fallback scenarios
- Test setup includes mocks for Expo modules, AsyncStorage, and multiple AI APIs

## Performance Optimizations
- **GPT-4o-mini** for fast analysis (vs GPT-4o for generation)
- **Claude Haiku** for fastest conversational responses
- **Gemini Flash** for high-speed chat interactions
- **Automatic fallback** to prevent chat interruptions
- **Optimized prompts** for faster response times
- **Local caching** for improved user experience
- **Efficient state management** for smooth UI interactions

## Key Dependencies
- **Expo**: Main framework for React Native development
- **expo-av**: Audio recording and playback
- **@react-native-async-storage/async-storage**: Local data persistence
- **OpenAI APIs**: Whisper (transcription), GPT-4o (brief generation), GPT-4o-mini (analysis)
- **Claude API (optional)**: Fast conversational chat
- **Gemini API (optional)**: Fast conversational chat
- **React Navigation**: Tab-based navigation
- **TypeScript**: Type safety throughout the codebase

## Brief Analysis System
The new analysis system provides:
- **Overall Score** (0-100): Composite score for brief quality
- **Detailed Scores**: Completeness, Quality, Professionalism, Readiness
- **Section Analysis**: Individual scoring for each brief section
- **Actionable Feedback**: Specific recommendations for improvement
- **Production Readiness**: Clear indicator if brief is ready for execution
- **Improvement Time Estimate**: Realistic time needed for enhancements

## Fast Chat System
The improved chat system features:
- **Multi-Provider Support**: Claude > Gemini > OpenAI (automatic fallback)
- **Fast Response Times**: Optimized for conversational flow
- **Context Awareness**: Understands brief content and analysis results
- **Professional Guidance**: Marketing expert persona with industry knowledge
- **Real-time Indicators**: Typing status, connection status, error handling
- **Quick Replies**: Common improvement scenarios with one-tap responses

## New Features Added
- **Professional UI**: Modern design with animations and better UX
- **Local Storage**: Save and manage briefs locally
- **History Management**: View, delete, and organize saved briefs
- **Auto-save**: Automatic brief saving after generation
- **Improved AI**: GPT-4o with professional marketing prompts
- **Better Error Handling**: Comprehensive error states and user feedback
- **Dual Display Modes**: Toggle between professional and classic brief views
- **Advanced Brief Analysis**: AI-powered scoring system (0-100) with detailed feedback
- **Professional Analysis UI**: Scores, strengths, weaknesses, critical issues, and recommendations
- **Multi-Provider Fast Chat**: Claude, Gemini, and OpenAI with automatic fallback
- **Conversational Brief Improvement**: Fast, fluid chat interface for brief enhancement
- **Real-time Typing Indicators**: Professional chat experience with connection status
- **Quick Reply Suggestions**: Context-aware quick responses for common improvement areas