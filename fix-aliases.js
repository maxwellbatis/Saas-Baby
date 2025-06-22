const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        processDirectory(filePath);
      } else if (file.endsWith('.js')) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Substituir aliases por caminhos relativos
        content = content.replace(/@\/controllers\//g, '../controllers/');
        content = content.replace(/@\/middlewares\//g, '../middlewares/');
        content = content.replace(/@\/config\//g, '../config/');
        content = content.replace(/@\/utils\//g, '../utils/');
        content = content.replace(/@\/services\//g, '../services/');
        content = content.replace(/@\/routes\//g, '../routes/');
        content = content.replace(/@\/types\//g, '../types/');
        
        fs.writeFileSync(filePath, content);
        console.log(`✅ Processado: ${filePath}`);
      }
    });
  } catch (error) {
    console.log(`⚠️  Erro ao processar diretório ${dir}:`, error.message);
  }
}

// Verificar se o diretório dist existe
if (fs.existsSync('dist')) {
  processDirectory('dist');
  console.log('✅ Aliases corrigidos com sucesso!');
} else {
  console.log('❌ Diretório dist não encontrado!');
}
