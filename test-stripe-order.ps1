# Script para testar pedidos da loja usando Stripe
Write-Host "🛒 Testando pedido da loja com Stripe..." -ForegroundColor Yellow

# Token do usuário (substitua pelo token válido)
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWNhc25iN3IwMDAxdTFlYWYweTVpd3QwIiwiZW1haWwiOiJtYXh3ZWxsMTIzNG1lbGxhbmllQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUxMTEwNjYwLCJleHAiOjE3NTE3MTU0NjB9.LAe_MYBJ_rzkKYG5GWinJdvwshPeLSIImLnN2Gl1CCA"

Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan

# Headers da requisição
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Dados do pedido
$body = @{
    items = @(
        @{
            productId = 3
            quantity = 1
        }
    )
    customerInfo = @{
        name = "Maxwell Teste"
        email = "maxwell1234mellanie@gmail.com"
        phone = "11999999999"
        cpf = "12345678901"
    }
    shippingAddress = @{
        street = "Rua Teste"
        number = "123"
        complement = "Apto 1"
        neighborhood = "Centro"
        city = "São Paulo"
        state = "SP"
        zipCode = "01234-567"
    }
    successUrl = "http://localhost:8080/loja/success"
    cancelUrl = "http://localhost:8080/loja/cancel"
} | ConvertTo-Json -Depth 10

Write-Host "Body:" -ForegroundColor Cyan
Write-Host $body -ForegroundColor White

try {
    Write-Host "`n🔄 Fazendo requisição para criar pedido Stripe..." -ForegroundColor Yellow
    
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/shop/stripe/create-order" -Method POST -Headers $headers -Body $body
    
    Write-Host "✅ Pedido Stripe criado com sucesso!" -ForegroundColor Green
    Write-Host "Session ID: $($response.data.sessionId)" -ForegroundColor White
    Write-Host "URL de checkout: $($response.data.url)" -ForegroundColor White
    
    Write-Host "`n📝 Próximos passos:" -ForegroundColor Yellow
    Write-Host "1. Acesse a URL de checkout para finalizar o pagamento" -ForegroundColor White
    Write-Host "2. Use cartão de teste: 4242 4242 4242 4242" -ForegroundColor White
    Write-Host "3. Data de expiração: qualquer data futura" -ForegroundColor White
    Write-Host "4. CVC: qualquer 3 dígitos" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erro ao criar pedido Stripe:" -ForegroundColor Red
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

Write-Host "`n🔗 Para testar o webhook, configure no painel do Stripe:" -ForegroundColor Yellow
Write-Host "URL: http://localhost:3000/api/shop/stripe/webhook" -ForegroundColor White
Write-Host "Eventos: checkout.session.completed" -ForegroundColor White 