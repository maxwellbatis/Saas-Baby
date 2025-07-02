const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkCourseVideos() {
  try {
    console.log('🔍 Verificando vídeos dos cursos...\n');
    
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
    });

    courses.forEach(course => {
      console.log(`📚 Curso: ${course.title}`);
      console.log(`   ID: ${course.id}`);
      console.log(`   Módulos: ${course.modules.length}`);
      
      course.modules.forEach(module => {
        console.log(`   📖 Módulo: ${module.title}`);
        console.log(`      Aulas: ${module.lessons.length}`);
        
        module.lessons.forEach(lesson => {
          console.log(`      🎬 Aula: ${lesson.title}`);
          console.log(`         ID: ${lesson.id}`);
          console.log(`         Video URL: ${lesson.videoUrl || 'NÃO DEFINIDA'}`);
          console.log(`         Thumbnail: ${lesson.thumbnail || 'NÃO DEFINIDA'}`);
          console.log(`         Duração: ${lesson.duration} segundos`);
          console.log('');
        });
      });
      console.log('---\n');
    });

    console.log('✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCourseVideos(); 