"""Demo-oriented media analysis: heatmaps, fake generation, watermarking."""

from __future__ import annotations

import hashlib
import io
import random
from typing import Literal, Optional, Tuple

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont


def _cv2():
    """Lazy import so API can boot if OpenCV fails on minimal Linux images."""
    import cv2

    return cv2


def file_hash(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def _seed_from_hash(h: str) -> int:
    return int(h[:8], 16)


def simulate_verdict(
    data: bytes,
    demo_case: Optional[Literal["real", "fake", "edited"]] = None,
) -> Tuple[str, float]:
    """Return (REAL|FAKE, confidence 0-100)."""
    h = file_hash(data)
    rng = random.Random(_seed_from_hash(h))
    if demo_case == "real":
        return "REAL", round(88 + rng.random() * 10, 1)
    if demo_case == "fake":
        return "FAKE", round(82 + rng.random() * 15, 1)
    if demo_case == "edited":
        return "FAKE", round(70 + rng.random() * 20, 1)
    # Default: deterministic pseudo-verdict from hash
    score = (int(h[8:16], 16) % 10000) / 100.0
    label = "FAKE" if score < 42 else "REAL"
    conf = round(60 + (score % 38), 1)
    return label, conf


def build_heatmap_overlay(image: Image.Image, data_hash: str, fake_bias: bool) -> Image.Image:
    """Red semi-transparent heatmap on suspicious regions (demo)."""
    rng = random.Random(_seed_from_hash(data_hash))
    w, h = image.size
    arr = np.array(image.convert("RGB"))
    heat = np.zeros((h, w), dtype=np.float32)
    n_blobs = 4 if fake_bias else 2
    for _ in range(n_blobs):
        cx = rng.randint(w // 6, 5 * w // 6)
        cy = rng.randint(h // 6, 5 * h // 6)
        rx = rng.randint(w // 10, w // 4)
        ry = rng.randint(h // 10, h // 4)
        y, x = np.ogrid[:h, :w]
        mask = ((x - cx) ** 2 / (rx**2 + 1) + (y - cy) ** 2 / (ry**2 + 1)) <= 1
        heat[mask] += rng.uniform(0.4, 1.0)
    heat = np.clip(heat / (heat.max() + 1e-6), 0, 1)
    if fake_bias:
        heat = np.clip(heat * 1.35, 0, 1)
    red = np.zeros_like(arr)
    red[:, :, 0] = 255
    alpha = (heat * 0.55 * 255).astype(np.uint8)[..., None]
    blended = (arr.astype(np.float32) * (1 - heat[..., None] * 0.55) + red.astype(np.float32) * heat[..., None] * 0.45)
    out = np.clip(blended, 0, 255).astype(np.uint8)
    return Image.fromarray(out)


def load_image_from_bytes(data: bytes) -> Image.Image:
    return Image.open(io.BytesIO(data)).convert("RGB")


def first_frame_from_video(data: bytes) -> Image.Image:
    import os
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as f:
        f.write(data)
        path = f.name
    try:
        cv2 = _cv2()
        cap = cv2.VideoCapture(path)
        ok, frame = cap.read()
        cap.release()
        if not ok or frame is None:
            raise ValueError("Could not read video frame")
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        return Image.fromarray(frame)
    finally:
        try:
            os.unlink(path)
        except OSError:
            pass


def embed_watermark(image: Image.Image, text: str = "SportShield") -> Image.Image:
    img = image.copy()
    draw = ImageDraw.Draw(img, "RGBA")
    try:
        font = ImageFont.truetype("arial.ttf", max(14, min(img.size) // 28))
    except OSError:
        font = ImageFont.load_default()
    w, h = img.size
    txt = f"© {text}"
    bbox = draw.textbbox((0, 0), txt, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x, y = w - tw - 16, h - th - 16
    pad = 6
    draw.rectangle([x - pad, y - pad, x + tw + pad, y + th + pad], fill=(0, 0, 0, 120))
    draw.text((x, y), txt, fill=(255, 255, 255, 220), font=font)
    pattern = Image.new("RGBA", img.size, (0, 0, 0, 0))
    pd = ImageDraw.Draw(pattern)
    step = max(80, min(w, h) // 5)
    for i in range(-h, w + h, step):
        pd.line([(i, 0), (i + h, h)], fill=(255, 60, 60, 25), width=2)
    img = Image.alpha_composite(img.convert("RGBA"), pattern).convert("RGB")
    return img


def apply_fake_edit(image: Image.Image) -> Image.Image:
    """Demo-only: blur face region + color shift + subtle logo patch."""
    arr = np.array(image)
    h, w = arr.shape[:2]
    y0, y1 = h // 5, 2 * h // 5
    x0, x1 = w // 3, 2 * w // 3
    face = arr[y0:y1, x0:x1]
    try:
        cv2 = _cv2()
        face_blur = cv2.GaussianBlur(face, (25, 25), 0)
    except Exception:
        crop = Image.fromarray(face).filter(ImageFilter.GaussianBlur(radius=10))
        face_blur = np.array(crop)
    arr[y0:y1, x0:x1] = face_blur
    # channel swap for "deepfake" look
    arr = arr[:, :, [2, 1, 0]]
    pil = Image.fromarray(arr)
    draw = ImageDraw.Draw(pil)
    try:
        font = ImageFont.truetype("arial.ttf", max(12, min(w, h) // 20))
    except OSError:
        font = ImageFont.load_default()
    draw.rectangle([w // 2 - 40, h - 50, w // 2 + 80, h - 10], outline=(255, 80, 80), width=3)
    draw.text((w // 2 - 35, h - 45), "FAKE", fill=(255, 80, 80), font=font)
    return pil


def image_to_png_bytes(img: Image.Image) -> bytes:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()


def trust_score(label: str, confidence: float) -> int:
    if label == "REAL":
        return int(min(100, max(0, round(confidence * 0.95 + 5))))
    return int(max(0, min(100, round(100 - confidence * 0.85))))
