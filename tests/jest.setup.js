// Jest setup file for BriefBoy app

// Environment setup
process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-openai-key';
process.env.EXPO_PUBLIC_CLAUDE_API_KEY = 'test-claude-key';
process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-gemini-key';

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
};

// Mock fetch with OpenAI-like responses
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      choices: [
        {
          message: {
            content: JSON.stringify({
              projectTitle: "Test Marketing Campaign",
              briefSummary: "Test brief summary for marketing campaign",
              businessChallenge: "Test business challenge description",
              strategicObjectives: [
                "Increase brand awareness by 25%",
                "Drive customer acquisition",
                "Improve market positioning"
              ],
              targetAudience: {
                primary: "Young professionals aged 25-35",
                secondary: "Tech enthusiasts",
                insights: ["Values efficiency", "Active on social media"]
              },
              brandPositioning: "Premium tech brand for modern professionals",
              creativeStrategy: {
                bigIdea: "Technology that empowers your potential",
                tone: "Professional yet approachable",
                messaging: ["Innovation", "Reliability", "Growth"]
              }
            }),
          },
        },
      ],
    }),
    text: () => Promise.resolve('Test transcription from Whisper API'),
  })
);

// Mock FormData for file uploads
global.FormData = jest.fn(() => ({
  append: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  has: jest.fn(),
}));

// Mock Expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      OPENAI_API_KEY: 'test-key',
    },
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://test-directory/',
  readAsStringAsync: jest.fn(() => Promise.resolve('test file content')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  deleteAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, size: 1000 })),
}));

jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(() => Promise.resolve()),
  getStringAsync: jest.fn(() => Promise.resolve('test clipboard content')),
}));

jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Recording: {
      createAsync: jest.fn(() => Promise.resolve({
        recording: {
          stopAndUnloadAsync: jest.fn(() => Promise.resolve()),
          getURI: jest.fn(() => 'test-audio-uri'),
        },
      })),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(() => Promise.resolve({
    type: 'success',
    uri: 'test-document-uri',
    name: 'test-document.txt',
    size: 1000,
  })),
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  multiSet: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

// Mock React Native components
jest.mock('react-native', () => {
  const RN = {
    Platform: { OS: 'ios' },
    Alert: { alert: jest.fn() },
    Share: { share: jest.fn(() => Promise.resolve({ action: 'sharedAction' })) },
    StyleSheet: { 
      create: (styles) => styles,
      flatten: (style) => style
    },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    Pressable: 'Pressable',
    ScrollView: 'ScrollView',
    ActivityIndicator: 'ActivityIndicator',
    Animated: {
      Value: jest.fn(() => ({ setValue: jest.fn() })),
      timing: jest.fn(() => ({ start: jest.fn() })),
      loop: jest.fn(() => ({ start: jest.fn() })),
    },
  };
  return RN;
});

// Mock React Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
}));