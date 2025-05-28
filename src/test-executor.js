// src/test-executor.js
import { chromium } from 'playwright';
import fs from 'fs/promises';
import path from 'path';

export class TestExecutor {
  constructor(options = {}) {
    this.browser = null;
    this.page = null;
    this.options = {
      headless: false, // Ver el navegador en acción
      slowMo: 1000,    // Pausa entre acciones (ms)
      screenshotDir: './screenshots',
      ...options
    };
  }

  /**
   * Inicializa el navegador y página
   */
  async initialize() {
    console.log('🚀 Iniciando navegador...');
    
    this.browser = await chromium.launch({
      headless: this.options.headless,
      slowMo: this.options.slowMo
    });
    
    this.page = await this.browser.newPage();
    
    // Configurar viewport
    await this.page.setViewportSize({ width: 1280, height: 720 });
    
    console.log('✅ Navegador listo');
  }

  /**
   * Ejecuta una lista de pasos generados por el LLM
   * @param {Array} steps - Array de objetos con acciones
   */
  async executeSteps(steps) {
    if (!this.browser) {
      await this.initialize();
    }

    const results = [];
    
    console.log(`🎭 Ejecutando ${steps.length} pasos...`);
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`\n📍 Paso ${i + 1}/${steps.length}: ${step.action}`);
      
      try {
        const result = await this.executeStep(step);
        results.push({
          step: i + 1,
          action: step.action,
          success: true,
          result: result,
          timestamp: new Date().toISOString()
        });
        
        console.log(`✅ Completado`);
        
        // Pausa opcional entre pasos
        if (this.options.slowMo && i < steps.length - 1) {
          await this.page.waitForTimeout(this.options.slowMo);
        }
        
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        
        // Tomar screenshot del error
        await this.takeScreenshot(`error-step-${i + 1}`);
        
        results.push({
          step: i + 1,
          action: step.action,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        // Decidir si continuar o parar
        if (step.critical !== false) {
          console.log('🛑 Paso crítico falló, deteniendo ejecución');
          break;
        }
      }
    }
    
    // Screenshot final
    await this.takeScreenshot('final-result');
    
    return {
      totalSteps: steps.length,
      completedSteps: results.filter(r => r.success).length,
      failedSteps: results.filter(r => !r.success).length,
      results: results,
      duration: results.length > 0 ? 
        new Date(results[results.length - 1].timestamp) - new Date(results[0].timestamp) : 0
    };
  }

  /**
   * Ejecuta un paso individual
   * @param {Object} step - Objeto con la acción a ejecutar
   */
  async executeStep(step) {
    const { action, selector, value, options = {} } = step;
    
    switch (action.toLowerCase()) {
      case 'navigate':
      case 'goto':
        await this.page.goto(value || selector, { 
          waitUntil: 'networkidle',
          timeout: 30000 
        });
        return `Navegado a: ${value || selector}`;

      case 'click':
        await this.page.waitForSelector(selector, { timeout: 10000 });
        await this.page.click(selector);
        return `Click en: ${selector}`;

      case 'fill':
      case 'type':
        await this.page.waitForSelector(selector, { timeout: 10000 });
        await this.page.fill(selector, value);
        return `Llenado '${value}' en: ${selector}`;

      case 'press':
        await this.page.press(selector || 'body', value);
        return `Presionado: ${value}`;

      case 'wait':
        if (selector) {
          await this.page.waitForSelector(selector, { timeout: 15000 });
          return `Esperado elemento: ${selector}`;
        } else {
          await this.page.waitForTimeout(parseInt(value) || 2000);
          return `Esperado ${value || 2000}ms`;
        }

      case 'screenshot':
        const filename = value || `screenshot-${Date.now()}`;
        await this.takeScreenshot(filename);
        return `Screenshot tomado: ${filename}`;

      case 'scroll':
        if (selector) {
          await this.page.locator(selector).scrollIntoViewIfNeeded();
        } else {
          await this.page.evaluate(() => window.scrollBy(0, 500));
        }
        return `Scroll realizado`;

      case 'verify':
      case 'assert':
        return await this.executeVerification(step);

      case 'select':
        await this.page.waitForSelector(selector, { timeout: 10000 });
        await this.page.selectOption(selector, value);
        return `Seleccionado '${value}' en: ${selector}`;

      case 'hover':
        await this.page.waitForSelector(selector, { timeout: 10000 });
        await this.page.hover(selector);
        return `Hover en: ${selector}`;

      default:
        throw new Error(`Acción desconocida: ${action}`);
    }
  }

  /**
   * Ejecuta verificaciones
   */
  async executeVerification(step) {
    const { selector, value, options = {} } = step;
    
    try {
      if (options.text) {
        const element = await this.page.waitForSelector(selector, { timeout: 5000 });
        const text = await element.textContent();
        if (!text.includes(value)) {
          throw new Error(`Texto esperado '${value}' no encontrado en '${text}'`);
        }
        return `Verificado texto '${value}' en: ${selector}`;
      }
      
      if (options.visible !== undefined) {
        const isVisible = await this.page.isVisible(selector);
        if (isVisible !== options.visible) {
          throw new Error(`Elemento ${selector} debería estar ${options.visible ? 'visible' : 'oculto'}`);
        }
        return `Verificado visibilidad de: ${selector}`;
      }
      
      if (options.enabled !== undefined) {
        const isEnabled = await this.page.isEnabled(selector);
        if (isEnabled !== options.enabled) {
          throw new Error(`Elemento ${selector} debería estar ${options.enabled ? 'habilitado' : 'deshabilitado'}`);
        }
        return `Verificado estado de: ${selector}`;
      }
      
      // Verificación básica de existencia
      await this.page.waitForSelector(selector, { timeout: 5000 });
      return `Verificado elemento existe: ${selector}`;
      
    } catch (error) {
      throw new Error(`Verificación falló: ${error.message}`);
    }
  }

  /**
   * Toma screenshot y lo guarda
   */
  async takeScreenshot(name) {
    try {
      // Asegurar directorio existe
      await fs.mkdir(this.options.screenshotDir, { recursive: true });
      
      const filename = `${name}-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
      const filepath = path.join(this.options.screenshotDir, filename);
      
      await this.page.screenshot({ 
        path: filepath, 
        fullPage: true 
      });
      
      console.log(`📸 Screenshot: ${filepath}`);
      return filepath;
    } catch (error) {
      console.log(`❌ Error tomando screenshot: ${error.message}`);
    }
  }

  /**
   * Cierra el navegador
   */
  async close() {
    if (this.browser) {
      console.log('🔚 Cerrando navegador...');
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  /**
   * Obtiene información de la página actual
   */
  async getPageInfo() {
    if (!this.page) return null;
    
    return {
      url: this.page.url(),
      title: await this.page.title(),
      viewport: this.page.viewportSize()
    };
  }
}

// Ejemplo de uso:
/*
const executor = new TestExecutor({
  headless: false,
  slowMo: 1500
});

const steps = [
  { action: 'navigate', value: 'https://www.saucedemo.com' },
  { action: 'fill', selector: '[data-test="username"]', value: 'standard_user' },
  { action: 'fill', selector: '[data-test="password"]', value: 'secret_sauce' },
  { action: 'click', selector: '[data-test="login-button"]' },
  { action: 'verify', selector: '.inventory_list', options: { visible: true } }
];

try {
  const results = await executor.executeSteps(steps);
  console.log('Resultados:', results);
} finally {
  await executor.close();
}
*/