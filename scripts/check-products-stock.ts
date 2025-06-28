import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductsStock() {
  try {
    console.log('🔍 Verificando produtos e estoque...\n');
    
    const products = await prisma.shopItem.findMany({
      select: {
        id: true,
        name: true,
        stock: true,
        isActive: true,
        price: true,
        category: true
      }
    });

    console.log(`📊 Total de produtos: ${products.length}\n`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Estoque: ${product.stock === null ? 'NULL' : product.stock}`);
      console.log(`   Tipo do estoque: ${typeof product.stock}`);
      console.log(`   Ativo: ${product.isActive}`);
      console.log(`   Preço: R$ ${(product.price / 100).toFixed(2)}`);
      console.log(`   Categoria: ${product.category}`);
      console.log('');
    });

    // Análise do estoque
    const semEstoque = products.filter(p => !p.stock || p.stock === 0);
    const comEstoque = products.filter(p => p.stock && p.stock > 0);
    const estoqueNull = products.filter(p => p.stock === null);

    console.log('📈 Análise do Estoque:');
    console.log(`   - Produtos sem estoque (0 ou null): ${semEstoque.length}`);
    console.log(`   - Produtos com estoque: ${comEstoque.length}`);
    console.log(`   - Produtos com estoque NULL: ${estoqueNull.length}`);
    console.log(`   - Produtos com estoque 0: ${products.filter(p => p.stock === 0).length}`);

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductsStock(); 