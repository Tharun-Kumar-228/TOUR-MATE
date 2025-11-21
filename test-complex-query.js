// Test complex query filtering
const testData = {
  message: 'hotels to eat nearby',
  places: [
    {
      _id: '507f1f77bcf86cd799439011',
      name: 'The Italian Kitchen',
      category: 'restaurant',
      averageRating: 4.7,
      ratingsQuantity: 45,
      address: '123 Main Street',
      priceRange: '$$',
      features: ['Italian', 'Fine Dining', 'Ambiance', 'wifi', 'parking']
    },
    {
      _id: '507f1f77bcf86cd799439012',
      name: 'Grand Hotel',
      category: 'hotel',
      averageRating: 4.5,
      ratingsQuantity: 120,
      address: '456 Hotel Avenue',
      priceRange: '$$$',
      features: ['Restaurant', 'Bar', 'Room Service', 'wifi', 'parking', 'gym']
    },
    {
      _id: '507f1f77bcf86cd799439013',
      name: 'Budget Inn',
      category: 'hotel',
      averageRating: 3.8,
      ratingsQuantity: 67,
      address: '789 Budget Street',
      priceRange: '$',
      features: ['Basic Rooms', 'wifi', 'parking']
    },
    {
      _id: '507f1f77bcf86cd799439014',
      name: 'Luxury Resort',
      category: 'hotel',
      averageRating: 4.9,
      ratingsQuantity: 200,
      address: '321 Resort Lane',
      priceRange: '$$$$',
      features: ['Restaurant', 'Bar', 'Spa', 'Pool', 'Room Service', 'wifi', 'parking']
    },
    {
      _id: '507f1f77bcf86cd799439015',
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

async function testComplexQuery() {
  try {
    console.log('🧪 Testing Complex Query: "hotels to eat nearby"\n');
    console.log('📤 Sending request...\n');

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
      console.log(`\n📊 Results:`);
      console.log(`   - Matched: ${data.matchedCount}/${data.totalCount} places`);
      console.log(`   - Reasoning: ${data.analysis}`);
      console.log(`\n🏨 Matched Hotels:`);
      data.filteredPlaces.forEach(p => {
        if (p.category === 'hotel') {
          console.log(`   - ${p.name} (${p.category})`);
          console.log(`     Features: ${p.features.join(', ')}`);
        }
      });
    } else {
      console.log('\n⚠️ LLM FILTERING NOT WORKING - Using fallback');
      console.log(`   - Method: ${data.method}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testComplexQuery();
