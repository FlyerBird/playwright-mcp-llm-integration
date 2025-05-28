const LLMClient = require('./src/llm-client');

async function testConnection() {
  const client = new LLMClient();
  
  console.log('Probando conexión con Ollama...');
  const connected = await client.testConnection();
  
  if (connected) {
    console.log('\n🧪 Probando generación de instrucciones...');
    try {
      const instructions = await client.generateTestInstructions('Login con usuario válido');
      console.log('Respuesta del LLM:', instructions);
    } catch (error) {
      console.error('Error generando instrucciones:', error.message);
    }
  }
}

testConnection();
