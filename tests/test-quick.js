// tests/test-quick.js
import { TestExecutor } from '../src/test-executor.js';

async function runQuickTest() {
  console.log('🧪 Ejecutando test rápido del Test Executor...\n');
  
  const executor = new TestExecutor({
    headless: false,  // Ver el navegador
    slowMo: 1500      // Pausa entre acciones
  });

  // Test básico: Navegar a SauceDemo y tomar screenshot
  const steps = [
    { 
      action: 'navigate', 
      value: 'https://www.saucedemo.com',
    },
    { 
      action: 'screenshot', 
      value: 'saucedemo-loaded' 
    },
    { 
      action: 'verify', 
      selector: '[data-test="username"]',
      options: { visible: true }
    },
    {
      action: 'verify',
      selector: '.login_logo',
      value: 'Swag Labs',
      options: { text: true }
    }
  ];

  try {
    console.log('📋 Pasos a ejecutar:');
    steps.forEach((step, i) => {
      console.log(`  ${i + 1}. ${step.action} ${step.selector || step.value || ''}`);
    });
    
    console.log('\n🚀 Iniciando ejecución...\n');
    
    const results = await executor.executeSteps(steps);
    
    console.log('\n📊 Resultados:');
    console.log(`✅ Pasos completados: ${results.completedSteps}/${results.totalSteps}`);
    console.log(`❌ Pasos fallidos: ${results.failedSteps}`);
    console.log(`⏱️ Duración: ${results.duration}ms`);
    
    if (results.failedSteps > 0) {
      console.log('\n❌ Pasos que fallaron:');
      results.results
        .filter(r => !r.success)
        .forEach(r => console.log(`  - Paso ${r.step}: ${r.error}`));
    }
    
    console.log('\n🎉 Test completado! Revisa la carpeta screenshots/');
    
  } catch (error) {
    console.error('💥 Error durante el test:', error.message);
  } finally {
    await executor.close();
  }
}

// Ejecutar el test
runQuickTest().catch(console.error);