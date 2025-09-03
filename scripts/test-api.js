// Simple test script to verify our consultation API works
const API_BASE = 'http://localhost:3002';

async function testAPI() {
  try {
    console.log('Testing consultation rooms API...\n');

    // Test 1: Get consultation rooms (should work even with no authentication for testing)
    console.log('1. Testing GET /api/consultation/rooms');
    const response = await fetch(`${API_BASE}/api/consultation/rooms`);
    console.log('Status:', response.status);
    
    if (response.status === 401) {
      console.log('✓ API correctly requires authentication\n');
    } else {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
      console.log();
    }

    // Test 2: Check if we can reach the app
    console.log('2. Testing home page');
    const homeResponse = await fetch(`${API_BASE}/`);
    console.log('Home page status:', homeResponse.status);
    
    if (homeResponse.ok) {
      console.log('✓ App is running correctly\n');
    }

    // Test 3: Check collaboration page (will redirect to signin)
    console.log('3. Testing collaboration page');
    const collabResponse = await fetch(`${API_BASE}/collaboration`);
    console.log('Collaboration page status:', collabResponse.status);
    
    if (collabResponse.status === 307 || collabResponse.status === 302) {
      console.log('✓ Collaboration page correctly redirects to signin\n');
    }
    
    console.log('API tests completed! ✅');

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testAPI();