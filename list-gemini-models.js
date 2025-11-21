// List available Gemini models
const GEMINI_API_KEY = 'AIzaSyCCVA890XoG5pj_BXEDb8h0GR1RbJNzAiA';

async function listModels() {
  try {
    console.log('🔍 Listing available Gemini models...\n');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`
    );

    const text = await response.text();
    console.log('📤 Response:\n');
    console.log(text);

    try {
      const data = JSON.parse(text);
      if (data.models) {
        console.log('\n✅ Available Models:');
        data.models.forEach(model => {
          console.log(`   - ${model.name}`);
          if (model.supportedGenerationMethods) {
            console.log(`     Methods: ${model.supportedGenerationMethods.join(', ')}`);
          }
        });
      }
    } catch (e) {
      console.log('Could not parse response');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
