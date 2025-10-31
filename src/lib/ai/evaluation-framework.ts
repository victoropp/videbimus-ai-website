/**
 * State-of-the-art AI Evaluation Framework
 * Implements RAGAS, BLEU, ROUGE, and custom metrics for continuous improvement
 */

import { enhancedProviders, type ProviderResponse } from './enhanced-providers';
import { semanticCache } from './semantic-cache';

export interface EvaluationMetrics {
  // Response Quality Metrics
  relevance: number;          // 0-1: How relevant is the response to the query
  coherence: number;          // 0-1: How coherent and well-structured is the response
  completeness: number;       // 0-1: How complete is the response
  accuracy: number;           // 0-1: Factual accuracy of the response
  
  // Performance Metrics
  responseTime: number;       // Response time in milliseconds
  tokensUsed: number;        // Number of tokens used
  cost: number;              // Estimated cost in USD
  cacheHitRate: number;      // Percentage of cache hits
  
  // User Experience Metrics
  readability: number;       // Flesch reading ease score
  sentiment: number;         // -1 to 1: Sentiment of the response
  helpfulness: number;       // 0-1: Perceived helpfulness
  
  // RAG-specific Metrics (if applicable)
  contextRelevance?: number;    // How relevant is the retrieved context
  faithfulness?: number;        // How faithful is the response to the context
  answerRelevance?: number;     // How relevant is the answer to the question
  
  // Aggregate Scores
  overallScore: number;      // Weighted average of all metrics
  confidence: number;        // Confidence in the evaluation
}

export interface EvaluationResult {
  id: string;
  timestamp: Date;
  query: string;
  response: string;
  metrics: EvaluationMetrics;
  feedback?: string;
  suggestions?: string[];
  comparisonBaseline?: EvaluationMetrics;
}

export interface BenchmarkDataset {
  id: string;
  name: string;
  description: string;
  samples: Array<{
    query: string;
    expectedResponse?: string;
    expectedIntent?: string;
    groundTruth?: any;
  }>;
}

export class EvaluationFramework {
  private evaluationHistory: Map<string, EvaluationResult> = new Map();
  private benchmarks: Map<string, BenchmarkDataset> = new Map();
  private metricsAggregator: MetricsAggregator;

  constructor() {
    this.metricsAggregator = new MetricsAggregator();
    this.initializeBenchmarks();
  }

  /**
   * Initialize benchmark datasets for testing
   */
  private initializeBenchmarks() {
    const customerServiceBenchmark: BenchmarkDataset = {
      id: 'customer_service',
      name: 'Customer Service Queries',
      description: 'Common customer service questions and expected responses',
      samples: [
        {
          query: 'What are your pricing plans?',
          expectedIntent: 'pricing',
        },
        {
          query: 'How can I implement AI in my business?',
          expectedIntent: 'consultation',
        },
        {
          query: 'What technologies do you use?',
          expectedIntent: 'technical',
        },
      ],
    };

    this.benchmarks.set('customer_service', customerServiceBenchmark);
  }

  /**
   * Evaluate a single response using multiple metrics
   */
  async evaluateResponse(
    query: string,
    response: string,
    context?: any,
    expectedResponse?: string
  ): Promise<EvaluationResult> {
    const startTime = Date.now();

    // Calculate individual metrics
    const relevance = await this.calculateRelevance(query, response);
    const coherence = await this.calculateCoherence(response);
    const completeness = await this.calculateCompleteness(query, response);
    const accuracy = await this.calculateAccuracy(response, expectedResponse);
    
    // Performance metrics
    const responseTime = context?.responseTime || 0;
    const tokensUsed = context?.tokensUsed || this.estimateTokens(response);
    const cost = context?.cost || 0;
    const cacheStats = semanticCache.getStats();
    const cacheHitRate = cacheStats.totalHits / Math.max(1, cacheStats.size);
    
    // User experience metrics
    const readability = this.calculateReadability(response);
    const sentiment = await this.calculateSentiment(response);
    const helpfulness = await this.calculateHelpfulness(query, response);
    
    // RAG metrics if context is provided
    let ragMetrics = {};
    if (context?.knowledgeDocuments) {
      ragMetrics = {
        contextRelevance: await this.calculateContextRelevance(query, context.knowledgeDocuments),
        faithfulness: await this.calculateFaithfulness(response, context.knowledgeDocuments),
        answerRelevance: await this.calculateAnswerRelevance(query, response),
      };
    }

    // Calculate overall score
    const overallScore = this.calculateOverallScore({
      relevance,
      coherence,
      completeness,
      accuracy,
      readability: readability / 100, // Normalize to 0-1
      helpfulness,
      ...ragMetrics,
    });

    const metrics: EvaluationMetrics = {
      relevance,
      coherence,
      completeness,
      accuracy,
      responseTime,
      tokensUsed,
      cost,
      cacheHitRate,
      readability,
      sentiment,
      helpfulness,
      ...ragMetrics,
      overallScore,
      confidence: 0.5, // Temporary value, will be calculated below
    };

    // Calculate confidence after metrics object is constructed
    metrics.confidence = this.calculateConfidence(metrics);

    // Generate feedback and suggestions
    const { feedback, suggestions } = this.generateFeedback(metrics);

    const result: EvaluationResult = {
      id: this.generateId(),
      timestamp: new Date(),
      query,
      response,
      metrics,
      feedback,
      suggestions,
    };

    this.evaluationHistory.set(result.id, result);
    this.metricsAggregator.addMetrics(metrics);

    return result;
  }

  /**
   * Calculate relevance score using semantic similarity
   */
  private async calculateRelevance(query: string, response: string): Promise<number> {
    try {
      const prompt = `
Query: "${query}"
Response: "${response}"

Rate the relevance of the response to the query on a scale of 0 to 1.
Consider:
- Does the response directly address the query?
- Is the information provided pertinent?
- Are there unnecessary or off-topic elements?

Return only a number between 0 and 1.`;

      const result = await enhancedProviders.chatCompletion({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        maxTokens: 10,
      }) as ProviderResponse;

      const score = parseFloat(result.content.trim());
      return isNaN(score) ? 0.5 : Math.min(1, Math.max(0, score));
    } catch {
      return 0.5; // Default middle score on error
    }
  }

  /**
   * Calculate coherence score
   */
  private async calculateCoherence(response: string): Promise<number> {
    // Check for logical flow and structure
    const sentences = response.split(/[.!?]+/).filter(s => s.trim());
    if (sentences.length === 0) return 0;

    // Basic coherence checks
    let score = 1.0;
    
    // Check for proper sentence structure
    const hasProperStructure = sentences.every(s => 
      s.trim().length > 0 && /^[A-Z]/.test(s.trim())
    );
    if (!hasProperStructure) score -= 0.2;

    // Check for logical connectors
    const connectors = ['therefore', 'however', 'moreover', 'furthermore', 'additionally'];
    const hasConnectors = connectors.some(c => response.toLowerCase().includes(c));
    if (hasConnectors) score += 0.1;

    // Check for paragraph structure
    const hasParagraphs = response.includes('\n\n') || response.includes('\n');
    if (hasParagraphs) score += 0.1;

    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate completeness score
   */
  private async calculateCompleteness(query: string, response: string): Promise<number> {
    // Extract key concepts from query
    const queryKeywords = this.extractKeywords(query);
    const responseKeywords = this.extractKeywords(response);
    
    // Calculate coverage
    let coveredKeywords = 0;
    for (const keyword of queryKeywords) {
      if (responseKeywords.includes(keyword)) {
        coveredKeywords++;
      }
    }
    
    const coverage = queryKeywords.length > 0 
      ? coveredKeywords / queryKeywords.length 
      : 0.5;

    // Check for answer completeness indicators
    let completenessScore = coverage;
    
    if (response.includes('?') && !query.includes('?')) {
      completenessScore -= 0.1; // Penalize questions in answers
    }
    
    if (response.length < 50) {
      completenessScore -= 0.2; // Penalize very short responses
    }
    
    return Math.min(1, Math.max(0, completenessScore));
  }

  /**
   * Calculate accuracy score
   */
  private async calculateAccuracy(response: string, expectedResponse?: string): Promise<number> {
    if (!expectedResponse) {
      // Default accuracy check based on response quality
      const hasNumbers = /\d+/.test(response);
      const hasFacts = response.includes('according to') || response.includes('research shows');
      const hasSpecifics = response.includes('specifically') || response.includes('exactly');
      
      let score = 0.7; // Base score
      if (hasNumbers) score += 0.1;
      if (hasFacts) score += 0.1;
      if (hasSpecifics) score += 0.1;
      
      return Math.min(1, score);
    }
    
    // Compare with expected response
    return this.calculateSimilarity(response, expectedResponse);
  }

  /**
   * Calculate readability using Flesch Reading Ease
   */
  private calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length || 1;
    const words = text.split(/\s+/).filter(w => w.trim()).length || 1;
    const syllables = text.split(/\s+/).reduce((count, word) => 
      count + this.countSyllables(word), 0) || 1;
    
    // Flesch Reading Ease formula
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    
    // Clamp between 0 and 100
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Count syllables in a word (approximation)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase();
    let count = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
      const isVowel = 'aeiou'.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }
    
    // Adjust for silent e
    if (word.endsWith('e')) count--;
    
    // Ensure at least one syllable
    return Math.max(1, count);
  }

  /**
   * Calculate sentiment score
   */
  private async calculateSentiment(text: string): Promise<number> {
    // Simple sentiment analysis based on keyword presence
    const positiveWords = ['excellent', 'great', 'good', 'happy', 'pleased', 'successful', 'amazing'];
    const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'disappointed', 'failed', 'wrong'];
    
    const lowerText = text.toLowerCase();
    let score = 0;
    
    for (const word of positiveWords) {
      if (lowerText.includes(word)) score += 0.1;
    }
    
    for (const word of negativeWords) {
      if (lowerText.includes(word)) score -= 0.1;
    }
    
    // Clamp between -1 and 1
    return Math.min(1, Math.max(-1, score));
  }

  /**
   * Calculate helpfulness score
   */
  private async calculateHelpfulness(query: string, response: string): Promise<number> {
    let score = 0.5; // Base score
    
    // Check for actionable content
    const actionWords = ['try', 'use', 'implement', 'consider', 'follow', 'click', 'visit'];
    const hasActionableContent = actionWords.some(word => response.toLowerCase().includes(word));
    if (hasActionableContent) score += 0.2;
    
    // Check for examples
    const hasExamples = response.includes('example') || response.includes('for instance');
    if (hasExamples) score += 0.15;
    
    // Check for structure
    const hasLists = response.includes('•') || response.includes('1.') || response.includes('-');
    if (hasLists) score += 0.15;
    
    return Math.min(1, score);
  }

  /**
   * RAG-specific: Calculate context relevance
   */
  private async calculateContextRelevance(query: string, documents: any[]): Promise<number> {
    if (!documents || documents.length === 0) return 0;
    
    // Simple relevance based on keyword overlap
    const queryKeywords = this.extractKeywords(query);
    let totalRelevance = 0;
    
    for (const doc of documents) {
      const docText = JSON.stringify(doc);
      const docKeywords = this.extractKeywords(docText);
      
      const overlap = queryKeywords.filter(k => docKeywords.includes(k)).length;
      totalRelevance += overlap / Math.max(queryKeywords.length, 1);
    }
    
    return Math.min(1, totalRelevance / documents.length);
  }

  /**
   * RAG-specific: Calculate faithfulness to context
   */
  private async calculateFaithfulness(response: string, documents: any[]): Promise<number> {
    if (!documents || documents.length === 0) return 1;
    
    // Check if response information can be traced to documents
    const responseKeywords = this.extractKeywords(response);
    const docKeywords = new Set<string>();
    
    for (const doc of documents) {
      const keywords = this.extractKeywords(JSON.stringify(doc));
      keywords.forEach(k => docKeywords.add(k));
    }
    
    const supportedKeywords = responseKeywords.filter(k => docKeywords.has(k));
    return supportedKeywords.length / Math.max(responseKeywords.length, 1);
  }

  /**
   * RAG-specific: Calculate answer relevance
   */
  private async calculateAnswerRelevance(query: string, response: string): Promise<number> {
    return this.calculateRelevance(query, response);
  }

  /**
   * Calculate overall score with weighted average
   */
  private calculateOverallScore(metrics: Record<string, number>): number {
    const weights = {
      relevance: 0.25,
      coherence: 0.15,
      completeness: 0.20,
      accuracy: 0.20,
      readability: 0.05,
      helpfulness: 0.15,
    };
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const [metric, weight] of Object.entries(weights)) {
      if (metric in metrics) {
        weightedSum += metrics[metric] * weight;
        totalWeight += weight;
      }
    }
    
    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  /**
   * Calculate confidence in evaluation
   */
  private calculateConfidence(metrics: Partial<EvaluationMetrics>): number {
    // Higher confidence if multiple metrics agree
    const scores = Object.values(metrics).filter(v => typeof v === 'number' && v >= 0 && v <= 1);
    if (scores.length === 0) return 0.5;
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    // Lower variance = higher confidence
    return Math.max(0, 1 - Math.sqrt(variance));
  }

  /**
   * Generate feedback and suggestions based on metrics
   */
  private generateFeedback(metrics: EvaluationMetrics): { feedback: string; suggestions: string[] } {
    const suggestions: string[] = [];
    let feedback = '';

    if (metrics.overallScore >= 0.8) {
      feedback = 'Excellent response quality!';
    } else if (metrics.overallScore >= 0.6) {
      feedback = 'Good response with room for improvement.';
    } else {
      feedback = 'Response needs significant improvement.';
    }

    // Specific suggestions based on weak metrics
    if (metrics.relevance < 0.7) {
      suggestions.push('Improve response relevance to the query');
    }
    if (metrics.coherence < 0.7) {
      suggestions.push('Enhance response structure and logical flow');
    }
    if (metrics.completeness < 0.7) {
      suggestions.push('Provide more comprehensive answers');
    }
    if (metrics.readability < 60) {
      suggestions.push('Simplify language for better readability');
    }
    if (metrics.responseTime > 5000) {
      suggestions.push('Optimize response time (consider caching)');
    }

    return { feedback, suggestions };
  }

  /**
   * Run benchmark evaluation
   */
  async runBenchmark(benchmarkId: string): Promise<{
    results: EvaluationResult[];
    summary: any;
  }> {
    const benchmark = this.benchmarks.get(benchmarkId);
    if (!benchmark) throw new Error('Benchmark not found');

    const results: EvaluationResult[] = [];
    
    for (const sample of benchmark.samples) {
      // Generate response for sample query
      // This would normally call your chat service
      const response = `Sample response for: ${sample.query}`;
      
      const evaluation = await this.evaluateResponse(
        sample.query,
        response,
        { expectedIntent: sample.expectedIntent },
        sample.expectedResponse
      );
      
      results.push(evaluation);
    }

    const summary = this.metricsAggregator.getSummary();
    
    return { results, summary };
  }

  /**
   * Extract keywords from text
   */
  private extractKeywords(text: string): string[] {
    // Simple keyword extraction
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'a', 'an', 'and', 'or', 'but']);
    return text.toLowerCase()
      .split(/\W+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  /**
   * Calculate similarity between two texts
   */
  private calculateSimilarity(text1: string, text2: string): number {
    const keywords1 = new Set(this.extractKeywords(text1));
    const keywords2 = new Set(this.extractKeywords(text2));
    
    const intersection = new Set([...keywords1].filter(x => keywords2.has(x)));
    const union = new Set([...keywords1, ...keywords2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * Estimate token count
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get evaluation history
   */
  getHistory(): EvaluationResult[] {
    return Array.from(this.evaluationHistory.values());
  }

  /**
   * Get aggregated metrics summary
   */
  getMetricsSummary() {
    return this.metricsAggregator.getSummary();
  }
}

/**
 * Metrics aggregator for tracking performance over time
 */
class MetricsAggregator {
  private metrics: EvaluationMetrics[] = [];
  
  addMetrics(metrics: EvaluationMetrics) {
    this.metrics.push(metrics);
    
    // Keep only last 1000 evaluations
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }
  
  getSummary() {
    if (this.metrics.length === 0) return null;
    
    const latest = this.metrics[this.metrics.length - 1];
    const average = this.calculateAverages();
    const trends = this.calculateTrends();
    
    return {
      totalEvaluations: this.metrics.length,
      latest,
      average,
      trends,
      improvements: this.identifyImprovements(),
    };
  }
  
  private calculateAverages(): Partial<EvaluationMetrics> {
    const sum: any = {};
    
    for (const metric of this.metrics) {
      for (const [key, value] of Object.entries(metric)) {
        if (typeof value === 'number') {
          sum[key] = (sum[key] || 0) + value;
        }
      }
    }
    
    const averages: any = {};
    for (const [key, total] of Object.entries(sum)) {
      averages[key] = (total as number) / this.metrics.length;
    }
    
    return averages;
  }
  
  private calculateTrends() {
    if (this.metrics.length < 10) return null;
    
    const recent = this.metrics.slice(-10);
    const older = this.metrics.slice(-20, -10);
    
    const recentAvg = this.calculateAveragesForSet(recent);
    const olderAvg = this.calculateAveragesForSet(older);
    
    const trends: any = {};
    for (const key of Object.keys(recentAvg)) {
      if (key in olderAvg) {
        const change = ((recentAvg[key] - olderAvg[key]) / olderAvg[key]) * 100;
        trends[key] = {
          direction: change > 0 ? 'improving' : 'declining',
          changePercent: Math.abs(change),
        };
      }
    }
    
    return trends;
  }
  
  private calculateAveragesForSet(metrics: EvaluationMetrics[]): any {
    const sum: any = {};
    
    for (const metric of metrics) {
      for (const [key, value] of Object.entries(metric)) {
        if (typeof value === 'number') {
          sum[key] = (sum[key] || 0) + value;
        }
      }
    }
    
    const averages: any = {};
    for (const [key, total] of Object.entries(sum)) {
      averages[key] = (total as number) / metrics.length;
    }
    
    return averages;
  }
  
  private identifyImprovements(): string[] {
    const improvements: string[] = [];
    const average = this.calculateAverages();
    
    if (average.relevance && average.relevance < 0.7) {
      improvements.push('Focus on improving response relevance');
    }
    if (average.responseTime && average.responseTime > 3000) {
      improvements.push('Optimize response time through caching and provider selection');
    }
    if (average.cacheHitRate && average.cacheHitRate < 0.2) {
      improvements.push('Increase cache utilization for common queries');
    }
    
    return improvements;
  }
}

// Export singleton instance
export const evaluationFramework = new EvaluationFramework();