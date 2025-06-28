const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testBanners() {
  try {
    console.log('🔍 Testando banners...');
    
    const banners = await prisma.banner.findMany({
      take: 5
    });
    
    console.log('✅ Banners encontrados:', banners.length);
    
    if (banners.length > 0) {
      console.log('📋 Primeiro banner:', {
        id: banners[0].id,
        title: banners[0].title,
        location: banners[0].location,
        isActive: banners[0].isActive
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testBanners(); 