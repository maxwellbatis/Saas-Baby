import React from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

const benefits = [
  {
    icon: '📸',
    title: 'Memórias Eternas',
    items: [
      'Captura cada momento especial - do primeiro sorriso ao primeiro passo',
      'Fotos organizadas por marcos',
      'Compartilhamento com família em tempo real',
      'Histórico completo mês a mês',
      'Exportação de memórias em PDF',
      'Diário de emoções e sentimentos',
    ],
  },
  {
    icon: '🧠',
    title: 'Tranquilidade Mental',
    items: [
      'Acompanhamento médico completo',
      'Alertas inteligentes para consultas e vacinas',
      'Padrões de sono e alimentação',
      'Dicas personalizadas',
      'Relatórios de desenvolvimento',
      'Lembretes automáticos integrados ao calendário',
    ],
  },
  {
    icon: '🎮',
    title: 'Gamificação que Motiva',
    items: [
      'Sistema de recompensas',
      'Desafios semanais',
      'Badges e conquistas',
      'Ranking com outras mães',
      'Missões diárias para engajamento',
    ],
  },
  {
    icon: '🔗',
    title: 'Integração e Compartilhamento',
    items: [
      'Integração com WhatsApp e redes sociais',
      'Convide familiares para colaborar',
      'Álbum digital compartilhável',
    ],
  },
];

const businessAdvantages = [
  {
    icon: '✅',
    title: 'Produto 100% Pronto',
    items: [
      'Zero desenvolvimento: comece a vender hoje',
      'Tecnologia moderna: React, TypeScript, IA',
      'Infraestrutura escalável para milhares de usuários',
      'Monetização ativa via Stripe',
      'Suporte técnico e documentação completa',
    ],
  },
  {
    icon: '💰',
    title: 'Monetização Garantida',
    items: [
      '3 planos de assinatura: Básico, Premium e Família',
      'Receita recorrente mensal e anual',
      'Taxa de conversão alta em nicho emocional',
      'Upselling automático e cross-sell integrado',
      'Gestão de assinaturas fácil e transparente',
    ],
  },
  {
    icon: '📈',
    title: 'Escalabilidade e Crescimento',
    items: [
      'Margem alta: custos fixos, receita crescente',
      'Automação total: funciona 24/7',
      'Crescimento orgânico: mães compartilham naturalmente',
      'Retenção alta: produto viciante e emocional',
      'Analytics detalhado para decisões estratégicas',
    ],
  },
  {
    icon: '🚀',
    title: 'Diferenciais Competitivos',
    items: [
      'Único com IA integrada para análise e previsões',
      'Gamificação avançada para engajamento',
      'Painel admin completo e intuitivo',
      'Marketing automatizado e segmentado',
      'Comunidade integrada e suporte ao cliente',
    ],
  },
];

const featuresMoms = [
  'Diário digital: memórias, fotos e vídeos',
  'Marcos de desenvolvimento e conquistas',
  'Atividades e rotinas personalizadas',
  'Saúde e vacinas: calendário médico completo',
  'IA personalizada: dicas e análises inteligentes',
  'Compartilhamento familiar: convide e conecte toda a família',
  'Gamificação: pontos, badges, desafios e missões',
  'Exportação de memórias em PDF',
  'Relatórios de desenvolvimento do bebê',
  'Lembretes automáticos e integração com calendário',
  'Diário de emoções e sentimentos',
  'Álbum digital compartilhável',
  'Integração com WhatsApp e redes sociais',
];

const featuresAdmin = [
  'Dashboard completo com métricas em tempo real',
  'Gestão de usuários e assinaturas',
  'Sistema de planos flexível',
  'Marketing avançado: campanhas automáticas e segmentação',
  'Biblioteca de conteúdo: posts, anúncios e argumentos de venda',
  'IA para marketing: geração automática de conteúdo',
  'Analytics detalhado: comportamento e conversões',
  'Suporte técnico e documentação',
];

const marketData = [
  'Mercado materno: 2.5 milhões de bebês/ano no Brasil',
  'Poder aquisitivo: mães investem em produtos para filhos',
  'Tempo no celular: 4+ horas/dia',
  'Compartilhamento natural: mães são influenciadoras',
];

const differentials = [
  {
    icon: '🤖',
    title: 'IA Integrada e Personalizada',
    desc: 'O único app do nicho com inteligência artificial que entende padrões, sugere dicas e antecipa necessidades das mães e do bebê.'
  },
  {
    icon: '🎮',
    title: 'Gamificação Avançada',
    desc: 'Sistema de pontos, badges, desafios e ranking que mantém o engajamento das mães por anos, tornando o registro de memórias divertido e motivador.'
  },
  {
    icon: '🛠️',
    title: 'Painel Admin Completo',
    desc: 'Gestão total do negócio: usuários, planos, marketing, conteúdo e analytics em um painel intuitivo e poderoso.'
  },
  {
    icon: '📣',
    title: 'Marketing Integrado',
    desc: 'Ferramentas automáticas de campanhas, segmentação e geração de conteúdo com IA para escalar vendas sem esforço manual.'
  },
  {
    icon: '🤝',
    title: 'Comunidade Ativa e Suporte Dedicado',
    desc: 'Rede social exclusiva para mães, suporte humanizado e comunidade que gera retenção e viralização orgânica.'
  },
];

const finalArguments = [
  {
    icon: '🚀',
    title: 'Produto Pronto, Zero Risco',
    desc: 'Comece a vender hoje mesmo. Sem custos de desenvolvimento, sem dor de cabeça técnica.'
  },
  {
    icon: '💸',
    title: 'Receita Recorrente e Alta Retenção',
    desc: 'Assinaturas mensais e anuais garantem previsibilidade e crescimento constante.'
  },
  {
    icon: '🌍',
    title: 'Escalabilidade Infinita',
    desc: 'Infraestrutura robusta e automação total: cada novo usuário aumenta sua receita sem aumentar seu trabalho.'
  },
  {
    icon: '📈',
    title: 'Margem Alta',
    desc: 'Modelo SaaS com custos fixos baixos e potencial de lucro exponencial.'
  },
  {
    icon: '✨',
    title: 'Diferencial Tecnológico e Emocional',
    desc: 'Tecnologia de ponta aliada ao apelo emocional: mães investem em memórias e tranquilidade, não apenas em apps.'
  },
];

const futureFeatures = [
  {
    icon: '🛒',
    title: 'Marketplace Integrado',
    desc: 'Em breve, mães poderão comprar e vender produtos e serviços diretamente pelo app, criando uma economia colaborativa e facilitando o acesso a itens essenciais para o universo materno.'
  },
  {
    icon: '🤝',
    title: 'Programa de Afiliados',
    desc: 'Qualquer pessoa poderá indicar o Baby Diary e ganhar comissão por cada nova mãe assinante, potencializando o crescimento e criando uma rede de promotores do app.'
  },
];

export default function Business() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-100 pb-20">
      {/* Hero Section */}
      <section className="text-center py-16 px-4 bg-gradient-to-r from-pink-200 via-blue-100 to-purple-200 shadow-lg relative">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-blue-600 to-purple-600 drop-shadow-lg">🍼 BABY DIARY</h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-800">O APP DEFINITIVO PARA MÃES QUE QUEREM DOCUMENTAR CADA MOMENTO ESPECIAL</h2>
        <p className="text-xl md:text-2xl mb-8 text-gray-700 max-w-2xl mx-auto">SaaS completo, pronto para vender, que conecta emoção, tecnologia e negócios. Veja ao vivo ou acesse o painel admin para conhecer o potencial!</p>
        <div className="flex flex-col md:flex-row justify-center gap-4 mb-4">
          <a href="https://babydiary.shop/" target="_blank" rel="noopener noreferrer">
            <Button className="text-lg px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl hover:scale-105 transition">Ver o App ao Vivo</Button>
          </a>
          <a href="https://babydiary.shop/admin/login" target="_blank" rel="noopener noreferrer">
            <Button className="text-lg px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-xl hover:scale-105 transition">Acessar Painel Admin</Button>
          </a>
        </div>
        <div className="mt-6">
          <Button className="text-lg px-8 py-4 bg-green-600 hover:bg-green-700 shadow-lg">Quero ser parceiro</Button>
        </div>
      </section>

      {/* Benefícios Emocionais */}
      <section className="mb-12 py-12 bg-white/80">
        <h3 className="text-3xl font-bold mb-8 text-center text-pink-700">💖 Benefícios Emocionais para as Mães</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {benefits.map((b) => (
            <Card key={b.title} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full">
              <div className="text-5xl mb-3">{b.icon}</div>
              <h4 className="font-semibold text-xl mb-3 text-blue-700">{b.title}</h4>
              <ul className="text-left list-disc pl-4 text-gray-700">
                {b.items.map((item, i) => (
                  <li key={i} className="mb-1">{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Funcionalidades para as Mães */}
      <section className="mb-12 py-12 bg-gradient-to-r from-blue-50 to-purple-100">
        <h3 className="text-3xl font-bold mb-8 text-center text-purple-700">✨ Funcionalidades Exclusivas para as Mães</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {featuresMoms.map((f, i) => (
            <Card key={i} className="p-6 flex items-center gap-4 shadow hover:shadow-lg transition">
              <span className="text-2xl">✔️</span>
              <span className="text-lg text-gray-800">{f}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Vantagens de Negócio */}
      <section className="mb-12 py-12 bg-white/80">
        <h3 className="text-3xl font-bold mb-8 text-center text-blue-700">🚀 Benefícios de Negócio para Infoprodutores</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {businessAdvantages.map((b) => (
            <Card key={b.title} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full">
              <div className="text-5xl mb-3">{b.icon}</div>
              <h4 className="font-semibold text-xl mb-3 text-pink-700">{b.title}</h4>
              <ul className="text-left list-disc pl-4 text-gray-700">
                {b.items.map((item, i) => (
                  <li key={i} className="mb-1">{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Funcionalidades para o Admin */}
      <section className="mb-12 py-12 bg-gradient-to-r from-pink-50 to-blue-100">
        <h3 className="text-3xl font-bold mb-8 text-center text-pink-700">⚙️ Funcionalidades do Painel Admin</h3>
        <div className="grid md:grid-cols-2 gap-10 max-w-4xl mx-auto">
          {featuresAdmin.map((f, i) => (
            <Card key={i} className="p-6 flex items-center gap-4 shadow hover:shadow-lg transition">
              <span className="text-2xl">🛠️</span>
              <span className="text-lg text-gray-800">{f}</span>
            </Card>
          ))}
        </div>
      </section>

      {/* Oportunidade de Mercado */}
      <section className="mb-12 py-12 bg-white/80">
        <h3 className="text-3xl font-bold mb-8 text-center text-blue-700">🎯 Oportunidade de Mercado</h3>
        <ul className="list-disc pl-8 text-lg max-w-3xl mx-auto text-gray-700">
          {marketData.map((d, i) => <li key={i} className="mb-2">{d}</li>)}
        </ul>
      </section>

      {/* Diferenciais Competitivos */}
      <section className="mb-12 py-12 bg-gradient-to-r from-blue-50 to-purple-100">
        <h3 className="text-3xl font-bold mb-8 text-center text-purple-700">💎 Diferenciais Competitivos</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {differentials.map((d, i) => (
            <Card key={i} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full text-center">
              <div className="text-4xl mb-3">{d.icon}</div>
              <h4 className="font-semibold text-xl mb-2 text-blue-700">{d.title}</h4>
              <p className="text-gray-700 text-base">{d.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Argumento Final */}
      <section className="mb-12 py-12 bg-white/80">
        <h3 className="text-3xl font-bold mb-8 text-center text-pink-700">🔥 Por que investir agora?</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {finalArguments.map((a, i) => (
            <Card key={i} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full text-center">
              <div className="text-4xl mb-3">{a.icon}</div>
              <h4 className="font-semibold text-xl mb-2 text-pink-700">{a.title}</h4>
              <p className="text-gray-700 text-base">{a.desc}</p>
            </Card>
          ))}
        </div>
        <p className="text-2xl text-center font-semibold my-8 text-pink-700 max-w-2xl mx-auto">O Baby Diary não vende um app. Vende a promessa de que nenhum momento especial será perdido. E essa promessa é irresistível para qualquer mãe.</p>
        <div className="flex justify-center">
          <Button className="text-lg px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xl hover:scale-105 transition">Quero ser parceiro</Button>
        </div>
      </section>

      {/* Funcionalidades Futuras */}
      <section className="mb-12 py-12 bg-gradient-to-r from-yellow-50 to-pink-100">
        <h3 className="text-3xl font-bold mb-8 text-center text-yellow-700">🌟 Funcionalidades Futuras</h3>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {futureFeatures.map((f, i) => (
            <Card key={i} className="p-8 flex flex-col items-center shadow-md hover:shadow-xl transition h-full text-center">
              <div className="text-4xl mb-3">{f.icon}</div>
              <h4 className="font-semibold text-xl mb-2 text-pink-700">{f.title}</h4>
              <p className="text-gray-700 text-base">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
} 