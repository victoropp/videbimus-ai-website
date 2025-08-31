'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { HelpCircle, FileText, Sparkles, BookOpen, Target } from 'lucide-react';

interface QAResult {
  answer: string;
  confidence: number;
  startIndex?: number;
  endIndex?: number;
}

export function QADemo() {
  const [context, setContext] = useState('');
  const [question, setQuestion] = useState('');
  const [result, setResult] = useState<QAResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedContext, setHighlightedContext] = useState<React.ReactNode>('');

  const sampleData = [
    {
      context: "Videbimus AI was founded in 2023 by a team of data scientists and AI researchers. The company specializes in providing AI consulting services to businesses across various industries. Their headquarters is located in San Francisco, California, with additional offices in New York and London. The company has grown to over 150 employees and has served more than 200 clients worldwide.",
      questions: [
        "When was Videbimus AI founded?",
        "Where is the company headquarters?",
        "How many employees does the company have?",
        "What services does Videbimus AI provide?"
      ]
    },
    {
      context: "Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed. Deep learning, a subfield of machine learning, uses neural networks with multiple layers to progressively extract higher-level features from raw input. The most common applications include computer vision, natural language processing, and speech recognition.",
      questions: [
        "What is machine learning?",
        "What is deep learning?",
        "What are the applications of deep learning?",
        "How does machine learning relate to AI?"
      ]
    },
    {
      context: "The Global Climate Report 2024 indicates that average temperatures have risen by 1.2°C since pre-industrial times. The report, published by the International Climate Organization, warns that we must limit warming to 1.5°C to avoid catastrophic impacts. Key recommendations include reducing carbon emissions by 50% by 2030 and achieving net-zero emissions by 2050.",
      questions: [
        "How much have temperatures risen?",
        "Who published the report?",
        "What is the temperature limit goal?",
        "When should we achieve net-zero emissions?"
      ]
    }
  ];

  const answerQuestion = async () => {
    if (!context.trim() || !question.trim()) return;

    setIsLoading(true);
    setResult(null);
    setHighlightedContext('');

    try {
      const response = await fetch('/api/ai/demos/qa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context, question }),
      });

      if (!response.ok) {
        throw new Error('Question answering failed');
      }

      const data = await response.json();
      setResult(data);
      
      // Highlight the answer in the context if indices are provided
      if (data.startIndex !== undefined && data.endIndex !== undefined) {
        highlightAnswer(context, data.startIndex, data.endIndex);
      } else {
        setHighlightedContext(context);
      }
    } catch (error) {
      console.error('Question answering error:', error);
      setResult({
        answer: "Sorry, I couldn't process your question. Please try again.",
        confidence: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  const highlightAnswer = (text: string, start: number, end: number) => {
    const highlighted = (
      <>
        <span>{text.substring(0, start)}</span>
        <mark className="bg-yellow-200 dark:bg-yellow-900 px-1 py-0.5 rounded font-semibold">
          {text.substring(start, end)}
        </mark>
        <span>{text.substring(end)}</span>
      </>
    );
    setHighlightedContext(highlighted);
  };

  const loadSample = (sampleIndex: number) => {
    const sample = sampleData[sampleIndex];
    setContext(sample.context);
    setQuestion(''); // Clear question so user can choose
    setResult(null);
    setHighlightedContext('');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence';
    if (confidence >= 0.6) return 'Medium Confidence';
    if (confidence >= 0.4) return 'Low Confidence';
    return 'Very Low Confidence';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-purple-500" />
            <span>Question Answering Demo</span>
            <Badge variant="outline" className="ml-2">RoBERTa-SQuAD</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              <FileText className="inline w-4 h-4 mr-1" />
              Context (provide information to search within):
            </label>
            <Textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Paste or type the context/document that contains the information..."
              rows={6}
              className="w-full"
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">
                {context.length} characters
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              <Sparkles className="inline w-4 h-4 mr-1" />
              Load Sample Context:
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSample(0)}
                className="text-left"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Company Info
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSample(1)}
                className="text-left"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                ML Concepts
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadSample(2)}
                className="text-left"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Climate Report
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">
              <HelpCircle className="inline w-4 h-4 mr-1" />
              Your Question:
            </label>
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about the context..."
              className="w-full"
            />
            
            {context && sampleData.find(s => s.context === context) && (
              <div className="mt-2">
                <label className="text-xs text-muted-foreground">Sample questions:</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {sampleData.find(s => s.context === context)?.questions.map((q, idx) => (
                    <Button
                      key={idx}
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuestion(q)}
                      className="text-xs h-7 px-2"
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={answerQuestion}
            disabled={!context.trim() || !question.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? 'Finding Answer...' : 'Get Answer'}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Answer</span>
              <Badge className={getConfidenceColor(result.confidence)}>
                {getConfidenceLabel(result.confidence)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-lg">{result.answer}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <Progress value={result.confidence * 100} className="w-24 h-2" />
                      <span className={`text-sm font-medium ${getConfidenceColor(result.confidence)}`}>
                        {(result.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {highlightedContext && (
              <div>
                <h4 className="font-medium mb-2 text-sm text-muted-foreground">
                  Answer highlighted in context:
                </h4>
                <div className="p-4 bg-muted/30 rounded-lg text-sm leading-relaxed max-h-64 overflow-y-auto">
                  {highlightedContext}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.answer.split(' ').length}
                </div>
                <div className="text-sm text-muted-foreground">Words in Answer</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(result.confidence * 100).toFixed(0)}%
                </div>
                <div className="text-sm text-muted-foreground">Confidence Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.startIndex !== undefined && result.endIndex !== undefined
                    ? `${result.startIndex}-${result.endIndex}`
                    : 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Position in Text</div>
              </div>
            </div>

            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">How it works</h4>
              <p className="text-sm text-muted-foreground">
                This demo uses a RoBERTa model fine-tuned on the SQuAD 2.0 dataset to extract answers 
                from the provided context. The model analyzes the relationship between your question 
                and the context to identify the most relevant span of text that answers your question.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}