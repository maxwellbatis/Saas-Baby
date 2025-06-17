# 📚 Documentação da API - Baby Diary

## 🏗️ **Estrutura da API**

O sistema de API do Baby Diary está centralizado e organizado em serviços específicos para cada funcionalidade.

### **URLs Configuradas**
- **Desenvolvimento**: `http://localhost:3000/api`
- **Produção**: `https://baby-diary-saas-production.up.railway.app/api`

## 🔧 **Serviços Disponíveis**

### **1. AuthService** (`services/authService.ts`)
Gerencia autenticação e usuários.

```typescript
import { AuthService } from '@/services/authService';

// Login
const response = await AuthService.login({
  email: 'usuario@email.com',
  password: '123456'
});

// Registro
const response = await AuthService.register({
  name: 'João Silva',
  email: 'joao@email.com',
  password: '123456'
});

// Logout
await AuthService.logout();

// Recuperar senha
await AuthService.forgotPassword('usuario@email.com');
```

### **2. BabyService** (`services/babyService.ts`)
Gerencia bebês cadastrados.

```typescript
import { BabyService } from '@/services/babyService';

// Buscar todos os bebês
const response = await BabyService.getBabies();

// Criar bebê
const response = await BabyService.createBaby({
  name: 'Maria',
  birthDate: '2024-01-15',
  gender: 'female',
  weight: 3.2,
  height: 50
});

// Atualizar bebê
const response = await BabyService.updateBaby({
  id: 'baby-id',
  name: 'Maria Silva',
  weight: 3.5
});

// Upload foto
const response = await BabyService.uploadBabyPhoto('baby-id', {
  uri: 'file://path/to/photo.jpg',
  type: 'image/jpeg',
  name: 'photo.jpg'
});
```

### **3. ActivityService** (`services/activityService.ts`)
Gerencia atividades dos bebês.

```typescript
import { ActivityService } from '@/services/activityService';

// Buscar atividades
const response = await ActivityService.getActivities({
  babyId: 'baby-id',
  type: 'sleep',
  startDate: '2024-01-01',
  endDate: '2024-01-31'
});

// Criar atividade
const response = await ActivityService.createActivity({
  babyId: 'baby-id',
  type: 'sleep',
  title: 'Sono da manhã',
  timestamp: '2024-01-15T09:00:00Z',
  duration: '120', // minutos
  notes: 'Dormiu tranquilamente'
});

// Atividades de hoje
const response = await ActivityService.getTodayActivities('baby-id');

// Estatísticas
const response = await ActivityService.getActivityStats('baby-id', 'week');
```

## 🎯 **Como Usar nos Componentes**

### **Exemplo: Tela de Login**
```typescript
import { AuthService } from '@/services/authService';

const handleLogin = async () => {
  try {
    const response = await AuthService.login({
      email: email,
      password: password
    });

    if (response.success) {
      // Login bem-sucedido
      console.log('Usuário:', response.data.user);
      router.replace('/(tabs)');
    } else {
      // Erro no login
      Alert.alert('Erro', response.error || 'Falha no login');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

### **Exemplo: Listar Bebês**
```typescript
import { BabyService } from '@/services/babyService';
import { useState, useEffect } from 'react';

const [babies, setBabies] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadBabies = async () => {
    try {
      const response = await BabyService.getBabies();
      if (response.success) {
        setBabies(response.data);
      }
    } catch (error) {
      console.error('Erro ao carregar bebês:', error);
    } finally {
      setLoading(false);
    }
  };

  loadBabies();
}, []);
```

### **Exemplo: Criar Atividade**
```typescript
import { ActivityService } from '@/services/activityService';

const handleCreateActivity = async () => {
  try {
    const response = await ActivityService.createActivity({
      babyId: selectedBaby.id,
      type: 'feeding',
      title: 'Mamadeira',
      timestamp: new Date().toISOString(),
      amount: '180ml',
      notes: 'Tomou tudo'
    });

    if (response.success) {
      Alert.alert('Sucesso', 'Atividade criada!');
      // Atualizar lista
    } else {
      Alert.alert('Erro', response.error || 'Falha ao criar atividade');
    }
  } catch (error) {
    console.error('Erro:', error);
  }
};
```

## 🔐 **Autenticação Automática**

O sistema gerencia automaticamente:
- ✅ **Tokens JWT** (salva/remove do AsyncStorage)
- ✅ **Headers de autorização** (incluídos automaticamente)
- ✅ **Sessão expirada** (redireciona para login)
- ✅ **Refresh tokens** (se configurado no backend)

## 📊 **Tratamento de Respostas**

Todas as respostas seguem o padrão:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### **Exemplo de Uso:**
```typescript
const response = await BabyService.getBabies();

if (response.success) {
  // Dados disponíveis em response.data
  console.log('Bebês:', response.data);
} else {
  // Erro disponível em response.error
  console.error('Erro:', response.error);
}
```

## 🚀 **Upload de Arquivos**

```typescript
// Upload de foto
const response = await api.uploadFile('/upload', {
  uri: 'file://path/to/file.jpg',
  type: 'image/jpeg',
  name: 'photo.jpg'
}, {
  babyId: 'baby-id',
  description: 'Foto do bebê'
});
```

## ⚙️ **Configuração de Ambiente**

As URLs são configuradas automaticamente baseadas no ambiente:

```typescript
// config/environment.ts
export const ENV = {
  BACKEND_URL: __DEV__ 
    ? 'http://localhost:3000'     // Desenvolvimento
    : 'https://baby-diary-saas-production.up.railway.app', // Produção
};
```

## 🔧 **Próximos Passos**

1. **Criar serviços adicionais**:
   - `MemoryService` - Para memórias
   - `MilestoneService` - Para marcos
   - `NotificationService` - Para notificações

2. **Implementar cache** para melhor performance
3. **Adicionar retry automático** para falhas de rede
4. **Implementar offline mode** com sincronização

## 📝 **Notas Importantes**

- ✅ Todas as requisições são tipadas com TypeScript
- ✅ Tratamento automático de erros
- ✅ Timeout configurável (10 segundos)
- ✅ Suporte a upload de arquivos
- ✅ Gerenciamento automático de tokens
- ✅ URLs configuráveis por ambiente

O sistema está pronto para uso em produção! 🚀 