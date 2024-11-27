import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('Missing OpenAI API key');
}

const openai = new OpenAI({
  apiKey: apiKey,
});

type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export async function complete({ 
  messages,
  temperature = 0.7,
  max_tokens = 1000,
}: { 
  messages: Message[];
  temperature?: number;
  max_tokens?: number;
}) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: messages,
    temperature,
    max_tokens,
  });

  return completion;
}
