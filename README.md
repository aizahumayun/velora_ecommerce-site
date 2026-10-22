# VELORA

VELORA is an npm workspace containing a Vite/React frontend, an independent Express API, and a small shared package for catalog data and domain types.

## Requirements

- Node.js 22.12 or newer
- npm 10 or newer

## Install and Configure

```powershell
npm install
Copy-Item backend/.env.example backend/.env
```

Set `MONGODB_URI` in `backend/.env` to enable MongoDB persistence. SMTP settings are optional and enable order confirmation email. The frontend defaults to `/api`; its Vite development server proxies that path to `http://localhost:3000`.

`JWT_SECRET` must be a random value of at least 32 characters. For a separately hosted frontend, set `CORS_ORIGINS` to a comma-separated list of exact trusted origins in `backend/.env`, and set `VITE_API_URL` to the API base URL before building. `VITE_` variables are public browser configuration and must not contain secrets.

The checkout currently records an order but does not process card payments. Order confirmation is not proof of payment; integrate and verify a payment provider before accepting real orders.

## Development

Run these in separate terminals:

```powershell
npm run dev:backend
npm run dev:frontend
```

The API listens on port 3000 by default. Vite prints the frontend URL when it starts. Set `VITE_API_URL` to the deployed API base URL when building a frontend for a separately hosted backend.

## Checks and Builds

```powershell
npm run typecheck
npm run build
npm run start:backend
```

The production frontend output is in `frontend/dist`; the compiled API is in `backend/dist`. The API health endpoint is `/api/health`.

## Deployment

- Deploy `frontend/dist` as a static site. Set `VITE_API_URL` to the backend's `/api` URL before building.
- Run the compiled API on a persistent Node.js host with `npm run start:backend` after `npm run build`.
- Configure `PORT`, `NODE_ENV=production`, `MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_SECRET`, and `CORS_ORIGINS` through the backend host's secret/configuration service.
- Configure `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `EMAIL_FROM` only if email delivery is needed.
- Configure MongoDB Atlas network access and credentials manually. No database migrations or Atlas settings are managed by this project.
