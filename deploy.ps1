# Script de deploy para produção (PowerShell)
param(
    [switch]$SkipSSL
)

Write-Host "🚀 Iniciando deploy do Baby Diary..." -ForegroundColor Green

# Verificar se o .env existe
if (-not (Test-Path ".env")) {
    Write-Host "❌ Arquivo .env não encontrado!" -ForegroundColor Red
    Write-Host "📝 Crie um arquivo .env baseado no env.production.example" -ForegroundColor Yellow
    exit 1
}

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
    "certbot/conf",
    "certbot/www", 
    "nginx/conf.d",
    "uploads"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "📁 Criado diretório: $dir" -ForegroundColor Blue
    }
}

# Parar containers existentes
Write-Host "🛑 Parando containers existentes..." -ForegroundColor Yellow
docker-compose down

# Remover containers antigos
Write-Host "🧹 Removendo containers antigos..." -ForegroundColor Yellow
docker-compose rm -f

# Build das imagens
Write-Host "🔨 Fazendo build das imagens..." -ForegroundColor Yellow
docker-compose build --no-cache

# Iniciar serviços
Write-Host "🚀 Iniciando serviços..." -ForegroundColor Yellow
docker-compose up -d postgres

# Aguardar banco de dados
Write-Host "⏳ Aguardando banco de dados..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Executar migrations
Write-Host "🗄️ Executando migrations..." -ForegroundColor Yellow
docker-compose exec -T backend npx prisma migrate deploy

# Executar seed
Write-Host "🌱 Executando seed..." -ForegroundColor Yellow
docker-compose exec -T backend npx prisma db seed

# Iniciar backend
Write-Host "🔧 Iniciando backend..." -ForegroundColor Yellow
docker-compose up -d backend

# Aguardar backend
Write-Host "⏳ Aguardando backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Iniciar frontend
Write-Host "🎨 Iniciando frontend..." -ForegroundColor Yellow
docker-compose up -d frontend

# Aguardar frontend
Write-Host "⏳ Aguardando frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Iniciar nginx
Write-Host "🌐 Iniciando nginx..." -ForegroundColor Yellow
docker-compose up -d nginx

# Verificar status dos containers
Write-Host "📊 Verificando status dos containers..." -ForegroundColor Green
docker-compose ps

# Verificar logs
Write-Host "📋 Logs dos containers:" -ForegroundColor Green
docker-compose logs --tail=20

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
Write-Host "🌐 Acesse: https://babydiary.shop" -ForegroundColor Cyan
Write-Host "🔧 API: https://api.babydiary.shop" -ForegroundColor Cyan
Write-Host "👨‍💼 Admin: https://admin.babydiary.shop" -ForegroundColor Cyan

if (-not $SkipSSL) {
    Write-Host ""
    Write-Host "🔒 Para configurar SSL automaticamente:" -ForegroundColor Yellow
    Write-Host "1. Certifique-se de que os domínios apontam para este servidor" -ForegroundColor White
    Write-Host "2. Execute: docker-compose run --rm certbot" -ForegroundColor White
    Write-Host "3. Reinicie o nginx: docker-compose restart nginx" -ForegroundColor White
} 