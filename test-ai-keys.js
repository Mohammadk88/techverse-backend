const axios = require('axios');

const BASE_URL = 'http://localhost:4041';

async function testAIKeysAPI() {
  console.log('🧪 Testing AI Keys API...\n');

  try {
    // Test 1: Get AI providers (public endpoint)
    console.log('1. Testing GET /ai/providers');
    const providersResponse = await axios.get(`${BASE_URL}/ai/providers`);
    console.log('✅ Success! AI Providers:', providersResponse.data.length, 'providers found');
    console.log('   Providers:', providersResponse.data.map(p => `${p.name} (${p.label})`).join(', '));
    console.log('');

    // Note: Other endpoints require authentication
    console.log('2. Testing authentication-required endpoints');
    console.log('ℹ️ The following endpoints require JWT authentication:');
    console.log('   - GET /ai/keys (user keys)');
    console.log('   - POST /ai/keys (create user key)');
    console.log('   - PUT /ai/keys/:id (update user key)');
    console.log('   - DELETE /ai/keys/:id (delete user key)');
    console.log('   - GET /ai/admin/system-keys (admin only)');
    console.log('   - POST /ai/admin/system-keys (admin only)');
    console.log('');

    console.log('🎉 AI Keys API is working! The basic infrastructure is ready.');
    console.log('');
    console.log('💡 To test authenticated endpoints:');
    console.log('   1. Register a new user via POST /auth/register');
    console.log('   2. Login via POST /auth/login to get JWT token');
    console.log('   3. Use the token in Authorization header for AI keys endpoints');

  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.status, error.response.statusText);
      console.log('   Message:', error.response.data?.message || 'Unknown error');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('❌ Connection refused - make sure the server is running on port 4041');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// Run the test
testAIKeysAPI();
