import express from 'express';
import axios from 'axios';

const router = express.Router();

// Keyword-based intent detection (fallback)
const detectIntentByKeywords = (message) => {
  const query = message.toLowerCase();
  
  if (query.includes('hotspot') || query.includes('hot spot') || query.includes('tourist spot') || query.includes('popular')) {
    return 'hotspot';
  }
  if (query.includes('fun place') || query.includes('fun') || query.includes('game') || query.includes('entertainment') || query.includes('adventure')) {
    return 'fun';
  }
  if (query.includes('most review') || query.includes('most popular') || query.includes('trending') || query.includes('talked about')) {
    return 'reviews';
  }
  if (query.includes('budget') || query.includes('cheap') || query.includes('affordable')) {
    return 'budget';
  }
  if (query.includes('luxury') || query.includes('premium') || query.includes('high-end')) {
    return 'luxury';
  }
  
  return 'general';
};

// LLM Intent Detection Endpoint with fallback
router.post('/detect-intent', async (req, res) => {
  try {
    const { message } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!message) {
      return res.status(400).json({
        status: 'error',
        message: 'Message is required',
      });
    }

    // If no API key, use keyword-based detection
    if (!GEMINI_API_KEY) {
      console.log('ℹ️ No GEMINI_API_KEY, using keyword-based detection');
      const intent = detectIntentByKeywords(message);
      return res.status(200).json({
        status: 'success',
        intent,
        message: 'Intent detected using keyword analysis',
        method: 'keyword',
      });
    }

    // Try LLM detection
    console.log('🤖 Attempting LLM-based intent detection...');

    try {
      const prompt = `Analyze this travel query and determine the user's intent. Respond with ONLY one of these exact words: "hotspot", "fun", "reviews", "budget", "luxury", "category", or "general".

Query: "${message}"

Intent:`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/text-bison-001:generateText?key=${GEMINI_API_KEY}`,
        {
          prompt: {
            text: prompt,
          },
          temperature: 0.3,
          candidateCount: 1,
          topK: 1,
          topP: 0.8,
          maxOutputTokens: 10,
          safetySettings: [
            {
              category: 'HARM_CATEGORY_UNSPECIFIED',
              threshold: 'BLOCK_NONE',
            },
          ],
        },
        {
          timeout: 5000, // 5 second timeout
        }
      );

      const intent = response.data.candidates?.[0]?.output?.trim().toLowerCase();

      if (intent) {
        console.log(`✅ LLM Intent detected: ${intent}`);
        return res.status(200).json({
          status: 'success',
          intent,
          message: 'Intent detected using LLM',
          method: 'llm',
        });
      }
    } catch (llmError) {
      console.warn('⚠️ LLM detection failed, falling back to keywords:', llmError.message);
    }

    // Fallback to keyword detection
    const intent = detectIntentByKeywords(message);
    console.log(`📌 Using keyword-based detection: ${intent}`);
    
    res.status(200).json({
      status: 'success',
      intent,
      message: 'Intent detected using keyword analysis',
      method: 'keyword',
    });

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    
    // Last resort: use keyword detection
    try {
      const { message } = req.body;
      const intent = detectIntentByKeywords(message);
      return res.status(200).json({
        status: 'success',
        intent,
        message: 'Intent detected using keyword analysis (fallback)',
        method: 'keyword',
      });
    } catch (fallbackError) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to detect intent',
        error: error.message,
      });
    }
  }
});

// LLM-based place analysis and recommendation endpoint
router.post('/analyze-places', async (req, res) => {
  try {
    const { message, places } = req.body;
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    if (!message || !places || places.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Message and places array are required',
      });
    }

    // If no API key, return places as-is
    if (!GEMINI_API_KEY) {
      console.log('ℹ️ No GEMINI_API_KEY, returning places without LLM filtering');
      return res.status(200).json({
        status: 'success',
        filteredPlaces: places,
        analysis: 'Places returned without LLM filtering',
        method: 'direct',
      });
    }

    console.log(`🤖 Using LLM to filter and analyze places... (${places.length} places)`);
    console.log(`📝 User Query: "${message}"`);

    try {
      // Format ALL places data for LLM with detailed information
      const placesData = places.map((p, i) => {
        let placeInfo = `${i + 1}. ${p.name}\n`;
        placeInfo += `   ID: ${p._id}\n`;
        placeInfo += `   Category: ${p.category}\n`;
        placeInfo += `   Rating: ${p.averageRating}/5 (${p.ratingsQuantity} reviews)\n`;
        if (p.address) placeInfo += `   Address: ${p.address}\n`;
        if (p.priceRange) placeInfo += `   Price: ${p.priceRange}\n`;
        if (p.features && p.features.length > 0) {
          placeInfo += `   Features: ${p.features.join(', ')}\n`;
        }
        return placeInfo;
      }).join('\n');

      console.log(`📋 Formatted ${places.length} places for LLM`);

      const prompt = `You are a travel recommendation expert. Filter places based on user query.

User Query: "${message}"

Available Places:
${placesData}

Instructions:
- Analyze the user's query carefully
- Match places where:
  * Category matches (e.g., "hotel" matches hotel category)
  * Features match (e.g., "wifi", "parking", "restaurant", "food")
  * Combined queries: "hotels to eat" = hotels WITH restaurant/food features
- Return ONLY this JSON format (no other text):
{"matchedPlaceIds": ["id1", "id2"], "reasoning": "explanation"}

Examples:
- "wifi" → places with wifi feature
- "hotel" → places with hotel category
- "hotels to eat" → hotels with restaurant/food features
- "parking" → places with parking feature
- "family friendly" → places with family features`;

      console.log('🔄 Sending request to Gemini API (gemini-2.5-flash)...');
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 1,
            topP: 0.8,
            maxOutputTokens: 500,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_NONE',
            },
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_NONE',
            },
          ],
        },
        {
          timeout: 10000,
        }
      );

      console.log('✅ Gemini API response received');
      const llmResponse = response.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

      if (llmResponse) {
        console.log(`📤 LLM Raw Response: ${llmResponse.substring(0, 300)}...`);
        try {
          // Try to extract JSON from response (LLM might add extra text)
          let jsonStr = llmResponse;
          
          // Try to find JSON object in response
          const jsonMatch = llmResponse.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonStr = jsonMatch[0];
            console.log(`📋 Extracted JSON: ${jsonStr.substring(0, 150)}...`);
          }
          
          // Parse LLM response
          const llmData = JSON.parse(jsonStr);
          const matchedPlaceIds = llmData.matchedPlaceIds || [];
          const reasoning = llmData.reasoning || '';

          console.log(`🎯 Matched Place IDs: ${matchedPlaceIds.join(', ')}`);

          // Filter places based on LLM decision
          const filteredPlaces = places.filter(p => 
            matchedPlaceIds.includes(p._id?.toString())
          );

          console.log(`✅ LLM filtered ${filteredPlaces.length} places from ${places.length}`);
          console.log(`📝 Reasoning: ${reasoning}`);

          return res.status(200).json({
            status: 'success',
            filteredPlaces: filteredPlaces.length > 0 ? filteredPlaces : places,
            analysis: reasoning,
            matchedCount: filteredPlaces.length,
            totalCount: places.length,
            method: 'llm',
          });
        } catch (parseError) {
          console.warn('⚠️ Failed to parse LLM response:', parseError.message);
          console.warn('📤 Raw response was:', llmResponse);
          return res.status(200).json({
            status: 'success',
            filteredPlaces: places,
            analysis: 'LLM response parsing failed, showing all places',
            method: 'direct',
          });
        }
      } else {
        console.warn('⚠️ No LLM response received');
      }
    } catch (llmError) {
      console.error('❌ LLM API Error:');
      console.error('   Status:', llmError.response?.status);
      console.error('   Data:', JSON.stringify(llmError.response?.data, null, 2));
      console.error('   Message:', llmError.message);
      console.error('   Stack:', llmError.stack);
      console.warn('⚠️ LLM filtering failed, returning all places');
    }

    // Fallback: return all places
    res.status(200).json({
      status: 'success',
      filteredPlaces: places,
      analysis: 'Places returned without LLM filtering',
      method: 'direct',
    });

  } catch (error) {
    console.error('❌ Error filtering places:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Failed to filter places',
      error: error.message,
    });
  }
});

export default router;
