// Enhanced Customer Care Knowledge Base

export interface CustomerIntent {
  type: 'inquiry' | 'support' | 'sales' | 'complaint' | 'appointment' | 'pricing' | 'technical'
  urgency: 'low' | 'medium' | 'high'
  requiresHuman: boolean
}

export interface CustomerProfile {
  isReturning: boolean
  previousInteractions: number
  interests: string[]
  stage: 'awareness' | 'consideration' | 'decision' | 'retention'
}

// Customer Care Responses
export const customerCareResponses = {
  greetings: {
    new: [
      "Hello! 👋 Welcome to Videbimus AI. I'm your personal AI assistant, here to help you explore how our AI solutions can transform your business. How can I assist you today?",
      "Hi there! I'm excited to help you discover the power of AI for your organization. Whether you're looking for information, need support, or want to schedule a consultation, I'm here to help. What brings you to Videbimus AI today?"
    ],
    returning: [
      "Welcome back! 👋 Great to see you again. How can I help you today?",
      "Hello again! I'm here to continue assisting you with your AI journey. What would you like to explore today?"
    ]
  },

  // Sales-focused responses
  sales: {
    discovery: [
      "I'd love to understand your business needs better. Could you tell me:\n1. What industry are you in?\n2. What's your biggest operational challenge right now?\n3. Have you explored AI solutions before?\n\nThis will help me recommend the most relevant solutions for you.",
      "Let me help you find the perfect AI solution. To get started, I need to know:\n• Your company size and industry\n• Your main pain points or goals\n• Your timeline for implementation\n\nFeel free to share as much or as little as you're comfortable with."
    ],
    qualification: [
      "Based on what you've shared, our [specific service] could be a great fit. To ensure we provide the most accurate proposal:\n• What's your budget range for this initiative?\n• Who are the key decision-makers involved?\n• What's your ideal timeline for seeing results?",
      "It sounds like you're ready to take the next step! To connect you with the right expert:\n• What's your role in the organization?\n• Are you evaluating multiple solutions?\n• When would you like to have a solution in place?"
    ],
    objectionHandling: {
      price: "I understand budget is an important consideration. Our solutions typically deliver 200%+ ROI within 18 months. We also offer flexible pricing models and can start with a smaller pilot project to prove value. Would you like to discuss a custom package that fits your budget?",
      timeline: "We specialize in rapid implementation - most clients see their MVP within 6-8 weeks. We can also phase the project to deliver quick wins early. Would you like to see a sample timeline for your specific needs?",
      trust: "That's a valid concern. We're a new company founded in 2025, but our team brings 50+ years of combined experience from leading tech companies. We'd be happy to share case studies and references. Would you prefer to start with a small pilot project?"
    }
  },

  // Support responses
  support: {
    technical: "I can help with technical questions! Please describe the issue you're experiencing, and I'll either provide a solution or connect you with our technical team for immediate assistance.",
    billing: "For billing inquiries, I can connect you directly with our finance team. Would you prefer to discuss this via email at consulting@videbimus.ai or schedule a call?",
    general: "I'm here to help! Please describe what you need assistance with, and I'll make sure you get the right support quickly."
  },

  // Appointment scheduling
  appointment: {
    initial: "Excellent! I can help you schedule a free 30-minute consultation with our AI experts. Here are our available slots for this week:\n\n📅 Monday-Friday: 9 AM - 6 PM GMT\n\nWhat day and time work best for you? I'll also need your:\n• Name\n• Company\n• Email\n• Phone number",
    confirmation: "Perfect! I've scheduled your consultation for [DATE/TIME]. You'll receive a confirmation email shortly with:\n• Meeting link\n• Agenda\n• Preparation materials\n\nIs there anything specific you'd like to discuss during the call?",
    reminder: "Just a reminder: You have a consultation scheduled with us tomorrow at [TIME]. We're looking forward to discussing how AI can transform your business. Do you have any questions before the meeting?"
  },

  // Pricing discussions
  pricing: {
    general: "Our pricing is customized based on your specific needs and project scope. Typically, our engagements range from:\n\n• Discovery Projects: £5,000 - £15,000\n• Implementation: £25,000 - £150,000\n• Enterprise Transformation: £100,000+\n\nWould you like a custom quote for your specific requirements?",
    budget: "We understand budget planning is crucial. We offer:\n• Flexible payment terms\n• Phased implementation options\n• ROI-based pricing models\n• Pilot projects starting from £5,000\n\nLet's discuss what works best for your organization.",
    value: "Our clients typically see:\n• 200%+ ROI within 18 months\n• 20-50% cost reduction\n• 15-40% revenue increase\n• 60% faster decision-making\n\nThe investment pays for itself quickly. Would you like to see a detailed ROI calculation for your use case?"
  },

  // Lead capture
  leadCapture: {
    email: "To send you more detailed information, could you please share your email address? We promise no spam - just valuable insights about AI transformation.",
    phone: "Would you like to receive a call from our team? Please share your phone number and preferred time to call, and we'll reach out within 24 hours.",
    company: "To provide more relevant information, could you tell me which company you represent and your role there?",
    followUp: "Thank you for sharing your information! I've noted your interest in [TOPIC]. Our team will reach out within 24 hours with personalized recommendations. In the meantime, would you like to explore any other aspects of our services?"
  },

  // Urgency creators
  urgency: {
    limitedTime: "🎯 Special opportunity: We're currently offering complimentary AI readiness assessments (usually £2,500) for qualified businesses this month. Would you like to secure one of the remaining slots?",
    competitiveAdvantage: "Did you know that 75% of enterprises will shift from piloting to operationalizing AI by 2025? Don't let your competitors get ahead. Let's discuss how to fast-track your AI implementation.",
    fastResults: "Many of our clients start seeing results within 4 weeks of implementation. The sooner you start, the sooner you'll see ROI. Shall we schedule a call this week to get you started?"
  },

  // Trust builders
  trust: {
    expertise: "Our team includes AI architects and data scientists with decades of experience. We've worked on projects ranging from predictive maintenance in manufacturing to patient care optimization in healthcare.",
    security: "Security is our top priority. We implement bank-level encryption, maintain GDPR compliance, and ensure 99.9% uptime. Your data is always protected and remains your property.",
    flexibility: "Every business is unique. We don't believe in one-size-fits-all solutions. Our approach is always customized to your specific needs, industry requirements, and growth objectives."
  },

  // Closing statements
  closing: {
    soft: "Is there anything else you'd like to know about our AI solutions? I'm here to help you make the best decision for your business.",
    medium: "Based on our conversation, I believe we can really help transform your operations. What would be the best next step for you - a detailed proposal or a consultation call?",
    hard: "You've shown great interest in our [SOLUTION]. To move forward, I just need to collect a few details and we can have a proposal ready within 48 hours. Shall we proceed?"
  }
};

// Intent detection patterns
export const intentPatterns = {
  appointment: ['schedule', 'meeting', 'consultation', 'call', 'appointment', 'book', 'demo', 'speak', 'talk'],
  pricing: ['price', 'cost', 'budget', 'investment', 'how much', 'fee', 'pricing', 'quote', 'proposal'],
  support: ['help', 'issue', 'problem', 'not working', 'error', 'bug', 'support', 'assistance'],
  sales: ['interested', 'learn more', 'tell me about', 'how does', 'what is', 'can you', 'do you offer'],
  complaint: ['unhappy', 'disappointed', 'frustrated', 'angry', 'not satisfied', 'complaint', 'terrible'],
  technical: ['integrate', 'api', 'technical', 'implementation', 'architecture', 'infrastructure', 'data']
};

// Customer journey stages
export const journeyResponses = {
  awareness: {
    focus: 'education',
    responses: ['Let me help you understand how AI can benefit your business...', 'Here are the key ways AI is transforming businesses like yours...']
  },
  consideration: {
    focus: 'comparison',
    responses: ['Let me show you what makes our approach unique...', 'Here\'s how we compare to other solutions...']
  },
  decision: {
    focus: 'reassurance',
    responses: ['You\'re making a smart choice. Let me address any final concerns...', 'Here\'s exactly what you can expect when working with us...']
  },
  retention: {
    focus: 'support',
    responses: ['We\'re here to ensure your continued success...', 'Let me help you get the most from your AI investment...']
  }
};

// Emotional response handling
export const emotionalResponses = {
  frustrated: "I understand your frustration, and I'm here to help resolve this quickly. Let me connect you with the right person who can address your concerns immediately.",
  confused: "I can see this might be overwhelming. Let me break this down into simple terms and guide you step by step.",
  excited: "Your enthusiasm is fantastic! Let's channel that energy into creating something amazing for your business.",
  skeptical: "Your caution is completely understandable. Let me share some concrete examples and data that might address your concerns.",
  urgent: "I understand this is time-sensitive. Let me fast-track your request and get you immediate assistance."
};