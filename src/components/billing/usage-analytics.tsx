'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/stripe'
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Brain,
  MessageSquare,
  Image,
  FileText,
  Mic,
  Languages,
  Search
} from 'lucide-react'

interface UsageAnalyticsProps {
  usage?: {
    period: string
    startDate: Date
    endDate: Date
    usageByService: Record<string, {
      totalRequests: number
      successfulRequests: number
      totalTokens: number
      totalDuration: number
      totalCost: number
    }>
    totalStats: {
      totalRequests: number
      successfulRequests: number
      totalTokens: number
      totalDuration: number
      totalCost: number
    }
  }
}

const serviceConfig = {
  'CHAT_COMPLETION': { 
    name: 'AI Chat', 
    icon: MessageSquare, 
    color: 'bg-blue-100 text-blue-800',
    description: 'Chat completions and conversations'
  },
  'TEXT_GENERATION': { 
    name: 'Text Generation', 
    icon: FileText, 
    color: 'bg-green-100 text-green-800',
    description: 'AI-powered text generation'
  },
  'IMAGE_GENERATION': { 
    name: 'Image Generation', 
    icon: Image, 
    color: 'bg-purple-100 text-purple-800',
    description: 'AI image creation and editing'
  },
  'TRANSCRIPTION': { 
    name: 'Transcription', 
    icon: Mic, 
    color: 'bg-orange-100 text-orange-800',
    description: 'Audio to text conversion'
  },
  'TRANSLATION': { 
    name: 'Translation', 
    icon: Languages, 
    color: 'bg-pink-100 text-pink-800',
    description: 'Language translation services'
  },
  'SENTIMENT_ANALYSIS': { 
    name: 'Sentiment Analysis', 
    icon: Brain, 
    color: 'bg-indigo-100 text-indigo-800',
    description: 'Text sentiment detection'
  },
  'SUMMARIZATION': { 
    name: 'Summarization', 
    icon: FileText, 
    color: 'bg-teal-100 text-teal-800',
    description: 'Text summarization'
  },
  'ENTITY_EXTRACTION': { 
    name: 'Entity Extraction', 
    icon: Search, 
    color: 'bg-cyan-100 text-cyan-800',
    description: 'Named entity recognition'
  },
  'KNOWLEDGE_SEARCH': { 
    name: 'Knowledge Search', 
    icon: Search, 
    color: 'bg-lime-100 text-lime-800',
    description: 'AI-powered search'
  },
  'RECOMMENDATIONS': { 
    name: 'Recommendations', 
    icon: TrendingUp, 
    color: 'bg-amber-100 text-amber-800',
    description: 'AI recommendations'
  },
  'COLLABORATION_AI': { 
    name: 'Collaboration AI', 
    icon: MessageSquare, 
    color: 'bg-rose-100 text-rose-800',
    description: 'AI collaboration features'
  }
}

export function UsageAnalytics({ usage }: UsageAnalyticsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('month')

  if (!usage) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">
            View your AI service usage and costs.
          </p>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No usage data</h3>
            <p className="text-muted-foreground text-center">
              Start using our AI services to see usage analytics here.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatDate = (date: Date) => {
    return new Intl.DateFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date))
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
    return `${(ms / 60000).toFixed(1)}m`
  }

  const getSuccessRate = (successful: number, total: number) => {
    if (total === 0) return 0
    return Math.round((successful / total) * 100)
  }

  const sortedServices = Object.entries(usage.usageByService)
    .sort(([, a], [, b]) => b.totalRequests - a.totalRequests)

  const maxRequests = Math.max(...Object.values(usage.usageByService).map(s => s.totalRequests))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Usage Analytics</h3>
          <p className="text-sm text-muted-foreground">
            {formatDate(usage.startDate)} - {formatDate(usage.endDate)}
          </p>
        </div>
        
        <div className="flex gap-2">
          {['day', 'week', 'month', 'year'].map((period) => (
            <Button
              key={period}
              variant={selectedPeriod === period ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Total Requests</span>
            </div>
            <div className="text-2xl font-bold">{usage.totalStats.totalRequests.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {getSuccessRate(usage.totalStats.successfulRequests, usage.totalStats.totalRequests)}% success rate
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">AI Tokens</span>
            </div>
            <div className="text-2xl font-bold">{usage.totalStats.totalTokens.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">
              {Math.round(usage.totalStats.totalTokens / usage.totalStats.totalRequests)} avg per request
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Total Time</span>
            </div>
            <div className="text-2xl font-bold">{formatDuration(usage.totalStats.totalDuration)}</div>
            <div className="text-xs text-muted-foreground">
              {formatDuration(Math.round(usage.totalStats.totalDuration / usage.totalStats.totalRequests))} avg
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Usage Cost</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(Math.round(usage.totalStats.totalCost * 100))}
            </div>
            <div className="text-xs text-muted-foreground">
              This period
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Usage Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Service Usage Breakdown</CardTitle>
          <CardDescription>
            Detailed usage statistics by AI service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedServices.map(([serviceName, stats]) => {
              const config = serviceConfig[serviceName as keyof typeof serviceConfig]
              if (!config) return null

              const Icon = config.icon
              const usagePercentage = maxRequests > 0 ? (stats.totalRequests / maxRequests) * 100 : 0

              return (
                <div key={serviceName} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{config.name}</span>
                          <Badge variant="outline" className={config.color}>
                            {stats.totalRequests} requests
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(Math.round(stats.totalCost * 100))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {stats.totalTokens.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={usagePercentage} className="h-2" />
                  
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{getSuccessRate(stats.successfulRequests, stats.totalRequests)}% success</span>
                    <span>Avg: {formatDuration(Math.round(stats.totalDuration / stats.totalRequests))}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Usage Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Optimize Token Usage</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use shorter prompts when possible</li>
                <li>• Cache frequently used responses</li>
                <li>• Choose the right model for your task</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Monitor Costs</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Set usage alerts and budgets</li>
                <li>• Review usage patterns regularly</li>
                <li>• Consider batch processing for large tasks</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}