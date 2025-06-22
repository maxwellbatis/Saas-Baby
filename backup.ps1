# Script para backup do banco de dados
param(
    [string]$BackupPath = "backups",
    [switch]$Restore,
    [string]$RestoreFile
)

# Criar diretório de backup se não existir
if (-not (Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "📁 Criado diretório de backup: $BackupPath" -ForegroundColor Blue
}

if ($Restore) {
    if (-not $RestoreFile) {
        Write-Host "❌ Arquivo de restore não especificado!" -ForegroundColor Red
        Write-Host "Uso: .\backup.ps1 -Restore -RestoreFile caminho/para/backup.sql" -ForegroundColor Yellow
        exit 1
    }
    
    if (-not (Test-Path $RestoreFile)) {
        Write-Host "❌ Arquivo de backup não encontrado: $RestoreFile" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🔄 Restaurando banco de dados..." -ForegroundColor Yellow
    Write-Host "⚠️  ATENÇÃO: Isso irá sobrescrever todos os dados!" -ForegroundColor Red
    
    $confirm = Read-Host "Tem certeza? (s/N)"
    if ($confirm -ne "s" -and $confirm -ne "S") {
        Write-Host "❌ Restore cancelado" -ForegroundColor Yellow
        exit 0
    }
    
    try {
        docker-compose exec -T postgres psql -U babydiary_user -d babydiary -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
        docker-compose exec -T postgres psql -U babydiary_user -d babydiary < $RestoreFile
        
        Write-Host "✅ Banco de dados restaurado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erro ao restaurar banco de dados" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
} else {
    # Backup
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $backupFile = Join-Path $BackupPath "babydiary_backup_$timestamp.sql"
    
    Write-Host "💾 Fazendo backup do banco de dados..." -ForegroundColor Yellow
    Write-Host "📁 Arquivo: $backupFile" -ForegroundColor Blue
    
    try {
        docker-compose exec -T postgres pg_dump -U babydiary_user babydiary > $backupFile
        
        if ($LASTEXITCODE -eq 0) {
            $fileSize = (Get-Item $backupFile).Length / 1MB
            Write-Host "✅ Backup concluído com sucesso!" -ForegroundColor Green
            Write-Host "📊 Tamanho: $([math]::Round($fileSize, 2)) MB" -ForegroundColor Blue
            Write-Host "📁 Local: $backupFile" -ForegroundColor Blue
        } else {
            Write-Host "❌ Erro ao fazer backup" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erro ao executar backup" -ForegroundColor Red
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  Backup: .\backup.ps1" -ForegroundColor White
Write-Host "  Restore: .\backup.ps1 -Restore -RestoreFile backups/babydiary_backup_2024-01-01_12-00-00.sql" -ForegroundColor White 