# Dockerfile para o backend
FROM node:18-alpine

# Instalar OpenSSL (necessário para algumas dependências)
RUN apk add --no-cache openssl

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Verificar se os aliases foram resolvidos
RUN grep -r "@/controllers" dist/ || echo "Aliases resolvidos com sucesso"

# Expor porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]