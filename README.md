# Cooling System Monitor (MES Dashboard)

This repository contains a responsive Web SPA dashboard for a production workstation, designed to monitor cooling system metrics. This project is built to demonstrate modern frontend architecture and a migration strategy from Vue to Angular.

## Architecture & Tech Stack

### Core Framework
- **Angular 22** (Standalone Components, Signals, new Control Flow)
- **TypeScript**

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
- Multi-stage Docker build ready for Nginx deployment.
- **GitHub Actions** CI pipeline with strict **Angular ESLint** code quality gates.

---

## Getting Started

### Prerequisites
- Node.js (v22+)
- npm

### Installation
1. Clone the repository
2. Navigate to the Angular dashboard app:
   ```bash
   cd dashboard
   npm install
   ```

### Environment Setup
Since the application relies on a PrimeUI license, you must create a local environment file that is ignored by Git.
Create a file at `dashboard/src/environments/environment.ts` with the following content:

```typescript
export const environment = {
  production: false,
  primeuiLicense: 'YOUR_PRIMEUI_LICENSE_KEY'
};
```

### Running the Development Server
Run the Angular development server:
```bash
npm run start
```
Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.
