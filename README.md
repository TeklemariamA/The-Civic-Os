# Civic OS

Civic OS is a civic engagement platform built on the [Internet Computer (ICP)](https://internetcomputer.org/). It provides a full-featured multi-page web application for managing proposals, voting, and community users.

## Features

- **Dashboard** – activity overview, upcoming votes, and platform stats
- **Proposals** – submit, filter, and track civic proposals
- **Voting** – cast votes on open polls and view results
- **Users** – manage community members and their roles

---

## Running with Docker

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

### Pulling the latest published image

After every push to `main`, GitHub Actions automatically builds and publishes the image to the GitHub Container Registry. Pull the latest image with:

```bash
docker pull ghcr.io/teklemariama/the-civic-os:latest
docker run -p 8080:80 ghcr.io/teklemariama/the-civic-os:latest
```

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

