import { EnterpriseKnowledgeBase } from './src/lib/ai/enterprise-knowledge-base';

// Initialize the knowledge base
const kb = new EnterpriseKnowledgeBase();

// Test questions covering different categories and intents
const testQuestions = [
  // Pricing Questions (should lead to consultation)
  "How much does your AI consulting cost?",
  "What are your pricing options?",
  "Do you have affordable packages for startups?",
  "What's the budget range for enterprise AI implementation?",
  "Can you give me a price estimate for custom AI development?",
  
  // Service Questions
  "What AI services do you offer?",
  "Can you help with computer vision projects?",
  "Do you provide NLP solutions?",
  "What about predictive analytics implementation?",
  "How can AI help automate my business processes?",
  
  // Technical Questions
  "What AI models do you work with?",
  "Do you support GPT-4 integration?",
  "Can you implement RAG systems?",
  "What about real-time AI processing?",
  "How do you ensure AI model accuracy?",
  
  // General/Demo Questions
  "Can I get a demo of your AI platform?",
  "How do I get started with your services?",
  "What industries do you specialize in?",
  "Do you offer ongoing support after implementation?",
  "What makes Vidibemus AI different from competitors?"
];

async function testChatbot() {
  console.log('🤖 Testing Vidibemus AI Chatbot with 20 Questions\n');
  console.log('=' .repeat(80));
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`\n📝 Question ${i + 1}: "${question}"`);
    console.log('-'.repeat(60));
    
    // Analyze intent
    const intent = await kb.analyzeIntent(question);
    console.log(`🎯 Intent: ${intent.type} (confidence: ${(intent.confidence * 100).toFixed(0)}%)`);
    
    // Search knowledge base
    const documents = await kb.searchKnowledge(question, intent);
    console.log(`📚 Found ${documents.length} relevant documents`);
    
    // Generate response
    const response = await kb.generateContextualResponse(question, documents, intent);
    console.log(`\n💬 Response:\n${response}\n`);
    
    // Check if pricing questions lead to consultation
    if (intent.type === 'pricing' || question.toLowerCase().includes('price') || question.toLowerCase().includes('cost')) {
      const hasConsultationMention = response.toLowerCase().includes('consultation') || 
                                     response.toLowerCase().includes('discuss') ||
                                     response.toLowerCase().includes('schedule') ||
                                     response.toLowerCase().includes('personalized quote');
      const hasSpecificPrice = /\$[\d,]+/.test(response);
      
      console.log(`✅ Consultation Focus: ${hasConsultationMention ? 'YES' : 'NO'}`);
      console.log(`❌ Contains Specific Price: ${hasSpecificPrice ? 'YES (FAIL)' : 'NO (PASS)'}`);
      
      if (hasSpecificPrice) {
        console.log('⚠️  WARNING: Response contains specific pricing!');
      }
    }
    
    // Analyze response quality
    const isGeneric = response.includes('I can help you with') && response.length < 200;
    const isContextual = response.includes('Vidibemus') || 
                         response.includes('our') || 
                         response.includes('we');
    
    console.log(`📊 Response Quality:`);
    console.log(`   - Contextual: ${isContextual ? 'YES ✓' : 'NO ✗'}`);
    console.log(`   - Generic: ${isGeneric ? 'YES ✗' : 'NO ✓'}`);
    console.log(`   - Length: ${response.length} chars`);
    
    console.log('=' .repeat(80));
  }
  
  console.log('\n✅ Testing Complete!\n');
}

// Run the test
testChatbot().catch(console.error);