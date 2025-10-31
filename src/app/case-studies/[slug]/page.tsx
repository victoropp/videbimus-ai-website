'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Calendar, Clock, Users, TrendingUp, DollarSign, Target, Award, CheckCircle, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { CaseStudy } from '@/types'

// Extended case study data with detailed information
const detailedCaseStudies: Record<string, CaseStudy & {
  content: {
    challenge: string
    solution: string
    implementation: string
    outcomes: string
  }
  timeline: string
  teamSize: string
  technologies: string[]
  keyFeatures: string[]
  challenges: string[]
  futureEnhancements: string[]
  solutionImages?: string[]
  resultImages?: string[]
}> = {
  'petroverse-oil-gas': {
    id: 'petroverse-oil-gas',
    title: 'Oil & Gas: Stop $200K Equipment Failures',
    description: 'Equipment kept failing with zero warning. Every failure cost $200K+ in downtime and repairs. Maintenance teams were flying blind—reacting to breakdowns instead of preventing them. We built a system that predicts failures 2 weeks before they happen.',
    client: 'Petroverse',
    industry: 'Oil & Gas',
    image: '/images/case-studies/petroverse/petroverse-featured.jpg',
    tags: ['Predictive Maintenance', 'IoT Sensors', 'Machine Learning'],
    results: [
      { metric: 'Equipment Failures Cut', value: '45%' },
      { metric: 'Early Warning Time', value: '2 Weeks' },
      { metric: 'First Year Savings', value: '$2.5M' },
      { metric: 'False Alarms', value: '<5%' }
    ],
    content: {
      challenge: 'Petroverse faced critical challenges with equipment failures that occurred without warning, costing over $200K per incident in downtime and emergency repairs. Maintenance teams operated reactively, unable to predict when critical drilling and refining equipment would fail. This unpredictability led to production losses, safety concerns, and mounting operational costs. Traditional time-based maintenance schedules were insufficient for the harsh operating conditions of oil and gas facilities.',
      solution: 'We developed an AI-powered predictive maintenance system that monitors equipment health in real-time using IoT sensors deployed across critical machinery. Machine learning models analyze vibration patterns, temperature fluctuations, pressure changes, and operational metrics to predict equipment failures up to 2 weeks in advance. The system provides maintenance teams with prioritized alerts and recommended actions, enabling proactive intervention before costly breakdowns occur.',
      implementation: 'The implementation was conducted in 7 weeks with minimal operational disruption. We deployed IoT sensor networks across drilling equipment, pumps, compressors, and refining machinery. The ML models were trained on 5 years of historical maintenance data combined with real-time sensor readings. We integrated the predictive system with existing maintenance workflows and provided comprehensive training to maintenance crews. The solution included a mobile app for field technicians and a central dashboard for operations managers.',
      outcomes: 'The predictive maintenance system has transformed Petroverses operations, reducing equipment failures by 45% and providing 2-week advance warning with 95% accuracy. The company saved $2.5M in the first year through avoided downtime and optimized maintenance scheduling. False alarm rates stayed below 5%, ensuring maintenance teams trust the system. Safety incidents related to equipment failure decreased by 60%, and overall equipment effectiveness (OEE) improved by 35%.'
    },
    timeline: '7 weeks',
    teamSize: '8 specialists',
    technologies: ['Python', 'TensorFlow', 'Apache Kafka', 'InfluxDB', 'PostgreSQL', 'React', 'AWS IoT Core', 'Docker'],
    keyFeatures: [
      'Real-time equipment monitoring with IoT sensor networks',
      'Predictive ML models with 95% accuracy for failure prediction',
      'Two-week advance warning for critical equipment failures',
      'Automated maintenance prioritization and scheduling',
      'Mobile app for field technicians with offline capability',
      'Integration with existing CMMS and ERP systems'
    ],
    challenges: [
      'Deploying sensors in harsh oil & gas environments',
      'Achieving high accuracy with limited historical failure data',
      'Ensuring system reliability in remote locations',
      'Training models for diverse equipment types'
    ],
    futureEnhancements: [
      'Expansion to offshore platforms and remote wells',
      'Integration with drone inspection systems',
      'Advanced anomaly detection for new failure patterns',
      'Predictive spare parts inventory optimization'
    ],
    solutionImages: [
      '/images/case-studies/petroverse/petroverse-solution-dashboard.jpg',
      '/images/case-studies/petroverse/petroverse-solution-sensors.jpg',
      '/images/case-studies/petroverse/petroverse-solution-monitoring.jpg'
    ],
    resultImages: [
      '/images/case-studies/petroverse/petroverse-results-metrics.jpg',
      '/images/case-studies/petroverse/petroverse-results-uptime.jpg'
    ]
  },
  'insure360-insurance': {
    id: 'insure360-insurance',
    title: 'Insurance: Process Claims 60% Faster',
    description: 'Claims were taking 7-10 days because adjusters spent hours manually extracting data from PDFs and photos. Fraud was slipping through. Customers were furious. We automated the document processing and built fraud detection that actually works—claims now take 2-3 days.',
    client: 'INSURE360',
    industry: 'Insurance',
    image: '/images/case-studies/insure360/insure360-featured.jpg',
    tags: ['Claims Automation', 'Fraud Detection', 'Computer Vision'],
    results: [
      { metric: 'Processing Time', value: '2-3 Days' },
      { metric: 'Fraud Detection', value: '98.5%' },
      { metric: 'Labor Cost Saved', value: '50%' },
      { metric: 'Customer Satisfaction', value: '+85%' }
    ],
    content: {
      challenge: 'INSURE360 struggled with a claims processing bottleneck that frustrated both customers and staff. Adjusters spent 60-70% of their time manually extracting data from accident reports, medical documents, photos, and police reports. The 7-10 day processing time led to customer complaints and poor satisfaction scores. Fraudulent claims were slipping through manual review processes, costing millions annually. The company needed to speed up legitimate claims while catching fraud more effectively.',
      solution: 'We built an intelligent claims automation platform powered by computer vision and NLP. The system automatically extracts data from documents and photos using OCR and machine learning. Advanced fraud detection algorithms analyze claim patterns, cross-reference databases, and flag suspicious submissions with 98.5% accuracy. The platform integrates with existing claims management systems and provides adjusters with pre-processed, verified information, allowing them to focus on decision-making rather than data entry.',
      implementation: 'The 6-month implementation included extensive testing with historical claims data to ensure regulatory compliance and accuracy. We deployed the document processing engine first, followed by fraud detection models trained on 10 years of claims history. The system was rolled out gradually across different claim types (auto, property, health) with continuous monitoring and model refinement. We provided comprehensive training to claims adjusters and established new workflows that leverage AI assistance while maintaining human oversight for complex cases.',
      outcomes: 'The automated claims platform has revolutionized INSURE360s operations. Processing time dropped from 7-10 days to 2-3 days, a 60% reduction. Fraud detection accuracy reached 98.5%, preventing an estimated $12M in fraudulent payouts annually. Labor costs decreased by 50% as adjusters handle 3x more claims with AI assistance. Customer satisfaction scores increased by 85% due to faster claim resolution. The system processes 50,000+ claims monthly with consistent accuracy.'
    },
    timeline: '6 months',
    teamSize: '10 specialists',
    technologies: ['Python', 'PyTorch', 'Tesseract OCR', 'spaCy', 'PostgreSQL', 'Redis', 'React', 'AWS Textract', 'Docker'],
    keyFeatures: [
      'Automated document extraction from PDFs, images, and forms',
      'Multi-modal fraud detection using ML and pattern analysis',
      'Real-time claim scoring and risk assessment',
      'Integration with police reports and medical databases',
      'Automated customer communication and status updates',
      'Compliance tracking and audit trail generation'
    ],
    challenges: [
      'Handling diverse document formats and quality levels',
      'Ensuring HIPAA and regulatory compliance',
      'Balancing automation speed with fraud detection accuracy',
      'Managing change adoption among experienced adjusters'
    ],
    futureEnhancements: [
      'Mobile app for instant photo claim submission',
      'Integration with telematics data for auto claims',
      'Automated damage estimation from photos',
      'Blockchain-based claim verification network'
    ],
    solutionImages: [
      '/images/case-studies/insure360/insure360-solution-document-scanning.jpg',
      '/images/case-studies/insure360/insure360-solution-fraud-detection.jpg',
      '/images/case-studies/insure360/insure360-solution-claims-processing.jpg'
    ],
    resultImages: [
      '/images/case-studies/insure360/insure360-results-processing-time.jpg',
      '/images/case-studies/insure360/insure360-results-accuracy.jpg'
    ]
  },
  'techcorp-automation': {
    id: 'techcorp-automation',
    title: 'Manufacturing Process Optimization',
    description: 'AI-powered predictive maintenance and quality control system that reduced downtime by 60% and improved product quality by 40%.',
    client: 'TechCorp Industries',
    industry: 'Manufacturing',
    image: '/images/case-studies/techcorp/techcorp-featured.jpg',
    tags: ['Predictive Analytics', 'Computer Vision', 'IoT Integration'],
    results: [
      { metric: 'Downtime Reduction', value: '60%' },
      { metric: 'Quality Improvement', value: '40%' },
      { metric: 'Cost Savings', value: '$2.5M' },
      { metric: 'ROI', value: '280%' }
    ],
    solutionImages: [
      '/images/case-studies/techcorp/techcorp-solution-computer-vision.jpg',
      '/images/case-studies/techcorp/techcorp-solution-quality-control.jpg',
      '/images/case-studies/techcorp/techcorp-solution-defect-detection.jpg'
    ],
    resultImages: [
      '/images/case-studies/techcorp/techcorp-results-quality-metrics.jpg',
      '/images/case-studies/techcorp/techcorp-results-defect-reduction.jpg'
    ],
    content: {
      challenge: 'TechCorp Industries faced significant challenges with unplanned equipment downtime and quality control issues across their manufacturing facilities. Traditional maintenance schedules were inefficient, leading to unexpected breakdowns that cost the company millions in lost production time. Quality control relied heavily on manual inspection, resulting in inconsistent product quality and customer complaints.',
      solution: 'We developed a comprehensive AI-powered system that combines predictive maintenance with advanced quality control. The solution integrates IoT sensors across all critical equipment to monitor performance metrics in real-time. Machine learning models analyze historical and real-time data to predict equipment failures before they occur. Computer vision systems perform automated quality inspection with greater accuracy and consistency than human inspectors.',
      implementation: 'The implementation was rolled out in three phases over 8 months. Phase 1 involved installing IoT sensors and data collection infrastructure. Phase 2 focused on developing and training the predictive models using historical maintenance data. Phase 3 integrated the computer vision quality control system and provided comprehensive staff training. We worked closely with TechCorps maintenance and quality teams to ensure smooth adoption.',
      outcomes: 'The results exceeded all expectations. Equipment downtime was reduced by 60%, saving millions in production costs. Product quality improved by 40%, leading to higher customer satisfaction and reduced warranty claims. The system has paid for itself within 18 months and continues to deliver significant value.'
    },
    timeline: '8 months',
    teamSize: '12 specialists',
    technologies: ['TensorFlow', 'OpenCV', 'Apache Kafka', 'PostgreSQL', 'React', 'Python', 'Docker', 'AWS'],
    keyFeatures: [
      'Real-time equipment monitoring with IoT sensors',
      'Predictive maintenance algorithms with 95% accuracy',
      'Computer vision-based quality inspection',
      'Interactive dashboards for maintenance teams',
      'Automated alert system for critical issues',
      'Mobile app for field technicians'
    ],
    challenges: [
      'Integration with legacy manufacturing systems',
      'Ensuring minimal disruption during sensor installation',
      'Training staff on new predictive maintenance workflows',
      'Achieving required accuracy for quality inspection'
    ],
    futureEnhancements: [
      'Expansion to additional manufacturing facilities',
      'Integration with supply chain optimization',
      'Advanced AR/VR interfaces for maintenance technicians',
      'Enhanced AI models with federated learning'
    ]
  },
  'financeflow-fraud': {
    id: 'financeflow-fraud',
    title: 'Advanced Fraud Detection System',
    description: 'Machine learning-powered fraud detection system that processes millions of transactions daily with 99.7% accuracy.',
    client: 'FinanceFlow',
    industry: 'Financial Services',
    image: '/images/case-studies/financeflow/financeflow-featured.jpg',
    tags: ['Machine Learning', 'Real-time Processing', 'Risk Assessment'],
    results: [
      { metric: 'False Positive Reduction', value: '65%' },
      { metric: 'Fraud Detection Rate', value: '99.7%' },
      { metric: 'Processing Speed', value: '<50ms' },
      { metric: 'Annual Savings', value: '$8.2M' }
    ],
    solutionImages: [
      '/images/case-studies/financeflow/financeflow-solution-fraud-detection.jpg',
      '/images/case-studies/financeflow/financeflow-solution-ml-models.jpg',
      '/images/case-studies/financeflow/financeflow-solution-payment-processing.jpg'
    ],
    resultImages: [
      '/images/case-studies/financeflow/financeflow-results-false-positives.jpg',
      '/images/case-studies/financeflow/financeflow-results-fraud-catch-rate.jpg'
    ],
    content: {
      challenge: 'FinanceFlow was experiencing significant losses due to fraudulent transactions while their existing system generated too many false positives, leading to customer frustration and operational inefficiencies. The legacy rule-based system couldnt adapt to evolving fraud patterns and struggled with the volume of transactions.',
      solution: 'We built a sophisticated machine learning system using ensemble methods and deep learning to detect fraudulent patterns in real-time. The system analyzes hundreds of features including transaction history, behavioral patterns, device fingerprints, and network analysis to make accurate decisions within milliseconds.',
      implementation: 'The project was implemented over 6 months with careful attention to regulatory compliance and seamless integration. We used A/B testing to gradually roll out the new system while maintaining the legacy system as a backup. Extensive testing ensured PCI DSS compliance and zero downtime during deployment.',
      outcomes: 'The new system has transformed FinanceFlows fraud detection capabilities, reducing false positives by 65% while maintaining industry-leading accuracy. Customer satisfaction improved significantly due to fewer legitimate transactions being blocked, while fraud losses decreased by over 80%.'
    },
    timeline: '6 months',
    teamSize: '8 specialists',
    technologies: ['Python', 'Apache Spark', 'Redis', 'Elasticsearch', 'XGBoost', 'Apache Kafka', 'MongoDB', 'AWS'],
    keyFeatures: [
      'Real-time transaction scoring with <50ms latency',
      'Ensemble machine learning models with 99.7% accuracy',
      'Behavioral analytics and pattern recognition',
      'Dynamic risk scoring based on multiple factors',
      'Automated model retraining and drift detection',
      'Comprehensive reporting and analytics dashboard'
    ],
    challenges: [
      'Meeting strict latency requirements for real-time processing',
      'Ensuring PCI DSS and regulatory compliance',
      'Balancing fraud detection with customer experience',
      'Handling class imbalance in fraud detection data'
    ],
    futureEnhancements: [
      'Graph neural networks for network-based fraud detection',
      'Integration with external threat intelligence feeds',
      'Advanced explainability features for compliance',
      'Cross-institutional fraud pattern sharing'
    ]
  },
  'healthtech-diagnosis': {
    id: 'healthtech-diagnosis',
    title: 'AI-Assisted Medical Diagnosis',
    description: 'Deep learning system for medical imaging analysis that assists radiologists in early disease detection.',
    client: 'HealthTech Solutions',
    industry: 'Healthcare',
    image: '/images/case-studies/healthtech/healthtech-featured.jpg',
    tags: ['Deep Learning', 'Computer Vision', 'Medical AI'],
    results: [
      { metric: 'Diagnostic Accuracy', value: '95.8%' },
      { metric: 'Time Reduction', value: '50%' },
      { metric: 'Patient Outcomes', value: '25% Better' },
      { metric: 'Radiologist Efficiency', value: '3x Faster' }
    ],
    solutionImages: [
      '/images/case-studies/healthtech/healthtech-solution-xray-analysis.jpg',
      '/images/case-studies/healthtech/healthtech-solution-mri-scans.jpg',
      '/images/case-studies/healthtech/healthtech-solution-diagnostic-assistance.jpg'
    ],
    resultImages: [
      '/images/case-studies/healthtech/healthtech-results-analysis-speed.jpg',
      '/images/case-studies/healthtech/healthtech-results-accuracy-metrics.jpg'
    ],
    content: {
      challenge: 'HealthTech Solutions needed to address the growing demand for medical imaging analysis while maintaining high diagnostic accuracy. Radiologists were overwhelmed with the volume of cases, leading to delays in diagnosis and treatment. The challenge was to develop an AI system that could assist without replacing human expertise.',
      solution: 'We developed a state-of-the-art deep learning system trained on millions of medical images to detect various conditions including cancer, fractures, and other abnormalities. The system provides probability scores and highlights regions of interest while maintaining full transparency in its decision-making process.',
      implementation: 'The 12-month implementation included extensive collaboration with radiologists and medical staff. We ensured HIPAA compliance and integration with existing PACS systems. The solution underwent rigorous clinical validation and received necessary regulatory approvals before deployment.',
      outcomes: 'The AI system has revolutionized HealthTechs diagnostic capabilities, achieving 95.8% accuracy while reducing diagnosis time by 50%. Early disease detection has improved patient outcomes by 25%, and radiologists can now handle 3x more cases with the AI assistance.'
    },
    timeline: '12 months',
    teamSize: '15 specialists',
    technologies: ['PyTorch', 'MONAI', 'DICOM', 'PostgreSQL', 'React', 'Docker', 'FHIR', 'Azure'],
    keyFeatures: [
      'Multi-modal medical image analysis (CT, MRI, X-ray)',
      'Real-time processing with PACS integration',
      'Explainable AI with region highlighting',
      'Clinical decision support workflows',
      'Automated quality assurance checks',
      'Comprehensive audit trails for compliance'
    ],
    challenges: [
      'Ensuring HIPAA compliance and data security',
      'Achieving required diagnostic accuracy for clinical use',
      'Integration with diverse medical imaging systems',
      'Obtaining regulatory approvals and certifications'
    ],
    futureEnhancements: [
      'Expansion to additional imaging modalities',
      '3D volumetric analysis capabilities',
      'Integration with electronic health records',
      'Longitudinal patient analysis and tracking'
    ]
  },
  'retailmax-personalization': {
    id: 'retailmax-personalization',
    title: 'E-commerce Personalization Engine',
    description: 'AI-driven recommendation system that delivers personalized shopping experiences and increases customer engagement.',
    client: 'RetailMax',
    industry: 'E-commerce',
    image: '/images/case-studies/retailmax/retailmax-featured.jpg',
    tags: ['Recommendation Systems', 'NLP', 'Customer Analytics'],
    results: [
      { metric: 'Conversion Rate', value: '+35%' },
      { metric: 'Customer LTV', value: '+50%' },
      { metric: 'Revenue Growth', value: '+28%' },
      { metric: 'User Engagement', value: '+45%' }
    ],
    solutionImages: [
      '/images/case-studies/retailmax/retailmax-solution-personalization-engine.jpg',
      '/images/case-studies/retailmax/retailmax-solution-recommendation-system.jpg',
      '/images/case-studies/retailmax/retailmax-solution-online-shopping.jpg'
    ],
    resultImages: [
      '/images/case-studies/retailmax/retailmax-results-conversion-rate.jpg',
      '/images/case-studies/retailmax/retailmax-results-revenue-growth.jpg'
    ],
    content: {
      challenge: 'RetailMax struggled with low conversion rates and customer engagement on their e-commerce platform. Generic product recommendations and search results failed to meet individual customer needs, resulting in missed sales opportunities and customer churn.',
      solution: 'We built a comprehensive personalization engine that combines collaborative filtering, content-based filtering, and deep learning to deliver highly relevant product recommendations. The system analyzes customer behavior, preferences, and contextual factors to create unique shopping experiences for each user.',
      implementation: 'The 5-month implementation focused on seamless integration with RetailMaxs existing e-commerce platform. We implemented A/B testing frameworks to measure performance and gradually rolled out personalized features across different customer segments.',
      outcomes: 'The personalization engine delivered exceptional results, increasing conversion rates by 35% and customer lifetime value by 50%. Revenue growth of 28% was achieved within the first year, while user engagement metrics improved by 45% across all customer segments.'
    },
    timeline: '5 months',
    teamSize: '10 specialists',
    technologies: ['Python', 'Apache Spark', 'TensorFlow', 'Redis', 'Elasticsearch', 'Apache Kafka', 'MySQL', 'React'],
    keyFeatures: [
      'Real-time personalized product recommendations',
      'Dynamic pricing and promotion optimization',
      'Personalized search and product discovery',
      'Customer segmentation and behavioral analysis',
      'A/B testing framework for continuous optimization',
      'Multi-channel personalization across web and mobile'
    ],
    challenges: [
      'Cold start problem for new customers',
      'Real-time processing of large-scale user interactions',
      'Balancing exploration vs exploitation in recommendations',
      'Maintaining recommendation quality across diverse product catalog'
    ],
    futureEnhancements: [
      'Visual similarity-based recommendations',
      'Cross-platform personalization (social media, email)',
      'Advanced customer journey optimization',
      'Integration with augmented reality shopping experiences'
    ]
  },
  'logisticscorp-optimization': {
    id: 'logisticscorp-optimization',
    title: 'Supply Chain & Route Optimization',
    description: 'AI-powered logistics optimization platform that reduces delivery times and operational costs across global supply chains.',
    client: 'LogisticsCorp',
    industry: 'Logistics',
    image: '/images/case-studies/logisticscorp/logisticscorp-featured.jpg',
    tags: ['Optimization Algorithms', 'Route Planning', 'Supply Chain AI'],
    results: [
      { metric: 'Delivery Time', value: '-25%' },
      { metric: 'Fuel Savings', value: '30%' },
      { metric: 'Cost Reduction', value: '$5.1M' },
      { metric: 'Customer Satisfaction', value: '92%' }
    ],
    solutionImages: [
      '/images/case-studies/logisticscorp/logisticscorp-solution-route-optimization.jpg',
      '/images/case-studies/logisticscorp/logisticscorp-solution-gps-tracking.jpg',
      '/images/case-studies/logisticscorp/logisticscorp-solution-delivery-trucks.jpg'
    ],
    resultImages: [
      '/images/case-studies/logisticscorp/logisticscorp-results-mile-reduction.jpg',
      '/images/case-studies/logisticscorp/logisticscorp-results-fuel-savings.jpg'
    ],
    content: {
      challenge: 'LogisticsCorp faced inefficiencies in their global supply chain operations, with suboptimal route planning leading to increased costs and delivery delays. The complexity of managing multiple distribution centers, varying delivery requirements, and dynamic constraints made manual optimization impossible.',
      solution: 'We developed an AI-powered logistics optimization platform that uses advanced algorithms to solve complex vehicle routing problems. The system considers multiple constraints including vehicle capacity, time windows, driver schedules, and real-time traffic conditions to generate optimal delivery routes.',
      implementation: 'The 10-month implementation involved integrating with LogisticsCorps existing systems and gradually expanding coverage across different geographic regions. We provided comprehensive training and change management support to ensure successful adoption.',
      outcomes: 'The optimization platform has transformed LogisticsCorps operations, reducing delivery times by 25% and achieving 30% fuel savings. The company has saved over $5.1M annually while improving customer satisfaction to 92% through more reliable and efficient deliveries.'
    },
    timeline: '10 months',
    teamSize: '14 specialists',
    technologies: ['Python', 'OR-Tools', 'PostgreSQL', 'Apache Spark', 'React', 'Docker', 'AWS', 'GraphHopper'],
    keyFeatures: [
      'Multi-objective route optimization algorithms',
      'Real-time traffic and weather integration',
      'Dynamic re-routing based on changing conditions',
      'Driver mobile app with turn-by-turn navigation',
      'Predictive analytics for demand forecasting',
      'Comprehensive reporting and performance analytics'
    ],
    challenges: [
      'Handling complex multi-constraint optimization problems',
      'Integration with diverse legacy logistics systems',
      'Managing real-time updates and dynamic re-routing',
      'Scaling optimization algorithms for global operations'
    ],
    futureEnhancements: [
      'Integration with autonomous vehicle systems',
      'Advanced demand forecasting with external data',
      'Sustainability optimization for carbon footprint reduction',
      'Drone delivery route optimization'
    ]
  },
  'energycorp-prediction': {
    id: 'energycorp-prediction',
    title: 'Smart Grid Energy Forecasting',
    description: 'Machine learning models for energy demand prediction and grid optimization, enabling renewable energy integration.',
    client: 'EnergyCorp',
    industry: 'Energy',
    image: '/images/case-studies/energycorp/energycorp-featured.jpg',
    tags: ['Time Series Forecasting', 'IoT Data', 'Green Energy'],
    results: [
      { metric: 'Prediction Accuracy', value: '96.5%' },
      { metric: 'Energy Waste', value: '-22%' },
      { metric: 'Renewable Integration', value: '+40%' },
      { metric: 'Grid Efficiency', value: '+18%' }
    ],
    solutionImages: [
      '/images/case-studies/energycorp/energycorp-solution-smart-grid.jpg',
      '/images/case-studies/energycorp/energycorp-solution-demand-forecasting.jpg',
      '/images/case-studies/energycorp/energycorp-solution-renewable-energy.jpg'
    ],
    resultImages: [
      '/images/case-studies/energycorp/energycorp-results-accuracy-improvement.jpg',
      '/images/case-studies/energycorp/energycorp-results-waste-reduction.jpg'
    ],
    content: {
      challenge: 'EnergyCorp needed to modernize their grid management to accommodate increasing renewable energy sources while maintaining reliability and efficiency. Traditional forecasting methods were inadequate for handling the variability of renewable energy and changing consumption patterns.',
      solution: 'We developed a comprehensive smart grid forecasting system using advanced time series analysis and machine learning. The system predicts energy demand, renewable generation, and grid conditions to optimize energy distribution and storage decisions in real-time.',
      implementation: 'The 9-month implementation included installation of smart meters and IoT sensors across the grid infrastructure. We developed custom forecasting models and integrated them with existing SCADA systems while ensuring grid stability throughout the deployment.',
      outcomes: 'The smart grid system has achieved 96.5% prediction accuracy, reducing energy waste by 22% and enabling 40% more renewable energy integration. Overall grid efficiency improved by 18%, contributing to both cost savings and environmental sustainability goals.'
    },
    timeline: '9 months',
    teamSize: '11 specialists',
    technologies: ['Python', 'TensorFlow', 'Apache Kafka', 'InfluxDB', 'Grafana', 'Docker', 'Azure', 'SCADA Integration'],
    keyFeatures: [
      'Advanced time series forecasting for demand prediction',
      'Renewable energy generation forecasting',
      'Real-time grid optimization algorithms',
      'Predictive maintenance for grid infrastructure',
      'Energy storage optimization',
      'Interactive dashboards for grid operators'
    ],
    challenges: [
      'Handling highly variable renewable energy sources',
      'Integration with legacy SCADA systems',
      'Ensuring grid stability during system deployment',
      'Managing massive volumes of IoT sensor data'
    ],
    futureEnhancements: [
      'Integration with electric vehicle charging networks',
      'Advanced weather pattern analysis for better forecasting',
      'Peer-to-peer energy trading capabilities',
      'Carbon footprint optimization algorithms'
    ]
  }
}

interface CaseStudyPageProps {
  params: {
    slug: string
  }
}

export default function CaseStudyPage({ params }: CaseStudyPageProps) {
  const caseStudy = detailedCaseStudies[params.slug]

  if (!caseStudy) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section with Featured Image */}
      <section className="relative overflow-hidden">
        {/* Featured Image Background */}
        <div className="relative h-[500px] md:h-[600px]">
          <img
            src={typeof caseStudy.image === 'string' ? caseStudy.image : caseStudy.image.src}
            alt={caseStudy.title}
            className="w-full h-full object-cover"
          />
          {/* Dark gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/40" />

          {/* Colored accent overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/30 to-purple-600/30 mix-blend-multiply" />
        </div>

        {/* Content Overlay */}
        <div className="absolute inset-0 flex items-end">
          <div className="container pb-16 md:pb-20">
            <div className="mb-8">
              <Button asChild variant="secondary" size="sm" className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20">
                <Link href="/case-studies" className="inline-flex items-center">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Case Studies
                </Link>
              </Button>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-4 mb-6">
                <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  {typeof caseStudy.industry === 'string' ? caseStudy.industry : caseStudy.industry.name}
                </Badge>
                <div className="flex items-center text-white/90 text-sm">
                  <Calendar className="mr-1 h-4 w-4" />
                  {caseStudy.timeline}
                </div>
                <div className="flex items-center text-white/90 text-sm">
                  <Users className="mr-1 h-4 w-4" />
                  {caseStudy.teamSize}
                </div>
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl mb-6 drop-shadow-lg">
                {caseStudy.title}
              </h1>

              <p className="text-xl text-gray-100 mb-8 max-w-3xl drop-shadow-md">
                {caseStudy.description}
              </p>

              <div className="text-2xl font-semibold text-cyan-300 drop-shadow-lg">
                {typeof caseStudy.client === 'string' ? caseStudy.client : caseStudy.client.name}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Key Results */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Key Results Achieved
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {caseStudy.results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="text-center hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 mb-2">
                        {result.value}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {result.metric}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Visual Showcase - Solution in Action */}
      {caseStudy.solutionImages && caseStudy.solutionImages.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-gray-50 to-cyan-50/30 dark:from-gray-900 dark:to-cyan-950/20">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Solution in Action
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                See how our AI-powered solution transformed operations through real-world implementation
              </p>
            </motion.div>

            {/* 3-Column Image Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {caseStudy.solutionImages.map((image, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: idx * 0.15 }}
                  className="relative group overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={image}
                      alt={`Solution implementation ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-cyan-900/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                  {/* Hover reveal text */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="text-white font-semibold text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                      {idx === 0 && 'Core Technology'}
                      {idx === 1 && 'System Integration'}
                      {idx === 2 && 'Real-Time Monitoring'}
                    </div>
                  </div>

                  {/* Step number badge */}
                  <div className="absolute top-4 left-4 bg-cyan-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center shadow-lg">
                    {idx + 1}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Challenge & Solution */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Target className="mr-3 h-6 w-6 text-red-500" />
                    The Challenge
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {caseStudy.content.challenge}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <CheckCircle className="mr-3 h-6 w-6 text-green-500" />
                    Our Solution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {caseStudy.content.solution}
                  </p>

                  {/* Solution Images Grid */}
                  {caseStudy.solutionImages && caseStudy.solutionImages.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 mt-6">
                      {caseStudy.solutionImages.map((image, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="relative group overflow-hidden rounded-lg"
                        >
                          <img
                            src={image}
                            alt={`Solution ${idx + 1}`}
                            className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Technologies & Features */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Technologies Used
              </h3>
              <div className="flex flex-wrap gap-2">
                {caseStudy.technologies?.map((tech, index) => (
                  <Badge key={index} variant="outline" className="text-sm">
                    {typeof tech === 'string' ? tech : (tech as any).name || tech}
                  </Badge>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                Key Features
              </h3>
              <ul className="space-y-3">
                {caseStudy.keyFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="mr-2 h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results Visualization - Before & After Style */}
      {caseStudy.resultImages && caseStudy.resultImages.length >= 2 && (
        <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/10">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Measurable Impact
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Data-driven results that transformed business performance
              </p>
            </motion.div>

            {/* Side-by-side comparison layout */}
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {caseStudy.resultImages.map((image, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.2 }}
                  className="relative group"
                >
                  {/* Card container */}
                  <div className="relative overflow-hidden rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 bg-white dark:bg-gray-800">
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden">
                      <img
                        src={image}
                        alt={`Result metric ${idx + 1}`}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/90 via-purple-900/50 to-transparent" />

                    {/* Result label */}
                    <div className="absolute top-4 left-4 right-4">
                      <div className="inline-flex items-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-2" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {idx === 0 ? 'Key Metrics' : 'Performance Gains'}
                        </span>
                      </div>
                    </div>

                    {/* Metric overlay at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="text-4xl font-bold mb-2">
                        {caseStudy.results[idx * 2]?.value || caseStudy.results[idx]?.value}
                      </div>
                      <div className="text-lg opacity-90">
                        {caseStudy.results[idx * 2]?.metric || caseStudy.results[idx]?.metric}
                      </div>
                    </div>

                    {/* Animated border effect */}
                    <div className="absolute inset-0 border-4 border-purple-500/0 group-hover:border-purple-500/50 rounded-2xl transition-all duration-500" />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Stats summary bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-8 bg-white dark:bg-gray-800 px-8 py-4 rounded-full shadow-lg">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Verified Results
                  </span>
                </div>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-600" />
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    ROI Positive
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Implementation & Outcomes */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/50">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Clock className="mr-3 h-6 w-6 text-blue-500" />
                    Implementation Process
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {caseStudy.content.implementation}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-2xl">
                    <Award className="mr-3 h-6 w-6 text-purple-500" />
                    Outcomes & Impact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                    {caseStudy.content.outcomes}
                  </p>

                  {/* Results Images - Side by Side Comparison */}
                  {caseStudy.resultImages && caseStudy.resultImages.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mt-6">
                      {caseStudy.resultImages.map((image, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, scale: 0.9 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className="relative group overflow-hidden rounded-lg border-2 border-purple-200 dark:border-purple-800"
                        >
                          <img
                            src={image}
                            alt={`Result ${idx + 1}`}
                            className="w-full h-40 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-purple-600/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {/* Badge overlay */}
                          <div className="absolute top-2 right-2 bg-purple-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            Metric {idx + 1}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Tags */}
      <section className="py-12 bg-white dark:bg-gray-950">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white">
              Project Tags
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {caseStudy.tags.map((tag, index) => (
                <Badge key={index} className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200 hover:bg-cyan-200 dark:hover:bg-cyan-800">
                  {tag}
                </Badge>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-900 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-purple-600/20" />
        <div className="container relative text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl font-bold text-white mb-4">
              Ready to Achieve Similar Results?
            </h2>
            <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
              Lets discuss how we can help your organization implement AI solutions 
              that deliver measurable business value.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary-900 hover:bg-gray-100">
                <Link href="/contact">
                  Start Your Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/case-studies">
                  View More Case Studies
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

// Generate static params for all case studies (commented out for client component)
// export async function generateStaticParams() {
//   return Object.keys(detailedCaseStudies).map((slug) => ({
//     slug,
//   }))
// }

// Generate metadata for each case study (commented out for client component)
// export async function generateMetadata({ params }: CaseStudyPageProps) {
//   const caseStudy = detailedCaseStudies[params.slug]
//   
//   if (!caseStudy) {
//     return {
//       title: 'Case Study Not Found',
//       description: 'The requested case study could not be found.'
//     }
//   }

//   return {
//     title: `${caseStudy.title} - ${caseStudy.client} Case Study | Videbimus AI`,
//     description: caseStudy.description,
//     keywords: [
//       'AI case study',
//       'machine learning success story',
//       caseStudy.industry,
//       caseStudy.client,
//       ...caseStudy.tags
//     ].join(', '),
//     openGraph: {
//       title: `${caseStudy.title} - ${caseStudy.client}`,
//       description: caseStudy.description,
//       type: 'article',
//       images: [
//         {
//           url: caseStudy.image,
//           width: 1200,
//           height: 630,
//           alt: `${caseStudy.title} case study`
//         }
//       ]
//     },
//     twitter: {
//       card: 'summary_large_image',
//       title: `${caseStudy.title} - ${caseStudy.client}`,
//       description: caseStudy.description,
//       images: [caseStudy.image]
//     }
//   }
// }