'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, Frown, Angry, Zap, Meh } from 'lucide-react';

interface SentimentResult {
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

const emotionIcons = {
  joy: Heart,
  sadness: Frown,
  anger: Angry,
  fear: Zap,
  surprise: Meh,
};

const emotionColors = {
  joy: 'text-yellow-500',
  sadness: 'text-blue-500',
  anger: 'text-red-500',
  fear: 'text-purple-500',
  surprise: 'text-green-500',
};

const getSentimentColor = (sentiment: string) => {
  switch (sentiment) {
    case 'positive':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'negative':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'neutral':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export function SentimentDemo() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleTexts = [
    "I absolutely love this product! It's amazing and has exceeded all my expectations.",
    "This is the worst experience I've ever had. I'm extremely disappointed.",
    "The weather is okay today. Nothing special, just a regular day.",
    "I'm feeling scared about the upcoming presentation but also excited about the opportunity.",
  ];

  const analyzeSentiment = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/demos/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      // Show error toast or message
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <span>Sentiment Analysis Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter text to analyze:
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste your text here..."
              rows={4}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              Or try one of these examples:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleTexts.map((sample, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setText(sample)}
                  className="text-left h-auto p-3 text-xs"
                >
                  {sample}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={analyzeSentiment}
            disabled={!text.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Analyzing...' : 'Analyze Sentiment'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Overall Sentiment</h3>
                <Badge className={`${getSentimentColor(result.sentiment)} capitalize`}>
                  {result.sentiment}
                </Badge>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {(result.confidence * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Confidence</div>
              </div>
            </div>

            <div>
              <div className="mb-2">
                <span className="text-sm font-medium">Confidence Level</span>
              </div>
              <Progress value={result.confidence * 100} className="w-full" />
            </div>

            {result.emotions && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Emotional Breakdown</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  {Object.entries(result.emotions).map(([emotion, score]) => {
                    const IconComponent = emotionIcons[emotion as keyof typeof emotionIcons];
                    const colorClass = emotionColors[emotion as keyof typeof emotionColors];
                    
                    return (
                      <div key={emotion} className="text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2`}>
                          <IconComponent className={`w-6 h-6 ${colorClass}`} />
                        </div>
                        <div className="text-sm font-medium capitalize">{emotion}</div>
                        <div className="text-lg font-bold">
                          {(score * 100).toFixed(0)}%
                        </div>
                        <Progress value={score * 100} className="w-full h-2" />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Analysis Summary</h4>
              <p className="text-sm text-muted-foreground">
                The text shows a <strong>{result.sentiment}</strong> sentiment with{' '}
                <strong>{(result.confidence * 100).toFixed(1)}%</strong> confidence.
                {result.emotions && (
                  <>
                    {' '}The strongest emotion detected is{' '}
                    <strong>
                      {Object.entries(result.emotions).reduce((a, b) => 
                        result.emotions![a[0] as keyof typeof result.emotions] > result.emotions![b[0] as keyof typeof result.emotions] ? a : b
                      )[0]}
                    </strong>.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}