# API Loja - Baby Diary (Admin)

Este mini-README documenta os principais endpoints REST para administração de produtos, categorias e tags da loja do Baby Diary.

---

## Autenticação
Todas as rotas abaixo exigem autenticação de admin (Bearer Token).

---

## Produtos (ShopItem)

### Listar todos os produtos
`GET /api/admin/shop-items`

### Detalhar um produto
`GET /api/admin/shop-items/:id`

### Criar produto
`POST /api/admin/shop-items`
```json
{
  "name": "Kit Praia Proteção UV",
  "description": "Kit completo para praia com proteção solar.",
  "type": "theme",
  "category": "premium", // (deprecado, use categoryId)
  "categoryId": "<id_categoria>",
  "price": 12990,
  "imageUrl": "https://...",
  "isActive": true,
  "isLimited": false,
  "stock": 100,
  "sortOrder": 1,
  "tags": ["<id_tag1>", "<id_tag2>"]
}
```

### Atualizar produto
`PUT /api/admin/shop-items/:id`
(Same payload as POST, campos opcionais)

### Deletar produto
`DELETE /api/admin/shop-items/:id`

---

## Categorias

### Listar categorias
`GET /api/admin/categories`

### Detalhar categoria
`GET /api/admin/categories/:id`

### Criar categoria
`POST /api/admin/categories`
```json
{
  "name": "Cuidados com o bebê",
  "description": "Produtos para higiene, saúde e bem-estar.",
  "isActive": true,
  "sortOrder": 1
}
```

### Atualizar categoria
`PUT /api/admin/categories/:id`

### Deletar categoria
`DELETE /api/admin/categories/:id`

---

## Tags

### Listar tags
`GET /api/admin/tags`

### Detalhar tag
`GET /api/admin/tags/:id`

### Criar tag
`POST /api/admin/tags`
```json
{
  "name": "Promoção",
  "description": "Produtos em oferta",
  "isActive": true
}
```

### Atualizar tag
`PUT /api/admin/tags/:id`

### Deletar tag
`DELETE /api/admin/tags/:id`

---

## Observações
- Para associar tags a um produto, envie o array de IDs de tags no campo `tags` ao criar/atualizar ShopItem.
- O campo `category` em ShopItem é legado, prefira usar `categoryId`.
- Todos os endpoints retornam `{ success, data }` ou `{ success, error }`.
- Os campos `createdAt` e `updatedAt` são gerados automaticamente.

---

## Exemplo de fluxo de criação
1. Crie uma categoria (`POST /categories`).
2. Crie uma ou mais tags (`POST /tags`).
3. Crie um produto associando `categoryId` e array de `tags` (`POST /shop-items`).

---

Dúvidas? Consulte o backend ou peça exemplos de integração frontend! 