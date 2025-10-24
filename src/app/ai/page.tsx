import dynamic from 'next/dynamic';
import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain, Zap, TrendingUp, MessageSquare, FileText, Heart, Target, Hash, HelpCircle } from 'lucide-react';

// Dynamically import AI demo components to reduce initial bundle size
const ChatInterface = dynamic(() => import('@/components/ai/chat-interface').then(mod => ({ default: mod.ChatInterface })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

const SentimentDemo = dynamic(() => import('@/components/ai/demos/sentiment-demo').then(mod => ({ default: mod.SentimentDemo })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

const SummarizationDemo = dynamic(() => import('@/components/ai/demos/summarization-demo').then(mod => ({ default: mod.SummarizationDemo })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

const NERDemo = dynamic(() => import('@/components/ai/demos/ner-demo').then(mod => ({ default: mod.NERDemo })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

const QADemo = dynamic(() => import('@/components/ai/demos/qa-demo').then(mod => ({ default: mod.QADemo })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>,
  ssr: false
});

export const metadata: Metadata = {
  title: 'AI Playground | Videbimus AI',
  description: 'Explore cutting-edge AI features including chatbots, sentiment analysis, text summarization, and more.',
};

export default function AIPlaygroundPage() {
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Hugging Face Models</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">nlptown/bert-base-multilingual</div>
                      <div className="text-sm text-muted-foreground">Active • Sentiment (5-star)</div>
                    </div>
                    <Badge variant="secondary">✅ Working</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">facebook/bart-large-cnn</div>
                      <div className="text-sm text-muted-foreground">Active • Summarization</div>
                    </div>
                    <Badge variant="secondary">✅ Working</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">dbmdz/bert-large-cased-conll03</div>
                      <div className="text-sm text-muted-foreground">Active • NER</div>
                    </div>
                    <Badge variant="secondary">✅ Working</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">deepset/roberta-base-squad2</div>
                      <div className="text-sm text-muted-foreground">Active • Q&A</div>
                    </div>
                    <Badge variant="secondary">✅ Working</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Helsinki-NLP/opus-mt-en-*</div>
                      <div className="text-sm text-muted-foreground">Active • Translation</div>
                    </div>
                    <Badge variant="secondary">✅ Working</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">facebook/bart-large-mnli</div>
                      <div className="text-sm text-muted-foreground">Active • Zero-shot</div>
                    </div>
                    <Badge variant="secondary">✅ Working</Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">Microsoft/Phi-3.5-mini-instruct</div>
                      <div className="text-sm text-muted-foreground">Active • Chat & Reasoning</div>
                    </div>
                    <Badge variant="default">🆕 New</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Real-time Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">1,247</div>
                    <div className="text-sm text-muted-foreground">Predictions/hour</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">45ms</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">12</div>
                    <div className="text-sm text-muted-foreground">Active Models</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Chat Interactions</span>
                    <span className="font-bold">12,453</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sentiment Analysis</span>
                    <span className="font-bold">8,921</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Text Summarization</span>
                    <span className="font-bold">3,467</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Document Analysis</span>
                    <span className="font-bold">1,234</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Accuracy Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>This Week</span>
                    <Badge variant="secondary">+2.1%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>This Month</span>
                    <Badge variant="secondary">+5.7%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>This Quarter</span>
                    <Badge variant="secondary">+12.4%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Popular Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Smart Recommendations</span>
                    <span className="text-sm">85% adoption</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto Transcription</span>
                    <span className="text-sm">72% adoption</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entity Extraction</span>
                    <span className="text-sm">68% adoption</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Language Detection</span>
                    <span className="text-sm">45% adoption</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-red-500" />
                  <span>Smart Recommendations</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  AI-powered content recommendations based on user behavior and preferences.
                </p>
                <Badge variant="secondary">Production Ready</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span>Document Analysis</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Extract insights, summaries, and key information from documents automatically.
                </p>
                <Badge variant="secondary">Beta</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                  <span>Meeting Transcription</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Real-time transcription and summarization of meetings and conversations.
                </p>
                <Badge variant="secondary">Production Ready</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <span>Predictive Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Advanced forecasting and prediction models for business insights.
                </p>
                <Badge variant="outline">Coming Soon</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <span>Real-time Processing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Low-latency AI processing for real-time applications and streaming data.
                </p>
                <Badge variant="secondary">Production Ready</Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-orange-500" />
                  <span>A/B Testing</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Built-in A/B testing framework for comparing model performance.
                </p>
                <Badge variant="secondary">Beta</Badge>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}