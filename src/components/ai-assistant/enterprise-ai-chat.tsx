'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2,
  Maximize2,
  Sparkles,
  BarChart3,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  Brain,
  Zap,
  Shield,
  TrendingUp,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import ReactMarkdown from 'react-markdown'

interface EnhancedMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  metadata?: {
    provider?: string
    confidence?: number
    responseTime?: number
    intent?: string
    knowledgeDocuments?: number
    automated?: boolean
  }
}

interface ChatResponse {
  response: string
  sessionId: string
  messageId: string
  intent: {
    type: string
    confidence: number
    sentiment: string
  }
  confidence: number
  responseTime: number
  provider: string
  suggestions: string[]
  escalationRecommended: boolean
}

interface SessionAnalytics {
  messageCount: number
  averageResponseTime: number
  providersUsed: string[]
  userSatisfaction: number
  topicsDiscussed: string[]
}

export function EnterpriseAIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<EnhancedMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<SessionAnalytics | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [escalationAlert, setEscalationAlert] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

  const loadAnalytics = async () => {
    if (!sessionId) return
    
    try {
      const response = await fetch(`/api/ai/chat/analytics?sessionId=${sessionId}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.analytics)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isTyping) return

    setConnectionStatus('connecting')
    
    // Add user message immediately
    const userMessage: EnhancedMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    }
    
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)
    setSuggestions([])

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          useRAG: true,
          enableAnalytics: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result: ChatResponse = await response.json()
      setSessionId(result.sessionId)
      
      // Add assistant message
      const assistantMessage: EnhancedMessage = {
        id: result.messageId,
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        metadata: {
          provider: result.provider,
          confidence: result.confidence,
          responseTime: result.responseTime,
          intent: result.intent.type,
          knowledgeDocuments: result.knowledgeUsed?.length || 0,
        }
      }

      setMessages(prev => [...prev, assistantMessage])
      setSuggestions(result.suggestions)
      setEscalationAlert(result.escalationRecommended)
      setConnectionStatus('connected')

      // Load updated analytics
      setTimeout(loadAnalytics, 500)
      
    } catch (error) {
      console.error('Send message error:', error)
      setConnectionStatus('error')
      
      // Add error message
      const errorMessage: EnhancedMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Our enterprise systems are designed for high reliability - this may be a temporary network issue. Please try again, or contact our technical support team for immediate assistance.",
        timestamp: new Date(),
        metadata: {
          automated: true,
          provider: 'Error Handler'
        }
      }
      
      setMessages(prev => [...prev, errorMessage])
      setConnectionStatus('connected')
    } finally {
      setIsTyping(false)
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion)
  }

  const initializeChat = async () => {
    if (messages.length === 0) {
      try {
        // Create a new session
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Hello, I would like to learn about Vidibemus AI services.',
            enableAnalytics: true,
          }),
        })

        if (response.ok) {
          const result: ChatResponse = await response.json()
          setSessionId(result.sessionId)
          
          const welcomeMessage: EnhancedMessage = {
            id: result.messageId,
            role: 'assistant',
            content: result.response,
            timestamp: new Date(),
            metadata: {
              provider: result.provider,
              confidence: result.confidence,
              responseTime: result.responseTime,
              automated: true,
            }
          }

          setMessages([welcomeMessage])
          setSuggestions(result.suggestions)
          setTimeout(loadAnalytics, 500)
        }
      } catch (error) {
        console.error('Failed to initialize chat:', error)
        // Add fallback welcome message
        const fallbackMessage: EnhancedMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Welcome to Vidibemus AI! I'm your enterprise AI assistant, ready to help you explore our world-class AI consulting services, discuss technical solutions, and provide expert guidance on AI implementation strategies. How can I assist you today?",
          timestamp: new Date(),
          metadata: {
            automated: true,
            provider: 'Fallback System'
          }
        }
        setMessages([fallbackMessage])
      }
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      initializeChat()
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'OpenAI': return '🤖'
      case 'Anthropic': return '🧠'
      case 'Google AI': return '🔮'
      case 'Groq': return '⚡'
      case 'Cohere': return '💎'
      case 'Enterprise Knowledge Base': return '📚'
      default: return '🔧'
    }
  }

  const TypingIndicator = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-3 p-4"
    >
      <div className="h-8 w-8 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full flex items-center justify-center">
        <Bot className="h-4 w-4 text-white" />
      </div>
      <div className="flex items-center space-x-2 text-gray-500 text-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
        </div>
        <span>AI analyzing your query...</span>
      </div>
    </motion.div>
  )

  const ConnectionStatus = () => (
    <div className="flex items-center space-x-2">
      {connectionStatus === 'connected' && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600">Enterprise Connected</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Secure enterprise connection active</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {connectionStatus === 'connecting' && (
        <div className="flex items-center space-x-1">
          <RefreshCw className="h-3 w-3 text-yellow-500 animate-spin" />
          <span className="text-xs text-yellow-600">Processing...</span>
        </div>
      )}

      {connectionStatus === 'error' && (
        <div className="flex items-center space-x-1">
          <AlertCircle className="h-3 w-3 text-red-500" />
          <span className="text-xs text-red-600">Reconnecting...</span>
        </div>
      )}
    </div>
  )

  const MessageMetadata = ({ metadata }: { metadata?: EnhancedMessage['metadata'] }) => {
    if (!metadata || metadata.automated) return null

    return (
      <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
        {metadata.provider && (
          <Badge variant="outline" className="text-xs px-1 py-0">
            {getProviderIcon(metadata.provider)} {metadata.provider}
          </Badge>
        )}
        
        {metadata.confidence && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className={`text-xs px-1 py-0 ${getConfidenceColor(metadata.confidence)}`}>
                  {Math.round(metadata.confidence * 100)}%
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Response confidence score</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {metadata.responseTime && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{(metadata.responseTime / 1000).toFixed(1)}s</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Response time</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {metadata.knowledgeDocuments && metadata.knowledgeDocuments > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge variant="outline" className="text-xs px-1 py-0">
                  📚 {metadata.knowledgeDocuments}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>{metadata.knowledgeDocuments} knowledge base documents used</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  const AnalyticsPanel = () => {
    if (!analytics || !showAnalytics) return null

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      >
        <div className="p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Session Analytics
          </h4>
          
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Messages</span>
                <span className="font-medium">{analytics.messageCount}</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Avg Response</span>
                <span className="font-medium">{(analytics.averageResponseTime / 1000).toFixed(1)}s</span>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Satisfaction</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-3 w-3 ${i < Math.round(analytics.userSatisfaction) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">AI Providers</span>
                <span className="font-medium">{analytics.providersUsed.length}</span>
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-600">Topics Discussed</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {analytics.topicsDiscussed.map((topic, index) => (
                <Badge key={index} variant="secondary" className="text-xs px-1 py-0">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  const SuggestionsPanel = () => {
    if (suggestions.length === 0) return null

    return (
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-cyan-950 dark:to-purple-950">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2 flex items-center">
          <Sparkles className="h-3 w-3 mr-1" />
          Suggested follow-up questions:
        </div>
        <div className="space-y-1">
          {suggestions.slice(0, 3).map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="block w-full text-left text-xs bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded border transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      {/* Escalation Alert */}
      <AnimatePresence>
        {escalationAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-6 z-50"
          >
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <div className="text-sm">
                    <p className="font-medium text-orange-800">Expert Consultation Recommended</p>
                    <p className="text-orange-600">Your query may benefit from direct technical consultation.</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEscalationAlert(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-40"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={toggleChat}
                size="lg"
                className="h-16 w-16 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 group relative"
              >
                <motion.div
                  animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? <X className="h-6 w-6" /> : <Brain className="h-6 w-6" />}
                </motion.div>
                
                {/* Enterprise badge */}
                <motion.div
                  className="absolute -top-2 -right-2 h-6 w-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: isOpen ? 0 : 1 }}
                  transition={{ delay: 3 }}
                >
                  <Shield className="h-3 w-3 text-white" />
                </motion.div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enterprise AI Assistant</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? 80 : 700 
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-[420px] z-40"
          >
            <Card className="h-full flex flex-col shadow-2xl border-0 bg-white dark:bg-gray-900 overflow-hidden">
              {/* Enhanced Header */}
              <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Brain className="h-6 w-6" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Vidibemus AI Enterprise</h3>
                    <div className="flex items-center space-x-2">
                      <ConnectionStatus />
                    </div>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAnalytics(!showAnalytics)}
                    className="hover:bg-white/20 p-1 rounded text-white"
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setIsMinimized(!isMinimized)}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/20 p-1 rounded text-white"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    onClick={toggleChat}
                    variant="ghost"
                    size="sm"
                    className="hover:bg-white/20 p-1 rounded text-white"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <>
                  {/* Analytics Panel */}
                  <AnalyticsPanel />

                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4 max-h-96">
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-start space-x-2 max-w-[85%] ${
                              message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                            }`}>
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.role === 'user' 
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500' 
                                  : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                              }`}>
                                {message.role === 'user' ? (
                                  <User className="h-4 w-4 text-white" />
                                ) : (
                                  <Brain className="h-4 w-4 text-white" />
                                )}
                              </div>
                              <div className={`rounded-lg px-3 py-2 ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 text-gray-900 dark:text-gray-100'
                                  : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                              }`}>
                                {message.role === 'user' ? (
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                ) : (
                                  <div className="text-sm">
                                    <ReactMarkdown
                                      components={{
                                        p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                        strong: ({ children }) => <strong className="font-semibold text-cyan-700 dark:text-cyan-300">{children}</strong>,
                                        ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                                        li: ({ children }) => <li className="text-sm">{children}</li>,
                                      }}
                                    >
                                      {message.content}
                                    </ReactMarkdown>
                                  </div>
                                )}
                                <MessageMetadata metadata={message.metadata} />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                        {isTyping && <TypingIndicator />}
                        <div ref={messagesEndRef} />
                      </div>
                    </ScrollArea>

                    {/* Suggestions Panel */}
                    <SuggestionsPanel />

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex space-x-2">
                        <Input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputValue)}
                          placeholder="Ask about AI consulting, technical solutions, pricing..."
                          disabled={isTyping}
                          className="flex-1"
                        />
                        <Button
                          onClick={() => handleSendMessage(inputValue)}
                          disabled={isTyping || !inputValue.trim()}
                          size="sm"
                          className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                        >
                          {isTyping ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Enterprise-grade AI • End-to-end encrypted</span>
                        {analytics && (
                          <span className="flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>{Math.round(analytics.userSatisfaction * 20)}% satisfaction</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </TooltipProvider>
  )
}