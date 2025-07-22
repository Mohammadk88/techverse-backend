import axios from 'axios';

const API_BASE_URL = 'http://localhost:4040';

interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    username: string;
  };
}

interface User {
  id: number;
  email: string;
  username: string;
}

async function testFollowAPIs() {
  try {
    console.log('🧪 Testing Follow System APIs...\n');

    // Step 1: Get some users to test with
    console.log('📋 Step 1: Getting test users...');
    
    // Create unique usernames with timestamps
    const timestamp = Date.now();
    const testUsers = [
      { email: `test1_${timestamp}@test.com`, password: 'password123' },
      { email: `test2_${timestamp}@test.com`, password: 'password123' },
    ];

    let user1Token: string, user2Token: string;
    let user1: User, user2: User;

    try {
      // Try to login user1
      const user1Login = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        testUsers[0],
      );
      user1Token = user1Login.data.accessToken;
      user1 = user1Login.data.user;
      console.log(`✅ User 1 logged in: ${user1.username || user1.email}`);
    } catch {
      // Register user1 if login fails
      console.log('📝 Registering user 1...');
      const registerResponse = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/register`, {
        ...testUsers[0],
        first_name: 'Test',
        last_name: 'User1',
        username: `testuser1_${timestamp}`,
        countryId: 21, // United States
        cityId: 87, // New York
        languageId: 12, // English
      });
      user1Token = registerResponse.data.accessToken;
      user1 = registerResponse.data.user;
      console.log(
        `✅ User 1 registered and logged in: ${user1.username || user1.email}`,
      );
    }

    try {
      // Try to login user2
      const user2Login = await axios.post<LoginResponse>(
        `${API_BASE_URL}/auth/login`,
        testUsers[1],
      );
      user2Token = user2Login.data.accessToken;
      user2 = user2Login.data.user;
      console.log(`✅ User 2 logged in: ${user2.username || user2.email}`);
    } catch {
      // Register user2 if login fails
      console.log('📝 Registering user 2...');
      const registerResponse = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/register`, {
        ...testUsers[1],
        first_name: 'Test',
        last_name: 'User2',
        username: `testuser2_${timestamp}`,
        countryId: 21, // United States
        cityId: 88, // Los Angeles
        languageId: 12, // English
      });
      user2Token = registerResponse.data.accessToken;
      user2 = registerResponse.data.user;
      console.log(
        `✅ User 2 registered and logged in: ${user2.username || user2.email}`,
      );
    }

    console.log();

    // Step 2: Test follow functionality
    console.log('👥 Step 2: Testing follow functionality...');
    
    console.log(`Attempting: ${user1.username} follows ${user2.username}`);
    const followResponse = await axios.post(
      `${API_BASE_URL}/users/${user2.id}/follow`,
      {},
      {
        headers: { Authorization: `Bearer ${user1Token}` },
      }
    );
    console.log('✅ Follow successful:', followResponse.data.message);
    console.log();

    // Step 3: Test follow counts
    console.log('📊 Step 3: Testing follow counts...');
    
    const countsResponse = await axios.get(
      `${API_BASE_URL}/users/${user2.id}/follow-counts`,
      {
        headers: { Authorization: `Bearer ${user1Token}` },
      }
    );
    console.log(`${user2.username} follow counts:`, countsResponse.data);
    console.log();

    // Step 4: Test follow status
    console.log('🔍 Step 4: Testing follow status...');
    
    const statusResponse = await axios.get(
      `${API_BASE_URL}/users/${user2.id}/follow-status`,
      {
        headers: { Authorization: `Bearer ${user1Token}` },
      }
    );
    console.log(`Follow status between ${user1.username} and ${user2.username}:`, statusResponse.data);
    console.log();

    // Step 5: Test get followers
    console.log('👥 Step 5: Testing get followers...');
    
    const followersResponse = await axios.get(
      `${API_BASE_URL}/users/${user2.id}/followers?page=1&limit=10`,
      {
        headers: { Authorization: `Bearer ${user1Token}` },
      }
    );
    console.log(`${user2.username} followers:`, followersResponse.data);
    console.log();

    // Step 6: Test get following
    console.log('👀 Step 6: Testing get following...');
    
    const followingResponse = await axios.get(
      `${API_BASE_URL}/users/${user1.id}/following?page=1&limit=10`,
      {
        headers: { Authorization: `Bearer ${user1Token}` },
      }
    );
    console.log(`${user1.username} users_follows_following_idTousers:`, followingResponse.data);
    console.log();

    // Step 7: Test duplicate follow (should fail)
    console.log('🚫 Step 7: Testing duplicate follow prevention...');
    
    try {
      await axios.post(
        `${API_BASE_URL}/users/${user2.id}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${user1Token}` },
        }
      );
      console.log('❌ ERROR: Duplicate follow was allowed!');
    } catch (error: any) {
      console.log('✅ Duplicate follow correctly prevented:', error.response?.data?.message);
    }
    console.log();

    // Step 8: Test self-follow (should fail)
    console.log('🚫 Step 8: Testing self-follow prevention...');
    
    try {
      await axios.post(
        `${API_BASE_URL}/users/${user1.id}/follow`,
        {},
        {
          headers: { Authorization: `Bearer ${user1Token}` },
        }
      );
      console.log('❌ ERROR: Self-follow was allowed!');
    } catch (error: any) {
      console.log('✅ Self-follow correctly prevented:', error.response?.data?.message);
    }
    console.log();

    // Step 9: Test user profile with follow counts
    console.log('👤 Step 9: Testing user profile with follow counts...');
    
    const profileResponse = await axios.get(
      `${API_BASE_URL}/users/${user2.id}`,
      {
        headers: { Authorization: `Bearer ${user1Token}` },
      }
    );
    console.log(`${user2.username} profile with follow counts:`, {
      id: profileResponse.data.id,
      username: profileResponse.data.username,
      followersCount: profileResponse.data.followersCount,
      followingCount: profileResponse.data.followingCount,
    });
    console.log();

    // Step 10: Test unfollow
    console.log('💔 Step 10: Testing unfollow functionality...');
    
    const unfollowResponse = await axios.delete(
      `${API_BASE_URL}/users/${user2.id}/unfollow`,
      {
        headers: { Authorization: `Bearer ${user1Token}` },
      }
    );
    console.log('✅ Unfollow successful:', unfollowResponse.data.message);
    console.log();

    // Step 11: Verify unfollow worked
    console.log('🔍 Step 11: Verifying unfollow...');
    
    const finalCountsResponse = await axios.get(
      `${API_BASE_URL}/users/${user2.id}/follow-counts`,
      {
        headers: { Authorization: `Bearer ${user1Token}` },
      }
    );
    console.log(`${user2.username} final follow counts:`, finalCountsResponse.data);
    console.log();

    console.log('🎉 All Follow System API tests completed successfully!');

  } catch (error: any) {
    console.error('❌ Error testing follow APIs:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFollowAPIs();
}

export { testFollowAPIs };
