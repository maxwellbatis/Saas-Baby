import 'module-alias/register';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { specs, swaggerUi } from './config/swagger';
import paymentRoutes, { webhookRouter } from './routes/payments';

// Carregar variáveis de ambiente
dotenv.config();

// Importar configurações
import { connectDatabase, disconnectDatabase, checkDatabaseHealth } from './config/database';

// Importar rotas
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';
import userRoutes from './routes/user';
import publicRoutes from './routes/public';
import uploadRoutes from './routes/upload';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';
import healthRoutes from './routes/health';
import gamificationRoutes from './routes/gamification';
import marketingRoutes from './routes/marketing';

// Importar middlewares
import { authenticateUser, authenticateAdmin } from './middlewares/auth';

// Criar aplicação Express
const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

// Configurar rate limiting
// Limite global aumentado para facilitar testes/admin (ajuste em produção se necessário)
const limiter = rateLimit({
  windowMs: 900_000, // 15 minutos
  max: 100_000, // 100 mil requisições por IP
  message: {
    success: false,
    error: 'Muitas requisições. Tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middlewares de segurança e otimização
app.use(helmet());

// Log da URL do Frontend para debug
console.log('🔗 Frontend URL (CORS):', process.env.FRONTEND_URL || 'Não definido, usando fallback.');

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://api.babydiary.shop', 'https://admin.babydiary.shop', process.env.FRONTEND_URL].filter(Boolean) as string[]
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));
app.use(compression());
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Rota do webhook do Stripe (deve vir antes dos middlewares de parsing!)
app.use('/api/webhook/stripe', webhookRouter);

// Middlewares de parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Configurar Swagger/OpenAPI
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Baby Diary API Documentation'
}));

// Rota de saúde
app.get('/health', async (req, res) => {
  try {
    // Verificar conexão com banco de dados
    const dbHealthy = await checkDatabaseHealth();

    res.status(200).json({
      success: true,
      message: 'Servidor funcionando',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      database: dbHealthy ? 'connected' : 'disconnected',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro na verificação de saúde',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/admin', authenticateAdmin, adminRoutes);
app.use('/api/admin/marketing', authenticateAdmin, marketingRoutes);
app.use('/api/user', authenticateUser, userRoutes);
app.use('/api/public', publicRoutes);

// Outras rotas de pagamento (com autenticação)
app.use('/api/payments', authenticateUser, paymentRoutes);
app.use('/api/upload', authenticateUser, uploadRoutes);
app.use('/api/ai', authenticateUser, aiRoutes);

// Rotas de saúde
app.use('/api/health', healthRoutes);

// Rotas de gamificação
app.use('/api/gamification', gamificationRoutes);

// Middleware de tratamento de erros 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.originalUrl,
  });
});

// Middleware de tratamento de erros global
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', error);

  // Se for um erro de validação do Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      error: 'Dados duplicados. Este registro já existe.',
    });
  }

  // Se for um erro de validação do Prisma
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: 'Registro não encontrado.',
    });
  }

  // Erro genérico
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Erro interno do servidor',
  });
});

// Função para iniciar o servidor
const startServer = async () => {
  try {
    // Conectar ao banco de dados
    await connectDatabase();

    // Verificar se a porta está em uso
    const server = app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📱 API disponível em: http://localhost:${PORT}`);
      console.log(`📚 Documentação: http://localhost:${PORT}/api/docs`);
      console.log(`🔧 Painel Admin: http://localhost:${PORT}/admin`);
      console.log(`📊 Health Check: http://localhost:${PORT}/health`);
    });

    // Tratamento de erros do servidor
    server.on('error', (error: any) => {
      if (error.code === 'EADDRINUSE') {
        const nextPort = Number(PORT) + 1;
        console.error(`❌ Porta ${PORT} já está em uso. Tentando porta ${nextPort}...`);
        server.listen(nextPort);
      } else {
        console.error('❌ Erro no servidor:', error);
        process.exit(1);
      }
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 Recebido SIGTERM, fechando servidor...');
      server.close(() => {
        console.log('✅ Servidor fechado');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Função para encerrar o servidor graciosamente
const gracefulShutdown = async (signal: string) => {
  console.log(`\n📡 Recebido sinal ${signal}. Encerrando servidor...`);
  
  try {
    await disconnectDatabase();
    console.log('✅ Servidor encerrado graciosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar servidor:', error);
    process.exit(1);
  }
};

// Listeners para sinais de encerramento
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Erro não capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Iniciar servidor apenas se não estiver sendo importado
if (require.main === module) {
  startServer();
}

// Exportar a aplicação para testes
export default app; 