# Hyperion Frontend

Hyperion is a brand-forward React app for an environmental monitoring platform, providing operator login, onboarding, and a protected shell for core tools (dashboard, map, lab, upload, and vault) as they come online.

## What is here now

- Authentication UX: login and signup forms with validation and toasts
- Protected app shell with a collapsible side nav
- Settings page for profile name + language
- Internationalization (English and Hungarian)

## Planned app areas (placeholders wired)

- Dashboard
- Map
- Lab
- Upload
- Vault

## Tech stack

- React 19 + TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- i18next
- Tailwind CSS
- Axios

## Getting started

Prerequisites: Node.js 18+ and npm

```bash
npm install
npm run dev
```

Open the app at the URL printed in the terminal (usually http://localhost:5173).

## Environment variables

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

The frontend expects the backend to expose the following endpoints:

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PUT /auth/me`

Requests are sent with `withCredentials: true`, so configure CORS on the backend accordingly.

## App routes

- `/login`
- `/signup`
- `/dashboard` (protected)
- `/map` (protected)
- `/lab/:id` (protected)
- `/upload` (protected)
- `/vault` (protected)
- `/settings` (protected)

## Scripts

- `npm run dev` - start the dev server
- `npm run build` - typecheck and build
- `npm run preview` - preview the production build
- `npm run lint` - run ESLint

## Localization

Translations live under `public/locales` and are loaded at runtime. Supported languages:

- English (`en`)
- Hungarian (`hu`)

The app also stores the user language in `localStorage` and applies it on login or profile update.
