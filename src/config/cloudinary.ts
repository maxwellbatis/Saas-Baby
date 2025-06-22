import { v2 as cloudinary } from 'cloudinary';

// Verificar se as variáveis de ambiente estão definidas
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Configuração do Cloudinary
if (cloudName && apiKey && apiSecret && cloudName.trim() !== '' && apiKey.trim() !== '' && apiSecret.trim() !== '') {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('✅ Cloudinary configurado com sucesso');
} else {
  console.log('⚠️ Cloudinary não configurado - verifique as variáveis de ambiente');
  process.exit(1); // Para o servidor se não estiver configurado
}

// Função para fazer upload de imagem
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string = 'baby-diary'
): Promise<{ url: string; publicId: string; secureUrl: string }> => {
  try {
    // Converter o buffer para base64
    const b64 = Buffer.from(file.buffer).toString('base64');
    const dataURI = `data:${file.mimetype};base64,${b64}`;

    // Fazer upload para o Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder,
      resource_type: 'auto',
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ],
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      secureUrl: result.secure_url,
    };
  } catch (error) {
    console.error('Erro ao fazer upload de imagem para o Cloudinary:', error);
    throw new Error('Falha ao fazer upload da imagem para o Cloudinary');
  }
};

// Função para deletar imagem
export const deleteImage = async (publicId: string): Promise<void> => {
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
export const generatePreviewUrl = (
  publicId: string,
  width: number = 300,
  height: number = 300
): string => {
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
  try {
    const uploadPromises = files.map(file => uploadImage(file, folder));
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Erro ao fazer upload de múltiplas imagens:', error);
    throw new Error('Falha ao fazer upload das imagens');
  }
};

export default cloudinary; 