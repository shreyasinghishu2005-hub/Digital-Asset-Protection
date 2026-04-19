"""API tests — no external Google calls (assistant uses fallback when GEMINI_API_KEY unset)."""

from __future__ import annotations

import os

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("GEMINI_API_KEY", "")

from app.main import app  # noqa: E402

client = TestClient(app)


def test_health():
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_public_config():
    r = client.get("/api/config/public")
    assert r.status_code == 200
    data = r.json()
    assert "assistant" in data
    assert data["assistant"] in ("gemini", "fallback")


def test_assistant_insight_fallback():
    r = client.post(
        "/api/assistant/insight",
        json={
            "label": "FAKE",
            "confidence": 88.5,
            "trust_score": 30,
            "filename": "clip.png",
            "piracy_duplicate": False,
        },
    )
    assert r.status_code == 200
    data = r.json()
    assert "text" in data
    assert data["source"] in ("gemini", "fallback")
    assert "FAKE" in data["text"] or "fake" in data["text"].lower()


def test_assistant_insight_validation():
    r = client.post(
        "/api/assistant/insight",
        json={"label": "X", "confidence": 200, "trust_score": 50},
    )
    assert r.status_code == 422
