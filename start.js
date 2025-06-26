// Carregar aliases antes de tudo
require('module-alias/register');

// Configurar aliases manualmente
const moduleAlias = require('module-alias');
const path = require('path');

moduleAlias.addAliases({
  '@': path.join(__dirname, 'src'),
  '@/config': path.join(__dirname, 'src/config'),
  '@/controllers': path.join(__dirname, 'src/controllers'),
  '@/middlewares': path.join(__dirname, 'src/middlewares'),
  '@/routes': path.join(__dirname, 'src/routes'),
  '@/services': path.join(__dirname, 'src/services'),
  '@/types': path.join(__dirname, 'src/types'),
  '@/utils': path.join(__dirname, 'src/utils')
});

// Agora executar o app
require('./dist/index.js'); 