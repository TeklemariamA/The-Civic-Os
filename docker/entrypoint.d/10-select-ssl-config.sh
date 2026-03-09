#!/bin/sh
# ── Civic OS – automatic nginx SSL config selection ──────────────────────────
#
# This script is executed by the official nginx Docker image's entrypoint
# pipeline (every *.sh file in /docker-entrypoint.d/ runs in alphabetical
# order before nginx is started).
#
# Behaviour
# ---------
#   • Let's Encrypt certificate present  → activates prod.conf (HTTPS + HTTP
#     redirect), replacing default.conf in /etc/nginx/conf.d/.
#   • No certificate yet                 → keeps default.conf (HTTP-only with
#     ACME-challenge support and a graceful ssl_reject_handshake on port 443).
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
    echo "[civic-os] No TLS certificate yet — running in HTTP-only mode (ACME challenges served on port 80)"
    echo "[civic-os] Run certbot, then restart this container to enable HTTPS automatically."
fi
