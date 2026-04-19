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

## Docs

- [Demo script](docs/DEMO_SCRIPT.md) — what to say step-by-step  
- [UI layout](docs/UI_LAYOUT.md) — panel map for judges  

## Tech

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide icons  
- **Backend:** FastAPI, Pillow, NumPy, OpenCV (headless) for demo manipulations  

## Publish to GitHub (digital asset protection)

The repo is git-ready on `main`. To upload:

1. On GitHub, create a **new empty repository** (no README/license), e.g. **`digital-asset-protection`** or **`sportshield-pro`**.
2. In the project folder, set your identity if needed, add the remote, and push:

```powershell
cd f:\open\sportshield-pro
git config user.name "Your Name"
git config user.email "your-email@example.com"
git remote add origin https://github.com/YOUR_USERNAME/digital-asset-protection.git
git push -u origin main
```

Use SSH if you prefer: `git@github.com:YOUR_USERNAME/digital-asset-protection.git`.

**Suggested topics** on the repo: `digital-asset-protection`, `deepfake-detection`, `media-forensics`, `fastapi`, `react`, `sports-media`.

## Disclaimer

This is a **demonstration**. Detection results are **not** production-grade forensic evidence. Replace `simulate_verdict` and related logic in `backend/app/analysis.py` with your trained models and validation pipelines before operational use.
