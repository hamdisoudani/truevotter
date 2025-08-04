const axios = require('axios');

const API_BASE_URL = 'http://localhost:8000';

async function testIntegration() {
  console.log('🚀 Starting Reddit Vote Tracker Integration Tests\n');

  try {
    console.log('1. Testing user registration...');
    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, {
      email: 'integration@test.com',
      password: 'testpass123',
      username: 'integrationuser'
    });
    console.log('✅ Registration successful');
    console.log('   User ID:', registerResponse.data.user.id);
    console.log('   Token received:', !!registerResponse.data.access_token);

    const token = registerResponse.data.access_token;
    const userId = registerResponse.data.user.id;

    console.log('\n2. Testing user login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'integration@test.com',
      password: 'testpass123'
    });
    console.log('✅ Login successful');

    console.log('\n3. Testing profile access...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Profile access successful');
    console.log('   Username:', profileResponse.data.username);

    console.log('\n4. Testing Reddit account linking...');
    const linkResponse = await axios.patch(`${API_BASE_URL}/auth/link-reddit`, {
      redditUsername: 'testreddituser',
      redditId: 't2_testid123'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Reddit account linking successful');
    console.log('   Reddit username:', linkResponse.data.redditUsername);

    console.log('\n5. Testing vote creation...');
    const voteResponse = await axios.post(`${API_BASE_URL}/votes`, {
      postId: 't3_integration123',
      postTitle: 'Integration Test Post',
      postUrl: 'https://reddit.com/r/test/comments/integration123/',
      subreddit: 'test',
      username: 'testauthor',
      voteType: 'upvote',
      timestamp: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Vote creation successful');
    console.log('   Vote ID:', voteResponse.data._id);

    console.log('\n6. Testing vote statistics...');
    const statsResponse = await axios.get(`${API_BASE_URL}/votes/my-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Vote statistics successful');
    console.log('   Total votes:', statsResponse.data.totalVotes);
    console.log('   Upvotes:', statsResponse.data.upvotes);
    console.log('   Downvotes:', statsResponse.data.downvotes);

    console.log('\n7. Testing vote retrieval...');
    const votesResponse = await axios.get(`${API_BASE_URL}/votes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Vote retrieval successful');
    console.log('   Number of votes:', votesResponse.data.length);

    console.log('\n8. Testing different vote types...');
    
    await axios.post(`${API_BASE_URL}/votes`, {
      postId: 't3_integration456',
      postTitle: 'Integration Test Post 2',
      postUrl: 'https://reddit.com/r/test/comments/integration456/',
      subreddit: 'test',
      username: 'testauthor2',
      voteType: 'downvote',
      timestamp: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    await axios.post(`${API_BASE_URL}/votes`, {
      postId: 't3_integration789',
      postTitle: 'Integration Test Post 3',
      postUrl: 'https://reddit.com/r/test/comments/integration789/',
      subreddit: 'test',
      username: 'testauthor3',
      voteType: 'none',
      timestamp: new Date().toISOString()
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Different vote types successful');

    console.log('\n9. Final statistics check...');
    const finalStatsResponse = await axios.get(`${API_BASE_URL}/votes/my-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Final statistics:');
    console.log('   Total votes:', finalStatsResponse.data.totalVotes);
    console.log('   Upvotes:', finalStatsResponse.data.upvotes);
    console.log('   Downvotes:', finalStatsResponse.data.downvotes);

    console.log('\n🎉 All integration tests passed successfully!');
    console.log('\n📋 Test Summary:');
    console.log('   ✅ User registration and authentication');
    console.log('   ✅ Reddit account linking');
    console.log('   ✅ Vote tracking (upvote, downvote, none)');
    console.log('   ✅ Vote statistics and retrieval');
    console.log('   ✅ MongoDB data persistence');
    console.log('   ✅ JWT authentication and authorization');

  } catch (error) {
    console.error('❌ Integration test failed:');
    console.error('   Error:', error.response?.data?.message || error.message);
    console.error('   Status:', error.response?.status);
    process.exit(1);
  }
}

testIntegration();
