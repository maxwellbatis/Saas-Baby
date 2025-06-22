# Configuração do SendGrid para Baby Diary

Este guia explica como configurar o SendGrid para envio de emails no sistema Baby Diary.

## 📋 Pré-requisitos

1. Conta no SendGrid (gratuita até 100 emails/dia)
2. Domínio verificado no SendGrid
3. Chave API do SendGrid

## 🚀 Passo a Passo

### 1. Criar conta no SendGrid

1. Acesse [sendgrid.com](https://sendgrid.com)
2. Clique em "Start for Free"
3. Preencha os dados e confirme seu email
4. Complete a verificação de identidade

### 2. Verificar domínio (Recomendado)

Para melhor deliverability, verifique seu domínio:

1. No painel do SendGrid, vá em **Settings > Sender Authentication**
2. Clique em **Domain Authentication**
3. Adicione seu domínio (ex: `babydiary.com`)
4. Configure os registros DNS conforme instruções
5. Aguarde a verificação (pode levar até 48h)

### 3. Verificar email remetente

1. Vá em **Settings > Sender Authentication**
2. Clique em **Single Sender Verification**
3. Adicione o email que será usado como remetente
4. Confirme o email clicando no link recebido

### 4. Criar chave API

1. Vá em **Settings > API Keys**
2. Clique em **Create API Key**
3. Escolha **Full Access** ou **Restricted Access** (recomendado)
4. Copie a chave API gerada

### 5. Configurar variáveis de ambiente

Adicione as seguintes variáveis ao seu arquivo `.env`:

```env
# SendGrid Email
SENDGRID_API_KEY="SG.sua_chave_api_aqui"
SENDGRID_FROM_EMAIL="noreply@seu-dominio.com"
SENDGRID_FROM_NAME="Baby Diary"
SENDGRID_REPLY_TO="suporte@seu-dominio.com"

# SendGrid Templates (opcional)
SENDGRID_TEMPLATE_RESET_PASSWORD="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_TEMPLATE_WELCOME="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_TEMPLATE_SUBSCRIPTION="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_TEMPLATE_FAMILY_INVITE="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
SENDGRID_TEMPLATE_MILESTONE="d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

### 6. Criar templates (Opcional)

Para emails mais profissionais, crie templates no SendGrid:

1. Vá em **Email API > Dynamic Templates**
2. Clique em **Create Template**
3. Crie templates para:
   - **Reset Password**: Email de recuperação de senha
   - **Welcome**: Email de boas-vindas
   - **Subscription**: Confirmação de assinatura
   - **Family Invite**: Convite para família
   - **Milestone**: Lembretes de marcos

#### Exemplo de Template de Recuperação de Senha

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Redefinir Senha - Baby Diary</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #8b5cf6, #ec4899); padding: 30px; border-radius: 10px; text-align: center;">
        <h1 style="color: white; margin: 0;">Baby Diary</h1>
        <p style="color: white; margin: 10px 0 0 0;">Redefinir sua senha</p>
    </div>
    
    <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
        <h2>Olá, {{name}}!</h2>
        <p>Recebemos uma solicitação para redefinir sua senha no Baby Diary.</p>
        
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{reset_link}}" style="background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Redefinir Senha
            </a>
        </div>
        
        <p><strong>Este link expira em {{expires_in}}.</strong></p>
        
        <p>Se você não solicitou esta redefinição, ignore este email.</p>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
        
        <p style="color: #6b7280; font-size: 14px;">
            Precisa de ajuda? Entre em contato: {{support_email}}
        </p>
    </div>
</body>
</html>
```

### 7. Testar configuração

Execute o script de teste:

```bash
npm run test:email
```

Ou teste manualmente via API:

```bash
curl -X POST http://localhost:3000/api/auth/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_ADMIN" \
  -d '{"email": "seu-email@exemplo.com"}'
```

## 🔧 Configurações Avançadas

### Rate Limiting

O SendGrid tem limites por conta:
- **Free**: 100 emails/dia
- **Essentials**: 50k emails/mês
- **Pro**: 100k emails/mês
- **Premier**: Personalizado

### Webhooks

Para monitorar entregas, configure webhooks:

1. Vá em **Settings > Mail Settings**
2. Configure **Event Webhook**
3. Adicione URL: `https://seu-dominio.com/api/webhooks/sendgrid`

### Autenticação SPF/DKIM

Para melhor deliverability, configure:

1. **SPF**: Adicione `include:sendgrid.net` ao seu DNS
2. **DKIM**: Configure via SendGrid Domain Authentication

## 🐛 Troubleshooting

### Emails não chegam

1. Verifique se o domínio está verificado
2. Confirme se a chave API está correta
3. Verifique os logs do SendGrid
4. Teste com email simples primeiro

### Erro de autenticação

1. Verifique se o email remetente está verificado
2. Confirme se a chave API tem permissões corretas
3. Verifique se não há restrições de IP

### Templates não funcionam

1. Confirme se o ID do template está correto
2. Verifique se as variáveis estão sendo passadas
3. Teste o template no painel do SendGrid

## 📊 Monitoramento

### Dashboard do SendGrid

- **Activity**: Visualize emails enviados
- **Statistics**: Métricas de entrega
- **Bounces**: Emails que falharam
- **Spam Reports**: Relatórios de spam

### Logs da Aplicação

O sistema registra logs detalhados:

```bash
# Ver logs de email
grep "Email" logs/app.log

# Ver erros de envio
grep "Erro ao enviar email" logs/app.log
```

## 🔒 Segurança

### Boas Práticas

1. **Nunca** compartilhe sua chave API
2. Use chaves API com permissões restritas
3. Monitore logs de atividade
4. Configure alertas para uso anormal
5. Rotacione chaves API periodicamente

### Compliance

- **GDPR**: Configure opt-out em todos os emails
- **CAN-SPAM**: Inclua endereço físico e opt-out
- **LGPD**: Siga as diretrizes brasileiras

## 📞 Suporte

- **SendGrid Support**: [support.sendgrid.com](https://support.sendgrid.com)
- **Documentação**: [docs.sendgrid.com](https://docs.sendgrid.com)
- **Status**: [status.sendgrid.com](https://status.sendgrid.com)

---

**Nota**: Este guia assume que você está usando a versão mais recente do sistema Baby Diary. Para dúvidas específicas, consulte a documentação do SendGrid ou entre em contato com o suporte. 