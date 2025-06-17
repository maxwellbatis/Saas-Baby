// Configurações de ambiente
export const ENV = {
  // URLs do backend
  BACKEND_URL: __DEV__ 
    ? 'http://192.168.0.6:3000' // Desenvolvimento local (ajustado para seu IP)
    : 'https://baby-diary-saas-production.up.railway.app', // Produção no Railway
  
  // Configurações da API
  API_TIMEOUT: 10000, // 10 segundos
  API_VERSION: 'v1',
  
  // Configurações do app
  APP_NAME: 'Baby Diary',
  APP_VERSION: '1.0.0',
  
  // Configurações de upload
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4'],
  
  // Configurações de cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
};

// URLs completas da API
export const API_URLS = {
  BASE: `${ENV.BACKEND_URL}/api`,
  AUTH: `${ENV.BACKEND_URL}/api/auth`,
  USER: `${ENV.BACKEND_URL}/api/user`,
  BABIES: `${ENV.BACKEND_URL}/api/user/babies`,
  ACTIVITIES: `${ENV.BACKEND_URL}/api/user/activities`,
  MEMORIES: `${ENV.BACKEND_URL}/api/user/memories`,
  MILESTONES: `${ENV.BACKEND_URL}/api/user/milestones`,
  UPLOAD: `${ENV.BACKEND_URL}/api/upload`,
};

// Configurações de endpoints
export const ENDPOINTS = {
  // Autenticação
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  VERIFY_TOKEN: '/auth/me',
  UPDATE_PROFILE: '/auth/profile',
  UPLOAD_PHOTO: '/auth/profile-photo',
  
  // Bebês - corrigido para usar rotas do usuário
  GET_BABIES: '/user/babies',
  CREATE_BABY: '/user/babies',
  UPDATE_BABY: '/user/babies/:id',
  DELETE_BABY: '/user/babies/:id',
  
  // Atividades
  GET_ACTIVITIES: '/user/activities',
  CREATE_ACTIVITY: '/user/activities',
  UPDATE_ACTIVITY: '/user/activities/:id',
  DELETE_ACTIVITY: '/user/activities/:id',
  
  // Memórias
  GET_MEMORIES: '/user/memories',
  CREATE_MEMORY: '/user/memories',
  UPDATE_MEMORY: '/user/memories/:id',
  DELETE_MEMORY: '/user/memories/:id',
  UPLOAD_MEMORY_FILE: '/user/memories/upload',
  
  // Marcos
  GET_MILESTONES: '/user/milestones',
  CREATE_MILESTONE: '/user/milestones',
  UPDATE_MILESTONE: '/user/milestones/:id',
  DELETE_MILESTONE: '/user/milestones/:id',
  COMPLETE_MILESTONE: '/user/milestones/:id/complete',
  
  // Upload
  UPLOAD_FILE: '/upload/image',
};

// Função para substituir parâmetros em URLs
export const replaceParams = (url: string, params: Record<string, string>): string => {
  let result = url;
  Object.keys(params).forEach(key => {
    result = result.replace(`:${key}`, params[key]);
  });
  return result;
};

// Função para construir URL completa
export const buildUrl = (endpoint: string, params?: Record<string, string>): string => {
  let url = `${API_URLS.BASE}${endpoint}`;
  if (params) {
    url = replaceParams(url, params);
  }
  return url;
};