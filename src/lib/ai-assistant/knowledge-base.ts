// Company Knowledge Base for AI Assistant

export interface KnowledgeItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
  tags: string[];
}

export const knowledgeBase: KnowledgeItem[] = [
  // Company Information
  {
    id: "company-about",
    category: "About",
    question: "What is Videbimus AI?",
    answer: "Videbimus AI is a cutting-edge AI consulting company founded in 2025. We bring together decades of combined experience from senior AI experts, data scientists, and engineers to help businesses transform through intelligent automation and data-driven insights.",
    keywords: ["company", "about", "videbimus", "what is", "who are"],
    tags: ["company", "introduction"]
  },
  {
    id: "company-founded",
    category: "About",
    question: "When was Videbimus AI founded?",
    answer: "Videbimus AI was founded in Q1 2025. While we're a new company, our team brings over 50+ years of combined experience in AI, machine learning, and enterprise solutions.",
    keywords: ["founded", "when", "established", "started", "history"],
    tags: ["company", "history"]
  },
  {
    id: "team-experience",
    category: "Team",
    question: "What experience does your team have?",
    answer: "Our team has 50+ years of combined experience in AI and machine learning. We have 8 expert team members with extensive backgrounds in AI architecture, data science, and enterprise technology solutions. Our team brings proven expertise from leading tech companies and research institutions.",
    keywords: ["team", "experience", "expertise", "background", "qualifications"],
    tags: ["team", "experience"]
  },

  // Services
  {
    id: "services-overview",
    category: "Services",
    question: "What services do you offer?",
    answer: "We offer comprehensive AI consulting services including: AI Discovery & Strategy, AI Implementation, Enterprise Transformation, Machine Learning solutions, and 24/7 ongoing support. We specialize in rapid implementation with 6-8 weeks to MVP.",
    keywords: ["services", "offer", "what do you do", "solutions", "consulting"],
    tags: ["services", "offerings"]
  },
  {
    id: "industries",
    category: "Services",
    question: "What industries do you work with?",
    answer: "We work across diverse sectors including manufacturing, healthcare, finance, retail, logistics, and energy. Our team adapts our AI expertise to meet specific industry needs and regulatory requirements.",
    keywords: ["industries", "sectors", "verticals", "work with", "experience"],
    tags: ["industries", "services"]
  },
  {
    id: "implementation-time",
    category: "Process",
    question: "How long does AI implementation take?",
    answer: "Project timelines vary based on complexity. Discovery projects typically take 2-4 weeks, implementation projects 3-6 months, and enterprise transformations 6-18 months. We focus on rapid implementation with our proven methodologies.",
    keywords: ["timeline", "how long", "implementation", "duration", "time"],
    tags: ["process", "timeline"]
  },

  // Technology & Approach
  {
    id: "ai-approach",
    category: "Technology",
    question: "What's your approach to AI implementation?",
    answer: "We follow industry best practices with rapid prototyping and iterative development. Our approach includes: 1) Discovery Call (30 minutes), 2) Custom Proposal Development (3-5 days), 3) Project Kickoff (1 week), 4) Implementation with continuous optimization.",
    keywords: ["approach", "methodology", "process", "implementation", "how"],
    tags: ["technology", "process"]
  },
  {
    id: "security",
    category: "Security",
    question: "How secure are your AI solutions?",
    answer: "We maintain enterprise-grade security with industry best practices, bank-level encryption, and GDPR compliance. We ensure 99.9% system uptime and follow rigorous data protection standards.",
    keywords: ["security", "data protection", "privacy", "safe", "secure"],
    tags: ["security", "compliance"]
  },

  // Business & ROI
  {
    id: "roi",
    category: "Business",
    question: "What ROI can I expect from AI projects?",
    answer: "Based on industry benchmarks and our team's previous experience, AI projects typically achieve 200%+ ROI within 18 months, with significant cost reductions and revenue increases depending on the specific use case.",
    keywords: ["roi", "return", "investment", "benefits", "value"],
    tags: ["business", "roi"]
  },
  {
    id: "pricing",
    category: "Pricing",
    question: "How much do your services cost?",
    answer: "Our pricing varies based on project scope and complexity. We offer free 30-minute consultations to understand your needs and provide custom proposals with detailed timeline and investment requirements. Contact us for a personalized quote.",
    keywords: ["cost", "price", "pricing", "how much", "budget"],
    tags: ["pricing", "consultation"]
  },

  // Support & Contact
  {
    id: "support",
    category: "Support",
    question: "What support do you provide after implementation?",
    answer: "We offer comprehensive 24/7 support packages including monitoring, model retraining, performance optimization, and quarterly business reviews. Our global team ensures round-the-clock assistance.",
    keywords: ["support", "after", "maintenance", "ongoing", "help"],
    tags: ["support", "services"]
  },
  {
    id: "contact",
    category: "Contact",
    question: "How can I contact Videbimus AI?",
    answer: "You can reach us via: Email: consulting@videbimus.ai, Phone: +44 7442 852 675, WhatsApp: +233 248 769 377. We're available Monday-Friday, 9 AM - 6 PM GMT. You can also schedule a free 30-minute consultation.",
    keywords: ["contact", "reach", "phone", "email", "get in touch"],
    tags: ["contact", "information"]
  },
  {
    id: "consultation",
    category: "Consultation",
    question: "How do I get started with a consultation?",
    answer: "Getting started is easy! We offer free 30-minute discovery calls with no obligation. During this call, we'll understand your AI opportunities and discuss how we can help achieve your goals. Contact us to schedule your consultation.",
    keywords: ["consultation", "get started", "begin", "start", "discovery call"],
    tags: ["consultation", "getting-started"]
  },

  // Locations & Reach
  {
    id: "locations",
    category: "Location",
    question: "Where are you located?",
    answer: "We operate as a global remote team with presence across 4 countries including the UK and Ghana. We're expanding into European markets and provide 24/7 support capabilities worldwide.",
    keywords: ["location", "where", "based", "office", "global"],
    tags: ["location", "global"]
  },

  // Projects & Portfolio
  {
    id: "projects",
    category: "Portfolio",
    question: "How many projects have you worked on?",
    answer: "We currently have 20+ AI projects in our pipeline and have helped 20+ enterprises with their AI transformation initiatives. As a new company founded in 2025, we're rapidly growing our project portfolio.",
    keywords: ["projects", "portfolio", "experience", "clients", "work"],
    tags: ["portfolio", "projects"]
  }
];

// Quick response suggestions
export const quickQuestions = [
  "What is Videbimus AI?",
  "What services do you offer?",
  "How long does AI implementation take?",
  "What ROI can I expect?",
  "How can I contact you?",
  "What industries do you work with?",
  "How do I get started?",
  "What support do you provide?"
];

// Fallback responses for unmatched queries
export const fallbackResponses = [
  "I'd be happy to help you with that! For detailed information about your specific needs, I recommend scheduling a free 30-minute consultation with our AI experts. You can contact us at consulting@videbimus.ai or +44 7442 852 675.",
  "That's a great question! While I don't have a specific answer for that, our team of AI experts would love to discuss your requirements in detail. Please reach out for a personalized consultation.",
  "I want to make sure I give you the most accurate information. For questions beyond my knowledge base, please contact our team directly at consulting@videbimus.ai or schedule a free consultation to speak with our AI specialists."
];