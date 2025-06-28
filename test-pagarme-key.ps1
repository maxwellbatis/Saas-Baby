# Script para testar a nova chave do Pagar.me
Write-Host "🔑 Testando nova chave do Pagar.me..." -ForegroundColor Yellow

# Substitua pela sua nova chave de teste
$NEW_PAGARME_KEY = "sk_test_adc8621acc2e4f8fa2df78f4291ebf50"

Write-Host "Chave sendo testada: $NEW_PAGARME_KEY" -ForegroundColor Cyan

try {
    $headers = @{
        "Authorization" = "Bearer $NEW_PAGARME_KEY"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri "https://api.pagar.me/core/v5/orders" -Method GET -Headers $headers
    
    Write-Host "✅ Chave válida! Conexão com Pagar.me estabelecida." -ForegroundColor Green
    Write-Host "Resposta da API:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3
    
} catch {
    Write-Host "❌ Erro ao testar chave:" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    
    try {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        $reader.Close()
        
        Write-Host "Detalhes do erro:" -ForegroundColor Red
        Write-Host $errorBody -ForegroundColor Red
    } catch {
        Write-Host "Não foi possível obter detalhes do erro" -ForegroundColor Yellow
    }
}

Write-Host "`n📝 Instruções:" -ForegroundColor Yellow
Write-Host "1. Se a chave funcionou, atualize o arquivo .env" -ForegroundColor White
Write-Host "2. Reinicie o backend com: npm run dev" -ForegroundColor White
Write-Host "3. Teste o pedido novamente com: .\test-order.ps1" -ForegroundColor White 