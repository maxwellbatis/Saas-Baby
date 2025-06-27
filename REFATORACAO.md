# Refatoração e Otimização de Requisições

Este documento acompanha as fases de refatoração para otimizar o consumo de API, performance e escalabilidade do Baby Diary.

## Fases de Refatoração

- [ ] **Fase 1: Cache Inteligente no Frontend (React Query/SWR)**
  - Refatorar buscas principais para usar cache e evitar requisições duplicadas.
  Objetivo: Reduzir requisições duplicadas e melhorar a experiência do usuário.
Como será feito:
Instalar e configurar o React Query no projeto.
Refatorar a busca de dados principais (ex: /me, /users, /plans) para usar useQuery.
Definir um tempo de cache (staleTime) adequado (ex: 5 minutos).
Testar se a tela carrega normalmente e se o cache está funcionando (sem múltiplas requisições ao navegar).

  - _Status:_ Em andamento
  - _Observações:_

- [ ] **Fase 2: Debounce em Inputs e Filtros**
  - Adicionar debounce em campos de busca/filtros para evitar requisições a cada tecla.
  Objetivo: Evitar requisições a cada tecla digitada.
Como será feito:
Adicionar debounce (ex: com lodash) nos campos de busca e filtros.
Testar se a busca só dispara após o usuário parar de digitar.

  - _Status:_
  - _Observações:_

- [ ] **Fase 3: Lazy Loading e Requisição Sob Demanda**
  - Buscar dados apenas quando necessário (ex: ao abrir modal, aba, etc).
  Objetivo: Buscar dados apenas quando realmente necessário.
Como será feito:
Ajustar componentes para só buscar dados ao abrir modais, abas ou quando a tela estiver visível.
Testar se as requisições só ocorrem quando o usuário realmente interage.

  - _Status:_
  - _Observações:_

- [ ] **Fase 4: Agrupamento de Endpoints**
  - Criar endpoint /dashboard-inicial para retornar dados agrupados.
  Objetivo: Reduzir múltiplas chamadas para dados iniciais.
Como será feito:
Criar um endpoint /dashboard-inicial que retorna perfil, memórias, vacinas, marcos, etc. de uma vez.
Ajustar o frontend para consumir esse endpoint agrupado.
Testar se a tela inicial carrega tudo com uma única chamada.

  - _Status:_
  - _Observações:_

- [ ] **Fase 5: Rate Limiting no Backend**
  - Adicionar express-rate-limit e configurar limites por IP/token.
  Objetivo: Proteger o backend de abuso e excesso de requisições.
Como será feito:
Adicionar express-rate-limit nas rotas principais.
Configurar limites diferentes para usuários autenticados e não autenticados.
Testar se o sistema responde com erro 429 ao exceder o limite.

  - _Status:_
  - _Observações:_

- [ ] **Fase 6: WebSocket/SSE para Atualizações em Tempo Real**
  - Implementar WebSocket/SSE para notificações e dados dinâmicos.

Objetivo: Eliminar polling constante para notificações e dados dinâmicos.
Como será feito:
Implementar WebSocket (ex: com Socket.IO) para notificações e atualizações de gamificação.
Testar se as notificações chegam em tempo real sem polling.

  - _Status:_
  - _Observações:_

- [ ] **Fase 7: Limitar Requisições em Background**
Objetivo: Evitar requisições quando a aba não está visível.
Como será feito:
Usar document.visibilityState para pausar requisições em abas inativas.
Testar se as chamadas param ao trocar de aba.

  - Pausar requisições quando a aba não estiver visível.
  - _Status:_
  - _Observações:_

---

> Marque cada fase como concluída ao finalizar e registre observações/testes realizados. 