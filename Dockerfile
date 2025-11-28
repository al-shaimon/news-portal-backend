FROM node:20-bullseye-slim AS base

WORKDIR /app

COPY package*.json ./

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/* \
  && npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["sh", "-c", "node src/server.js"]
