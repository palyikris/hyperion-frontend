# Hyperion Frontend

A high-performance, AI-driven geospatial monitoring and analytics dashboard built with **React**, **TypeScript**, and **Tailwind CSS**. Hyperion provides a sophisticated interface for visualizing environmental data, managing AI-driven object detection workflows, and monitoring system health in real-time.

## 🚀 Key Features

### 🗺️ Advanced Geospatial Visualization
- **Interactive Map Engine**: Built with **React-Leaflet**, supporting high-density data visualization through multiple view modes.
- **Dynamic View Modes**: Toggle between individual markers, clustered grids, and intensity-based heatmaps to analyze data distribution.
- **Real-time Search & Filtering**: Integrated address/city search and advanced filters for trash detection presence, confidence levels, and date ranges.
- **User Location Support**: Permission-based geolocation to center the map on the user's current position.

### 🔬 AI Validation Lab (Human-in-the-Loop)
- **High-Precision Review**: A dedicated environment for human operators to validate AI-generated detections.
- **Zoom & Pan Interaction**: Custom-built zoomable image container for detailed inspection of high-resolution media.
- **Detection Management**: Add, remove, or modify bounding boxes and labels with automatic synchronization to the backend.
- **Geospatial Correction**: Integrated Mini-Map for manual coordinate adjustments and reverse geocoding verification.

### 📊 Comprehensive Analytics Dashboard
- **KPI Visualization**: Real-time charts powered by **Recharts**, including trash composition (Pie charts), environmental footprint (Area charts), and temporal trends.
- **AI Fleet Metrics**: Detailed performance analysis of the AI worker fleet, measuring processing efficiency and success rates.
- **Personalized Insights**: "Fun Fact" boxes providing bilingual, data-driven highlights of environmental impact.
- **Export Capabilities**: Generate and download localized PDF reports and Excel cleanup manifests directly from the UI.

### ☁️ Intelligent Media Management
- **Batch Upload**: Multi-file drag-and-drop interface with automatic dimension and metadata extraction.
- **Real-time Feedback**: **WebSocket-driven** status updates (PENDING → PROCESSING → READY) with live progress tracking for every media item.
- **Personal Vault**: A robust media library with server-side pagination, advanced sorting, and bulk deletion capabilities.

### 🖥️ System Health & Monitoring
- **Fleet Overview**: Live monitoring of the 10 AI workers, displaying current tasks and daily processing loads.
- **Hardware Telemetry**: Visualized CPU and Memory metrics with 7-day historical load analysis.
- **UX Metrics**: Active user session tracking and response time analysis for platform performance auditing.

## 🛠️ Technical Stack

- **Framework**: [React 18](https://reactjs.org/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Framer Motion](https://www.framer.com/motion/) (Fluid animations)
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/) + [TanStack Query v5](https://tanstack.com/query/latest)
- **Maps**: [Leaflet](https://leafletjs.com/) + [React-Leaflet](https://react-leaflet.js.org/)
- **Charts**: [Recharts](https://recharts.org/)
- **Localization**: [i18next](https://www.i18next.com/) (Full EN/HU support)
- **Icons**: [Lucide React](https://lucide.dev/)

## 🏗️ Architecture Highlights

- **Custom Hooks Logic**: Business logic is decoupled from UI components using specialized hooks (e.g., `useMapPageState`, `useUploadSocket`).
- **Web Workers**: Offloads intensive geospatial calculations (like grid bucketing) to background threads for stutter-free performance.
- **Atmospheric UI**: Implements a unique "Page Atmosphere" system with dynamic SVG blobs and glassmorphism effects.
- **Bilingual Core**: Fully internationalized architecture supporting seamless language switching across all dashboards and reports.

## 🚦 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install

Default local URL: `http://localhost:5173`

## Environment variables

Create `.env` in project root:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
CARTO_API_KEY=your_carto_key_here
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

### Stats

- `GET /stats/summary`
  - Query params used by frontend: `days`
- `GET /stats/environmental-footprint`
- `GET /stats/trash-composition`
- `GET /stats/ai-fleet-efficiency`
- `GET /stats/mean-time-to-process`
- `GET /stats/hotspot-density`
- `GET /stats/temporal-trends`
  - Query params used by frontend: `days`
- `GET /stats/fun-facts`
  - Query params used by frontend: `lang`, `limit`
- `GET /stats/reports/manifest` (binary export)
  - Query params used by frontend: `days`, `language`
- `GET /stats/reports/pdf` (binary export)
  - Query params used by frontend: `days`, `language`

## Routes

- `/` → redirects to `/dashboard`
- `/login`
- `/signup`
- `/dashboard` (protected)
- `/map` (protected)
- `/upload` (protected)
- `/vault` (protected)
- `/settings` (protected)
- `/stats` (protected)
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
