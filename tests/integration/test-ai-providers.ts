import { HfInference } from '@huggingface/inference';
import { dynamicConfig } from './src/lib/ai/dynamic-config';
import { AIProviderFactory } from './src/lib/ai/provider-factory';

// Test script for AI providers
async function testHuggingFaceModels() {
  console.log('🔍 Testing Hugging Face Integration...\n');
  
  const config = dynamicConfig.getProviderConfig('huggingface');
  const token = config?.apiKey;
  
  if (!token) {
    console.error('❌ No Hugging Face token found');
    return;
  }
  
  console.log(`✅ Token found: ${token.substring(0, 10)}...`);
  console.log(`📍 Token source: ${token === dynamicConfig.get('NEXT_PUBLIC_HUGGINGFACE_API_KEY') ? 'NEXT_PUBLIC_HUGGINGFACE_API_KEY' : 'HUGGINGFACE_API_KEY'}\n`);
  
  const hf = new HfInference(token);
  
  // Models to test with correct API methods
  const modelsToTest = [
    { name: 'gpt2', type: 'text-generation' },
    { name: 'microsoft/DialoGPT-small', type: 'text-generation' },
    { name: 'google/flan-t5-small', type: 'text-generation' },
    { name: 'distilgpt2', type: 'text-generation' },
  ];
  
  console.log('Testing models:\n');
  
  for (const model of modelsToTest) {
    try {
      console.log(`🧪 Testing ${model.name}...`);
      
      const startTime = Date.now();
      
      const response = await hf.textGeneration({
        model: model.name,
        inputs: "The future of AI is",
        parameters: {
          max_new_tokens: 30,
          temperature: 0.7,
          do_sample: true,
        },
      });
      
      console.log(`   ✅ Success! Response: "${response.generated_text?.substring(0, 80)}..."`);
      
      const duration = Date.now() - startTime;
      console.log(`   ⏱️ Response time: ${duration}ms\n`);
      
    } catch (error: any) {
      if (error?.message?.includes('Model') && error?.message?.includes('is currently loading')) {
        console.log(`   ⏳ Model is loading, please wait and retry...\n`);
      } else if (error?.message?.includes('rate limit')) {
        console.log(`   ⚠️ Rate limit reached for this model\n`);
      } else if (error?.message?.includes('gated')) {
        console.log(`   🔒 Model requires special access permissions\n`);
      } else if (error?.message?.includes('not found')) {
        console.log(`   ⚠️ Model not found or not accessible\n`);
      } else {
        console.log(`   ❌ Error: ${error?.message || error}\n`);
      }
    }
  }
  
  // Test inference endpoint directly
  console.log('🧪 Testing direct inference endpoint...\n');
  try {
    const response = await fetch('https://api-inference.huggingface.co/models/gpt2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: 'Hello world',
        parameters: {
          max_new_tokens: 20,
        },
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct API call successful:', JSON.stringify(data, null, 2));
    } else {
      console.log(`❌ Direct API call failed: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.log('Error details:', errorText);
    }
  } catch (error) {
    console.log('❌ Direct API call error:', error);
  }
}

async function testAllProviders() {
  console.log('\n🔍 Testing All AI Providers...\n');
  
  const results = await AIProviderFactory.testAllProviders();
  
  Object.entries(results).forEach(([provider, result]) => {
    if (result.success) {
      console.log(`✅ ${provider}: Connected successfully`);
    } else {
      console.log(`❌ ${provider}: ${result.error || 'Connection failed'}`);
    }
  });
}

async function checkDynamicReload() {
  console.log('\n🔄 Testing Dynamic Configuration Reload...\n');
  
  const initialConfig = dynamicConfig.getAll();
  console.log('Initial HUGGINGFACE token:', initialConfig.HUGGINGFACE_API_KEY?.substring(0, 10) + '...');
  console.log('Initial NEXT_PUBLIC_HUGGINGFACE token:', initialConfig.NEXT_PUBLIC_HUGGINGFACE_API_KEY?.substring(0, 10) + '...');
  
  console.log('\n💡 Modify .env.local file now to test dynamic reload...');
  console.log('⏳ Waiting 10 seconds for changes...\n');
  
  await new Promise(resolve => setTimeout(resolve, 10000));
  
  const updatedConfig = dynamicConfig.getAll();
  console.log('Updated HUGGINGFACE token:', updatedConfig.HUGGINGFACE_API_KEY?.substring(0, 10) + '...');
  console.log('Updated NEXT_PUBLIC_HUGGINGFACE token:', updatedConfig.NEXT_PUBLIC_HUGGINGFACE_API_KEY?.substring(0, 10) + '...');
  
  if (initialConfig.NEXT_PUBLIC_HUGGINGFACE_API_KEY !== updatedConfig.NEXT_PUBLIC_HUGGINGFACE_API_KEY) {
    console.log('\n✅ Configuration reloaded successfully!');
  } else {
    console.log('\n📝 No changes detected in configuration');
  }
}

// Main execution
async function main() {
  console.log('=====================================');
  console.log('   AI Provider Integration Tests');
  console.log('=====================================\n');
  
  try {
    // Test Hugging Face models
    await testHuggingFaceModels();
    
    // Test all providers
    await testAllProviders();
    
    // Test dynamic reload
    await checkDynamicReload();
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Stop watching for changes
    dynamicConfig.stopWatching();
    process.exit(0);
  }
}

// Run tests
main();