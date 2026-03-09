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

# Enable SPA routing: unknown paths fall back to index.html so React Router
# can handle client-side navigation instead of getting a 404 from nginx.
RUN printf 'server {\n\
    listen 80;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
}\n' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
