import { Router } from 'express';
import { 
  listCampaigns, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign, 
  generateWithGemini, 
  getSegmentationStats, 
  getTargetUsers,
  // Biblioteca de Marketing Digital
  getSocialMediaPosts,
  createSocialMediaPost,
  getAdvertisements,
  createAdvertisement,
  getVideoContents,
  createVideoContent,
  getSalesArguments,
  createSalesArgument,
  getAffiliateLinks,
  createAffiliateLink,
  generateMarketingContent,
  uploadDigitalMedia,
  downloadDigitalMedia,
  deleteDigitalMedia,
  getMarketingLibrary
} from '@/controllers/marketing.controller';

const router = Router();

// Campanhas de marketing
router.get('/campaigns', listCampaigns);
router.post('/campaigns', createCampaign);
router.put('/campaigns/:id', updateCampaign);
router.delete('/campaigns/:id', deleteCampaign);
router.post('/campaigns/gemini', generateWithGemini);

// Segmentação avançada
router.get('/segmentation/stats', getSegmentationStats);
router.post('/segmentation/target-users', getTargetUsers);

// ===== BIBLIOTECA DE MARKETING DIGITAL =====

// Posts para Redes Sociais
router.get('/social-media-posts', getSocialMediaPosts);
router.post('/social-media-posts', createSocialMediaPost);

// Anúncios
router.get('/advertisements', getAdvertisements);
router.post('/advertisements', createAdvertisement);

// Vídeos
router.get('/video-contents', getVideoContents);
router.post('/video-contents', createVideoContent);

// Argumentos de Venda
router.get('/sales-arguments', getSalesArguments);
router.post('/sales-arguments', createSalesArgument);

// Links de Afiliados
router.get('/affiliate-links', getAffiliateLinks);
router.post('/affiliate-links', createAffiliateLink);

// Gerador de Conteúdo com IA
router.post('/generate-content', generateMarketingContent);

// Upload, Download e Delete de mídia para biblioteca digital
router.post('/upload-media', uploadDigitalMedia);
router.get('/download-media', downloadDigitalMedia);
router.delete('/delete-media/:publicId', deleteDigitalMedia);

// Biblioteca de Marketing Digital (batch)
router.get('/library', getMarketingLibrary);

export default router; 