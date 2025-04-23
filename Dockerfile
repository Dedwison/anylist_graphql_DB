# Install dependencies only when needed
FROM node:20.19-alpine3.21 AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock ./

# Usar npm install en lugar de npm ci
RUN npm install 

# Build the app with cache dependencies
FROM node:20.19-alpine3.21 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production image, copy all the files and run next
FROM node:20.19-alpine3.21 AS runner

# Set working directory
WORKDIR /usr/src/app

# Copiar node_modules de la etapa de deps en lugar de reinstalar
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

CMD [ "node","dist/main" ]