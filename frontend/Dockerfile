# Multi-stage Dockerfile for Next.js with TypeScript and Tailwind CSS

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy dependencies
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ARG NEXT_PUBLIC_APP_NAME
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL

ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN pnpm build

# Stage 3: Production runner
FROM node:18-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Set correct permissions
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]

# Stage 4: Development
FROM node:18-alpine AS development
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install

# Copy source code
COPY . .

EXPOSE 5000

CMD ["pnpm", "dev"]
