import OpenAI from 'openai';

export const openrouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXTAUTH_URL || 'http://localhost:3000',
    'X-Title': 'PipelinePro OS',
  },
});

export const MODELS = {
  FAST: 'meta-llama/llama-3.1-8b-instruct:free',
  BALANCED: 'meta-llama/llama-3.1-70b-instruct',
  QUALITY: 'anthropic/claude-3.5-sonnet',
} as const;

export type ModelType = keyof typeof MODELS;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function createChatCompletion(
  messages: ChatMessage[],
  model: ModelType = 'BALANCED',
  temperature = 0.7
) {
  try {
    const completion = await openrouter.chat.completions.create({
      model: MODELS[model],
      messages,
      temperature,
    });

    return completion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OpenRouter API error:', error);
    throw error;
  }
}