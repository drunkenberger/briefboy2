import { useEffect, useState } from 'react';
import { mergeBriefs } from './briefUtils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const SYSTEM_PROMPT = `You are a world-class Marketing Director named Elena. Your goal is to help the user create a complete and professional Marketing Brief by asking targeted questions.

**Your Task:**
1.  You will receive the original transcription, the current brief (as a JSON object), and the conversation history.
2.  **Preserve all existing data in the brief.** Your primary job is to fill in missing information.
3.  Incorporate the user's latest answer into the "updatedBrief".
4.  Analyze the "updatedBrief" to identify the single most important missing or weak field and ask the user a clear, specific question to get the information needed.
5.  If you determine the brief is complete and of high quality, set nextQuestion to null.

**Response Format:**
*   You MUST respond with a single, valid JSON object.
*   The JSON object must have two keys: "nextQuestion" and "updatedBrief".
*   "nextQuestion": A string containing the next question for the user, or null if the brief is complete.
*   "updatedBrief": The full, updated JSON of the marketing brief, **preserving all previous information**.

**Example Interaction:**
*   **User provides an answer.**
*   **AI responds:**
    {
      "nextQuestion": "Great, that clarifies the objective. Now, who is the primary target audience for this campaign?",
      "updatedBrief": { ... brief JSON with the user's answer incorporated ... }
    }
*   **When the brief is complete, AI responds:**
    {
      "nextQuestion": null,
      "updatedBrief": { ... final, complete brief JSON ... }
    }
`;

export function useChatWithAI(initialBrief: any, transcription?: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [improvedBrief, setImprovedBrief] = useState<any | null>(null);
  const [currentBrief, setCurrentBrief] = useState<any>(initialBrief);

  useEffect(() => {
    if (!initialBrief) return;

    setCurrentBrief(initialBrief);
    setImprovedBrief(null);

    const startConversation = async () => {
      setLoading(true);
      const initialMessage = "Let's start refining this brief. What is the primary business objective?";
      const response = await getAIResponse(initialBrief, [], initialMessage, transcription);
      handleAIResponse(response, []);
      setLoading(false);
    };

    startConversation();

  }, [initialBrief, transcription]);

  const getAIResponse = async (brief: any, chatHistory: Message[], userMessage: string, trans: string | undefined) => {
    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      return JSON.stringify({ nextQuestion: 'Error: OpenAI API key is not configured.', updatedBrief: brief });
    }

    const systemContent = `Original Transcription:\n${trans}\n\nCurrent Brief State:\n${JSON.stringify(brief, null, 2)}`;

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
          { role: 'user', content: systemContent },
          ...chatHistory,
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return JSON.stringify({ nextQuestion: `Error from API: ${errorText}`, updatedBrief: brief });
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || JSON.stringify({ nextQuestion: 'No response from AI.', updatedBrief: brief });
  };

  const handleAIResponse = (aiResponse: string, currentMessages: Message[]) => {
    try {
      const parsed = JSON.parse(aiResponse);
      const { nextQuestion, updatedBrief } = parsed;

      if (updatedBrief) {
        const merged = mergeBriefs(currentBrief, updatedBrief);
        setCurrentBrief(merged);
      }

      if (nextQuestion) {
        setMessages([...currentMessages, { role: 'assistant', content: nextQuestion }]);
      } else {
        // Brief is complete
        const finalBrief = mergeBriefs(currentBrief, updatedBrief);
        setImprovedBrief(finalBrief);
        setMessages([...currentMessages, { role: 'assistant', content: "¡Excelente! Hemos completado el brief. Puedes revisarlo y aplicarlo." }]);
      }
    } catch (e) {
      setMessages([...currentMessages, { role: 'assistant', content: "Hubo un problema al procesar la respuesta de la IA. Por favor, intenta de nuevo." }]);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || loading) return;

    const userMessage = userInput.trim();
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setUserInput('');
    setLoading(true);

    try {
      const aiResponse = await getAIResponse(currentBrief, newMessages, userMessage, transcription);
      handleAIResponse(aiResponse, newMessages);
    } catch (err: any) {
      setMessages([...newMessages, { role: 'assistant', content: `An error occurred: ${err.message}` }]);
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
    iaSuggestions: null,
  };
}
