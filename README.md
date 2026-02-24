# Hyperion Frontend

Hyperion is a brand-forward React app for an environmental monitoring platform, providing operator login, onboarding, and a protected shell for core tools (dashboard, map, lab, upload, and vault) as they come online.

## What is here now

- **Authentication system**: login and signup forms with validation and toast notifications
- **Dashboard page** (fully implemented):
  - System Health Snapshot: uptime gauge, server load chart, environment status
  - User Experience Pulse: active users, response times, 7-day activity trends
  - AI Worker Status: fleet metrics, cluster status, individual node monitoring
  - Navigator: quick-access tiles to all app sections
- **Upload page** (fully implemented):
  - Drag-and-drop file upload with multi-file support
  - Real-time upload status updates via WebSocket
  - Recent gallery view with processing status badges
  - Card metadata display (filename, size, dimensions, GPS coordinates)
  - Image zoom functionality
  - Delete uploaded files
- **Vault page** (fully implemented):
  - Complete media file management system
  - Search functionality across filenames
  - Status filtering (PENDING, UPLOADED, EXTRACTING, PROCESSING, READY, FAILED)
  - Sorting by various fields (created_at, size, etc.) with ascending/descending order
  - Pagination controls with adjustable page size
  - Gallery view with detailed card metadata
  - Delete functionality for vault items
  - Empty state handling
- **Settings page**: update profile name and application language
- **Protected routing**: authentication-guarded routes with automatic redirect
- **Internationalization**: full i18n support (English and Hungarian)
- **Custom design system**: organic Hyperion brand colors and blob shapes throughout

## Planned app areas (placeholders wired)

- Statistics
- Map
- Lab

## Tech stack

- React 19 + TypeScript
- Vite
- React Router 7
- TanStack Query (React Query)
- React Hook Form + Zod
- i18next (with http backend and language detector)
- Tailwind CSS 4
- Axios
- Sonner (toast notifications)
- Lucide React (icons)

## Project structure

```
src/
├── api/              # Axios instance with auth interceptors
├── components/
│   ├── features/     # Feature-specific components (auth, dashboard, settings)
│   ├── layout/       # MainLayout, SideNav, navigation links
│   └── shared/       # Reusable UI components
├── hooks/            # Custom React hooks (auth, dashboard)
├── pages/            # Route components
├── schemas/          # Zod validation schemas
├── services/         # API service layers
└── types/            # TypeScript type definitions
```

## Getting started

Prerequisites: Node.js 18+ and npm

```bash
npm install
npm run dev
```

Open the app at the URL printed in the terminal (usually http://localhost:5173).

The app defaults to `http://localhost:8000/api` as the backend base URL. To override, create a `.env` file (see below).

## Environment variables

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

The frontend expects the backend to expose the following endpoints:

**Authentication:**
- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PUT /auth/me`

**Dashboard:**
- `GET /dashboard/system-health`
  - Returns: `{ status, environment, uptime, server_load[], last_updated }`
- `GET /dashboard/user-experience`
  - Returns: `{ active_now, active_trend[], avg_response_time, daily_activity[], last_updated }`
- `GET /dashboard/ai-workers`
  - Returns: `{ total_active_fleet, cluster_status, nodes[], queue_depth, last_updated }`

**Upload:**
- `POST /upload/files` - Upload one or multiple files (multipart/form-data)
- `GET /upload/recents` - Fetch recently uploaded items
  - Returns: `{ items[], total }`
- WebSocket connection at `ws://[backend]/ws/upload` for real-time status updates

**Vault:**
- `GET /vault` - Fetch vault items with filtering, sorting, and pagination
  - Query params: `search`, `status`, `order_by`, `direction`, `limit`, `offset`
  - Returns: `{ items[], total }`
- `DELETE /vault/:id` - Delete a specific vault item
) - fully implemented with file upload and gallery
- `/vault` (protected) - fully implemented with file management and filteringials: true`, so configure CORS on the backend accordingly.

## App routes

- `/` - redirects to `/dashboard`
- `/login`
- `/signup`
- `/dashboard` (protected) - fully implemented with system metrics
- `/stats` (protected, placeholder)
- `/map` (protected, placeholder)
- `/lab/:id` (protected, placeholder)
- `/upload` (protected, placeholder)
- `/vault` (protected, placeholder)
- `/settings` (protected)

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - typecheck and build
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint

## Deployment

The app includes a `vercel.json` configuration for SPA routing support on Vercel. All routes are rewritten to `/index.html` to enable client-side routing.

## Localization

Translations live under `public/locales` and are loaded at runtime. Supported languages:

- English (`en`)
- Hungarian (`hu`)

The app stores the user's language preference in `localStorage` and applies it on login or profile update.

## Design system

The app uses a custom **Hyperion** color palette with environmental monitoring themes:

- **Primary colors**: Deep Sea (`#1A5F54`), Forest (`#2D4A3E`)
- **Secondary colors**: Sage Mint, Cool Aqua, Soft Sky
- **Accent colors**: Muted Gold, Burnt Orange
- **Neutral colors**: Cream, Fog Grey, Slate Grey

Design features organic blob shapes, custom scrollbars, and smooth hover transitions throughout the UI.
