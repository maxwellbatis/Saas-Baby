// Configuração centralizada da API
export const API_CONFIG = {
  // URL base da API - pode ser sobrescrita por variável de ambiente
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  
  // Timeout padrão para requisições
  TIMEOUT: 10000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  }
};

// Função para obter a URL completa de um endpoint
export const getApiUrl = (endpoint: string): string => {
  // Remove /api se já estiver na BASE_URL
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/api') 
    ? API_CONFIG.BASE_URL 
    : `${API_CONFIG.BASE_URL}/api`;
  
  // Remove /api do endpoint se já estiver na base
  const cleanEndpoint = endpoint.startsWith('/api') 
    ? endpoint.substring(4) 
    : endpoint;
  
  return `${baseUrl}${cleanEndpoint}`;
};

// Função para obter headers com token
export const getAuthHeaders = (token?: string) => {
  const headers = { ...API_CONFIG.DEFAULT_HEADERS };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Função utilitária para fazer requisições fetch com configuração centralizada
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return response.json();
}; 