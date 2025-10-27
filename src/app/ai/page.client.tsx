'use client'

import dynamic from 'next/dynamic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain, Zap, TrendingUp, MessageSquare, FileText, Heart, Target, Hash, HelpCircle } from 'lucide-react';

// Dynamically import AI demo components to reduce initial bundle size
const ChatInterface = dynamic(() => import('@/components/ai/chat-interface').then(mod => ({ default: mod.ChatInterface })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const SentimentDemo = dynamic(() => import('@/components/ai/demos/sentiment-demo').then(mod => ({ default: mod.SentimentDemo })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const SummarizationDemo = dynamic(() => import('@/components/ai/demos/summarization-demo').then(mod => ({ default: mod.SummarizationDemo })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const NERDemo = dynamic(() => import('@/components/ai/demos/ner-demo').then(mod => ({ default: mod.NERDemo })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

const QADemo = dynamic(() => import('@/components/ai/demos/qa-demo').then(mod => ({ default: mod.QADemo })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
});

export default function AIPlaygroundClient() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Playground</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Experience the power of our AI technologies with live demonstrations and interactive tools.
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-8">
          <TabsTrigger value="chat" className="flex items-center space-x-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center space-x-2">
            <Heart className="w-4 h-4" />
            <span className="hidden sm:inline">Sentiment</span>
          </TabsTrigger>
          <TabsTrigger value="summarization" className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Summarize</span>
          </TabsTrigger>
          <TabsTrigger value="ner" className="flex items-center space-x-2">
            <Hash className="w-4 h-4" />
            <span className="hidden sm:inline">NER</span>
          </TabsTrigger>
          <TabsTrigger value="qa" className="flex items-center space-x-2">
            <HelpCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Q&A</span>
          </TabsTrigger>
          <TabsTrigger value="models" className="flex items-center space-x-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Models</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Features</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-6 h-6 text-blue-500" />
                <span>AI Assistant</span>
                <Badge variant="outline">Multi-Model</Badge>
                <Badge variant="secondary" className="ml-2">Qwen 2.5 Available</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChatInterface />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="mt-6">
          <SentimentDemo />
        </TabsContent>

        <TabsContent value="summarization" className="mt-6">
          <SummarizationDemo />
        </TabsContent>

        <TabsContent value="ner" className="mt-6">
          <NERDemo />
        </TabsContent>

        <TabsContent value="qa" className="mt-6">
          <QADemo />
        </TabsContent>

        <TabsContent value="models" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Active AI Models</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Models information...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Analytics information...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Features</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Features information...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
