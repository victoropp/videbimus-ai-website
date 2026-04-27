import { hf } from './providers';
import { enhancedProviders, type ProviderResponse } from './enhanced-providers';
import { z } from 'zod';

async function groqChat(prompt: string, maxTokens = 600): Promise<string> {
  try {
    const result = await enhancedProviders.chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      maxTokens,
    }) as ProviderResponse;
    return result.content || '';
  } catch {
    return '';
  }
}

function extractJson(text: string): string {
  // Strip markdown code fences if present
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  // Try to find first { or [
  const start = text.search(/[\[{]/);
  if (start >= 0) return text.slice(start);
  return text;
}

// ─── Sentiment Analysis ───────────────────────────────────────────────────────

export interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  emotions?: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
  };
}

export async function analyzeSentiment(text: string): Promise<SentimentResult> {
  // Try HuggingFace first
  try {
    const hfResult = await hf.textClassification({
      model: 'nlptown/bert-base-multilingual-uncased-sentiment',
      inputs: text,
    });
    const starRating = parseInt(hfResult[0].label.split(' ')[0]);
    const sentiment: SentimentResult['sentiment'] =
      starRating >= 4 ? 'positive' : starRating <= 2 ? 'negative' : 'neutral';
    const emotions = { joy: 0.2, sadness: 0.2, anger: 0.2, fear: 0.2, surprise: 0.2 };
    if (sentiment === 'positive') { emotions.joy = 0.7; emotions.surprise = 0.3; }
    else if (sentiment === 'negative') { emotions.sadness = 0.5; emotions.anger = 0.3; emotions.fear = 0.2; }
    return { sentiment, confidence: hfResult[0].score, emotions };
  } catch {
    // fall through to Groq
  }

  const prompt = `Analyze the sentiment of this text. Respond with ONLY a JSON object, no other text.

Text: "${text.slice(0, 2000)}"

JSON format:
{"sentiment":"positive|negative|neutral","confidence":0.0-1.0,"emotions":{"joy":0.0-1.0,"sadness":0.0-1.0,"anger":0.0-1.0,"fear":0.0-1.0,"surprise":0.0-1.0}}`;

  const raw = await groqChat(prompt, 200);
  try {
    return JSON.parse(extractJson(raw));
  } catch {
    // Simple rule-based fallback
    const lower = text.toLowerCase();
    const pos = ['good', 'great', 'excellent', 'happy', 'love', 'amazing', 'wonderful', 'fantastic'].filter(w => lower.includes(w)).length;
    const neg = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'worst', 'poor', 'disappointing'].filter(w => lower.includes(w)).length;
    const sentiment: SentimentResult['sentiment'] = pos > neg ? 'positive' : neg > pos ? 'negative' : 'neutral';
    return {
      sentiment,
      confidence: 0.65,
      emotions: {
        joy: sentiment === 'positive' ? 0.6 : 0.1,
        sadness: sentiment === 'negative' ? 0.5 : 0.1,
        anger: sentiment === 'negative' ? 0.3 : 0.05,
        fear: 0.05,
        surprise: 0.1,
      },
    };
  }
}

// ─── Text Summarization ───────────────────────────────────────────────────────

export interface SummaryOptions {
  length?: 'short' | 'medium' | 'long';
  style?: 'bullet-points' | 'paragraph' | 'executive';
}

export async function summarizeText(text: string, options: SummaryOptions = {}): Promise<string> {
  const { length = 'medium', style = 'paragraph' } = options;

  // Try HuggingFace BART first
  try {
    const maxLen = length === 'short' ? 60 : length === 'long' ? 300 : 150;
    const minLen = length === 'short' ? 20 : length === 'long' ? 100 : 40;
    const hfResult = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: text.slice(0, 1024),
      parameters: { max_length: maxLen, min_length: minLen, do_sample: false },
    });
    let summary = hfResult.summary_text;
    if (style === 'bullet-points') {
      summary = summary.split('. ').filter(s => s.trim()).map(s => `• ${s.trim()}${s.endsWith('.') ? '' : '.'}`).join('\n');
    } else if (style === 'executive') {
      summary = `**Executive Summary**\n\n${summary}\n\n**Key Takeaway:** ${summary.split('.')[0]}.`;
    }
    return summary;
  } catch {
    // fall through to Groq
  }

  const lengthGuide = length === 'short' ? '1–2 sentences' : length === 'long' ? 'a detailed paragraph of 5–8 sentences' : '3–4 sentences';
  const styleGuide = style === 'bullet-points' ? 'Format as bullet points.' : style === 'executive' ? 'Format as an executive summary with a bold header and a key takeaway line at the end.' : 'Write as flowing prose.';

  const prompt = `Summarize the following text in ${lengthGuide}. ${styleGuide} Return only the summary.

Text:
${text.slice(0, 3000)}`;

  const result = await groqChat(prompt, 400);
  return result || 'Unable to generate summary.';
}

// ─── NER Entity Extraction ────────────────────────────────────────────────────

export interface Entity {
  text: string;
  type: 'PERSON' | 'ORG' | 'GPE' | 'DATE' | 'MONEY' | 'PERCENT' | 'EMAIL' | 'URL' | 'PHONE';
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export async function extractEntities(text: string): Promise<Entity[]> {
  const entities: Entity[] = [];

  // Try HuggingFace NER first
  try {
    const hfResult = await hf.tokenClassification({
      model: 'dbmdz/bert-large-cased-finetuned-conll03-english',
      inputs: text,
    });
    for (const e of hfResult as any[]) {
      let type: Entity['type'] = 'ORG';
      if (e.entity_group === 'PER') type = 'PERSON';
      else if (e.entity_group === 'LOC' || e.entity_group === 'GPE') type = 'GPE';
      entities.push({ text: e.word, type, confidence: e.score, startIndex: e.start || 0, endIndex: e.end || e.word.length });
    }
  } catch {
    // fall through to Groq
  }

  // Always add regex-detected contact info
  const emailRe = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const urlRe = /https?:\/\/[^\s]+/g;
  const phoneRe = /(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;

  for (const m of text.matchAll(emailRe)) entities.push({ text: m[0], type: 'EMAIL', confidence: 0.97, startIndex: m.index!, endIndex: m.index! + m[0].length });
  for (const m of text.matchAll(urlRe)) entities.push({ text: m[0], type: 'URL', confidence: 0.97, startIndex: m.index!, endIndex: m.index! + m[0].length });
  for (const m of text.matchAll(phoneRe)) { if (m[0].replace(/\D/g, '').length >= 10) entities.push({ text: m[0], type: 'PHONE', confidence: 0.85, startIndex: m.index!, endIndex: m.index! + m[0].length }); }

  if (entities.length > 0) return entities;

  // Groq fallback
  const prompt = `Extract named entities from this text. Return ONLY a JSON array, no other text.

Entity types: PERSON, ORG, GPE (location), DATE, MONEY, PERCENT, EMAIL, URL, PHONE

Text: "${text.slice(0, 2000)}"

JSON format: [{"text":"...","type":"...","confidence":0.0-1.0,"startIndex":0,"endIndex":0}]`;

  const raw = await groqChat(prompt, 600);
  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return [];
  }
}

// ─── Text Classification ──────────────────────────────────────────────────────

export interface ClassificationResult {
  category: string;
  confidence: number;
  allScores: { [category: string]: number };
}

export async function classifyText(text: string, categories: string[]): Promise<ClassificationResult> {
  const prompt = `Classify this text into exactly one of: ${categories.join(', ')}. Return ONLY a JSON object.

Text: "${text.slice(0, 2000)}"

JSON format: {"category":"chosen category","confidence":0.0-1.0,"allScores":{${categories.map(c => `"${c}":0.0`).join(',')}}}`;

  const raw = await groqChat(prompt, 300);
  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return {
      category: categories[0] || 'unknown',
      confidence: 0.5,
      allScores: Object.fromEntries(categories.map(c => [c, 1 / categories.length])),
    };
  }
}

// ─── Language Detection ───────────────────────────────────────────────────────

export interface LanguageResult {
  language: string;
  confidence: number;
  allLanguages: { [language: string]: number };
}

export async function detectLanguage(text: string): Promise<LanguageResult> {
  const prompt = `Detect the language of this text. Return ONLY a JSON object.

Text: "${text.slice(0, 500)}"

JSON format: {"language":"English","confidence":0.0-1.0,"allLanguages":{"English":0.0,"Spanish":0.0,"French":0.0,"German":0.0,"Other":0.0}}`;

  const raw = await groqChat(prompt, 200);
  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return { language: 'English', confidence: 0.7, allLanguages: { English: 0.7, Spanish: 0.1, French: 0.05, German: 0.05, Other: 0.1 } };
  }
}

// ─── Keyword Extraction ───────────────────────────────────────────────────────

export async function extractKeywords(text: string, count: number = 10): Promise<string[]> {
  const prompt = `Extract the ${count} most important keywords from this text. Return ONLY a JSON array of strings.

Text: "${text.slice(0, 2000)}"

Example: ["keyword1","keyword2","keyword3"]`;

  const raw = await groqChat(prompt, 200);
  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return text.split(/\W+/).filter(w => w.length > 4).slice(0, count);
  }
}

// ─── Question Answering ───────────────────────────────────────────────────────

export interface QAResult {
  answer: string;
  confidence: number;
  startIndex?: number;
  endIndex?: number;
}

export async function answerQuestion(question: string, context: string): Promise<QAResult> {
  // Try HuggingFace QA model first
  try {
    const hfResult = await hf.questionAnswering({
      model: 'deepset/roberta-base-squad2',
      inputs: { question, context: context.slice(0, 512) },
    });
    return { answer: hfResult.answer, confidence: hfResult.score, startIndex: hfResult.start, endIndex: hfResult.end };
  } catch {
    // fall through to Groq
  }

  const prompt = `Answer the question based only on the context provided. If the answer is not in the context, say "The answer is not found in the provided context."

Context:
${context.slice(0, 3000)}

Question: ${question}

Answer:`;

  const answer = await groqChat(prompt, 400);
  return { answer: answer || 'Unable to find an answer.', confidence: 0.8 };
}

// ─── Text Translation ─────────────────────────────────────────────────────────

export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const prompt = `Translate the following text to ${targetLanguage}. Return only the translation, no explanation.

Text: "${text.slice(0, 2000)}"`;

  return (await groqChat(prompt, 1000)) || 'Translation unavailable.';
}
