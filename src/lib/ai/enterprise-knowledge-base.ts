import { enhancedProviders, type ProviderResponse } from './enhanced-providers';
import { vectorStore } from './vector-store';

export interface KnowledgeDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[];
  priority: number;
  lastUpdated: Date;
  metadata?: Record<string, any>;
}

export interface QueryIntent {
  type: 'pricing' | 'services' | 'technical' | 'support' | 'general' | 'demo' | 'consultation';
  confidence: number;
  entities: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
}

export class EnterpriseKnowledgeBase {
  private knowledgeBase: Map<string, KnowledgeDocument[]> = new Map();
  private intentPatterns: Map<string, RegExp[]> = new Map();
  private businessContext: Map<string, string> = new Map();

  constructor() {
    this.initializeKnowledgeBase();
    this.initializeIntentPatterns();
    this.initializeBusinessContext();
  }

  private initializeKnowledgeBase() {
    const documents: KnowledgeDocument[] = [
      // Company Identity
      {
        id: 'company-about',
        title: 'About Videbimus AI',
        content: `Videbimus AI is a specialist AI consulting and development firm founded in 2023, operating globally with a core team based across the UK and Ghana. The company name comes from the Latin for "we shall see" — reflecting a commitment to making the invisible visible through data and AI.

We work with businesses of all sizes to design, build, and deploy practical AI solutions that solve real problems. Our approach is hands-on and outcome-driven: we don't sell vague strategy documents — we build things that work.

Founding team has backgrounds in applied machine learning, data engineering, and business transformation. We bring both technical depth and commercial pragmatism to every engagement.

Contact:
- Email: consulting@videbimusai.com
- UK: +44 7442 852675 (calls and WhatsApp)
- Ghana: +233 248769377 (calls and WhatsApp)
- Website: videbimusai.com`,
        category: 'company',
        keywords: ['about', 'videbimus', 'company', 'who are you', 'founded', 'team', 'uk', 'ghana'],
        priority: 10,
        lastUpdated: new Date(),
      },

      // Core Services
      {
        id: 'services-overview',
        title: 'Core AI Services',
        content: `Videbimus AI offers four core service areas:

**1. Custom AI & Machine Learning Development**
We build bespoke ML models — from predictive analytics and classification systems to recommendation engines and anomaly detection. We handle the full pipeline: data ingestion, feature engineering, model training, evaluation, and production deployment.

**2. Natural Language Processing (NLP)**
Chatbots and virtual assistants, document intelligence (extraction, classification, summarisation), sentiment analysis, named entity recognition, and search systems powered by transformer models (BERT, GPT, fine-tuned variants).

**3. Computer Vision**
Object detection and tracking, image classification, quality control automation, document digitisation via OCR, and custom vision pipelines for manufacturing, retail, and healthcare.

**4. Data Science & Analytics**
Exploratory data analysis, statistical modelling, forecasting, business intelligence dashboards, and data pipeline architecture. We turn scattered data into structured insight.

All services include deployment, documentation, and a handover process that leaves your team capable of running what we've built.`,
        category: 'services',
        keywords: ['services', 'machine learning', 'nlp', 'computer vision', 'data science', 'analytics', 'chatbot', 'ml', 'ai development'],
        priority: 10,
        lastUpdated: new Date(),
      },

      // Process Automation
      {
        id: 'services-automation',
        title: 'Process Automation & AI Agents',
        content: `We design intelligent automation solutions that eliminate repetitive work and accelerate decision-making:

- **Document Processing**: Extract structured data from invoices, contracts, forms, and reports using AI — no manual data entry
- **Workflow Automation**: Chain AI models with business logic to handle complex multi-step processes
- **AI Agents**: LLM-based agents that can browse, summarise, classify, and act on information autonomously
- **RPA + AI Hybrid**: Combine traditional robotic process automation with machine learning for adaptive workflows

Typical use cases: invoice processing, customer onboarding, compliance checking, report generation, and lead qualification.`,
        category: 'services',
        keywords: ['automation', 'rpa', 'workflow', 'process automation', 'document processing', 'agents', 'ai agents'],
        priority: 9,
        lastUpdated: new Date(),
      },

      // AI Strategy
      {
        id: 'services-strategy',
        title: 'AI Strategy & Advisory',
        content: `For organisations at the start of their AI journey, we offer:

- **AI Readiness Assessment**: Evaluate your data, infrastructure, and team to identify what's possible and where to start
- **Use Case Prioritisation**: Map high-impact AI opportunities specific to your business and rank them by feasibility and ROI
- **Technology Selection**: Vendor-neutral guidance on which AI platforms, tools, and models fit your context
- **Roadmap Development**: A phased implementation plan with milestones, resource requirements, and success metrics

This is typically a 2–4 week engagement producing a clear, actionable document — not a theoretical framework.`,
        category: 'services',
        keywords: ['strategy', 'advisory', 'roadmap', 'ai readiness', 'consulting', 'assessment'],
        priority: 8,
        lastUpdated: new Date(),
      },

      // Pricing
      {
        id: 'pricing-overview',
        title: 'Pricing & Engagement Models',
        content: `Videbimus AI uses flexible pricing tailored to the scope and nature of each project:

**Consulting & Advisory**
Hourly or daily rates for strategic work, technical reviews, and advisory sessions. Best for organisations that need expert input without a full project commitment.

**Fixed-Price Projects**
Scoped engagements with clear deliverables and timelines. Works well when requirements are well-defined. Discovery projects (assessment + roadmap) typically start from £5,000–£15,000. Implementation projects range from £25,000 to £150,000+ depending on complexity.

**Retainer / Ongoing Support**
Monthly retainers for teams that want continuous AI capability — model monitoring, incremental improvements, and on-demand technical support.

**Pilot Projects**
Low-risk starting point: we build a proof-of-concept on a subset of your data to demonstrate value before committing to full implementation.

We don't publish fixed price lists because every project is different. The best path is a free 30-minute discovery call where we can understand your situation and give you a realistic estimate.`,
        category: 'pricing',
        keywords: ['pricing', 'cost', 'fee', 'budget', 'rates', 'how much', 'fixed price', 'retainer', 'pilot', 'discovery'],
        priority: 9,
        lastUpdated: new Date(),
      },

      // Methodology
      {
        id: 'process-methodology',
        title: 'How We Work',
        content: `Our engagement process:

**Week 1–2: Discovery**
We learn your business, your data, and the problem you're solving. We look at data availability and quality, existing systems, and what success looks like.

**Week 2–4: Design & Scoping**
We produce a technical approach document, a data strategy, and a project plan with milestones. You know exactly what we're building and why before we write a line of code.

**Development Phase**
Iterative sprints. We show work frequently so there are no surprises. Typically 4–12 weeks depending on scope.

**Deployment & Handover**
We deploy to your environment (cloud, on-premise, or hybrid), integrate with your systems, and train your team. Full documentation included.

**Ongoing Support (Optional)**
Post-launch monitoring, model retraining as data evolves, and continuous improvements.

We communicate throughout. No black boxes, no unexplained models.`,
        category: 'process',
        keywords: ['process', 'methodology', 'how do you work', 'how long', 'timeline', 'discovery', 'deployment'],
        priority: 7,
        lastUpdated: new Date(),
      },

      // Case Studies
      {
        id: 'casestudies-petroverse',
        title: 'Case Study: Petroverse (Oil & Gas)',
        content: `**Client**: Petroverse — oil and gas sector
**Challenge**: Unplanned equipment downtime causing costly production stoppages
**Solution**: Predictive maintenance system using sensor data and ML models to forecast equipment failures before they occur

**Outcomes**:
- 45% reduction in unplanned downtime
- Improved safety compliance through early warning signals
- Predictive alerts allowing maintenance scheduling during planned windows

The model analyses real-time sensor readings from drilling equipment and flags anomalies that historically precede failures. Integrated with their operations dashboard.`,
        category: 'usecases',
        keywords: ['oil gas', 'petroverse', 'predictive maintenance', 'downtime', 'iot', 'sensors', 'manufacturing'],
        priority: 9,
        lastUpdated: new Date(),
      },
      {
        id: 'casestudies-insure360',
        title: 'Case Study: INSURE360 (Insurance)',
        content: `**Client**: INSURE360 — insurance provider
**Challenge**: High volume of claims requiring manual review, and significant fraud exposure
**Solution**: AI-powered claims processing pipeline with integrated fraud detection

**Outcomes**:
- 70% reduction in claims processing time
- 98.5% fraud detection accuracy
- Automated triage routing low-risk claims directly to settlement
- Flagging high-risk claims for human review with explanations

The system classifies incoming claims, extracts key information from submitted documents, cross-references patterns against known fraud indicators, and produces a decision recommendation with a confidence score.`,
        category: 'usecases',
        keywords: ['insurance', 'insure360', 'fraud detection', 'claims', 'processing', 'finance'],
        priority: 9,
        lastUpdated: new Date(),
      },

      // Industries
      {
        id: 'industries-overview',
        title: 'Industries We Serve',
        content: `Videbimus AI has delivered projects across:

- **Oil & Gas**: Predictive maintenance, anomaly detection, operational optimisation
- **Insurance & Financial Services**: Fraud detection, claims automation, risk scoring, compliance
- **Healthcare**: Clinical document processing, patient data analysis, workflow automation
- **Retail & E-commerce**: Demand forecasting, recommendation systems, customer analytics
- **Manufacturing**: Quality control vision systems, predictive maintenance, production optimisation
- **Professional Services**: Document intelligence, knowledge management, proposal automation
- **Logistics**: Route optimisation, demand prediction, tracking anomaly detection

Our team's applied experience means we understand the domain constraints — regulatory requirements, data quality realities, and what outcomes actually matter to the business.`,
        category: 'usecases',
        keywords: ['industries', 'healthcare', 'finance', 'retail', 'manufacturing', 'logistics', 'oil gas', 'insurance'],
        priority: 7,
        lastUpdated: new Date(),
      },

      // Technical capabilities
      {
        id: 'tech-stack',
        title: 'Technical Capabilities & Stack',
        content: `Our technical stack is chosen for each project, not pre-decided. We work with:

**Machine Learning**: Python, scikit-learn, XGBoost, LightGBM, TensorFlow, PyTorch
**NLP & LLMs**: Hugging Face Transformers, OpenAI API, Anthropic Claude, Groq/LLaMA, fine-tuning pipelines
**Computer Vision**: OpenCV, YOLO, detectron2, custom CNN architectures
**Data Engineering**: PostgreSQL, MongoDB, Redis, Apache Spark, dbt, Airflow
**Cloud & Deployment**: AWS (SageMaker, Lambda, S3), GCP (Vertex AI), Azure ML, Docker, Kubernetes
**MLOps**: MLflow, Weights & Biases, model monitoring, automated retraining

We are model-agnostic and vendor-neutral. We recommend what fits your requirements, not what we're tied to.`,
        category: 'technical',
        keywords: ['tech stack', 'technology', 'python', 'tensorflow', 'pytorch', 'aws', 'cloud', 'deployment', 'mlops'],
        priority: 7,
        lastUpdated: new Date(),
      },

      // Contact & Getting Started
      {
        id: 'contact-getstarted',
        title: 'Getting Started & Contact',
        content: `The simplest way to start is a free 30-minute discovery call. No obligation — just a conversation about what you're trying to do and whether we can help.

**Contact Options**:
- Email: consulting@videbimusai.com
- UK Phone / WhatsApp: +44 7442 852675
- Ghana Phone / WhatsApp: +233 248769377
- Website: videbimusai.com

**What to expect from the first call**:
We'll ask about your business context, the problem you want to solve, and what data you have available. By the end, you'll have a clearer picture of what's possible and a realistic sense of what it would take.

If there's a good fit, we'll follow up with a written proposal outlining approach, timeline, and cost.`,
        category: 'company',
        keywords: ['contact', 'get started', 'consultation', 'call', 'email', 'book', 'schedule', 'begin'],
        priority: 8,
        lastUpdated: new Date(),
      },
    ];

    documents.forEach(doc => {
      if (!this.knowledgeBase.has(doc.category)) {
        this.knowledgeBase.set(doc.category, []);
      }
      this.knowledgeBase.get(doc.category)!.push(doc);
    });
  }

  private initializeIntentPatterns() {
    this.intentPatterns.set('pricing', [
      /\b(price|pricing|cost|fee|charge|rate|budget|expense|affordable|invest)\b/i,
      /how much/i,
      /what.*cost/i,
      /\$|£|dollar|pound|money|payment/i,
    ]);

    this.intentPatterns.set('services', [
      /\b(service|services|offer|provide|do|capability|solution|build|develop)\b/i,
      /what.*you.*do/i,
      /help.*with/i,
      /speciali[sz]e/i,
    ]);

    this.intentPatterns.set('technical', [
      /\b(technology|tech|technical|algorithm|model|framework|architecture|deploy|stack)\b/i,
      /\b(nlp|ai|ml|machine learning|deep learning|neural|computer vision|llm|gpt|bert)\b/i,
      /how.*work/i,
      /implementation/i,
    ]);

    this.intentPatterns.set('support', [
      /\b(support|help|assistance|problem|issue|troubleshoot|bug|error)\b/i,
      /need help/i,
      /having trouble/i,
      /not working/i,
    ]);

    this.intentPatterns.set('consultation', [
      /\b(consult|consultation|meeting|call|discuss|talk|schedule|appointment|book)\b/i,
      /speak with/i,
      /get in touch/i,
      /contact.*team/i,
    ]);

    this.intentPatterns.set('demo', [
      /\b(demo|demonstration|show|example|sample|trial|test|try)\b/i,
      /see.*action/i,
      /how.*looks/i,
      /preview/i,
    ]);
  }

  private initializeBusinessContext() {
    this.businessContext.set('company_name', 'Videbimus AI');
    this.businessContext.set('industry', 'AI Consulting & Development');
    this.businessContext.set('specialties', 'Custom AI Development, NLP, Computer Vision, Data Science, Process Automation');
    this.businessContext.set('contact_email', 'consulting@videbimusai.com');
    this.businessContext.set('contact_phone_uk', '+44 7442 852675');
    this.businessContext.set('contact_phone_ghana', '+233 248769377');
    this.businessContext.set('website', 'videbimusai.com');
    this.businessContext.set('established', '2023');
    this.businessContext.set('locations', 'UK and Ghana, serving clients globally');
  }

  async analyzeIntent(query: string): Promise<QueryIntent> {
    const lowerQuery = query.toLowerCase();
    let bestIntent = 'general';
    let maxScore = 0;
    const entities: string[] = [];

    for (const [intent, patterns] of this.intentPatterns) {
      let score = 0;
      for (const pattern of patterns) {
        if (pattern.test(lowerQuery)) score += 1;
      }
      if (score > maxScore) {
        maxScore = score;
        bestIntent = intent;
      }
    }

    for (const [, documents] of this.knowledgeBase) {
      for (const doc of documents) {
        for (const keyword of doc.keywords) {
          if (lowerQuery.includes(keyword.toLowerCase())) {
            entities.push(keyword);
          }
        }
      }
    }

    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'like', 'impressive', 'helpful', 'interested'];
    const negativeWords = ['bad', 'poor', 'terrible', 'hate', 'dislike', 'awful', 'problem', 'issue', 'frustrated'];

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    const posScore = positiveWords.reduce((acc, word) => acc + (lowerQuery.includes(word) ? 1 : 0), 0);
    const negScore = negativeWords.reduce((acc, word) => acc + (lowerQuery.includes(word) ? 1 : 0), 0);

    if (posScore > negScore) sentiment = 'positive';
    else if (negScore > posScore) sentiment = 'negative';

    return {
      type: bestIntent as any,
      confidence: Math.min(maxScore / 2, 1),
      entities: [...new Set(entities)],
      sentiment,
    };
  }

  async searchKnowledge(query: string, intent?: QueryIntent): Promise<KnowledgeDocument[]> {
    const results: Array<{ doc: KnowledgeDocument; score: number }> = [];
    const queryLower = query.toLowerCase();

    try {
      const vectorResults = await vectorStore.similaritySearch(query, 3);
      if (vectorResults && vectorResults.length > 0) {
        return vectorResults.map(result => ({
          id: result.id,
          title: result.metadata.title || 'Retrieved Document',
          content: result.content,
          category: result.metadata.category || 'general',
          keywords: result.metadata.keywords || [],
          priority: Math.round(result.score * 10),
          lastUpdated: new Date(),
          metadata: result.metadata,
        }));
      }
    } catch {
      // vector search unavailable, fall through
    }

    for (const [category, documents] of this.knowledgeBase) {
      for (const doc of documents) {
        let score = 0;

        if (doc.title.toLowerCase().includes(queryLower)) score += 10;

        const contentMatches = (doc.content.toLowerCase().match(new RegExp(queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
        score += contentMatches * 2;

        for (const keyword of doc.keywords) {
          if (queryLower.includes(keyword.toLowerCase())) score += 5;
        }

        if (intent && intent.type !== 'general') {
          if (category === intent.type) score += 8;
          if (intent.type === 'technical' && category === 'services') score += 3;
          if (intent.type === 'services' && category === 'pricing') score += 3;
        }

        score += doc.priority;

        if (score > 0) results.push({ doc, score });
      }
    }

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
      .map(r => r.doc);
  }

  async generateContextualResponse(query: string, documents: KnowledgeDocument[], intent: QueryIntent): Promise<string> {
    const context = documents.length > 0
      ? documents.map(doc => `### ${doc.title}\n${doc.content}`).join('\n\n')
      : '';

    const systemPrompt = `You are the AI assistant for Videbimus AI — a specialist AI consulting and development firm founded in 2023, operating across the UK and Ghana and serving clients globally.

## Company Facts (use these — do not invent others)
- Founded: 2023
- Locations: UK and Ghana, global client base
- Contact: consulting@videbimusai.com | UK: +44 7442 852675 | Ghana: +233 248769377
- Website: videbimusai.com
- Known clients/case studies: Petroverse (oil & gas predictive maintenance, 45% downtime reduction), INSURE360 (insurance fraud detection, 98.5% accuracy, 70% faster claims)

## Your role
Answer questions about Videbimus AI's services, capabilities, pricing, and how to get started. Be helpful, specific, and honest. If you don't know something, say so — don't fabricate statistics or clients.

## Response rules
1. Use the knowledge base context below when relevant
2. Keep responses focused — answer what was asked, don't dump everything
3. Use markdown formatting: headers, bold, bullet points where it aids clarity
4. Don't repeat the same call-to-action in every response
5. Don't pad responses with generic filler ("Great question!", "Absolutely!")
6. If asked about pricing, give genuine guidance on factors and ranges, then offer a call
7. Never claim offices in "Silicon Valley", "New York", "Singapore" — we're UK/Ghana based
8. Never cite fake statistics like "500+ implementations" or "98% satisfaction" unless from the verified case studies above

${context ? `## Relevant knowledge base content\n${context}` : ''}`;

    try {
      const response = await enhancedProviders.chatCompletion({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.6,
        maxTokens: 600,
      }) as ProviderResponse;

      return response.content || this.generateFallbackResponse(query, intent);
    } catch (error) {
      console.error('AI response generation failed:', error);
      return this.generateFallbackResponse(query, intent);
    }
  }

  private generateFallbackResponse(query: string, intent: QueryIntent): string {
    const lowerQuery = query.toLowerCase();

    if (intent.type === 'pricing' || /cost|price|how much|budget/.test(lowerQuery)) {
      return `Our pricing depends on the scope and nature of the work. Discovery and assessment engagements typically start from £5,000–£15,000. Implementation projects range more broadly — from £25,000 for focused solutions to £150,000+ for complex, multi-system deployments.

We don't publish fixed rates because every project is different. The best way to get an accurate figure is a 30-minute discovery call where we understand your situation.

**Get in touch:**
- Email: consulting@videbimusai.com
- UK: +44 7442 852675
- Ghana: +233 248769377`;
    }

    if (intent.type === 'services' || /service|offer|do you|what can/.test(lowerQuery)) {
      return `Videbimus AI builds practical AI solutions across four main areas:

- **Custom ML Development** — predictive models, classification, anomaly detection
- **NLP & Language AI** — chatbots, document intelligence, sentiment analysis
- **Computer Vision** — object detection, quality control, document digitisation
- **Data Science & Analytics** — forecasting, dashboards, data pipeline design

We also handle AI strategy and process automation. What's the problem you're trying to solve?`;
    }

    if (intent.type === 'consultation' || /contact|call|speak|schedule|book/.test(lowerQuery)) {
      return `The best first step is a free 30-minute discovery call — no obligation, just a conversation about your situation and whether we can help.

**Reach us:**
- Email: consulting@videbimusai.com
- UK / WhatsApp: +44 7442 852675
- Ghana / WhatsApp: +233 248769377`;
    }

    return `Videbimus AI is a specialist AI consulting and development firm. We design and build practical AI solutions — from machine learning models and NLP systems to computer vision and process automation.

We've delivered projects for clients in oil & gas, insurance, healthcare, and retail. Our approach is hands-on: we scope carefully, build iteratively, and hand over fully documented systems.

What are you looking to understand or explore?`;
  }

  getBusinessContext(): Map<string, string> {
    return new Map(this.businessContext);
  }
}

export const enterpriseKnowledgeBase = new EnterpriseKnowledgeBase();
