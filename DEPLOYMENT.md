# Civic OS – Deployment & Availability Guide

This document answers the two most common questions from contributors and operators:

1. **When will the app be available on the web?** — how long each step of the pipeline takes
2. **What is domain propagation?** — what DNS propagation is, why it takes time, and how to check it

---

## Table of Contents

- [Architecture overview](#architecture-overview)
- [End-to-end pipeline timeline](#end-to-end-pipeline-timeline)
- [Step 1 – Merging code and the CI/CD build](#step-1--merging-code-and-the-cicd-build)
- [Step 2 – Pulling the new image on the server](#step-2--pulling-the-new-image-on-the-server)
- [Step 3 – DNS setup and domain propagation](#step-3--dns-setup-and-domain-propagation)
- [Step 4 – TLS certificate issuance](#step-4--tls-certificate-issuance)
- [How to check propagation status](#how-to-check-propagation-status)
- [How to speed up propagation](#how-to-speed-up-propagation)
- [First-time production deployment (step-by-step)](#first-time-production-deployment-step-by-step)
- [Subsequent deployments (rolling update)](#subsequent-deployments-rolling-update)
- [Troubleshooting checklist](#troubleshooting-checklist)

---

## Architecture overview

```
Developer pushes to main
        │
        ▼
GitHub Actions (CI/CD)
  • Builds Docker image from Dockerfile
  • Pushes image to ghcr.io/teklemariama/the-civic-os:latest
        │
        ▼
Production server (Linux VPS)
  • Pulls the new image with `docker compose -f docker-compose.prod.yml pull`
  • Restarts the frontend container
  • nginx serves the React SPA on port 80 (HTTP) and port 443 (HTTPS)
  • certbot sidecar renews Let's Encrypt TLS certificates automatically
        │
        ▼
civic-os-opensourcism.cloud  (or  www.civic-os-opensourcism.cloud)
```

The backend (FastAPI) runs as a second Docker container on the same host and is
reached by nginx via the internal Docker network at `http://backend:8000`.

---

## End-to-end pipeline timeline

| Step | What happens | Typical duration |
|------|-------------|-----------------|
| Merge PR / push to `main` | Triggers the GitHub Actions workflow | < 1 s |
| GitHub Actions build | Builds the Docker image, runs `vite build` | **2–4 min** |
| Image push to GHCR | Docker push to `ghcr.io/…:latest` | ~30 s |
| **Total CI time** | From push to image available | **≈ 3–5 min** |
| Server: `docker compose pull` | Downloads the new image layers | 10 s – 2 min (depends on bandwidth and changed layers) |
| Server: container restart | Old container stops, new one starts, nginx reloads | ~5 s |
| **App live with new code** | After pulling and restarting | **≈ 5–10 min after merge** |

> **Summary:** If DNS is already propagated and TLS certificates are already in place, a code change merged to `main` appears live at **https://civic-os-opensourcism.cloud** in approximately **5–10 minutes**.

---

## Step 1 – Merging code and the CI/CD build

Every push (or merged pull request) to the `main` branch automatically triggers
the workflow defined in `.github/workflows/jekyll-docker.yml`:

1. Checks out the repository.
2. Logs in to the GitHub Container Registry (GHCR).
3. Builds the Docker image using the `Dockerfile` at the repo root.
4. Pushes two tags to `ghcr.io/teklemariama/the-civic-os`:
   - `:latest` — always points to the newest `main` build
   - `:sha-<short-commit-sha>` — an immutable tag for rollbacks

You can watch the build progress at:
`https://github.com/TeklemariamA/The-Civic-Os/actions`

Pull-request builds (not on `main`) still run the Docker build to catch errors,
but do **not** push to GHCR — so only merged, reviewed code reaches the registry.

---

## Step 2 – Pulling the new image on the server

The production server does **not** auto-pull on every push. After a build succeeds you
(or an automated script) run:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend
```

This replaces the running container with the new image with zero downtime — nginx
starts serving the new build within a few seconds of the restart.

---

## Step 3 – DNS setup and domain propagation

### What is DNS?

The **Domain Name System (DNS)** maps human-readable names like
`civic-os-opensourcism.cloud` to the IP address of the server that hosts the app.
Before anyone on the internet can reach the app you must create a DNS **A record**
at your domain registrar.

**Server:** Hostinger KVM 1 VPS — public IP `72.61.96.166`

| Record type | Name | Value |
|-------------|------|-------|
| `A` | `civic-os-opensourcism.cloud` | `72.61.96.166` |
| `A` | `www.civic-os-opensourcism.cloud` | `72.61.96.166` |

> **Where to set these records:** Log in to [hpanel.hostinger.com](https://hpanel.hostinger.com),
> open **Domains → civic-os-opensourcism.cloud → DNS / Nameservers**, and add (or
> update) the two A records above.  If you are using Hostinger's nameservers, make
> the change in the Hostinger DNS editor; if you have delegated nameservers to
> another provider (e.g. Cloudflare), make the change there instead.

The `docker-compose.prod.yml` file does **not** embed an IP address — it uses the
domain name `civic-os-opensourcism.cloud`.  nginx binds to all interfaces on the
VPS (`0.0.0.0:80` / `0.0.0.0:443`), so the A records above are the only place the
IP needs to be configured.

### Verifying DNS configuration

A pre-flight script is included to confirm that the A records and nameservers are
correct **before** you deploy:

```bash
# Run on the VPS or any machine with network access:
bash scripts/check-dns.sh
```

The script queries Google (8.8.8.8), Cloudflare (1.1.1.1), and Quad9 (9.9.9.9)
for each domain and exits non-zero if any resolver returns an unexpected IP.

A GitHub Actions workflow (`.github/workflows/dns-check.yml`) also runs this
check every day at 06:00 UTC and can be triggered manually from the
[Actions tab](https://github.com/TeklemariamA/The-Civic-Os/actions/workflows/dns-check.yml)
before any deployment.

### What is domain propagation?

When you create or change an A record, DNS resolvers around the world **cache** the
old value for a period defined by the record's **TTL (Time To Live)**. Until their
cached copy expires they continue serving the old IP address. The process of the
new record spreading to all resolvers globally is called **DNS propagation**.

### How long does propagation take?

| Scope | Typical time |
|-------|-------------|
| Same data-centre / same ISP | Seconds to a few minutes |
| Major public resolvers (8.8.8.8, 1.1.1.1) | **5–15 minutes** after the TTL of the old record expires |
| Most of the world (≈ 95 % of resolvers) | **1–4 hours** |
| Full global propagation (99.9 %) | Up to **48 hours** (rare; only affects resolvers with very long cache lifetimes) |

> **Practical expectation for a new domain:** DNS is fully propagated for the vast
> majority of users within **1–2 hours** of setting the A record. The "up to 48
> hours" figure is a worst-case guarantee, not the common case.

### Why is there a TTL?

TTL prevents every DNS query from contacting the authoritative nameserver. Without
caching, every browser lookup would add tens to hundreds of milliseconds of latency.
The trade-off is that changes take time to propagate once the old TTL expires.

### Typical TTL values

| TTL | Use case |
|-----|----------|
| 60 s (1 minute) | Short-lived; use before a planned IP change so the change propagates quickly |
| 300 s (5 minutes) | Good balance of agility and cache efficiency |
| 3600 s (1 hour) | Default for many registrars |
| 86 400 s (24 hours) | Stable records that never change |

Civic OS uses **300 s** as the recommended TTL so that rolling updates propagate
within minutes while still benefiting from caching.

---

## Step 4 – TLS certificate issuance

Once DNS is propagated the app is reachable over plain HTTP. HTTPS requires a
TLS certificate from Let's Encrypt. The `certbot` sidecar container handles this
automatically:

1. `certbot` writes an ACME challenge token to `/var/www/certbot`.
2. nginx serves that token at `http://civic-os-opensourcism.cloud/.well-known/acme-challenge/`.
3. Let's Encrypt's servers fetch the token to confirm you control the domain.
4. Let's Encrypt issues a 90-day certificate — this takes **< 30 seconds** once DNS is propagated.

After the first certificate is issued, restart the frontend container to activate HTTPS:

```bash
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend
```

The container's entrypoint script detects the new certificate file at
`/etc/letsencrypt/live/civic-os-opensourcism.cloud/fullchain.pem` and
automatically switches nginx from HTTP-only mode (`default.conf`) to full
HTTPS (`prod.conf`). **No manual file editing is required.**

The `certbot` sidecar checks for renewal every **12 hours** and renews automatically
when fewer than 30 days remain. **No manual action is ever required for renewals.**

> **How auto-detection works:** The Dockerfile bakes `nginx/prod.conf` into the
> image as `/etc/nginx/conf.d/prod.conf.available`. At container start the
> entrypoint script `/docker-entrypoint.d/10-select-ssl-config.sh` checks
> whether the Let's Encrypt certificate file exists. If it does, the script
> copies `prod.conf.available` over `default.conf` so nginx starts with a
> valid, browser-trusted certificate. If the cert is missing, the script
> leaves `default.conf` in place, which serves the app on port 443 using a
> self-signed certificate baked into the Docker image — the TLS handshake
> always completes (preventing `ERR_SSL_PROTOCOL_ERROR`), though browsers
> will show a "not private" warning until the Let's Encrypt cert is issued.

---

## How to check propagation status

### From the command line

```bash
# Check what A record a specific resolver sees for the domain:
dig @8.8.8.8   civic-os-opensourcism.cloud A +short   # Google Public DNS
dig @1.1.1.1   civic-os-opensourcism.cloud A +short   # Cloudflare DNS
dig @9.9.9.9   civic-os-opensourcism.cloud A +short   # Quad9

# Check the current TTL (how many seconds until the cache expires):
dig @8.8.8.8 civic-os-opensourcism.cloud A | grep -A2 "ANSWER SECTION"
```

Expected output once propagated:
```
72.61.96.166
```

### Online tools

| Tool | URL |
|------|-----|
| DNS Checker | https://dnschecker.org |
| WhatsMyDNS | https://www.whatsmydns.net |
| MXToolbox DNS Lookup | https://mxtoolbox.com/DNSLookup.aspx |

These tools simultaneously query dozens of resolvers in different countries and
show a world-map view of propagation progress.

### Check TLS certificate status

```bash
# Confirm the certificate is valid and shows the correct domain:
curl -vI https://civic-os-opensourcism.cloud 2>&1 | grep -E "(subject|issuer|expire|HTTP)"

# Or with openssl for full cert details:
openssl s_client -connect civic-os-opensourcism.cloud:443 -servername civic-os-opensourcism.cloud < /dev/null 2>/dev/null | openssl x509 -noout -dates -subject
```

---

## How to speed up propagation

1. **Lower the TTL *before* making the IP change.** Set it to `60` or `300` seconds
   a day before the planned change. Once the old TTL has expired everywhere, change
   the A record — resolvers will pick up the new IP within 1–5 minutes.

2. **Use a short TTL for the new record.** Set the new A record with TTL `300` while
   you verify the app is working, then raise it back to `3600` for stability.

3. **Flush your own DNS cache** to test immediately from your machine:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   # Linux (systemd-resolved)
   sudo resolvectl flush-caches
   # Windows
   ipconfig /flushdns
   ```

4. **Use a CDN / Anycast DNS** (e.g. Cloudflare's free plan). Cloudflare updates
   their globally-distributed edge network in seconds because you delegate your
   nameservers to them rather than waiting for third-party resolvers to expire.

---

## First-time production deployment (step-by-step)

```bash
# ── On your Hostinger KVM 1 VPS (IP: 72.61.96.166) ─────────────────────────

# 1. Clone the repo
git clone https://github.com/TeklemariamA/The-Civic-Os.git
cd The-Civic-Os

# 2. Verify DNS is correctly configured (all A records resolve to 72.61.96.166):
bash scripts/check-dns.sh
#    All checks must pass before proceeding.  If any FAIL, set the A records
#    in Hostinger hPanel → Domains → DNS / Nameservers and wait 5–15 minutes,
#    then re-run the check.

# 3. Pull the latest image from GHCR
docker compose -f docker-compose.prod.yml pull

# 4. Start the stack (HTTP-only at first; nginx auto-detects certs at startup)
docker compose -f docker-compose.prod.yml up -d

# 5. Issue the Let's Encrypt certificate (takes < 30 s once DNS is propagated)
docker compose -f docker-compose.prod.yml exec certbot certbot certonly \
  --webroot --webroot-path /var/www/certbot \
  -d civic-os-opensourcism.cloud \
  -d www.civic-os-opensourcism.cloud \
  --email your@email.com --agree-tos --no-eff-email

# 6. Restart the frontend container — the entrypoint detects the new cert and
#    activates HTTPS automatically (no file editing needed):
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend

# ── The app is now live at https://civic-os-opensourcism.cloud ──────────────
```

---

## Subsequent deployments (rolling update)

After the initial setup, deploying a new version takes ~2 minutes:

```bash
# Pull the new image (built automatically when a PR is merged to main)
docker compose -f docker-compose.prod.yml pull

# Restart only the frontend container — zero downtime for the certbot sidecar
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend
```

To automate this you can add a `cron` job on the server:
```cron
*/15 * * * * cd /opt/civic-os && docker compose -f docker-compose.prod.yml pull --quiet && docker compose -f docker-compose.prod.yml up -d --force-recreate frontend 2>>/var/log/civic-os-deploy.log
```
This checks for a new image every 15 minutes and restarts the container only if the
digest has changed.

---

## Troubleshooting checklist

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| Browser shows "This site can't be reached" | DNS not yet propagated (A record must point to `72.61.96.166`) | Check in Hostinger hPanel → Domains → DNS; verify with `dig @8.8.8.8 civic-os-opensourcism.cloud A +short` — should return `72.61.96.166` |
| Browser shows `ERR_SSL_PROTOCOL_ERROR` | Container not running, or old image without TLS fallback | Pull latest image: `docker compose -f docker-compose.prod.yml pull && docker compose -f docker-compose.prod.yml up -d --force-recreate frontend` |
| Browser shows an SSL/TLS warning (self-signed) | Let's Encrypt cert not yet issued | Run the certbot step; then `docker compose -f docker-compose.prod.yml up -d --force-recreate frontend` to activate the trusted cert |
| Browser gets an HTTP 502 | The backend container is not running | `docker compose -f docker-compose.prod.yml ps` — restart backend |
| Old code still showing after a deployment | Browser or CDN cache | Hard-refresh (`Ctrl + Shift + R`); confirm `docker compose pull` ran |
| `certbot certonly` fails with "DNS problem" | A record not propagated yet when certbot ran | Wait for propagation (`dig @8.8.8.8 civic-os-opensourcism.cloud A +short` returns `72.61.96.166`), then retry |
| Port 80/443 not reachable | Firewall blocking on VPS | `ufw allow 80/tcp && ufw allow 443/tcp && ufw reload` |
| `docker compose pull` shows "manifest unknown" | Image not yet pushed (CI still building) | Check workflow status at https://github.com/TeklemariamA/The-Civic-Os/actions and wait for it to finish |

---

*For local development instructions see [README.md](README.md).
For ICP mainnet deployment see [BUILD.md](BUILD.md).*
