import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import streamifier from 'streamifier';

const prisma = new PrismaClient();

// Função para buscar as configs do .env
export async function getCloudinaryConfig() {
  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
    api_key: process.env.CLOUDINARY_API_KEY || '',
    api_secret: process.env.CLOUDINARY_API_SECRET || '',
  };
}

// Função para garantir configuração dinâmica antes de cada uso
async function ensureCloudinaryConfigured() {
  const config = await getCloudinaryConfig();
  if (config.cloud_name && config.api_key && config.api_secret) {
    cloudinary.config(config);
    return true;
  } else {
    console.log('⚠️ Cloudinary não configurado - verifique as variáveis de ambiente ou integração');
    return false;
  }
}

// Função para fazer upload de mídia (imagem ou vídeo)
export const uploadMedia = async (
  file: Express.Multer.File,
  folder: string = 'baby-diary'
): Promise<{ url: string; publicId: string; secureUrl: string }> => {
  await ensureCloudinaryConfigured();
  try {
    // Converter o buffer para base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    // Determinar se é vídeo ou imagem
    const isVideo = file.mimetype.startsWith('video/');
    const resourceType = isVideo ? 'video' : 'image';

    // Configurações específicas para vídeo
    const uploadOptions: any = {
      folder,
      resource_type: resourceType,
    };

    if (isVideo) {
      uploadOptions.transformation = [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ];
    } else {
      uploadOptions.transformation = [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ];
    }

    // Fazer upload para o Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, uploadOptions);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (error) {
    console.error('Erro ao fazer upload de mídia para o Cloudinary:', error);
    throw new Error('Falha ao fazer upload da mídia para o Cloudinary');
  }
};

// Função para fazer upload de imagem (mantida para compatibilidade)
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string = 'baby-diary'
): Promise<{ url: string; publicId: string; secureUrl: string }> => {
  return uploadMedia(file, folder);
};

// Função para deletar imagem
export const deleteImage = async (publicId: string): Promise<void> => {
  await ensureCloudinaryConfigured();
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Erro ao deletar imagem do Cloudinary:', error);
    throw new Error('Falha ao deletar imagem do Cloudinary');
  }
};

// Função para otimizar imagem
export const optimizeImage = async (
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: string;
    format?: string;
  } = {}
): Promise<string> => {
  await ensureCloudinaryConfigured();
  try {
    const transformation = [];
    
    if (options.width) transformation.push({ width: options.width });
    if (options.height) transformation.push({ height: options.height });
    if (options.quality) transformation.push({ quality: options.quality });
    if (options.format) transformation.push({ fetch_format: options.format });

    const url = cloudinary.url(publicId, {
      transformation,
      secure: true,
    });

    return url;
  } catch (error) {
    console.error('Erro ao otimizar imagem:', error);
    throw new Error('Falha ao otimizar imagem');
  }
};

// Função para gerar URL de preview
export const generatePreviewUrl = async (
  publicId: string,
  width: number = 300,
  height: number = 300
): Promise<string> => {
  await ensureCloudinaryConfigured();
  try {
    return cloudinary.url(publicId, {
      transformation: [
        { width, height, crop: 'fill' },
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
      secure: true,
    });
  } catch (error) {
    console.error('Erro ao gerar URL de preview:', error);
    throw new Error('Falha ao gerar URL de preview');
  }
};

// Função para fazer upload de múltiplas imagens
export const uploadMultipleImages = async (
  files: Express.Multer.File[],
  folder: string = 'baby-diary'
): Promise<Array<{ url: string; publicId: string; secureUrl: string }>> => {
  await ensureCloudinaryConfigured();
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Erro ao fazer upload de múltiplas imagens:', error);
    throw new Error('Falha ao fazer upload das imagens');
  }
};

export async function uploadToCloudinary(buffer: Buffer, filename: string, type: string) {
  // Garantir que o Cloudinary está configurado
  const isConfigured = await ensureCloudinaryConfigured();
  if (!isConfigured) {
    throw new Error('Cloudinary não está configurado. Verifique as variáveis de ambiente.');
  }

  return new Promise<any>((resolve, reject) => {
    let resourceType: 'video' | 'image' | 'auto' | 'raw' | undefined = 'auto';
    if (type === 'image') resourceType = 'image';
    else if (type === 'video') resourceType = 'video';
    else if (type === 'pdf' || type === 'doc') resourceType = 'raw';
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        public_id: filename.split('.')[0],
        folder: 'courses',
        use_filename: true,
        unique_filename: true,
        overwrite: false
      },
      (error: any, result: any) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export default cloudinary; 