# ---- Build Stage ----
FROM node:22.12.0-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install deps fresh — no cache, force optional Linux bindings
RUN npm install --legacy-peer-deps --include=optional

# Copy rest of the source code
COPY . .

# Limit memory usage during build to prevent OOM kills on smaller servers
ENV NODE_OPTIONS="--max-old-space-size=2048"
# Build with Node server preset
RUN NITRO_PRESET=node-server npm run build

# ---- Production Stage ----
FROM node:22.12.0-slim AS runner

WORKDIR /app

# Only copy the built output
COPY --from=builder /app/.output /app/.output

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]
