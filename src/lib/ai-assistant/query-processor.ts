import { knowledgeBase, fallbackResponses, KnowledgeItem } from './knowledge-base';

export interface QueryResult {
  answer: string;
  confidence: number;
  source: string;
  relatedQuestions?: string[];
}

export class AIAssistantQueryProcessor {
  private normalizeText(text: string): string {
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private calculateSimilarity(query: string, item: KnowledgeItem): number {
    const normalizedQuery = this.normalizeText(query);
    const words = normalizedQuery.split(' ');
    
    let score = 0;
    const maxScore = words.length;

    // Check exact question match
    if (this.normalizeText(item.question).includes(normalizedQuery)) {
      score += maxScore * 2;
    }

    // Check keyword matches
    for (const keyword of item.keywords) {
      const normalizedKeyword = this.normalizeText(keyword);
      if (normalizedQuery.includes(normalizedKeyword) || normalizedKeyword.includes(normalizedQuery)) {
        score += maxScore * 1.5;
      }
    }

    // Check individual word matches
    for (const word of words) {
      if (word.length < 3) continue; // Skip short words
      
      // Check in question
      if (this.normalizeText(item.question).includes(word)) {
        score += 1;
      }
      
      // Check in keywords
      for (const keyword of item.keywords) {
        if (this.normalizeText(keyword).includes(word)) {
          score += 0.8;
        }
      }
      
      // Check in answer (lower weight)
      if (this.normalizeText(item.answer).includes(word)) {
        score += 0.3;
      }
    }

    return score / maxScore;
  }

  private getRelatedQuestions(category: string, excludeId: string): string[] {
    return knowledgeBase
      .filter(item => item.category === category && item.id !== excludeId)
      .slice(0, 3)
      .map(item => item.question);
  }

  public processQuery(query: string): QueryResult {
    if (!query.trim()) {
      return {
        answer: "Hello! I'm Videbimus AI's assistant. I can help you learn about our AI consulting services, team expertise, and how we can transform your business. What would you like to know?",
        confidence: 1.0,
        source: "greeting"
      };
    }

    // Find best matching knowledge base item
    const matches = knowledgeBase
      .map(item => ({
        item,
        score: this.calculateSimilarity(query, item)
      }))
      .filter(match => match.score > 0.1)
      .sort((a, b) => b.score - a.score);

    if (matches.length > 0 && matches[0].score > 0.5) {
      const bestMatch = matches[0].item;
      const confidence = Math.min(matches[0].score / 2, 0.95); // Cap at 95%

      return {
        answer: bestMatch.answer,
        confidence,
        source: bestMatch.id,
        relatedQuestions: this.getRelatedQuestions(bestMatch.category, bestMatch.id)
      };
    }

    // Medium confidence - provide fallback with suggestions
    if (matches.length > 0 && matches[0].score > 0.3) {
      const suggestedAnswers = matches.slice(0, 2).map(match => 
        `• ${match.item.question}`
      ).join('\n');

      return {
        answer: `I found some related information that might help:\n\n${suggestedAnswers}\n\nFor specific details about your question, please contact our team at consulting@videbimusai.com for a personalized consultation.`,
        confidence: 0.6,
        source: "partial_match"
      };
    }

    // No good match - provide random fallback
    const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    
    return {
      answer: randomFallback,
      confidence: 0.1,
      source: "fallback"
    };
  }

  public getQuickSuggestions(): string[] {
    const categories = [...new Set(knowledgeBase.map(item => item.category))];
    return categories.map(category => {
      const items = knowledgeBase.filter(item => item.category === category);
      return items[Math.floor(Math.random() * items.length)].question;
    }).slice(0, 6);
  }
}

export const queryProcessor = new AIAssistantQueryProcessor();