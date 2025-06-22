"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = require("../src/utils/bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Iniciando seed do banco de dados...');
    const adminPassword = await (0, bcrypt_1.hashPassword)(process.env.ADMIN_PASSWORD || 'admin123');
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
    const plans = await Promise.all([
        prisma.plan.upsert({
            where: { name: 'Básico' },
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
                photoQuality: 'low',
                familySharing: 2,
                exportFeatures: false,
                prioritySupport: false,
                stripePriceId: 'price_basic_free',
                isActive: true,
            },
        }),
        prisma.plan.upsert({
            where: { name: 'Premium' },
            update: {},
            create: {
                name: 'Premium',
                price: 19.90,
                yearlyPrice: 199.90,
                features: [
                    'Registro de até 5 bebês',
                    'Diário de memórias ilimitado',
                    'Todos os tipos de atividades',
                    'Fotos em alta resolução',
                    'Marcos do desenvolvimento personalizados',
                    'Backup automático na nuvem',
                    'Compartilhamento com até 5 familiares',
                    'Exportação mensal de memórias',
                    'Suporte prioritário',
                    'Assistente IA',
                    'Análises avançadas',
                ],
                userLimit: 5,
                memoryLimit: null,
                photoQuality: 'high',
                familySharing: 5,
                exportFeatures: true,
                prioritySupport: true,
                stripePriceId: 'price_premium_monthly',
                stripeYearlyPriceId: 'price_premium_yearly',
                isActive: true,
            },
        }),
        prisma.plan.upsert({
            where: { name: 'Família' },
            update: {},
            create: {
                name: 'Família',
                price: 29.90,
                yearlyPrice: 299.90,
                features: [
                    'Registro de bebês ilimitado',
                    'Diário de memórias ilimitado',
                    'Todos os tipos de atividades',
                    'Fotos e vídeos em alta resolução',
                    'Marcos do desenvolvimento personalizados',
                    'Backup automático na nuvem',
                    'Compartilhamento ilimitado com familiares',
                    'Exportação em diversos formatos',
                    'Álbuns de memórias impressos anuais',
                    'Relatórios avançados de desenvolvimento',
                    'Suporte VIP 24/7',
                    'Assistente IA avançado',
                    'Consultoria personalizada',
                ],
                userLimit: 999,
                memoryLimit: null,
                photoQuality: 'high',
                familySharing: 999,
                exportFeatures: true,
                prioritySupport: true,
                stripePriceId: 'price_family_monthly',
                stripeYearlyPriceId: 'price_family_yearly',
                isActive: true,
            },
        }),
    ]);
    console.log('✅ Planos criados:', plans.map(p => p.name));
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
    const gamificationRules = await Promise.all([
        prisma.gamificationRule.upsert({
            where: { name: 'Primeiro Cadastro' },
            update: {},
            create: {
                name: 'Primeiro Cadastro',
                description: 'Parabéns por começar sua jornada!',
                points: 100,
                condition: 'first_signup',
                badgeIcon: 'star',
                isActive: true,
            },
        }),
        prisma.gamificationRule.upsert({
            where: { name: 'Login Diário' },
            update: {},
            create: {
                name: 'Login Diário',
                description: 'Mantendo a consistência!',
                points: 10,
                condition: 'daily_login',
                badgeIcon: 'calendar-check',
                isActive: true,
            },
        }),
        prisma.gamificationRule.upsert({
            where: { name: 'Primeira Atividade' },
            update: {},
            create: {
                name: 'Primeira Atividade',
                description: 'Começou a registrar!',
                points: 50,
                condition: 'first_activity',
                badgeIcon: 'plus-circle',
                isActive: true,
            },
        }),
        prisma.gamificationRule.upsert({
            where: { name: 'Marco Importante' },
            update: {},
            create: {
                name: 'Marco Importante',
                description: 'Registrou um marco de desenvolvimento!',
                points: 200,
                condition: 'milestone_recorded',
                badgeIcon: 'trophy',
                isActive: true,
            },
        }),
        prisma.gamificationRule.upsert({
            where: { name: 'Memória Especial' },
            update: {},
            create: {
                name: 'Memória Especial',
                description: 'Preservou um momento único!',
                points: 150,
                condition: 'memory_created',
                badgeIcon: 'heart',
                isActive: true,
            },
        }),
    ]);
    console.log('✅ Regras de gamificação criadas:', gamificationRules.length);
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
//# sourceMappingURL=seed.js.map