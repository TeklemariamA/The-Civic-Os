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

# ── nginx configuration ────────────────────────────────────────────────────────
#
# default.conf  – active config baked into the image.
#   • Serves the React SPA over plain HTTP (port 80).
#   • Handles Let's Encrypt ACME challenges (/.well-known/acme-challenge/).
#   • Gracefully rejects HTTPS on port 443 before certs exist
#     (ssl_reject_handshake on) — prevents ERR_SSL_PROTOCOL_ERROR.
#
# prod.conf.available  – stored in the image but NOT auto-loaded by nginx
#   (nginx only includes *.conf files).  The entrypoint hook below copies it
#   over default.conf at container start when Let's Encrypt certs are present.
COPY nginx/default.conf          /etc/nginx/conf.d/default.conf
COPY nginx/prod.conf             /etc/nginx/conf.d/prod.conf.available

# ── Entrypoint hook ────────────────────────────────────────────────────────────
# The official nginx image runs every *.sh file in /docker-entrypoint.d/ (in
# alphabetical order) before starting nginx.  This hook auto-selects the right
# nginx configuration based on whether Let's Encrypt cert files are present.
COPY docker/entrypoint.d/10-select-ssl-config.sh \
     /docker-entrypoint.d/10-select-ssl-config.sh
RUN chmod +x /docker-entrypoint.d/10-select-ssl-config.sh

# Validate the default configuration (prod.conf.available is skipped because
# it doesn't match the *.conf glob nginx includes at startup).
RUN nginx -t

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]

