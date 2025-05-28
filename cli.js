#!/usr/bin/env node
// cli.js
import { TestRunner } from './src/test-runner.js';
import readline from 'readline';

class TestCLI {
  constructor() {
    this.runner = new TestRunner({
      headless: false,
      slowMo: 1500,
      saveResults: true
    });
    
    this.defaultContext = {
      baseUrl: "https://www.saucedemo.com",
      credentials: {
        username: "standard_user",
        password: "secret_sauce"
      }
    };
    
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '🤖 Test> '
    });
  }

  /**
   * Inicia la interfaz CLI
   */
  async start() {
    console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🎭 PLAYWRIGHT LLM TESTER                  ║
║                                                              ║
║  Escribe tests en lenguaje natural y ve cómo se ejecutan!   ║
║                                                              ║
║  Ejemplos:                                                   ║
║  • login to saucedemo                                        ║
║  • add backpack to cart                                      ║
║  • complete checkout process                                 ║
║  • verify inventory page loads                               ║
║                                                              ║
║  Comandos especiales:                                        ║
║  • /help - Mostrar ayuda                                     ║
║  • /context - Ver contexto actual                            ║
║  • /exit - Salir                                             ║
║  • /multiple - Ejecutar múltiples tests                      ║
╚══════════════════════════════════════════════════════════════╝
`);

    this.rl.prompt();
    
    this.rl.on('line', async (input) => {
      const command = input.trim();
      
      if (!command) {
        this.rl.prompt();
        return;
      }
      
      await this.handleCommand(command);
      this.rl.prompt();
    });
    
    this.rl.on('close', async () => {
      console.log('\n👋 ¡Hasta luego!');
      await this.runner.close();
      process.exit(0);
    });
  }

  /**
   * Maneja comandos del usuario
   */
  async handleCommand(command) {
    try {
      // Comandos especiales
      if (command.startsWith('/')) {
        return await this.handleSpecialCommand(command);
      }
      
      // Test normal
      console.log(`\n🎯 Ejecutando: "${command}"`);
      const result = await this.runner.runTest(command, this.defaultContext);
      
      if (result.success) {
        console.log(`\n🎉 ¡Test completado exitosamente!`);
      } else {
        console.log(`\n💔 Test falló. Revisa los detalles arriba.`);
      }
      
    } catch (error) {
      console.log(`\n❌ Error: ${error.message}`);
    }
  }

  /**
   * Maneja comandos especiales
   */
  async handleSpecialCommand(command) {
    const [cmd, ...args] = command.slice(1).split(' ');
    
    switch (cmd.toLowerCase()) {
      case 'help':
        this.showHelp();
        break;
        
      case 'context':
        this.showContext();
        break;
        
      case 'exit':
      case 'quit':
        console.log('\n👋 Cerrando...');
        await this.runner.close();
        process.exit(0);
        break;
        
      case 'multiple':
        await this.runMultipleTests();
        break;
        
      case 'examples':
        this.showExamples();
        break;
        
      case 'config':
        await this.configureSettings();
        break;
        
      default:
        console.log(`\n❓ Comando desconocido: ${cmd}`);
        console.log('💡 Usa /help para ver comandos disponibles');
    }
  }

  /**
   * Muestra ayuda
   */
  showHelp() {
    console.log(`
📚 AYUDA - COMANDOS DISPONIBLES:

🎭 Tests normales:
  Simplemente escribe lo que quieres hacer en español:
  
  • "login to saucedemo"
  • "add backpack to cart"
  • "complete checkout with fake info"
  • "verify cart has 2 items"
  • "logout from application"

🔧 Comandos especiales:
  /help         - Mostrar esta ayuda
  /context      - Ver configuración actual
  /examples     - Ver más ejemplos de tests
  /multiple     - Ejecutar varios tests seguidos
  /config       - Cambiar configuración
  /exit         - Salir del programa

💡 Consejos:
  • Sé específico pero natural: "login with standard user"
  • El LLM entiende contexto: "después agrega una camiseta"
  • Si algo falla, intenta reformular la descripción
`);
  }

  /**
   * Muestra contexto actual
   */
  showContext() {
    console.log(`
⚙️ CONTEXTO ACTUAL:

🌐 URL Base: ${this.defaultContext.baseUrl}
👤 Usuario: ${this.defaultContext.credentials.username}
🔑 Password: ${this.defaultContext.credentials.password}

🎭 Configuración Playwright:
• Modo headless: ${this.runner.testExecutor.options.headless ? 'Sí' : 'No'}
• Velocidad: ${this.runner.testExecutor.options.slowMo}ms entre acciones
• Screenshots: ${this.runner.testExecutor.options.screenshotDir}

🤖 LLM:
• Modelo: llama3.1:8b (Ollama local)
• Servidor: http://localhost:11434
`);
  }

  /**
   * Muestra ejemplos
   */
  showExamples() {
    console.log(`
🎯 EJEMPLOS DE TESTS:

🔐 Autenticación:
  • "login to saucedemo"
  • "login with standard user credentials"
  • "logout from the application"

🛒 Carrito de compras:
  • "add backpack to cart"
  • "add 3 items to cart"
  • "remove item from cart"
  • "verify cart has 2 items"

💳 Checkout:
  • "complete checkout process"
  • "fill checkout form with fake data"
  • "complete purchase with John Doe info"

🔍 Verificaciones:
  • "verify login page loads correctly"
  • "check inventory page shows 6 products"
  • "verify user is logged in"

🎭 Navegación:
  • "go to inventory page"
  • "open product details for backpack"
  • "navigate to cart page"

💡 Combina acciones:
  • "login and add backpack to cart"
  • "complete full purchase flow with test data"
  • "login, add 2 items, and checkout"
`);
  }

  /**
   * Ejecuta múltiples tests
   */
  async runMultipleTests() {
    console.log('\n🎯 MODO MÚLTIPLES TESTS');
    console.log('Escribe un test por línea. Línea vacía para ejecutar todos.');
    console.log('Ejemplo:');
    console.log('  login to saucedemo');
    console.log('  add backpack to cart');
    console.log('  complete checkout');
    console.log('  [línea vacía para ejecutar]');
    console.log('\n📝 Escribe los tests:');
    
    const tests = [];
    
    const multiRL = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: '  Test> '
    });
    
    multiRL.prompt();
    
    return new Promise((resolve) => {
      multiRL.on('line', async (input) => {
        const test = input.trim();
        
        if (!test) {
          // Línea vacía - ejecutar todos los tests
          if (tests.length > 0) {
            console.log(`\n🚀 Ejecutando ${tests.length} tests...`);
            multiRL.close();
            
            const results = await this.runner.runMultipleTests(tests, this.defaultContext);
            console.log(`\n🎉 Múltiples tests completados!`);
            resolve(results);
          } else {
            console.log('❓ No hay tests para ejecutar');
            multiRL.close();
            resolve(null);
          }
          return;
        }
        
        tests.push(test);
        console.log(`✅ Agregado: "${test}"`);
        multiRL.prompt();
      });
      
      multiRL.on('close', () => {
        resolve(null);
      });
    });
  }

  /**
   * Configurar ajustes
   */
  async configureSettings() {
    console.log('\n⚙️ CONFIGURACIÓN (próximamente...)');
    console.log('💡 Por ahora edita cli.js para cambiar configuración');
  }
}

// Ejecutar CLI si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new TestCLI();
  
  // Manejar Ctrl+C
  process.on('SIGINT', async () => {
    console.log('\n\n⏹️ Interrumpido por usuario');
    await cli.runner.close();
    process.exit(0);
  });
  
  // Iniciar CLI
  cli.start().catch(console.error);
}

export { TestCLI };