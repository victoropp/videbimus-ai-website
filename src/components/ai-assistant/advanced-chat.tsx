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
  Phone,
  Mail,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  CheckCircle,
  Clock,
  Building
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { customerCareProcessor } from '@/lib/ai-assistant/advanced-processor'

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  suggestedActions?: string[]
  requiresHuman?: boolean
}

interface CustomerInfo {
  name?: string
  email?: string
  company?: string
  phone?: string
  interests?: string[]
}

export function AdvancedChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({})
  const [showAppointmentForm, setShowAppointmentForm] = useState(false)
  const [sessionId] = useState(`user_${Date.now()}`)
  const [hasEngaged, setHasEngaged] = useState(false)
  
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

  const initializeChat = useCallback(() => {
    if (messages.length === 0) {
      const response = customerCareProcessor.generateResponse('', sessionId, true)
      addMessage('assistant', response.response, {
        suggestedActions: ['Learn more', 'Get started', 'Contact us']
      })
    }
  }, [messages.length, sessionId])

  // Auto-open after delay
  useEffect(() => {
    if (!hasEngaged && !isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        initializeChat()
      }, 15000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [hasEngaged, isOpen, initializeChat])

  const addMessage = (type: Message['type'], content: string, extra?: Partial<Message>) => {
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
    
    setHasEngaged(true)
    addMessage('user', message)
    setInputValue('')
    setIsTyping(true)

    setTimeout(() => {
      const response = customerCareProcessor.generateResponse(
        message, 
        sessionId,
        messages.length === 0
      )
      
      if (response.customerInfo) {
        setCustomerInfo(response.customerInfo)
      }

      addMessage('assistant', response.response, {
        suggestedActions: response.suggestedActions,
        requiresHuman: response.requiresHuman
      })

      if (response.requiresHuman || customerCareProcessor.shouldHandoff(sessionId)) {
        setTimeout(() => {
          addMessage('system', 'A human expert will join this conversation shortly.')
        }, 2000)
      }

      setIsTyping(false)
    }, 1000 + Math.random() * 1500)
  }

  const handleSuggestedAction = (action: string) => {
    if (action === 'Schedule for this week' || action === 'Book consultation') {
      setShowAppointmentForm(true)
    } else if (action === 'Get custom quote') {
      handleSendMessage('I would like to get a custom quote for my project')
    } else if (action === 'See case studies') {
      window.open('/case-studies', '_blank')
    } else {
      handleSendMessage(action)
    }
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setHasEngaged(true)
      initializeChat()
    }
  }

  const handleFeedback = (type: 'positive' | 'negative', messageId: string) => {
    const feedbackMessage = type === 'positive' 
      ? 'Thank you for your feedback! We are glad we could help.' 
      : 'Thank you for your feedback. We will improve our responses.'
    addMessage('system', feedbackMessage)
  }

  const renderAppointmentForm = () => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-4"
      >
        <h4 className="font-semibold mb-3 flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Your Free Consultation
        </h4>
        <div className="space-y-2">
          <Input placeholder="Your Name" className="bg-white" />
          <Input placeholder="Email" type="email" className="bg-white" />
          <Input placeholder="Company" className="bg-white" />
          <Input placeholder="Phone" type="tel" className="bg-white" />
          <select className="w-full p-2 rounded border bg-white">
            <option>Select preferred time</option>
            <option>Monday 9-11 AM GMT</option>
            <option>Tuesday 2-4 PM GMT</option>
            <option>Wednesday 10-12 PM GMT</option>
            <option>Thursday 3-5 PM GMT</option>
            <option>Friday 11-1 PM GMT</option>
          </select>
          <Button 
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500"
            onClick={() => {
              setShowAppointmentForm(false)
              addMessage('system', 'Appointment request submitted! We will confirm within 24 hours.')
            }}
          >
            Confirm Appointment
          </Button>
        </div>
      </motion.div>
    )
  }

  const renderTypingIndicator = () => {
    return (
      <div className="flex items-center space-x-2 text-gray-500 text-sm">
        <Bot className="h-4 w-4 animate-pulse" />
        <div className="flex space-x-1">
          <motion.div 
            className="w-2 h-2 bg-cyan-500 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="w-2 h-2 bg-cyan-500 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div 
            className="w-2 h-2 bg-cyan-500 rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        <span>AI analyzing your request...</span>
      </div>
    )
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
      >
        <div className="relative">
          <Button
            onClick={toggleChat}
            size="lg"
            className="h-14 w-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <motion.div
              animate={isOpen ? { rotate: 180, scale: 0.8 } : { rotate: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </motion.div>
          </Button>
          
          {/* Notification */}
          {!isOpen && !hasEngaged && (
            <motion.div
              className="absolute -top-1 -right-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 2 }}
            >
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 items-center justify-center">
                  <span className="text-white text-xs font-bold">1</span>
                </span>
              </span>
            </motion.div>
          )}

          {/* Floating message */}
          {!isOpen && !hasEngaged && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 3 }}
              className="absolute bottom-0 right-16 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 border"
            >
              <div className="flex items-start space-x-2">
                <Bot className="h-5 w-5 text-cyan-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Need help with AI?</p>
                  <p className="text-xs text-gray-500 mt-1">
                    I can help you explore our solutions and schedule a consultation.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
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
              height: isMinimized ? 60 : 650 
            }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-24 right-6 w-[420px] z-50"
          >
            <Card className="h-full flex flex-col shadow-2xl border-0 bg-white dark:bg-gray-900 overflow-hidden">
              {/* Header */}
              <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6" />
                    </div>
                    <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 border-2 border-white"></span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Videbimus AI Assistant</h3>
                    <p className="text-xs opacity-90 flex items-center">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online • Typically replies instantly
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
                <>
                  {/* Customer info bar */}
                  {(customerInfo.email || customerInfo.company) && (
                    <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-4">
                          {customerInfo.email && (
                            <div className="flex items-center">
                              <Mail className="h-3 w-3 mr-1 text-gray-500" />
                              <span>{customerInfo.email}</span>
                            </div>
                          )}
                          {customerInfo.company && (
                            <div className="flex items-center">
                              <Building className="h-3 w-3 mr-1 text-gray-500" />
                              <span>{customerInfo.company}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <CardContent className="flex-1 flex flex-col p-0">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
                      {showAppointmentForm && renderAppointmentForm()}
                      
                      {messages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${
                            message.type === 'user' ? 'justify-end' : 
                            message.type === 'system' ? 'justify-center' : 'justify-start'
                          }`}
                        >
                          {message.type === 'system' ? (
                            <div className="bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1 text-xs text-gray-600 dark:text-gray-400">
                              {message.content}
                            </div>
                          ) : (
                            <div className={`flex items-start space-x-2 max-w-[85%] ${
                              message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                            }`}>
                              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
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
                              <div>
                                <div className={`rounded-lg px-4 py-2 ${
                                  message.type === 'user'
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                                }`}>
                                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                                
                                {/* Suggested actions */}
                                {message.suggestedActions && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {message.suggestedActions.map((action, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSuggestedAction(action)}
                                        className="text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 px-3 py-1 rounded-full transition-colors"
                                      >
                                        {action}
                                      </button>
                                    ))}
                                  </div>
                                )}
                                
                                {/* Feedback buttons */}
                                {message.type === 'assistant' && (
                                  <div className="flex items-center space-x-2 mt-2">
                                    <button
                                      onClick={() => handleFeedback('positive', message.id)}
                                      className="text-gray-400 hover:text-green-500 transition-colors"
                                    >
                                      <ThumbsUp className="h-3 w-3" />
                                    </button>
                                    <button
                                      onClick={() => handleFeedback('negative', message.id)}
                                      className="text-gray-400 hover:text-red-500 transition-colors"
                                    >
                                      <ThumbsDown className="h-3 w-3" />
                                    </button>
                                    {message.requiresHuman && (
                                      <Badge variant="outline" className="text-xs ml-2">
                                        <Phone className="h-3 w-3 mr-1" />
                                        Human expert notified
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                      
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex justify-start"
                        >
                          {renderTypingIndicator()}
                        </motion.div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex space-x-2">
                        <Input
                          ref={inputRef}
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage(inputValue)}
                          placeholder="Type your message..."
                          disabled={isTyping}
                          className="flex-1 bg-white dark:bg-gray-800"
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
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        <Clock className="h-3 w-3 inline mr-1" />
                        Available 24/7 • Avg response time: 2 seconds
                      </p>
                    </div>
                  </CardContent>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}