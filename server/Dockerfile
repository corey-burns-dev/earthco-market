# ── deps ──────────────────────────────────────────────────────────────────────
FROM oven/bun:1.3.9-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
COPY server/package.json ./server/
RUN bun install --frozen-lockfile --production=false

# ── build ─────────────────────────────────────────────────────────────────────
FROM deps AS build
WORKDIR /app
COPY server/ ./server/
RUN bun run --cwd server prisma:generate
RUN bun run --cwd server build

# ── release ───────────────────────────────────────────────────────────────────
FROM oven/bun:1.3.9-alpine AS release
WORKDIR /app

# Prisma needs the generated client and schema at runtime
COPY --from=build /app/server/dist ./dist
COPY --from=build /app/server/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/server/node_modules/@prisma ./node_modules/@prisma
COPY server/prisma/schema.prisma ./prisma/schema.prisma

# Production deps only
COPY server/package.json ./
RUN bun install --frozen-lockfile --production

EXPOSE 3000
ENV NODE_ENV=production

CMD ["bun", "dist/index.js"]
