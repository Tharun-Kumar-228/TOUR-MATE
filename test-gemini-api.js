// Test Gemini API directly
const GEMINI_API_KEY = 'AIzaSyCCVA890XoG5pj_BXEDb8h0GR1RbJNzAiA';

async function testGeminiAPI() {
  try {
    console.log('🧪 Testing Gemini API directly...\n');

    const prompt = `Return ONLY this JSON:
{"test": "success", "message": "API is working"}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
            maxOutputTokens: 100,
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
        }),
      }
    );

    const text = await response.text();
    console.log('📤 Raw Response:\n');
    console.log(text);
    console.log('\n');

    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.log('⚠️ Response is not JSON');
      data = null;
    }

    if (response.ok && data && data.candidates && data.candidates[0]) {
      console.log('\n✅ GEMINI API IS WORKING!');
      const content = data.candidates[0].content || data.candidates[0];
      console.log(`Output: ${JSON.stringify(content, null, 2)}`);
    } else {
      console.log('\n❌ GEMINI API ERROR');
      console.log(`Status: ${response.status}`);
      if (data && data.error) {
        console.log(`Error: ${data.error.message}`);
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGeminiAPI();
