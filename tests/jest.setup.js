// Jest setup file
import 'react-native-gesture-handler/jestSetup';

// Forzar la definición de globalThis.expo y EventEmitter antes de cualquier import
if (typeof globalThis.expo === 'undefined') {
  globalThis.expo = {};
}
if (typeof globalThis.expo.EventEmitter === 'undefined') {
  globalThis.expo.EventEmitter = function() {
    return {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      emit: jest.fn(),
      removeAllListeners: jest.fn(),
    };
  };
}

// Mock expo modules
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      OPENAI_API_KEY: 'test-key',
    },
  },
}));

// Mock expo-av
jest.mock('expo-av', () => ({
  Audio: {
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
    setAudioModeAsync: jest.fn(() => Promise.resolve()),
    Recording: {
      createAsync: jest.fn(() => Promise.resolve({
        recording: {
          stopAndUnloadAsync: jest.fn(() => Promise.resolve()),
          getURI: jest.fn(() => 'test-uri'),
        },
      })),
    },
    RecordingOptionsPresets: {
      HIGH_QUALITY: {},
    },
  },
}));

// Mock async storage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({
      choices: [
        {
          message: {
            content: '{"projectTitle": "Test Brief", "briefSummary": "Test summary"}',
          },
        },
      ],
    }),
  })
);

// Mock alert
global.alert = jest.fn();

// Mock console methods to reduce test noise
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};

// Mock process.env
process.env.EXPO_PUBLIC_OPENAI_API_KEY = 'test-key';
process.env.OPENAI_API_KEY = 'test-key';