const fs = require('fs');
const path = require('path');

// Função para processar um arquivo
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Substituir fetch com localhost:3000
    const fetchPattern = /fetch\(['"`]http:\/\/localhost:3000\/api\/([^'"`]+)['"`]/g;
    content = content.replace(fetchPattern, (match, endpoint) => {
      modified = true;
      return `fetch(\`\${API_CONFIG.BASE_URL}/${endpoint}\``;
    });
    
    // Se modificou, adicionar import se necessário
    if (modified && !content.includes('import { API_CONFIG }')) {
      // Encontrar onde adicionar o import
      const importMatch = content.match(/import.*from.*['"`]/);
      if (importMatch) {
        const lastImportIndex = content.lastIndexOf('import');
        const lastImportEnd = content.indexOf('\n', lastImportIndex) + 1;
        content = content.slice(0, lastImportEnd) + 
                 "import { API_CONFIG } from '../config/api';\n" +
                 content.slice(lastImportEnd);
      } else {
        // Se não há imports, adicionar no início
        content = "import { API_CONFIG } from '../config/api';\n" + content;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Atualizado: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
  }
}

// Função para processar diretório recursivamente
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      processFile(filePath);
    }
  });
}

// Processar o diretório src
const srcPath = path.join(__dirname, 'src');
console.log('🔧 Substituindo localhost:3000 por configuração centralizada...');
processDirectory(srcPath);
console.log('✅ Processamento concluído!'); 