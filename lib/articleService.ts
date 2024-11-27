import { Document } from 'llamaindex';
import { complete } from '@/lib/openai';
import * as cheerio from 'cheerio';

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

async function fetchArticleFromUrl(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove script tags, style tags, and other non-content elements
    $('script').remove();
    $('style').remove();
    $('nav').remove();
    $('header').remove();
    $('footer').remove();
    
    // Get the main content
    const content = $('article').text() || $('main').text() || $('body').text();
    return content.trim();
  } catch (error) {
    throw new Error('Failed to fetch article from URL');
  }
}

export async function detectLanguageLevel(text: string): Promise<string> {
  const prompt = `
    Analyze the following text and determine its CEFR language level (A1, A2, B1, B2, C1, or C2).
    Consider the following factors:
    - Vocabulary complexity
    - Grammar structures
    - Sentence complexity
    - Overall text coherence
    
    Text to analyze:
    "${text.slice(0, 1000)}" // Using first 1000 chars for analysis
    
    Return only the CEFR level (A1, A2, B1, B2, C1, or C2) without any explanation.
  `;

  const response = await complete({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 5
  });

  const detectedLevel = response.choices[0].message.content || '';
  const trimmedLevel = detectedLevel.trim();
  
  if (!CEFR_LEVELS.includes(trimmedLevel)) {
    throw new Error('Invalid CEFR level detected');
  }

  return trimmedLevel;
}

export async function rewriteArticle(text: string, targetLevel: string): Promise<string> {
  if (!CEFR_LEVELS.includes(targetLevel)) {
    throw new Error('Invalid target CEFR level');
  }

  const prompt = `
    Rewrite the following text to match the CEFR language level ${targetLevel}.
    Maintain the same meaning and information and original language used, but adjust:
    - Vocabulary complexity
    - Grammar structures
    - Sentence complexity
    to match ${targetLevel} level.
    
    Original text:
    "${text}"
    
    Rewritten text at ${targetLevel} level:
  `;

  const response = await complete({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 1500
  });

  const content = response.choices[0].message.content || '';
  return content.trim();
}

export async function processArticle(input: string, isUrl: boolean = false): Promise<{
  text: string;
  level: string;
}> {
  const text = isUrl ? await fetchArticleFromUrl(input) : input;
  const level = await detectLanguageLevel(text);
  
  return {
    text,
    level,
  };
}
