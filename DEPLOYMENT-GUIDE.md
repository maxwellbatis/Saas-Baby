# 🚀 Guia Completo de Deploy - Baby Diary

## 📋 Resumo da Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   babydiary.shop│    │api.babydiary.shop│    │admin.babydiary.shop│
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────┴─────────────┐
                    │         Nginx             │
                    │    (Proxy Reverso)        │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │        Frontend           │
                    │      (React/Vite)         │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │         Backend           │
                    │      (Node.js/Express)    │
                    └─────────────┬─────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │      PostgreSQL           │
                    │        (Database)         │
                    └───────────────────────────┘
```

## 🎯 Opções de Deploy

### 1. 🐳 Docker Compose (Recomendado)
- **Arquivo**: `docker-compose.yml`
- **Script**: `deploy.ps1` (Windows) ou `deploy.sh` (Linux)
- **Vantagens**: Isolamento, facilidade de deploy, consistência

### 2. 📦 Deploy Tradicional
- **Arquivo**: `nginx-production.conf`
- **Process Manager**: `ecosystem.config.js` (PM2)
- **Vantagens**: Mais controle, menor overhead

## 🚀 Deploy com Docker

### Pré-requisitos
- Docker e Docker Compose instalados
- Domínios configurados no DNS
- Variáveis de ambiente configuradas

### Passos

1. **Configurar variáveis de ambiente**
   ```bash
   cp env.production.example .env
   # Editar .env com suas configurações
   ```

2. **Executar deploy**
   ```bash
   # Windows
   .\deploy.ps1
   
   # Linux
   ./deploy.sh
   ```

3. **Configurar SSL**
   ```bash
   # Windows
   .\setup-ssl.ps1 -Email seu@email.com
   
   # Linux
   docker-compose run --rm certbot
   ```

## 🔧 Configurações Importantes

### Variáveis de Ambiente Obrigatórias
```bash
# Banco de dados
DB_PASSWORD=sua_senha_super_segura_aqui

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro_aqui

# Stripe (produção)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG...

# Cloudinary
CLOUDINARY_CLOUD_NAME=seu_cloud_name
CLOUDINARY_API_KEY=sua_api_key
CLOUDINARY_API_SECRET=sua_api_secret

# Firebase
FIREBASE_PROJECT_ID=seu_projeto_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@seu-projeto.iam.gserviceaccount.com

# Certbot (SSL)
CERTBOT_EMAIL=seu_email@exemplo.com
```

### Portas Utilizadas
- **80**: HTTP (redireciona para HTTPS)
- **443**: HTTPS
- **3000**: Backend (interno)
- **5432**: PostgreSQL (interno)

## 📊 Monitoramento

### Scripts Disponíveis
- `monitor.ps1`: Monitoramento geral
- `backup.ps1`: Backup do banco de dados
- `deploy.ps1`: Deploy automatizado

### Health Checks
- Frontend: `https://babydiary.shop/health`
- API: `https://api.babydiary.shop/health`
- Admin: `https://admin.babydiary.shop/health`

### Logs
```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

## 🔄 Atualizações

### Atualizar Código
```bash
# 1. Pull das mudanças
git pull origin main

# 2. Rebuild e restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 3. Migrations (se necessário)
docker-compose exec backend npx prisma migrate deploy
```

### Backup e Restore
```bash
# Backup
.\backup.ps1

# Restore
.\backup.ps1 -Restore -RestoreFile backups/babydiary_backup_2024-01-01_12-00-00.sql
```

## 🔒 Segurança

### Configurações Implementadas
- ✅ HTTPS forçado
- ✅ Headers de segurança (X-Frame-Options, X-XSS-Protection, etc.)
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet.js ativo
- ✅ Validação de entrada
- ✅ Firewall configurado

### SSL/TLS
- Certificados Let's Encrypt
- Renovação automática
- TLS 1.2 e 1.3
- Cipher suites seguras

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Porta 80/443 em uso**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

2. **Banco de dados não conecta**
   ```bash
   docker-compose logs postgres
   docker-compose exec backend npx prisma db push
   ```

3. **SSL não funciona**
   ```bash
   docker-compose logs nginx
   docker-compose logs certbot
   ```

4. **Uploads não funcionam**
   ```bash
   sudo chown -R 1000:1000 uploads/
   ```

### Comandos Úteis
```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Executar comando no container
docker-compose exec backend npm run migrate

# Backup do banco
docker-compose exec postgres pg_dump -U babydiary_user babydiary > backup.sql

# Restore do banco
docker-compose exec -T postgres psql -U babydiary_user babydiary < backup.sql
```

## 📈 Performance

### Otimizações Implementadas
- **Cache do Nginx**: Assets estáticos com cache de 1 ano
- **Gzip**: Compressão ativada
- **Rate Limiting**: Proteção contra spam
- **Security Headers**: Headers de segurança configurados
- **Docker**: Containers otimizados

### Monitoramento de Recursos
```bash
# Uso de recursos
docker stats

# Logs de performance
docker-compose logs nginx | grep "response_time"
```

## 🔄 CI/CD

### GitHub Actions
- **Arquivo**: `.github/workflows/deploy.yml`
- **Trigger**: Push para branch main
- **Ações**: Test, build, deploy automático

### Configuração
1. Adicionar secrets no GitHub:
   - `HOST`: IP do servidor
   - `USERNAME`: Usuário SSH
   - `SSH_KEY`: Chave SSH privada

2. Configurar deploy automático

## 📞 Suporte

### Logs Importantes
- **Nginx**: `docker-compose logs nginx`
- **Backend**: `docker-compose logs backend`
- **Frontend**: `docker-compose logs frontend`
- **Banco**: `docker-compose logs postgres`

### Contatos
- Verificar logs: `docker-compose logs`
- Health checks: URLs mencionadas acima
- Backup: Sempre fazer backup antes de atualizações

---

## 🎉 Próximos Passos

1. **Configurar domínios no DNS**
2. **Preparar variáveis de ambiente**
3. **Executar deploy inicial**
4. **Configurar SSL**
5. **Testar todas as funcionalidades**
6. **Configurar monitoramento**
7. **Configurar backup automático**

**🚀 Seu Baby Diary está pronto para produção!** 