import { aiClient } from './providers';
import { vectorStore } from './vector-store';

export interface UserProfile {
  userId: string;
  interests: string[];
  behavior: {
    viewedContent: string[];
    searchHistory: string[];
    interactions: { [contentId: string]: number };
  };
  demographics?: {
    age?: number;
    location?: string;
    profession?: string;
  };
}

export interface ContentItem {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  content: string;
  metadata: {
    author?: string;
    publishDate?: Date;
    readTime?: number;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
  };
}

export interface Recommendation {
  contentId: string;
  score: number;
  reason: string;
  confidence: number;
  content: ContentItem;
}

export class RecommendationEngine {
  async generateRecommendations(
    userProfile: UserProfile,
    availableContent: ContentItem[],
    limit: number = 5
  ): Promise<Recommendation[]> {
    // Combine user interests and recent behavior to create a user query
    const userQuery = this.buildUserQuery(userProfile);
    
    // Use vector similarity to find relevant content
    const similarContent = await vectorStore.similaritySearch(userQuery, limit * 2);
    
    // Filter out already viewed content
    const unseenContent = similarContent.filter(item => 
      !userProfile.behavior.viewedContent.includes(item.id)
    );
    
    // Use AI to generate personalized recommendations with reasoning
    const recommendations = await this.rankAndExplainRecommendations(
      userProfile,
      unseenContent,
      availableContent
    );
    
    return recommendations.slice(0, limit);
  }

  private buildUserQuery(profile: UserProfile): string {
    const interests = profile.interests.join(', ');
    const recentSearches = profile.behavior.searchHistory.slice(-5).join(', ');
    
    return `User interests: ${interests}. Recent searches: ${recentSearches}`;
  }

  private async rankAndExplainRecommendations(
    profile: UserProfile,
    candidateContent: any[],
    allContent: ContentItem[]
  ): Promise<Recommendation[]> {
    const prompt = `Given this user profile:
- Interests: ${profile.interests.join(', ')}
- Recent searches: ${profile.behavior.searchHistory.slice(-3).join(', ')}
- Demographics: ${JSON.stringify(profile.demographics || {})}

And these candidate content items:
${candidateContent.map((item, i) => `${i + 1}. ${item.content.slice(0, 200)}...`).join('\n')}

Generate personalized recommendations. For each recommendation, provide:
1. A relevance score (0-100)
2. A confidence level (0-100)
3. A brief explanation of why this content matches the user's interests

Respond in JSON format:
{
  "recommendations": [
    {
      "contentIndex": number,
      "score": number,
      "confidence": number,
      "reason": "explanation"
    }
  ]
}`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: 1000,
    });

    let responseContent: string;
    if ('choices' in response) {
      responseContent = response.choices[0]?.message?.content || '';
    } else if ('content' in response) {
      responseContent = Array.isArray(response.content) 
        ? (response.content[0] && 'text' in response.content[0] ? response.content[0].text : '')
        : response.content;
    } else {
      responseContent = (response as any).generated_text || (response as any).response || '';
    }

    try {
      const aiRecommendations = JSON.parse(responseContent);
      
      return aiRecommendations.recommendations.map((rec: any) => {
        const contentItem = candidateContent[rec.contentIndex];
        const fullContent = allContent.find(c => c.id === contentItem.id);
        
        return {
          contentId: contentItem.id,
          score: rec.score / 100,
          reason: rec.reason,
          confidence: rec.confidence / 100,
          content: fullContent || this.createContentFromVector(contentItem),
        };
      });
    } catch (error) {
      console.error('Failed to parse AI recommendations:', error);
      // Fallback to similarity-based recommendations
      return candidateContent.slice(0, 5).map((item, index) => ({
        contentId: item.id,
        score: item.score || 0.7,
        reason: 'Content matches your interests and search history',
        confidence: 0.6,
        content: allContent.find(c => c.id === item.id) || this.createContentFromVector(item),
      }));
    }
  }

  private createContentFromVector(vectorItem: any): ContentItem {
    return {
      id: vectorItem.id,
      title: vectorItem.metadata?.title || 'Untitled',
      description: vectorItem.content.slice(0, 200) + '...',
      category: vectorItem.metadata?.category || 'general',
      tags: vectorItem.metadata?.tags || [],
      content: vectorItem.content,
      metadata: {
        author: vectorItem.metadata?.author,
        publishDate: vectorItem.metadata?.publishDate ? new Date(vectorItem.metadata.publishDate) : undefined,
        readTime: Math.ceil(vectorItem.content.length / 1000),
        difficulty: vectorItem.metadata?.difficulty || 'intermediate',
      },
    };
  }

  async trackUserInteraction(userId: string, contentId: string, interactionType: 'view' | 'like' | 'share' | 'comment') {
    // This would typically update a database
    // For now, we'll just return the interaction weight
    const weights = {
      view: 1,
      like: 3,
      share: 5,
      comment: 4,
    };

    return weights[interactionType];
  }

  async updateUserProfile(userId: string, newInterests: string[], newBehavior?: Partial<UserProfile['behavior']>) {
    // This would typically update a database
    // Return updated profile structure
    return {
      userId,
      interests: newInterests,
      behavior: newBehavior || {
        viewedContent: [],
        searchHistory: [],
        interactions: {},
      },
    };
  }

  async generateContentTags(content: string): Promise<string[]> {
    const prompt = `Analyze the following content and generate 5-8 relevant tags that categorize its main topics, themes, and subjects:

Content: "${content}"

Return only the tags as a JSON array: ["tag1", "tag2", "tag3", ...]`;

    const response = await aiClient.chatCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      maxTokens: 200,
    });

    let responseContent: string;
    if ('choices' in response) {
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
      // Fallback to basic keyword extraction
      return content.split(/\W+/)
        .filter(word => word.length > 4)
        .slice(0, 8);
    }
  }

  async analyzeTrendingTopics(contents: ContentItem[], timeWindow: number = 7): Promise<string[]> {
    // Analyze recent content to identify trending topics
    const recentContent = contents.filter(c => {
      if (!c.metadata.publishDate) return false;
      const daysAgo = (Date.now() - c.metadata.publishDate.getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= timeWindow;
    });

    if (recentContent.length === 0) return [];

    const allTags = recentContent.flatMap(c => c.tags);
    const tagFrequency: { [tag: string]: number } = {};

    allTags.forEach(tag => {
      tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
    });

    return Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }
}

// Default recommendation engine instance
export const recommendationEngine = new RecommendationEngine();