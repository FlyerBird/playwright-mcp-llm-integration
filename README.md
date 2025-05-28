# 🎭 Playwright MCP LLM Integration

## 🚀 **¡Automatización de Pruebas con Lenguaje Natural!**

Transforma descripciones en texto simple como **"login to saucedemo"** en pruebas automatizadas reales que se ejecutan en tu navegador. 

**✨ Magia:** Escribes → LLM entiende → Playwright ejecuta → Ves los resultados

---

## 🎯 **¿Qué hace este proyecto?**

```bash
# Escribes esto en la terminal:
🤖 Test> login to saucedemo

# Y sucede esto automáticamente:
🧠 LLM genera pasos inteligentes
🎭 Chrome se abre y navega a SauceDemo  
📝 Llena usuario y contraseña automáticamente
🖱️ Hace click en login
✅ Verifica que funcionó
📸 Toma screenshots de evidencia
💾 Guarda resultados detallados
```

---

## 🏗️ **Arquitectura**

```
📱 CLI Terminal (tu input)
    ↓ "login to saucedemo"
🧠 LLM Client (Ollama + llama3.1:8b)
    ↓ Genera JSON con pasos
🎭 Test Executor (Playwright)
    ↓ Ejecuta acciones reales
🌐 Chrome Browser
    ↓ Automatización visual
📊 Resultados + Screenshots
```

---

## ⚡ **Quick Start**

### 1. **Requisitos**
```bash
# Tener Ollama instalado y ejecutándose
ollama serve
ollama pull llama3.1:8b

# Node.js 18+
node --version
```

### 2. **Instalación**
```bash
git clone https://github.com/FlyerBird/playwright-mcp-llm-integration.git
cd playwright-mcp-llm-integration
npm install
npx playwright install
```

### 3. **¡Usar la magia!**
```bash
# Iniciar interfaz CLI
npm run cli

# Escribir tests en lenguaje natural
🤖 Test> login to saucedemo
🤖 Test> add backpack to cart  
🤖 Test> complete checkout process
```

---

## 🎪 **Ejemplos de Uso**

### 🔐 **Autenticación**
```bash
🤖 Test> login to saucedemo
🤖 Test> login with standard user credentials
🤖 Test> logout from the application
```

### 🛒 **E-commerce**
```bash
🤖 Test> add backpack to cart
🤖 Test> add 3 items to cart
🤖 Test> remove item from cart
🤖 Test> verify cart has 2 items
```

### 💳 **Checkout**
```bash
🤖 Test> complete checkout process
🤖 Test> fill checkout form with fake data
🤖 Test> complete purchase with John Doe info
```

### 🌍 **¡También funciona en español!**
```bash
🤖 Test> inicia sesión en saucedemo
🤖 Test> agrega mochila al carrito
🤖 Test> completa el proceso de compra
```

---

## 🎛️ **Comandos del CLI**

### **Tests Naturales**
- Simplemente describe lo que quieres probar
- Ejemplos: `login to saucedemo`, `add item to cart`, `verify homepage loads`

### **Comandos Especiales**
```bash
/help         # Mostrar ayuda completa
/examples     # Ver más ejemplos de tests
/multiple     # Ejecutar varios tests en secuencia
/context      # Ver configuración actual
/exit         # Salir del programa
```

---

## 🎯 **Características**

### ✅ **Funcionalidades Principales**
- **🧠 IA Inteligente**: Ollama + llama3.1:8b convierte lenguaje natural a acciones
- **🎭 Ejecución Real**: Playwright controla navegador Chrome real
- **📸 Evidencia Visual**: Screenshots automáticos de cada paso
- **🌍 Multiidioma**: Funciona en español e inglés
- **⚡ Tiempo Real**: Ves la ejecución mientras sucede (headless=false)
- **💾 Trazabilidad**: Todos los resultados se guardan en JSON
- **🛡️ Robusto**: Manejo de errores con capturas de fallos

### 🎪 **Acciones Soportadas**
- `navigate` - Ir a URLs
- `click` - Hacer click en elementos
- `fill` - Llenar campos de texto
- `verify` - Verificar elementos existen/visibles
- `screenshot` - Tomar capturas manuales
- `wait` - Esperar elementos o tiempo
- `select` - Seleccionar opciones en dropdowns
- `hover` - Pasar mouse sobre elementos

---

## 📁 **Estructura del Proyecto**

```
playwright-mcp-llm-integration/
├── cli.js                    # 🎯 Interfaz de terminal
├── src/
│   ├── llm-client.js         # 🧠 Cliente Ollama
│   ├── test-executor.js      # 🎭 Ejecutor Playwright  
│   └── test-runner.js        # 🔗 Coordinador central
├── tests/
│   ├── test-quick.js         # ✅ Test básico de validación
│   └── saucedemo.test.js     # 📋 Tests específicos SauceDemo
├── config/
│   └── mcp-config.json       # ⚙️ Configuración LLM
├── screenshots/              # 📸 Capturas automáticas
├── test-results/             # 💾 Resultados en JSON
├── package.json              # 📦 Dependencias y scripts
└── README.md                 # 📖 Esta documentación
```

---

## ⚙️ **Configuración**

### **config/mcp-config.json**
```json
{
  "llm": {
    "baseUrl": "http://localhost:11434",
    "model": "llama3.1:8b"
  },
  "playwright": {
    "headless": false,
    "slowMo": 1500
  }
}
```

### **Variables de Entorno**
```bash
# Opcional: cambiar configuración Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b
```

---

## 🧪 **Scripts Disponibles**

```bash
# Interfaz CLI principal
npm run cli
npm start

# Tests directos
npm run quick-test      # Test básico de validación
npm test               # Tests SauceDemo

# Desarrollo
npm run dev            # Solo LLM client
```

---

## 📊 **Resultados y Evidencia**

### **Screenshots Automáticos**
- Cada paso genera screenshot
- Screenshots de errores automáticos
- Ubicación: `screenshots/`

### **Resultados JSON**
```json
{
  "success": true,
  "description": "login to saucedemo",
  "totalSteps": 5,
  "completedSteps": 5,
  "duration": 8245,
  "executionResults": [...],
  "timestamp": "2025-05-28T14:07:06.000Z"
}
```

---

## 🛠️ **Tecnologías Utilizadas**

- **🧠 LLM**: Ollama + llama3.1:8b
- **🎭 Automatización**: Playwright
- **🌐 Target**: SauceDemo (https://www.saucedemo.com)
- **📱 CLI**: Node.js readline
- **📦 Modules**: ES6 (import/export)
- **🔗 HTTP**: Axios para comunicación LLM

---

## 🚨 **Solución de Problemas**

### **Error: "Module not found"**
```bash
# Verificar package.json tiene "type": "module"
cat package.json | grep '"type"'

# Debe mostrar: "type": "module"
```

### **Error: "Ollama connection failed"**
```bash
# Verificar Ollama está ejecutándose
curl http://localhost:11434/api/tags

# Iniciar Ollama si no está running
ollama serve
```

### **Error: "Playwright browser not found"**
```bash
# Instalar navegadores de Playwright
npx playwright install
```

### **Error: "Permission denied screenshots"**
```bash
# Crear directorio manualmente
mkdir screenshots
chmod 755 screenshots
```

---

## 🎯 **Casos de Uso**

### **🧪 QA Automation**
- Pruebas de regresión automáticas
- Validación de funcionalidades
- Tests de humo (smoke tests)

### **👨‍💻 Desarrollo**
- Validar features nuevas
- Testing durante desarrollo
- Demos automáticos para stakeholders

### **📚 Educación**
- Aprender automatización de pruebas
- Ejemplo de integración LLM + Browser automation
- POC para proyectos similares

---

## 🔮 **Roadmap Futuro**

### **🔧 Próximas Mejoras**
- [ ] Integración MCP Server oficial
- [ ] Dashboard web para resultados
- [ ] Soporte más sitios web (no solo SauceDemo)
- [ ] Tests paralelos
- [ ] Integración CI/CD

### **🎯 Funcionalidades Avanzadas**
- [ ] Generación de reportes HTML
- [ ] Integración con Jira/TestRail
- [ ] Soporte mobile testing
- [ ] API REST para integración externa
- [ ] Plugin para VS Code

---

## 🤝 **Contribuir**

1. Fork el proyecto
2. Crea feature branch (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push branch (`git push origin feature/amazing-feature`)
5. Abrir Pull Request

---

## 📄 **Licencia**

MIT License - ver [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 **Autor**

**Carlos Nieto**
- GitHub: [@FlyerBird](https://github.com/FlyerBird)
- Proyecto: [playwright-mcp-llm-integration](https://github.com/FlyerBird/playwright-mcp-llm-integration)

---

## 🌟 **¡Dale una estrella!**

Si este proyecto te resulta útil, ¡no olvides darle una ⭐ en GitHub!

---

## 🎉 **Demo en Acción**

```bash
# Clonar e instalar
git clone https://github.com/FlyerBird/playwright-mcp-llm-integration.git
cd playwright-mcp-llm-integration
npm install

# Iniciar la magia
npm run cli

# Escribir tu primer test
🤖 Test> login to saucedemo

# ¡Y ver cómo sucede automáticamente! ✨
```

**¡Transforma texto en automatización real!** 🚀