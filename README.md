# Cooling System Monitor (MES Dashboard)

This repository contains a responsive Web SPA dashboard for a production workstation, designed to monitor cooling system metrics. This project is built to demonstrate modern frontend architecture and a migration strategy from Vue to Angular.

## Architecture & Tech Stack

### Core Framework
- **Angular 22** (Standalone Components, Signals, new Control Flow)

### Vue Integration (Web Components)
- **Vue 2.7 (Composition API)**: Embedded seamlessly into the Angular application as a Custom Element (Web Component).

### UI / UX & Visualization
- **PrimeNG** (Angular UI Library)
- **PrimeVue** (Vue UI Library for the embedded component)
- **Chart.js** (via PrimeNG `p-chart`)

### Data & State Management
- Simulated REST API & WebSocket streams using **RxJS** and **Angular Signals**.

### Infrastructure
- Progressive Web App (**PWA**) enabled.
- Fully localized (EN/PL) using **@angular/localize**.
- Multi-stage Docker build served via **Nginx**.
- Deployed on [Render.com](https://mes-dashboard-mjfs.onrender.com). (Docker runtime).
- **GitHub Actions** CI pipeline with strict **Angular ESLint** code quality gates.

---

## Getting Started

### Prerequisites
- Node.js (v22+)
- npm

### 1. Environment Setup

The application requires a PrimeUI license key, which is kept out of version control.

Copy the example file and fill in your values:
```bash
cp .env.example .env
# edit .env and set your PRIMEUI_LICENSE value
```

Then generate `dashboard/src/environments/environment.ts` from the template:
```bash
node setup-env.js
```

> The `.env` file and `environment.ts` are both git-ignored. Run `setup-env.js` whenever you clone the repo or change `.env`.

### 2. Build the Vue Web Component

The Angular app embeds a Vue component as a Custom Element. Build it first:
```bash
cd vue-app
npm install
npm run build
cd ..
```

### 3. Run the Development Server
```bash
cd dashboard
npm install
npm run start
```
Navigate to `http://localhost:4200/`. The application auto-reloads on file changes.

---

## Docker

Build and run the full application in a container (multi-stage build: Vue → Angular → Nginx):

```bash
docker build \
  --build-arg PRIMEUI_LICENSE=<your_license_key> \
  -t dashboard .

docker run -p 8080:80 dashboard
```

Navigate to `http://localhost:8080/`.
