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
  Loader2,
  AlertCircle,
  CheckCircle,
  Calendar,
  DollarSign,
  FileText,
  Headphones,
  TrendingUp,
  ChevronDown,
  Phone,
  Mail,
  Clock,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// Business context from Vidibemus AI
const BUSINESS_CONTEXT = {
  company: 'Vidibemus AI',
  tagline: 'Transforming Business with AI & Data Science',
  services: {
    discovery: {
      name: 'AI Discovery & Strategy',
      duration: '2-4 weeks',
      features: ['AI Readiness Assessment', 'Strategic Roadmap', 'POC Development', 'ROI Analysis'],
      startingPrice: '$25,000'
    },
    implementation: {
      name: 'AI Implementation',
      duration: '3-6 months', 
      features: ['Custom AI Solutions', 'System Integration', 'Team Training', 'Ongoing Support'],
      startingPrice: '$100,000'
    },
    transformation: {
      name: 'Enterprise Transformation',
      duration: '6-18 months',
      features: ['Enterprise AI Platform', 'Center of Excellence', 'Governance Framework', '24/7 Support'],
      startingPrice: 'Custom Quote'
    }
  },
  specializations: [
    'Machine Learning & Deep Learning',
    'Predictive Analytics',
    'Natural Language Processing',
    'Computer Vision',
    'Process Automation',
    'Data Engineering',
    'Business Intelligence'
  ],
  industries: ['Healthcare', 'Finance', 'Manufacturing', 'Retail', 'Technology'],
  stats: {
    projectsCompleted: '150+',
    clientSatisfaction: '98%',
    averageROI: '300%',
    teamExperts: '50+'
  }
}

// Proactive engagement triggers
interface EngagementTrigger {
  id: string
  condition: (context: UserContext) => boolean
  message: string
  delay: number
  priority: number
  actionButtons?: ActionButton[]
}

interface ActionButton {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  action: string
  style?: 'primary' | 'secondary' | 'ghost'
}

interface UserContext {
  pageUrl: string
  timeOnPage: number
  scrollDepth: number
  mouseInactive: boolean
  previousPages: string[]
  isReturningVisitor: boolean
  lastVisit?: Date
  interactions: number
  intent?: 'pricing' | 'services' | 'demo' | 'support' | 'general'
}

interface Message {
  id: string
  type: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  confidence?: number
  provider?: string
  cached?: boolean
  error?: boolean
  actionButtons?: ActionButton[]
  quickReplies?: string[]
}

// Conversation states for lead nurturing
type ConversationStage = 'awareness' | 'interest' | 'consideration' | 'intent' | 'evaluation' | 'purchase'

export function CustomerServiceBot() {
  // State management
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [sessionId, setSessionId] = useState<string>('')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'error'>('connected')
  const [conversationStage, setConversationStage] = useState<ConversationStage>('awareness')
  const [userContext, setUserContext] = useState<UserContext>({
    pageUrl: typeof window !== 'undefined' ? window.location.pathname : '/',
    timeOnPage: 0,
    scrollDepth: 0,
    mouseInactive: false,
    previousPages: [],
    isReturningVisitor: false,
    interactions: 0
  })
  const [hasEngaged, setHasEngaged] = useState(false)
  const [leadScore, setLeadScore] = useState(0)
  const [userInfo, setUserInfo] = useState<{
    name?: string
    email?: string
    company?: string
    role?: string
    budget?: string
    timeline?: string
    needs?: string[]
  }>({})

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const pageTimerRef = useRef<NodeJS.Timeout>()
  const inactivityTimerRef = useRef<NodeJS.Timeout>()

  // Function to generate dynamic message based on context
  const generateWelcomeMessage = (ctx: UserContext) => {
    const pageType = ctx.pageUrl.includes('services') ? 'services' : 
                     ctx.pageUrl.includes('pricing') ? 'pricing options' : 
                     'AI solutions';
    return `👋 Welcome to Vidibemus AI! I'm Alex, your AI consultant. I see you're exploring our ${pageType}. Can I help you find what you're looking for?`;
  };

  // Proactive engagement triggers
  const engagementTriggers: EngagementTrigger[] = [
    {
      id: 'welcome_first_time',
      condition: (ctx) => !ctx.isReturningVisitor && ctx.timeOnPage > 3000 && ctx.interactions === 0,
      message: '', // Will be set dynamically
      delay: 3000,
      priority: 1,
      actionButtons: [
        { label: 'Show me your services', icon: Sparkles, action: 'show_services', style: 'primary' },
        { label: 'I need pricing info', icon: DollarSign, action: 'show_pricing', style: 'secondary' },
        { label: 'Schedule a demo', icon: Calendar, action: 'schedule_demo', style: 'secondary' }
      ]
    },
    {
      id: 'returning_visitor',
      condition: (ctx) => ctx.isReturningVisitor && ctx.timeOnPage > 2000,
      message: `Welcome back! 🎉 I noticed you've been exploring our AI solutions. Ready to take the next step? Many of our clients start with a free AI readiness assessment.`,
      delay: 2000,
      priority: 1,
      actionButtons: [
        { label: 'Get free assessment', icon: Target, action: 'free_assessment', style: 'primary' },
        { label: 'Talk to an expert', icon: Headphones, action: 'expert_call', style: 'secondary' }
      ]
    },
    {
      id: 'high_scroll_engagement',
      condition: (ctx) => ctx.scrollDepth > 70 && ctx.timeOnPage > 30000,
      message: `I see you're really diving deep into our content! 🔍 You seem like someone who values thorough research. Would you like me to send you our comprehensive AI implementation guide?`,
      delay: 1000,
      priority: 2,
      actionButtons: [
        { label: 'Yes, send the guide', icon: FileText, action: 'send_guide', style: 'primary' },
        { label: 'I have questions', icon: MessageCircle, action: 'ask_questions', style: 'secondary' }
      ]
    },
    {
      id: 'pricing_page_engagement',
      condition: (ctx) => ctx.pageUrl.includes('pricing') && ctx.timeOnPage > 10000,
      message: `💡 Looking at our pricing? Every business is unique, so we customize our solutions to fit your needs and budget. Want to discuss what would work best for you?`,
      delay: 10000,
      priority: 1,
      actionButtons: [
        { label: 'Get custom quote', icon: DollarSign, action: 'custom_quote', style: 'primary' },
        { label: 'Compare packages', icon: TrendingUp, action: 'compare_packages', style: 'secondary' }
      ]
    },
    {
      id: 'exit_intent',
      condition: (ctx) => ctx.mouseInactive && ctx.timeOnPage > 15000 && ctx.interactions < 2,
      message: `Wait! Before you go... 🎁 I can offer you a free 30-minute consultation with our AI experts. No obligations, just valuable insights for your business.`,
      delay: 500,
      priority: 3,
      actionButtons: [
        { label: 'Claim free consultation', icon: Zap, action: 'free_consultation', style: 'primary' },
        { label: 'Download case studies', icon: FileText, action: 'case_studies', style: 'secondary' }
      ]
    }
  ]

  // Helper functions
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const updateLeadScore = (points: number) => {
    setLeadScore(prev => Math.min(100, prev + points))
  }

  const addMessage = useCallback((
    type: 'user' | 'assistant' | 'system',
    content: string,
    extra?: Partial<Message>
  ) => {
    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date(),
      ...extra
    }
    setMessages(prev => [...prev, newMessage])
    
    // Update interaction count
    if (type === 'user') {
      setUserContext(prev => ({ ...prev, interactions: prev.interactions + 1 }))
      updateLeadScore(5)
    }
  }, [])

  // Behavioral tracking
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Track time on page
    const startTime = Date.now()
    pageTimerRef.current = setInterval(() => {
      setUserContext(prev => ({
        ...prev,
        timeOnPage: Date.now() - startTime
      }))
    }, 1000)

    // Track scroll depth
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      setUserContext(prev => ({
        ...prev,
        scrollDepth: Math.max(prev.scrollDepth, scrollPercentage)
      }))
    }

    // Track mouse inactivity
    let inactivityTimer: NodeJS.Timeout
    const resetInactivityTimer = () => {
      setUserContext(prev => ({ ...prev, mouseInactive: false }))
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        setUserContext(prev => ({ ...prev, mouseInactive: true }))
      }, 10000)
    }

    // Check for returning visitor
    const lastVisit = localStorage.getItem('vidibemus_last_visit')
    if (lastVisit) {
      setUserContext(prev => ({
        ...prev,
        isReturningVisitor: true,
        lastVisit: new Date(lastVisit)
      }))
    }
    localStorage.setItem('vidibemus_last_visit', new Date().toISOString())

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('mousemove', resetInactivityTimer)

    return () => {
      clearInterval(pageTimerRef.current)
      clearTimeout(inactivityTimer)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', resetInactivityTimer)
    }
  }, [])

  // Proactive engagement logic
  useEffect(() => {
    if (hasEngaged || isOpen) return

    const checkTriggers = () => {
      const applicableTriggers = engagementTriggers
        .filter(trigger => trigger.condition(userContext))
        .sort((a, b) => a.priority - b.priority)

      if (applicableTriggers.length > 0) {
        const trigger = applicableTriggers[0]
        setTimeout(() => {
          if (!isOpen && !hasEngaged) {
            setIsOpen(true)
            setHasEngaged(true)
            // Generate dynamic message based on trigger type
            let message = trigger.message;
            if (trigger.id === 'welcome_first_time') {
              message = generateWelcomeMessage(userContext);
            }
            addMessage('assistant', message, {
              actionButtons: trigger.actionButtons,
              provider: 'Proactive Engagement'
            })
          }
        }, trigger.delay)
      }
    }

    const triggerCheckInterval = setInterval(checkTriggers, 2000)
    return () => clearInterval(triggerCheckInterval)
  }, [userContext, hasEngaged, isOpen, addMessage])

  // Initialize welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = `👋 Hi! I'm Alex, your AI consultant at Vidibemus AI. 

I'm here to help you:
• 🎯 Discover how AI can transform your business
• 💡 Find the perfect solution for your needs  
• 📊 Get ROI estimates and pricing
• 📅 Schedule demos or consultations

What brings you here today?`

      addMessage('assistant', welcomeMessage, {
        provider: 'System',
        quickReplies: [
          '🚀 Explore AI solutions',
          '💰 View pricing & packages',
          '📈 See case studies',
          '🤝 Talk to an expert'
        ]
      })
    }
  }, [isOpen, messages.length, addMessage])

  // Handle user input
  const handleSend = async () => {
    if (!inputValue.trim()) return

    const userMessage = inputValue.trim()
    setInputValue('')
    addMessage('user', userMessage)
    setIsTyping(true)
    setConnectionStatus('connecting')

    // Analyze user intent
    const intent = analyzeIntent(userMessage)
    setUserContext(prev => ({ ...prev, intent }))

    // Update conversation stage based on intent
    updateConversationStage(intent, userMessage)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          sessionId,
          stream: true,
          useRAG: true,
          systemPrompt: generateSystemPrompt(),
          context: {
            userInfo,
            conversationStage,
            leadScore,
            businessContext: BUSINESS_CONTEXT
          }
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      setConnectionStatus('connected')

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let accumulatedContent = ''
      let messageId = `msg_${Date.now()}`

      addMessage('assistant', '', { id: messageId })

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            
            try {
              const parsed = JSON.parse(data)
              if (parsed.content) {
                accumulatedContent += parsed.content
                setMessages(prev => prev.map(msg => 
                  msg.id === messageId 
                    ? { ...msg, content: accumulatedContent }
                    : msg
                ))
              }
            } catch (e) {
              console.error('Parse error:', e)
            }
          }
        }
      }

      // Add contextual quick replies based on stage
      const quickReplies = getContextualQuickReplies(conversationStage, intent)
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, quickReplies }
          : msg
      ))

    } catch (error) {
      console.error('Chat error:', error)
      setConnectionStatus('error')
      addMessage('assistant', 'I apologize for the technical issue. Please try again or call us directly at 1-800-VIDEBIM.', {
        error: true
      })
    } finally {
      setIsTyping(false)
      setConnectionStatus('connected')
    }
  }

  // Intent analysis
  const analyzeIntent = (message: string): UserContext['intent'] => {
    const lower = message.toLowerCase()
    if (lower.includes('price') || lower.includes('cost') || lower.includes('budget')) return 'pricing'
    if (lower.includes('demo') || lower.includes('trial') || lower.includes('test')) return 'demo'
    if (lower.includes('help') || lower.includes('support') || lower.includes('issue')) return 'support'
    if (lower.includes('service') || lower.includes('solution') || lower.includes('implement')) return 'services'
    return 'general'
  }

  // Update conversation stage
  const updateConversationStage = (intent: UserContext['intent'], message: string) => {
    const lower = message.toLowerCase()
    
    if (lower.includes('just looking') || lower.includes('research')) {
      setConversationStage('awareness')
    } else if (lower.includes('interested') || lower.includes('tell me more')) {
      setConversationStage('interest')
      updateLeadScore(10)
    } else if (lower.includes('compare') || lower.includes('options')) {
      setConversationStage('consideration')
      updateLeadScore(15)
    } else if (lower.includes('pricing') || lower.includes('quote')) {
      setConversationStage('intent')
      updateLeadScore(20)
    } else if (lower.includes('demo') || lower.includes('trial')) {
      setConversationStage('evaluation')
      updateLeadScore(25)
    } else if (lower.includes('ready') || lower.includes('start') || lower.includes('buy')) {
      setConversationStage('purchase')
      updateLeadScore(30)
    }
  }

  // Generate contextual system prompt
  const generateSystemPrompt = () => {
    return `You are Alex, a senior AI consultant at Vidibemus AI. You are professional, knowledgeable, and focused on helping businesses transform with AI.

Current conversation stage: ${conversationStage}
Lead score: ${leadScore}/100
User intent: ${userContext.intent || 'general'}

Your goals:
1. Qualify the lead by understanding their needs, budget, and timeline
2. Provide valuable insights about AI transformation
3. Guide them toward booking a consultation or demo
4. Collect contact information naturally in conversation
5. Be consultative, not pushy

Company context: ${JSON.stringify(BUSINESS_CONTEXT)}
User info collected: ${JSON.stringify(userInfo)}

Always be helpful, professional, and focused on providing value. Use data and statistics when relevant.`
  }

  // Get contextual quick replies
  const getContextualQuickReplies = (stage: ConversationStage, intent?: UserContext['intent']): string[] => {
    const replies: Record<ConversationStage, string[]> = {
      awareness: ['Tell me more', 'What services do you offer?', 'Show me case studies'],
      interest: ['How does it work?', 'What\'s the ROI?', 'Who are your clients?'],
      consideration: ['Compare packages', 'Pricing details', 'Implementation timeline'],
      intent: ['Get a quote', 'Schedule consultation', 'Technical requirements'],
      evaluation: ['Book a demo', 'Free trial options', 'Success stories'],
      purchase: ['Start now', 'Contract details', 'Next steps']
    }
    return replies[stage] || []
  }

  // Handle action buttons
  const handleActionButton = (action: string) => {
    const actions: Record<string, () => void> = {
      show_services: () => {
        const servicesMessage = `Our AI transformation services:

🎯 **AI Discovery & Strategy** (2-4 weeks, from $25K)
• AI readiness assessment
• Strategic roadmap development
• Proof of concept
• ROI analysis

⚙️ **AI Implementation** (3-6 months, from $100K)
• Custom AI solution development
• System integration
• Team training
• Ongoing support

🏢 **Enterprise Transformation** (6-18 months, custom pricing)
• Full AI platform development
• Center of Excellence setup
• Governance framework
• 24/7 enterprise support

Which service interests you most?`
        addMessage('assistant', servicesMessage, {
          quickReplies: ['Discovery & Strategy', 'Implementation', 'Enterprise', 'Not sure, need guidance']
        })
      },
      show_pricing: () => {
        addMessage('assistant', 'I\'ll help you find the right pricing package. What\'s your approximate budget range for AI initiatives?', {
          quickReplies: ['< $50K', '$50K - $200K', '$200K - $500K', '> $500K', 'Need to discuss']
        })
      },
      schedule_demo: () => {
        addMessage('assistant', 'Excellent! I can schedule a personalized demo for you. What\'s the best email to send the calendar invite to?')
        setConversationStage('evaluation')
        updateLeadScore(30)
      },
      free_assessment: () => {
        addMessage('assistant', 'Great choice! Our free AI readiness assessment takes just 15 minutes and provides valuable insights. May I have your name and email to get started?')
        updateLeadScore(20)
      }
    }
    
    const selectedAction = actions[action]
    if (selectedAction) selectedAction()
  }

  // Handle quick replies
  const handleQuickReply = (reply: string) => {
    setInputValue(reply)
    handleSend()
  }

  const toggleChat = () => {
    setIsOpen(!isOpen)
    setIsMinimized(false)
    if (!isOpen) {
      setHasEngaged(true)
      updateLeadScore(10)
    }
  }

  return (
    <>
      {/* Floating Button with Attention-Grabbing Animation */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={toggleChat}
            className="fixed bottom-6 right-6 z-50 group"
          >
            <div className="relative">
              {/* Pulsing background */}
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full opacity-30 blur-xl"
              />
              
              {/* Main button */}
              <div className="relative h-16 w-16 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
                <MessageCircle className="h-7 w-7" />
                
                {/* Notification badge */}
                {!hasEngaged && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute -top-1 -right-1 h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold"
                  >
                    1
                  </motion.span>
                )}
                
                {/* "AI" label */}
                <span className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 text-cyan-500 text-xs font-bold px-2 py-0.5 rounded-full shadow-md">
                  AI
                </span>
              </div>
              
              {/* Hover tooltip */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-full right-0 mb-2 w-48 p-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg pointer-events-none"
              >
                <p className="font-semibold">Need help with AI?</p>
                <p className="text-xs opacity-90">Chat with our AI consultant</p>
              </motion.div>
            </div>
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
              "fixed bottom-6 right-6 z-50 shadow-2xl",
              isMinimized 
                ? "w-80"
                : "w-[400px] md:w-[450px]"
            )}
            style={{
              maxHeight: 'calc(100vh - 100px)',
              height: isMinimized ? 'auto' : '650px'
            }}
          >
            <Card className={cn(
              "flex flex-col bg-white dark:bg-gray-900 border-0 overflow-hidden h-full",
              "relative" // Important for scroll containment
            )}>
              {/* Header with Lead Score Indicator */}
              <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Bot className="h-6 w-6" />
                    </div>
                    <span className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white",
                      connectionStatus === 'connected' && "bg-green-500",
                      connectionStatus === 'connecting' && "bg-yellow-500 animate-pulse",
                      connectionStatus === 'error' && "bg-red-500"
                    )} />
                  </div>
                  <div>
                    <h3 className="font-semibold">Alex - AI Consultant</h3>
                    <p className="text-xs opacity-90">
                      {leadScore > 50 ? '🔥 High Intent' : 
                       leadScore > 20 ? '⭐ Qualified Lead' : 
                       'Vidibemus AI'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {leadScore > 0 && (
                    <Badge className="bg-white/20 text-white border-white/40">
                      Score: {leadScore}
                    </Badge>
                  )}
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="hover:bg-white/20 p-1.5 rounded transition-colors"
                  >
                    {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={toggleChat}
                    className="hover:bg-white/20 p-1.5 rounded transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>

              {!isMinimized && (
                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                  {/* Messages with isolated scroll */}
                  <ScrollArea 
                    className="flex-1 px-4 py-4"
                    style={{ 
                      height: 'calc(100% - 140px)', // Adjust based on input area height
                      overflowY: 'auto',
                      overscrollBehavior: 'contain' // Prevents scroll chaining
                    }}
                  >
                    <div className="space-y-4 pr-4">
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
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500' 
                                : message.error 
                                  ? 'bg-red-500'
                                  : message.type === 'system'
                                    ? 'bg-gray-500'
                                    : 'bg-gradient-to-r from-cyan-500 to-purple-500'
                            )}>
                              {message.type === 'user' ? (
                                <User className="h-4 w-4 text-white" />
                              ) : message.error ? (
                                <AlertCircle className="h-4 w-4 text-white" />
                              ) : (
                                <Bot className="h-4 w-4 text-white" />
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className={cn(
                                "rounded-2xl px-4 py-2.5",
                                message.type === 'user'
                                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                                  : message.error
                                    ? 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                              )}>
                                <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                              </div>
                              
                              {/* Action Buttons */}
                              {message.actionButtons && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {message.actionButtons.map((button, idx) => (
                                    <Button
                                      key={idx}
                                      size="sm"
                                      variant={button.style === 'primary' ? 'default' : button.style === 'ghost' ? 'ghost' : 'outline'}
                                      onClick={() => handleActionButton(button.action)}
                                      className={cn(
                                        "text-xs",
                                        button.style === 'primary' && "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:from-cyan-600 hover:to-purple-600"
                                      )}
                                    >
                                      {button.icon && <button.icon className="h-3 w-3 mr-1" />}
                                      {button.label}
                                    </Button>
                                  ))}
                                </div>
                              )}
                              
                              {/* Quick Replies */}
                              {message.quickReplies && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {message.quickReplies.map((reply, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => handleQuickReply(reply)}
                                      className="text-xs bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-full px-3 py-1.5 transition-colors"
                                    >
                                      {reply}
                                    </button>
                                  ))}
                                </div>
                              )}
                              
                              {/* Metadata */}
                              {message.type === 'assistant' && message.provider && (
                                <div className="flex items-center gap-2 px-1 mt-1">
                                  <span className="text-xs text-gray-500">
                                    {message.provider}
                                  </span>
                                  {message.cached && (
                                    <Badge variant="outline" className="text-xs h-5">
                                      <Zap className="h-3 w-3 mr-1" />
                                      Instant
                                    </Badge>
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
                          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5">
                            <div className="flex space-x-1">
                              <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                              />
                              <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                              />
                              <motion.span
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                                className="w-2 h-2 bg-gray-500 rounded-full"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Trust Indicators */}
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center justify-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Shield className="h-3 w-3 mr-1 text-green-500" />
                        Secure
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1 text-blue-500" />
                        24/7 Available
                      </span>
                      <span className="flex items-center">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        98% Satisfaction
                      </span>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="border-t p-4 bg-white dark:bg-gray-900 shrink-0">
                    <div className="flex space-x-2">
                      <Input
                        ref={inputRef}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                          }
                        }}
                        placeholder="Type your message..."
                        disabled={isTyping}
                        className="flex-1"
                      />
                      <Button
                        onClick={handleSend}
                        disabled={isTyping || !inputValue.trim()}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white"
                      >
                        {isTyping ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    
                    {/* Quick Actions for High-Intent Leads */}
                    {leadScore > 30 && (
                      <div className="flex items-center justify-center space-x-2 mt-3 pt-3 border-t">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-xs"
                          onClick={() => handleActionButton('schedule_call')}
                        >
                          <Phone className="h-3 w-3 mr-1" />
                          Call Now
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-xs"
                          onClick={() => handleActionButton('schedule_demo')}
                        >
                          <Calendar className="h-3 w-3 mr-1" />
                          Book Demo
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-xs"
                          onClick={() => handleActionButton('email_quote')}
                        >
                          <Mail className="h-3 w-3 mr-1" />
                          Email Quote
                        </Button>
                      </div>
                    )}
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