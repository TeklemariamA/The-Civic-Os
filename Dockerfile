# ── Stage 1: Build ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

# Work directly inside the frontend sub-tree so no workspace resolution is
# needed (avoids an npm ci workspace bug in the node:20-alpine image).
WORKDIR /app

# Copy the package manifest first for better layer caching.
COPY frontend/package.json ./

# Install ALL frontend dependencies, skipping lifecycle scripts so that
# the dfx-dependent `prebuild` (dfx generate backend) is never executed.
RUN npm install --ignore-scripts

# Copy the full frontend source *after* installing dependencies so that
# source-code changes don't invalidate the dependency-install cache layer.
COPY frontend/ ./

# Build the Vite app using the locally-installed binary (no npx download,
# no PATH assumption – just a direct reference to the binary).
RUN ./node_modules/.bin/vite build

# ── Stage 2: Serve ──────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine

# Copy the compiled static assets from the build stage.
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy the nginx site configuration.
# nginx/default.conf enables SPA routing, gzip, security headers, and HTTPS.
# For local development (docker-compose.yml) the container is accessed via
# http://localhost:8080 which is perfectly fine with this config.
# For production (docker-compose.prod.yml) port 80 and 443 are exposed and
# SSL certificates are mounted from the host by the certbot service.
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Validate the nginx configuration before starting (fails fast on typos).
RUN nginx -t

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

