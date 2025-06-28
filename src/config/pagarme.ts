import axios from 'axios';

// Configuração do Pagar.me
const PAGARME_API_URL = 'https://api.pagar.me/core/v5';
const PAGARME_SECRET_KEY = process.env.PAGARME_SECRET_KEY;
const PAGARME_PUBLIC_KEY = process.env.PAGARME_PUBLIC_KEY;

// Cliente HTTP configurado para Pagar.me
const pagarmeClient = axios.create({
  baseURL: PAGARME_API_URL,
  auth: {
    username: PAGARME_SECRET_KEY || '',
    password: ''
  },
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interfaces para Pagar.me
export interface PagarmeCustomer {
  name: string;
  email: string;
  document?: string;
  type?: 'individual' | 'company';
  phones?: {
    home_phone?: {
      country_code: string;
      area_code: string;
      number: string;
    };
    mobile_phone?: {
      country_code: string;
      area_code: string;
      number: string;
    };
  };
}

export interface PagarmeAddress {
  street: string;
  number: string;
  zip_code: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  complement?: string;
}

export interface PagarmeItem {
  amount: number; // em centavos
  description: string;
  quantity: number;
  code?: string;
}

export interface PagarmeShipping {
  amount: number;
  description: string;
  recipient_name: string;
  recipient_phone: string;
  address: PagarmeAddress;
  type: 'standard' | 'express';
}

export interface PagarmePayment {
  payment_method: 'credit_card' | 'boleto' | 'pix';
  credit_card?: {
    installments: number;
    statement_descriptor: string;
    card?: {
      number: string;
      holder_name: string;
      exp_month: number;
      exp_year: number;
      cvv: string;
      billing_address: PagarmeAddress;
    };
    card_token?: string;
  };
  boleto?: {
    instructions: string[];
    due_at: string;
    document_number: string;
    type: 'DM' | 'BDB';
  };
  pix?: {
    expires_in: number;
  };
}

export interface PagarmeOrder {
  items: PagarmeItem[];
  customer: PagarmeCustomer;
  payments: PagarmePayment[];
  shipping?: PagarmeShipping;
  code?: string;
  metadata?: Record<string, string>;
}

// Função para criar pedido no Pagar.me
export const createPagarmeOrder = async (orderData: PagarmeOrder) => {
  try {
    if (!PAGARME_SECRET_KEY) {
      throw new Error('PAGARME_SECRET_KEY não configurada');
    }

    console.log('🔄 Criando pedido no Pagar.me:', {
      items: orderData.items.length,
      customer: orderData.customer.email,
      payments: orderData.payments.length
    });

    const response = await pagarmeClient.post('/orders', orderData);
    
    console.log('✅ Pedido criado no Pagar.me:', response.data.id);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao criar pedido no Pagar.me:', error.response?.data || error.message);
    throw new Error(`Falha ao criar pedido: ${error.response?.data?.message || error.message}`);
  }
};

// Função para buscar pedido no Pagar.me
export const getPagarmeOrder = async (orderId: string) => {
  try {
    const response = await pagarmeClient.get(`/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao buscar pedido no Pagar.me:', error.response?.data || error.message);
    throw new Error(`Falha ao buscar pedido: ${error.response?.data?.message || error.message}`);
  }
};

// Função para cancelar pedido no Pagar.me
export const cancelPagarmeOrder = async (orderId: string) => {
  try {
    const response = await pagarmeClient.delete(`/orders/${orderId}`);
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao cancelar pedido no Pagar.me:', error.response?.data || error.message);
    throw new Error(`Falha ao cancelar pedido: ${error.response?.data?.message || error.message}`);
  }
};

// Função para criar token de cartão
export const createCardToken = async (cardData: {
  number: string;
  holder_name: string;
  exp_month: number;
  exp_year: number;
  cvv: string;
}) => {
  try {
    const response = await pagarmeClient.post('/tokens', {
      type: 'card',
      card: cardData
    });
    
    return response.data;
  } catch (error: any) {
    console.error('❌ Erro ao criar token de cartão:', error.response?.data || error.message);
    throw new Error(`Falha ao criar token: ${error.response?.data?.message || error.message}`);
  }
};

// Função para validar configuração
export const validatePagarmeConfig = () => {
  if (!PAGARME_SECRET_KEY) {
    throw new Error('PAGARME_SECRET_KEY não configurada');
  }
  if (!PAGARME_PUBLIC_KEY) {
    throw new Error('PAGARME_PUBLIC_KEY não configurada');
  }
  return true;
};

export { PAGARME_PUBLIC_KEY }; 