'use client'

import React, { useState, useRef, useEffect } from 'react'
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
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  provider?: string
  cached?: boolean
  error?: boolean
}

export function EnterpriseChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
      
      // Initialize session if not exists
      if (!sessionId) {
        const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        setSessionId(newSessionId)
        
        // Add welcome message
        addMessage('assistant', `👋 Welcome to Videbimus AI! I'm your enterprise AI assistant, powered by state-of-the-art technology including:

• **Multi-provider AI orchestration** for 99.9% uptime
• **Semantic caching** for instant responses
• **RAG integration** with our knowledge base
• **Agent collaboration** for complex tasks

How can I help transform your business with AI today?`, {
          provider: 'System',
          confidence: 1
        })
      }
    }
  }, [isOpen, isMinimized, sessionId])

  const addMessage = (type: 'user' | 'assistant', content: string, extra?: Partial<Message>) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date(),
      ...extra
    }
    setMessages(prev => [...prev, newMessage])
  }

  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    setInputValue('')
    addMessage('user', userMessage)
    setIsTyping(true)
    setConnectionStatus('connecting')

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          stream: true,
          useRAG: true,
          model: 'gpt-4'
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      setConnectionStatus('connected')

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''
      let messageId = Date.now().toString()
      let metadata: any = {}

      // Add initial empty message
      addMessage('assistant', '', { id: messageId })

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            
            if (data === '[DONE]') {
              continue
            }
            
            try {
              const parsed = JSON.parse(data)
              
              if (parsed.content) {
                accumulatedContent += parsed.content
                
                // Update message with accumulated content
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, content: accumulatedContent, ...metadata }
                    : msg
                ))
              }
              
              // Store metadata from first chunk
              if (parsed.provider) metadata.provider = parsed.provider
              if (parsed.cached) metadata.cached = true
              if (parsed.confidence) metadata.confidence = parsed.confidence
            } catch (e) {
              console.error('Failed to parse chunk:', e)
            }
          }
        }
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.log('Request aborted')
      } else {
        console.error('Chat error:', error)
        setConnectionStatus('error')
        addMessage('assistant', 'I apologize for the inconvenience. Our AI service is temporarily unavailable. Please try again in a moment or contact support if the issue persists.', {
          error: true,
          provider: 'Error Handler'
        })
      }
    } finally {
      setIsTyping(false)
      setConnectionStatus('connected')
      abortControllerRef.current = null
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const toggleChat = () => {
    if (isOpen && abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsOpen(!isOpen)
    setIsMinimized(false)
  }

  const quickActions = [
    '📊 Tell me about your AI services',
    '💰 What are your pricing plans?',
    '🚀 How can AI help my business?',
    '📅 Schedule a consultation'
  ]

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={toggleChat}
            className="fixed bottom-4 right-4 z-50 h-14 w-14 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
              AI
            </span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-white opacity-20"
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed z-50 shadow-2xl",
              isMinimized 
                ? "bottom-4 right-4 w-80"
                : "bottom-4 right-4 w-96 md:w-[450px]"
            )}
          >
            <Card className={cn(
              "flex flex-col bg-white dark:bg-gray-900 border-0 overflow-hidden",
              isMinimized ? "h-14" : "h-[600px]"
            )}>
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    {/* Connection Status Indicator */}
                    <span className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                      connectionStatus === 'connected' && "bg-green-500",
                      connectionStatus === 'connecting' && "bg-yellow-500 animate-pulse",
                      connectionStatus === 'error' && "bg-red-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Videbimus AI Assistant</h3>
                    <p className="text-xs opacity-90">
                      {connectionStatus === 'connected' && 'Enterprise AI at your service'}
                      {connectionStatus === 'connecting' && 'Connecting...'}
                      {connectionStatus === 'error' && 'Connection issue'}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="hover:bg-white/20 p-1 rounded transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={toggleChat}
                    className="hover:bg-white/20 p-1 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-[85%] ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                            message.type === 'user' 
                              ? 'bg-gray-200 dark:bg-gray-700' 
                              : message.error 
                                ? 'bg-red-500'
                                : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                          )}>
                            {message.type === 'user' ? (
                              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            ) : message.error ? (
                              <AlertCircle className="h-4 w-4 text-white" />
                            ) : (
                              <Bot className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className={cn(
                              "rounded-lg px-4 py-2",
                              message.type === 'user'
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                : message.error
                                  ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                            )}>
                              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                            </div>
                            {message.type === 'assistant' && (
                              <div className="flex items-center gap-2 px-1">
                                {message.provider && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.provider}
                                  </Badge>
                                )}
                                {message.cached && (
                                  <Badge variant="outline" className="text-xs text-green-600">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Cached
                                  </Badge>
                                )}
                                {message.confidence && (
                                  <span className="text-xs text-gray-500">
                                    {Math.round(message.confidence * 100)}% confidence
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2 text-gray-500"
                      >
                        <Bot className="h-5 w-5" />
                        <div className="flex space-x-1">
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                          >
                            •
                          </motion.span>
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                          >
                            •
                          </motion.span>
                          <motion.span
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                          >
                            •
                          </motion.span>
                        </div>
                      </motion.div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Actions */}
                  {messages.length === 1 && (
                    <div className="px-4 pb-2">
                      <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickActions.map((action, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setInputValue(action.replace(/^[^\s]+ /, ''))
                              handleSend()
                            }}
                            className="text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full px-3 py-1 transition-colors"
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about AI..."
                        disabled={isTyping}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={isTyping || !inputValue.trim()}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                      >
                        {isTyping ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Powered by Enterprise AI • Semantic Cache • Multi-Agent System
                    </p>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}