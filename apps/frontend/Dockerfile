# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack and activate pnpm
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy root package.json and lockfile
COPY package.json pnpm-lock.yaml ./

# Copy frontend package.json
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy all source code
COPY . .

# Build frontend
RUN pnpm --filter frontend build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=production

# Enable corepack and activate pnpm in prod image too
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# Copy root package.json and lockfile again
COPY package.json pnpm-lock.yaml ./

# Copy frontend package.json
COPY apps/frontend/package.json ./package.json

# Install only production dependencies for frontend (including Next.js runtime)
RUN pnpm install --prod --filter frontend...

# Copy build output and public folder
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/public ./public

EXPOSE 3000

CMD ["pnpm", "start"]