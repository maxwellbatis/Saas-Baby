#!/bin/bash

# Script de deploy para produção
set -e

echo "🚀 Iniciando deploy do Baby Diary..."

# Verificar se o .env existe
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Crie um arquivo .env baseado no .env.example"
    exit 1
fi

# Carregar variáveis de ambiente
source .env

# Verificar variáveis obrigatórias
required_vars=(
    "DB_PASSWORD"
    "JWT_SECRET"
    "STRIPE_SECRET_KEY"
    "STRIPE_WEBHOOK_SECRET"
    "SENDGRID_API_KEY"
    "CLOUDINARY_CLOUD_NAME"
    "CLOUDINARY_API_KEY"
    "CLOUDINARY_API_SECRET"
    "FIREBASE_PROJECT_ID"
    "FIREBASE_PRIVATE_KEY"
    "FIREBASE_CLIENT_EMAIL"
    "CERTBOT_EMAIL"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Variável $var não está definida no .env"
        exit 1
    fi
done

echo "✅ Variáveis de ambiente verificadas"

# Criar diretórios necessários
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p nginx/conf.d
mkdir -p uploads

echo "📁 Diretórios criados"

# Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down

# Remover containers antigos
echo "🧹 Removendo containers antigos..."
docker-compose rm -f

# Build das imagens
echo "🔨 Fazendo build das imagens..."
docker-compose build --no-cache

# Iniciar serviços
echo "🚀 Iniciando serviços..."
docker-compose up -d postgres

# Aguardar banco de dados
echo "⏳ Aguardando banco de dados..."
sleep 10

# Executar migrations
echo "🗄️ Executando migrations..."
docker-compose exec -T backend npx prisma migrate deploy

# Executar seed
echo "🌱 Executando seed..."
docker-compose exec -T backend npx prisma db seed

# Iniciar backend
echo "🔧 Iniciando backend..."
docker-compose up -d backend

# Aguardar backend
echo "⏳ Aguardando backend..."
sleep 10

# Iniciar frontend
echo "🎨 Iniciando frontend..."
docker-compose up -d frontend

# Aguardar frontend
echo "⏳ Aguardando frontend..."
sleep 10

# Iniciar nginx
echo "🌐 Iniciando nginx..."
docker-compose up -d nginx

# Verificar status dos containers
echo "📊 Verificando status dos containers..."
docker-compose ps

# Verificar logs
echo "📋 Logs dos containers:"
docker-compose logs --tail=20

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://babydiary.shop"
echo "🔧 API: https://api.babydiary.shop"
echo "👨‍💼 Admin: https://admin.babydiary.shop"

# Instruções para SSL
echo ""
echo "🔒 Para configurar SSL automaticamente:"
echo "1. Certifique-se de que os domínios apontam para este servidor"
echo "2. Execute: docker-compose run --rm certbot"
echo "3. Reinicie o nginx: docker-compose restart nginx" 