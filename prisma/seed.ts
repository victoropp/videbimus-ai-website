import { PrismaClient, UserRole, ProjectStatus, Priority, ContactStatus, NewsletterStatus, PostStatus, TaskStatus, ConsultationStatus, ConsultationType } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@vidibemus.ai'
  const adminPassword = await hash('AdminPass123!', 12)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
      isActive: true,
    },
  })

  console.log('✅ Created admin user:', admin.email)

  // Create consultant user
  const consultant = await prisma.user.upsert({
    where: { email: 'consultant@vidibemus.ai' },
    update: {},
    create: {
      email: 'consultant@vidibemus.ai',
      name: 'AI Consultant',
      password: await hash('ConsultantPass123!', 12),
      role: UserRole.CONSULTANT,
      isActive: true,
    },
  })

  console.log('✅ Created consultant user:', consultant.email)

  // Create demo client users
  const clients = []
  for (let i = 1; i <= 3; i++) {
    const client = await prisma.user.upsert({
      where: { email: `client${i}@example.com` },
      update: {},
      create: {
        email: `client${i}@example.com`,
        name: `Demo Client ${i}`,
        password: await hash('ClientPass123!', 12),
        role: UserRole.CLIENT,
        isActive: true,
      },
    })
    clients.push(client)
  }

  console.log('✅ Created demo client users')

  // Create blog categories
  const categories = [
    { name: 'AI Strategy', slug: 'ai-strategy', description: 'Strategic insights on AI implementation' },
    { name: 'Machine Learning', slug: 'machine-learning', description: 'ML techniques and best practices' },
    { name: 'Business Intelligence', slug: 'business-intelligence', description: 'BI and data analytics' },
    { name: 'Case Studies', slug: 'case-studies', description: 'Real-world AI implementation examples' },
    { name: 'Industry News', slug: 'industry-news', description: 'Latest AI industry developments' },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    })
    createdCategories.push(created)
  }

  console.log('✅ Created blog categories')

  // Create sample blog posts
  const blogPosts = [
    {
      title: 'Getting Started with AI in Your Business',
      slug: 'getting-started-with-ai-in-business',
      excerpt: 'A comprehensive guide to implementing AI solutions in your organization.',
      content: `# Getting Started with AI in Your Business

Artificial Intelligence is no longer a futuristic concept—it's a practical tool that businesses of all sizes can leverage today. This guide will walk you through the essential steps to begin your AI journey.

## Understanding AI Opportunities

Before diving into AI implementation, it's crucial to identify where AI can add the most value to your business:

- **Customer Service**: Chatbots and automated support
- **Data Analysis**: Pattern recognition and insights
- **Process Automation**: Streamlining repetitive tasks
- **Predictive Analytics**: Forecasting trends and behaviors

## Getting Started

1. **Assess Your Current State**: Evaluate your data infrastructure and technical capabilities
2. **Identify Use Cases**: Start with specific, measurable problems
3. **Build Your Team**: Invest in AI talent or partner with experts
4. **Start Small**: Begin with pilot projects to prove value

Ready to transform your business with AI? Contact us for a consultation.`,
      status: PostStatus.PUBLISHED,
      published: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      featured: true,
      authorId: admin.id,
      categoryId: createdCategories[0].id,
      tags: ['AI Strategy', 'Business Transformation', 'Getting Started'],
      seoTitle: 'Getting Started with AI in Your Business - Complete Guide',
      seoDescription: 'Learn how to implement AI solutions in your organization with this comprehensive guide. Start your AI transformation journey today.',
      readTime: 5,
      views: 1250,
    },
    {
      title: 'Machine Learning Best Practices for 2024',
      slug: 'machine-learning-best-practices-2024',
      excerpt: 'Key practices and trends shaping the ML landscape this year.',
      content: `# Machine Learning Best Practices for 2024

The machine learning landscape continues to evolve rapidly. Here are the key practices every ML team should adopt this year.

## Data Quality First

Quality data is the foundation of successful ML projects:
- Implement robust data validation pipelines
- Monitor data drift continuously
- Invest in data labeling and annotation tools

## MLOps Excellence

- Version control for models and datasets
- Automated testing and validation
- Continuous integration and deployment
- Model monitoring and observability

## Ethical AI Considerations

- Bias detection and mitigation
- Explainable AI techniques
- Privacy-preserving methods
- Responsible AI frameworks`,
      status: PostStatus.PUBLISHED,
      published: true,
      publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      featured: false,
      authorId: consultant.id,
      categoryId: createdCategories[1].id,
      tags: ['Machine Learning', 'MLOps', 'Best Practices', '2024'],
      seoTitle: 'Machine Learning Best Practices for 2024 - Expert Guide',
      seoDescription: 'Discover the latest ML best practices and trends for 2024. Improve your machine learning projects with expert insights.',
      readTime: 8,
      views: 890,
    }
  ]

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    })
  }

  console.log('✅ Created sample blog posts')

  // Create sample projects for clients
  const sampleProjects = [
    {
      title: 'Customer Churn Prediction Model',
      description: 'Develop an ML model to predict customer churn and identify at-risk customers.',
      status: ProjectStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      budget: 25000,
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      userId: clients[0].id,
    },
    {
      title: 'Inventory Optimization System',
      description: 'AI-powered inventory management and demand forecasting system.',
      status: ProjectStatus.PLANNING,
      priority: Priority.MEDIUM,
      budget: 40000,
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      userId: clients[1].id,
    },
    {
      title: 'Document Processing Automation',
      description: 'Automated document classification and data extraction using NLP.',
      status: ProjectStatus.COMPLETED,
      priority: Priority.HIGH,
      budget: 15000,
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
      endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      userId: clients[2].id,
    },
  ]

  const createdProjects = []
  for (const project of sampleProjects) {
    const created = await prisma.project.create({
      data: project,
    })
    createdProjects.push(created)
  }

  console.log('✅ Created sample projects')

  // Create sample tasks for projects
  const sampleTasks = [
    {
      title: 'Data Collection and Preprocessing',
      description: 'Gather and clean customer data from various sources.',
      status: TaskStatus.COMPLETED,
      priority: Priority.HIGH,
      projectId: createdProjects[0].id,
      completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Feature Engineering',
      description: 'Create and select relevant features for the churn prediction model.',
      status: TaskStatus.IN_PROGRESS,
      priority: Priority.HIGH,
      projectId: createdProjects[0].id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: 'Model Training and Validation',
      description: 'Train multiple ML models and validate their performance.',
      status: TaskStatus.TODO,
      priority: Priority.MEDIUM,
      projectId: createdProjects[0].id,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const task of sampleTasks) {
    await prisma.task.create({
      data: task,
    })
  }

  console.log('✅ Created sample tasks')

  // Create sample consultations
  const sampleConsultations = [
    {
      title: 'Initial AI Strategy Discussion',
      description: 'Discuss AI opportunities and create implementation roadmap.',
      status: ConsultationStatus.COMPLETED,
      type: ConsultationType.STRATEGY,
      duration: 60,
      scheduledAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
      notes: 'Client is interested in customer analytics and process automation. Next steps: technical feasibility assessment.',
      userId: clients[0].id,
      projectId: createdProjects[0].id,
    },
    {
      title: 'Technical Architecture Review',
      description: 'Review technical requirements and system architecture.',
      status: ConsultationStatus.SCHEDULED,
      type: ConsultationType.TECHNICAL,
      duration: 90,
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      userId: clients[1].id,
      projectId: createdProjects[1].id,
    },
  ]

  for (const consultation of sampleConsultations) {
    await prisma.consultation.create({
      data: consultation,
    })
  }

  console.log('✅ Created sample consultations')

  // Create sample contact form submissions
  const sampleContacts = [
    {
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      company: 'TechCorp Industries',
      phone: '+1-555-0123',
      subject: 'AI Implementation for Manufacturing',
      message: 'We are a manufacturing company looking to implement AI for quality control and predictive maintenance. Could we schedule a consultation to discuss our needs?',
      status: ContactStatus.NEW,
      priority: Priority.HIGH,
    },
    {
      name: 'Michael Chen',
      email: 'michael.chen@retailplus.com',
      company: 'RetailPlus',
      subject: 'Customer Analytics Solution',
      message: 'Interested in AI-powered customer behavior analysis and personalization. What solutions do you offer for retail businesses?',
      status: ContactStatus.IN_PROGRESS,
      priority: Priority.MEDIUM,
    },
    {
      name: 'Emily Rodriguez',
      email: 'emily@startup.io',
      company: 'FinTech Startup',
      subject: 'Fraud Detection System',
      message: 'We need help building a fraud detection system for our fintech platform. Do you have experience with financial AI solutions?',
      status: ContactStatus.RESPONDED,
      priority: Priority.HIGH,
      respondedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  ]

  for (const contact of sampleContacts) {
    await prisma.contact.create({
      data: contact,
    })
  }

  console.log('✅ Created sample contact submissions')

  // Create sample newsletter subscriptions
  const sampleNewsletters = [
    {
      email: 'subscriber1@example.com',
      status: NewsletterStatus.SUBSCRIBED,
      preferences: {
        aiNews: true,
        caseStudies: true,
        webinars: false,
      },
    },
    {
      email: 'subscriber2@company.com',
      status: NewsletterStatus.SUBSCRIBED,
      preferences: {
        aiNews: true,
        caseStudies: true,
        webinars: true,
      },
    },
    {
      email: 'unsubscribed@example.com',
      status: NewsletterStatus.UNSUBSCRIBED,
      preferences: {
        aiNews: false,
        caseStudies: false,
        webinars: false,
      },
    },
  ]

  for (const newsletter of sampleNewsletters) {
    await prisma.newsletter.create({
      data: newsletter,
    })
  }

  console.log('✅ Created sample newsletter subscriptions')

  // Create system settings
  const settings = [
    { key: 'site_name', value: 'Vidibemus AI', category: 'general', isPublic: true },
    { key: 'site_description', value: 'Your AI Consulting Partner', category: 'general', isPublic: true },
    { key: 'contact_email', value: process.env.ADMIN_EMAIL || 'contact@vidibemus.ai', category: 'general', isPublic: true },
    { key: 'max_upload_size', value: '10485760', category: 'files', isPublic: false },
    { key: 'allowed_file_types', value: 'image/jpeg,image/png,image/webp,application/pdf', category: 'files', isPublic: false },
    { key: 'enable_analytics', value: 'true', category: 'features', isPublic: false },
    { key: 'enable_newsletter', value: 'true', category: 'features', isPublic: false },
    { key: 'maintenance_mode', value: 'false', category: 'system', isPublic: false },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }

  console.log('✅ Created system settings')

  // Create sample analytics events
  const analyticsEvents = [
    'page_view',
    'contact_form_submit',
    'newsletter_signup',
    'blog_post_view',
    'service_page_view',
    'case_study_view',
  ]

  for (let i = 0; i < 100; i++) {
    const randomEvent = analyticsEvents[Math.floor(Math.random() * analyticsEvents.length)]
    const randomDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000))
    
    await prisma.analytics.create({
      data: {
        event: randomEvent,
        page: randomEvent === 'page_view' ? '/' : `/api/${randomEvent}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        device: Math.random() > 0.7 ? 'mobile' : 'desktop',
        browser: Math.random() > 0.5 ? 'Chrome' : 'Firefox',
        os: Math.random() > 0.5 ? 'Windows' : 'macOS',
        country: Math.random() > 0.5 ? 'US' : 'CA',
        createdAt: randomDate,
      },
    })
  }

  console.log('✅ Created sample analytics data')

  console.log('🎉 Database seeding completed successfully!')
  
  console.log('\n📋 Seed Summary:')
  console.log(`👤 Admin user: ${adminEmail}`)
  console.log(`🔒 Admin password: AdminPass123!`)
  console.log(`👨‍💼 Consultant user: consultant@vidibemus.ai`)
  console.log(`🔒 Consultant password: ConsultantPass123!`)
  console.log(`👥 Client users: client1@example.com, client2@example.com, client3@example.com`)
  console.log(`🔒 Client password: ClientPass123!`)
  console.log(`📝 Blog posts: ${blogPosts.length} created`)
  console.log(`🚀 Projects: ${sampleProjects.length} created`)
  console.log(`📞 Contact submissions: ${sampleContacts.length} created`)
  console.log(`📧 Newsletter subscriptions: ${sampleNewsletters.length} created`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })