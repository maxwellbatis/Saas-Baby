import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';

const prisma = new PrismaClient();

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados...');

    // 1. Criar admin padrão
    const adminExists = await prisma.admin.findUnique({
      where: { email: 'admin@babydiary.com' },
    });

    if (!adminExists) {
      const hashedPassword = await hashPassword('admin123');
      await prisma.admin.create({
        data: {
          email: 'admin@babydiary.com',
          password: hashedPassword,
          name: 'Administrador',
          role: 'super_admin',
        },
      });
      console.log('✅ Admin padrão criado');
    }

    // 2. Criar planos padrão
    const plans = [
      {
        name: 'Básico',
        price: 0,
        yearlyPrice: 0,
        features: ['1 bebê', '10 memórias por mês', 'Fotos em baixa resolução', 'Backup básico'],
        userLimit: 1,
        memoryLimit: 10,
        photoQuality: 'low',
        familySharing: 0,
        exportFeatures: false,
        prioritySupport: false,
        aiFeatures: false,
        offlineMode: false,
        stripePriceId: 'price_basic_free',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Premium',
        price: 19.90,
        yearlyPrice: 199.90,
        features: ['Até 5 bebês', 'Memórias ilimitadas', 'Fotos em alta resolução', 'Backup completo', 'Suporte prioritário'],
        userLimit: 5,
        memoryLimit: null,
        photoQuality: 'high',
        familySharing: 5,
        exportFeatures: true,
        prioritySupport: true,
        aiFeatures: true,
        offlineMode: true,
        stripePriceId: 'price_premium_monthly',
        stripeYearlyPriceId: 'price_premium_yearly',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Família',
        price: 29.90,
        yearlyPrice: 299.90,
        features: ['Bebês ilimitados', 'Todas as funcionalidades', 'Compartilhamento ilimitado', 'Álbuns impressos', 'Suporte VIP'],
        userLimit: 999,
        memoryLimit: null,
        photoQuality: 'high',
        familySharing: 999,
        exportFeatures: true,
        prioritySupport: true,
        aiFeatures: true,
        offlineMode: true,
        stripePriceId: 'price_family_monthly',
        stripeYearlyPriceId: 'price_family_yearly',
        isActive: true,
        sortOrder: 3,
      },
    ];

    for (const planData of plans) {
      const planExists = await prisma.plan.findUnique({
        where: { stripePriceId: planData.stripePriceId },
      });

      if (!planExists) {
        await prisma.plan.create({
          data: planData,
        });
        console.log(`✅ Plano ${planData.name} criado`);
      }
    }

    // 3. Criar templates de notificação padrão
    const templates = [
      {
        id: 'welcome_email',
        name: 'welcome_email',
        type: 'email',
        subject: 'Bem-vindo ao Baby Diary!',
        body: 'Olá {{name}}, seja bem-vindo ao Baby Diary! Estamos felizes em tê-lo conosco.',
        isActive: true,
        variables: ['name', 'email'],
      },
      {
        id: 'subscription_canceled',
        name: 'subscription_canceled',
        type: 'email',
        subject: 'Assinatura Cancelada',
        body: 'Olá {{name}}, sua assinatura foi cancelada. Esperamos vê-lo de volta em breve!',
        isActive: true,
        variables: ['name', 'email'],
      },
      {
        id: 'new_badge',
        name: 'new_badge',
        type: 'push',
        subject: 'Novo Badge Conquistado!',
        body: 'Parabéns! Você conquistou o badge {{badgeName}}!',
        isActive: true,
        variables: ['badgeName', 'points'],
      },
    ];

    for (const templateData of templates) {
      const templateExists = await prisma.notificationTemplate.findUnique({
        where: { id: templateData.id },
      });

      if (!templateExists) {
        await prisma.notificationTemplate.create({
          data: templateData,
        });
        console.log(`✅ Template ${templateData.name} criado`);
      }
    }

    // 4. Criar regras de gamificação padrão
    const gamificationRules = [
      {
        name: 'Primeiro Login',
        description: 'Faça seu primeiro login no app',
        points: 10,
        condition: 'first_login',
        badgeIcon: '🌟',
        category: 'milestone',
        isActive: true,
        sortOrder: 1,
      },
      {
        name: 'Login Diário',
        description: 'Faça login por 7 dias seguidos',
        points: 50,
        condition: 'login_streak_7',
        badgeIcon: '🔥',
        category: 'daily',
        isActive: true,
        sortOrder: 2,
      },
      {
        name: 'Primeiro Bebê',
        description: 'Cadastre seu primeiro bebê',
        points: 25,
        condition: 'first_baby',
        badgeIcon: '👶',
        category: 'milestone',
        isActive: true,
        sortOrder: 3,
      },
      {
        name: 'Memória Especial',
        description: 'Registre 10 memórias',
        points: 30,
        condition: 'memories_10',
        badgeIcon: '📸',
        category: 'milestone',
        isActive: true,
        sortOrder: 4,
      },
    ];

    for (const ruleData of gamificationRules) {
      const ruleExists = await prisma.gamificationRule.findFirst({
        where: { name: ruleData.name },
      });

      if (!ruleExists) {
        await prisma.gamificationRule.create({
          data: ruleData,
        });
        console.log(`✅ Regra ${ruleData.name} criada`);
      }
    }

    // 5. Criar conteúdo padrão da landing page
    const landingPageExists = await prisma.landingPageContent.findUnique({
      where: { id: 1 },
    });

    if (!landingPageExists) {
      await prisma.landingPageContent.create({
        data: {
          id: 1,
          heroTitle: 'Baby Diary - Seu Diário Digital',
          heroSubtitle: 'Acompanhe cada momento especial do desenvolvimento do seu bebê',
          features: [
            {
              title: 'Diário Completo',
              description: 'Registre atividades, memórias e marcos importantes',
              icon: '📝',
            },
            {
              title: 'Curva de Crescimento',
              description: 'Acompanhe o desenvolvimento físico com gráficos',
              icon: '📈',
            },
            {
              title: 'Calendário de Vacinação',
              description: 'Nunca perca uma vacina importante',
              icon: '💉',
            },
            {
              title: 'Compartilhamento Familiar',
              description: 'Compartilhe momentos com toda a família',
              icon: '👨‍👩‍👧‍👦',
            },
          ],
          testimonials: [
            {
              name: 'Maria Silva',
              text: 'O Baby Diary mudou a forma como acompanho o desenvolvimento da minha filha!',
              rating: 5,
            },
            {
              name: 'João Santos',
              text: 'Perfeito para registrar todos os momentos especiais do nosso bebê.',
              rating: 5,
            },
          ],
          faq: [
            {
              question: 'O que é o Baby Diary?',
              answer: 'É um aplicativo completo para acompanhar o desenvolvimento do seu bebê.',
            },
            {
              question: 'Posso usar gratuitamente?',
              answer: 'Sim! O plano Básico é totalmente gratuito.',
            },
            {
              question: 'Meus dados estão seguros?',
              answer: 'Sim, utilizamos criptografia de ponta a ponta.',
            },
          ],
          stats: [
            {
              label: 'Famílias Ativas',
              value: '50,000+',
              description: 'Confiam no Baby Diary',
            },
            {
              label: 'Memórias Registradas',
              value: '2M+',
              description: 'Momentos especiais salvos',
            },
            {
              label: 'Avaliação',
              value: '4.9/5',
              description: 'Pelos usuários',
            },
          ],
          ctaText: 'Comece a registrar as memórias do seu bebê hoje mesmo!',
          ctaButtonText: 'Registrar-se Grátis',
          seoTitle: 'Baby Diary - Seu Diário Digital para Acompanhar o Bebê',
          seoDescription: 'Registre atividades, memórias e marcos importantes do seu bebê em um só lugar.',
          seoKeywords: 'bebê, desenvolvimento, diário, família, memórias, crescimento',
        },
      });
      console.log('✅ Conteúdo da landing page criado');
    }

    // 6. Criar desafios de exemplo
    const challenges = [
      {
        name: 'Primeiro Login',
        description: 'Faça login pela primeira vez no app',
        type: 'unique',
        goal: 1,
        progressType: 'login',
        points: 10,
        badge: 'Primeiro Login',
        isActive: true,
      },
      {
        name: 'Login Diário',
        description: 'Faça login por 7 dias seguidos',
        type: 'weekly',
        goal: 7,
        progressType: 'login',
        points: 50,
        badge: 'Login Diário',
        isActive: true,
      },
      {
        name: 'Registrar 5 Atividades',
        description: 'Registre 5 atividades do bebê',
        type: 'weekly',
        goal: 5,
        progressType: 'activities',
        points: 30,
        badge: 'Ativo',
        isActive: true,
      },
      {
        name: 'Adicionar 3 Memórias',
        description: 'Adicione 3 memórias com foto',
        type: 'unique',
        goal: 3,
        progressType: 'memories',
        points: 20,
        badge: 'Memorável',
        isActive: true,
      },
      {
        name: 'Registrar 1 Marco',
        description: 'Registre o primeiro marco do bebê',
        type: 'unique',
        goal: 1,
        progressType: 'milestones',
        points: 15,
        badge: 'Primeiro Marco',
        isActive: true,
      },
      {
        name: 'Usar IA 3 vezes',
        description: 'Utilize qualquer funcionalidade de IA 3 vezes',
        type: 'weekly',
        goal: 3,
        progressType: 'ai',
        points: 40,
        badge: 'Tech Baby',
        isActive: true,
      },
    ];
    for (const challengeData of challenges) {
      const exists = await prisma.challenge.findFirst({ where: { name: challengeData.name } });
      if (!exists) {
        await prisma.challenge.create({ data: challengeData });
        console.log(`✅ Desafio '${challengeData.name}' criado`);
      }
    }

    console.log('🎉 Banco de dados inicializado com sucesso!');
    console.log('\n📋 Dados de acesso:');
    console.log('👨‍💼 Admin: admin@babydiary.com / admin123');
    console.log('🔗 API: http://localhost:3000');
    console.log('📊 Health Check: http://localhost:3000/health');

  } catch (error) {
    console.error('❌ Erro ao inicializar banco de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase; 