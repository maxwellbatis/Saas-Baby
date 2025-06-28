# Script para testar criação de pedido
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbWNhc25iN3IwMDAxdTFlYWYweTVpd3QwIiwiZW1haWwiOiJtYXh3ZWxsMTIzNG1lbGxhbmllQGdtYWlsLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzUxMTEwNjYwLCJleHAiOjE3NTE3MTU0NjB9.LAe_MYBJ_rzkKYG5GWinJdvwshPeLSIImLnN2Gl1CCA"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$body = @{
    items = @(
        @{
            productId = 3
            quantity = 1
        }
    )
    payment_method = "credit_card"
    customer = @{
        name = "Maxwell Teste"
        email = "maxwell1234mellanie@gmail.com"
        phone = "11999999999"
        document = "12345678901"
    }
    shipping_address = @{
        street = "Rua Teste"
        number = "123"
        complement = "Apto 1"
        neighborhood = "Centro"
        city = "São Paulo"
        state = "SP"
        zip_code = "01234-567"
        shipping_cost = 0
    }
} | ConvertTo-Json -Depth 10

Write-Host "Fazendo requisição para criar pedido..."
Write-Host "Token: $($token.Substring(0, 50))..."
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/shop/checkout/create-order" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Pedido criado com sucesso!"
    Write-Host "Resposta:"
    $response | ConvertTo-Json -Depth 5
} catch {
    Write-Host "❌ Erro ao criar pedido:"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    
    try {
        $errorResponse = $_.ErrorDetails.Message
        if ($errorResponse) {
            Write-Host "Error Details: $errorResponse"
        }
    } catch {
        Write-Host "Não foi possível obter detalhes do erro"
    }
} 