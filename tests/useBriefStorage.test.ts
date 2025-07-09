import { renderHook, act } from '@testing-library/react-hooks';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useBriefStorage } from '../hooks/useBriefStorage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('useBriefStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty array when no stored data', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    
    const { result, waitForNextUpdate } = renderHook(() => useBriefStorage());
    
    await waitForNextUpdate();
    
    expect(result.current.savedBriefs).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('should load saved briefs from storage', async () => {
    const mockBriefs = [
      {
        id: '1',
        title: 'Test Brief',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        transcription: 'Test transcription',
        brief: { projectTitle: 'Test Project' },
      },
    ];
    
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBriefs));
    
    const { result, waitForNextUpdate } = renderHook(() => useBriefStorage());
    
    await waitForNextUpdate();
    
    expect(result.current.savedBriefs).toEqual(mockBriefs);
    expect(result.current.loading).toBe(false);
  });

  it('should save a new brief', async () => {
    mockAsyncStorage.getItem.mockResolvedValue(null);
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    
    const { result, waitForNextUpdate } = renderHook(() => useBriefStorage());
    
    await waitForNextUpdate();
    
    let briefId: string = '';
    
    await act(async () => {
      briefId = await result.current.saveBrief(
        'New Brief',
        'New transcription',
        { projectTitle: 'New Project' },
        'audio-uri'
      );
    });
    
    expect(briefId).toBeDefined();
    expect(result.current.savedBriefs).toHaveLength(1);
    expect(result.current.savedBriefs[0].title).toBe('New Brief');
    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should update an existing brief', async () => {
    const mockBriefs = [
      {
        id: '1',
        title: 'Original Title',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        transcription: 'Original transcription',
        brief: { projectTitle: 'Original Project' },
      },
    ];
    
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBriefs));
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    
    const { result, waitForNextUpdate } = renderHook(() => useBriefStorage());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.updateBrief('1', { title: 'Updated Title' });
    });
    
    expect(result.current.savedBriefs[0].title).toBe('Updated Title');
    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should delete a brief', async () => {
    const mockBriefs = [
      {
        id: '1',
        title: 'Brief to Delete',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        transcription: 'Test transcription',
        brief: { projectTitle: 'Test Project' },
      },
    ];
    
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBriefs));
    mockAsyncStorage.setItem.mockResolvedValue(undefined);
    
    const { result, waitForNextUpdate } = renderHook(() => useBriefStorage());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.deleteBrief('1');
    });
    
    expect(result.current.savedBriefs).toHaveLength(0);
    expect(mockAsyncStorage.setItem).toHaveBeenCalled();
  });

  it('should get brief by id', async () => {
    const mockBriefs = [
      {
        id: '1',
        title: 'Test Brief',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        transcription: 'Test transcription',
        brief: { projectTitle: 'Test Project' },
      },
    ];
    
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBriefs));
    
    const { result, waitForNextUpdate } = renderHook(() => useBriefStorage());
    
    await waitForNextUpdate();
    
    const foundBrief = result.current.getBriefById('1');
    
    expect(foundBrief).toEqual(mockBriefs[0]);
  });

  it('should clear all briefs', async () => {
    const mockBriefs = [
      {
        id: '1',
        title: 'Test Brief',
        createdAt: '2023-01-01T00:00:00Z',
        updatedAt: '2023-01-01T00:00:00Z',
        transcription: 'Test transcription',
        brief: { projectTitle: 'Test Project' },
      },
    ];
    
    mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(mockBriefs));
    mockAsyncStorage.removeItem.mockResolvedValue(undefined);
    
    const { result, waitForNextUpdate } = renderHook(() => useBriefStorage());
    
    await waitForNextUpdate();
    
    await act(async () => {
      await result.current.clearAllBriefs();
    });
    
    expect(result.current.savedBriefs).toHaveLength(0);
    expect(mockAsyncStorage.removeItem).toHaveBeenCalled();
  });
});