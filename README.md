# Lead Dashboard & Reporting System

A full-stack lead management tool built for tracking, filtering, and reporting on sales leads. You can add leads, update their status, filter by city or service, and export reports as Excel or CSV — all from a clean dashboard.

**Live:** https://dashboard-management-project-frontend.onrender.com/dashboard

---

## What it does

The dashboard gives you a live overview of your leads — total count, conversion rate, budget breakdown, and status distribution through charts. The Leads page lets you search, filter, paginate, add new leads, edit existing ones, or delete them. The Reports page is for date-range filtering and exporting data.

Everything is wired to a real MongoDB database hosted on Atlas, so data persists across sessions and devices.

---

## Tech used

**Backend** — Node.js + Express + Mongoose. REST API with five endpoints for leads, one for dashboard stats, and three for reports/exports.

**Frontend** — React 18 + Vite + Tailwind CSS. Charts via Recharts. Routing via React Router v6.

**Database** — MongoDB Atlas (cloud-hosted).

**Deployment** — Backend on Render (Web Service), Frontend on Render (Static Site).

**Export** — Reports can be downloaded as `.xlsx` or `.csv` using the SheetJS library.

---

## Security

- **CORS locked to the frontend domain** — the backend only accepts requests from the deployed frontend URL (configured via `ALLOWED_ORIGIN` env variable). No random origins can hit the API.
- **HTTP security headers** — Helmet.js is applied on every response, which sets `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, and others automatically.
- **Rate limiting** — API requests are capped at 200 per 15-minute window per IP. This prevents brute force and basic DoS attempts.
- **Body size limit** — JSON and URL-encoded bodies are capped at 10kb. Oversized payloads are rejected before they reach any controller.
- **Mass assignment protection** — The update endpoint only allows whitelisted fields (`name`, `mobile`, `email`, `city`, `service`, `budget`, `status`, `notes`). Any other keys in the request body are silently ignored.
- **Pagination cap** — Query `limit` is hard-capped at 100. No single request can dump the entire database.
- **Schema-level validation** — Mongoose enforces required fields, enum values for `status`, and a minimum of 0 for `budget`. Bad data is rejected at the model layer.
- **Environment variables** — No credentials in the codebase. MongoDB URI, allowed origin, and Node environment are all loaded from `.env` (excluded from git).
- **Error message sanitization** — In production, unexpected 500 errors return a generic message instead of exposing internal error details or stack traces.

**Known limitation:** The `xlsx` (SheetJS) package has an unpatched prototype pollution vulnerability. There is no available fix for the current version. For a production system handling untrusted file uploads, consider migrating to `exceljs`. In this project, SheetJS is only used for generating exports (write-only), so the attack surface is minimal.

---

## Running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — set your MONGODB_URI and ALLOWED_ORIGIN
npm run dev
```

Runs on `http://localhost:5000`

### Seed sample data

```bash
node backend/seed.js
```

Inserts 60 sample leads. Run this once after setting up the database.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000`. The Vite dev server proxies `/api` to port 5000, so you don't need to configure anything extra locally.

---

## API reference

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads` | List leads. Supports `page`, `limit` (max 100), `search`, `status`, `city`, `service` |
| GET | `/api/leads/:id` | Get a single lead by ID |
| POST | `/api/leads` | Create a new lead |
| PUT | `/api/leads/:id` | Update a lead (only whitelisted fields accepted) |
| DELETE | `/api/leads/:id` | Delete a lead |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Returns all stats and chart data in one response |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports` | Filtered leads. Supports `startDate`, `endDate`, `city`, `status`, `service` |
| GET | `/api/reports/export/xlsx` | Same filters, downloads as `.xlsx` |
| GET | `/api/reports/export/csv` | Same filters, downloads as `.csv` |

### Health check
```
GET /api/health  →  { "status": "ok", "timestamp": "..." }
```

---

## Deployment (Render)

### Backend — Web Service
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Environment variables:
  ```
  MONGODB_URI     = your Atlas connection string
  NODE_ENV        = production
  ALLOWED_ORIGIN  = https://your-frontend.onrender.com
  ```

### Frontend — Static Site
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment variables:
  ```
  VITE_API_URL = https://your-backend.onrender.com
  ```
- Add a Rewrite rule: `/*` → `/index.html` (Action: Rewrite) — required for React Router to work on page refresh.

---

## Project structure

```
backend/
  src/
    models/Lead.js
    controllers/     leadController, dashboardController, reportController
    routes/          leads, dashboard, reports
    middleware/      errorHandler
  server.js
  seed.js

frontend/
  src/
    pages/           Dashboard, Leads, Reports
    components/      StatCard, LeadForm, Modal, etc.
    api/             axios client (reads VITE_API_URL for production)

analysis/
  lead_analysis.py  — standalone Python script for offline analysis
```

---

## Python analysis (bonus)

A standalone script that connects to MongoDB, runs aggregate stats, and saves a chart PNG.

```bash
cd analysis
pip install pymongo pandas matplotlib seaborn
python lead_analysis.py
```
