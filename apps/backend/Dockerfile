FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN DATABASE_URL="postgresql://admin:admin@localhost:5432/g-hub" npx prisma generate

EXPOSE 3001

CMD ["sh", "-c", "npx prisma generate && npm run start:dev"]

FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN DATABASE_URL="postgresql://admin:admin@localhost:5432/g-hub" npx prisma generate && npm run build

FROM node:20-alpine AS production

WORKDIR /app

COPY package*.json ./
COPY prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma
RUN npm install --only=production
RUN DATABASE_URL="postgresql://admin:admin@localhost:5432/g-hub" npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3001

CMD ["node", "dist/main"]
