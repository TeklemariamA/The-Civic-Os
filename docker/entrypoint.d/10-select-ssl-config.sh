#!/bin/sh
# ── Civic OS – automatic nginx SSL config selection ──────────────────────────
#
# This script is executed by the official nginx Docker image's entrypoint
# pipeline (every *.sh file in /docker-entrypoint.d/ runs in alphabetical
# order before nginx is started).
#
# Behaviour
# ---------
#   • Let's Encrypt certificate present  → activates prod.conf (HTTPS with
#     valid LE cert + HTTP-to-HTTPS redirect), replacing default.conf.
#   • No certificate yet                 → keeps default.conf (serves the app
#     on port 80 over HTTP and on port 443 over HTTPS with a self-signed
#     certificate baked into the Docker image).
#
#     The self-signed certificate ensures the TLS handshake always completes,
#     preventing ERR_SSL_PROTOCOL_ERROR.  Direct browser connections will show
#     a "Your connection is not private" warning (users can click through);
#     Cloudflare "Full" SSL mode will work silently.
#
# No manual editing of docker-compose.prod.yml is required.  After certbot
# issues the certificate, restart the frontend container:
#
#   docker compose -f docker-compose.prod.yml up -d --force-recreate frontend
#
# The entrypoint will detect the certificate on the next start and switch to
# the HTTPS configuration automatically.
# ─────────────────────────────────────────────────────────────────────────────
set -eu

DOMAIN="civic-os-opensourcism.cloud"
CERT_FILE="/etc/letsencrypt/live/${DOMAIN}/fullchain.pem"

PROD_CONF="/etc/nginx/conf.d/prod.conf.available"
ACTIVE_CONF="/etc/nginx/conf.d/default.conf"

if [ -f "${CERT_FILE}" ]; then
    echo "[civic-os] TLS certificate found for ${DOMAIN} — activating HTTPS config (prod.conf)"
    cp "${PROD_CONF}" "${ACTIVE_CONF}"
else
    echo "[civic-os] No Let's Encrypt certificate yet — serving app with self-signed certificate"
    echo "[civic-os] Run certbot, then restart this container to activate the trusted certificate."
fi
