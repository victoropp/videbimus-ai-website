// Comprehensive test script for consultation workflow
const API_BASE = 'http://localhost:3002';

// Test credentials
const consultant = {
  email: 'consultant@test.com',
  password: 'consultant123'
};

const client = {
  email: 'client@test.com',
  password: 'client123'
};

let authToken = null;
let roomId = 'test-room-001';

async function signIn(credentials) {
  console.log(`\n📝 Signing in as ${credentials.email}...`);
  
  // Note: NextAuth doesn't provide direct API signin, need to use session
  // For testing, we'll use the API directly with the session
  console.log('✅ Sign-in would redirect to /auth/signin page');
  console.log('   Use credentials:', credentials);
  return true;
}

async function testConsultationRooms() {
  console.log('\n🏠 Testing Consultation Rooms API...');
  
  try {
    // Test getting rooms (will require authentication)
    const response = await fetch(`${API_BASE}/api/consultation/rooms`);
    console.log(`GET /api/consultation/rooms - Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Authentication required (expected behavior)');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testMessaging() {
  console.log('\n💬 Testing Messaging API...');
  
  try {
    // Test sending a message
    const messageData = {
      content: 'Hello, this is a test message!',
      messageType: 'text'
    };
    
    const response = await fetch(`${API_BASE}/api/consultation/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messageData)
    });
    
    console.log(`POST /messages - Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Authentication required for messaging');
    }
    
    // Test getting messages
    const getResponse = await fetch(`${API_BASE}/api/consultation/rooms/${roomId}/messages`);
    console.log(`GET /messages - Status: ${getResponse.status}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testDocuments() {
  console.log('\n📄 Testing Documents API...');
  
  try {
    // Test creating a document
    const documentData = {
      title: 'Test Document',
      description: 'A sample document for testing',
      content: '# Test Document\n\nThis is a test document content.',
      documentType: 'document'
    };
    
    const response = await fetch(`${API_BASE}/api/consultation/rooms/${roomId}/documents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(documentData)
    });
    
    console.log(`POST /documents - Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Authentication required for documents');
    }
    
    // Test getting documents
    const getResponse = await fetch(`${API_BASE}/api/consultation/rooms/${roomId}/documents`);
    console.log(`GET /documents - Status: ${getResponse.status}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testWhiteboard() {
  console.log('\n🎨 Testing Whiteboard API...');
  
  try {
    // Test saving whiteboard data
    const whiteboardData = {
      canvasData: {
        version: '5.3.0',
        objects: [
          {
            type: 'rect',
            left: 100,
            top: 100,
            width: 200,
            height: 100,
            fill: 'blue'
          }
        ]
      },
      title: 'Test Whiteboard'
    };
    
    const response = await fetch(`${API_BASE}/api/consultation/rooms/${roomId}/whiteboard`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(whiteboardData)
    });
    
    console.log(`PUT /whiteboard - Status: ${response.status}`);
    
    if (response.status === 401) {
      console.log('✅ Authentication required for whiteboard');
    }
    
    // Test getting whiteboard
    const getResponse = await fetch(`${API_BASE}/api/consultation/rooms/${roomId}/whiteboard`);
    console.log(`GET /whiteboard - Status: ${getResponse.status}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function testPageAccess() {
  console.log('\n🌐 Testing Page Access...');
  
  const pages = [
    { url: '/', name: 'Home' },
    { url: '/collaboration', name: 'Collaboration' },
    { url: `/collaboration/rooms/${roomId}`, name: 'Consultation Room' },
    { url: '/auth/signin', name: 'Sign In' }
  ];
  
  for (const page of pages) {
    try {
      const response = await fetch(`${API_BASE}${page.url}`);
      console.log(`${page.name} (${page.url}) - Status: ${response.status}`);
      
      if (response.status === 200) {
        console.log(`✅ ${page.name} page accessible`);
      } else if (response.status === 302 || response.status === 307) {
        console.log(`↪️ ${page.name} redirects (authentication required)`);
      }
    } catch (error) {
      console.error(`❌ Error accessing ${page.name}:`, error.message);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting Consultation Workflow Tests');
  console.log('=====================================');
  
  // Display test credentials
  console.log('\n📋 Test Credentials Created:');
  console.log('----------------------------');
  console.log('Consultant:', consultant);
  console.log('Client:', client);
  console.log('Room ID:', roomId);
  
  // Run all tests
  await testPageAccess();
  await testConsultationRooms();
  await testMessaging();
  await testDocuments();
  await testWhiteboard();
  
  console.log('\n=====================================');
  console.log('✅ All API Tests Completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Open browser: http://localhost:3002/auth/signin');
  console.log('2. Sign in with test credentials');
  console.log('3. Navigate to: http://localhost:3002/collaboration');
  console.log('4. Click on "Demo Consultation Room"');
  console.log('5. Test video, whiteboard, chat, and document features');
}

// Run the tests
runAllTests().catch(console.error);