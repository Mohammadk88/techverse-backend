const axios = require('axios');

const BASE_URL = 'http://localhost:4040';

async function testQueryParameters() {
  console.log('🧪 Testing API Query Parameters Validation');
  console.log('='.repeat(60));

  // Test Articles endpoints
  console.log('\n📚 Testing Articles Endpoints:');
  
  // Test 1: Articles with featured=true&limit=6
  try {
    console.log('\n1. Testing GET /articles?featured=true&limit=6');
    const response = await axios.get(`${BASE_URL}/articles?featured=true&limit=6`);
    console.log('✅ Success! Status:', response.status);
    console.log(`   Articles returned: ${response.data.data?.length || response.data.length || 'N/A'}`);
  } catch (error) {
    console.log('❌ Failed!');
    console.log(`   Status: ${error.response?.status || 'Unknown'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
  }

  // Test 2: Articles with thisWeek=true&limit=8
  try {
    console.log('\n2. Testing GET /articles?thisWeek=true&limit=8');
    const response = await axios.get(`${BASE_URL}/articles?thisWeek=true&limit=8`);
    console.log('✅ Success! Status:', response.status);
    console.log(`   Articles returned: ${response.data.data?.length || response.data.length || 'N/A'}`);
  } catch (error) {
    console.log('❌ Failed!');
    console.log(`   Status: ${error.response?.status || 'Unknown'}`);
    console.log(`   Error: ${error.response?.data?.message || error.message}`);
  }

  // Test Posts endpoints
  console.log('\n📝 Testing Posts Endpoints:');
  
  // Test 3: Posts with trending=true&limit=10
  try {
    console.log('\n3. Testing GET /posts?trending=true&limit=10');
    const response = await axios.get(`${BASE_URL}/posts?trending=true&limit=10`, {
      headers: {
        'Authorization': 'Bearer dummy-token-for-test'
      }
    });
    console.log('✅ Success! Status:', response.status);
    console.log(`   Posts returned: ${response.data.data?.length || response.data.length || 'N/A'}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('🔒 Authentication required (expected for posts endpoint)');
    } else if (error.response?.status === 400) {
      console.log('❌ Bad Request - Query parameter validation failed!');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    } else {
      console.log('❌ Failed!');
      console.log(`   Status: ${error.response?.status || 'Unknown'}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Test Cafes endpoints
  console.log('\n☕ Testing Cafes Endpoints:');
  
  // Test 4: Cafes with popular=true&limit=8
  try {
    console.log('\n4. Testing GET /cafes?popular=true&limit=8');
    const response = await axios.get(`${BASE_URL}/cafes?popular=true&limit=8`, {
      headers: {
        'Authorization': 'Bearer dummy-token-for-test'
      }
    });
    console.log('✅ Success! Status:', response.status);
    console.log(`   Cafes returned: ${response.data.data?.length || response.data.length || 'N/A'}`);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('🔒 Authentication required (expected for cafes endpoint)');
    } else if (error.response?.status === 400) {
      console.log('❌ Bad Request - Query parameter validation failed!');
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    } else {
      console.log('❌ Failed!');
      console.log(`   Status: ${error.response?.status || 'Unknown'}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Test invalid parameters (should fail)
  console.log('\n🚫 Testing Invalid Parameters (Should Fail):');
  
  // Test 5: Articles with unknown parameter
  try {
    console.log('\n5. Testing GET /articles?invalidParam=true (should fail)');
    const response = await axios.get(`${BASE_URL}/articles?invalidParam=true`);
    console.log('⚠️  Unexpected success! Should have failed with 400 Bad Request');
    console.log('   Status:', response.status);
  } catch (error) {
    if (error.response?.status === 400) {
      console.log('✅ Correctly rejected invalid parameter!');
      console.log(`   Status: ${error.response.status}`);
    } else {
      console.log('❌ Failed for unexpected reason');
      console.log(`   Status: ${error.response?.status || 'Unknown'}`);
      console.log(`   Error: ${error.response?.data?.message || error.message}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 Summary:');
  console.log('- Articles endpoints should accept: featured, thisWeek, limit');
  console.log('- Posts endpoints should accept: trending, limit (with auth)');
  console.log('- Cafes endpoints should accept: popular, limit (with auth)');
  console.log('- Invalid parameters should be rejected with 400 Bad Request');
  console.log('\n✨ Query parameter validation testing complete!');
}

async function testWithAuth() {
  console.log('\n🔐 Testing with Authentication...');
  console.log('To test authenticated endpoints, you would need to:');
  console.log('1. First login: POST /auth/login with valid credentials');
  console.log('2. Get JWT token from response');
  console.log('3. Use token: headers: { Authorization: `Bearer ${token}` }');
  console.log('4. Then test /posts and /cafes endpoints');
}

if (require.main === module) {
  testQueryParameters()
    .then(() => testWithAuth())
    .catch(console.error);
}
