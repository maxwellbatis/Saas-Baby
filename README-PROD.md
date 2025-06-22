# 🚀 Deploy em Produção - Baby Diary

Este guia explica como fazer o deploy do Baby Diary em produção usando Docker e Docker Compose.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Domínios configurados:
  - `babydiary.shop` (frontend)
  - `api.babydiary.shop` (backend)
  - `admin.babydiary.shop` (painel admin)
- DNS apontando para o servidor

## 🏗️ Arquitetura

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

## 🔧 Configuração

### 1. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp env.production.example .env

# Editar com suas configurações
nano .env
```

### 2. Variáveis obrigatórias

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

## 🚀 Deploy

### Deploy inicial

```bash
# Dar permissão de execução
chmod +x deploy.sh

# Executar deploy
./deploy.sh
```

### Deploy manual

```bash
# 1. Parar containers
docker-compose down

# 2. Build das imagens
docker-compose build --no-cache

# 3. Iniciar serviços
docker-compose up -d

# 4. Executar migrations
docker-compose exec backend npx prisma migrate deploy

# 5. Executar seed
docker-compose exec backend npx prisma db seed
```

## 🔒 SSL/HTTPS

### Configurar certificados SSL

```bash
# 1. Certifique-se de que os domínios apontam para o servidor
# 2. Executar certbot
docker-compose run --rm certbot

# 3. Reiniciar nginx
docker-compose restart nginx
```

### Renovar certificados (automático)

```bash
# Adicionar ao crontab para renovação automática
0 12 * * * docker-compose run --rm certbot renew && docker-compose restart nginx
```

## 📊 Monitoramento

### Verificar status

```bash
# Status dos containers
docker-compose ps

# Logs em tempo real
docker-compose logs -f

# Logs de um serviço específico
docker-compose logs -f backend
```

### Health checks

- Frontend: `https://babydiary.shop/health`
- API: `https://api.babydiary.shop/health`
- Admin: `https://admin.babydiary.shop/health`

## 🔄 Atualizações

### Atualizar código

```bash
# 1. Fazer pull das mudanças
git pull origin main

# 2. Rebuild e restart
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 3. Executar migrations se necessário
docker-compose exec backend npx prisma migrate deploy
```

### Backup do banco

```bash
# Backup
docker-compose exec postgres pg_dump -U babydiary_user babydiary > backup.sql

# Restore
docker-compose exec -T postgres psql -U babydiary_user babydiary < backup.sql
```

## 🛠️ Troubleshooting

### Problemas comuns

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
   # Verificar permissões
   sudo chown -R 1000:1000 uploads/
   ```

### Logs importantes

```bash
# Nginx
docker-compose logs nginx

# Backend
docker-compose logs backend

# Frontend
docker-compose logs frontend

# Banco de dados
docker-compose logs postgres
```

## 📈 Performance

### Otimizações

1. **Cache do Nginx**: Configurado para assets estáticos
2. **Gzip**: Compressão ativada
3. **Rate Limiting**: Proteção contra spam
4. **Security Headers**: Headers de segurança configurados

### Monitoramento

```bash
# Uso de recursos
docker stats

# Logs de performance
docker-compose logs nginx | grep "response_time"
```

## 🔐 Segurança

### Configurações de segurança

- ✅ HTTPS forçado
- ✅ Headers de segurança
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Helmet.js ativo
- ✅ Validação de entrada

### Firewall

```bash
# Abrir apenas portas necessárias
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 22
sudo ufw enable
```

## 📞 Suporte

Para problemas ou dúvidas:
- Verificar logs: `docker-compose logs`
- Health checks: URLs de health mencionadas acima
- Backup: Sempre fazer backup antes de atualizações

---

**🎉 Seu Baby Diary está pronto para produção!** 