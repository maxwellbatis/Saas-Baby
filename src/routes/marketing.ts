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
  getMarketingLibrary,
  updateSocialMediaPost, deleteSocialMediaPost,
  updateAdvertisement, deleteAdvertisement,
  updateVideoContent, deleteVideoContent,
  updateSalesArgument, deleteSalesArgument,
  updateAffiliateLink, deleteAffiliateLink,
  getAnalytics,
  getScheduledPosts,
  createScheduledPost,
  updateScheduledPost,
  deleteScheduledPost,
  getHashtagAnalytics,
  getHashtagSuggestions,
  analyzeHashtagPerformance,
  getTrendingHashtags,
  generateImageWithFreepik,
  generateVideoWithFreepik
} from '@/controllers/marketing.controller';
import { authenticateAdmin } from '../middlewares/auth';

const router = Router();

// Campanhas de marketing
router.get('/campaigns', listCampaigns);
router.post('/campaigns', createCampaign);
router.put('/campaigns/:id', updateCampaign);
router.delete('/campaigns/:id', deleteCampaign);
router.post('/campaigns/gemini', generateWithGemini);
router.post('/generate-gemini', authenticateAdmin, generateWithGemini);

// Segmentação avançada
router.get('/segmentation/stats', getSegmentationStats);
router.post('/segmentation/target-users', getTargetUsers);

// Analytics Dashboard
router.get('/analytics', getAnalytics);

// Calendário Editorial
router.get('/scheduled-posts', getScheduledPosts);
router.post('/scheduled-posts', createScheduledPost);
router.put('/scheduled-posts/:id', updateScheduledPost);
router.delete('/scheduled-posts/:id', deleteScheduledPost);

// ===== BIBLIOTECA DE MARKETING DIGITAL =====

// Posts para Redes Sociais
router.get('/social-media-posts', getSocialMediaPosts);
router.post('/social-media-posts', createSocialMediaPost);
router.put('/social-media-posts/:id', updateSocialMediaPost);
router.delete('/social-media-posts/:id', deleteSocialMediaPost);

// Anúncios
router.get('/advertisements', getAdvertisements);
router.post('/advertisements', createAdvertisement);
router.put('/advertisements/:id', updateAdvertisement);
router.delete('/advertisements/:id', deleteAdvertisement);

// Vídeos
router.get('/video-contents', getVideoContents);
router.post('/video-contents', createVideoContent);
router.put('/video-contents/:id', updateVideoContent);
router.delete('/video-contents/:id', deleteVideoContent);

// Argumentos de Venda
router.get('/sales-arguments', getSalesArguments);
router.post('/sales-arguments', createSalesArgument);
router.put('/sales-arguments/:id', updateSalesArgument);
router.delete('/sales-arguments/:id', deleteSalesArgument);

// Links de Afiliados
router.get('/affiliate-links', getAffiliateLinks);
router.post('/affiliate-links', createAffiliateLink);
router.put('/affiliate-links/:id', updateAffiliateLink);
router.delete('/affiliate-links/:id', deleteAffiliateLink);

// Gerador de Conteúdo com IA
router.post('/generate-content', generateMarketingContent);

// Upload, Download e Delete de mídia para biblioteca digital
router.post('/upload-media', uploadDigitalMedia);
router.get('/download-media', downloadDigitalMedia);
router.delete('/delete-media/:publicId', deleteDigitalMedia);

// Biblioteca de Marketing Digital (batch)
router.get('/library', getMarketingLibrary);

// ===== HASHTAG ANALYTICS =====

// Buscar analytics de hashtags
router.get('/hashtag-analytics', getHashtagAnalytics);

// Gerar sugestões inteligentes de hashtags
router.get('/hashtag-suggestions', getHashtagSuggestions);

// Analisar performance de uma hashtag específica
router.post('/hashtag-analysis', analyzeHashtagPerformance);

// Buscar hashtags em tendência
router.get('/trending-hashtags', getTrendingHashtags);

router.post('/generate-image', generateImageWithFreepik);

router.post('/generate-video', generateVideoWithFreepik);

export default router; 