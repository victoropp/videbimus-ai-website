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
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { queryProcessor, QueryResult } from '@/lib/ai-assistant/query-processor'
import { quickQuestions } from '@/lib/ai-assistant/knowledge-base'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  confidence?: number
  relatedQuestions?: string[]
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus()
    }
  }, [isOpen, isMinimized])

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

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    // Add user message
    addMessage('user', message)
    setInputValue('')
    setIsTyping(true)

    // Simulate typing delay
    setTimeout(() => {
      const result: QueryResult = queryProcessor.processQuery(message)
      
      addMessage('assistant', result.answer, {
        confidence: result.confidence,
        relatedQuestions: result.relatedQuestions
      })
      
      setIsTyping(false)
    }, 1000 + Math.random() * 1000) // 1-2 seconds delay
  }

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question)
  }

  const initializeChat = () => {
    if (messages.length === 0) {
      addMessage('assistant', "👋 Hello! I'm Videbimus AI's intelligent assistant. I can help you learn about our AI consulting services, team expertise, and how we can transform your business. What would you like to know?")
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      initializeChat()
    }
  }

  const TypingIndicator = () => (
    <div className="flex items-center space-x-2 text-gray-500 text-sm">
      <Bot className="h-4 w-4" />
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
      <span>AI Assistant is typing...</span>
    </div>
  )

  const QuickQuestions = () => (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <div className="text-xs text-gray-500 mb-2">Quick questions:</div>
      <div className="flex flex-wrap gap-2">
        {quickQuestions.slice(0, 4).map((question, index) => (
          <button
            key={index}
            onClick={() => handleQuickQuestion(question)}
            className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-cyan-100 dark:hover:bg-cyan-900 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-full transition-colors"
          >
            {question}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={toggleChat}
          size="lg"
          className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300 group relative"
        >
          <motion.div
            animate={isOpen ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
          </motion.div>
          
          {/* Notification dot */}
          <motion.div
            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: isOpen ? 0 : 1 }}
            transition={{ delay: 3 }}
          >
            <Sparkles className="h-2 w-2 text-white" />
          </motion.div>
        </Button>
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
              height: isMinimized ? 60 : 600 
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-96 z-50"
          >
            <Card className="h-full flex flex-col shadow-2xl border-0 bg-white dark:bg-gray-900">
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Videbimus AI Assistant</h3>
                    <p className="text-xs opacity-90">Here to help with your AI questions</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="hover:bg-white/20 p-1 rounded"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={toggleChat}
                    className="hover:bg-white/20 p-1 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="flex-1 flex flex-col p-0">
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-96">
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex items-start space-x-2 max-w-[80%] ${
                          message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                            message.type === 'user' 
                              ? 'bg-gray-200 dark:bg-gray-700' 
                              : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                          }`}>
                            {message.type === 'user' ? (
                              <User className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                            ) : (
                              <Bot className="h-4 w-4 text-white" />
                            )}
                          </div>
                          <div className={`rounded-lg px-3 py-2 ${
                            message.type === 'user'
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            {message.confidence && message.confidence < 0.7 && (
                              <p className="text-xs text-gray-500 mt-1">
                                💡 For detailed information, contact our team directly
                              </p>
                            )}
                            {message.relatedQuestions && message.relatedQuestions.length > 0 && (
                              <div className="mt-2 space-y-1">
                                <p className="text-xs text-gray-500">Related questions:</p>
                                {message.relatedQuestions.map((question, index) => (
                                  <button
                                    key={index}
                                    onClick={() => handleQuickQuestion(question)}
                                    className="block text-xs text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 hover:underline"
                                  >
                                    {question}
                                  </button>
                                ))}
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
                        className="flex justify-start"
                      >
                        <TypingIndicator />
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Questions */}
                  {messages.length <= 1 && <QuickQuestions />}

                  {/* Input */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                        placeholder="Ask me anything about Videbimus AI..."
                        disabled={isTyping}
                        className="flex-1"
                      />
                      <Button
                        onClick={() => handleSendMessage(inputValue)}
                        disabled={isTyping || !inputValue.trim()}
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
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