const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY not set');
  process.exit(1);
}

const client = new GoogleGenerativeAI(apiKey);

(async () => {
  try {
    // Try different model lists endpoints
    const models = await client.listModels?.();
    if (models) {
      console.log('Available models:');
      for await (const model of models) {
        console.log(`  - ${model.name}`);
        console.log(`    ${model.description}`);
        console.log(`    Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'unknown'}`);
      }
    } else {
      console.log('listModels not available, trying direct model');
      // Try common models
      const testModels = [
        'gemini-pro',
        'gemini-2.0-flash',
        'gemini-1.5-pro',
        'gemini-1.5-flash'
      ];

      for (const modelName of testModels) {
        try {
          const model = client.getGenerativeModel({ model: modelName });
          const result = await model.generateContent('test');
          console.log(`✓ ${modelName} works`);
        } catch (err) {
          const msg = err?.message || err;
          if (msg.includes('404')) {
            console.log(`✗ ${modelName} - 404 Not Found`);
          } else if (msg.includes('permission')) {
            console.log(`✗ ${modelName} - Permission denied`);
          } else {
            console.log(`✗ ${modelName} - ${msg.substring(0, 50)}`);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
})();
