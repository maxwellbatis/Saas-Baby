const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addSampleVideo() {
  try {
    console.log('🎬 Adicionando vídeo de exemplo...\n');
    
    // Buscar a aula que não tem vídeo
    const lesson = await prisma.courseLesson.findFirst({
      where: {
        OR: [
          { videoUrl: null },
          { videoUrl: '' }
        ]
      },
      include: {
        module: {
          include: {
            course: true
          }
        }
      }
    });

    if (!lesson) {
      console.log('✅ Todas as aulas já têm vídeo!');
      return;
    }

    console.log(`📚 Aula encontrada: ${lesson.title}`);
    console.log(`📖 Módulo: ${lesson.module.title}`);
    console.log(`🎓 Curso: ${lesson.module.course.title}`);

    // URL de vídeo de exemplo (você pode substituir por uma URL real)
    const sampleVideoUrl = 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4';
    
    // Atualizar a aula com o vídeo de exemplo
    await prisma.courseLesson.update({
      where: { id: lesson.id },
      data: { videoUrl: sampleVideoUrl }
    });

    console.log(`✅ Vídeo adicionado: ${sampleVideoUrl}`);
    console.log('🎉 Aula atualizada com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleVideo(); 