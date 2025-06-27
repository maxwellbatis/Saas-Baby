# 🔗 Configuração das APIs de Redes Sociais

Este guia explica como configurar as APIs do Instagram e Facebook para obter dados reais de hashtags no painel de marketing.

## 📋 Pré-requisitos

- Conta de desenvolvedor do Facebook
- Aplicativo Facebook configurado
- Conta Instagram Business ou Creator
- Permissões adequadas nas APIs

## 🚀 Configuração do Facebook Developer

### 1. Criar Aplicativo Facebook

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Clique em "Meus Aplicativos" → "Criar Aplicativo"
3. Selecione "Negócios" como tipo de aplicativo
4. Preencha as informações básicas do aplicativo

### 2. Configurar Produtos

Adicione os seguintes produtos ao seu aplicativo:

- **Instagram Basic Display API** - Para dados básicos do Instagram
- **Instagram Graph API** - Para métricas avançadas
- **Facebook Login** - Para autenticação
- **Pages API** - Para dados de páginas do Facebook

### 3. Configurar Permissões

#### Permissões do Instagram:
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_comments`
- `instagram_manage_insights`
- `pages_show_list`
- `pages_read_engagement`

#### Permissões do Facebook:
- `pages_read_engagement`
- `pages_show_list`
- `pages_manage_posts`
- `pages_read_user_content`

### 4. Obter Tokens de Acesso

#### Token de Acesso do Usuário (Instagram):
```bash
# URL de autorização
https://www.facebook.com/v18.0/dialog/oauth?
  client_id={app-id}&
  redirect_uri={redirect-uri}&
  scope=instagram_basic,instagram_content_publish,pages_show_list
```

#### Token de Acesso da Página (Facebook):
```bash
# Após obter o token do usuário, troque por um token de página
GET /{page-id}?fields=access_token&access_token={user-access-token}
```

## 🔧 Configuração das Variáveis de Ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# Instagram API
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here
INSTAGRAM_APP_ID=your_instagram_app_id_here
INSTAGRAM_APP_SECRET=your_instagram_app_secret_here
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id_here

# Facebook API
FACEBOOK_ACCESS_TOKEN=your_facebook_access_token_here
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
FACEBOOK_PAGE_ID=your_facebook_page_id_here

# Redis (opcional - para cache avançado)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

## 📊 Como Obter os IDs Necessários

### Instagram Business Account ID:
1. Acesse [Facebook Business Manager](https://business.facebook.com/)
2. Vá para "Configurações" → "Instagram"
3. Selecione sua conta Instagram
4. O ID estará na URL ou nas configurações

### Facebook Page ID:
1. Acesse sua página do Facebook
2. Vá para "Sobre" → "Informações da página"
3. O ID da página estará listado

## 🔍 Testando a Configuração

### 1. Verificar Status das APIs

No painel admin, acesse a aba "Hashtag Analytics" e verifique os indicadores de status:

- 🟢 **Verde**: API conectada e funcionando
- 🔴 **Vermelho**: API desconectada ou com erro

### 2. Testar Endpoints

```bash
# Testar Instagram
curl -X GET "http://localhost:3000/api/admin/marketing/hashtag-analytics?platform=instagram"

# Testar Facebook
curl -X GET "http://localhost:3000/api/admin/marketing/hashtag-analytics?platform=facebook"

# Testar ambas as plataformas
curl -X GET "http://localhost:3000/api/admin/marketing/hashtag-analytics?platform=all"
```

## 🛠️ Solução de Problemas

### Erro: "Invalid access token"
- Verifique se o token não expirou
- Tokens de usuário expiram em 60 dias
- Tokens de página expiram em 60 dias
- Configure renovação automática de tokens

### Erro: "Insufficient permissions"
- Verifique se todas as permissões foram aprovadas
- Algumas permissões requerem revisão do Facebook
- Verifique se o aplicativo está em modo de produção

### Erro: "Rate limit exceeded"
- O sistema implementa rate limiting automático
- Aguarde 1 hora para reset do limite
- Considere implementar cache Redis para reduzir chamadas

### Dados não aparecem
- Verifique se a conta Instagram é Business ou Creator
- Verifique se a página Facebook está conectada
- Verifique se há posts com hashtags na conta

## 🔄 Renovação Automática de Tokens

Para produção, implemente renovação automática:

```typescript
// Exemplo de renovação automática
async function refreshAccessToken(refreshToken: string) {
  const response = await fetch('https://graph.facebook.com/v18.0/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'fb_exchange_token',
      client_id: process.env.FACEBOOK_APP_ID,
      client_secret: process.env.FACEBOOK_APP_SECRET,
      fb_exchange_token: refreshToken
    })
  });
  
  return response.json();
}
```

## 📈 Monitoramento e Logs

O sistema registra logs detalhados:

```bash
# Ver logs do servidor
npm run dev

# Logs de exemplo:
# ✅ Instagram API conectada
# ✅ Facebook API conectada
# 🔍 Buscando analytics de hashtags...
# 📊 Dados obtidos com sucesso
```

## 🔒 Segurança

### Boas Práticas:
- Nunca commite tokens no código
- Use variáveis de ambiente
- Implemente rotação de tokens
- Monitore uso das APIs
- Configure webhooks para notificações

### Rate Limiting:
- Instagram: 200 requests/hour
- Facebook: 200 requests/hour
- Cache implementado para reduzir chamadas

## 📚 Recursos Adicionais

- [Facebook Graph API Documentation](https://developers.facebook.com/docs/graph-api)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Facebook Business Manager](https://business.facebook.com/)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Teste os endpoints individualmente
3. Verifique a documentação oficial
4. Consulte os fóruns de desenvolvedores

---

**Nota**: As APIs do Facebook/Instagram são sujeitas a mudanças. Mantenha-se atualizado com a documentação oficial. 