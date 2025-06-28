// Configuração centralizada da API
export const API_CONFIG = {
  // URL base da API - pode ser sobrescrita por variável de ambiente
  BASE_URL: import.meta.env.NODE_ENV === 'development' 
    ? '' // Em desenvolvimento, usar proxy do Vite
    : (import.meta.env.VITE_API_URL || 'https://api.babydiary.shop'),
  
  // Timeout padrão para requisições
  TIMEOUT: 10000,
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  } as Record<string, string>
};

console.log('🔧 Configuração API:', {
  VITE_API_URL: import.meta.env.VITE_API_URL,
  BASE_URL: API_CONFIG.BASE_URL,
  NODE_ENV: import.meta.env.NODE_ENV
});

// Função para obter a URL completa de um endpoint
export const getApiUrl = (endpoint: string): string => {
  // Em desenvolvimento, usar proxy do Vite
  if (import.meta.env.NODE_ENV === 'development') {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `/api${cleanEndpoint}`;
  }
  
  // Em produção, usar URL completa
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/') 
    ? API_CONFIG.BASE_URL.slice(0, -1) 
    : API_CONFIG.BASE_URL;
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}/api${cleanEndpoint}`;
};

// Função para obter headers de autenticação
export const getAuthHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    ...API_CONFIG.DEFAULT_HEADERS
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
};

// Função para fazer requisições à API
export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = getApiUrl(endpoint);
  const token = localStorage.getItem('token');
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(token),
      ...options.headers,
    },
  };
  
  try {
    console.log('🌐 Fazendo requisição para:', url);
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}; 