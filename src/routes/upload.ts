import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadImage, deleteImage } from '@/config/cloudinary';

const router = Router();

// Configurar multer para upload de arquivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
  fileFilter: (req, file, cb) => {
    console.log('=== MULTER FILTER DEBUG ===');
    console.log('File mimetype:', file.mimetype);
    console.log('File originalname:', file.originalname);
    console.log('File fieldname:', file.fieldname);
    console.log('File size:', file.size);
    console.log('File buffer:', file.buffer ? 'Presente' : 'Ausente');
    
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp').split(',');
    console.log('Allowed types:', allowedTypes);
    console.log('Is mimetype in allowed types?', allowedTypes.includes(file.mimetype));
    
    if (allowedTypes.includes(file.mimetype)) {
      console.log('Arquivo aceito pelo filtro');
      cb(null, true);
    } else {
      console.log('Arquivo rejeitado - tipo não permitido:', file.mimetype);
      cb(new Error('Tipo de arquivo não permitido'));
    }
  },
});

/**
 * @swagger
 * /api/upload/image:
 *   post:
 *     summary: Upload de imagem do usuário
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Imagem enviada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     publicId:
 *                       type: string
 *                     secureUrl:
 *                       type: string
 *       400:
 *         description: Nenhum arquivo enviado
 *       401:
 *         description: Não autorizado
 */
// Upload de imagem
router.post('/image', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    // Determinar pasta baseada no contexto
    const folder = req.body.folder || 'users';
    const finalFolder = `${folder}/${req.user.userId}`;

    // Fazer upload para o Cloudinary
    const result = await uploadImage(req.file, finalFolder);

    res.json({
      success: true,
      message: 'Imagem enviada com sucesso',
      data: result,
    });
  } catch (error) {
    console.error('Erro no upload de imagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Upload de foto para memória
router.post('/memories/upload', upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== UPLOAD MEMORY DEBUG ===');
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('File:', req.file);
    console.log('User:', req.user);
    
    if (!req.file) {
      console.log('Erro: Nenhum arquivo enviado');
      res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
      });
      return;
    }

    if (!req.user) {
      console.log('Erro: Usuário não autenticado');
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    // Pasta específica para memórias
    const finalFolder = `memories/${req.user.userId}`;
    console.log('Pasta final:', finalFolder);

    // Fazer upload para o Cloudinary
    console.log('Iniciando upload para Cloudinary...');
    const result = await uploadImage(req.file, finalFolder);
    console.log('Resultado do upload:', result);

    res.json({
      success: true,
      message: 'Foto da memória enviada com sucesso',
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
    console.log('=== FIM UPLOAD MEMORY DEBUG ===');
  } catch (error) {
    console.error('Erro no upload da foto da memória:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Upload de múltiplas imagens
router.post('/images', upload.array('images', 10), async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.files || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: 'Nenhum arquivo enviado',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    // Determinar pasta baseada no contexto
    const folder = req.body.folder || 'users';
    const finalFolder = `${folder}/${req.user.userId}`;

    // Fazer upload de múltiplas imagens
    const files = req.files as Express.Multer.File[];
    const uploadPromises = files.map(file => uploadImage(file, finalFolder));
    const results = await Promise.all(uploadPromises);

    res.json({
      success: true,
      message: 'Imagens enviadas com sucesso',
      data: results,
    });
  } catch (error) {
    console.error('Erro no upload de múltiplas imagens:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Deletar imagem
router.delete('/image/:publicId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicId } = req.params;

    if (!publicId) {
      res.status(400).json({
        success: false,
        error: 'ID da imagem é obrigatório',
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    // Verificar se a imagem pertence ao usuário (implementar verificação se necessário)
    await deleteImage(publicId);

    res.json({
      success: true,
      message: 'Imagem deletada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
});

// Middleware de tratamento de erros do multer
router.use((error: any, req: Request, res: Response, next: any): void => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        success: false,
        error: 'Arquivo muito grande. Tamanho máximo permitido: 5MB',
      });
      return;
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: 'Muitos arquivos. Máximo permitido: 10 arquivos',
      });
      return;
    }
  }

  if (error.message === 'Tipo de arquivo não permitido') {
    res.status(400).json({
      success: false,
      error: 'Tipo de arquivo não permitido. Tipos aceitos: JPEG, PNG, WebP',
    });
    return;
  }

  console.error('Erro no upload:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
  });
});

export default router; 