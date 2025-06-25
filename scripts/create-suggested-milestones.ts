import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createSuggestedMilestones() {
  try {
    console.log('🌱 Criando marcos sugeridos...\n');

    const suggestedMilestones = [
      // Marcos de gravidez
      {
        title: 'Primeiro ultrassom',
        category: 'gravidez',
        sortOrder: 1,
        isActive: true,
        icon: '👶'
      },
      {
        title: 'Descoberta do sexo',
        category: 'gravidez',
        sortOrder: 2,
        isActive: true,
        icon: '🎀'
      },
      {
        title: 'Primeira vez que sentiu o bebê mexer',
        category: 'gravidez',
        sortOrder: 3,
        isActive: true,
        icon: '🦋'
      },
      {
        title: 'Chá de bebê',
        category: 'gravidez',
        sortOrder: 4,
        isActive: true,
        icon: '🎁'
      },

      // Marcos de nascimento
      {
        title: 'Nascimento',
        category: 'nascimento',
        sortOrder: 5,
        isActive: true,
        icon: '🌟'
      },
      {
        title: 'Primeira vez que segurou no colo',
        category: 'nascimento',
        sortOrder: 6,
        isActive: true,
        icon: '🤱'
      },
      {
        title: 'Primeira mamada',
        category: 'nascimento',
        sortOrder: 7,
        isActive: true,
        icon: '🍼'
      },
      {
        title: 'Primeira troca de fralda',
        category: 'nascimento',
        sortOrder: 8,
        isActive: true,
        icon: '👶'
      },

      // Marcos do primeiro mês
      {
        title: 'Primeiro sorriso',
        category: 'primeiro_mes',
        sortOrder: 9,
        isActive: true,
        icon: '😊'
      },
      {
        title: 'Primeira vez que segurou a cabeça',
        category: 'primeiro_mes',
        sortOrder: 10,
        isActive: true,
        icon: '💪'
      },
      {
        title: 'Primeira vez que fez contato visual',
        category: 'primeiro_mes',
        sortOrder: 11,
        isActive: true,
        icon: '👀'
      },
      {
        title: 'Primeira vez que reagiu ao som',
        category: 'primeiro_mes',
        sortOrder: 12,
        isActive: true,
        icon: '🔊'
      },

      // Marcos do segundo mês
      {
        title: 'Primeiro balbucio',
        category: 'segundo_mes',
        sortOrder: 13,
        isActive: true,
        icon: '🗣️'
      },
      {
        title: 'Primeira vez que segurou um objeto',
        category: 'segundo_mes',
        sortOrder: 14,
        isActive: true,
        icon: '🤏'
      },
      {
        title: 'Primeira vez que rolou',
        category: 'segundo_mes',
        sortOrder: 15,
        isActive: true,
        icon: '🔄'
      },
      {
        title: 'Primeira vez que riu alto',
        category: 'segundo_mes',
        sortOrder: 16,
        isActive: true,
        icon: '😄'
      },

      // Marcos do terceiro mês
      {
        title: 'Primeira vez que sentou com apoio',
        category: 'terceiro_mes',
        sortOrder: 17,
        isActive: true,
        icon: '🪑'
      },
      {
        title: 'Primeira vez que pegou algo com as duas mãos',
        category: 'terceiro_mes',
        sortOrder: 18,
        isActive: true,
        icon: '🤲'
      },
      {
        title: 'Primeira vez que reconheceu o próprio nome',
        category: 'terceiro_mes',
        sortOrder: 19,
        isActive: true,
        icon: '📝'
      },
      {
        title: 'Primeira vez que fez sons de vogais',
        category: 'terceiro_mes',
        sortOrder: 20,
        isActive: true,
        icon: '🎵'
      },

      // Marcos do quarto mês
      {
        title: 'Primeira vez que sentou sem apoio',
        category: 'quarto_mes',
        sortOrder: 21,
        isActive: true,
        icon: '🧘'
      },
      {
        title: 'Primeira vez que passou objeto de uma mão para outra',
        category: 'quarto_mes',
        sortOrder: 22,
        isActive: true,
        icon: '🔄'
      },
      {
        title: 'Primeira vez que fez "agá"',
        category: 'quarto_mes',
        sortOrder: 23,
        isActive: true,
        icon: '👋'
      },
      {
        title: 'Primeira vez que demonstrou preferência por brinquedos',
        category: 'quarto_mes',
        sortOrder: 24,
        isActive: true,
        icon: '🧸'
      },

      // Marcos do quinto mês
      {
        title: 'Primeira vez que ficou de bruços e levantou a cabeça',
        category: 'quinto_mes',
        sortOrder: 25,
        isActive: true,
        icon: '🦒'
      },
      {
        title: 'Primeira vez que fez sons de consoantes',
        category: 'quinto_mes',
        sortOrder: 26,
        isActive: true,
        icon: '🗣️'
      },
      {
        title: 'Primeira vez que demonstrou medo de estranhos',
        category: 'quinto_mes',
        sortOrder: 27,
        isActive: true,
        icon: '😰'
      },
      {
        title: 'Primeira vez que tentou pegar objetos fora do alcance',
        category: 'quinto_mes',
        sortOrder: 28,
        isActive: true,
        icon: '🤲'
      },

      // Marcos do sexto mês
      {
        title: 'Primeira vez que ficou sentado sozinho',
        category: 'sexto_mes',
        sortOrder: 29,
        isActive: true,
        icon: '🧘‍♂️'
      },
      {
        title: 'Primeira vez que rolou de costas para barriga',
        category: 'sexto_mes',
        sortOrder: 30,
        isActive: true,
        icon: '🔄'
      },
      {
        title: 'Primeira vez que fez "mamã" ou "papá"',
        category: 'sexto_mes',
        sortOrder: 31,
        isActive: true,
        icon: '👨‍👩‍👧‍👦'
      },
      {
        title: 'Primeira vez que demonstrou curiosidade por espelhos',
        category: 'sexto_mes',
        sortOrder: 32,
        isActive: true,
        icon: '🪞'
      },

      // Marcos do sétimo mês
      {
        title: 'Primeira vez que ficou de pé com apoio',
        category: 'setimo_mes',
        sortOrder: 33,
        isActive: true,
        icon: '🦵'
      },
      {
        title: 'Primeira vez que fez "tchau"',
        category: 'setimo_mes',
        sortOrder: 34,
        isActive: true,
        icon: '👋'
      },
      {
        title: 'Primeira vez que bateu palmas',
        category: 'setimo_mes',
        sortOrder: 35,
        isActive: true,
        icon: '👏'
      },
      {
        title: 'Primeira vez que demonstrou preferência por pessoas',
        category: 'setimo_mes',
        sortOrder: 36,
        isActive: true,
        icon: '❤️'
      },

      // Marcos do oitavo mês
      {
        title: 'Primeira vez que engatinhou',
        category: 'oitavo_mes',
        sortOrder: 37,
        isActive: true,
        icon: '🦀'
      },
      {
        title: 'Primeira vez que ficou de pé sozinho',
        category: 'oitavo_mes',
        sortOrder: 38,
        isActive: true,
        icon: '🦵'
      },
      {
        title: 'Primeira vez que fez "não" com a cabeça',
        category: 'oitavo_mes',
        sortOrder: 39,
        isActive: true,
        icon: '🙅'
      },
      {
        title: 'Primeira vez que demonstrou ansiedade de separação',
        category: 'oitavo_mes',
        sortOrder: 40,
        isActive: true,
        icon: '😢'
      },

      // Marcos do nono mês
      {
        title: 'Primeira vez que deu os primeiros passos',
        category: 'nono_mes',
        sortOrder: 41,
        isActive: true,
        icon: '🚶'
      },
      {
        title: 'Primeira vez que fez "sim" com a cabeça',
        category: 'nono_mes',
        sortOrder: 42,
        isActive: true,
        icon: '🙆'
      },
      {
        title: 'Primeira vez que apontou para objetos',
        category: 'nono_mes',
        sortOrder: 43,
        isActive: true,
        icon: '👆'
      },
      {
        title: 'Primeira vez que demonstrou compreensão de comandos simples',
        category: 'nono_mes',
        sortOrder: 44,
        isActive: true,
        icon: '🧠'
      },

      // Marcos do décimo mês
      {
        title: 'Primeira vez que andou sozinho',
        category: 'decimo_mes',
        sortOrder: 45,
        isActive: true,
        icon: '🚶‍♂️'
      },
      {
        title: 'Primeira vez que falou uma palavra com significado',
        category: 'decimo_mes',
        sortOrder: 46,
        isActive: true,
        icon: '💬'
      },
      {
        title: 'Primeira vez que demonstrou preferência por mão dominante',
        category: 'decimo_mes',
        sortOrder: 47,
        isActive: true,
        icon: '✋'
      },
      {
        title: 'Primeira vez que imitou ações simples',
        category: 'decimo_mes',
        sortOrder: 48,
        isActive: true,
        icon: '🎭'
      },

      // Marcos do décimo primeiro mês
      {
        title: 'Primeira vez que subiu escadas engatinhando',
        category: 'decimo_primeiro_mes',
        sortOrder: 49,
        isActive: true,
        icon: '🪜'
      },
      {
        title: 'Primeira vez que fez gestos para músicas',
        category: 'decimo_primeiro_mes',
        sortOrder: 50,
        isActive: true,
        icon: '🎵'
      },
      {
        title: 'Primeira vez que demonstrou compreensão de "não"',
        category: 'decimo_primeiro_mes',
        sortOrder: 51,
        isActive: true,
        icon: '🚫'
      },
      {
        title: 'Primeira vez que demonstrou preferência por brincadeiras',
        category: 'decimo_primeiro_mes',
        sortOrder: 52,
        isActive: true,
        icon: '🎮'
      },

      // Marcos do primeiro ano
      {
        title: 'Primeiro aniversário',
        category: 'primeiro_ano',
        sortOrder: 53,
        isActive: true,
        icon: '🎂'
      },
      {
        title: 'Primeira vez que andou com confiança',
        category: 'primeiro_ano',
        sortOrder: 54,
        isActive: true,
        icon: '🏃'
      },
      {
        title: 'Primeira vez que falou várias palavras',
        category: 'primeiro_ano',
        sortOrder: 55,
        isActive: true,
        icon: '🗣️'
      },
      {
        title: 'Primeira vez que demonstrou personalidade própria',
        category: 'primeiro_ano',
        sortOrder: 56,
        isActive: true,
        icon: '🌟'
      }
    ];

    for (const milestone of suggestedMilestones) {
      await prisma.suggestedMilestone.upsert({
        where: { title: milestone.title },
        update: milestone,
        create: milestone,
      });
      console.log(`✅ ${milestone.icon} ${milestone.title} (${milestone.category})`);
    }

    console.log(`\n🎉 ${suggestedMilestones.length} marcos sugeridos criados/atualizados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao criar marcos sugeridos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSuggestedMilestones(); 