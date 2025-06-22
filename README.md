# 👶 Baby Diary - Diário Digital para Bebês

Um aplicativo completo para acompanhar o desenvolvimento do seu bebê, com recursos de IA, gamificação e compartilhamento familiar.

## 🌟 Características

- 📱 **Interface moderna e responsiva**
- 🤖 **IA integrada** para dicas personalizadas
- 🏆 **Sistema de gamificação** com pontos e badges
- 👨‍👩‍👧‍👦 **Compartilhamento familiar** seguro
- 📊 **Analytics e relatórios** detalhados
- 🔔 **Notificações inteligentes**
- 💳 **Sistema de assinaturas** com Stripe
- 📸 **Upload de fotos** com Cloudinary
- 🔒 **Autenticação segura** com JWT
- 📈 **Acompanhamento de marcos** e crescimento

## 🏗️ Arquitetura

### Backend
- **Node.js** com Express
- **PostgreSQL** com Prisma ORM
- **Redis** para cache (opcional)
- **JWT** para autenticação
- **Stripe** para pagamentos
- **SendGrid** para emails
- **Cloudinary** para imagens
- **Firebase** para notificações push

### Frontend
- **React** com TypeScript
- **Vite** para build
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes
- **React Router** para navegação
- **React Query** para cache
- **Zustand** para estado global

## 🚀 Deploy

### Pré-requisitos
- Docker e Docker Compose
- Domínios configurados
- Contas nos serviços externos

### Deploy Rápido

1. **Clone o repositório**
   ```bash
   git clone https://github.com/maxwellbatis/babydiary.git
   cd babydiary
   ```

2. **Configure as variáveis de ambiente**
   ```bash
   cp env.production.example .env
   # Edite o arquivo .env com suas configurações
   ```

3. **Execute o deploy**
   ```bash
   # Windows
   .\deploy.ps1
   
   # Linux
   ./deploy.sh
   ```

4. **Configure SSL**
   ```bash
   # Windows
   .\setup-ssl.ps1 -Email seu@email.com
   
   # Linux
   docker-compose run --rm certbot
   ```

### Deploy Manual

```bash
# Build e iniciar
docker-compose up -d

# Executar migrations
docker-compose exec backend npx prisma migrate deploy

# Executar seed
docker-compose exec backend npx prisma db seed
```

## 📋 Planos de Assinatura

### 🆓 Básico (Gratuito)
- 1 bebê
- 10 memórias por mês
- 5 marcos por mês
- 10 atividades por mês
- 10 interações com IA por semana

### 👑 Premium
- 3 bebês
- 100 memórias por mês
- 50 marcos por mês
- 100 atividades por mês
- 100 interações com IA por semana
- Analytics avançados
- Backup automático

### 👨‍👩‍👧‍👦 Família
- 5 bebês
- Memórias ilimitadas
- Marcos ilimitados
- Atividades ilimitadas
- IA ilimitada
- Compartilhamento familiar
- Todos os recursos Premium

## 🔧 Desenvolvimento

### Instalação Local

1. **Backend**
   ```bash
   cd src
   npm install
   cp .env.example .env
   npx prisma migrate dev
   npx prisma db seed
   npm run dev
   ```

2. **Frontend**
   ```bash
   cd baby-diary-user-panel
   npm install
   cp .env.example .env
   npm run dev
   ```

### Scripts Úteis

```bash
# Backup do banco
.\backup.ps1

# Monitoramento
.\monitor.ps1

# Atualizar
git pull && docker-compose up -d --build
```

## 📊 Monitoramento

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
```

## 🔒 Segurança

- ✅ HTTPS forçado
- ✅ Headers de segurança
- ✅ Rate limiting
- ✅ Validação de entrada
- ✅ Autenticação JWT
- ✅ CORS configurado
- ✅ Sanitização de dados

## 📈 Analytics

- 📊 Uso de recursos por plano
- 👥 Engajamento dos usuários
- 💰 Métricas de assinatura
- 🤖 Uso da IA
- 📱 Atividades mais populares

## 🛠️ Tecnologias

### Backend
- Node.js
- Express
- PostgreSQL
- Prisma
- JWT
- Stripe
- SendGrid
- Cloudinary
- Firebase

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui
- React Query
- Zustand

### DevOps
- Docker
- Docker Compose
- Nginx
- Let's Encrypt
- GitHub Actions

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

- 📧 Email: suporte@babydiary.shop
- 🌐 Website: https://babydiary.shop
- 📱 App: Disponível na App Store e Google Play

## 🎉 Agradecimentos

- [Shadcn/ui](https://ui.shadcn.com/) pelos componentes
- [Tailwind CSS](https://tailwindcss.com/) pelo framework CSS
- [Prisma](https://www.prisma.io/) pelo ORM
- [Vite](https://vitejs.dev/) pelo bundler

---

**Desenvolvido com ❤️ para ajudar pais a acompanhar o desenvolvimento de seus bebês** 