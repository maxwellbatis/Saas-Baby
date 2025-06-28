import axios from 'axios';
import { API_CONFIG } from '../config/api';

// Criar instância do axios para admin
export const adminApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

console.log('🔧 Configuração adminApi:', {
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT
});

// Interceptor para adicionar token de admin automaticamente
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Token admin encontrado:', token.substring(0, 20) + '...');
    } else {
      console.log('⚠️ Nenhum token admin encontrado');
    }
    console.log('🌐 Requisição admin:', config.method?.toUpperCase(), config.url);
    console.log('📋 Headers:', config.headers);
    return config;
  },
  (error) => {
    console.error('❌ Erro na requisição admin:', error);
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
adminApi.interceptors.response.use(
  (response) => {
    console.log('✅ Resposta admin:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.log('❌ Erro admin:', error.response?.status, error.config?.url, error.message);
    
    // Log detalhado do erro
    if (error.response) {
      console.log('📄 Resposta de erro:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      });
    }
    
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      console.log('🔒 Token inválido, redirecionando para login...');
      localStorage.removeItem('adminToken');
      window.location.href = '/admin/login';
    }
    
    return Promise.reject(error);
  }
);

// Funções específicas para admin
export const adminAuth = {
  login: async (email: string, password: string) => {
    const response = await adminApi.post('/auth/admin/login', { email, password });
    return response.data;
  },

  getProfile: async () => {
    const response = await adminApi.get('/auth/admin/profile');
    return response.data;
  },

  updateProfile: async (data: any) => {
    const response = await adminApi.put('/auth/admin/profile', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('adminToken');
  }
};

export const adminDashboard = {
  getStats: async () => {
    const response = await adminApi.get('/admin/dashboard');
    return response.data;
  },

  getAnalytics: async (type: string, params?: any) => {
    const response = await adminApi.get(`/admin/analytics/${type}`, { params });
    return response.data;
  }
};

export const adminUsers = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/users', { params });
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/users/${id}`, data);
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const response = await adminApi.put(`/admin/users/${id}/status`, { isActive });
    return response.data;
  },

  resetPassword: async (id: string) => {
    const response = await adminApi.post(`/admin/users/${id}/reset-password`);
    return response.data;
  }
};

export const adminBabies = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/babies', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await adminApi.get(`/admin/babies/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/babies', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/babies/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await adminApi.delete(`/admin/babies/${id}`);
    return response.data;
  }
};

export const adminActivities = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/activities', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await adminApi.get(`/admin/activities/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/activities', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/activities/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await adminApi.delete(`/admin/activities/${id}`);
    return response.data;
  }
};

export const adminMemories = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/memories', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await adminApi.get(`/admin/memories/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/memories', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/memories/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await adminApi.delete(`/admin/memories/${id}`);
    return response.data;
  }
};

export const adminMilestones = {
  getAll: async (params?: any) => {
    const response = await adminApi.get('/admin/milestones', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await adminApi.get(`/admin/milestones/${id}`);
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/milestones', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/milestones/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await adminApi.delete(`/admin/milestones/${id}`);
    return response.data;
  }
};

export const adminPlans = {
  getAll: async () => {
    const response = await adminApi.get('/admin/plans');
    return response.data;
  },

  create: async (data: any) => {
    const response = await adminApi.post('/admin/plans', data);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/plans/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await adminApi.delete(`/admin/plans/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, isActive: boolean) => {
    const response = await adminApi.put(`/admin/plans/${id}/status`, { isActive });
    return response.data;
  }
};

export const adminGamification = {
  getRules: async () => {
    const response = await adminApi.get('/admin/gamification-rules');
    return response.data;
  },

  createRule: async (data: any) => {
    const response = await adminApi.post('/admin/gamification-rules', data);
    return response.data;
  },

  updateRule: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/gamification-rules/${id}`, data);
    return response.data;
  },

  deleteRule: async (id: string) => {
    const response = await adminApi.delete(`/admin/gamification-rules/${id}`);
    return response.data;
  }
};

export const adminSettings = {
  get: async () => {
    const response = await adminApi.get('/admin/settings');
    return response.data;
  },

  update: async (data: any) => {
    const response = await adminApi.put('/admin/settings', data);
    return response.data;
  },

  backup: async () => {
    const response = await adminApi.post('/admin/settings/backup');
    return response.data;
  },

  clearCache: async () => {
    const response = await adminApi.post('/admin/settings/clear-cache');
    return response.data;
  },

  testIntegrations: async () => {
    const response = await adminApi.post('/admin/settings/test-integrations');
    return response.data;
  }
};

export const adminMarketing = {
  getCampaigns: async () => {
    const response = await adminApi.get('/admin/marketing/campaigns');
    return response.data;
  },
  createCampaign: async (data: any) => {
    const response = await adminApi.post('/admin/marketing/campaigns', data);
    return response.data;
  },
  updateCampaign: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/marketing/campaigns/${id}`, data);
    return response.data;
  },
  deleteCampaign: async (id: string) => {
    const response = await adminApi.delete(`/admin/marketing/campaigns/${id}`);
    return response.data;
  },
  generateWithGemini: async (prompt: string) => {
    const response = await adminApi.post('/admin/marketing/campaigns/gemini', { prompt });
    return response.data;
  },
  // Analytics Dashboard
  getAnalytics: async (timeRange: string = '30d') => {
    const response = await adminApi.get(`/admin/marketing/analytics?timeRange=${timeRange}`);
    return response.data;
  },
  // Calendário Editorial
  getScheduledPosts: async (params?: any) => {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const response = await adminApi.get(`/admin/marketing/scheduled-posts${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },
  schedulePost: async (data: any) => {
    const response = await adminApi.post('/admin/marketing/scheduled-posts', data);
    return response.data;
  },
  updateScheduledPost: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/marketing/scheduled-posts/${id}`, data);
    return response.data;
  },
  deleteScheduledPost: async (id: string) => {
    const response = await adminApi.delete(`/admin/marketing/scheduled-posts/${id}`);
    return response.data;
  },
  // Segmentação avançada
  getSegmentationStats: async () => {
    const response = await adminApi.get('/admin/marketing/segmentation/stats');
    return response.data;
  },
  getTargetUsers: async (filters: any) => {
    const response = await adminApi.post('/admin/marketing/segmentation/target-users', filters);
    return response.data;
  },
  // Biblioteca de Marketing Digital
  // Posts para Redes Sociais
  getSocialMediaPosts: async (filters?: any) => {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    const response = await adminApi.get(`/admin/marketing/social-media-posts${params ? `?${params}` : ''}`);
    return response.data;
  },
  createSocialMediaPost: async (data: any) => {
    const response = await adminApi.post('/admin/marketing/social-media-posts', data);
    return response.data;
  },
  // Anúncios
  getAdvertisements: async (filters?: any) => {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    const response = await adminApi.get(`/admin/marketing/advertisements${params ? `?${params}` : ''}`);
    return response.data;
  },
  createAdvertisement: async (data: any) => {
    const response = await adminApi.post('/admin/marketing/advertisements', data);
    return response.data;
  },
  // Vídeos
  getVideoContents: async (filters?: any) => {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    const response = await adminApi.get(`/admin/marketing/video-contents${params ? `?${params}` : ''}`);
    return response.data;
  },
  createVideoContent: async (data: any) => {
    const response = await adminApi.post('/admin/marketing/video-contents', data);
    return response.data;
  },
  // Argumentos de Venda
  getSalesArguments: async (filters?: any) => {
    const params = filters ? new URLSearchParams(filters).toString() : '';
    const response = await adminApi.get(`/admin/marketing/sales-arguments${params ? `?${params}` : ''}`);
    return response.data;
  },
  createSalesArgument: async (data: any) => {
    const response = await adminApi.post('/admin/marketing/sales-arguments', data);
    return response.data;
  },
  // Links de Afiliados
  getAffiliateLinks: async () => {
    const response = await adminApi.get('/admin/marketing/affiliate-links');
    return response.data;
  },
  createAffiliateLink: async (data: any) => {
    const response = await adminApi.post('/admin/marketing/affiliate-links', data);
    return response.data;
  },
  // Gerador de Conteúdo com IA
  generateMarketingContent: async (data: any) => {
    const response = await adminApi.post('/admin/marketing/generate-content', data);
    return response.data;
  },
  // Upload, Download e Delete de mídia
  uploadMedia: async (formData: FormData) => {
    const response = await adminApi.post('/admin/marketing/upload-media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  downloadMedia: async (params: { publicId: string; filename?: string }) => {
    const response = await adminApi.get('/admin/marketing/download-media', { params });
    return response.data;
  },
  deleteMedia: async (publicId: string) => {
    const response = await adminApi.delete(`/admin/marketing/delete-media/${publicId}`);
    return response.data;
  },
  // Gerador de Conteúdo com IA
  generateContentWithAI: async (data: any) => {
    const response = await adminApi.post('/admin/marketing/generate-content', data);
    return response.data;
  },
  // Social Media Posts
  updateSocialMediaPost: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/marketing/social-media-posts/${id}`, data);
    return response.data;
  },
  deleteSocialMediaPost: async (id: string) => {
    const response = await adminApi.delete(`/admin/marketing/social-media-posts/${id}`);
    return response.data;
  },
  // Advertisements
  updateAdvertisement: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/marketing/advertisements/${id}`, data);
    return response.data;
  },
  deleteAdvertisement: async (id: string) => {
    const response = await adminApi.delete(`/admin/marketing/advertisements/${id}`);
    return response.data;
  },
  // Video Contents
  updateVideoContent: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/marketing/video-contents/${id}`, data);
    return response.data;
  },
  deleteVideoContent: async (id: string) => {
    const response = await adminApi.delete(`/admin/marketing/video-contents/${id}`);
    return response.data;
  },
  // Sales Arguments
  updateSalesArgument: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/marketing/sales-arguments/${id}`, data);
    return response.data;
  },
  deleteSalesArgument: async (id: string) => {
    const response = await adminApi.delete(`/admin/marketing/sales-arguments/${id}`);
    return response.data;
  },
  // Affiliate Links
  updateAffiliateLink: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/marketing/affiliate-links/${id}`, data);
    return response.data;
  },
  deleteAffiliateLink: async (id: string) => {
    const response = await adminApi.delete(`/admin/marketing/affiliate-links/${id}`);
    return response.data;
  },
};

export const adminFamily = {
  getMembers: async (userId: string) => {
    const response = await adminApi.get(`/admin/users/${userId}/family`);
    return response.data;
  },
  inviteMember: async (userId: string, data: any) => {
    const response = await adminApi.post(`/admin/users/${userId}/family/invite`, data);
    return response.data;
  },
  removeMember: async (userId: string, memberId: string) => {
    const response = await adminApi.delete(`/admin/users/${userId}/family/${memberId}`);
    return response.data;
  },
};

// Notificações do Admin
export const adminNotifications = {
  createTemplate: async (data: any) => {
    const response = await adminApi.post('/admin/notifications/templates', data);
    return response.data;
  },
  updateTemplate: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/notifications/templates/${id}`, data);
    return response.data;
  },
  deleteTemplate: async (id: string) => {
    const response = await adminApi.delete(`/admin/notifications/templates/${id}`);
    return response.data;
  },
  send: async (data: any) => {
    const response = await adminApi.post('/admin/notifications/send', data);
    return response.data;
  },
};

export const adminShop = {
  getCategories: async () => {
    const response = await adminApi.get('/admin/categories');
    return response.data;
  },
  getTags: async () => {
    const response = await adminApi.get('/admin/tags');
    return response.data;
  }
};

// Funções para gerenciamento de pedidos (admin)
export const adminPedidos = {
  getAll: async (params?: any) => {
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const response = await adminApi.get(`/admin/pedidos${queryParams ? `?${queryParams}` : ''}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await adminApi.get(`/admin/pedidos/${id}`);
    return response.data;
  },

  update: async (id: string, data: any) => {
    const response = await adminApi.put(`/admin/pedidos/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await adminApi.delete(`/admin/pedidos/${id}`);
    return response.data;
  }
};

// ================= BANNERS =================
export const adminBanners = {
  // Listar todos os banners
  getAll: async () => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banners`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
    });
    return response.json();
  },

  // Buscar banner por ID
  getById: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banners/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
    });
    return response.json();
  },

  // Criar banner
  create: async (data: any) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banners`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Atualizar banner
  update: async (id: string, data: any) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banners/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Deletar banner
  delete: async (id: string) => {
    const response = await fetch(`${API_CONFIG.BASE_URL}/admin/banners/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
    });
    return response.json();
  },
};

export default adminApi; 