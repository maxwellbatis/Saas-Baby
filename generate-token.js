const jwt = require('jsonwebtoken');

// ID correto do usuário encontrado no banco
const userId = 'cmcasnb7r0001u1eaf0y5iwt0';
const email = 'maxwell1234mellanie@gmail.com';

// Gerar token JWT
const token = jwt.sign(
  {
    userId: userId,
    email: email,
    role: 'user'
  },
  process.env.JWT_SECRET || 'your-secret-key',
  { expiresIn: '7d' }
);

console.log('🔑 Token JWT gerado:');
console.log(token);
console.log('\n📋 Informações do token:');
console.log('- User ID:', userId);
console.log('- Email:', email);
console.log('- Role: user'); 