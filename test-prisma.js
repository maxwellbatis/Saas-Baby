const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('Testando Prisma Client...');
    
    // Testar se os modelos existem
    console.log('Verificando modelos...');
    
    // Testar GamificationRanking
    try {
      const rankings = await prisma.gamificationRanking.findMany({ take: 1 });
      console.log('✅ GamificationRanking funciona');
    } catch (error) {
      console.log('❌ GamificationRanking não funciona:', error.message);
    }
    
    // Testar ShopItem
    try {
      const items = await prisma.shopItem.findMany({ take: 1 });
      console.log('✅ ShopItem funciona');
    } catch (error) {
      console.log('❌ ShopItem não funciona:', error.message);
    }
    
    // Testar UserPurchase
    try {
      const purchases = await prisma.userPurchase.findMany({ take: 1 });
      console.log('✅ UserPurchase funciona');
    } catch (error) {
      console.log('❌ UserPurchase não funciona:', error.message);
    }
    
    // Testar DailyMission
    try {
      const missions = await prisma.dailyMission.findMany({ take: 1 });
      console.log('✅ DailyMission funciona');
    } catch (error) {
      console.log('❌ DailyMission não funciona:', error.message);
    }
    
    // Testar UserMission
    try {
      const userMissions = await prisma.userMission.findMany({ take: 1 });
      console.log('✅ UserMission funciona');
    } catch (error) {
      console.log('❌ UserMission não funciona:', error.message);
    }
    
    // Testar SpecialEvent
    try {
      const events = await prisma.specialEvent.findMany({ take: 1 });
      console.log('✅ SpecialEvent funciona');
    } catch (error) {
      console.log('❌ SpecialEvent não funciona:', error.message);
    }
    
    // Testar UserEvent
    try {
      const userEvents = await prisma.userEvent.findMany({ take: 1 });
      console.log('✅ UserEvent funciona');
    } catch (error) {
      console.log('❌ UserEvent não funciona:', error.message);
    }
    
    // Testar AIReward
    try {
      const aiRewards = await prisma.aIReward.findMany({ take: 1 });
      console.log('✅ AIReward funciona');
    } catch (error) {
      console.log('❌ AIReward não funciona:', error.message);
    }
    
    // Testar UserAIReward
    try {
      const userAIRewards = await prisma.userAIReward.findMany({ take: 1 });
      console.log('✅ UserAIReward funciona');
    } catch (error) {
      console.log('❌ UserAIReward não funciona:', error.message);
    }
    
  } catch (error) {
    console.error('Erro geral:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma(); 