# Civic OS

Civic OS is a civic engagement platform built on the [Internet Computer (ICP)](https://internetcomputer.org/). It provides a full-featured multi-page web application for managing proposals, voting, and community users.

## Features

### Governance
- **Dashboard** – activity overview, upcoming votes, and platform stats
- **Proposals** – submit, filter, and track civic proposals
- **Voting** – cast votes on open polls and view results

### Community
- **Users** – manage community members and their roles
- **Bounties** – post and claim civic tasks with time-escalating rewards
- **Justice** – decentralised dispute resolution with merit-weighted jurors

### Privacy & Identity
- **ZK-Audit** – zero-knowledge public audit log: verify *what* happened without revealing *who* did it
- **Consent Forms** – review and digitally sign required governance consent agreements
- **Sovereign Identity** – issue and manage decentralised citizen identity credentials (DIDs)

---

## When will the app be live on the web?

> **Short answer:** approximately **5–10 minutes** after a pull request is merged
> to `main` — if DNS is already configured. A brand-new domain will also require
> DNS propagation, which takes **1–4 hours** for most of the world (worst-case 48 h).

| Step | What happens | Typical time |
|------|-------------|-------------|
| Merge PR to `main` | GitHub Actions builds & pushes the Docker image to GHCR | **2–4 min** |
| Server pulls the new image | `docker compose pull` downloads updated layers | ~30 s – 2 min |
| Container restarts | nginx starts serving the new build | ~5 s |
| **DNS propagation** *(first deploy only)* | A record spreads to resolvers worldwide | **1–4 h** (up to 48 h worst-case) |
| TLS certificate *(first deploy only)* | Let's Encrypt / certbot issues the HTTPS cert | < 30 s |

For the full deployment walkthrough — including how to point your domain, how
DNS propagation works, how to check it, and how to speed it up — see
**[DEPLOYMENT.md](DEPLOYMENT.md)**.

---

## Running with Docker (local development)

The easiest way to run Civic OS locally is with Docker. No ICP or Node.js tooling is required.

### Prerequisites

- [Docker](https://docs.docker.com/engine/install/) installed and running

### Start the app

```bash
docker compose up --build
```

Then open **http://localhost:8080** in your browser.

> The `--build` flag rebuilds the image from the latest source code every time. Omit it on subsequent runs if you have not changed any files.

### Stop the app

```bash
docker compose down
```

---

## Deploying to a public domain (civic-os-opensourcism.cloud)

Use `docker-compose.prod.yml` on your server. It publishes the app on ports 80 and 443, and manages Let's Encrypt TLS certificates automatically via certbot.

### Prerequisites

- A Linux server (VPS) with [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/)
- The domain's **A record** pointed to the server's public IP address
- Ports **80** and **443** open in the server's firewall

### First-time deployment

```bash
# 1. Clone the repo (or pull the latest code)
git clone https://github.com/TeklemariamA/The-Civic-Os.git
cd The-Civic-Os

# 2. Pull the latest pre-built image
docker compose -f docker-compose.prod.yml pull

# 3. Start in HTTP-only mode (needed for the cert challenge)
docker compose -f docker-compose.prod.yml up -d

# 4. Obtain the Let's Encrypt certificate
docker compose -f docker-compose.prod.yml exec certbot certbot certonly \
  --webroot --webroot-path /var/www/certbot \
  -d civic-os-opensourcism.cloud \
  -d www.civic-os-opensourcism.cloud \
  --email your@email.com --agree-tos --no-eff-email

# 5. Enable HTTPS: open docker-compose.prod.yml and uncomment the two
#    volume lines under `frontend` that reference nginx/prod.conf and
#    letsencrypt, then restart the frontend container:
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend
```

The app is now live at **https://civic-os-opensourcism.cloud**.

Certificates renew automatically — certbot checks every 12 hours and renews when fewer than 30 days remain.

### Pulling updates

Every push to `main` builds and publishes a new image to the GitHub Container Registry. To deploy the latest version on your server:

```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d --force-recreate frontend
```

### Nginx configuration files

| File | Purpose |
|---|---|
| `nginx/default.conf` | Baked into the Docker image. HTTP on port 80, SPA routing, gzip, security headers. Used for local dev and for the initial HTTP-only phase on the server. |
| `nginx/prod.conf` | Mounted at runtime in production. Adds HTTPS (port 443) with Let's Encrypt certs, HSTS, and HTTP→HTTPS redirect. Activate by uncommenting the volume lines in `docker-compose.prod.yml`. |

---

## Local development (without Docker)

### Prerequisites

- [Node.js](https://nodejs.org/en/download/package-manager)
- [dfx](https://internetcomputer.org/docs/building-apps/getting-started/install) (ICP SDK)
- [Mops](https://docs.mops.one/quick-start#2-install-mops-cli) – Motoko package manager

### Setup & run

```bash
# 1. Install dependencies
npm install

# 2. Start the local ICP replica in the background
dfx start --background

# 3. Deploy canisters locally and generate type declarations
dfx deploy

# 4. Start the Vite dev server
npm run dev -w frontend
```

The app will be available at **http://127.0.0.1:5173**.

---

## Dev Container (VS Code)

For a fully pre-configured development environment, install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) and [Docker](https://docs.docker.com/engine/install/), then run:

```
Dev Containers: Reopen in Container
```

from the VS Code command palette. `npm install` runs automatically when the container starts.

---

## Deploying to ICP mainnet

```bash
dfx deploy --network ic
```

See [BUILD.md](BUILD.md) for full instructions including obtaining cycles.
