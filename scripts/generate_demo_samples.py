"""Generate placeholder sports-style demo images for SportShield Pro."""

from __future__ import annotations

import os

from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "frontend", "public", "samples")


def _pitch_gradient(w: int, h: int, stripe: bool) -> Image.Image:
    img = Image.new("RGB", (w, h))
    px = img.load()
    for y in range(h):
        for x in range(w):
            g = int(20 + (y / h) * 60)
            if stripe and (x // 40 + y // 40) % 2 == 0:
                g += 15
            px[x, y] = (g // 3, g, g // 2)
    return img


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    w, h = 960, 540

    real_img = _pitch_gradient(w, h, stripe=True)
    d = ImageDraw.Draw(real_img)
    d.rounded_rectangle([80, 80, w - 80, h - 80], outline=(220, 240, 200), width=6)
    d.text((120, 100), "LIVE BROADCAST — OFFICIAL FEED", fill=(255, 255, 255))
    d.text((120, h - 120), "SportShield: REAL sports clip (demo asset)", fill=(180, 255, 200))
    real_img.save(os.path.join(OUT, "demo-real.png"), "PNG")

    fake_img = _pitch_gradient(w, h, stripe=False)
    d2 = ImageDraw.Draw(fake_img)
    d2.rectangle([w // 2 - 120, h // 2 - 80, w // 2 + 120, h // 2 + 80], outline=(255, 80, 120), width=5)
    d2.text((w // 2 - 100, h // 2 - 20), "FACE REGION ANOMALY", fill=(255, 120, 140))
    d2.text((80, 80), "UNOFFICIAL / SYNTHETIC (demo)", fill=(255, 200, 200))
    fake_img.save(os.path.join(OUT, "demo-fake.png"), "PNG")

    ed = _pitch_gradient(w, h, True)
    d3 = ImageDraw.Draw(ed)
    d3.ellipse([w // 3, h // 4, 2 * w // 3, 3 * h // 4], outline=(255, 180, 60), width=8)
    d3.text((100, 100), "SCOREBOARD EDIT / LOGO SWAP (demo)", fill=(255, 220, 160))
    ed.save(os.path.join(OUT, "demo-edited.png"), "PNG")

    print("Wrote:", OUT)
    print("  demo-real.png, demo-fake.png, demo-edited.png")


if __name__ == "__main__":
    main()
