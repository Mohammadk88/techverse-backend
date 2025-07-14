const axios = require('axios');

const BASE_URL = 'http://localhost:4040';

async function testPublicEndpoints() {
  console.log('🧪 Testing Public Endpoints (No Auth Required)');
  console.log('='.repeat(50));

  // Test Languages endpoint
  try {
    console.log('\n📚 Testing GET /languages...');
    const response = await axios.get(`${BASE_URL}/languages`);
    console.log('✅ Languages endpoint accessible');
    console.log(`   Status: ${response.status}`);
    console.log(`   Languages found: ${response.data.length}`);
    if (response.data.length > 0) {
      console.log(`   Example: ${response.data[0].name} (${response.data[0].code})`);
    }
  } catch (error) {
    console.log('❌ Languages endpoint failed');
    console.log(`   Error: ${error.response?.status} - ${error.response?.statusText}`);
  }

  // Test Countries endpoint
  try {
    console.log('\n🌍 Testing GET /countries...');
    const response = await axios.get(`${BASE_URL}/countries`);
    console.log('✅ Countries endpoint accessible');
    console.log(`   Status: ${response.status}`);
    console.log(`   Countries found: ${response.data.length}`);
    if (response.data.length > 0) {
      console.log(`   Example: ${response.data[0].name} (${response.data[0].code})`);
    }
  } catch (error) {
    console.log('❌ Countries endpoint failed');
    console.log(`   Error: ${error.response?.status} - ${error.response?.statusText}`);
  }

  // Test Cities endpoint (using first country if available)
  try {
    console.log('\n🏙️  Testing GET /countries/1/cities...');
    const response = await axios.get(`${BASE_URL}/countries/1/cities`);
    console.log('✅ Cities endpoint accessible');
    console.log(`   Status: ${response.status}`);
    console.log(`   Cities found: ${response.data.length}`);
    if (response.data.length > 0) {
      console.log(`   Example: ${response.data[0].name}`);
    }
  } catch (error) {
    console.log('❌ Cities endpoint failed');
    console.log(`   Error: ${error.response?.status} - ${error.response?.statusText}`);
  }
}

async function testProtectedEndpoints() {
  console.log('\n\n🔒 Testing Protected Endpoints (Auth Required)');
  console.log('='.repeat(50));

  // Test AI Providers endpoint (should require auth)
  try {
    console.log('\n🤖 Testing GET /ai/providers (should fail without auth)...');
    const response = await axios.get(`${BASE_URL}/ai/providers`);
    console.log('⚠️  AI Providers endpoint unexpectedly accessible without auth');
    console.log(`   Status: ${response.status}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ AI Providers endpoint correctly protected');
      console.log('   Status: 401 Unauthorized (as expected)');
    } else {
      console.log('❌ AI Providers endpoint failed with unexpected error');
      console.log(`   Error: ${error.response?.status} - ${error.response?.statusText}`);
    }
  }

  // Test AI Keys endpoint (should require auth)
  try {
    console.log('\n🔑 Testing GET /ai/keys (should fail without auth)...');
    const response = await axios.get(`${BASE_URL}/ai/keys`);
    console.log('⚠️  AI Keys endpoint unexpectedly accessible without auth');
    console.log(`   Status: ${response.status}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ AI Keys endpoint correctly protected');
      console.log('   Status: 401 Unauthorized (as expected)');
    } else {
      console.log('❌ AI Keys endpoint failed with unexpected error');
      console.log(`   Error: ${error.response?.status} - ${error.response?.statusText}`);
    }
  }
}

async function runTests() {
  console.log('🚀 TechVerse API Endpoint Testing');
  console.log('Testing both public and protected endpoints...\n');
  
  await testPublicEndpoints();
  await testProtectedEndpoints();
  
  console.log('\n✨ Testing complete!');
  console.log('\nNote: To test protected endpoints with authentication,');
  console.log('you would need to:');
  console.log('1. Login via POST /auth/login');
  console.log('2. Include the JWT token in Authorization header');
  console.log('3. Use: headers: { Authorization: `Bearer ${token}` }');
}

if (require.main === module) {
  runTests().catch(console.error);
}
