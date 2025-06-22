# Guia de Contribuição

Obrigado por considerar contribuir para o Baby Diary! Este documento fornece diretrizes para contribuir com o projeto.

## Como Contribuir

### Reportando Bugs

- Use o template de bug report
- Inclua passos detalhados para reproduzir o problema
- Adicione screenshots se relevante
- Especifique seu ambiente (OS, browser, versão)

### Sugerindo Melhorias

- Use o template de feature request
- Descreva claramente a funcionalidade desejada
- Explique por que essa funcionalidade seria útil
- Considere alternativas e trade-offs

### Enviando Pull Requests

1. **Fork o repositório**
2. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```
3. **Faça suas mudanças**
4. **Teste suas mudanças**
   ```bash
   npm test
   npm run build
   ```
5. **Commit suas mudanças**
   ```bash
   git commit -m "feat: adiciona nova funcionalidade"
   ```
6. **Push para sua branch**
   ```bash
   git push origin feature/nova-funcionalidade
   ```
7. **Abra um Pull Request**

## Padrões de Código

### JavaScript/TypeScript

- Use TypeScript para novos arquivos
- Siga o ESLint configurado
- Use Prettier para formatação
- Escreva testes para novas funcionalidades
- Documente funções complexas

### React

- Use hooks funcionais
- Siga as convenções de nomenclatura
- Componentize quando apropriado
- Use TypeScript para props

### Banco de Dados

- Use Prisma para queries
- Escreva migrations para mudanças no schema
- Teste migrations em ambiente de desenvolvimento
- Documente mudanças importantes

## Estrutura do Projeto

```
babydiary/
├── src/                    # Backend
│   ├── controllers/        # Controllers da API
│   ├── services/          # Lógica de negócio
│   ├── routes/            # Rotas da API
│   ├── middlewares/       # Middlewares
│   ├── config/            # Configurações
│   └── utils/             # Utilitários
├── baby-diary-user-panel/ # Frontend
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilitários
│   └── public/            # Arquivos estáticos
├── prisma/                # Schema e migrations
├── scripts/               # Scripts utilitários
└── docs/                  # Documentação
```

## Testes

### Backend

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes de cobertura
npm run test:coverage
```

### Frontend

```bash
cd baby-diary-user-panel

# Executar testes
npm test

# Executar testes em modo watch
npm run test:watch
```

## Ambiente de Desenvolvimento

### Pré-requisitos

- Node.js 18+
- PostgreSQL 15+
- Docker (opcional)

### Configuração

1. **Clone o repositório**
   ```bash
   git clone https://github.com/maxwellbatis/babydiary.git
   cd babydiary
   ```

2. **Configure o backend**
   ```bash
   cd src
   npm install
   cp .env.example .env
   # Edite o .env com suas configurações
   ```

3. **Configure o banco de dados**
   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Configure o frontend**
   ```bash
   cd ../baby-diary-user-panel
   npm install
   cp .env.example .env
   # Edite o .env com suas configurações
   ```

5. **Inicie os serviços**
   ```bash
   # Backend
   cd ../src
   npm run dev

   # Frontend (em outro terminal)
   cd ../baby-diary-user-panel
   npm run dev
   ```

## Convenções de Commit

Usamos [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` mudanças na documentação
- `style:` formatação, ponto e vírgula, etc.
- `refactor:` refatoração de código
- `test:` adicionando ou corrigindo testes
- `chore:` mudanças em build, configs, etc.

## Pull Request Guidelines

- **Título descritivo**: Use um título claro e conciso
- **Descrição detalhada**: Explique o que foi feito e por quê
- **Testes**: Inclua testes para novas funcionalidades
- **Documentação**: Atualize documentação se necessário
- **Screenshots**: Adicione screenshots para mudanças visuais

## Revisão de Código

- Todos os PRs precisam de aprovação
- Mantenha discussões construtivas
- Use sugestões do GitHub quando apropriado
- Responda a feedback rapidamente

## Recursos Úteis

- [Documentação da API](https://api.babydiary.shop/docs)
- [Guia de Estilo](STYLE_GUIDE.md)
- [FAQ](FAQ.md)
- [Discord](https://discord.gg/babydiary)

## Agradecimentos

Obrigado por contribuir para tornar o Baby Diary melhor para todos os pais e bebês! 🍼 