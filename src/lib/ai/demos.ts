import { aiClient, hf } from './providers';
import { aiConfig } from './config';
import { z } from 'zod';

// Sentiment Analysis
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
  try {
    // Try using Hugging Face sentiment model first
    const hfResult = await hf.textClassification({
      model: 'nlptown/bert-base-multilingual-uncased-sentiment',
      inputs: text
    });
    
    // Convert 5-star rating to sentiment
    const starRating = parseInt(hfResult[0].label.split(' ')[0]);
    let sentiment: 'positive' | 'negative' | 'neutral';
    if (starRating >= 4) sentiment = 'positive';
    else if (starRating <= 2) sentiment = 'negative';
    else sentiment = 'neutral';
    
    // Try emotion analysis with another model
    let emotions = {
      joy: 0.2,
      sadness: 0.2,
      anger: 0.2,
      fear: 0.2,
      surprise: 0.2,
    };
    
    // Estimate emotions based on star rating
    if (sentiment === 'positive') {
      emotions.joy = 0.7;
      emotions.surprise = 0.3;
    } else if (sentiment === 'negative') {
      emotions.sadness = 0.5;
      emotions.anger = 0.3;
      emotions.fear = 0.2;
    }
    
    return {
      sentiment,
      confidence: hfResult[0].score,
      emotions
    };
  } catch (hfError) {
    console.log('HF sentiment failed, using fallback:', hfError);
    
    // Fallback to AI client
    const prompt = `Analyze the sentiment of the following text and provide a detailed breakdown:

Text: "${text}"

Please respond with a JSON object in the following format:
{
  "sentiment": "positive" | "negative" | "neutral",
  "confidence": 0.0-1.0,
  "emotions": {
    "joy": 0.0-1.0,
    "sadness": 0.0-1.0,
    "anger": 0.0-1.0,
    "fear": 0.0-1.0,
    "surprise": 0.0-1.0
  }
}`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      maxTokens: 500,
    });

    let responseContent: string;
    if ('choices' in response && response.choices) {
      responseContent = response.choices?.[0]?.message?.content || '';
    } else if ('content' in response) {
      responseContent = Array.isArray(response.content) 
        ? (response.content[0] && 'text' in response.content[0] ? response.content[0].text : '')
        : response.content;
    } else {
      responseContent = (response as any).generated_text || (response as any).response || '';
    }

    try {
      return JSON.parse(responseContent);
    } catch (error) {
      // Fallback parsing
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        emotions: {
          joy: 0.2,
          sadness: 0.2,
          anger: 0.2,
          fear: 0.2,
          surprise: 0.2,
        },
      };
    }
  }
}

// Text Summarization
export interface SummaryOptions {
  length?: 'short' | 'medium' | 'long';
  style?: 'bullet-points' | 'paragraph' | 'executive';
}

export async function summarizeText(text: string, options: SummaryOptions = {}): Promise<string> {
  const { length = 'medium', style = 'paragraph' } = options;
  
  try {
    // Try using Hugging Face summarization model first
    let maxLength = 150;
    let minLength = 30;
    
    switch (length) {
      case 'short':
        maxLength = 50;
        minLength = 20;
        break;
      case 'medium':
        maxLength = 150;
        minLength = 50;
        break;
      case 'long':
        maxLength = 300;
        minLength = 100;
        break;
    }
    
    const hfResult = await hf.summarization({
      model: 'facebook/bart-large-cnn',
      inputs: text,
      parameters: {
        max_length: maxLength,
        min_length: minLength,
        do_sample: false
      }
    });
    
    let summary = hfResult.summary_text;
    
    // Format based on style
    if (style === 'bullet-points') {
      const sentences = summary.split('. ').filter(s => s.trim());
      summary = sentences.map(s => `• ${s.trim()}${s.endsWith('.') ? '' : '.'}`).join('\n');
    } else if (style === 'executive') {
      summary = `Executive Summary:\n\n${summary}\n\nKey Takeaway: ${summary.split('.')[0]}.`;
    }
    
    return summary;
  } catch (hfError) {
    console.log('HF summarization failed, using fallback:', hfError);
    
    // Fallback to AI client
    let lengthInstruction = '';
    switch (length) {
      case 'short':
        lengthInstruction = 'in 1-2 sentences';
        break;
      case 'medium':
        lengthInstruction = 'in 3-5 sentences';
        break;
      case 'long':
        lengthInstruction = 'in a comprehensive paragraph';
        break;
    }

    let styleInstruction = '';
    switch (style) {
      case 'bullet-points':
        styleInstruction = 'Format the summary as bullet points.';
        break;
      case 'paragraph':
        styleInstruction = 'Format the summary as a coherent paragraph.';
        break;
      case 'executive':
        styleInstruction = 'Format as an executive summary with key takeaways.';
        break;
    }

    const prompt = `Summarize the following text ${lengthInstruction}. ${styleInstruction}

Text: "${text}"

Summary:`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: 1000,
    });

    let responseContent: string;
    if ('choices' in response && response.choices) {
      responseContent = response.choices?.[0]?.message?.content || '';
    } else if ('content' in response) {
      responseContent = Array.isArray(response.content) 
        ? (response.content[0] && 'text' in response.content[0] ? response.content[0].text : '')
        : response.content;
    } else {
      responseContent = (response as any).generated_text || (response as any).response || '';
    }

    return responseContent.trim();
  }
}

// NLP Entity Extraction
export interface Entity {
  text: string;
  type: 'PERSON' | 'ORG' | 'GPE' | 'DATE' | 'MONEY' | 'PERCENT' | 'EMAIL' | 'URL' | 'PHONE';
  confidence: number;
  startIndex: number;
  endIndex: number;
}

export async function extractEntities(text: string): Promise<Entity[]> {
  try {
    // Try using Hugging Face NER model first
    const hfResult = await hf.tokenClassification({
      model: 'dbmdz/bert-large-cased-finetuned-conll03-english',
      inputs: text
    });
    
    // Convert HF results to our Entity format
    const entities: Entity[] = hfResult.map((entity: any) => {
      // Map HF entity types to our types
      let type: Entity['type'] = 'ORG';
      switch (entity.entity_group) {
        case 'PER':
          type = 'PERSON';
          break;
        case 'ORG':
          type = 'ORG';
          break;
        case 'LOC':
        case 'GPE':
          type = 'GPE';
          break;
        case 'MISC':
          // Check if it's a date, money, or percent
          if (/\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}/.test(entity.word)) {
            type = 'DATE';
          } else if (/\$|€|£|¥/.test(entity.word)) {
            type = 'MONEY';
          } else if (/%/.test(entity.word)) {
            type = 'PERCENT';
          } else {
            type = 'ORG';
          }
          break;
      }
      
      return {
        text: entity.word,
        type,
        confidence: entity.score,
        startIndex: entity.start || 0,
        endIndex: entity.end || entity.word.length
      };
    });
    
    // Also check for emails, URLs, and phone numbers using regex
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
    const phoneRegex = /(\+\d{1,3}[-.\s]?)?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g;
    
    let match;
    while ((match = emailRegex.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'EMAIL',
        confidence: 0.95,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
    
    while ((match = urlRegex.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'URL',
        confidence: 0.95,
        startIndex: match.index,
        endIndex: match.index + match[0].length
      });
    }
    
    while ((match = phoneRegex.exec(text)) !== null) {
      if (match[0].length >= 10) { // Basic phone number validation
        entities.push({
          text: match[0],
          type: 'PHONE',
          confidence: 0.85,
          startIndex: match.index,
          endIndex: match.index + match[0].length
        });
      }
    }
    
    return entities;
  } catch (hfError) {
    console.log('HF NER failed, using fallback:', hfError);
    
    // Fallback to AI client
    const prompt = `Extract named entities from the following text. Identify persons, organizations, locations, dates, monetary amounts, percentages, emails, URLs, and phone numbers.

Text: "${text}"

Please respond with a JSON array of entities in the following format:
[
  {
    "text": "extracted text",
    "type": "PERSON|ORG|GPE|DATE|MONEY|PERCENT|EMAIL|URL|PHONE",
    "confidence": 0.0-1.0,
    "startIndex": number,
    "endIndex": number
  }
]`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      maxTokens: 1000,
    });

    let responseContent: string;
    if ('choices' in response && response.choices) {
      responseContent = response.choices?.[0]?.message?.content || '';
    } else if ('content' in response) {
      responseContent = Array.isArray(response.content) 
        ? (response.content[0] && 'text' in response.content[0] ? response.content[0].text : '')
        : response.content;
    } else {
      responseContent = (response as any).generated_text || (response as any).response || '';
    }

    try {
      return JSON.parse(responseContent);
    } catch (error) {
      console.error('Entity extraction parsing error:', error);
      return [];
    }
  }
}

// Text Classification
export interface ClassificationResult {
  category: string;
  confidence: number;
  allScores: { [category: string]: number };
}

export async function classifyText(text: string, categories: string[]): Promise<ClassificationResult> {
  const prompt = `Classify the following text into one of these categories: ${categories.join(', ')}

Text: "${text}"

Please respond with a JSON object in the following format:
{
  "category": "most likely category",
  "confidence": 0.0-1.0,
  "allScores": {
    ${categories.map(cat => `"${cat}": 0.0-1.0`).join(',\n    ')}
  }
}`;

  const response = await aiClient.chatCompletion({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    maxTokens: 500,
  });

  let responseContent: string;
  if ('choices' in response && response.choices) {
    responseContent = response.choices[0]?.message?.content || '';
  } else if ('content' in response) {
    responseContent = Array.isArray(response.content) 
      ? (response.content[0] && 'text' in response.content[0] ? response.content[0].text : '')
      : response.content;
  } else {
    responseContent = (response as any).generated_text || (response as any).response || '';
  }

  try {
    return JSON.parse(responseContent);
  } catch (error) {
    return {
      category: categories[0] || 'unknown',
      confidence: 0.5,
      allScores: Object.fromEntries(categories.map(cat => [cat, 1 / categories.length])),
    };
  }
}

// Language Detection
export interface LanguageResult {
  language: string;
  confidence: number;
  allLanguages: { [language: string]: number };
}

export async function detectLanguage(text: string): Promise<LanguageResult> {
  const prompt = `Detect the language of the following text:

Text: "${text}"

Please respond with a JSON object in the following format:
{
  "language": "language name (e.g., 'English', 'Spanish', 'French')",
  "confidence": 0.0-1.0,
  "allLanguages": {
    "English": 0.0-1.0,
    "Spanish": 0.0-1.0,
    "French": 0.0-1.0,
    "German": 0.0-1.0,
    "Other": 0.0-1.0
  }
}`;

  const response = await aiClient.chatCompletion({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    maxTokens: 300,
  });

  let responseContent: string;
  if ('choices' in response && response.choices) {
    responseContent = response.choices[0]?.message?.content || '';
  } else if ('content' in response) {
    responseContent = Array.isArray(response.content) 
      ? (response.content[0] && 'text' in response.content[0] ? response.content[0].text : '')
      : response.content;
  } else {
    responseContent = (response as any).generated_text || (response as any).response || '';
  }

  try {
    return JSON.parse(responseContent);
  } catch (error) {
    return {
      language: 'English',
      confidence: 0.5,
      allLanguages: {
        English: 0.5,
        Spanish: 0.1,
        French: 0.1,
        German: 0.1,
        Other: 0.2,
      },
    };
  }
}

// Keyword Extraction
export async function extractKeywords(text: string, count: number = 10): Promise<string[]> {
  const prompt = `Extract the top ${count} most important keywords from the following text:

Text: "${text}"

Please respond with a JSON array of keywords:
["keyword1", "keyword2", "keyword3", ...]`;

  const response = await aiClient.chatCompletion({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    maxTokens: 300,
  });

  let responseContent: string;
  if ('choices' in response && response.choices) {
    responseContent = response.choices[0]?.message?.content || '';
  } else if ('content' in response) {
    responseContent = Array.isArray(response.content) 
      ? (response.content[0] && 'text' in response.content[0] ? response.content[0].text : '')
      : response.content;
  } else {
    responseContent = (response as any).generated_text || (response as any).response || '';
  }

  try {
    return JSON.parse(responseContent);
  } catch (error) {
    // Fallback: extract words and return them
    return text.split(/\W+/)
      .filter(word => word.length > 3)
      .slice(0, count);
  }
}

// Question Answering
export interface QAResult {
  answer: string;
  confidence: number;
  startIndex?: number;
  endIndex?: number;
}

export async function answerQuestion(question: string, context: string): Promise<QAResult> {
  try {
    // Try using Hugging Face QA model first
    const hfResult = await hf.questionAnswering({
      model: 'deepset/roberta-base-squad2',
      inputs: {
        question: question,
        context: context
      }
    });
    
    return {
      answer: hfResult.answer,
      confidence: hfResult.score,
      startIndex: hfResult.start,
      endIndex: hfResult.end
    };
  } catch (hfError) {
    console.log('HF QA failed, using fallback:', hfError);
    
    // Fallback to AI client
    const prompt = `Based on the following context, answer the question. If the answer cannot be found in the context, say "I cannot find the answer in the provided context."

Context: "${context}"

Question: "${question}"

Answer:`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      maxTokens: 500,
    });

    let responseContent: string;
    if ('choices' in response && response.choices) {
      responseContent = response.choices?.[0]?.message?.content || '';
    } else if ('content' in response) {
      responseContent = Array.isArray(response.content) 
        ? (response.content[0] && 'text' in response.content[0] ? response.content[0].text : '')
        : response.content;
    } else {
      responseContent = (response as any).generated_text || (response as any).response || '';
    }

    return {
      answer: responseContent.trim(),
      confidence: 0.8 // Default confidence for fallback
    };
  }
}

// Text Translation
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  const prompt = `Translate the following text to ${targetLanguage}:

Text: "${text}"

Translation:`;

  const response = await aiClient.chatCompletion({
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.1,
    maxTokens: 1000,
  });

  let responseContent: string;
  if ('choices' in response && response.choices) {
    responseContent = response.choices[0]?.message?.content || '';
  } else if ('content' in response) {
    responseContent = Array.isArray(response.content) 
      ? (response.content[0] && 'text' in response.content[0] ? response.content[0].text : '')
      : response.content;
  } else {
    responseContent = (response as any).generated_text || (response as any).response || '';
  }

  return responseContent.trim();
}