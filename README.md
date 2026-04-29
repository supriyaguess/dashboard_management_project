# Lead Dashboard

A lead management and reporting tool built with Node.js, MongoDB, and React.

## Stack

- **Backend** – Node.js + Express + Mongoose
- **DB** – MongoDB
- **Frontend** – React + Vite + Tailwind CSS + Recharts
- **Export** – xlsx (Excel + CSV)

---

## Running locally

### Backend

```bash
cd backend
npm install
cp .env.example .env
# update MONGODB_URI in .env if needed
npm run dev
```

Runs on `http://localhost:5000`

### Seed some data

```bash
node backend/seed.js
```

Inserts 60 sample leads so the dashboard isn't empty.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:3000` — the Vite proxy forwards `/api` to port 5000.

---

## API

### Leads
| Method | Endpoint | Notes |
|--------|----------|-------|
| GET | `/api/leads` | supports `page`, `limit`, `search`, `status`, `city`, `service` |
| GET | `/api/leads/:id` | |
| POST | `/api/leads` | |
| PUT | `/api/leads/:id` | |
| DELETE | `/api/leads/:id` | |

### Dashboard
| Method | Endpoint | |
|--------|----------|-|
| GET | `/api/dashboard/stats` | returns all chart data in one shot |

### Reports
| Method | Endpoint | |
|--------|----------|-|
| GET | `/api/reports` | filter by `startDate`, `endDate`, `city`, `status`, `service` |
| GET | `/api/reports/export/xlsx` | same filters, returns .xlsx file |
| GET | `/api/reports/export/csv` | same filters, returns .csv file |

---

## Python analysis script (bonus)

```bash
cd analysis
pip install pymongo pandas matplotlib seaborn
python lead_analysis.py
```

Prints a stats summary to console and saves a chart PNG.

---

## Project structure

```
backend/
  src/
    models/Lead.js
    controllers/
    routes/
    middleware/
  server.js
  seed.js

frontend/
  src/
    pages/         Dashboard, Leads, Reports
    components/    StatCard, LeadForm, Modal, etc.
    api/           axios client

analysis/
  lead_analysis.py
```
