import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateSeedProducts() {
  console.log('🔄 Atualizando produtos do seed com URLs do Cloudinary...');

  const productsToUpdate = [
    {
      id: 'kit_higiene_baby',
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-higiene-baby.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-higiene-baby.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-higiene-baby.jpg'
      ]
    },
    {
      id: 'cinta_pos_parto_confort',
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/cinta-pos-parto.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/cinta-pos-parto.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/cinta-pos-parto.jpg'
      ]
    },
    {
      id: 'body_algodao_primeiros_meses',
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/body-primeiros-meses.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/body-primeiros-meses.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/body-primeiros-meses.jpg'
      ]
    },
    {
      id: 'kit_presente_maternidade',
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-presente-maternidade.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-presente-maternidade.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/kit-presente-maternidade.jpg'
      ]
    },
    {
      id: 'curso_primeiros_socorros',
      imageUrl: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/curso-primeiros-socorros.jpg',
      mainImage: 'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/curso-primeiros-socorros.jpg',
      gallery: [
        'https://res.cloudinary.com/dtsxoky7o/image/upload/v1751067997/baby-diary/marketing/images/curso-primeiros-socorros.jpg'
      ]
    }
  ];

  for (const product of productsToUpdate) {
    try {
      await prisma.shopItem.update({
        where: { id: product.id },
        data: {
          imageUrl: product.imageUrl,
          mainImage: product.mainImage,
          gallery: product.gallery
        }
      });
      console.log(`✅ Produto ${product.id} atualizado com sucesso`);
    } catch (error) {
      console.log(`❌ Erro ao atualizar produto ${product.id}:`, error);
    }
  }

  console.log('🎉 Atualização concluída!');
}

updateSeedProducts()
  .catch((e) => {
    console.error('❌ Erro durante a atualização:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 