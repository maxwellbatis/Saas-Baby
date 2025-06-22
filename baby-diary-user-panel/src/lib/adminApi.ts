import axios from 'axios';

const API_URL = "http://localhost:3000/api";

// Criar instância do axios para admin
export const adminApi = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Interceptor para adicionar token de admin automaticamente
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('🌐 Requisição admin:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
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
    if (error.response?.status === 401) {
      // Token expirado ou inválido
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

export default adminApi; 