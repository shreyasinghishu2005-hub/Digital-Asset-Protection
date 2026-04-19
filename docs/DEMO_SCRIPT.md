# SportShield Pro — Live demo script

Use this narrative for judges or stakeholders. Approximate timing: **4–6 minutes** with interaction.

## Opening (30s)

1. **Introduce the problem:** “Sports rights are under pressure from synthetic media, in-stadium edits, and clip piracy. SportShield Pro is a demo console that shows how AI-assisted forensics and registration can protect digital sports media—in real time.”
2. **Point to the header:** “Everything here is wired to a live API so we can upload, scan, and visualize trust in seconds.”

## Trust meter & instant scan (45s)

1. Click **Demo: Real** — say: “We preload a rights-cleared style asset. The verdict, confidence, and trust score update together.”
2. Gesture to the **Live Trust Score** gauge: “This is the storytelling layer—like a broadcast graphic—so non-technical stakeholders see integrity at a glance.”
3. Click **Demo: Deepfake** — “Now the same pipeline flags synthetic risk, boosts the heatmap, and triggers the fake alert toast.”

## Heatmap proof (30s)

1. After any run, point at the **Tamper heatmap** panel: “Red overlay highlights regions our demo model treats as suspicious—this is the visual proof broadcast ops can attach to takedowns or internal review.”

## Before / after & one-click fake (60s)

1. Upload any still or use **Demo: Edited**.
2. Click **Generate Fake (demo)** — “For the pitch only, we apply a crude manipulation—blur, channel stress, and a fake badge—then the detector runs automatically on the forged output.”
3. Split screen: “Left is original, right is tampered. This is the side-by-side clip comparison rights teams want in a crisis room.”

## Watermark survival (45s)

1. On a **still image**, click **Embed Watermark** — “We burn in a visible forensic pattern.”
2. Click **Simulate tampering** — “We vandalize pixels. The pipeline re-analyzes and we surface that integrity dropped—while still narrating watermark resilience in the toast.”

## Blockchain simulation (45s)

1. Click **Register media** — read the **Media Registered Successfully** line in the log with the fake transaction id and timestamp.
2. Click **Verify same file** — “Hash matches → Verified Original.”
3. Click **Verify edited / wrong file** — “Different bytes → Mismatch Detected. No chain deployment required; this is a UX stand-in for anchoring content ids.”

## Piracy duplicate (30s)

1. Explain: “We fingerprint uploads in-session.”
2. Upload the **same file twice** — second time triggers **Possible Piracy Detected**.
3. Optional: **Reset piracy session** to clear the demo.

## Camera verification (30s)

1. **Start webcam**, hold a phone with a sports image, click **Capture & scan** — “Field crews can snapshot a screen or printed still and get an instant read—great for venue checks.”

## Auto report (20s)

1. Click **Auto report** — “Downstream compliance gets a plaintext artifact with verdict, trust score, and hash—exportable in seconds.”

## Close (20s)

1. Summarize: “SportShield Pro bundles **detection + visualization + registration + piracy cues** into one demo-first experience. Production would swap the heuristic core for your trained models and connect the ledger to your CMS or rights database.”

---

**Fallback line if the API is down:** “The UI is designed for live analysis; we’d restart the FastAPI service on port 8000 and refresh.”
