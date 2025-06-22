const fs = require('fs');
const path = require('path');

function fixAliasesInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Substituir imports com @/ por imports relativos
    const importRegex = /from\s+['"]@\/([^'"]+)['"]/g;
    const newContent = content.replace(importRegex, (match, importPath) => {
      modified = true;
      const relativePath = path.relative(path.dirname(filePath), path.join('dist', importPath));
      return `from '${relativePath.startsWith('.') ? relativePath : './' + relativePath}'`;
    });

    if (modified) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`✅ Corrigido: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao corrigir ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        processDirectory(fullPath);
      } else if (item.endsWith('.js')) {
        fixAliasesInFile(fullPath);
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao processar diretório ${dirPath}:`, error.message);
  }
}

// Processar o diretório dist
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  console.log('🔧 Corrigindo aliases nos arquivos compilados...');
  processDirectory(distPath);
  console.log('✅ Correção de aliases concluída!');
} else {
  console.error('❌ Diretório dist não encontrado!');
  process.exit(1);
}
