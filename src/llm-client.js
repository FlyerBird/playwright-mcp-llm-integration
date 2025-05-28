// src/llm-client.js
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Para obtener __dirname en ES6 modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class LLMClient {
  constructor() {
    // Cargar configuración
    const configPath = path.join(__dirname, '../config/mcp-config.json');
    this.config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    this.ollamaUrl = this.config.llm.baseUrl;
    this.model = this.config.llm.model;
  }

  async generateTestSteps(description, context = {}) {
    const prompt = this.buildPrompt(description, context);
    
    try {
      console.log('🧠 Enviando request a Ollama...');
      
      const response = await axios.post(`${this.ollamaUrl}/api/generate`, {
        model: this.model,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
          num_predict: 1000
        }
      });

      const llmResponse = response.data.response;
      console.log('✅ Respuesta de LLM recibida');
      
      // Parsear JSON de la respuesta
      const parsed = this.parseJsonResponse(llmResponse);
      
      return {
        steps: parsed.steps || [],
        reasoning: parsed.reasoning || 'Test steps generated',
        model: this.model,
        rawResponse: llmResponse
      };
      
    } catch (error) {
      console.error('❌ Error conectando con Ollama:', error.message);
      throw new Error(`LLM Error: ${error.message}`);
    }
  }

  // Método legacy para compatibilidad
  async generateTestInstructions(scenario) {
    const result = await this.generateTestSteps(scenario);
    return JSON.stringify(result);
  }

  buildPrompt(description, context) {
    const baseUrl = context.baseUrl || 'https://www.saucedemo.com';
    const username = context.credentials?.username || 'standard_user';
    const password = context.credentials?.password || 'secret_sauce';

    return `Como experto en testing automatizado con Playwright, genera instrucciones específicas para el sitio web SauceDemo.

CONTEXTO:
- URL Base: ${baseUrl}
- Usuario: ${username}
- Password: ${password}

DESCRIPCIÓN DEL TEST: "${description}"

IMPORTANTE: Responde ÚNICAMENTE con JSON válido, sin texto adicional.

Formato de respuesta:
{
  "reasoning": "explicación breve de qué hará el test",
  "steps": [
    {
      "action": "navigate",
      "value": "${baseUrl}"
    },
    {
      "action": "fill",
      "selector": "[data-test=\\"username\\"]",
      "value": "${username}"
    },
    {
      "action": "fill",
      "selector": "[data-test=\\"password\\"]",
      "value": "${password}"
    },
    {
      "action": "click",
      "selector": "[data-test=\\"login-button\\"]"
    },
    {
      "action": "verify",
      "selector": ".inventory_list",
      "options": { "visible": true }
    }
  ]
}

Acciones disponibles:
- navigate: ir a URL
- click: hacer click en elemento
- fill: llenar campos de texto
- verify: verificar elementos existen/visibles
- wait: esperar elemento o tiempo
- screenshot: tomar captura
- select: seleccionar opción en dropdown
- hover: pasar mouse sobre elemento

Selectores para SauceDemo:
- Username: [data-test="username"]
- Password: [data-test="password"] 
- Login button: [data-test="login-button"]
- Inventory: .inventory_list
- Product items: .inventory_item
- Add to cart buttons: [data-test^="add-to-cart"]
- Cart icon: .shopping_cart_link
- Cart badge: .shopping_cart_badge
- Checkout button: [data-test="checkout"]
- First name: [data-test="firstName"]
- Last name: [data-test="lastName"]
- Postal code: [data-test="postalCode"]
- Continue button: [data-test="continue"]
- Finish button: [data-test="finish"]
- Menu button: #react-burger-menu-btn
- Logout link: #logout_sidebar_link

RESPUESTA (JSON válido):`;
  }

  parseJsonResponse(response) {
    try {
      // Buscar JSON en la respuesta
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
      
      // Si no encuentra JSON, crear estructura básica
      console.log('⚠️ No se encontró JSON válido, creando estructura básica');
      return {
        steps: [
          { action: 'navigate', value: 'https://www.saucedemo.com' },
          { action: 'screenshot', value: 'fallback-test' }
        ],
        reasoning: "Fallback: No se pudo parsear respuesta del LLM"
      };
      
    } catch (error) {
      console.error('❌ Error parseando JSON:', error.message);
      console.log('Respuesta raw:', response);
      
      return {
        steps: [
          { action: 'navigate', value: 'https://www.saucedemo.com' },
          { action: 'screenshot', value: 'error-fallback' }
        ],
        reasoning: `Error parsing: ${error.message}`
      };
    }
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.ollamaUrl}/api/tags`);
      console.log('✅ Conexión con Ollama exitosa');
      console.log('Modelos disponibles:', response.data.models.map(m => m.name));
      return true;
    } catch (error) {
      console.error('❌ Error conectando con Ollama:', error.message);
      return false;
    }
  }
}