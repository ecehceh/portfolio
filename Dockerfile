# syntax=docker/dockerfile:1

# Production image for the portfolio: a multi-stage build that ships only
# Next.js's standalone server, the static assets and Node — no dev tooling.
#   docker build -t portfolio --build-arg NEXT_PUBLIC_SITE_URL=https://your-domain.com .
#   docker run -p 3000:3000 portfolio
# Keep NODE_VERSION on the same major as CI (.github/workflows/ci.yml).
ARG NODE_VERSION=22

# ---- deps: install every dependency (the build needs the dev tooling) ----
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --no-audit --no-fund

# ---- build: compile the site into .next/standalone ----
FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
# Baked into canonical URLs, Open Graph tags and the sitemap at build time.
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL} \
    NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build \
  # The trace copies every sharp build in the lockfile; Alpine (musl) only loads
  # the linuxmusl one, so drop the glibc and WebAssembly builds (~27 MB).
  && rm -rf .next/standalone/node_modules/@img/sharp*-linux-* .next/standalone/node_modules/@img/sharp-wasm32

# ---- runtime: the standalone server, run as the unprivileged node user ----
FROM node:${NODE_VERSION}-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
LABEL org.opencontainers.image.title="portfolio" \
      org.opencontainers.image.description="Christopher Evan Wijaksana's developer portfolio" \
      org.opencontainers.image.source="https://github.com/ecehceh/portfolio"

# standalone/ holds server.js and the traced node_modules; the static assets
# and public/ are not part of it and are copied next to it.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

USER node
EXPOSE 3000
# Alpine has no curl; Node's fetch does the job.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + process.env.PORT + '/robots.txt').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"
CMD ["node", "server.js"]
