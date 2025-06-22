import { Router } from 'express';
import {
  register,
  login,
  adminLogin,
  getProfile,
  updateProfile,
  registerValidation,
  loginValidation,
  getAdminProfile,
  updateAdminProfile,
} from '@/controllers/authController';
import { authenticateUser, authenticateAdmin } from '@/middlewares/auth';
import crypto from 'crypto';
import prisma from '@/config/database';
import { hashPassword } from '@/utils/bcrypt';
import emailService from '@/services/email.service';

const router = Router();

// Rotas de autenticação

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Cadastro de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Maria Silva"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "maria@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Usuário cadastrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Dados inválidos
 */
router.post('/register', registerValidation, register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "maria@email.com"
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/login', loginValidation, login);

/**
 * @swagger
 * /api/auth/admin/login:
 *   post:
 *     summary: Login de administrador
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "admin@email.com"
 *               password:
 *                 type: string
 *                 example: "admin123"
 *     responses:
 *       200:
 *         description: Login admin realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Credenciais inválidas
 */
router.post('/admin/login', loginValidation, adminLogin);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obter perfil do usuário autenticado
 *     tags: [Usuário]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       401:
 *         description: Não autorizado
 */
router.get('/me', authenticateUser, getProfile);

/**
 * @swagger
 * /api/auth/admin/profile:
 *   get:
 *     summary: Obter perfil do administrador autenticado
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil do admin
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfileResponse'
 *       401:
 *         description: Não autorizado
 */
router.get('/admin/profile', authenticateAdmin, getAdminProfile);

router.put('/admin/profile', authenticateAdmin, updateAdminProfile);

router.put('/me', authenticateUser, updateProfile);

// Recuperação de senha - solicitar
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'E-mail é obrigatório' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Não revela se o e-mail existe
      return res.json({ success: true, message: 'Se o e-mail existir, enviaremos instruções.' });
    }

    // Gerar token único
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 minutos

    // Salvar token no banco
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      },
    });

    // Criar link de redefinição
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    // Enviar email usando SendGrid
    const emailSent = await emailService.sendResetPasswordEmail({
      email: user.email,
      name: user.name || 'Usuário',
      resetLink: resetLink,
      expiresIn: '30 minutos'
    });

    if (!emailSent) {
      console.error(`[Auth] Falha ao enviar email de recuperação para ${email}`);
      // Mesmo com falha no email, não revelamos se o usuário existe
      return res.json({ success: true, message: 'Se o e-mail existir, enviaremos instruções.' });
    }

    console.log(`[Auth] Email de recuperação enviado para ${email}`);
    return res.json({ success: true, message: 'Se o e-mail existir, enviaremos instruções.' });

  } catch (error) {
    console.error('[Auth] Erro na recuperação de senha:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Recuperação de senha - redefinir
router.post('/reset-password', async (req, res) => {
  try {
    const { email, token, newPassword } = req.body;
    
    if (!email || !token || !newPassword) {
      return res.status(400).json({ success: false, error: 'Dados obrigatórios ausentes' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.resetPasswordToken || !user.resetPasswordExpires) {
      return res.status(400).json({ success: false, error: 'Token inválido ou expirado' });
    }

    if (user.resetPasswordToken !== token || user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ success: false, error: 'Token inválido ou expirado' });
    }

    // Hash da nova senha
    const hashed = await hashPassword(newPassword);
    
    // Atualizar senha e limpar tokens
    await prisma.user.update({
      where: { email },
      data: {
        password: hashed,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    console.log(`[Auth] Senha redefinida com sucesso para ${email}`);
    return res.json({ success: true, message: 'Senha redefinida com sucesso!' });

  } catch (error) {
    console.error('[Auth] Erro ao redefinir senha:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

// Rota para testar envio de email
router.post('/test-email', authenticateAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, error: 'E-mail é obrigatório' });
    }

    const emailSent = await emailService.sendTestEmail(email);
    
    if (emailSent) {
      return res.json({ success: true, message: 'Email de teste enviado com sucesso!' });
    } else {
      return res.status(500).json({ success: false, error: 'Falha ao enviar email de teste' });
    }
  } catch (error) {
    console.error('[Auth] Erro ao enviar email de teste:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
});

export default router; 