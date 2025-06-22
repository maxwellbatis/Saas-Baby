require('dotenv').config();
const cloudinary = require('cloudinary').v2;

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log('=== TESTE DE CONEXÃO COM CLOUDINARY ===');
console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('API Key:', process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'não definida');

// Testar conexão fazendo uma requisição simples
cloudinary.api.ping()
  .then(result => {
    console.log('✅ Conexão com Cloudinary OK!');
    console.log('Status:', result);
  })
  .catch(error => {
    console.log('❌ Erro na conexão com Cloudinary:');
    console.log('Erro:', error.message);
    console.log('Código HTTP:', error.http_code);
  }); 