import axios from 'axios';
import { API_CONFIG } from '../config/api';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  return response;
}, (error) => {
  if (error.response && error.response.status === 401) {
    // Remover token inválido sem redirecionar automaticamente
    // Deixar o AuthContext lidar com o redirecionamento
    localStorage.removeItem('token');
  }
  return Promise.reject(error);
});

// Serviço de API para autenticação e perfil do usuário

// Função para registrar usuário
export const register = async (userData: any) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.success && response.data.data?.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

// Função para login
export const login = async (credentials: any) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.success && response.data.data?.token) {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

// Função para buscar perfil do usuário autenticado
export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

export const updateProfile = async (profileData: any) => {
    const response = await api.put('/user/profile', profileData);
    return response.data;
};

export const getBabies = async () => {
    const response = await api.get('/user/babies');
    return response.data;
};

export const addBaby = async (babyData: any) => {
    const response = await api.post('/user/babies', babyData);
    return response.data;
};

export const updateBaby = async (babyId: string, babyData: any) => {
    const response = await api.put(`/user/babies/${babyId}`, babyData);
    return response.data;
};

export const deleteBaby = async (babyId: string) => {
    const response = await api.delete(`/user/babies/${babyId}`);
    return response.data;
};

// Função para buscar os planos publicos
export const getPublicPlans = async () => {
  try {
    const response = await api.get('/public/plans');
    return response.data;
  } catch (error: any) {
    return error.response?.data || { success: false, error: 'Erro de rede.' };
  }
};

// Função para logout
export const logout = () => {
  localStorage.removeItem('token');
};

// --- SAÚDE: Sintomas ---
const HEALTH_URL = `${API_CONFIG.BASE_URL}/health`;

export async function getSymptoms(babyId) {
  const token = localStorage.getItem('token');
  let url = `${HEALTH_URL}/symptoms`;
  if (babyId) url += `?babyId=${babyId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getSymptomById(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/symptoms/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createSymptom(data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/symptoms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateSymptom(id, data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/symptoms/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteSymptom(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/symptoms/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// --- SAÚDE: Medicamentos ---
export async function getMedications(babyId) {
  const token = localStorage.getItem('token');
  let url = `${HEALTH_URL}/medications`;
  if (babyId) url += `?babyId=${babyId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getMedicationById(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/medications/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createMedication(data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/medications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateMedication(id, data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/medications/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteMedication(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/medications/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// --- SAÚDE: Consultas ---
export async function getAppointments(babyId) {
  const token = localStorage.getItem('token');
  let url = `${HEALTH_URL}/appointments`;
  if (babyId) url += `?babyId=${babyId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getAppointmentById(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/appointments/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createAppointment(data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/appointments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateAppointment(id, data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/appointments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteAppointment(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/appointments/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// --- SAÚDE: Pré-natal ---
export async function getPrenatals() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/prenatals`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getPrenatalById(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/prenatals/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createPrenatal(data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/prenatals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updatePrenatal(id, data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/prenatals/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deletePrenatal(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/prenatals/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// --- SAÚDE: Vacinas ---
export async function getVaccines(babyId) {
  const token = localStorage.getItem('token');
  let url = `${HEALTH_URL}/vaccines`;
  if (babyId) url += `?babyId=${babyId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getVaccineById(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/vaccines/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function createVaccine(data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/vaccines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateVaccine(id, data) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/vaccines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteVaccine(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${HEALTH_URL}/vaccines/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

export async function getUpcomingVaccines(babyId, days = 30) {
  const token = localStorage.getItem('token');
  let url = `${HEALTH_URL}/vaccines/upcoming?days=${days}`;
  if (babyId) url += `&babyId=${babyId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// --- SAÚDE: Alertas Inteligentes (IA) ---
export async function getHealthAlerts(babyId) {
  const token = localStorage.getItem('token');
  let url = `${API_CONFIG.BASE_URL}/ai/health-alerts?babyId=${babyId}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.json();
}

// --- CHAT ASSISTENTE VIRTUAL (IA) ---
export async function sendAIChatMessage({ message, babyId, babyAge }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_CONFIG.BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ message, babyId, babyAge }),
  });
  return res.json();
}

// --- DICAS DE ALIMENTAÇÃO (IA) ---
export async function getFeedingTips({ babyId, question }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_CONFIG.BASE_URL}/ai/feeding-tips`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ babyId, question }),
  });
  return res.json();
}

// --- ANÁLISE DE SONO (IA) ---
export async function analyzeSleepPattern({ babyId, days = 7 }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_CONFIG.BASE_URL}/ai/analyze-sleep`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ babyId, days }),
  });
  return res.json();
}

// --- PREVISÃO DE MARCOS (IA) ---
export async function predictMilestones({ babyId }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_CONFIG.BASE_URL}/ai/predict-milestones`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ babyId }),
  });
  return res.json();
}

// --- SUGESTÃO DE ATIVIDADES (IA) ---
export async function suggestActivities({ babyId, category }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_CONFIG.BASE_URL}/ai/suggest-activities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ babyId, category }),
  });
  return res.json();
}

// --- CONSELHOS PERSONALIZADOS (IA) ---
export async function getPersonalizedAdvice({ question, babyId }) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_CONFIG.BASE_URL}/ai/personalized-advice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ question, babyId }),
  });
  return res.json();
}

export async function getAIUsageStats() {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_CONFIG.BASE_URL}/user/ai-usage`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Falha ao buscar estatísticas de uso da IA");
  return res.json();
}

export const createCheckoutSession = async (data: { planId: string; successUrl: string; cancelUrl: string }) => {
  try {
    const response = await api.post('/payments/create-checkout-session', data);
    return response.data;
  } catch (error: any) {
    return error.response?.data || { success: false, error: 'Erro de rede ao criar sessão de checkout.' };
  }
};

export const cancelUserSubscription = async () => {
  try {
    const response = await api.post('/payments/cancel-subscription');
    return response.data;
  } catch (error: any) {
    return error.response?.data || { success: false, error: 'Erro ao cancelar assinatura.' };
  }
};

// ===== GAMIFICAÇÃO =====

export async function getGamificationData() {
  try {
    const response = await api.get('/gamification');

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao buscar dados de gamificação');
    }

    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar dados de gamificação:', error);
    throw error;
  }
}

export async function updateDailyProgress(activityType: string, points: number) {
  try {
    const response = await api.post('/gamification/daily-progress', { activityType, points });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao atualizar progresso diário');
    }

    return response.data.data;
  } catch (error) {
    console.error('Erro ao atualizar progresso diário:', error);
    throw error;
  }
}

export async function claimChallengeReward(challengeId: string) {
  try {
    const response = await api.post('/gamification/claim-challenge-reward', { challengeId });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao reivindicar recompensa');
    }

    return response.data.data;
  } catch (error) {
    console.error('Erro ao reivindicar recompensa:', error);
    throw error;
  }
}

export async function unlockAIReward(rewardId: string) {
  try {
    const response = await api.post('/gamification/unlock-ai-reward', { rewardId });

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao desbloquear recompensa');
    }

    return response.data.data;
  } catch (error) {
    console.error('Erro ao desbloquear recompensa:', error);
    throw error;
  }
}

export async function getGamificationStats() {
  try {
    const response = await api.get('/gamification/stats');

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao buscar estatísticas');
    }

    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    throw error;
  }
}

export async function getWeeklyRanking(limit: number = 10) {
  try {
    const response = await api.get(`/gamification/ranking?limit=${limit}`);

    if (!response.data.success) {
      throw new Error(response.data.error || 'Erro ao buscar ranking');
    }

    return response.data.data;
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    throw error;
  }
}

// SISTEMA DE RESGATE MANUAL - LOJA DE RECOMPENSAS

export async function getShopItems() {
  try {
    const response = await api.get('/gamification/shop');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar itens da loja:', error);
    throw error;
  }
}

export async function purchaseShopItem(itemId: string) {
  try {
    const response = await api.post('/gamification/shop/purchase', { itemId });
    return response.data;
  } catch (error) {
    console.error('Erro ao comprar item:', error);
    throw error;
  }
}

export async function getUserPurchases() {
  try {
    const response = await api.get('/gamification/shop/purchases');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar histórico de compras:', error);
    throw error;
  }
}

// SISTEMA DE MISSÕES DIÁRIAS

export async function getDailyMissions() {
  try {
    const response = await api.get('/gamification/missions');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar missões diárias:', error);
    throw error;
  }
}

export async function generateDailyMissions() {
  try {
    const response = await api.post('/gamification/missions/generate');
    return response.data;
  } catch (error) {
    console.error('Erro ao gerar missões diárias:', error);
    throw error;
  }
}

export async function updateMissionProgress(missionId: string, progress: number) {
  try {
    const response = await api.post('/gamification/missions/progress', { missionId, progress });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar progresso da missão:', error);
    throw error;
  }
}

// SISTEMA DE EVENTOS ESPECIAIS

export async function getActiveEvents() {
  try {
    const response = await api.get('/gamification/events');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar eventos ativos:', error);
    throw error;
  }
}

export async function joinEvent(eventId: string) {
  try {
    const response = await api.post('/gamification/events/join', { eventId });
    return response.data;
  } catch (error) {
    console.error('Erro ao participar do evento:', error);
    throw error;
  }
}

export async function updateEventProgress(eventId: string, challengeId: string, progress: number) {
  try {
    const response = await api.post('/gamification/events/progress', { eventId, challengeId, progress });
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar progresso do evento:', error);
    throw error;
  }
}

export async function getUserEvents() {
  try {
    const response = await api.get('/gamification/events/user');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar eventos do usuário:', error);
    throw error;
  }
}