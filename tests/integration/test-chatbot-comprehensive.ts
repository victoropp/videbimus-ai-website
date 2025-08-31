import { EnterpriseKnowledgeBase } from './src/lib/ai/enterprise-knowledge-base';

// Initialize the knowledge base
const kb = new EnterpriseKnowledgeBase();

// Comprehensive test questions covering all categories
const testQuestions = [
  // Pricing (should lead to consultation)
  "What's your pricing?",
  "How much for AI consulting?",
  "Do you have budget-friendly options?",
  
  // Services
  "What services do you offer?",
  "Can you help with NLP?",
  "Do you do computer vision?",
  
  // Technical
  "What tech stack do you use?",
  "How does your AI model work?",
  "Can you integrate with AWS?",
  
  // Demo/Trial
  "Can I get a demo?",
  "Do you offer free trials?",
  "I want to test your platform",
  
  // Company/Team
  "Who are you?",
  "Tell me about your team",
  "What's your experience?",
  
  // Industries
  "Do you work with healthcare?",
  "What about finance solutions?",
  "Can you help retail businesses?",
  
  // Process
  "What's your methodology?",
  "How long does implementation take?",
  "What's the timeline?",
  
  // ROI/Benefits
  "What's the ROI?",
  "Is it worth the investment?",
  "What are the benefits?",
  
  // Security
  "Is your platform secure?",
  "Are you GDPR compliant?",
  "What about data privacy?",
  
  // Success Stories
  "Do you have case studies?",
  "Show me success examples",
  "Who are your clients?",
  
  // Getting Started
  "How do I get started?",
  "What's the first step?",
  "I want to begin",
  
  // Data Requirements
  "How much data do I need?",
  "What if I don't have enough data?",
  
  // Contact
  "How can I contact you?",
  "Schedule a meeting",
  "I want to talk to someone",
  
  // Support
  "I need help",
  "Having an issue",
  "Need support",
  
  // Problems
  "We're struggling with efficiency",
  "Our processes are slow",
  
  // General
  "Hello",
  "Thank you",
  "Goodbye",
  
  // Competition
  "Why should I choose you?",
  "How are you different?",
  
  // Partnership
  "Can we partner?",
  "Interested in collaboration",
  
  // Jobs
  "Are you hiring?",
  "Career opportunities?"
];

async function testComprehensiveChatbot() {
  console.log('🤖 Comprehensive Chatbot Test - 30+ Questions\n');
  console.log('=' .repeat(80));
  
  let successCount = 0;
  let totalTests = testQuestions.length;
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n📝 Test ${i + 1}/${totalTests}: "${question}"`);
    console.log('-'.repeat(60));
    
    try {
      // Analyze intent
      const intent = await kb.analyzeIntent(question);
      console.log(`🎯 Intent: ${intent.type} (${(intent.confidence * 100).toFixed(0)}%)`);
      
      // Search knowledge base
      const documents = await kb.searchKnowledge(question, intent);
      
      // Generate response
      const response = await kb.generateContextualResponse(question, documents, intent);
      
      // Validate response quality
      const validations = {
        hasContent: response.length > 100,
        isContextual: response.includes('Vidibemus') || response.includes('our') || response.includes('we'),
        hasCallToAction: response.includes('?') || response.includes('→') || response.includes('schedule'),
        noSpecificPricing: !/\$\d+/.test(response),
        isFormatted: response.includes('**') || response.includes('•') || response.includes('✅'),
      };
      
      const passed = Object.values(validations).every(v => v);
      if (passed) successCount++;
      
      console.log(`\n📊 Quality Checks:`);
      console.log(`  ✅ Has Content (>100 chars): ${validations.hasContent ? '✓' : '✗'}`);
      console.log(`  ✅ Is Contextual: ${validations.isContextual ? '✓' : '✗'}`);
      console.log(`  ✅ Has Call-to-Action: ${validations.hasCallToAction ? '✓' : '✗'}`);
      console.log(`  ✅ No Specific Pricing: ${validations.noSpecificPricing ? '✓' : '✗'}`);
      console.log(`  ✅ Well Formatted: ${validations.isFormatted ? '✓' : '✗'}`);
      
      console.log(`\n💬 Response Preview:`);
      console.log(response.substring(0, 200) + '...');
      
      console.log(`\n${passed ? '✅ PASSED' : '❌ FAILED'}`);
    } catch (error) {
      console.error('❌ Error:', error.message);
    }
    
    console.log('=' .repeat(80));
  }
  
  // Final summary
  console.log(`\n\n📊 FINAL RESULTS`);
  console.log('=' .repeat(80));
  console.log(`✅ Passed: ${successCount}/${totalTests} (${(successCount/totalTests*100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${totalTests - successCount}/${totalTests}`);
  
  if (successCount === totalTests) {
    console.log('\n🎉 PERFECT SCORE! All tests passed!');
  } else if (successCount >= totalTests * 0.9) {
    console.log('\n👍 EXCELLENT! Over 90% tests passed!');
  } else if (successCount >= totalTests * 0.8) {
    console.log('\n👌 GOOD! Over 80% tests passed!');
  } else {
    console.log('\n⚠️ NEEDS IMPROVEMENT! Less than 80% tests passed.');
  }
  
  console.log('\n✅ Testing Complete!\n');
}

// Run the test
testComprehensiveChatbot().catch(console.error);