import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { recommendationEngine, UserProfile, ContentItem } from '@/lib/ai/recommendations';
import { getServerSession } from '@/auth';

// Helper function for safe integer parsing
const parsePositiveInt = (value: string | null, defaultValue: number): number => {
  const parsed = parseInt(value || String(defaultValue));
  return Number.isNaN(parsed) || parsed < 1 ? defaultValue : parsed;
};

const recommendationRequestSchema = z.object({
  userProfile: z.object({
    userId: z.string(),
    interests: z.array(z.string()),
    behavior: z.object({
      viewedContent: z.array(z.string()),
      searchHistory: z.array(z.string()),
      interactions: z.record(z.number()),
    }),
    demographics: z.object({
      age: z.number().optional(),
      location: z.string().optional(),
      profession: z.string().optional(),
    }).optional(),
  }),
  availableContent: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()),
    content: z.string(),
    metadata: z.object({
      author: z.string().optional(),
      publishDate: z.coerce.date().optional(),
      readTime: z.number().optional(),
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    }),
  })),
  limit: z.number().min(1).max(20).default(5),
});

const interactionSchema = z.object({
  userId: z.string(),
  contentId: z.string(),
  interactionType: z.enum(['view', 'like', 'share', 'comment']),
});

// Get recommendations
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userProfile, availableContent, limit } = recommendationRequestSchema.parse(body);

    // Fix the type compatibility issues
    const fixedUserProfile: UserProfile = {
      userId: userProfile.userId,
      interests: userProfile.interests,
      behavior: {
        viewedContent: userProfile.behavior?.viewedContent || [],
        searchHistory: userProfile.behavior?.searchHistory || [],
        interactions: userProfile.behavior?.interactions || {}
      },
      ...(userProfile.demographics && { 
        demographics: Object.fromEntries(
          Object.entries(userProfile.demographics).filter(([_, value]) => value !== undefined)
        ) as { age?: number; location?: string; profession?: string; }
      })
    };

    // Fix the availableContent type compatibility issue with exactOptionalPropertyTypes
    const fixedAvailableContent: ContentItem[] = availableContent.map(content => ({
      id: content.id,
      title: content.title,
      description: content.description,
      category: content.category,
      tags: content.tags,
      content: content.content,
      metadata: Object.fromEntries(
        Object.entries(content.metadata).filter(([_, value]) => value !== undefined)
      ) as {
        author?: string;
        publishDate?: Date;
        readTime?: number;
        difficulty?: 'beginner' | 'intermediate' | 'advanced';
      }
    }));

    const recommendations = await recommendationEngine.generateRecommendations(
      fixedUserProfile,
      fixedAvailableContent,
      limit
    );

    return NextResponse.json({
      recommendations,
      userProfile: {
        userId: userProfile.userId,
        interests: userProfile.interests,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

// Track user interaction
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { userId, contentId, interactionType } = interactionSchema.parse(body);

    // Ensure user can only track their own interactions
    if (userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const weight = await recommendationEngine.trackUserInteraction(
      userId,
      contentId,
      interactionType
    );

    return NextResponse.json({
      success: true,
      interactionWeight: weight,
    });
  } catch (error) {
    console.error('Track interaction error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to track interaction' },
      { status: 500 }
    );
  }
}

// Get trending topics
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const timeWindowDays = Math.min(parsePositiveInt(searchParams.get('timeWindow'), 7), 90);

    // Mock content for trending analysis
    const mockContent = [
      {
        id: '1',
        title: 'AI in Healthcare',
        description: 'Latest developments in AI for healthcare',
        category: 'Healthcare',
        tags: ['AI', 'healthcare', 'machine learning', 'diagnosis'],
        content: 'AI is revolutionizing healthcare...',
        metadata: {
          publishDate: new Date(),
          difficulty: 'intermediate' as const,
        },
      },
      // Add more mock content as needed
    ];

    const trendingTopics = await recommendationEngine.analyzeTrendingTopics(
      mockContent,
      timeWindowDays
    );

    return NextResponse.json({
      trendingTopics,
      timeWindow: timeWindowDays,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Trending topics error:', error);
    return NextResponse.json(
      { error: 'Failed to get trending topics' },
      { status: 500 }
    );
  }
}