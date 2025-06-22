#!/bin/bash

echo "🔧 Configurando variáveis de ambiente..."

# Gerar senhas seguras
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)

# Criar arquivo .env
cat > .env << EOF
# ===== CONFIGURAÇÕES DE PRODUÇÃO =====

# Banco de dados
DB_PASSWORD=$DB_PASSWORD

# JWT
JWT_SECRET=$JWT_SECRET

# Stripe (TESTE - mude para LIVE em produção)
STRIPE_SECRET_KEY=sk_test_51H1234567890abcdefghijklmnopqrstuvwxyz
STRIPE_WEBHOOK_SECRET=whsec_test_1234567890abcdefghijklmnopqrstuvwxyz

# SendGrid (CONFIGURE SUA CONTA)
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxx

# Cloudinary (CONFIGURE SUA CONTA)
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456

# Firebase (CONFIGURE SUA CONTA)
FIREBASE_PROJECT_ID=seu-projeto-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----\\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com

# Certbot (SSL)
CERTBOT_EMAIL=seu_email@gmail.com

# URLs
FRONTEND_URL=https://babydiary.shop
ADMIN_URL=https://admin.babydiary.shop
API_URL=https://api.babydiary.shop

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Ambiente
NODE_ENV=production
EOF

echo "✅ Arquivo .env criado!"
echo ""
echo "🔑 Senhas geradas automaticamente:"
echo "   DB_PASSWORD: $DB_PASSWORD"
echo "   JWT_SECRET: $JWT_SECRET"
echo ""
echo "⚠️  CONFIGURE OS SERVIÇOS EXTERNOS:"
echo "   1. SendGrid: https://sendgrid.com"
echo "   2. Cloudinary: https://cloudinary.com"
echo "   3. Firebase: https://console.firebase.google.com"
echo "   4. Stripe: https://stripe.com"
echo ""
echo "📝 Edite o arquivo .env com suas configurações reais" 