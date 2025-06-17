# 🍼 Baby Diary - Backend API

> **Sistema completo de diário digital para acompanhamento do desenvolvimento de bebês**

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração e Instalação](#configuração-e-instalação)
- [Banco de Dados](#banco-de-dados)
- [API Endpoints](#api-endpoints)
- [Autenticação e Segurança](#autenticação-e-segurança)
- [Funcionalidades](#funcionalidades)
- [Deploy](#deploy)
- [Contribuição](#contribuição)

## 🎯 Sobre o Projeto

O **Baby Diary** é uma API completa para um sistema SaaS de diário digital que permite aos pais acompanhar o desenvolvimento de seus bebês. O sistema oferece funcionalidades avançadas como registro de atividades, memórias, marcos de desenvolvimento, integração com IA, sistema de pagamentos e muito mais.

### ✨ Principais Funcionalidades

- 📝 **Registro de Atividades**: Sono, alimentação, troca de fraldas, peso, etc.
- 🧠 **Assistente IA**: Análises personalizadas e sugestões baseadas em IA
- 💳 **Sistema de Pagamentos**: Integração com Stripe para assinaturas
- 👨‍👩‍👧‍👦 **Colaboração Familiar**: Compartilhamento com familiares
- 📊 **Analytics**: Relatórios e estatísticas detalhadas
- 🔔 **Notificações**: Sistema de notificações push e email
- 🎮 **Gamificação**: Sistema de pontos, badges e conquistas
- 📱 **Upload de Imagens**: Integração com Cloudinary
- 🔒 **Segurança**: Autenticação JWT e criptografia

## 🛠 Tecnologias Utilizadas

### Backend
- **Node.js** + **TypeScript** - Runtime e linguagem
- **Express.js** - Framework web
- **Prisma** - ORM para banco de dados
- **PostgreSQL** - Banco de dados principal
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas

### Integrações
- **Stripe** - Pagamentos e assinaturas
- **Cloudinary** - Upload e otimização de imagens
- **Firebase Admin** - Notificações push
- **Groq AI** - Funcionalidades de inteligência artificial

### Ferramentas de Desenvolvimento
- **ESLint** + **Prettier** - Linting e formatação
- **Jest** - Testes
- **Swagger** - Documentação da API
- **Nodemon** - Hot reload em desenvolvimento

## 📁 Estrutura do Projeto

```
baby-diary-backend/
├── src/
│   ├── config/           # Configurações (banco, stripe, etc.)
│   ├── controllers/      # Controladores da API
│   ├── middlewares/      # Middlewares (auth, validação)
│   ├── routes/           # Rotas da API
│   ├── services/         # Lógica de negócio
│   ├── types/           # Tipos TypeScript
│   ├── utils/           # Utilitários
│   └── index.ts         # Arquivo principal
├── prisma/
│   ├── schema.prisma    # Schema do banco de dados
│   └── seed.ts         # Dados iniciais
├── scripts/            # Scripts utilitários
├── docs/              # Documentação adicional
└── package.json       # Dependências
```

## ⚙️ Configuração e Instalação

### Pré-requisitos

- Node.js 18+ 
- PostgreSQL 12+
- npm ou yarn

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/baby-diary-backend.git
cd baby-diary-backend
```

### 2. Instale as Dependências

```bash
npm install
```

### 3. Configure as Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env`:

```bash
cp env.example .env
```

Configure as variáveis no arquivo `.env`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/baby_diary_db"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# Cloudinary
CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"

# Stripe
STRIPE_SECRET_KEY="sk_test_sua_chave_stripe"
STRIPE_WEBHOOK_SECRET="whsec_seu_webhook_secret"

# Groq AI
GROQ_API_KEY="gsk_sua_chave_groq"

# Admin Default
ADMIN_EMAIL="admin@babydiary.com"
ADMIN_PASSWORD="admin123"
```

### 4. Configure o Banco de Dados

```bash
# Gerar cliente Prisma
npm run db:generate

# Executar migrações
npm run db:migrate

# Executar seed (dados iniciais)
npm run db:seed
```

### 5. Inicie o Servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

## 🗄️ Banco de Dados

### Schema Principal

O banco de dados utiliza PostgreSQL com Prisma ORM. Principais tabelas:

#### 👤 Usuários e Autenticação
- **User**: Usuários do sistema
- **Admin**: Administradores
- **Plan**: Planos de assinatura
- **Subscription**: Assinaturas dos usuários

#### 👶 Funcionalidades do Bebê
- **Baby**: Dados dos bebês
- **Activity**: Atividades registradas
- **Memory**: Memórias especiais
- **Milestone**: Marcos de desenvolvimento
- **GrowthRecord**: Registros de crescimento
- **SleepRecord**: Registros de sono
- **FeedingRecord**: Registros de alimentação
- **DiaperRecord**: Registros de fraldas
- **WeightRecord**: Registros de peso
- **VaccinationRecord**: Registros de vacinação

#### 🎮 Gamificação e Analytics
- **Gamification**: Sistema de pontos e badges
- **GamificationRule**: Regras de gamificação
- **UserAnalytics**: Analytics do usuário
- **SystemAnalytics**: Analytics do sistema

#### 🔔 Notificações e IA
- **Notification**: Notificações do sistema
- **NotificationTemplate**: Templates de notificação
- **AIInteraction**: Interações com IA
- **DeviceToken**: Tokens para notificações push

#### 👨‍👩‍👧‍👦 Colaboração Familiar
- **FamilyMember**: Membros da família
- **EmergencyContact**: Contatos de emergência

### Comandos do Banco

```bash
# Ver banco no Prisma Studio
npm run db:studio

# Resetar banco (cuidado!)
npm run db:reset

# Deploy em produção
npm run db:deploy
```

## 🔌 API Endpoints

### 🔐 Autenticação (`/api/auth`)

#### POST `/api/auth/register`
**Registrar novo usuário**

**Body:**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário registrado com sucesso - Plano Básico gratuito ativado!",
  "data": {
    "user": {
      "id": "user_id",
      "name": "João Silva",
      "email": "joao@email.com",
      "plan": { /* dados do plano */ }
    },
    "token": "jwt_token"
  }
}
```

#### POST `/api/auth/login`
**Login de usuário**

**Body:**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": { /* dados do usuário */ },
    "token": "jwt_token"
  }
}
```

#### GET `/api/auth/me`
**Obter perfil do usuário logado**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "João Silva",
    "email": "joao@email.com",
    "plan": { /* dados do plano */ },
    "babies": [ /* lista de bebês */ ]
  }
}
```

### 🌐 Público (`/api/public`)

#### GET `/api/public/landing-page`
**Obter conteúdo da landing page**

**Response:**
```json
{
  "success": true,
  "data": {
    "heroTitle": "Seu diário digital para acompanhar o bebê",
    "heroSubtitle": "Registre atividades, memórias e marcos importantes...",
    "features": [ /* lista de features */ ],
    "testimonials": [ /* depoimentos */ ],
    "faq": [ /* perguntas frequentes */ ],
    "stats": [ /* estatísticas */ ]
  }
}
```

#### GET `/api/public/plans`
**Listar planos disponíveis**

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "plan_id",
      "name": "Básico",
      "price": 0,
      "features": [ /* lista de features */ ],
      "userLimit": 1,
      "memoryLimit": 10
    }
  ]
}
```

### 👶 Usuário (`/api/user`)

#### GET `/api/user/babies`
**Listar bebês do usuário**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "baby_id",
      "name": "Maria",
      "gender": "female",
      "birthDate": "2023-01-15T00:00:00.000Z",
      "photoUrl": "https://...",
      "isActive": true
    }
  ]
}
```

#### POST `/api/user/babies`
**Criar novo bebê**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "name": "Maria",
  "gender": "female",
  "birthDate": "2023-01-15",
  "photoUrl": "https://..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bebê adicionado com sucesso",
  "data": {
    "id": "baby_id",
    "name": "Maria",
    "gender": "female",
    "birthDate": "2023-01-15T00:00:00.000Z"
  }
}
```

#### GET `/api/user/babies/:id`
**Buscar bebê específico**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "baby_id",
    "name": "Maria",
    "activities": [ /* atividades do bebê */ ],
    "memories": [ /* memórias */ ],
    "milestones": [ /* marcos */ ],
    "growthRecords": [ /* registros de crescimento */ ]
  }
}
```

#### PUT `/api/user/babies/:id`
**Atualizar bebê**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "name": "Maria Silva",
  "photoUrl": "https://nova-foto.jpg"
}
```

#### DELETE `/api/user/babies/:id`
**Remover bebê (soft delete)**

**Headers:**
```
Authorization: Bearer jwt_token
```

### 📝 Atividades

#### GET `/api/user/babies/:babyId/activities`
**Listar atividades de um bebê**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Query Parameters:**
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 20)
- `type`: Tipo de atividade (opcional)

**Response:**
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "activity_id",
        "type": "sleep",
        "title": "Sono da tarde",
        "description": "Dormiu por 2 horas",
        "date": "2023-12-01T14:00:00.000Z",
        "duration": 120,
        "notes": "Dormiu bem"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
}
```

#### POST `/api/user/activities`
**Criar nova atividade**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "type": "sleep",
  "title": "Sono da tarde",
  "description": "Dormiu por 2 horas",
  "babyId": "baby_id",
  "date": "2023-12-01T14:00:00.000Z",
  "duration": 120,
  "notes": "Dormiu bem",
  "photoUrl": "https://..."
}
```

#### PUT `/api/user/activities/:id`
**Atualizar atividade**

#### DELETE `/api/user/activities/:id`
**Deletar atividade**

### 🧠 IA (`/api/ai`)

#### POST `/api/ai/chat`
**Chat com assistente IA**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "message": "Como posso melhorar o sono do meu bebê?",
  "babyAge": 6
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Com base na idade do seu bebê (6 meses), recomendo...",
    "context": {
      "babyAge": 6,
      "babyCount": 1
    }
  }
}
```

#### POST `/api/ai/analyze-sleep`
**Análise de padrões de sono**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "babyId": "baby_id",
  "days": 7
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "Análise do sono do Maria nos últimos 7 dias...",
    "statistics": {
      "totalRecords": 7,
      "averageSleep": 480,
      "averageSleepFormatted": "8h 0min",
      "period": "7 dias"
    }
  }
}
```

#### POST `/api/ai/suggest-activities`
**Sugestões de atividades**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "babyId": "baby_id",
  "category": "motor"
}
```

### 💳 Pagamentos (`/api/payments`)

#### POST `/api/payments/create-checkout-session`
**Criar sessão de checkout**

**Headers:**
```
Authorization: Bearer jwt_token
```

**Body:**
```json
{
  "planId": "plan_id",
  "successUrl": "https://app.com/success",
  "cancelUrl": "https://app.com/cancel"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "cs_session_id",
    "url": "https://checkout.stripe.com/..."
  }
}
```

#### GET `/api/payments/subscription`
**Obter assinatura do usuário**

#### POST `/api/payments/cancel-subscription`
**Cancelar assinatura**

#### POST `/api/payments/reactivate-subscription`
**Reativar assinatura**

### 📤 Upload (`/api/upload`)

#### POST `/api/upload/image`
**Upload de imagem**

**Headers:**
```
Authorization: Bearer jwt_token
Content-Type: multipart/form-data
```

**Body:**
```
file: [arquivo de imagem]
folder: "babies" (opcional)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...",
    "publicId": "folder/image_id",
    "secureUrl": "https://res.cloudinary.com/..."
  }
}
```

### 🔔 Notificações (`/api/notifications`)

#### GET `/api/notifications`
**Listar notificações do usuário**

#### POST `/api/notifications/register-device`
**Registrar token de dispositivo**

#### POST `/api/notifications/mark-read/:id`
**Marcar notificação como lida**

### 👨‍💼 Admin (`/api/admin`)

#### GET `/api/admin/users`
**Listar usuários (admin)**

#### GET `/api/admin/analytics`
**Obter analytics do sistema**

#### POST `/api/admin/plans`
**Criar novo plano**

#### PUT `/api/admin/landing-page`
**Atualizar conteúdo da landing page**

## 🔐 Autenticação e Segurança

### JWT (JSON Web Tokens)

O sistema utiliza JWT para autenticação. Tokens são enviados no header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Middlewares de Segurança

- **Helmet**: Headers de segurança
- **CORS**: Controle de origem
- **Rate Limiting**: Limite de requisições
- **Compression**: Compressão de resposta
- **Validation**: Validação de dados

### Validação de Dados

Todos os endpoints utilizam `express-validator` para validação:

```typescript
const validation = [
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 8 }).withMessage('Senha muito curta')
];
```

## 🎮 Funcionalidades Avançadas

### Sistema de Gamificação

- **Pontos**: Acumulados por atividades
- **Badges**: Conquistas especiais
- **Níveis**: Baseados em pontos
- **Streaks**: Sequências de atividades

### Analytics e Relatórios

- **Crescimento**: Curvas de crescimento da OMS
- **Sono**: Padrões e qualidade
- **Alimentação**: Frequência e quantidade
- **Marcos**: Acompanhamento de desenvolvimento

### Integração com IA

- **Análise de Sono**: Padrões e recomendações
- **Dicas de Alimentação**: Baseadas na idade
- **Previsão de Marcos**: Próximos marcos esperados
- **Interpretação de Choro**: Possíveis causas
- **Conselhos Personalizados**: Baseados no contexto

### Sistema de Notificações

- **Push**: Notificações em tempo real
- **Email**: Lembretes e atualizações
- **SMS**: Notificações críticas
- **Agendamento**: Notificações programadas

## 🚀 Deploy

### Railway (Recomendado)

1. Conecte seu repositório ao Railway
2. Configure as variáveis de ambiente
3. Deploy automático

### Heroku

```bash
# Instalar Heroku CLI
heroku create baby-diary-api
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set NODE_ENV=production
git push heroku main
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoramento

### Health Check

```
GET /health
```

**Response:**
```json
{
  "success": true,
  "message": "Servidor funcionando",
  "timestamp": "2023-12-01T10:00:00.000Z",
  "environment": "production",
  "database": "connected"
}
```

### Logs

O sistema utiliza Morgan para logging:

- **Desenvolvimento**: Logs detalhados
- **Produção**: Logs compactos

### Métricas

- **Uptime**: Disponibilidade do serviço
- **Performance**: Tempo de resposta
- **Erros**: Taxa de erro
- **Uso**: Requisições por minuto

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes em modo watch
npm run test:watch

# Cobertura de testes
npm run test:coverage
```

## 📚 Documentação da API

Acesse a documentação interativa:

```
http://localhost:3000/api/docs
```

## 🔧 Scripts Úteis

```bash
# Desenvolvimento
npm run dev          # Iniciar em modo desenvolvimento
npm run build        # Compilar TypeScript
npm run lint         # Verificar código
npm run lint:fix     # Corrigir problemas de linting
npm run format       # Formatar código

# Banco de dados
npm run db:migrate   # Executar migrações
npm run db:seed      # Popular banco com dados iniciais
npm run db:studio    # Abrir Prisma Studio
npm run db:reset     # Resetar banco (cuidado!)

# Deploy
npm run build        # Compilar para produção
npm start           # Iniciar em produção
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

- **Email**: support@babydiary.com
- **Documentação**: [docs.babydiary.com](https://docs.babydiary.com)
- **Issues**: [GitHub Issues](https://github.com/seu-usuario/baby-diary-backend/issues)

## 🙏 Agradecimentos

- **Prisma** - ORM incrível
- **Stripe** - Pagamentos seguros
- **Cloudinary** - Gerenciamento de imagens
- **Groq** - IA de alta performance
- **Firebase** - Notificações push

---

**Desenvolvido com ❤️ pela equipe Baby Diary** 