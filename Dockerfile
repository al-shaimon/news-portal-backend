FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
ENV PORT=5000
ENV BACKEND_DB_PORT=5433

EXPOSE 5000

CMD ["sh", "-c", "node src/server.js"]
