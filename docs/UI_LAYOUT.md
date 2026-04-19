# SportShield Pro — UI layout (demo)

## Grid

- **Desktop (≥1024px):** 12-column grid — main workspace **7 cols**, sticky side rail **5 cols**.
- **Mobile:** Single column; trust meter follows upload card.

## Regions

### Header (sticky)

- **Left:** Logo tile + wordmark “SportShield Pro” + subtitle.
- **Right:** “Real-time demo visualization” badge with pulse icon.

### Primary column

1. **Upload & analyze card**
   - Title row + **Demo Mode** trio: `Demo: Real` | `Demo: Deepfake` | `Demo: Edited`.
   - Large **drag-and-drop** target (full-file input overlay).
   - Action row: `Run detection` (primary) · `Auto report` · `Generate Fake (demo)` (destructive accent).

2. **Results card** (after run)
   - Left stack: `REAL` or `FAKE` (large), confidence %, truncated SHA-256.
   - Right: **Heatmap** preview (16:9 container, label “Tamper heatmap”).

3. **Before vs After**
   - Two equal panels, labels “Original” / “Tampered / deepfake”.
   - Original supports image or inline video preview.

4. **Watermark demo**
   - Three tiles: Original still · Watermarked · After simulated tamper.
   - Buttons: `Embed Watermark` · `Simulate tampering`.

5. **Blockchain (simulated)**
   - Buttons: `Register media` · `Verify same file` · `Verify edited / wrong file`.
   - Scrollable monospace **event log**.

6. **Bottom split**
   - **Live camera verify:** `<video>` preview + `Start webcam` / `Capture & scan` / `Stop`.
   - **Piracy simulation:** Short copy + `Reset piracy session`.

### Side column (sticky)

- **Live Trust Score:** SVG speedometer + numeric `xx/100` + contextual pill (“Verified Authentic” / “Integrity at risk”).
- **Narrative paragraph** explaining the demo’s purpose for sports media.

## Overlays

- **Toast stack (top center):** animated alerts — Fake Detected 🚨, Verified Authentic ✅, Piracy, Chain message.
- **Loading:** Primary actions show spinner via `Loader2` when `loading` is true.

## Visual system

- **Background:** Dark emerald/slate gradient with subtle radial highlight.
- **Surfaces:** `glass` — frosted panel, white/10 border, rounded 2xl.
- **Accents:** Emerald (trust), Rose (threat), Violet (chain), Sky (watermark), Pink (camera).

## Responsive notes

- Trust meter remains readable down to ~320px width (gauge scales with container).
- Action buttons wrap; demo chips stay on one row where possible.
