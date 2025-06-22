# Script para monitoramento dos serviços
param(
    [switch]$Logs,
    [switch]$Stats,
    [switch]$Health,
    [string]$Service
)

Write-Host "📊 Monitoramento do Baby Diary" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Verificar se Docker está rodando
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker não está rodando!" -ForegroundColor Red
    exit 1
}

# Status dos containers
if (-not $Logs -and -not $Stats -and -not $Health) {
    Write-Host "🐳 Status dos Containers:" -ForegroundColor Yellow
    docker-compose ps
    
    Write-Host ""
    Write-Host "📈 Uso de Recursos:" -ForegroundColor Yellow
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Logs
if ($Logs) {
    if ($Service) {
        Write-Host "📋 Logs do serviço: $Service" -ForegroundColor Yellow
        docker-compose logs -f $Service
    } else {
        Write-Host "📋 Logs de todos os serviços:" -ForegroundColor Yellow
        docker-compose logs -f
    }
}

# Estatísticas detalhadas
if ($Stats) {
    Write-Host "📊 Estatísticas detalhadas:" -ForegroundColor Yellow
    docker stats --no-stream
}

# Health checks
if ($Health) {
    Write-Host "🏥 Health Checks:" -ForegroundColor Yellow
    
    $services = @(
        @{Name="Frontend"; URL="http://localhost/health"},
        @{Name="API"; URL="http://localhost:3000/health"},
        @{Name="Database"; URL="postgres://babydiary_user:babydiary_password@localhost:5432/babydiary"}
    )
    
    foreach ($service in $services) {
        Write-Host "🔍 Verificando $($service.Name)..." -ForegroundColor Blue
        
        try {
            if ($service.Name -eq "Database") {
                # Verificar banco de dados
                $result = docker-compose exec -T postgres pg_isready -U babydiary_user
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ $($service.Name): OK" -ForegroundColor Green
                } else {
                    Write-Host "❌ $($service.Name): ERRO" -ForegroundColor Red
                }
            } else {
                # Verificar HTTP
                $response = Invoke-WebRequest -Uri $service.URL -TimeoutSec 5 -ErrorAction SilentlyContinue
                if ($response.StatusCode -eq 200) {
                    Write-Host "✅ $($service.Name): OK" -ForegroundColor Green
                } else {
                    Write-Host "❌ $($service.Name): Status $($response.StatusCode)" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "❌ $($service.Name): ERRO - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Informações do sistema
if (-not $Logs -and -not $Stats -and -not $Health) {
    Write-Host ""
    Write-Host "💾 Informações do Sistema:" -ForegroundColor Yellow
    
    # Espaço em disco
    $disk = Get-WmiObject -Class Win32_LogicalDisk -Filter "DeviceID='C:'"
    $freeSpace = [math]::Round($disk.FreeSpace / 1GB, 2)
    $totalSpace = [math]::Round($disk.Size / 1GB, 2)
    $usedSpace = $totalSpace - $freeSpace
    $usedPercent = [math]::Round(($usedSpace / $totalSpace) * 100, 1)
    
    Write-Host "💿 Disco C: $usedSpace GB / $totalSpace GB ($usedPercent% usado)" -ForegroundColor White
    
    # Memória
    $memory = Get-WmiObject -Class Win32_OperatingSystem
    $totalMemory = [math]::Round($memory.TotalVisibleMemorySize / 1MB, 2)
    $freeMemory = [math]::Round($memory.FreePhysicalMemory / 1MB, 2)
    $usedMemory = $totalMemory - $freeMemory
    $memoryPercent = [math]::Round(($usedMemory / $totalMemory) * 100, 1)
    
    Write-Host "🧠 Memória: $usedMemory GB / $totalMemory GB ($memoryPercent% usado)" -ForegroundColor White
    
    # CPU
    $cpu = Get-WmiObject -Class Win32_Processor
    Write-Host "⚡ CPU: $($cpu.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "📋 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  Status: .\monitor.ps1" -ForegroundColor White
Write-Host "  Logs: .\monitor.ps1 -Logs" -ForegroundColor White
Write-Host "  Logs de serviço: .\monitor.ps1 -Logs -Service backend" -ForegroundColor White
Write-Host "  Estatísticas: .\monitor.ps1 -Stats" -ForegroundColor White
Write-Host "  Health Check: .\monitor.ps1 -Health" -ForegroundColor White 