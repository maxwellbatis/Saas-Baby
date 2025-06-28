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
      sku: 'THEME-PINK-001',
      variations: [
        {
          type: 'Intensidade',
          options: ['Suave', 'Médio', 'Forte'],
          required: true
        }
      ]
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
      sku: 'THEME-BLUE-001',
      variations: [
        {
          type: 'Intensidade',
          options: ['Suave', 'Médio', 'Forte'],
          required: true
        }
      ]
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
      sku: 'FEATURE-EXPORT-001',
      variations: [
        {
          type: 'Formato',
          options: ['PDF', 'CSV', 'JSON'],
          required: true
        }
      ]
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
      sku: 'FEATURE-BACKUP-001',
      variations: [
        {
          type: 'Frequência',
          options: ['Diário', 'Semanal', 'Mensal'],
          required: true
        }
      ]
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
      sku: 'BONUS-POINTS-050',
      variations: undefined // Sem variações
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
      sku: 'COSMETIC-BADGE-GOLD',
      variations: [
        {
          type: 'Tamanho',
          options: ['Pequeno', 'Médio', 'Grande'],
          required: true
        }
      ]
    },
  ];

  // Comentar temporariamente a criação dos produtos de seed devido a mudanças no schema
  /*
  for (const produto of produtosSeed) {
    await prisma.shopItem.upsert({
      where: { id: produto.id },
      update: produto,
      create: produto,
    });
  }
  */

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

  // BIBLIOTECA DE MARKETING DIGITAL - DADOS DE SEED

  // Posts para Redes Sociais
  const socialMediaPosts = [
    {
      id: 'post_emocional_1',
      title: 'Primeiro Sorriso',
      description: 'Post emocional sobre capturar o primeiro sorriso do bebê',
      category: 'emocional',
      platform: 'instagram',
      contentType: 'post',
      caption: `👶✨ O primeiro sorriso do seu bebê é um momento mágico que merece ser guardado para sempre!

Com o Baby Diary, você pode registrar cada sorriso, cada marco, cada memória especial do desenvolvimento do seu pequeno.

📱 Baixe agora e comece a criar seu diário digital de memórias!

#babyapp #diariodobebe #primeirosorriso #gestante #maedemenino #maedemenina #maternidade #bebe #memorias`,
      hashtags: '#babyapp #diariodobebe #primeirosorriso #gestante #maedemenino #maedemenina #maternidade #bebe #memorias',
      cta: 'Baixe agora e comece a criar seu diário digital!',
      targetAudience: 'gestantes',
      isActive: true,
      sortOrder: 1,
      createdBy: 'admin'
    },
    {
      id: 'post_funcionalidade_1',
      title: 'Chat IA para Mães',
      description: 'Post destacando o chat com IA para dúvidas sobre maternidade',
      category: 'funcionalidade',
      platform: 'instagram',
      contentType: 'post',
      caption: `🤖💡 Dúvidas sobre o desenvolvimento do seu bebê? O Baby Diary tem um assistente IA 24h por dia!

Pergunte sobre sono, alimentação, marcos de desenvolvimento e receba respostas personalizadas baseadas na idade do seu bebê.

✨ Tecnologia que entende a maternidade real!

#babyapp #ia #maternidade #desenvolvimento #bebe #gestante #mae #tecnologia`,
      hashtags: '#babyapp #ia #maternidade #desenvolvimento #bebe #gestante #mae #tecnologia',
      cta: 'Experimente o chat IA gratuitamente!',
      targetAudience: 'maes_bebes',
      isActive: true,
      sortOrder: 2,
      createdBy: 'admin'
    },
    {
      id: 'post_beneficio_1',
      title: 'Centralize Tudo',
      description: 'Post sobre centralizar todas as informações do bebê em um só lugar',
      category: 'beneficio',
      platform: 'facebook',
      contentType: 'post',
      caption: `📱💝 Chega de ter informações do bebê espalhadas em vários lugares!

Com o Baby Diary, você centraliza:
✅ Registro de sono
✅ Alimentação
✅ Marcos de desenvolvimento
✅ Vacinas
✅ Consultas médicas
✅ Memórias especiais

Tudo em um só app, com backup automático na nuvem!

#babyapp #organizacao #maternidade #bebe #gestante #mae #facilidade`,
      hashtags: '#babyapp #organizacao #maternidade #bebe #gestante #mae #facilidade',
      cta: 'Organize a vida do seu bebê em um só lugar!',
      targetAudience: 'maes_bebes',
      isActive: true,
      sortOrder: 3,
      createdBy: 'admin'
    }
  ];

  for (const post of socialMediaPosts) {
    await prisma.socialMediaPost.upsert({
      where: { id: post.id },
      update: post,
      create: post,
    });
  }

  // Anúncios
  const advertisements = [
    {
      id: 'ad_facebook_1',
      title: 'Plano Premium - Gestantes',
      platform: 'facebook',
      adType: 'image',
      copyShort: 'Registre cada momento especial do seu bebê com qualidade premium!',
      copyLong: 'O Baby Diary Premium oferece recursos avançados para registrar cada momento especial do desenvolvimento do seu bebê. Com IA personalizada, backup automático e funcionalidades ilimitadas, você nunca mais perderá um marco importante.',
      headline: 'Baby Diary Premium - Seu Diário Digital Completo',
      description: 'Registre memórias, marcos e atividades com IA personalizada. Backup automático e recursos ilimitados.',
      cta: 'Começar Gratuitamente',
      targetAudience: 'gestantes',
      interests: ['maternidade', 'amamentação', 'pediatria', 'desenvolvimento infantil'],
      budget: 50.0,
      isActive: true,
      createdBy: 'admin'
    },
    {
      id: 'ad_instagram_1',
      title: 'App Gratuito - Mães de Bebês',
      platform: 'instagram',
      adType: 'story',
      copyShort: 'App gratuito para registrar o desenvolvimento do seu bebê!',
      copyLong: 'Comece a registrar o desenvolvimento do seu bebê gratuitamente! O Baby Diary oferece funcionalidades essenciais sem custo, incluindo registro de atividades, memórias e marcos importantes.',
      headline: 'Baby Diary - Gratuito para Começar',
      description: 'Registre o desenvolvimento do seu bebê gratuitamente. Funcionalidades essenciais sem custo.',
      cta: 'Baixar Grátis',
      targetAudience: 'maes_bebes',
      interests: ['maternidade', 'bebês', 'desenvolvimento'],
      budget: 30.0,
      isActive: true,
      createdBy: 'admin'
    }
  ];

  for (const ad of advertisements) {
    await prisma.advertisement.upsert({
      where: { id: ad.id },
      update: ad,
      create: ad,
    });
  }

  // Vídeos
  const videoContents = [
    {
      id: 'video_reel_1',
      title: 'Como o Baby Diary Salvou Meu Puerpério',
      description: 'Reel emocional mostrando como o app ajudou uma mãe no puerpério',
      platform: 'instagram',
      videoType: 'reel',
      duration: 30,
      script: `Cena 1 (0-5s): Mãe exausta à noite com bebê chorando
Texto: "3h da manhã e seu bebê chorando?"

Cena 2 (6-15s): Ela abre o app Baby Diary
Texto: "Você não está sozinha"

Cena 3 (16-25s): Ela recebe dica personalizada da IA
Texto: "Receba apoio 24h com IA"

Cena 4 (26-30s): Mãe sorrindo com bebê dormindo
Texto: "Baby Diary - sua jornada com amor e apoio"`,
      music: 'Música suave e emocional',
      hashtags: '#babyapp #puerperio #mae #bebe #ia #apoio #maternidade',
      targetAudience: 'maes_bebes',
      isActive: true,
      createdBy: 'admin'
    },
    {
      id: 'video_tutorial_1',
      title: 'Como Registrar o Primeiro Marco',
      description: 'Tutorial rápido sobre como registrar marcos no app',
      platform: 'tiktok',
      videoType: 'tutorial',
      duration: 45,
      script: `Cena 1 (0-10s): Abrir app e mostrar tela inicial
Texto: "Como registrar marcos no Baby Diary"

Cena 2 (11-25s): Clicar em "Marcos" e mostrar formulário
Texto: "É super fácil! Só clicar em Marcos"

Cena 3 (26-40s): Preencher dados e salvar
Texto: "Preencher e salvar - pronto!"

Cena 4 (41-45s): Mostrar marco salvo
Texto: "Seu marco ficou registrado para sempre!"`,
      music: 'Música animada e jovem',
      hashtags: '#tutorial #babyapp #marcos #bebe #mae #facilidade',
      targetAudience: 'gestantes',
      isActive: true,
      createdBy: 'admin'
    }
  ];

  for (const video of videoContents) {
    await prisma.videoContent.upsert({
      where: { id: video.id },
      update: video,
      create: video,
    });
  }

  // Argumentos de Venda
  const salesArguments = [
    {
      id: 'arg_emocional_1',
      title: 'Guarde o Primeiro Sorriso para Sempre',
      category: 'emocional',
      argument: 'O primeiro sorriso do seu bebê é um momento único que nunca mais se repete. Com o Baby Diary, você pode registrar esse momento especial com fotos, vídeos e descrições, criando um tesouro de memórias que durará para sempre.',
      examples: [
        'Registre o primeiro sorriso com foto e descrição',
        'Adicione contexto emocional ao momento',
        'Compartilhe com familiares automaticamente'
      ],
      targetAudience: 'gestantes',
      conversionRate: 18.5,
      isActive: true,
      sortOrder: 1,
      createdBy: 'admin'
    },
    {
      id: 'arg_escassez_1',
      title: 'Desconto por Tempo Limitado',
      category: 'escassez',
      argument: 'Oferta especial por tempo limitado! Assinatura Premium com 50% de desconto apenas para os primeiros 100 usuários. Não perca essa oportunidade de ter acesso a recursos avançados de IA e backup ilimitado.',
      examples: [
        'Desconto de 50% por tempo limitado',
        'Apenas 100 vagas disponíveis',
        'Recursos premium com IA avançada'
      ],
      targetAudience: 'maes_bebes',
      conversionRate: 25.0,
      isActive: true,
      sortOrder: 2,
      createdBy: 'admin'
    },
    {
      id: 'arg_pertencimento_1',
      title: 'Mais de 10.000 Mães Já Estão Usando',
      category: 'pertencimento',
      argument: 'Junte-se a mais de 10.000 mães que já confiam no Baby Diary para registrar o desenvolvimento dos seus bebês. Faça parte dessa comunidade que valoriza cada momento especial da maternidade.',
      examples: [
        '10.000+ mães já usam o app',
        'Comunidade ativa de mães',
        'Depoimentos reais de usuárias'
      ],
      targetAudience: 'maes_criancas',
      conversionRate: 15.0,
      isActive: true,
      sortOrder: 3,
      createdBy: 'admin'
    },
    {
      id: 'arg_racional_1',
      title: 'Centralize Tudo num Só Lugar',
      category: 'racional',
      argument: 'Elimine a confusão de ter informações do bebê espalhadas em vários lugares. O Baby Diary centraliza sono, alimentação, marcos, vacinas, consultas e memórias em uma única plataforma com backup automático.',
      examples: [
        'Todas as informações em um só lugar',
        'Backup automático na nuvem',
        'Interface intuitiva e organizada'
      ],
      targetAudience: 'maes_bebes',
      conversionRate: 12.5,
      isActive: true,
      sortOrder: 4,
      createdBy: 'admin'
    }
  ];

  for (const arg of salesArguments) {
    await prisma.salesArgument.upsert({
      where: { id: arg.id },
      update: arg,
      create: arg,
    });
  }

  // Links de Afiliados
  const affiliateLinks = [
    {
      id: 'link_instagram_1',
      name: 'Campanha Instagram - Plano Premium',
      baseUrl: 'https://babydiary.shop',
      utmSource: 'instagram',
      utmMedium: 'social',
      utmCampaign: 'plano_premium',
      utmContent: 'post_emocional',
      fullUrl: 'https://babydiary.shop?utm_source=instagram&utm_medium=social&utm_campaign=plano_premium&utm_content=post_emocional',
      clicks: 0,
      conversions: 0,
      isActive: true,
      createdBy: 'admin'
    },
    {
      id: 'link_facebook_1',
      name: 'Campanha Facebook - App Gratuito',
      baseUrl: 'https://babydiary.shop',
      utmSource: 'facebook',
      utmMedium: 'social',
      utmCampaign: 'app_gratuito',
      utmContent: 'ad_story',
      fullUrl: 'https://babydiary.shop?utm_source=facebook&utm_medium=social&utm_campaign=app_gratuito&utm_content=ad_story',
      clicks: 0,
      conversions: 0,
      isActive: true,
      createdBy: 'admin'
    }
  ];

  for (const link of affiliateLinks) {
    await prisma.affiliateLink.upsert({
      where: { id: link.id },
      update: link,
      create: link,
    });
  }

  console.log('✅ Biblioteca de Marketing Digital criada');

  // Criar posts agendados de exemplo
  console.log('📅 Criando posts agendados de exemplo...');
  
  const scheduledPosts = [
    {
      title: 'Dica do Dia: Sono do Bebê',
      content: '💤 Dica importante para o sono do seu bebê: estabeleça uma rotina consistente antes de dormir. Banho, massagem e uma canção de ninar podem fazer toda a diferença! #sonodobebe #rotina #maternidade',
      platform: 'instagram',
      contentType: 'post',
      scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
      status: 'scheduled',
      targetAudience: 'maes_bebes',
      category: 'motivacional',
      hashtags: '#sonodobebe #rotina #maternidade #dicas',
      createdBy: 'admin'
    },
    {
      title: 'Benefício Premium: Backup Automático',
      content: '🔒 Com o plano Premium, suas memórias são salvas automaticamente na nuvem. Nunca perca um momento especial! #premium #backup #memorias',
      platform: 'facebook',
      contentType: 'post',
      scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Em 2 dias
      status: 'scheduled',
      targetAudience: 'maes_bebes',
      category: 'beneficio',
      hashtags: '#premium #backup #memorias #seguranca',
      createdBy: 'admin'
    },
    {
      title: 'Story: Primeiros Passos',
      content: '👶 Cada pequeno passo é uma grande conquista! Compartilhe os primeiros passos do seu bebê no Baby Diary. #primeirospassos #conquista #bebe',
      platform: 'instagram',
      contentType: 'story',
      scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Em 3 dias
      status: 'scheduled',
      targetAudience: 'maes_criancas',
      category: 'comemorativo',
      hashtags: '#primeirospassos #conquista #bebe #story',
      createdBy: 'admin'
    },
    {
      title: 'Reel: Atividades para Bebês',
      content: '🎯 Atividades simples e divertidas para estimular o desenvolvimento do seu bebê! Veja no nosso perfil. #atividades #desenvolvimento #bebe',
      platform: 'instagram',
      contentType: 'reel',
      scheduledAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // Em 4 dias
      status: 'scheduled',
      targetAudience: 'maes_bebes',
      category: 'funcionalidade',
      hashtags: '#atividades #desenvolvimento #bebe #reel',
      createdBy: 'admin'
    },
    {
      title: 'Depoimento: Maria e João',
      content: '💕 "O Baby Diary mudou a forma como registro os momentos do meu filho. Cada memória fica mais especial!" - Maria, mãe do João #depoimento #testemunho #maternidade',
      platform: 'facebook',
      contentType: 'post',
      scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Em 5 dias
      status: 'scheduled',
      targetAudience: 'maes_bebes',
      category: 'depoimento',
      hashtags: '#depoimento #testemunho #maternidade #babyDiary',
      createdBy: 'admin'
    }
  ];

  for (const postData of scheduledPosts) {
    await prisma.scheduledPost.create({
      data: postData
    });
  }

  console.log(`✅ ${scheduledPosts.length} posts agendados criados`);

  // Seed das categorias da loja com emoji
  const categoriasLoja = [
    { name: 'Cuidados com o bebê', description: 'Produtos para cuidados diários do bebê', isActive: true, sortOrder: 1, emoji: '🍼' },
    { name: 'Para a mamãe', description: 'Produtos para gestantes e mães', isActive: true, sortOrder: 2, emoji: '🤱' },
    { name: 'Primeiros meses', description: 'Itens essenciais para os primeiros meses', isActive: true, sortOrder: 3, emoji: '👶' },
    { name: 'Presentes e datas especiais', description: 'Sugestões para presentear', isActive: true, sortOrder: 4, emoji: '🎁' },
    { name: 'Digitais e cursos', description: 'Produtos digitais e cursos online', isActive: true, sortOrder: 5, emoji: '💻' },
  ];

  for (const cat of categoriasLoja) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: { description: cat.description, isActive: cat.isActive, sortOrder: cat.sortOrder },
      create: { name: cat.name, description: cat.description, isActive: cat.isActive, sortOrder: cat.sortOrder },
    });
  }
  console.log('✅ Categorias da loja criadas/atualizadas!');

  // Buscar categorias para associar os produtos corretamente
  const categoriasSeed = await prisma.category.findMany({
    where: { name: { in: [
      'Cuidados com o bebê',
      'Para a mamãe',
      'Primeiros meses',
      'Presentes e datas especiais',
      'Digitais e cursos',
    ] } }
  });

  // Mapear nome para id
  const catMap = Object.fromEntries(categoriasSeed.map(c => [c.name, c.id]));

  // Produtos de seed para cada categoria
  const produtosSeed = [
    {
      id: 'kit_higiene_baby',
      name: 'Kit Higiene Baby',
      description: 'Kit completo para cuidados diários do bebê: escova, pente, cortador de unhas e toalhinha.',
      type: 'product',
      category: 'Cuidados com o bebê',
      price: 12990,
      promoPrice: 9990,
      isPromo: true,
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-higiene-baby.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-higiene-baby.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-higiene-baby.jpg'
      ],
      categoryId: catMap['Cuidados com o bebê'],
      isActive: true,
      stock: 20,
    },
    {
      id: 'cinta_pos_parto_confort',
      name: 'Cinta Pós-Parto Confort',
      description: 'Cinta modeladora confortável para o pós-parto, com ajuste anatômico e tecido respirável.',
      type: 'product',
      category: 'Para a mamãe',
      price: 8990,
      promoPrice: 6990,
      isPromo: true,
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/cinta-pos-parto.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/cinta-pos-parto.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/cinta-pos-parto.jpg'
      ],
      categoryId: catMap['Para a mamãe'],
      isActive: true,
      stock: 15,
    },
    {
      id: 'body_algodao_primeiros_meses',
      name: 'Body Algodão Primeiros Meses',
      description: 'Body 100% algodão, macio e antialérgico, ideal para os primeiros meses do bebê.',
      type: 'product',
      category: 'Primeiros meses',
      price: 4990,
      promoPrice: 3990,
      isPromo: true,
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/body-primeiros-meses.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/body-primeiros-meses.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/body-primeiros-meses.jpg'
      ],
      categoryId: catMap['Primeiros meses'],
      isActive: true,
      stock: 30,
    },
    {
      id: 'kit_presente_maternidade',
      name: 'Kit Presente Maternidade',
      description: 'Kit presente especial com manta, naninha e cartão personalizado para datas comemorativas.',
      type: 'product',
      category: 'Presentes e datas especiais',
      price: 15990,
      promoPrice: 12990,
      isPromo: true,
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-presente-maternidade.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-presente-maternidade.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-presente-maternidade.jpg'
      ],
      categoryId: catMap['Presentes e datas especiais'],
      isActive: true,
      stock: 10,
    },
    {
      id: 'curso_primeiros_socorros',
      name: 'Curso Online: Primeiros Socorros para Bebês',
      description: 'Curso digital completo com vídeo-aulas e certificado, para pais e cuidadores.',
      type: 'product',
      category: 'Digitais e cursos',
      price: 7990,
      promoPrice: 4990,
      isPromo: true,
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/curso-primeiros-socorros.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/curso-primeiros-socorros.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/curso-primeiros-socorros.jpg'
      ],
      categoryId: catMap['Digitais e cursos'],
      isActive: true,
      stock: 50,
    },
  ].filter(p => !!p.categoryId);

  console.log('🎉 Seed concluído com sucesso!');

  // ===== CRIAR BANNERS DE EXEMPLO =====
  console.log('🎨 Criando banners de exemplo...');
  
  const banners = [
    {
      title: 'Produtos Essenciais para Bebês',
      subtitle: 'Tudo que você precisa para o seu pequeno',
      description: 'Descubra nossa seleção completa de produtos essenciais para bebês, desde roupas até brinquedos educativos.',
      imageUrl: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&h=400&fit=crop',
      bgGradient: 'bg-gradient-to-r from-pink-400 to-purple-500',
      ctaText: 'Ver Produtos',
      ctaLink: '/loja',
      badge: 'Novo',
      isActive: true,
      sortOrder: 1,
      targetUrl: '/loja',
      targetType: 'external',
      createdBy: 'system'
    },
    {
      title: 'Ofertas Especiais para Mães',
      subtitle: 'Descontos exclusivos até 50%',
      description: 'Aproveite nossas ofertas especiais em produtos selecionados para mães e bebês.',
      imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&h=400&fit=crop',
      bgGradient: 'bg-gradient-to-r from-blue-400 to-indigo-500',
      ctaText: 'Ver Ofertas',
      ctaLink: '/loja?promo=true',
      badge: 'Promoção',
      isActive: true,
      sortOrder: 2,
      targetUrl: '/loja?promo=true',
      targetType: 'external',
      createdBy: 'system'
    },
    {
      title: 'Produtos Orgânicos e Naturais',
      subtitle: 'Cuidado especial para o seu bebê',
      description: 'Produtos orgânicos e naturais para cuidar da saúde e bem-estar do seu bebê.',
      imageUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&h=400&fit=crop',
      bgGradient: 'bg-gradient-to-r from-green-400 to-teal-500',
      ctaText: 'Descobrir',
      ctaLink: '/loja/categoria/organicos',
      badge: 'Orgânico',
      isActive: true,
      sortOrder: 3,
      targetUrl: '/loja/categoria/organicos',
      targetType: 'category',
      targetId: 'organicos',
      createdBy: 'system'
    }
  ];

  for (const banner of banners) {
    await prisma.banner.create({
      data: banner
    });
  }
  console.log(`✅ ${banners.length} banners criados com sucesso!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 