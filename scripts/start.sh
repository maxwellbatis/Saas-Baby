#!/bin/bash

set -e

echo "🚀 Iniciando Baby Diary Backend..."

# Gerar cliente Prisma
echo "📦 Gerando cliente Prisma..."
npx prisma generate

# Aguardar um pouco para o banco estar disponível
echo "⏳ Aguardando banco de dados..."
sleep 5

# Aplicar migrações
echo "🗄️ Aplicando migrações do banco de dados..."
npx prisma migrate deploy || {
    echo "⚠️ Erro ao aplicar migrações, tentando db push..."
    npx prisma db push
}

# Executar seed apenas se for necessário
echo "🌱 Executando seed do banco de dados..."
npx prisma db seed || {
    echo "⚠️ Erro no seed, continuando..."
}

# Iniciar o servidor
echo "🚀 Iniciando servidor..."
node dist/index.js 