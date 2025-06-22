-- Script para criar um administrador no Baby Diary
-- Execute este script no seu banco de dados PostgreSQL

-- Inserir administrador
INSERT INTO "Admin" (
  id, 
  email, 
  password, 
  name, 
  role, 
  "isActive", 
  permissions, 
  "createdAt", 
  "updatedAt"
) VALUES (
  gen_random_uuid(), -- Gera um UUID único
  'admin@babydiary.com',
  '$2a$10$gGrqVbKmrtn4Y330YrDdV.N9s83z2gqtJWZOXaqKHfGE/Ww.JEBLO', -- Hash da senha 'admin123'
  'Administrador',
  'admin',
  true,
  '[]', -- Permissões vazias (array JSON)
  NOW(),
  NOW()
);

-- Verificar se foi inserido corretamente
SELECT 
  id, 
  email, 
  name, 
  role, 
  "isActive", 
  "createdAt"
FROM "Admin" 
WHERE email = 'admin@babydiary.com';

-- Comandos para testar (opcional):
-- 1. Listar todos os admins:
-- SELECT * FROM "Admin";

-- 2. Deletar admin específico (se necessário):
-- DELETE FROM "Admin" WHERE email = 'admin@babydiary.com';

-- 3. Atualizar senha (se necessário):
-- UPDATE "Admin" 
-- SET password = '$2a$10$gGrqVbKmrtn4Y330YrDdV.N9s83z2gqtJWZOXaqKHfGE/Ww.JEBLO'
-- WHERE email = 'admin@babydiary.com'; 