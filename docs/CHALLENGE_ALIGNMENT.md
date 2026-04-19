# Challenge expectations — how SportShield Pro maps

This document maps the project to typical hackathon / “smart assistant + Google Services” evaluation rubrics.

## Smart, dynamic assistant

| Expectation | Implementation |
|-------------|------------------|
| Context-aware responses | **`POST /api/assistant/insight`** accepts verdict, confidence, trust score, filename, optional piracy flag, and optional user follow-up. |
| Google-backed when configured | **Google Gemini** (`gemini-1.5-flash`) generates narratives when `GEMINI_API_KEY` is set server-side; otherwise a **deterministic template** keeps demos runnable offline. |
| UI | **`AssistantPanel`** loads insight after each analysis; users can **ask follow-up questions** with the same context payload. |

## Logical decision making

- Piracy duplicate, verdict (REAL/FAKE), and trust score are passed into the assistant payload so explanations **change with session state**, not a single static string.
- Detection pipeline remains explicit: decode → heuristic verdict → heatmap (demo) → optional Gemini explanation.

## Google Services (meaningful use)

- **Gemini API** (via `google-generativeai`) for natural-language **operational summaries** aligned to sports broadcast / rights personas.
- **No API keys in the browser**: keys live only in server environment variables; the UI sees only `/api/config/public` → `{ assistant: "gemini" \| "fallback" }`.

## Practical usability

- Drag-and-drop, demo presets, camera capture, reports, blockchain/piracy demos unchanged; assistant adds a **readable narrative layer** for non-technical stakeholders.

## Code quality & maintainability

- Backend split: **`config`**, **`gemini_assistant`**, **`analysis`**, **`store`**, **`main`** routes.
- Request validation via **Pydantic** on assistant payloads.

## Security

| Topic | Approach |
|-------|----------|
| Secrets | `GEMINI_API_KEY` server-only; `.env` gitignored; see **`backend/.env.example`**. |
| CORS | **`CORS_ORIGINS`** env (comma-separated); defaults to local Vite URLs instead of `*`. |
| Upload size | **`MAX_UPLOAD_BYTES`** (default 25 MiB) enforced on multipart bodies. |
| Prompt injection | User question length capped (2000 chars); assistant prompt frames model as demo/ops tool. |

## Efficiency

- Gemini calls run in a **thread pool** (`run_in_threadpool`) so the async event loop stays responsive.
- Fallback path avoids external calls when no key or API errors.

## Testing

- **`backend/tests/test_api.py`**: health, public config, assistant insight (fallback), validation errors.
- Run: `cd backend && python -m pytest tests -v` (with venv activated).

## Accessibility

- **Skip link** to `#main-content` (see `index.css` `.skip-to-main`).
- **Labeled file input** (`aria-label` on upload control).
- **Live regions**: toasts and assistant output use **`role="status"`** / **`aria-live="polite"`** where appropriate.
- Focus styles on follow-up input via Tailwind `focus:ring`.

## Gaps / honest notes

- Core “deepfake” signal is still **demo/heuristic**; production would swap **`simulate_verdict`** for a trained model and add audit logging.
- Further a11y work: full keyboard path through every control, contrast audit, reduced-motion preferences.
- Optional: OAuth (e.g. Google Sign-In) for named audit trails — not required for this vertical demo.
