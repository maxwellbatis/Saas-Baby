-- Script de inicialização do banco de dados PostgreSQL
-- Este arquivo é executado automaticamente quando o container PostgreSQL é criado

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configurar timezone
SET timezone = 'UTC';

-- Criar usuário se não existir (será criado pelo Docker, mas por segurança)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'babydiary_user') THEN
        CREATE ROLE babydiary_user WITH LOGIN PASSWORD 'babydiary_password';
    END IF;
END
$$;

-- Dar permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE babydiary TO babydiary_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO babydiary_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO babydiary_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO babydiary_user;

-- Configurar permissões para tabelas futuras
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO babydiary_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO babydiary_user;

-- Log de inicialização
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING;

-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET pg_stat_statements.track = 'all';
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000;

-- Recarregar configurações
SELECT pg_reload_conf(); 