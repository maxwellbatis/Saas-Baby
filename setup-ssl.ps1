# Script para configurar SSL com Let's Encrypt
param(
    [string]$Email,
    [string[]]$Domains = @("babydiary.shop", "api.babydiary.shop", "admin.babydiary.shop")
)

Write-Host "🔒 Configurando SSL para os domínios..." -ForegroundColor Green

if (-not $Email) {
    Write-Host "❌ Email é obrigatório!" -ForegroundColor Red
    Write-Host "Uso: .\setup-ssl.ps1 -Email seu@email.com" -ForegroundColor Yellow
    exit 1
}

# Verificar se os containers estão rodando
$containers = docker-compose ps --format "table {{.Name}}\t{{.Status}}" | Select-String "Up"
if (-not $containers) {
    Write-Host "❌ Containers não estão rodando!" -ForegroundColor Red
    Write-Host "Execute primeiro: .\deploy.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Containers verificados" -ForegroundColor Green

# Configurar variável de ambiente para certbot
$env:CERTBOT_EMAIL = $Email

# Executar certbot para cada domínio
foreach ($domain in $Domains) {
    Write-Host "🔐 Configurando SSL para: $domain" -ForegroundColor Yellow
    
    try {
        docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email $Email --agree-tos --no-eff-email -d $domain
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ SSL configurado para $domain" -ForegroundColor Green
        } else {
            Write-Host "❌ Erro ao configurar SSL para $domain" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erro ao executar certbot para $domain" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

# Reiniciar nginx para aplicar certificados
Write-Host "🔄 Reiniciando nginx..." -ForegroundColor Yellow
docker-compose restart nginx

Write-Host "✅ SSL configurado!" -ForegroundColor Green
Write-Host "🌐 Teste os domínios:" -ForegroundColor Cyan
foreach ($domain in $Domains) {
    Write-Host "   https://$domain" -ForegroundColor White
}

Write-Host ""
Write-Host "📅 Para renovação automática, adicione ao agendador de tarefas:" -ForegroundColor Yellow
Write-Host "docker-compose run --rm certbot renew && docker-compose restart nginx" -ForegroundColor White 