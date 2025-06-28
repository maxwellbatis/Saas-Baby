import { Router } from 'express';
import { authenticateUser } from '../middlewares/auth';
import {
  getAllShopItems,
  getShopItemById,
  createShopItem,
  updateShopItem,
  deleteShopItem,
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  getAllBanners,
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner,
  // Novas funções de checkout real
  createRealOrder,
  getOrderStatus,
  getUserOrders,
  cancelOrder,
  checkoutRealValidation,
  // Novas funções de checkout usando Stripe
  createStripeOrder,
  processStripeWebhook,
  getStripeOrderStatus
} from '../controllers/shop.controller';

const router = Router();

// ================= PRODUTOS =================
router.get('/items', getAllShopItems);
router.get('/items/:id', getShopItemById);
router.post('/items', authenticateUser, createShopItem);
router.put('/items/:id', authenticateUser, updateShopItem);
router.delete('/items/:id', authenticateUser, deleteShopItem);

// ================= CATEGORIAS =================
router.get('/categories', getAllCategories);
router.get('/categories/:id', getCategoryById);
router.post('/categories', authenticateUser, createCategory);
router.put('/categories/:id', authenticateUser, updateCategory);
router.delete('/categories/:id', authenticateUser, deleteCategory);

// ================= TAGS =================
router.get('/tags', getAllTags);
router.get('/tags/:id', getTagById);
router.post('/tags', authenticateUser, createTag);
router.put('/tags/:id', authenticateUser, updateTag);
router.delete('/tags/:id', authenticateUser, deleteTag);

// ================= BANNERS =================
router.get('/banners', getAllBanners);
router.get('/banners/active', getActiveBanners);
router.get('/banners/:id', getBannerById);
router.post('/banners', authenticateUser, createBanner);
router.put('/banners/:id', authenticateUser, updateBanner);
router.delete('/banners/:id', authenticateUser, deleteBanner);

// ===== ROTAS DE CHECKOUT REAL COM PAGAR.ME =====

// Criar pedido real
router.post('/checkout/create-order', authenticateUser, createRealOrder);

// Consultar status do pedido
router.get('/orders/:orderId/status', authenticateUser, getOrderStatus);

// Listar pedidos do usuário
router.get('/orders', authenticateUser, getUserOrders);

// Cancelar pedido
router.delete('/orders/:orderId', authenticateUser, cancelOrder);

// ===== ROTAS PARA STRIPE =====

// Criar pedido usando Stripe
router.post('/stripe/create-order', authenticateUser, createStripeOrder);

// Webhook do Stripe para pedidos da loja
router.post('/stripe/webhook', processStripeWebhook);

// Buscar status do pedido Stripe
router.get('/stripe/order-status/:sessionId', authenticateUser, getStripeOrderStatus);

export default router; 