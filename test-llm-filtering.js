// Test script for LLM filtering endpoint

const testData = {
  message: 'wifi',
  places: [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'The Italian Kitchen',
      category: 'restaurant',
      averageRating: 4.7,
      ratingsQuantity: 45,
      address: '123 Main Street',
      priceRange: '$$',
      features: ['Italian', 'Fine Dining', 'Ambiance', 'wifi', 'parking', 'outdoor seating']
    },
    {
      _id: '507f1f77bcf86cd799439012',
      name: 'Spice House',
      category: 'restaurant',
      averageRating: 4.4,
      ratingsQuantity: 38,
      address: '456 Oak Avenue',
      priceRange: '$$',
      features: ['Indian', 'Authentic', 'Family-Friendly', 'wifi', 'vegetarian options']
    },
    {
      _id: '507f1f77bcf86cd799439013',
      name: 'Street Food Market',
      category: 'restaurant',
      averageRating: 4.1,
      ratingsQuantity: 52,
      address: '789 Food Street',
      priceRange: '$',
      features: ['Street Food', 'Casual', 'Budget-Friendly', 'outdoor seating']
    }
  ]
};

async function testLLMFiltering() {
  try {
    console.log('🧪 Testing LLM Filtering Endpoint...\n');
    console.log('📤 Sending request with:');
    console.log(`   - Query: "${testData.message}"`);
    console.log(`   - Places: ${testData.places.length}`);
    console.log(`   - API URL: http://localhost:5000/api/llm/analyze-places\n`);

    const response = await fetch(
      'http://localhost:5000/api/llm/analyze-places',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      }
    );

    const data = await response.json();

    console.log('✅ Response received:\n');
    console.log(JSON.stringify(data, null, 2));

    if (data.method === 'llm') {
      console.log('\n✅ LLM FILTERING WORKING!');
      console.log(`   - Matched: ${data.matchedCount}/${data.totalCount} places`);
      console.log(`   - Reasoning: ${data.analysis}`);
    } else {
      console.log('\n⚠️ LLM FILTERING NOT WORKING - Using fallback');
      console.log(`   - Method: ${data.method}`);
      console.log(`   - Analysis: ${data.analysis}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testLLMFiltering();
