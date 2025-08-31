'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Zap, Target } from 'lucide-react';

interface SummaryResult {
  summary: string;
  originalLength: number;
  summaryLength: number;
  compressionRatio: string;
}

export function SummarizationDemo() {
  const [text, setText] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [style, setStyle] = useState<'bullet-points' | 'paragraph' | 'executive'>('paragraph');
  const [result, setResult] = useState<SummaryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const sampleText = `Artificial Intelligence (AI) has become one of the most transformative technologies of the 21st century, fundamentally changing how we work, communicate, and solve complex problems. From its theoretical beginnings in the 1950s with pioneers like Alan Turing and John McCarthy, AI has evolved from simple rule-based systems to sophisticated machine learning algorithms capable of recognizing patterns, making predictions, and even generating creative content.

Today's AI systems, particularly large language models like GPT and Claude, demonstrate remarkable capabilities in natural language processing, enabling applications ranging from chatbots and virtual assistants to automated content generation and translation services. Machine learning, a subset of AI, has proven particularly valuable in sectors like healthcare, where it assists in medical diagnosis and drug discovery, and in finance, where it helps detect fraud and manage risk.

The rapid advancement of AI technology has also sparked important discussions about ethics, bias, and the future of work. As AI systems become more capable, questions arise about their impact on employment, privacy, and decision-making processes. Many organizations and governments are developing AI governance frameworks to ensure responsible development and deployment of these technologies.

Looking forward, AI is expected to continue evolving with developments in areas like quantum computing, neuromorphic chips, and more sophisticated algorithms. The integration of AI into everyday life will likely deepen, with smart cities, autonomous vehicles, and personalized medicine becoming more prevalent. However, realizing the full potential of AI will require careful consideration of its societal implications and continued collaboration between technologists, policymakers, and the broader community.`;

  const summarizeText = async () => {
    if (!text.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/demos/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, length, style }),
      });

      if (!response.ok) {
        throw new Error('Summarization failed');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Summarization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <span>Text Summarization Demo</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter text to summarize:
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste a long text here to generate a summary..."
              rows={6}
              className="w-full"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {text.length} characters
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setText(sampleText)}
              >
                Use Sample Text
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Summary Length
              </label>
              <Select value={length} onValueChange={(value: any) => setLength(value)}>
                <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select length" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700">
                  <SelectItem value="short" className="hover:bg-gray-100 dark:hover:bg-gray-800">Short (1-2 sentences)</SelectItem>
                  <SelectItem value="medium" className="hover:bg-gray-100 dark:hover:bg-gray-800">Medium (3-5 sentences)</SelectItem>
                  <SelectItem value="long" className="hover:bg-gray-100 dark:hover:bg-gray-800">Long (Comprehensive)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Summary Style
              </label>
              <Select value={style} onValueChange={(value: any) => setStyle(value)}>
                <SelectTrigger className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900 focus:ring-2 focus:ring-blue-500">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700">
                  <SelectItem value="paragraph" className="hover:bg-gray-100 dark:hover:bg-gray-800">Paragraph</SelectItem>
                  <SelectItem value="bullet-points" className="hover:bg-gray-100 dark:hover:bg-gray-800">Bullet Points</SelectItem>
                  <SelectItem value="executive" className="hover:bg-gray-100 dark:hover:bg-gray-800">Executive Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={summarizeText}
            disabled={!text.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Generating Summary...' : 'Summarize Text'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Summary Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline" className="flex items-center space-x-1">
                <FileText className="w-3 h-3" />
                <span>Original: {result.originalLength} chars</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>Summary: {result.summaryLength} chars</span>
              </Badge>
              <Badge variant="outline" className="flex items-center space-x-1">
                <Target className="w-3 h-3" />
                <span>Compression: {result.compressionRatio}</span>
              </Badge>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Generated Summary</h4>
              <div className="prose prose-sm max-w-none">
                {style === 'bullet-points' ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: result.summary.replace(/\n/g, '<br />')
                    }}
                  />
                ) : (
                  <p className="text-sm leading-relaxed">{result.summary}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {((1 - result.summaryLength / result.originalLength) * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.ceil(result.originalLength / 1000)}
                </div>
                <div className="text-sm text-muted-foreground">Estimated Reading Time (min)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {result.summary.split(/[.!?]+/).filter(s => s.trim().length > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Key Points</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}