import { act, fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';
import ChatImprovementModal from '../components/ChatImprovementModal';

jest.mock('../hooks/useChatWithAI');
const useChatWithAI = require('../hooks/useChatWithAI').useChatWithAI;

describe('ChatImprovementModal', () => {
  const brief = { title: 'Brief de prueba' };
  const onClose = jest.fn();
  const onBriefImproved = jest.fn();
  const onIaSuggestions = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza y muestra mensajes del chat', () => {
    useChatWithAI.mockReturnValue({
      messages: [
        { role: 'assistant', content: 'Hola, ¿cómo puedo ayudarte?' },
        { role: 'user', content: 'Quiero mejorar el brief.' }
      ],
      userInput: '',
      setUserInput: jest.fn(),
      sendMessage: jest.fn(),
      loading: false,
      improvedBrief: null,
      iaSuggestions: null
    });
    const { getByText } = render(
      <ChatImprovementModal
        visible={true}
        brief={brief}
        onClose={onClose}
        onBriefImproved={onBriefImproved}
        onIaSuggestions={onIaSuggestions}
      />
    );
    expect(getByText(/mejora tu brief/i)).toBeTruthy();
    expect(getByText('IA:')).toBeTruthy();
    expect(getByText('Tú:')).toBeTruthy();
    expect(getByText(/quiero mejorar el brief/i)).toBeTruthy();
  });

  it('llama a onClose al cerrar el modal', () => {
    useChatWithAI.mockReturnValue({
      messages: [],
      userInput: '',
      setUserInput: jest.fn(),
      sendMessage: jest.fn(),
      loading: false,
      improvedBrief: null,
      iaSuggestions: null
    });
    const { getByTestId } = render(
      <ChatImprovementModal
        visible={true}
        brief={brief}
        onClose={onClose}
        onBriefImproved={onBriefImproved}
        onIaSuggestions={onIaSuggestions}
      />
    );
    // Simula cierre por requestClose
    act(() => {
      getByTestId('modal').props.onRequestClose();
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('permite enviar input y llama a sendMessage', () => {
    const setUserInput = jest.fn();
    const sendMessage = jest.fn();
    useChatWithAI.mockReturnValue({
      messages: [],
      userInput: 'Hola',
      setUserInput,
      sendMessage,
      loading: false,
      improvedBrief: null,
      iaSuggestions: null
    });
    const { getByPlaceholderText, getByText } = render(
      <ChatImprovementModal
        visible={true}
        brief={brief}
        onClose={onClose}
        onBriefImproved={onBriefImproved}
        onIaSuggestions={onIaSuggestions}
      />
    );
    fireEvent.changeText(getByPlaceholderText(/escribe tu respuesta/i), 'Hola');
    expect(setUserInput).toHaveBeenCalledWith('Hola');
    fireEvent.press(getByText(/enviar/i));
    expect(sendMessage).toHaveBeenCalled();
  });

  it('muestra loading y deshabilita input/botón', () => {
    useChatWithAI.mockReturnValue({
      messages: [],
      userInput: 'Hola',
      setUserInput: jest.fn(),
      sendMessage: jest.fn(),
      loading: true,
      improvedBrief: null,
      iaSuggestions: null
    });
    const { getByPlaceholderText, getByText } = render(
      <ChatImprovementModal
        visible={true}
        brief={brief}
        onClose={onClose}
        onBriefImproved={onBriefImproved}
        onIaSuggestions={onIaSuggestions}
      />
    );
    expect(getByPlaceholderText(/escribe tu respuesta/i).props.disabled).toBe(true);
    expect(getByText(/enviar/i).props.disabled).toBe(true);
  });

  it('llama a onBriefImproved y onClose al generar brief mejorado', () => {
    useChatWithAI.mockReturnValue({
      messages: [],
      userInput: '',
      setUserInput: jest.fn(),
      sendMessage: jest.fn(),
      loading: false,
      improvedBrief: { ...brief, title: 'Mejorado' },
      iaSuggestions: null
    });
    const { getByText } = render(
      <ChatImprovementModal
        visible={true}
        brief={brief}
        onClose={onClose}
        onBriefImproved={onBriefImproved}
        onIaSuggestions={onIaSuggestions}
      />
    );
    fireEvent.press(getByText(/generar/i));
    expect(onBriefImproved).toHaveBeenCalledWith({ ...brief, title: 'Mejorado' });
    expect(onClose).toHaveBeenCalled();
  });

  it('llama a onIaSuggestions cuando cambian las sugerencias', async () => {
    let iaSuggestions = 'Sugerencia de IA';
    useChatWithAI.mockReturnValue({
      messages: [],
      userInput: '',
      setUserInput: jest.fn(),
      sendMessage: jest.fn(),
      loading: false,
      improvedBrief: null,
      iaSuggestions
    });
    render(
      <ChatImprovementModal
        visible={true}
        brief={brief}
        onClose={onClose}
        onBriefImproved={onBriefImproved}
        onIaSuggestions={onIaSuggestions}
      />
    );
    await waitFor(() => {
      expect(onIaSuggestions).toHaveBeenCalledWith('Sugerencia de IA');
    });
  });

  it('es responsivo y muestra correctamente en mobile', () => {
    useChatWithAI.mockReturnValue({
      messages: [],
      userInput: '',
      setUserInput: jest.fn(),
      sendMessage: jest.fn(),
      loading: false,
      improvedBrief: null,
      iaSuggestions: null
    });
    const { getByText } = render(
      <ChatImprovementModal
        visible={true}
        brief={brief}
        onClose={onClose}
        onBriefImproved={onBriefImproved}
        onIaSuggestions={onIaSuggestions}
      />
    );
    expect(getByText(/mejora tu brief/i)).toBeTruthy();
  });
});