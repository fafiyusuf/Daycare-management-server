## Frontend Dockerfile (Next.js) - Production Ready
## Multi-stage build for slim runtime; using PNPM

FROM node:20-alpine AS deps
WORKDIR /app
RUN corepack enable
COPY frontend/pnpm-lock.yaml frontend/package.json ./
RUN pnpm fetch

FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable
COPY frontend/package.json frontend/pnpm-lock.yaml ./
COPY --from=deps /root/.pnpm-store /root/.pnpm-store
ENV NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production
COPY frontend .
RUN pnpm install --frozen-lockfile --offline \
  && pnpm build \
  && rm -rf node_modules \
  && pnpm install --prod --frozen-lockfile --offline

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER app
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -qO- http://localhost:3000/ || exit 1

CMD ["node", "server.js"]
