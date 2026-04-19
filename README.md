# SportShield Pro

AI-powered **demo system** that visualizes protection of digital sports media against deepfakes, tampering, and piracy. Includes a **React** dashboard and a **FastAPI** backend with simulated detection (swap in real models later).

## Quick start

### 1. Sample assets (optional but recommended)

```bash
cd sportshield-pro
python scripts/generate_demo_samples.py
```

Creates `frontend/public/samples/demo-*.png` for the **Demo Mode** buttons.

### 2. Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173** — API calls proxy to port **8000**.

### Deploy API on [Render](https://render.com)

The repo includes a **root** [`requirements.txt`](requirements.txt) that pulls in [`backend/requirements.txt`](backend/requirements.txt), so `pip install -r requirements.txt` works from the repository root (Render’s default).

- **`.python-version`** pins **Python 3.12** (avoids bleeding-edge defaults like 3.14 for binary wheels). See [Render: Python version](https://render.com/docs/python-version).
- **[`render.yaml`](render.yaml)** defines the **Start Command** for FastAPI. Render’s Python default is `gunicorn your_application.wsgi`, which **will fail** for this project — do not use that.

**Start command** (must be exactly this for a manual Web Service):

```bash
cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

If you already created the service: **Dashboard → your Web Service → Settings → Start Command** → paste the line above → Save and redeploy.

**Health check path:** `/api/health` (optional in Settings).

**Environment variables** (optional): `GEMINI_API_KEY`, `CORS_ORIGINS` (comma-separated origins allowed to call the API, e.g. your static site URL).

## Features (checklist)

| Feature | Notes |
|--------|--------|
| Deepfake-style detection | Heuristic / demo-case driven; returns REAL/FAKE, confidence, PNG heatmap |
| Drag & drop | Images and video (first frame analyzed) |
| Before/after | Original vs generated fake |
| Trust meter | Animated gauge + score |
| Watermark | Embed + tamper simulation |
| Blockchain | In-memory hash registry + verify |
| Piracy | Duplicate upload warning |
| Camera | Webcam capture → analyze |
| Report | Downloadable `.txt` summary |
| Toasts & motion | Framer Motion alerts |
| **Smart assistant** | Context-aware narrative via **`POST /api/assistant/insight`**; **Google Gemini** when `GEMINI_API_KEY` is set (see `backend/.env.example`) |

## Google Gemini (optional)

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Copy `backend/.env.example` to `backend/.env` and set `GEMINI_API_KEY=...`.
3. Restart the API. The UI shows **Google Gemini** when `/api/config/public` reports `assistant: "gemini"`.

Keys stay **server-side only**; the browser never sees them.

## Tests

```bash
cd backend
python -m pytest tests -v
```

## Docs

- [Demo script](docs/DEMO_SCRIPT.md) — what to say step-by-step  
- [UI layout](docs/UI_LAYOUT.md) — panel map for judges  
- [Challenge alignment](docs/CHALLENGE_ALIGNMENT.md) — rubric mapping (assistant, Google Services, security, testing, accessibility)

## Tech

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide icons  
- **Backend:** FastAPI, Pillow, NumPy, OpenCV (headless), optional **Google Generative AI (Gemini)**  

## Publish to GitHub (public)

1. Commit everything locally (ignores `node_modules/`, `.venv/`, `dist/` — see `.gitignore`):

   ```powershell
   cd sportshield-pro
   .\scripts\publish-github.ps1
   ```

2. If you prefer manual steps: `git init`, `git add -A`, `git commit -m "..."`, then add a **public** empty repo on [github.com/new](https://github.com/new) and `git remote add origin https://github.com/<you>/<repo>.git` + `git push -u origin main`.

3. With [GitHub CLI](https://cli.github.com/) (`gh auth login` once):  
   `gh repo create sportshield-pro --public --source=. --remote=origin --push`

Demo PNGs under `frontend/public/samples/` are included so **Demo Mode** works after clone (regenerate anytime with `scripts/generate_demo_samples.py`).

## Disclaimer

This is a **demonstration**. Detection results are **not** production-grade forensic evidence. Replace `simulate_verdict` and related logic in `backend/app/analysis.py` with your trained models and validation pipelines before operational use.
