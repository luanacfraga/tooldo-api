# Multi-stage build para otimizar o tamanho da imagem final

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Copiar schema do Prisma antes de instalar (necessário para o script prepare)
COPY src/infra/database/prisma ./src/infra/database/prisma

# Instalar dependências (o script prepare vai rodar prisma:generate)
RUN npm ci

# Copiar resto do código fonte
COPY . .

# Gerar Prisma Client
RUN npm run prisma:generate

# Build da aplicação
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

WORKDIR /app

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copiar arquivos de dependências
COPY package*.json ./

# Copiar schema do Prisma antes de instalar dependências (necessário para o script prepare)
COPY --from=builder /app/src/infra/database/prisma ./src/infra/database/prisma

# Instalar apenas dependências de produção
# O script prepare vai rodar prisma:generate automaticamente
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar arquivos buildados do stage anterior
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nestjs:nodejs /app/src/infra/database/prisma ./src/infra/database/prisma
COPY --from=builder --chown=nestjs:nodejs /app/scripts ./scripts

RUN chmod +x /app/scripts/docker-entrypoint.sh

# Mudar para usuário não-root
USER nestjs

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Entrypoint: migrações automáticas + comando (node dist/main.js)
ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
