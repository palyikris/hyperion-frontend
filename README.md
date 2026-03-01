# Hyperion Frontend

Hyperion Frontend is a React + TypeScript SPA for an environmental monitoring platform. It provides authenticated operator workflows for dashboard monitoring, geospatial review, upload processing, and media vault management.

## Current status

Implemented:

- Authentication (`/login`, `/signup`)
- Dashboard (`/dashboard`)
- Map (`/map`)
- Upload (`/upload`)
- Vault (`/vault`)
- Settings (`/settings`)

Placeholders:

- Stats (`/stats`)
- Lab (`/lab/:id`)

## Features

- Authenticated app shell with route protection
- Dashboard cards for system health, UX pulse, AI workers, and quick navigation
- Map analysis with:
  - marker clustering
  - heatmap + grid overlays
  - map-bounds capture into API filters
  - confidence + `has_trash` filtering
  - marker detail sidebar + processing logs
  - map viewport persistence in localStorage
- Upload flow with drag-and-drop, multi-file support, cancelable uploads, and progress bars
- Client-side image compression before upload (`browser-image-compression`)
- Live upload/vault status refresh via WebSocket updates
- Vault search, status filter, sort direction, pagination, delete one, and delete all
- i18n with English/Hungarian translations from `public/locales`

## Tech stack

- React 19 + TypeScript
- Vite 7
- React Router 7
- TanStack Query
- React Hook Form + Zod
- i18next + http-backend + language detector
- Tailwind CSS 4
- Axios
- Leaflet + React Leaflet + clustering + heat layer
- Sonner

## Prerequisites

- Node.js 20.19+ (recommended for Vite 7)
- npm

## Getting started

```bash
npm install
npm run dev
```

Default local URL: `http://localhost:5173`

## Environment variables

Create `.env` in project root:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

If omitted, the app falls back to `http://localhost:8000/api`.

## Backend contract

The frontend uses `withCredentials: true` in Axios, so backend CORS must allow credentials.

### Auth

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PUT /auth/me`

### Dashboard

- `GET /dashboard/system-health`
- `GET /dashboard/user-experience`
- `GET /dashboard/ai-workers`

### Map

- `GET /map`
  - Query params used by frontend: `min_lat`, `max_lat`, `min_lng`, `max_lng`, `has_trash`, `min_confidence`
- `GET /map/:id/logs`

### Upload

- `POST /upload/files` (multipart/form-data, field name: `files`, multiple allowed)
- `GET /upload/recents`
- WebSocket endpoint derived from `VITE_API_BASE_URL`:
  - `/upload/ws/updates`
  - Example with local default base URL: `ws://localhost:8000/api/upload/ws/updates`

### Vault

- `GET /vault`
  - Query params used by frontend: `search`, `status`, `order_by`, `direction`, `page`, `page_size`
- `DELETE /vault/:id`
- `DELETE /vault/all`

## Routes

- `/` → redirects to `/dashboard`
- `/login`
- `/signup`
- `/dashboard` (protected)
- `/map` (protected)
- `/upload` (protected)
- `/vault` (protected)
- `/settings` (protected)
- `/stats` (protected placeholder)
- `/lab/:id` (protected placeholder)

## Scripts

- `npm run dev` — start dev server
- `npm run build` — typecheck + production build
- `npm run preview` — preview production build
- `npm run lint` — run ESLint

## Project structure

```
src/
├── api/          # Axios setup (base URL, credentials, 401 redirect)
├── components/   # Feature UI, layout, and shared UI pieces
├── hooks/        # React Query and feature hooks
├── pages/        # Route-level pages
├── schemas/      # Zod schemas
├── services/     # API service wrappers
├── types/        # Shared TypeScript types
└── utils/        # Utility functions
```

## Localization

- Supported languages: `en`, `hu`
- Translation files: `public/locales/{lng}/translations.json`
- Language detection order:
  1. `user.language` from localStorage `user` object
  2. i18next localStorage detector
  3. browser navigator language

## Deployment

`vercel.json` is configured for SPA routing rewrite to `index.html`.
