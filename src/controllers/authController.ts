import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '@/config/database';
import { hashPassword, comparePassword, validatePasswordStrength } from '@/utils/bcrypt';
import { generateUserToken, generateAdminToken } from '@/utils/jwt';
import { AuthRequest, RegisterRequest, AuthResponse, ApiResponse, User } from '@/types';
import { GamificationService } from '../services/gamification';
import { NotificationService } from '../services/notification.service';
import emailService from '../services/email.service';

// Validações para registro
export const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('avatarUrl')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('URL do avatar deve ser uma string válida'),
];

// Validações para login
export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória'),
];

// Registrar novo usuário
export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
    }

    const { name, email, password, avatarUrl }: RegisterRequest & { avatarUrl?: string } = req.body;

    // Verificar se o email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email já cadastrado',
      });
    }

    // Validar força da senha
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Senha muito fraca',
        details: passwordValidation.errors,
      });
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Buscar o plano básico
    const basicPlan = await prisma.plan.findUnique({
      where: { stripePriceId: 'price_basic_free' },
    });

    if (!basicPlan) {
      return res.status(500).json({
        success: false,
        error: 'Plano gratuito não encontrado',
      });
    }

    // Criar usuário com gamificação
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        avatarUrl,
        planId: basicPlan.id, // Usar o ID do plano, não o stripePriceId
        gamification: {
          create: {
            points: 0,
            level: 1,
            badges: [],
            streaks: {},
            achievements: []
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        plan: {
          select: {
            id: true,
            name: true,
            features: true,
          },
        },
      },
    });

    // Gerar token JWT
    const token = generateUserToken(user.id, user.email);

    // Enviar email de boas-vindas
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const loginLink = `${frontendUrl}/login`;
    
    await emailService.sendWelcomeEmail({
      email: user.email,
      name: user.name || 'Usuário',
      loginLink: loginLink
    });

    // Enviar notificação push de boas-vindas
    const notificationService = new NotificationService();
    await notificationService.sendTemplateNotification(user.id, 'welcome', {
      name: user.name || 'Usuário',
    });

    return res.status(201).json({
      success: true,
      message: 'Usuário cadastrado com sucesso!',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Login de usuário
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
      return;
    }

    const { email, password }: AuthRequest = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        plan: true,
        subscription: true,
        gamification: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
      return;
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      res.status(401).json({
        success: false,
        error: 'Conta desativada',
      });
      return;
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
      return;
    }

    // === Gamificação automática (login) ===
    let newBadges: string[] = [];
    let newPoints = 0;
    let newLevel = 0;
    let updatedGamification = null;
    let loginStreak = 1;
    try {
      const gamification = await prisma.gamification.findUnique({ where: { userId: user.id } });
      if (gamification) {
        // Garantir que streaks é um objeto
        const streaksObj: Record<string, number> = (typeof gamification.streaks === 'object' && gamification.streaks !== null && !Array.isArray(gamification.streaks)) ? gamification.streaks as Record<string, number> : {};
        // Calcular streak de login
        const lastLoginAt = user.lastLoginAt || new Date();
        const today = new Date();
        const diffTime = today.getTime() - (lastLoginAt ? new Date(lastLoginAt).getTime() : today.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          loginStreak = (streaksObj.login || 1) + 1;
        } else if (diffDays > 1) {
          loginStreak = 1;
        } else {
          loginStreak = streaksObj.login || 1;
        }
        // Atualizar streaks
        const newStreaks = { ...streaksObj, login: loginStreak };
        // Buscar regras ativas
        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        let result = {
          points: gamification.points,
          level: gamification.level,
          badges: Array.isArray(gamification.badges) ? gamification.badges : [],
          newBadges: [] as string[],
        };
        for (const rule of rules) {
          if (rule.condition === 'login' || rule.condition === 'any') {
            result = GamificationService.applyRule(result as any, rule as any);
          }
          // Badge de streak de login
          if (rule.condition === 'login_streak_7' && loginStreak >= 7) {
            result = GamificationService.applyRule(result as any, rule as any);
          }
          if (rule.condition === 'login_streak_30' && loginStreak >= 30) {
            result = GamificationService.applyRule(result as any, rule as any);
          }
        }
        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges : [];
        const newBadgesArr = Array.isArray(result.badges) ? result.badges : [];
        if (
          result.points !== gamification.points ||
          newBadgesArr.length > oldBadges.length ||
          (streaksObj.login !== loginStreak)
        ) {
          updatedGamification = await prisma.gamification.update({
            where: { userId: user.id },
            data: {
              points: result.points,
              level: result.level,
              badges: newBadgesArr,
              streaks: newStreaks,
            },
          });
          newBadges = result.newBadges;
          newPoints = result.points;
          newLevel = result.level;
          // === Notificação automática de badge ===
          if (newBadges.length > 0) {
            const notificationService = new NotificationService();
            for (const badge of newBadges) {
              await notificationService.sendPushNotification({
                userId: user.id,
                title: 'Parabéns! Novo badge conquistado',
                body: `Você conquistou o badge: ${badge}`,
                data: { badge },
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Erro na gamificação automática (login):', err);
    }

    // Gerar token
    const token = generateUserToken(user.id, user.email);

    // Remover senha do objeto de resposta
    const { password: _, ...userWithoutPassword } = user;

    const response: AuthResponse = {
      user: userWithoutPassword as unknown as Omit<User, 'password'>,
      token,
    };

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: response,
      gamification: updatedGamification,
      newBadges,
      newPoints,
      newLevel,
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Login de administrador
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array(),
      });
      return;
    }

    const { email, password }: AuthRequest = req.body;

    // Buscar administrador
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
      return;
    }

    // Verificar se o admin está ativo
    if (!admin.isActive) {
      res.status(401).json({
        success: false,
        error: 'Conta desativada',
      });
      return;
    }

    // Verificar senha
    const isPasswordValid = await comparePassword(password, admin.password);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos',
      });
      return;
    }

    // Gerar token
    const token = generateAdminToken(admin.id, admin.email);

    // Remover senha do objeto de resposta
    const { password: _, ...adminWithoutPassword } = admin;

    res.status(200).json({
      success: true,
      message: 'Login de administrador realizado com sucesso',
      data: {
        admin: adminWithoutPassword,
        token,
      },
    });
  } catch (error) {
    console.error('Erro no login de admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Obter perfil do usuário logado
export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        plan: true,
        subscription: true,
        gamification: true,
        babies: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            gender: true,
            birthDate: true,
            photoUrl: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Atualizar perfil do usuário
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('=== UPDATE PROFILE DEBUG ===');
    console.log('Body recebido:', req.body);
    console.log('User ID:', req.user?.userId);
    
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
      return;
    }

    const { name, currentPassword, newPassword, photoUrl, avatarUrl } = req.body;
    console.log('Dados extraídos:', { name, photoUrl, avatarUrl });

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado',
      });
      return;
    }

    const updateData: any = {};

    // Atualizar nome se fornecido
    if (name) {
      updateData.name = name;
    }

    // Atualizar foto se fornecida (aceitar tanto photoUrl quanto avatarUrl)
    const imageUrl = photoUrl || avatarUrl;
    if (imageUrl) {
      updateData.avatarUrl = imageUrl;
      console.log('URL da imagem definida:', imageUrl);
    }

    console.log('Dados para atualização:', updateData);

    // Atualizar senha se fornecida
    if (currentPassword && newPassword) {
      // Verificar senha atual
      const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          error: 'Senha atual incorreta',
        });
        return;
      }

      // Validar nova senha
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Nova senha não atende aos requisitos de segurança',
          details: passwordValidation.errors,
        });
        return;
      }

      // Fazer hash da nova senha
      updateData.password = await hashPassword(newPassword);
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log('Usuário atualizado:', updatedUser);
    console.log('=== FIM UPDATE PROFILE DEBUG ===');

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const getAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: 'Não autenticado' });
      return;
    }
    const admin = await prisma.admin.findUnique({ where: { id: req.admin.userId } });
    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin não encontrado' });
      return;
    }
    const { password, ...adminData } = admin;
    res.json({ success: true, data: adminData });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar perfil do admin' });
  }
};

// Atualizar perfil do admin
export const updateAdminProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.admin) {
      res.status(401).json({ success: false, message: 'Não autenticado' });
      return;
    }

    const { name, email, currentPassword, newPassword } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.userId },
    });

    if (!admin) {
      res.status(404).json({ success: false, message: 'Admin não encontrado' });
      return;
    }

    const updateData: any = {};

    // Atualizar nome se fornecido
    if (name) {
      updateData.name = name;
    }

    // Atualizar email se fornecido
    if (email && email !== admin.email) {
      // Verificar se o email já existe
      const existingAdmin = await prisma.admin.findUnique({
        where: { email },
      });

      if (existingAdmin && existingAdmin.id !== admin.id) {
        res.status(400).json({
          success: false,
          error: 'Email já está em uso por outro administrador',
        });
        return;
      }

      updateData.email = email;
    }

    // Atualizar senha se fornecida
    if (currentPassword && newPassword) {
      // Verificar senha atual
      const isCurrentPasswordValid = await comparePassword(currentPassword, admin.password);
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          error: 'Senha atual incorreta',
        });
        return;
      }

      // Validar nova senha
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Nova senha não atende aos requisitos de segurança',
          details: passwordValidation.errors,
        });
        return;
      }

      // Fazer hash da nova senha
      updateData.password = await hashPassword(newPassword);
    }

    // Atualizar admin
    const updatedAdmin = await prisma.admin.update({
      where: { id: req.admin.userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: updatedAdmin,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil do admin:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};