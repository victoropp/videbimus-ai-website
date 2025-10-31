'use client'

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain, Zap, TrendingUp, MessageSquare, FileText, Heart, Target, Hash, HelpCircle, Sparkles } from 'lucide-react';

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
      {/* Hero Section with Image */}
      <div className="relative mb-12 rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90 z-10"></div>
        <Image
          src="/images/ai-playground/hero-interactive-ai.jpg"
          alt="Interactive AI Playground"
          width={1920}
          height={1080}
          className="w-full h-[400px] object-cover"
          priority
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-white text-center px-4">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-5xl font-bold">AI Playground</h1>
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-xl max-w-3xl mx-auto leading-relaxed">
            Experience the power of our AI technologies with live demonstrations and interactive tools.
            Explore cutting-edge capabilities powered by OpenAI and advanced machine learning models.
          </p>
        </div>
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
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/ai-playground/demo-sentiment-analysis.jpg"
                alt="Sentiment Analysis Demo"
                width={800}
                height={600}
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg">Sentiment Analysis</h3>
                <p className="text-white/90 text-sm">Analyze emotions and sentiments in text with high accuracy</p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-pink-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Emotion Detection</h4>
                  <p className="text-sm text-muted-foreground">Identify positive, negative, and neutral sentiments in text</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Real-time Analysis</h4>
                  <p className="text-sm text-muted-foreground">Get instant sentiment scores and confidence levels</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Multi-language Support</h4>
                  <p className="text-sm text-muted-foreground">Analyze sentiment across multiple languages</p>
                </div>
              </div>
            </div>
          </div>
          <SentimentDemo />
        </TabsContent>

        <TabsContent value="summarization" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/ai-playground/demo-text-summarization.jpg"
                alt="Text Summarization Demo"
                width={800}
                height={600}
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg">Text Summarization</h3>
                <p className="text-white/90 text-sm">Generate concise summaries from lengthy documents</p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-start gap-3">
                <FileText className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Smart Condensation</h4>
                  <p className="text-sm text-muted-foreground">Extract key points and main ideas automatically</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-purple-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Customizable Length</h4>
                  <p className="text-sm text-muted-foreground">Control summary length based on your needs</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-indigo-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Context Preservation</h4>
                  <p className="text-sm text-muted-foreground">Maintain core meaning and context in summaries</p>
                </div>
              </div>
            </div>
          </div>
          <SummarizationDemo />
        </TabsContent>

        <TabsContent value="ner" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/ai-playground/demo-entity-recognition.jpg"
                alt="Entity Recognition Demo"
                width={800}
                height={600}
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg">Named Entity Recognition</h3>
                <p className="text-white/90 text-sm">Extract and classify named entities from text</p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-start gap-3">
                <Hash className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Entity Extraction</h4>
                  <p className="text-sm text-muted-foreground">Identify persons, organizations, locations, and more</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">High Accuracy</h4>
                  <p className="text-sm text-muted-foreground">Advanced models trained on diverse datasets</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Zap className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Fast Processing</h4>
                  <p className="text-sm text-muted-foreground">Real-time entity recognition for instant insights</p>
                </div>
              </div>
            </div>
          </div>
          <NERDemo />
        </TabsContent>

        <TabsContent value="qa" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <Image
                src="/images/ai-playground/demo-question-answering.jpg"
                alt="Question Answering Demo"
                width={800}
                height={600}
                className="w-full h-[300px] object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                <h3 className="text-white font-semibold text-lg">Question Answering</h3>
                <p className="text-white/90 text-sm">Get accurate answers from documents and context</p>
              </div>
            </div>
            <div className="flex flex-col justify-center space-y-4">
              <div className="flex items-start gap-3">
                <HelpCircle className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Context Understanding</h4>
                  <p className="text-sm text-muted-foreground">Extract precise answers from provided context</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Brain className="w-6 h-6 text-violet-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Deep Comprehension</h4>
                  <p className="text-sm text-muted-foreground">Understand complex questions and nuanced queries</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="w-6 h-6 text-teal-500 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Natural Responses</h4>
                  <p className="text-sm text-muted-foreground">Get human-like, contextually relevant answers</p>
                </div>
              </div>
            </div>
          </div>
          <QADemo />
        </TabsContent>

        <TabsContent value="models" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-500" />
                AI Technology Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="group cursor-pointer">
                  <div className="relative rounded-lg overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/images/ai-playground/tech-openai-models.jpg"
                      alt="OpenAI Models"
                      width={600}
                      height={400}
                      className="w-full h-[250px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-bold mb-2">OpenAI Models</h3>
                      <p className="text-sm text-white/90">Powered by GPT-4, GPT-3.5, and advanced language models for natural conversations and intelligent responses</p>
                    </div>
                  </div>
                </div>

                <div className="group cursor-pointer">
                  <div className="relative rounded-lg overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/images/ai-playground/tech-realtime-processing.jpg"
                      alt="Real-time Processing"
                      width={600}
                      height={400}
                      className="w-full h-[250px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-bold mb-2">Real-time Processing</h3>
                      <p className="text-sm text-white/90">Lightning-fast inference and processing with optimized pipelines for instant AI responses and analysis</p>
                    </div>
                  </div>
                </div>

                <div className="group cursor-pointer">
                  <div className="relative rounded-lg overflow-hidden shadow-md transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src="/images/ai-playground/tech-api-integration.jpg"
                      alt="API Integration"
                      width={600}
                      height={400}
                      className="w-full h-[250px] object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-bold mb-2">API Integration</h3>
                      <p className="text-sm text-white/90">Seamless integration with enterprise systems through robust RESTful APIs and SDKs</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="w-8 h-8 text-blue-600" />
                    <h3 className="text-xl font-bold text-gray-900">Performance Metrics</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span><strong>Response Time:</strong> Average 100-500ms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span><strong>Accuracy:</strong> 95%+ on standard benchmarks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span><strong>Uptime:</strong> 99.9% service availability</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="w-8 h-8 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-900">Supported Models</h3>
                  </div>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">GPT-4</Badge>
                      <Badge variant="secondary">GPT-3.5</Badge>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">BERT</Badge>
                      <Badge variant="secondary">Qwen 2.5</Badge>
                    </li>
                    <li className="flex items-center gap-2">
                      <Badge variant="secondary">Custom Models</Badge>
                      <Badge variant="secondary">Fine-tuned</Badge>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-500" />
                Usage Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                    <p className="text-3xl font-bold text-blue-600">12.5K</p>
                    <p className="text-xs text-gray-500 mt-1">+23% this month</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Avg Response Time</p>
                    <p className="text-3xl font-bold text-green-600">245ms</p>
                    <p className="text-xs text-gray-500 mt-1">-15% improvement</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-600 mb-1">Success Rate</p>
                    <p className="text-3xl font-bold text-purple-600">99.7%</p>
                    <p className="text-xs text-gray-500 mt-1">Stable</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <p className="text-sm text-gray-600 mb-1">Active Users</p>
                    <p className="text-3xl font-bold text-orange-600">2.3K</p>
                    <p className="text-xs text-gray-500 mt-1">+45% growth</p>
                  </div>
                </div>
                <p className="text-center text-muted-foreground mt-8">
                  Analytics dashboard coming soon with detailed insights and visualizations
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                AI Features & Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <MessageSquare className="w-10 h-10 text-blue-500 mb-3" />
                  <h3 className="font-semibold mb-2">Conversational AI</h3>
                  <p className="text-sm text-muted-foreground">Natural language understanding and generation for human-like conversations</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <Heart className="w-10 h-10 text-pink-500 mb-3" />
                  <h3 className="font-semibold mb-2">Sentiment Analysis</h3>
                  <p className="text-sm text-muted-foreground">Detect emotions and sentiment in text with high accuracy</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <FileText className="w-10 h-10 text-green-500 mb-3" />
                  <h3 className="font-semibold mb-2">Text Summarization</h3>
                  <p className="text-sm text-muted-foreground">Generate concise summaries from long documents</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <Hash className="w-10 h-10 text-orange-500 mb-3" />
                  <h3 className="font-semibold mb-2">Entity Recognition</h3>
                  <p className="text-sm text-muted-foreground">Extract and classify named entities from text</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <HelpCircle className="w-10 h-10 text-purple-500 mb-3" />
                  <h3 className="font-semibold mb-2">Question Answering</h3>
                  <p className="text-sm text-muted-foreground">Get accurate answers from documents and context</p>
                </div>
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <Brain className="w-10 h-10 text-indigo-500 mb-3" />
                  <h3 className="font-semibold mb-2">Multi-Model Support</h3>
                  <p className="text-sm text-muted-foreground">Choose from multiple AI models for different use cases</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
