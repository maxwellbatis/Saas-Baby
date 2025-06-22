import jwt from 'jsonwebtoken';
import { JWTPayload } from '@/types';

// Função para gerar token JWT
export const generateToken = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  const secret = process.env.JWT_SECRET!;
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
};

// Função para verificar token JWT
export const verifyToken = (token: string): JWTPayload => {
  const secret = process.env.JWT_SECRET!;
  
  try {
    const decoded = jwt.verify(token, secret) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Token inválido');
  }
};

// Função para extrair token do header Authorization
export const extractTokenFromHeader = (authHeader: string | undefined): string => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido');
  }

  return authHeader.substring(7);
};

// Função para gerar token de admin
export const generateAdminToken = (adminId: string, email: string): string => {
  return generateToken({
    userId: adminId,
    email,
    role: 'admin',
  });
};

// Função para gerar token de usuário
export const generateUserToken = (userId: string, email: string): string => {
  return generateToken({
    userId,
    email,
    role: 'user',
  });
}; 