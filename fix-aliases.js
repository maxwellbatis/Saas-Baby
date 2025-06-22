const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('dist/**/*.js');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Substituir aliases por caminhos relativos
  content = content.replace(/@\/controllers\//g, '../controllers/');
  content = content.replace(/@\/middlewares\//g, '../middlewares/');
  content = content.replace(/@\/config\//g, '../config/');
  content = content.replace(/@\/utils\//g, '../utils/');
  content = content.replace(/@\/services\//g, '../services/');
  content = content.replace(/@\/routes\//g, '../routes/');
  content = content.replace(/@\/types\//g, '../types/');
  
  fs.writeFileSync(file, content);
});

console.log('✅ Aliases corrigidos com sucesso!');
