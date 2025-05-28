// src/test-runner.js
import { LLMClient } from './llm-client.js';
import { TestExecutor } from './test-executor.js';

export class TestRunner {
  constructor(options = {}) {
    this.llmClient = new LLMClient();
    this.testExecutor = new TestExecutor({
      headless: options.headless || false,
      slowMo: options.slowMo || 1500,
      screenshotDir: options.screenshotDir || './screenshots'
    });
    
    this.options = {
      maxRetries: 2,
      saveResults: true,
      ...options
    };
  }

  /**
   * Ejecuta un test desde descripción natural
   * @param {string} description - Descripción en lenguaje natural
   * @param {Object} context - Contexto adicional (URL base, credenciales, etc.)
   */
  async runTest(description, context = {}) {
    console.log('🚀 Iniciando Test Runner...');
    console.log(`📝 Descripción: "${description}"`);
    
    const startTime = Date.now();
    let steps = [];
    let llmResponse = null;
    let executionResults = null;
    
    try {
      // 1. Generar pasos con LLM
      console.log('\n🧠 Generando pasos con LLM...');
      llmResponse = await this.llmClient.generateTestSteps(description, context);
      
      if (!llmResponse.steps || !Array.isArray(llmResponse.steps)) {
        throw new Error('LLM no generó pasos válidos');
      }
      
      steps = llmResponse.steps;
      console.log(`✅ LLM generó ${steps.length} pasos`);
      
      // Mostrar pasos generados
      console.log('\n📋 Pasos a ejecutar:');
      steps.forEach((step, i) => {
        console.log(`  ${i + 1}. ${step.action} ${step.selector || step.value || ''}`);
      });
      
      // 2. Ejecutar pasos con Playwright
      console.log('\n🎭 Ejecutando con Playwright...');
      executionResults = await this.testExecutor.executeSteps(steps);
      
      // 3. Analizar resultados
      const success = executionResults.failedSteps === 0;
      const duration = Date.now() - startTime;
      
      const summary = {
        success,
        description,
        totalSteps: executionResults.totalSteps,
        completedSteps: executionResults.completedSteps,
        failedSteps: executionResults.failedSteps,
        duration,
        llmResponse: {
          model: llmResponse.model,
          reasoning: llmResponse.reasoning
        },
        executionResults: executionResults.results,
        timestamp: new Date().toISOString()
      };
      
      // 4. Mostrar resumen
      this.printSummary(summary);
      
      // 5. Guardar resultados si está habilitado
      if (this.options.saveResults) {
        await this.saveTestResults(summary);
      }
      
      return summary;
      
    } catch (error) {
      console.log(`\n❌ Error en Test Runner: ${error.message}`);
      
      const errorSummary = {
        success: false,
        description,
        error: error.message,
        steps: steps.length,
        duration: Date.now() - startTime,
        timestamp: new Date().toISOString()
      };
      
      if (this.options.saveResults) {
        await this.saveTestResults(errorSummary);
      }
      
      return errorSummary;
      
    } finally {
      // Cerrar navegador
      await this.testExecutor.close();
    }
  }

  /**
   * Ejecuta multiple tests
   * @param {Array} testDescriptions - Array de descripciones de tests
   * @param {Object} globalContext - Contexto global para todos los tests
   */
  async runMultipleTests(testDescriptions, globalContext = {}) {
    console.log(`🎯 Ejecutando ${testDescriptions.length} tests...`);
    
    const results = [];
    
    for (let i = 0; i < testDescriptions.length; i++) {
      const description = testDescriptions[i];
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📊 Test ${i + 1}/${testDescriptions.length}`);
      console.log(`${'='.repeat(60)}`);
      
      const result = await this.runTest(description, globalContext);
      results.push(result);
      
      // Pausa entre tests si no es el último
      if (i < testDescriptions.length - 1) {
        console.log('\n⏸️ Pausa entre tests (3s)...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Resumen final
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🏁 RESUMEN FINAL`);
    console.log(`${'='.repeat(60)}`);
    console.log(`✅ Tests exitosos: ${successful}`);
    console.log(`❌ Tests fallidos: ${failed}`);
    console.log(`📊 Porcentaje éxito: ${Math.round((successful / results.length) * 100)}%`);
    
    return {
      totalTests: results.length,
      successful,
      failed,
      successRate: successful / results.length,
      results
    };
  }

  /**
   * Muestra resumen de ejecución
   */
  printSummary(summary) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`📊 RESUMEN DE EJECUCIÓN`);
    console.log(`${'='.repeat(50)}`);
    console.log(`📝 Test: ${summary.description}`);
    console.log(`${summary.success ? '✅' : '❌'} Resultado: ${summary.success ? 'ÉXITO' : 'FALLO'}`);
    console.log(`📈 Pasos: ${summary.completedSteps}/${summary.totalSteps}`);
    
    if (summary.failedSteps > 0) {
      console.log(`💥 Fallos: ${summary.failedSteps}`);
    }
    
    console.log(`⏱️ Duración: ${Math.round(summary.duration / 1000)}s`);
    
    if (summary.llmResponse?.reasoning) {
      console.log(`🤖 LLM: ${summary.llmResponse.reasoning}`);
    }
    
    console.log(`${'='.repeat(50)}`);
  }

  /**
   * Guarda resultados en archivo
   */
  async saveTestResults(summary) {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Crear directorio de resultados
      const resultsDir = './test-results';
      await fs.mkdir(resultsDir, { recursive: true });
      
      // Nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `test-result-${timestamp}.json`;
      const filepath = path.join(resultsDir, filename);
      
      // Guardar resultado
      await fs.writeFile(filepath, JSON.stringify(summary, null, 2));
      console.log(`💾 Resultados guardados: ${filepath}`);
      
    } catch (error) {
      console.log(`⚠️ No se pudieron guardar resultados: ${error.message}`);
    }
  }

  /**
   * Cierra recursos
   */
  async close() {
    await this.testExecutor.close();
  }
}

// Ejemplo de uso directo:
/*
const runner = new TestRunner({
  headless: false,
  slowMo: 1000,
  saveResults: true
});

// Test individual
const result = await runner.runTest("login to saucedemo with standard user", {
  baseUrl: "https://www.saucedemo.com",
  credentials: {
    username: "standard_user",
    password: "secret_sauce"
  }
});

console.log(result);
*/