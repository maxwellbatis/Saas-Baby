# Script para ambiente de desenvolvimento
param(
    [switch]$BackendOnly,
    [switch]$FrontendOnly,
    [switch]$DatabaseOnly
)

Write-Host "🚀 Iniciando ambiente de desenvolvimento..." -ForegroundColor Green

# Verificar se Docker está rodando
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker verificado" -ForegroundColor Green

# Criar diretórios necessários
$directories = @(
    "uploads",
    "logs"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📁 Criado diretório: $dir" -ForegroundColor Blue
    }
}

# Parar containers existentes
Write-Host "🛑 Parando containers de desenvolvimento..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml down

# Remover containers antigos
Write-Host "🧹 Removendo containers antigos..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml rm -f

if ($DatabaseOnly) {
    Write-Host "🗄️ Iniciando apenas banco de dados..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev mailhog
    
    Write-Host "✅ Banco de dados iniciado!" -ForegroundColor Green
    Write-Host "📊 PostgreSQL: localhost:5433" -ForegroundColor Cyan
    Write-Host "🔴 Redis: localhost:6380" -ForegroundColor Cyan
    Write-Host "📧 Mailhog: http://localhost:8025" -ForegroundColor Cyan
    exit 0
}

if ($BackendOnly) {
    Write-Host "🔧 Iniciando apenas backend..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d postgres-dev redis-dev backend-dev
    
    Write-Host "✅ Backend iniciado!" -ForegroundColor Green
    Write-Host "🔧 API: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "📚 Docs: http://localhost:3000/api/docs" -ForegroundColor Cyan
    exit 0
}

if ($FrontendOnly) {
    Write-Host "🎨 Iniciando apenas frontend..." -ForegroundColor Yellow
    docker-compose -f docker-compose.dev.yml up -d frontend-dev
    
    Write-Host "✅ Frontend iniciado!" -ForegroundColor Green
    Write-Host "🌐 Frontend: http://localhost:5173" -ForegroundColor Cyan
    exit 0
}

# Iniciar todos os serviços
Write-Host "🚀 Iniciando todos os serviços..." -ForegroundColor Yellow

# Build das imagens
Write-Host "🔨 Fazendo build das imagens..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml build --no-cache

# Iniciar serviços
docker-compose -f docker-compose.dev.yml up -d

# Aguardar serviços
Write-Host "⏳ Aguardando serviços..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Executar migrations
Write-Host "🗄️ Executando migrations..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml exec -T backend-dev npx prisma migrate dev

# Executar seed
Write-Host "🌱 Executando seed..." -ForegroundColor Yellow
docker-compose -f docker-compose.dev.yml exec -T backend-dev npx prisma db seed

# Verificar status
Write-Host "📊 Verificando status dos containers..." -ForegroundColor Green
docker-compose -f docker-compose.dev.yml ps

Write-Host "✅ Ambiente de desenvolvimento iniciado!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  Backend: http://localhost:3000" -ForegroundColor White
Write-Host "  API Docs: http://localhost:3000/api/docs" -ForegroundColor White
Write-Host "  Mailhog: http://localhost:8025" -ForegroundColor White
Write-Host ""
Write-Host "🗄️ Banco de dados:" -ForegroundColor Cyan
Write-Host "  PostgreSQL: localhost:5433" -ForegroundColor White
Write-Host "  Redis: localhost:6380" -ForegroundColor White
Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  Logs: docker-compose -f docker-compose.dev.yml logs -f" -ForegroundColor White
Write-Host "  Parar: docker-compose -f docker-compose.dev.yml down" -ForegroundColor White
Write-Host "  Restart: docker-compose -f docker-compose.dev.yml restart" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Desenvolvimento:" -ForegroundColor Cyan
Write-Host "  Hot reload ativo - suas mudanças serão refletidas automaticamente" -ForegroundColor White 