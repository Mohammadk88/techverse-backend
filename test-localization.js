#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

// Test data for different locales
const testScenarios = [
  {
    name: 'English US Content',
    languageCode: 'en',
    countryCode: 'US',
    endpoint: '/articles'
  },
  {
    name: 'Arabic Saudi Content',
    languageCode: 'ar',
    countryCode: 'SA',
    endpoint: '/articles'
  },
  {
    name: 'Turkish Content',
    languageCode: 'tr',
    countryCode: 'TR',
    endpoint: '/articles'
  },
  {
    name: 'English Only (any country)',
    languageCode: 'en',
    endpoint: '/articles'
  },
  {
    name: 'Posts with Localization',
    languageCode: 'en',
    countryCode: 'US',
    endpoint: '/posts'
  },
  {
    name: 'Cafes with Localization',
    languageCode: 'ar',
    countryCode: 'SA',
    endpoint: '/cafes'
  },
  {
    name: 'Forums with Localization',
    languageCode: 'tr',
    endpoint: '/forum'
  }
];

async function testLocalization() {
  console.log('🌍 Testing Localized Content Filtering System');
  console.log('=' .repeat(60));
  
  for (const scenario of testScenarios) {
    console.log(`\n📍 Testing: ${scenario.name}`);
    console.log('-'.repeat(40));
    
    try {
      const params = new URLSearchParams();
      if (scenario.languageCode) params.append('languageCode', scenario.languageCode);
      if (scenario.countryCode) params.append('countryCode', scenario.countryCode);
      params.append('limit', '5'); // Limit results for readability
      
      const url = `${BASE_URL}${scenario.endpoint}?${params.toString()}`;
      console.log(`🔗 URL: ${url}`);
      
      const response = await axios.get(url);
      
      if (response.status === 200) {
        const data = response.data;
        console.log(`✅ Success: ${response.status}`);
        
        if (data.data && Array.isArray(data.data)) {
          console.log(`📊 Results: ${data.data.length} items found`);
          
          // Show localization info for first few items
          data.data.slice(0, 3).forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.title || item.name || item.content?.substring(0, 50)}...`);
            if (item.languageCode || item.countryCode) {
              console.log(`      🌐 Locale: ${item.languageCode || 'any'}/${item.countryCode || 'any'}`);
            }
            if (item.language || item.country) {
              console.log(`      🏷️  Language: ${item.language?.name || 'N/A'}, Country: ${item.country?.name || 'N/A'}`);
            }
          });
          
          if (data.meta) {
            console.log(`📈 Total available: ${data.meta.total}`);
          }
        } else {
          console.log(`📊 Results: ${JSON.stringify(data).substring(0, 100)}...`);
        }
      } else {
        console.log(`⚠️  Unexpected status: ${response.status}`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Error ${error.response.status}: ${error.response.statusText}`);
        if (error.response.data?.message) {
          console.log(`   Message: ${error.response.data.message}`);
        }
      } else {
        console.log(`❌ Network Error: ${error.message}`);
      }
    }
  }
}

async function testContentQueryService() {
  console.log('\n\n🧪 Testing ContentQueryService Logic');
  console.log('=' .repeat(60));
  
  // Test the prioritization logic with sample data
  const sampleArticles = [
    { id: 1, title: 'English Global', languageCode: 'en', countryCode: null },
    { id: 2, title: 'English US Specific', languageCode: 'en', countryCode: 'US' },
    { id: 3, title: 'Arabic Saudi', languageCode: 'ar', countryCode: 'SA' },
    { id: 4, title: 'No Locale', languageCode: null, countryCode: null },
    { id: 5, title: 'Turkish General', languageCode: 'tr', countryCode: null },
  ];
  
  console.log('📝 Sample Data:');
  sampleArticles.forEach(article => {
    console.log(`   ${article.id}. ${article.title} (${article.languageCode || 'any'}/${article.countryCode || 'any'})`);
  });
  
  // Simulate prioritization logic
  const testQueries = [
    { languageCode: 'en', countryCode: 'US' },
    { languageCode: 'ar', countryCode: 'SA' },
    { languageCode: 'en' },
    { languageCode: 'fr', countryCode: 'FR' },
  ];
  
  testQueries.forEach(query => {
    console.log(`\n🔍 Query: ${query.languageCode || 'any'}/${query.countryCode || 'any'}`);
    
    // Simulate priority scoring
    const scored = sampleArticles.map(article => {
      let score = 0;
      
      // Exact match gets highest priority
      if (article.languageCode === query.languageCode && article.countryCode === query.countryCode) {
        score = 100;
      }
      // Language match with no specific country
      else if (article.languageCode === query.languageCode && !article.countryCode) {
        score = 80;
      }
      // Language match with any country
      else if (article.languageCode === query.languageCode) {
        score = 70;
      }
      // Default language fallback
      else if (article.languageCode === 'en') {
        score = 30;
      }
      // No locale specified
      else if (!article.languageCode && !article.countryCode) {
        score = 20;
      }
      // Other content
      else {
        score = 10;
      }
      
      return { ...article, score };
    });
    
    const sorted = scored.sort((a, b) => b.score - a.score);
    
    console.log('   📊 Priority Order:');
    sorted.forEach((article, index) => {
      console.log(`      ${index + 1}. ${article.title} (Score: ${article.score})`);
    });
  });
}

async function main() {
  console.log('🚀 Starting Localization System Tests\n');
  
  // Test the actual API endpoints
  await testLocalization();
  
  // Test the logic simulation
  await testContentQueryService();
  
  console.log('\n\n🎉 Testing Complete!');
  console.log('\nLocalization features to verify:');
  console.log('✓ Content filtered by language and country codes');
  console.log('✓ Prioritization: exact match > language match > fallback');
  console.log('✓ Default fallback to English content');
  console.log('✓ Works across all content types (articles, posts, cafes, forums)');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testLocalization, testContentQueryService };
