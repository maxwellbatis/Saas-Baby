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

  // Criar regras de gamificação padrão
  const gamificationRules = await Promise.all([
    prisma.gamificationRule.upsert({
      where: { id: 'first_signup' },
      update: {},
      create: {
        id: 'first_signup',
        name: 'Primeiro Cadastro',
        description: 'Parabéns por começar sua jornada!',
        points: 100,
        condition: 'first_signup',
        badgeIcon: 'star',
        category: 'milestone',
        isActive: true,
      },
    }),
    prisma.gamificationRule.upsert({
      where: { id: 'daily_login' },
      update: {},
      create: {
        id: 'daily_login',
        name: 'Login Diário',
        description: 'Mantendo a consistência!',
        points: 10,
        condition: 'daily_login',
        badgeIcon: 'calendar-check',
        category: 'daily',
        isActive: true,
      },
    }),
    prisma.gamificationRule.upsert({
      where: { id: 'first_activity' },
      update: {},
      create: {
        id: 'first_activity',
        name: 'Primeira Atividade',
        description: 'Começou a registrar!',
        points: 50,
        condition: 'first_activity',
        badgeIcon: 'plus-circle',
        category: 'milestone',
        isActive: true,
      },
    }),
    prisma.gamificationRule.upsert({
      where: { id: 'milestone_recorded' },
      update: {},
      create: {
        id: 'milestone_recorded',
        name: 'Marco Importante',
        description: 'Registrou um marco de desenvolvimento!',
        points: 200,
        condition: 'milestone_recorded',
        badgeIcon: 'trophy',
        category: 'milestone',
        isActive: true,
      },
    }),
    prisma.gamificationRule.upsert({
      where: { id: 'memory_created' },
      update: {},
      create: {
        id: 'memory_created',
        name: 'Memória Especial',
        description: 'Preservou um momento único!',
        points: 150,
        condition: 'memory_created',
        badgeIcon: 'heart',
        category: 'milestone',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Regras de gamificação criadas:', gamificationRules.length);

  // Criar templates de notificação padrão
  const notificationTemplates = await Promise.all([
    prisma.notificationTemplate.upsert({
      where: { name: 'welcome_email' },
      update: {},
      create: {
        name: 'welcome_email',
        type: 'email',
        subject: 'Bem-vindo ao Baby Diary!',
        body: `
          <h1>Olá {{name}}!</h1>
          <p>Seja bem-vindo ao Baby Diary! Estamos muito felizes em ter você conosco.</p>
          <p>Com o Baby Diary, você pode:</p>
          <ul>
            <li>Registrar todas as atividades do seu bebê</li>
            <li>Acompanhar marcos de desenvolvimento</li>
            <li>Preservar memórias especiais</li>
            <li>Receber insights personalizados</li>
          </ul>
          <p>Comece agora mesmo registrando seu primeiro bebê!</p>
          <p>Atenciosamente,<br>Equipe Baby Diary</p>
        `,
        isActive: true,
      },
    }),
    prisma.notificationTemplate.upsert({
      where: { name: 'subscription_canceled' },
      update: {},
      create: {
        name: 'subscription_canceled',
        type: 'email',
        subject: 'Sua assinatura foi cancelada',
        body: `
          <h1>Olá {{name}},</h1>
          <p>Sua assinatura do Baby Diary foi cancelada conforme solicitado.</p>
          <p>Você ainda tem acesso aos seus dados até o final do período de faturamento.</p>
          <p>Se mudou de ideia, você pode reativar sua assinatura a qualquer momento.</p>
          <p>Obrigado por ter escolhido o Baby Diary!</p>
          <p>Atenciosamente,<br>Equipe Baby Diary</p>
        `,
        isActive: true,
      },
    }),
    prisma.notificationTemplate.upsert({
      where: { name: 'new_badge' },
      update: {},
      create: {
        name: 'new_badge',
        type: 'push',
        subject: 'Novo Badge Conquistado!',
        body: 'Parabéns! Você conquistou o badge "{{badgeName}}"! Continue assim!',
        isActive: true,
      },
    }),
  ]);

  console.log('✅ Templates de notificação criados:', notificationTemplates.length);

  // Criar marcos sugeridos (SuggestedMilestone)
  const suggestedMilestones = await Promise.all([
    prisma.suggestedMilestone.upsert({
      where: { title: 'Descoberta da gravidez' },
      update: {},
      create: { title: 'Descoberta da gravidez', category: 'gravidez', sortOrder: 1, icon: 'pregnant' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Primeiro ultrassom' },
      update: {},
      create: { title: 'Primeiro ultrassom', category: 'gravidez', sortOrder: 2, icon: 'ultrasound' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Chá revelação' },
      update: {},
      create: { title: 'Chá revelação', category: 'gravidez', sortOrder: 3, icon: 'party' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Primeiro chute' },
      update: {},
      create: { title: 'Primeiro chute', category: 'gravidez', sortOrder: 4, icon: 'kick' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Chá de bebê' },
      update: {},
      create: { title: 'Chá de bebê', category: 'gravidez', sortOrder: 5, icon: 'party' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Nascimento' },
      update: {},
      create: { title: 'Nascimento', category: 'nascimento', sortOrder: 10, icon: 'baby' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Primeira foto' },
      update: {},
      create: { title: 'Primeira foto', category: 'nascimento', sortOrder: 11, icon: 'camera' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Primeira visita' },
      update: {},
      create: { title: 'Primeira visita', category: 'nascimento', sortOrder: 12, icon: 'users' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Saída da maternidade' },
      update: {},
      create: { title: 'Saída da maternidade', category: 'nascimento', sortOrder: 13, icon: 'home' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Primeiro sorriso' },
      update: {},
      create: { title: 'Primeiro sorriso', category: 'primeiro_ano', sortOrder: 20, icon: 'smile' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Rolar' },
      update: {},
      create: { title: 'Rolar', category: 'primeiro_ano', sortOrder: 21, icon: 'roll' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Sentar' },
      update: {},
      create: { title: 'Sentar', category: 'primeiro_ano', sortOrder: 22, icon: 'sit' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Engatinhar' },
      update: {},
      create: { title: 'Engatinhar', category: 'primeiro_ano', sortOrder: 23, icon: 'crawl' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Primeiros passos' },
      update: {},
      create: { title: 'Primeiros passos', category: 'primeiro_ano', sortOrder: 24, icon: 'walk' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Primeira palavra' },
      update: {},
      create: { title: 'Primeira palavra', category: 'primeiro_ano', sortOrder: 25, icon: 'chat' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Primeira papinha' },
      update: {},
      create: { title: 'Primeira papinha', category: 'primeiro_ano', sortOrder: 26, icon: 'food' },
    }),
    prisma.suggestedMilestone.upsert({
      where: { title: 'Primeira viagem' },
      update: {},
      create: { title: 'Primeira viagem', category: 'primeiro_ano', sortOrder: 27, icon: 'plane' },
    }),
  ]);
  console.log('✅ Marcos sugeridos criados:', suggestedMilestones.length);

  // Criar desafios semanais fixos
  const weeklyChallenges = await Promise.all([
    prisma.challenge.upsert({
      where: { code: 'weekly_activities_5' },
      update: {},
      create: {
        code: 'weekly_activities_5',
        name: 'Registrar 5 atividades na semana',
        description: 'Registre pelo menos 5 atividades do bebê nesta semana.',
        type: 'weekly',
        goal: 5,
        progressType: 'activities',
        points: 100,
        badge: 'Ativo da Semana',
        isActive: true,
      },
    }),
    prisma.challenge.upsert({
      where: { code: 'weekly_memories_3' },
      update: {},
      create: {
        code: 'weekly_memories_3',
        name: 'Registrar 3 memórias na semana',
        description: 'Registre pelo menos 3 memórias nesta semana.',
        type: 'weekly',
        goal: 3,
        progressType: 'memories',
        points: 120,
        badge: 'Memorável',
        isActive: true,
      },
    }),
    prisma.challenge.upsert({
      where: { code: 'weekly_badges_2' },
      update: {},
      create: {
        code: 'weekly_badges_2',
        name: 'Conquistar 2 medalhas',
        description: 'Conquiste 2 medalhas diferentes nesta semana.',
        type: 'weekly',
        goal: 2,
        progressType: 'badges',
        points: 200,
        badge: 'Colecionador',
        isActive: true,
      },
    }),
  ]);
  console.log('✅ Desafios semanais fixos criados:', weeklyChallenges.length);

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