import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@vidibemus.ai' },
    update: {},
    create: {
      email: 'admin@vidibemus.ai',
      name: 'Admin User',
      password: await hash('admin123', 12),
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Admin user created');

  // Create consultant user
  const consultantUser = await prisma.user.upsert({
    where: { email: 'consultant@vidibemus.ai' },
    update: {},
    create: {
      email: 'consultant@vidibemus.ai',
      name: 'Senior AI Consultant',
      password: await hash('consultant123', 12),
      role: 'CONSULTANT',
      isActive: true,
    },
  });

  console.log('✅ Consultant user created');

  // Create sample client users
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Sample Client',
      password: await hash('client123', 12),
      role: 'CLIENT',
      isActive: true,
    },
  });

  console.log('✅ Client user created');

  // Create team members
  const teamMembers = await Promise.all([
    prisma.teamMember.upsert({
      where: { email: 'john.smith@vidibemus.ai' },
      update: {},
      create: {
        name: 'John Smith',
        role: 'AI/ML Engineering Lead',
        bio: 'John leads our AI/ML engineering team with over 10 years of experience in machine learning, deep learning, and MLOps. He specializes in building scalable AI systems and has worked with Fortune 500 companies to implement production-ready AI solutions.',
        email: 'john.smith@vidibemus.ai',
        linkedin: 'https://linkedin.com/in/johnsmith-ai',
        github: 'https://github.com/johnsmith-ai',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'MLOps', 'Kubernetes', 'AWS', 'Data Engineering'],
        experience: 10,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.teamMember.upsert({
      where: { email: 'sarah.johnson@vidibemus.ai' },
      update: {},
      create: {
        name: 'Sarah Johnson',
        role: 'Data Science Director',
        bio: 'Sarah brings 12+ years of data science expertise, specializing in predictive analytics, statistical modeling, and business intelligence. She has led data transformation initiatives for companies across healthcare, finance, and e-commerce sectors.',
        email: 'sarah.johnson@vidibemus.ai',
        linkedin: 'https://linkedin.com/in/sarah-johnson-ds',
        skills: ['R', 'Python', 'SQL', 'Tableau', 'Statistical Modeling', 'A/B Testing', 'Business Intelligence'],
        experience: 12,
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.teamMember.upsert({
      where: { email: 'michael.chen@vidibemus.ai' },
      update: {},
      create: {
        name: 'Michael Chen',
        role: 'AI Ethics & Strategy Consultant',
        bio: 'Michael focuses on responsible AI implementation, bias detection, and AI governance frameworks. He holds a PhD in Computer Science and has published extensively on AI ethics and fairness in machine learning systems.',
        email: 'michael.chen@vidibemus.ai',
        linkedin: 'https://linkedin.com/in/michael-chen-ai-ethics',
        skills: ['AI Ethics', 'Fairness in ML', 'AI Governance', 'Strategy', 'Research', 'Policy Development'],
        experience: 8,
        isActive: true,
        sortOrder: 3,
      },
    }),
  ]);

  console.log('✅ Team members created');

  // Create testimonials
  const testimonials = await Promise.all([
    prisma.testimonial.upsert({
      where: { id: 'testimonial-1' },
      update: {},
      create: {
        id: 'testimonial-1',
        name: 'Jennifer Rodriguez',
        role: 'Chief Technology Officer',
        company: 'TechCorp Solutions',
        content: 'Vidibemus AI transformed our data strategy completely. Their team implemented a predictive analytics system that increased our operational efficiency by 40% and reduced costs by $2.3M annually. The ROI was evident within the first quarter.',
        rating: 5,
        isActive: true,
        sortOrder: 1,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'testimonial-2' },
      update: {},
      create: {
        id: 'testimonial-2',
        name: 'David Kim',
        role: 'Head of Data Science',
        company: 'FinanceFirst Bank',
        content: 'Working with Vidibemus AI was a game-changer for our fraud detection capabilities. Their ML models reduced false positives by 65% while maintaining 99.7% accuracy. The team\'s expertise in financial AI is unmatched.',
        rating: 5,
        isActive: true,
        sortOrder: 2,
      },
    }),
    prisma.testimonial.upsert({
      where: { id: 'testimonial-3' },
      update: {},
      create: {
        id: 'testimonial-3',
        name: 'Lisa Thompson',
        role: 'VP of Operations',
        company: 'HealthcarePlus',
        content: 'The AI-powered patient diagnosis assistant developed by Vidibemus AI has revolutionized our healthcare delivery. We\'ve seen 30% faster diagnosis times and improved patient outcomes. Their understanding of healthcare AI compliance is exceptional.',
        rating: 5,
        isActive: true,
        sortOrder: 3,
      },
    }),
  ]);

  console.log('✅ Testimonials created');

  // Create blog categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'artificial-intelligence' },
      update: {},
      create: {
        name: 'Artificial Intelligence',
        slug: 'artificial-intelligence',
        description: 'Insights and trends in AI technology and implementation',
        color: '#3B82F6',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'machine-learning' },
      update: {},
      create: {
        name: 'Machine Learning',
        slug: 'machine-learning',
        description: 'ML algorithms, techniques, and real-world applications',
        color: '#10B981',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'data-science' },
      update: {},
      create: {
        name: 'Data Science',
        slug: 'data-science',
        description: 'Data analysis, visualization, and statistical insights',
        color: '#8B5CF6',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'industry-insights' },
      update: {},
      create: {
        name: 'Industry Insights',
        slug: 'industry-insights',
        description: 'AI applications across different industries and sectors',
        color: '#F59E0B',
      },
    }),
  ]);

  console.log('✅ Blog categories created');

  // Create sample blog posts
  const blogPosts = await Promise.all([
    prisma.blogPost.upsert({
      where: { slug: 'future-of-enterprise-ai-2024' },
      update: {},
      create: {
        title: 'The Future of Enterprise AI in 2024: Trends and Predictions',
        slug: 'future-of-enterprise-ai-2024',
        excerpt: 'Explore the key trends shaping enterprise AI adoption, from generative AI integration to ethical AI governance frameworks.',
        content: `# The Future of Enterprise AI in 2024: Trends and Predictions

As we navigate through 2024, artificial intelligence continues to reshape the enterprise landscape at an unprecedented pace. Organizations are moving beyond experimental phases to implement AI solutions that drive measurable business outcomes.

## Key Trends Shaping Enterprise AI

### 1. Generative AI Integration
Generative AI has moved from proof-of-concept to production deployment. Companies are integrating large language models into their workflows, creating custom AI assistants, and automating content creation processes.

### 2. AI Governance and Ethics
With increased AI adoption comes the critical need for robust governance frameworks. Organizations are implementing AI ethics committees, bias detection systems, and compliance monitoring tools.

### 3. Edge AI and Real-time Processing
The demand for real-time AI processing is driving the adoption of edge computing solutions, enabling faster decision-making and reduced latency.

## Implementation Strategies

Successful AI implementation requires:
- Clear business objectives and success metrics
- Cross-functional team collaboration
- Robust data infrastructure
- Continuous monitoring and optimization

## Conclusion

The future of enterprise AI is bright, but success requires strategic planning, ethical considerations, and a commitment to continuous learning and adaptation.`,
        status: 'PUBLISHED',
        published: true,
        publishedAt: new Date(),
        featured: true,
        authorId: adminUser.id,
        categoryId: categories[0].id,
        tags: ['AI Strategy', 'Enterprise AI', 'Digital Transformation', '2024 Trends'],
        seoTitle: 'Enterprise AI Trends 2024 | Future of Business Intelligence',
        seoDescription: 'Discover the latest enterprise AI trends for 2024, including generative AI integration, governance frameworks, and implementation strategies.',
        readTime: 8,
        views: 1250,
      },
    }),
    prisma.blogPost.upsert({
      where: { slug: 'machine-learning-deployment-best-practices' },
      update: {},
      create: {
        title: 'Machine Learning Deployment: Best Practices for Production Systems',
        slug: 'machine-learning-deployment-best-practices',
        excerpt: 'Learn proven strategies for deploying ML models to production, including MLOps practices, monitoring, and scaling considerations.',
        content: `# Machine Learning Deployment: Best Practices for Production Systems

Deploying machine learning models to production is one of the most challenging aspects of the ML lifecycle. This comprehensive guide covers essential practices for successful ML deployment.

## Pre-Deployment Checklist

### Model Validation
- Comprehensive testing on holdout datasets
- Performance metrics validation
- Bias and fairness assessments
- Edge case handling verification

### Infrastructure Readiness
- Scalable serving infrastructure
- Monitoring and alerting systems
- Data pipeline validation
- Security and compliance checks

## Deployment Strategies

### Blue-Green Deployment
Deploy new models alongside existing ones, allowing for quick rollbacks if issues arise.

### Canary Releases
Gradually roll out new models to a subset of users, monitoring performance before full deployment.

### A/B Testing
Compare new models against existing ones using controlled experiments.

## Monitoring and Maintenance

Continuous monitoring is crucial for maintaining model performance:
- Data drift detection
- Model performance degradation alerts
- Feature importance tracking
- Business impact measurement

## Conclusion

Successful ML deployment requires careful planning, robust infrastructure, and continuous monitoring. By following these best practices, organizations can ensure their ML models deliver consistent value in production environments.`,
        status: 'PUBLISHED',
        published: true,
        publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
        featured: false,
        authorId: consultantUser.id,
        categoryId: categories[1].id,
        tags: ['MLOps', 'Deployment', 'Production ML', 'Best Practices'],
        seoTitle: 'ML Deployment Best Practices | Production Machine Learning',
        seoDescription: 'Master machine learning deployment with proven MLOps practices, monitoring strategies, and scaling techniques for production systems.',
        readTime: 12,
        views: 892,
      },
    }),
  ]);

  console.log('✅ Blog posts created');

  // Create case studies
  const caseStudies = await Promise.all([
    prisma.caseStudyEntry.upsert({
      where: { slug: 'techcorp-predictive-analytics' },
      update: {},
      create: {
        title: 'Predictive Analytics Transformation at TechCorp Solutions',
        slug: 'techcorp-predictive-analytics',
        description: 'How we helped TechCorp implement a comprehensive predictive analytics system that increased operational efficiency by 40% and reduced costs by $2.3M annually.',
        client: 'TechCorp Solutions',
        industry: 'Technology Services',
        tags: ['Predictive Analytics', 'Cost Reduction', 'Operational Efficiency'],
        results: [
          { metric: 'Operational Efficiency Increase', value: '40%' },
          { metric: 'Annual Cost Reduction', value: '$2.3M' },
          { metric: 'Prediction Accuracy', value: '94.5%' },
          { metric: 'Implementation Timeline', value: '4 months' }
        ],
        content: `# Predictive Analytics Transformation at TechCorp Solutions

## Challenge
TechCorp Solutions, a leading technology services provider, was struggling with inefficient resource allocation and high operational costs. Their reactive approach to demand forecasting resulted in either over-provisioning resources or falling short of customer expectations.

## Solution
We implemented a comprehensive predictive analytics system that leveraged:
- Historical data analysis and pattern recognition
- Real-time demand forecasting models
- Automated resource optimization algorithms
- Interactive dashboards for decision-making

## Implementation Process
The 4-month implementation included:
1. Data infrastructure setup and integration
2. Model development and training
3. System integration and testing
4. User training and change management

## Results
The predictive analytics system delivered exceptional results:
- 40% increase in operational efficiency
- $2.3M in annual cost savings
- 94.5% prediction accuracy
- Improved customer satisfaction scores

## Key Technologies Used
- Python and scikit-learn for model development
- Apache Airflow for data pipeline orchestration
- PostgreSQL for data warehousing
- React and D3.js for visualization dashboards

## Conclusion
This transformation demonstrates the power of predictive analytics in optimizing business operations and driving significant cost savings.`,
        status: 'PUBLISHED',
        featured: true,
        publishedAt: new Date(),
        authorId: adminUser.id,
      },
    }),
    prisma.caseStudyEntry.upsert({
      where: { slug: 'financefirst-fraud-detection' },
      update: {},
      create: {
        title: 'Advanced Fraud Detection System for FinanceFirst Bank',
        slug: 'financefirst-fraud-detection',
        description: 'Development of a sophisticated ML-powered fraud detection system that reduced false positives by 65% while maintaining 99.7% accuracy.',
        client: 'FinanceFirst Bank',
        industry: 'Financial Services',
        tags: ['Fraud Detection', 'Machine Learning', 'Real-time Processing'],
        results: [
          { metric: 'False Positive Reduction', value: '65%' },
          { metric: 'Detection Accuracy', value: '99.7%' },
          { metric: 'Processing Speed', value: '<100ms' },
          { metric: 'Annual Savings', value: '$1.8M' }
        ],
        content: `# Advanced Fraud Detection System for FinanceFirst Bank

## Challenge
FinanceFirst Bank was facing significant challenges with their legacy fraud detection system, which generated too many false positives and missed sophisticated fraud patterns.

## Solution
We developed a state-of-the-art ML-powered fraud detection system featuring:
- Ensemble learning models for improved accuracy
- Real-time transaction scoring
- Behavioral analytics and anomaly detection
- Adaptive learning capabilities

## Technical Architecture
- Stream processing with Apache Kafka
- Machine learning pipeline with TensorFlow
- Real-time inference with Redis caching
- Microservices architecture on Kubernetes

## Results
The new system achieved remarkable improvements:
- 65% reduction in false positives
- 99.7% fraud detection accuracy
- Sub-100ms transaction processing
- $1.8M in annual fraud prevention savings

## Conclusion
This project showcases the effectiveness of modern ML techniques in financial fraud detection and the importance of real-time processing capabilities.`,
        status: 'PUBLISHED',
        featured: true,
        publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
        authorId: consultantUser.id,
      },
    }),
  ]);

  console.log('✅ Case studies created');

  // Create sample projects
  const sampleProject = await prisma.project.create({
    data: {
      title: 'AI-Powered Customer Analytics Platform',
      description: 'Development of a comprehensive customer analytics platform using machine learning to provide actionable insights and predictive capabilities.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      budget: 75000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      userId: clientUser.id,
    },
  });

  console.log('✅ Sample project created');

  // Create sample tasks for the project
  await Promise.all([
    prisma.task.create({
      data: {
        title: 'Data Infrastructure Setup',
        description: 'Set up data pipelines and warehousing infrastructure',
        status: 'COMPLETED',
        priority: 'HIGH',
        projectId: sampleProject.id,
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        title: 'ML Model Development',
        description: 'Develop and train customer segmentation and prediction models',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        projectId: sampleProject.id,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      },
    }),
    prisma.task.create({
      data: {
        title: 'Dashboard Development',
        description: 'Create interactive dashboards for analytics visualization',
        status: 'TODO',
        priority: 'MEDIUM',
        projectId: sampleProject.id,
        dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  console.log('✅ Sample tasks created');

  // Create performance metrics
  await prisma.performanceMetric.createMany({
    data: [
      {
        name: 'api_response_time',
        value: { avg: 245, p95: 450, p99: 680 },
        type: 'HISTOGRAM',
        category: 'performance',
        unit: 'ms',
      },
      {
        name: 'active_users',
        value: 1247,
        type: 'GAUGE',
        category: 'engagement',
        unit: 'users',
      },
      {
        name: 'ml_model_accuracy',
        value: { accuracy: 0.947, precision: 0.932, recall: 0.961 },
        type: 'GAUGE',
        category: 'ml_performance',
        unit: 'score',
      },
    ],
  });

  console.log('✅ Performance metrics created');

  // Create system health records
  await prisma.systemHealth.createMany({
    data: [
      {
        service: 'database',
        status: 'healthy',
        responseTime: 25,
        uptime: 99.99,
      },
      {
        service: 'api',
        status: 'healthy',
        responseTime: 180,
        uptime: 99.95,
      },
      {
        service: 'redis',
        status: 'healthy',
        responseTime: 5,
        uptime: 100.0,
      },
    ],
  });

  console.log('✅ System health records created');

  // Create newsletter subscriptions
  await Promise.all([
    prisma.newsletter.upsert({
      where: { email: 'subscriber1@example.com' },
      update: {},
      create: {
        email: 'subscriber1@example.com',
        status: 'SUBSCRIBED',
        preferences: { topics: ['AI', 'Machine Learning'], frequency: 'weekly' },
      },
    }),
    prisma.newsletter.upsert({
      where: { email: 'subscriber2@example.com' },
      update: {},
      create: {
        email: 'subscriber2@example.com',
        status: 'SUBSCRIBED',
        preferences: { topics: ['Data Science', 'Industry Insights'], frequency: 'monthly' },
      },
    }),
  ]);

  console.log('✅ Newsletter subscriptions created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log('- Users: Admin, Consultant, Client');
  console.log('- Team Members: 3');
  console.log('- Testimonials: 3');
  console.log('- Blog Categories: 4');
  console.log('- Blog Posts: 2');
  console.log('- Case Studies: 2');
  console.log('- Projects: 1');
  console.log('- Tasks: 3');
  console.log('- Performance Metrics: 3');
  console.log('- System Health: 3');
  console.log('- Newsletter Subscribers: 2');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });