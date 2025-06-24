import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/bcrypt';
import { createPrice } from '../src/config/stripe';
import Stripe from 'stripe';

const prisma = new PrismaClient();

// Configuração do Stripe
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
}) : null;

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar administrador padrão
  const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123');
  
  const admin = await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@microsaas.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@microsaas.com',
      password: adminPassword,
      name: process.env.ADMIN_NAME || 'Administrador',
      role: 'super_admin',
    },
  });

  console.log('✅ Administrador criado:', admin.email);

  // Criar planos padrão
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { stripePriceId: 'price_basic_free' },
      update: {},
      create: {
        name: 'Básico',
        price: 0,
        features: [
          'Registro de 1 bebê',
          'Diário de memórias (até 10 por mês)',
          'Registro de atividades básicas',
          'Fotos em baixa resolução',
          'Marcos do desenvolvimento',
          'Backup automático na nuvem',
          'Compartilhamento com familiares',
          'Relatórios e análises',
          'Exportação de memórias',
        ],
        userLimit: 1,
        memoryLimit: 10,
        milestoneLimit: 10,
        activityLimit: 10,
        aiLimit: 10,
        photoQuality: 'low',
        familySharing: 2,
        exportFeatures: false,
        prioritySupport: false,
        stripePriceId: 'price_basic_free',
        isActive: true,
      },
    }),
    prisma.plan.upsert({
      where: { stripePriceId: 'price_premium_monthly' },
      update: {
        name: 'Premium 👑',
        price: 19.99,
        yearlyPrice: 155.99,
        features: [
            'Nº de bebês : Ilimitado',
            'Memórias (fotos e texto) Ilimitadas (alta qualidade)',
            'Marcos (fotos e texto) Ilimitadas (alta qualidade) Avançados + IA',
            'Atividades (sono, alimentação etc.) Ilimitadas (alta qualidade) Avançados + IA',
            'Agenda personalizada (consultas, vacinas): Sim (com lembretes)',
            'Crescimento (peso/altura): sim',
            'Saúde (sintomas, consultas, vacinas etc.): Sim',
            'Gamificação (nível, pontos, conquistas): Completo',
            'Compartilhamento familiar: Não',
            'Exportação de dados (PDF, CSV): Sim',
            'Acesso offline: Sim',
            'Suporte prioritário: Sim',
            'Recursos com IA (sugestões, frases, etc.): Completo',
            'Backup automático na nuvem: Sim (Mensal)',
            'Relatórios de desenvolvimento: Sim',
        ],
        userLimit: 9999, // Ilimitado
        memoryLimit: 9999, // Ilimitado
        milestoneLimit: 9999, // Ilimitado
        activityLimit: 9999, // Ilimitado
        aiLimit: 9999, // Ilimitado
        photoQuality: 'high',
        familySharing: 0, // Não
        exportFeatures: true,
        prioritySupport: true,
        aiFeatures: true, 
        offlineMode: true,
      },
      create: {
        name: 'Premium 👑',
        price: 19.99,
        yearlyPrice: 155.99,
        features: [
            'Nº de bebês : Ilimitado',
            'Memórias (fotos e texto) Ilimitadas (alta qualidade)',
            'Marcos (fotos e texto) Ilimitadas (alta qualidade) Avançados + IA',
            'Atividades (sono, alimentação etc.) Ilimitadas (alta qualidade) Avançados + IA',
            'Agenda personalizada (consultas, vacinas): Sim (com lembretes)',
            'Crescimento (peso/altura): sim',
            'Saúde (sintomas, consultas, vacinas etc.): Sim',
            'Gamificação (nível, pontos, conquistas): Completo',
            'Compartilhamento familiar: Não',
            'Exportação de dados (PDF, CSV): Sim',
            'Acesso offline: Sim',
            'Suporte prioritário: Sim',
            'Recursos com IA (sugestões, frases, etc.): Completo',
            'Backup automático na nuvem: Sim (Mensal)',
            'Relatórios de desenvolvimento: Sim',
        ],
        userLimit: 9999, // Ilimitado
        memoryLimit: 9999, // Ilimitado
        milestoneLimit: 9999, // Ilimitado
        activityLimit: 9999, // Ilimitado
        aiLimit: 9999, // Ilimitado
        photoQuality: 'high',
        familySharing: 0, // Não
        exportFeatures: true,
        prioritySupport: true,
        aiFeatures: true,
        offlineMode: true,
        stripePriceId: 'price_premium_monthly',
        stripeYearlyPriceId: 'price_premium_yearly',
        isActive: true,
      },
    }),
    prisma.plan.upsert({
      where: { stripePriceId: 'price_family_monthly' },
      update: {
        name: 'Família 👨‍👩‍👧‍👦',
        price: 29.99,
        yearlyPrice: 199.99,
        features: [
          'Nº de bebês : Ilimitado',
          'Memórias (fotos e texto) Ilimitadas (alta qualidade + compartilhamento)',
          'Marcos (fotos e texto) Ilimitadas (alta qualidade) Avançados + IA',
          'Atividades (sono, alimentação etc.) Ilimitadas (alta qualidade) Avançados + IA',
          'Agenda personalizada (consultas, vacinas): Ilimitadas (alta qualidade + compartilhamento)',
          'Crescimento (peso/altura): sim',
          'Saúde (sintomas, consultas, vacinas etc.): Sim + exportação',
          'Gamificação (nível, pontos, conquistas): Completo + ranking família',
          'Compartilhamento familiar: Sim',
          'Exportação de dados (PDF, CSV): Sim',
          'Acesso offline: Sim',
          'Suporte prioritário: Sim',
          'Recursos com IA (sugestões, frases, etc.): Completo',
          'Backup automático na nuvem: Sim (Diário)',
          'Relatórios de desenvolvimento: Sim',
        ],
        userLimit: 9999, // Ilimitado
        memoryLimit: 9999, // Ilimitado
        milestoneLimit: 9999, // Ilimitado
        activityLimit: 9999, // Ilimitado
        aiLimit: 9999, // Ilimitado
        familySharing: 9999, // Ilimitado
      },
      create: {
        name: 'Família 👨‍👩‍👧‍👦',
        price: 29.99,
        yearlyPrice: 199.99,
        features: [
          'Nº de bebês : Ilimitado',
          'Memórias (fotos e texto) Ilimitadas (alta qualidade + compartilhamento)',
          'Marcos (fotos e texto) Ilimitadas (alta qualidade) Avançados + IA',
          'Atividades (sono, alimentação etc.) Ilimitadas (alta qualidade) Avançados + IA',
          'Agenda personalizada (consultas, vacinas): Ilimitadas (alta qualidade + compartilhamento)',
          'Crescimento (peso/altura): sim',
          'Saúde (sintomas, consultas, vacinas etc.): Sim + exportação',
          'Gamificação (nível, pontos, conquistas): Completo + ranking família',
          'Compartilhamento familiar: Sim',
          'Exportação de dados (PDF, CSV): Sim',
          'Acesso offline: Sim',
          'Suporte prioritário: Sim',
          'Recursos com IA (sugestões, frases, etc.): Completo',
          'Backup automático na nuvem: Sim (Diário)',
          'Relatórios de desenvolvimento: Sim',
        ],
        userLimit: 9999,
        memoryLimit: 9999,
        milestoneLimit: 9999,
        activityLimit: 9999,
        aiLimit: 9999,
        photoQuality: 'high',
        familySharing: 9999,
        exportFeatures: true,
        prioritySupport: true,
        aiFeatures: true,
        offlineMode: true,
        stripePriceId: 'price_family_monthly',
        stripeYearlyPriceId: 'price_family_yearly',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Planos criados:', plans.map(p => p.name));

  // Sincronizar planos com Stripe se configurado
  if (stripe) {
    console.log('🔄 Sincronizando planos com Stripe...');
    
    for (const plan of plans) {
      try {
        console.log(`\n🔄 Processando plano: ${plan.name}`);
        
        // Criar produto no Stripe
        const product = await stripe.products.create({
          name: plan.name,
          description: `Plano ${plan.name} do Baby Diary`,
        });
        
        console.log(`✅ Produto criado: ${product.id}`);
        
        // Atualizar plano com stripeProductId
        await prisma.plan.update({
          where: { id: plan.id },
          data: { stripeProductId: product.id }
        });
        
        // Criar preços no Stripe se o plano não for gratuito
        if (plan.price > 0) {
          const monthlyPrice = await createPrice(plan.price, 'month', product.id);
          await prisma.plan.update({
            where: { id: plan.id },
            data: { stripePriceId: monthlyPrice.id }
          });
          console.log(`✅ Preço mensal criado: ${monthlyPrice.id}`);
        }
        
        if (plan.yearlyPrice && plan.yearlyPrice > 0) {
          const yearlyPrice = await createPrice(plan.yearlyPrice, 'year', product.id);
          await prisma.plan.update({
            where: { id: plan.id },
            data: { stripeYearlyPriceId: yearlyPrice.id }
          });
          console.log(`✅ Preço anual criado: ${yearlyPrice.id}`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao sincronizar plano ${plan.name}:`, error);
      }
    }
  } else {
    console.log('⚠️ Stripe não configurado, pulando sincronização');
  }

  // Criar usuários de teste
  const userPassword = await hashPassword('user123');
  const testUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'fulano@email.com' },
      update: {},
      create: {
        name: 'Fulano de Tal',
        email: 'fulano@email.com',
        password: userPassword,
        planId: plans[1].id, // Premium
      },
    }),
    prisma.user.upsert({
      where: { email: 'ciclana@email.com' },
      update: {},
      create: {
        name: 'Ciclana Souza',
        email: 'ciclana@email.com',
        password: userPassword,
        planId: plans[2].id, // Família
      },
    }),
    prisma.user.upsert({
      where: { email: 'beltrano@email.com' },
      update: {},
      create: {
        name: 'Beltrano Silva',
        email: 'beltrano@email.com',
        password: userPassword,
        planId: plans[0].id, // Básico
      },
    }),
  ]);
  console.log('✅ Usuários de teste criados:', testUsers.length);

  // Criar conteúdo padrão da landing page
  const landingPageContent = await prisma.landingPageContent.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      heroTitle: 'Seu diário digital para acompanhar o bebê',
      heroSubtitle: 'Registre atividades, memórias e marcos importantes do seu bebê em um só lugar. Nunca perca um momento especial do desenvolvimento do seu pequeno.',
      heroImage: null,
      features: [
        {
          title: 'Diário do Sono',
          description: 'Acompanhe os padrões de sono do seu bebê e receba insights personalizados para melhorar a qualidade do sono.',
          icon: 'moon',
        },
        {
          title: 'Alimentação',
          description: 'Registre mamadas, papinhas e introdução alimentar. Receba dicas baseadas na idade do seu bebê.',
          icon: 'utensils',
        },
        {
          title: 'Curva de Crescimento',
          description: 'Acompanhe o desenvolvimento físico do seu bebê com gráficos comparativos baseados nos padrões da OMS.',
          icon: 'chart-line',
        },
        {
          title: 'Vacinação',
          description: 'Calendário de vacinas personalizado com lembretes automáticos para nunca perder uma dose importante.',
          icon: 'syringe',
        },
        {
          title: 'Assistente IA',
          description: 'Chat inteligente para dúvidas sobre desenvolvimento e sugestões personalizadas baseadas em IA.',
          icon: 'robot',
        },
        {
          title: 'Colaboração Familiar',
          description: 'Compartilhe momentos especiais com familiares e permita que eles também registrem atividades.',
          icon: 'users',
        },
      ],
      testimonials: [
        {
          name: 'Maria Silva',
          text: 'O Baby Diary transformou a forma como acompanho o desenvolvimento da minha filha. As lembretes e insights são incríveis!',
          rating: 5,
        },
        {
          name: 'João Santos',
          text: 'Como pai, sempre quis estar mais presente. Agora posso acompanhar tudo em tempo real e nunca perco um marco importante.',
          rating: 5,
        },
        {
          name: 'Ana Costa',
          text: 'A funcionalidade de IA é fantástica! Recebo sugestões personalizadas que realmente fazem diferença no dia a dia.',
          rating: 5,
        },
      ],
      faq: [
        {
          question: 'O que é o Baby Diary?',
          answer: 'O Baby Diary é um aplicativo completo para acompanhar o desenvolvimento do seu bebê, desde o nascimento até os primeiros anos de vida. Registre atividades, memórias, marcos importantes e muito mais.',
        },
        {
          question: 'Posso utilizar gratuitamente?',
          answer: 'Sim! O plano Básico é totalmente gratuito e permite registrar 1 bebê, com até 10 memórias por mês e funções básicas. Para famílias com mais bebês ou que desejam funcionalidades avançadas, oferecemos os planos Premium e Família.',
        },
        {
          question: 'Quais atividades posso registrar no aplicativo?',
          answer: 'Você pode registrar sono, alimentação, troca de fraldas, peso, marcos de desenvolvimento, memórias especiais, vacinas e muito mais. Cada atividade pode incluir fotos e notas personalizadas.',
        },
        {
          question: 'Como funciona o compartilhamento com familiares?',
          answer: 'Você pode convidar familiares para visualizar e contribuir com o diário do bebê. Cada plano tem um limite diferente de familiares que podem participar.',
        },
        {
          question: 'Meus dados estão seguros no aplicativo?',
          answer: 'Absolutamente! Utilizamos criptografia end-to-end e seguimos as melhores práticas de segurança. Seus dados são privados e protegidos.',
        },
        {
          question: 'O aplicativo funciona offline?',
          answer: 'Sim! Você pode registrar atividades mesmo sem internet. Os dados são sincronizados automaticamente quando a conexão for restaurada.',
        },
      ],
      stats: [
        {
          label: 'Famílias Atendidas',
          value: '50,000+',
          description: 'Famílias confiam no Baby Diary',
        },
        {
          label: 'Memórias Registradas',
          value: '2M+',
          description: 'Momentos especiais preservados',
        },
        {
          label: 'Avaliação Média',
          value: '4.9/5',
          description: 'Baseado em avaliações reais',
        },
        {
          label: 'Disponibilidade',
          value: '99.9%',
          description: 'Sempre disponível quando você precisa',
        },
      ],
      ctaText: 'Comece a registrar as memórias do seu bebê hoje mesmo!',
      ctaButtonText: 'Ir para Meu Diário',
    },
  });

  console.log('✅ Conteúdo da landing page criado');

  // Criar regras de gamificação
  const gamificationRules = [
    {
      id: 'daily_login',
      name: 'Login Diário',
      description: 'Faça login todos os dias',
      points: 5,
      condition: 'daily_login',
      badgeIcon: 'calendar',
      category: 'engagement',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'first_memory',
      name: 'Primeira Memória',
      description: 'Crie sua primeira memória',
      points: 10,
      condition: 'first_memory',
      badgeIcon: 'heart',
      category: 'content',
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'milestone',
      name: 'Marco Importante',
      description: 'Registre um marco do desenvolvimento',
      points: 30,
      condition: 'milestone',
      badgeIcon: 'star',
      category: 'milestone',
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'streak_7',
      name: 'Streak de 7 Dias',
      description: 'Mantenha atividade por 7 dias consecutivos',
      points: 50,
      condition: 'streak_7',
      badgeIcon: 'flame',
      category: 'streak',
      isActive: true,
      sortOrder: 4,
    },
  ];

  for (const rule of gamificationRules) {
    await prisma.gamificationRule.upsert({
      where: { id: rule.id },
      update: rule,
      create: rule,
    });
  }

  // Garantir regra 'any' para gamificação
  const anyRule = await prisma.gamificationRule.findFirst({
    where: { name: 'any' }
  });
  if (!anyRule) {
    await prisma.gamificationRule.create({
      data: {
        name: 'any',
        description: 'Pontuação padrão para qualquer ação',
        points: 5,
        condition: 'any',
        badgeIcon: '',
        category: 'general',
        isActive: true,
        sortOrder: 999
      }
    });
    console.log('Regra "any" criada!');
  } else {
    console.log('Regra "any" já existe.');
  }

  // SISTEMA DE RESGATE MANUAL - DADOS DE SEED

  // Criar itens da loja
  const shopItems = [
    {
      id: 'pink_theme',
      name: 'Tema Rosa Especial',
      description: 'Tema personalizado em tons de rosa para o app',
      type: 'theme',
      category: 'premium',
      price: 100,
      imageUrl: '/themes/pink-theme.png',
      isActive: true,
      isLimited: false,
      sortOrder: 1,
    },
    {
      id: 'blue_theme',
      name: 'Tema Azul Especial',
      description: 'Tema personalizado em tons de azul para o app',
      type: 'theme',
      category: 'premium',
      price: 100,
      imageUrl: '/themes/blue-theme.png',
      isActive: true,
      isLimited: false,
      sortOrder: 2,
    },
    {
      id: 'export_feature',
      name: 'Exportar Memórias',
      description: 'Desbloqueia a funcionalidade de exportar memórias em PDF',
      type: 'feature',
      category: 'premium',
      price: 200,
      imageUrl: '/features/export.png',
      isActive: true,
      isLimited: false,
      sortOrder: 3,
    },
    {
      id: 'backup_feature',
      name: 'Backup na Nuvem',
      description: 'Backup automático de todas as suas memórias na nuvem',
      type: 'feature',
      category: 'premium',
      price: 300,
      imageUrl: '/features/backup.png',
      isActive: true,
      isLimited: false,
      sortOrder: 4,
    },
    {
      id: 'points_bonus',
      name: 'Pacote de 50 Pontos',
      description: 'Receba 50 pontos extras para usar na loja',
      type: 'bonus',
      category: 'basic',
      price: 0, // Grátis para usuários ativos
      imageUrl: '/bonuses/points.png',
      isActive: true,
      isLimited: true,
      stock: 100,
      sortOrder: 5,
    },
    {
      id: 'gold_badge',
      name: 'Emblema Dourado',
      description: 'Emblema especial dourado para seu perfil',
      type: 'cosmetic',
      category: 'seasonal',
      price: 150,
      imageUrl: '/cosmetics/gold-badge.png',
      isActive: true,
      isLimited: true,
      stock: 50,
      sortOrder: 6,
    },
  ];

  for (const item of shopItems) {
    await prisma.shopItem.upsert({
      where: { id: item.id },
      update: item,
      create: item,
    });
  }

  // Criar missões diárias
  const dailyMissions = [
    {
      id: 'morning_login',
      title: 'Login Matinal',
      description: 'Faça login antes das 9h da manhã',
      type: 'login',
      goal: 1,
      points: 10,
      icon: 'sun',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'daily_memory',
      title: 'Memória do Dia',
      description: 'Crie uma nova memória hoje',
      type: 'memory',
      goal: 1,
      points: 15,
      icon: 'heart',
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'complete_activity',
      title: 'Atividade Completa',
      description: 'Registre pelo menos 3 atividades hoje',
      type: 'activity',
      goal: 3,
      points: 20,
      icon: 'activity',
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'special_milestone',
      title: 'Marco Especial',
      description: 'Registre um marco do desenvolvimento',
      type: 'milestone',
      goal: 1,
      points: 25,
      icon: 'star',
      isActive: true,
      sortOrder: 4,
    },
    {
      id: 'daily_streak',
      title: 'Streak Diário',
      description: 'Mantenha seu streak por mais um dia',
      type: 'streak',
      goal: 1,
      points: 5,
      icon: 'flame',
      isActive: true,
      sortOrder: 5,
    },
    {
      id: 'photo_dedicated',
      title: 'Fotógrafa Dedicada',
      description: 'Faça upload de 2 fotos hoje',
      type: 'activity',
      goal: 2,
      points: 15,
      icon: 'camera',
      isActive: true,
      sortOrder: 6,
    },
  ];

  for (const mission of dailyMissions) {
    await prisma.dailyMission.upsert({
      where: { id: mission.id },
      update: mission,
      create: mission,
    });
  }

  // Criar eventos especiais
  const specialEvents = [
    {
      id: 'mothers_week',
      name: 'Semana da Mamãe',
      description: 'Celebre a semana da mamãe com desafios especiais e recompensas únicas',
      type: 'seasonal',
      startDate: new Date('2024-05-12'),
      endDate: new Date('2024-05-18'),
      isActive: true,
      rewards: [
        { type: 'badge', name: 'Mamãe Especial', icon: 'crown' },
        { type: 'points', amount: 100 },
        { type: 'theme', name: 'Tema Mamãe' },
      ],
      challenges: [
        { id: 'memory_week', title: '7 Memórias em 7 Dias', goal: 7, points: 50 },
        { id: 'activity_week', title: 'Atividades Diárias', goal: 7, points: 30 },
        { id: 'photo_week', title: 'Fotos Especiais', goal: 5, points: 25 },
      ],
    },
    {
      id: 'growth_challenge',
      name: 'Desafio do Crescimento',
      description: 'Acompanhe o crescimento do seu bebê com desafios especiais',
      type: 'challenge',
      startDate: new Date('2024-06-01'),
      endDate: new Date('2024-06-30'),
      isActive: true,
      rewards: [
        { type: 'badge', name: 'Crescimento Saudável', icon: 'trending-up' },
        { type: 'points', amount: 200 },
        { type: 'feature', name: 'Gráficos Avançados' },
      ],
      challenges: [
        { id: 'growth_month', title: 'Medições Mensais', goal: 4, points: 100 },
        { id: 'milestone_month', title: 'Marcos do Mês', goal: 3, points: 75 },
        { id: 'photo_month', title: 'Fotos do Crescimento', goal: 10, points: 50 },
      ],
    },
  ];

  for (const event of specialEvents) {
    await prisma.specialEvent.upsert({
      where: { id: event.id },
      update: event,
      create: event,
    });
  }

  // Criar recompensas de IA
  const aiRewards = [
    {
      id: 'ai_tip_1',
      title: 'Presente da Inteligência Mãe-AI',
      description: 'Dica personalizada baseada no padrão do seu bebê',
      type: 'tip',
      content: 'Com base no padrão do seu bebê, aqui está uma dica personalizada para melhorar sua rotina diária.',
      unlockCondition: 'Ter pelo menos 200 pontos',
      isActive: true,
      sortOrder: 1,
    },
    {
      id: 'ai_activity_1',
      title: 'Atividade Especial da IA',
      description: 'Exercício específico para a idade do seu bebê',
      type: 'activity',
      content: 'Aqui está uma atividade especial desenvolvida pela IA para estimular o desenvolvimento do seu bebê.',
      unlockCondition: 'Ter pelo menos 200 pontos',
      isActive: true,
      sortOrder: 2,
    },
    {
      id: 'ai_milestone_1',
      title: 'Previsão dos Próximos Marcos',
      description: 'Descubra o que esperar nos próximos meses',
      type: 'milestone',
      content: 'Com base no desenvolvimento atual do seu bebê, aqui estão os próximos marcos que você pode esperar.',
      unlockCondition: 'Ter pelo menos 200 pontos',
      isActive: true,
      sortOrder: 3,
    },
    {
      id: 'ai_encouragement_1',
      title: 'Mensagem de Apoio Personalizada',
      description: 'Palavras especiais para você, mamãe',
      type: 'encouragement',
      content: 'Uma mensagem especial da IA para apoiar você nesta jornada incrível de ser mãe.',
      unlockCondition: 'Ter pelo menos 200 pontos',
      isActive: true,
      sortOrder: 4,
    },
  ];

  for (const reward of aiRewards) {
    await prisma.aIReward.upsert({
      where: { id: reward.id },
      update: reward,
      create: reward,
    });
  }

  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 