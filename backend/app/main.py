from __future__ import annotations

import base64
import io
from typing import Literal, Optional

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field
from starlette.concurrency import run_in_threadpool

from . import analysis, config, gemini_assistant
from .store import blockchain, piracy

app = FastAPI(title="SportShield Pro API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins(),
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _enforce_size(raw: bytes) -> None:
    max_b = config.max_upload_bytes()
    if len(raw) > max_b:
        raise HTTPException(
            status_code=413,
            detail=f"Upload exceeds maximum size ({max_b // (1024 * 1024)} MiB).",
        )


class AssistantInsightBody(BaseModel):
    """Context for the Gemini-powered (or fallback) assistant."""

    label: str = Field(min_length=1, max_length=16)
    confidence: float = Field(ge=0, le=100)
    trust_score: int = Field(ge=0, le=100)
    filename: Optional[str] = Field(None, max_length=512)
    user_question: Optional[str] = Field(None, max_length=2000)
    piracy_duplicate: Optional[bool] = None


def _demo_case(s: Optional[str]) -> Optional[Literal["real", "fake", "edited"]]:
    if not s:
        return None
    if s in ("real", "fake", "edited"):
        return s  # type: ignore[return-value]
    return None


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "SportShield Pro"}


@app.get("/api/config/public")
def public_config():
    """Non-secret flags for the UI (e.g. whether Google Gemini is configured)."""
    return {
        "assistant": "gemini" if config.gemini_api_key() else "fallback",
    }


@app.post("/api/assistant/insight")
async def assistant_insight(body: AssistantInsightBody):
    """
    Context-aware narrative using Google Gemini when GEMINI_API_KEY is set; otherwise template fallback.
    Key never leaves the server.
    """
    text, source = await run_in_threadpool(
        lambda: gemini_assistant.generate_insight(
            label=body.label,
            confidence=body.confidence,
            trust_score=body.trust_score,
            filename=body.filename,
            user_question=body.user_question,
            piracy_duplicate=body.piracy_duplicate,
        )
    )
    return {"text": text, "source": source}


@app.post("/api/analyze")
async def analyze_media(
    file: UploadFile = File(...),
    demo_case: Optional[str] = Form(None),
):
    raw = await file.read()
    _enforce_size(raw)
    if not raw:
        raise HTTPException(400, "Empty file")
    dc = _demo_case(demo_case)
    h = analysis.file_hash(raw)
    name = (file.filename or "").lower()
    ct = file.content_type or ""
    is_video = ct.startswith("video") or name.endswith((".mp4", ".webm", ".mov", ".avi", ".mkv"))
    try:
        if is_video:
            img = analysis.first_frame_from_video(raw)
        else:
            img = analysis.load_image_from_bytes(raw)
    except Exception as e:
        if is_video:
            raise HTTPException(
                status_code=422,
                detail=(
                    "Could not read a video frame from this file. "
                    "Use a supported container/codec (e.g. H.264 in MP4) or upload an image instead."
                ),
            ) from e
        raise HTTPException(
            status_code=400,
            detail="Could not decode image data.",
        ) from e

    label, conf = analysis.simulate_verdict(raw, dc)
    fake_bias = label == "FAKE"
    heat_img = analysis.build_heatmap_overlay(img, h, fake_bias)
    buf = io.BytesIO()
    heat_img.save(buf, format="PNG")
    heat_b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")
    ts = analysis.trust_score(label, conf)
    return {
        "filename": file.filename,
        "label": label,
        "confidence": conf,
        "trust_score": ts,
        "heatmap_png_base64": heat_b64,
        "media_hash": h,
    }


@app.post("/api/generate-fake")
async def generate_fake(file: UploadFile = File(...)):
    raw = await file.read()
    _enforce_size(raw)
    if not raw:
        raise HTTPException(400, "Empty file")
    try:
        img = analysis.load_image_from_bytes(raw)
    except Exception as e:
        raise HTTPException(400, f"Invalid image: {e}") from e
    fake_img = analysis.apply_fake_edit(img)
    out = analysis.image_to_png_bytes(fake_img)
    return Response(content=out, media_type="image/png")


@app.post("/api/watermark")
async def watermark(file: UploadFile = File(...)):
    raw = await file.read()
    _enforce_size(raw)
    if not raw:
        raise HTTPException(400, "Empty file")
    try:
        img = analysis.load_image_from_bytes(raw)
    except Exception as e:
        raise HTTPException(400, f"Invalid image: {e}") from e
    wm = analysis.embed_watermark(img)
    out = analysis.image_to_png_bytes(wm)
    return Response(content=out, media_type="image/png")


@app.post("/api/blockchain/register")
async def chain_register(file: UploadFile = File(...)):
    raw = await file.read()
    _enforce_size(raw)
    h = analysis.file_hash(raw)
    entry = blockchain.register(h, file.filename or "media")
    return {
        "status": "Media Registered Successfully",
        "transaction_id": entry.tx_id,
        "timestamp": entry.timestamp,
        "media_hash": h,
    }


@app.post("/api/blockchain/verify")
async def chain_verify(file: UploadFile = File(...), registered_hash: Optional[str] = Form(None)):
    raw = await file.read()
    _enforce_size(raw)
    h = analysis.file_hash(raw)
    if registered_hash:
        if h == registered_hash:
            st, ent = blockchain.verify(h)
            if st == "verified" and ent:
                return {
                    "result": "Verified Original",
                    "transaction_id": ent.tx_id,
                    "timestamp": ent.timestamp,
                    "media_hash": h,
                }
        return {
            "result": "Mismatch Detected",
            "detail": "Content hash does not match registered original.",
            "uploaded_hash": h,
            "expected_hash": registered_hash,
        }
    st, ent = blockchain.verify(h)
    if st == "verified" and ent:
        return {
            "result": "Verified Original",
            "transaction_id": ent.tx_id,
            "timestamp": ent.timestamp,
            "media_hash": h,
        }
    return {
        "result": "Not Registered",
        "detail": "No on-chain record for this file (demo).",
        "media_hash": h,
    }


@app.post("/api/piracy-check")
async def piracy_check(file: UploadFile = File(...)):
    raw = await file.read()
    _enforce_size(raw)
    h = analysis.file_hash(raw)
    r = piracy.check(h, file.filename or "upload")
    return {"media_hash": h, **r}


@app.post("/api/piracy/reset")
def piracy_reset():
    piracy.reset()
    return {"ok": True}


@app.post("/api/report")
async def build_report(
    file: UploadFile = File(...),
    demo_case: Optional[str] = Form(None),
):
    raw = await file.read()
    _enforce_size(raw)
    dc = _demo_case(demo_case)
    label, conf = analysis.simulate_verdict(raw, dc)
    ts = analysis.trust_score(label, conf)
    h = analysis.file_hash(raw)
    lines = [
        "SportShield Pro — Analysis Report (Demo)",
        "=" * 44,
        f"File: {file.filename}",
        f"SHA-256: {h}",
        f"Result: {label}",
        f"Model confidence: {conf}%",
        f"Trust score: {ts}/100",
        "",
        "Tampering proof: see heatmap in the web UI (demo overlay).",
        "",
        "This report is generated for demonstration purposes.",
    ]
    text = "\n".join(lines)
    return Response(
        content=text,
        media_type="text/plain",
        headers={"Content-Disposition": f'attachment; filename="sportshield-report.txt"'},
    )
