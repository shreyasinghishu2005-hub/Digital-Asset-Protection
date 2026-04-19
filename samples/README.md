# Demo sample media

PNG placeholders are **generated** into `../frontend/public/samples/` by:

```bash
python scripts/generate_demo_samples.py
```

| File | Role in demo |
|------|----------------|
| `demo-real.png` | Pre-tagged **REAL** path (Demo: Real button) |
| `demo-fake.png` | Pre-tagged **FAKE** path (Demo: Deepfake button) |
| `demo-edited.png` | Pre-tagged **edited/tamper** path (Demo: Edited button) |

You can replace these files with your own sports stills **keeping the same filenames** so the demo buttons keep working, or upload arbitrary images/videos from the main drop zone.

For **video** samples, add files under `frontend/public/samples/` (for example `demo-clip.mp4`) and extend the UI to load them, or use the drag-and-drop area — the API analyzes the **first frame** of video clips.
