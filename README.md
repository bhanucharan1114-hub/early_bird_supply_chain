# Supply Chain Early Bird 🚨

Real-time supply chain disruption risk monitor powered by AI.

---

## Architecture

```
┌─────────────────────┐       ┌────────────────────────────────┐
│  React Frontend     │ /api  │  FastAPI Backend (Python)      │
│  Vite + TailwindCSS │ ────► │  SQLite DB  |  GNews           │
│  Framer Motion      │       │  Open-Meteo |  Yahoo Finance   │
└─────────────────────┘       └────────────────────────────────┘
```

---

## Running Locally

### 1. Start the Backend (FastAPI)

```bash
cd backend
.\venv\Scripts\activate        # Windows
# source venv/bin/activate     # Mac/Linux
uvicorn main:app --reload
```

Backend will be live at: **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**

### 2. Start the Frontend (Vite + React)

Open a **second terminal** in the project root:

```bash
npm run dev
```

Frontend will be live at: **http://localhost:5173**

> The Vite dev server automatically proxies all `/api` requests to the FastAPI
> backend, so no CORS issues and no hardcoded URLs needed.

---

## Environment Variables (`.env`)

| Variable | Description |
|---|---|
| `VITE_NEWS_API_KEY` | NewsAPI key (geopolitical news fallback) |
| `VITE_WEATHER_API_KEY` | OpenWeatherMap key (weather fallback) |
| `VITE_ALPHA_VANTAGE_KEY` | Alpha Vantage key (commodity fallback) |
| `VITE_GROQ_API_KEY` | Groq API key (AI executive summaries) |
| `VITE_TAVILY_API_KEY` | Tavily key (search enrichment fallback) |
| `VITE_BACKEND_URL` | **Production only** — URL of deployed backend |

> In development, `VITE_BACKEND_URL` is not needed because Vite proxies `/api`.

---

## Signal Data Flow

1. User selects a company + product on the frontend
2. Frontend calls `fetchAllSignals(company, product)`
3. That function **first** tries `POST /api/signals` on the Python backend:
   - Backend calls **GNews** (geopolitical news)
   - Backend calls **Open-Meteo** (live weather, free, no key needed)
   - Backend calls **Yahoo Finance** via `yfinance` (commodity prices)
4. If the backend is unreachable, frontend falls back to direct API calls
5. Risk Engine (`risk-engine.js`) calculates weighted score (0-100)
6. Groq AI generates an executive summary
7. Results are displayed in the Risk Dashboard

---

## Deploying to Production

### Backend (e.g. Railway / Render / Fly.io)

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Set `VITE_BACKEND_URL=https://your-backend.railway.app` in the frontend's
environment settings on your hosting platform.

### Frontend (e.g. Vercel / Netlify)

```bash
npm run build
# Deploy the `dist/` folder
```

Set all `VITE_*` environment variables in your hosting dashboard.

---

## Project Structure

```
├── backend/
│   ├── main.py               # FastAPI app + all API routes
│   ├── database.py           # SQLAlchemy engine + session
│   ├── models.py             # DB models (SavedAnalysis, CustomCompany)
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── requirements.txt      # Python dependencies
│   └── services/
│       ├── news_service.py       # GNews geopolitical risk
│       ├── weather_service.py    # Open-Meteo weather risk
│       └── commodity_service.py  # Yahoo Finance commodity stress
├── src/
│   ├── dashboard.jsx             # Root app component + routing logic
│   ├── risk-engine.js            # Weighted risk score calculator
│   ├── contexts/
│   │   └── AuthContext.jsx       # Auth (localStorage mock)
│   ├── services/
│   │   ├── api.js                # Backend API calls (CRUD + signals)
│   │   ├── signal-fetchers.js    # Backend-first signal fetching
│   │   ├── ai-explanation.js     # Groq AI summaries
│   │   └── analytics.js          # Event tracking
│   └── components/
│       ├── RiskDashboard.jsx     # Main risk view
│       ├── CompanySelector.jsx   # Company picker
│       ├── ProductSelector.jsx   # Product picker
│       ├── SavedAnalysesView.jsx # Saved analysis history
│       ├── CustomAnalysisForm.jsx# Custom company builder
│       ├── LoginScreen.jsx       # Auth screen
│       ├── Header.jsx            # Top nav
│       └── LoadingScreen.jsx     # Analysis loading screen
└── vite.config.js                # Vite + proxy config
```
