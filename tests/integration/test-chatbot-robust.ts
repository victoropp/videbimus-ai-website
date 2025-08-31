import { EnterpriseKnowledgeBase } from './src/lib/ai/enterprise-knowledge-base';

// Initialize the knowledge base
const kb = new EnterpriseKnowledgeBase();

// Comprehensive test categories with realistic user queries
const testCategories = {
  // Natural conversation starters
  conversational: [
    "hey there",
    "hi, I'm John from ABC Corp",
    "good morning",
    "can you help me?",
    "are you there?",
    "is anyone available?",
    "I have a question"
  ],
  
  // Vague and unclear queries
  vague: [
    "tell me more",
    "what about AI?",
    "how does it work?",
    "can you do that?",
    "is it good?",
    "what's the deal with this?",
    "explain",
    "I don't understand"
  ],
  
  // Specific business problems
  businessProblems: [
    "our customer churn is too high",
    "we need to reduce operational costs",
    "manual processes are killing productivity",
    "can't predict demand accurately",
    "fraud is costing us millions",
    "data is all over the place",
    "competitors are ahead of us",
    "we're drowning in data but have no insights"
  ],
  
  // Technical implementation questions
  technicalDetails: [
    "do you use transformers?",
    "what about BERT models?",
    "can you deploy on-premise?",
    "does it work with our SAP system?",
    "what's your API rate limit?",
    "how do you handle data privacy?",
    "what about model explainability?",
    "can it process real-time streams?"
  ],
  
  // Pricing variations
  pricingVariations: [
    "what's this gonna cost me?",
    "ballpark figure?",
    "rough estimate please",
    "is it expensive?",
    "what's the damage?",
    "how much are we talking?",
    "what's the investment?",
    "budget requirements?"
  ],
  
  // Skeptical questions
  skeptical: [
    "why should I trust you?",
    "how do I know this works?",
    "sounds too good to be true",
    "what's the catch?",
    "prove it works",
    "everyone says they do AI",
    "how are you different from IBM?",
    "why not just use ChatGPT?"
  ],
  
  // Urgent requests
  urgent: [
    "I need this ASAP",
    "how fast can you deliver?",
    "emergency implementation needed",
    "can you start tomorrow?",
    "we have 2 weeks deadline",
    "urgent project",
    "need something by Friday",
    "this is time sensitive"
  ],
  
  // Industry specific
  industrySpecific: [
    "HIPAA compliant for healthcare?",
    "work with banks?",
    "retail inventory optimization?",
    "manufacturing quality control?",
    "insurance claim processing?",
    "legal document analysis?",
    "real estate valuation models?",
    "educational platform integration?"
  ],
  
  // Decision maker questions
  executive: [
    "ROI expectations?",
    "board presentation materials?",
    "risk assessment?",
    "competitive advantage?",
    "strategic alignment?",
    "change management support?",
    "stakeholder buy-in?",
    "success metrics?"
  ],
  
  // Comparison questions
  comparison: [
    "vs Microsoft Azure AI?",
    "better than AWS?",
    "compare to Google Cloud AI",
    "how about Palantir?",
    "difference from consultancies?",
    "why not McKinsey?",
    "vs building in-house?",
    "compare to open source?"
  ],
  
  // Action-oriented
  actionOriented: [
    "let's get started",
    "sign me up",
    "book a meeting",
    "send me info",
    "I'm ready to proceed",
    "next steps?",
    "how do we begin?",
    "let's do this"
  ],
  
  // Edge cases and typos
  edgeCases: [
    "asdfasdf",
    "123456",
    "????????",
    "HELP ME NOW!!!",
    "heeeeelp",
    "wat iz ai",
    "cn u hlp",
    ""
  ]
};

interface TestResult {
  query: string;
  category: string;
  intent: string;
  responseLength: number;
  hasFormatting: boolean;
  hasCallToAction: boolean;
  isNatural: boolean;
  isPersonalized: boolean;
  noPricingDetails: boolean;
  responseTime: number;
  score: number;
  issues: string[];
}

async function analyzeResponse(response: string, query: string): Promise<Partial<TestResult>> {
  const issues: string[] = [];
  let score = 100;
  
  // Check for robotic phrases to avoid
  const roboticPhrases = [
    'Based on our knowledge base',
    'According to our database',
    'As per our records',
    'I am an AI',
    'I am a bot',
    'I cannot',
    'I do not have',
    'Error:',
    'undefined',
    'null'
  ];
  
  roboticPhrases.forEach(phrase => {
    if (response.toLowerCase().includes(phrase.toLowerCase())) {
      issues.push(`Contains robotic phrase: "${phrase}"`);
      score -= 15;
    }
  });
  
  // Check for good conversational elements
  const conversationalElements = {
    greeting: /^(Hi|Hello|Hey|Welcome|Great|Excellent|Absolutely|Sure|Of course|I'd be happy|Thanks for)/i,
    empathy: /(understand|appreciate|realize|see|hear you|makes sense|good question|great point)/i,
    personalization: /(you|your|you're|you've|Let's|We can|Together)/i,
    enthusiasm: /(excited|happy|pleased|great|excellent|wonderful|fantastic|perfect)/i
  };
  
  let hasConversationalStart = false;
  for (const [key, pattern] of Object.entries(conversationalElements)) {
    if (pattern.test(response)) {
      hasConversationalStart = true;
      break;
    }
  }
  
  if (!hasConversationalStart && query.length > 5) {
    issues.push('Missing conversational opening');
    score -= 10;
  }
  
  // Check response quality
  const quality = {
    hasFormatting: /(\*\*|##|###|•|✓|→|🎯|💡|📊)/.test(response),
    hasCallToAction: /(\?|Let's|Would you|Can I|Should we|Ready to|Want to|Shall we)/.test(response),
    isNatural: !response.startsWith('Based on') && !response.startsWith('According to'),
    isPersonalized: /\b(you|your|you're|you've)\b/i.test(response),
    noPricingDetails: !/\$\d+/.test(response),
    appropriateLength: response.length > 100 && response.length < 2000
  };
  
  if (!quality.hasFormatting) {
    issues.push('Lacks formatting for readability');
    score -= 5;
  }
  
  if (!quality.hasCallToAction) {
    issues.push('Missing call-to-action');
    score -= 10;
  }
  
  if (!quality.isPersonalized) {
    issues.push('Not personalized enough');
    score -= 10;
  }
  
  if (!quality.noPricingDetails) {
    issues.push('Contains specific pricing');
    score -= 20;
  }
  
  if (!quality.appropriateLength) {
    if (response.length < 100) {
      issues.push('Response too short');
      score -= 15;
    } else {
      issues.push('Response too long');
      score -= 5;
    }
  }
  
  // Check for context awareness
  const queryLower = query.toLowerCase();
  const responseLower = response.toLowerCase();
  
  // Should acknowledge urgency
  if (queryLower.includes('urgent') || queryLower.includes('asap') || queryLower.includes('quickly')) {
    if (!responseLower.includes('immediate') && !responseLower.includes('right away') && !responseLower.includes('quickly')) {
      issues.push('Doesn\'t acknowledge urgency');
      score -= 10;
    }
  }
  
  // Should acknowledge skepticism
  if (queryLower.includes('trust') || queryLower.includes('prove') || queryLower.includes('catch')) {
    if (!responseLower.includes('understand') && !responseLower.includes('demonstrate') && !responseLower.includes('show')) {
      issues.push('Doesn\'t address skepticism properly');
      score -= 10;
    }
  }
  
  return {
    ...quality,
    score: Math.max(0, score),
    issues
  };
}

async function testRobustChatbot() {
  console.log('🤖 ROBUST CHATBOT TESTING SUITE\n');
  console.log('=' .repeat(80));
  
  const results: TestResult[] = [];
  let totalTests = 0;
  
  // Test each category
  for (const [category, questions] of Object.entries(testCategories)) {
    console.log(`\n📁 Testing Category: ${category.toUpperCase()}`);
    console.log('-'.repeat(60));
    
    for (const query of questions) {
      totalTests++;
      const startTime = Date.now();
      
      try {
        // Analyze intent
        const intent = await kb.analyzeIntent(query);
        
        // Search knowledge base
        const documents = await kb.searchKnowledge(query, intent);
        
        // Generate response
        const response = await kb.generateContextualResponse(query, documents, intent);
        
        const responseTime = Date.now() - startTime;
        
        // Analyze response quality
        const analysis = await analyzeResponse(response, query);
        
        const result: TestResult = {
          query,
          category,
          intent: intent.type,
          responseLength: response.length,
          responseTime,
          ...analysis as any
        };
        
        results.push(result);
        
        // Display condensed result
        const statusIcon = result.score >= 80 ? '✅' : result.score >= 60 ? '⚠️' : '❌';
        console.log(`${statusIcon} "${query.substring(0, 30)}..." Score: ${result.score}%`);
        
        if (result.issues.length > 0 && result.score < 80) {
          console.log(`   Issues: ${result.issues.join(', ')}`);
        }
        
      } catch (error) {
        console.error(`❌ ERROR: "${query}" - ${error.message}`);
        results.push({
          query,
          category,
          intent: 'error',
          responseLength: 0,
          hasFormatting: false,
          hasCallToAction: false,
          isNatural: false,
          isPersonalized: false,
          noPricingDetails: true,
          responseTime: 0,
          score: 0,
          issues: [`Error: ${error.message}`]
        });
      }
    }
  }
  
  // Calculate statistics
  console.log('\n' + '='.repeat(80));
  console.log('📊 TESTING SUMMARY\n');
  
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  const passed = results.filter(r => r.score >= 80).length;
  const warning = results.filter(r => r.score >= 60 && r.score < 80).length;
  const failed = results.filter(r => r.score < 60).length;
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Average Score: ${avgScore.toFixed(1)}%`);
  console.log(`✅ Passed (80%+): ${passed} (${(passed/totalTests*100).toFixed(1)}%)`);
  console.log(`⚠️  Warning (60-79%): ${warning} (${(warning/totalTests*100).toFixed(1)}%)`);
  console.log(`❌ Failed (<60%): ${failed} (${(failed/totalTests*100).toFixed(1)}%)`);
  
  // Category breakdown
  console.log('\n📈 Category Performance:');
  for (const category of Object.keys(testCategories)) {
    const categoryResults = results.filter(r => r.category === category);
    const categoryAvg = categoryResults.reduce((sum, r) => sum + r.score, 0) / categoryResults.length;
    const icon = categoryAvg >= 80 ? '✅' : categoryAvg >= 60 ? '⚠️' : '❌';
    console.log(`${icon} ${category}: ${categoryAvg.toFixed(1)}%`);
  }
  
  // Most common issues
  console.log('\n⚠️  Most Common Issues:');
  const issueCount: Record<string, number> = {};
  results.forEach(r => {
    r.issues.forEach(issue => {
      issueCount[issue] = (issueCount[issue] || 0) + 1;
    });
  });
  
  Object.entries(issueCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([issue, count]) => {
      console.log(`   • ${issue}: ${count} occurrences`);
    });
  
  // Response time analysis
  const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
  console.log(`\n⏱️  Average Response Time: ${avgResponseTime.toFixed(0)}ms`);
  
  // Final grade
  let grade = 'F';
  if (avgScore >= 90) grade = 'A';
  else if (avgScore >= 80) grade = 'B';
  else if (avgScore >= 70) grade = 'C';
  else if (avgScore >= 60) grade = 'D';
  
  console.log(`\n🎯 FINAL GRADE: ${grade} (${avgScore.toFixed(1)}%)`);
  
  if (avgScore >= 80) {
    console.log('✨ Chatbot is performing well!');
  } else if (avgScore >= 60) {
    console.log('⚠️  Chatbot needs improvement in natural language handling');
  } else {
    console.log('❌ Chatbot requires significant improvements');
  }
  
  console.log('\n' + '='.repeat(80));
  console.log('Testing Complete!\n');
}

// Run the test
testRobustChatbot().catch(console.error);