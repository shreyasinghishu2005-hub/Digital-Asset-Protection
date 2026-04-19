"""
Google Gemini (Generative AI) — contextual assistant for analysis explanations.

API key is read server-side only via GEMINI_API_KEY. If unset, callers get a deterministic fallback.
"""

from __future__ import annotations

from typing import Literal, Optional

from . import config

Source = Literal["gemini", "fallback"]


def _fallback_text(
    *,
    label: str,
    confidence: float,
    trust_score: int,
    filename: Optional[str],
    user_question: Optional[str],
    piracy_duplicate: Optional[bool],
) -> str:
    lines = [
        f"Analysis summary: verdict {label} with {confidence:.1f}% model confidence and trust score {trust_score}/100.",
    ]
    if filename:
        lines.append(f"File context: {filename}.")
    if piracy_duplicate:
        lines.append(
            "Duplicate fingerprint in this session: treat as a possible unauthorized redistribution until cleared by your rights workflow."
        )
    if label == "FAKE":
        lines.append(
            "Next steps (demo): quarantine the asset, compare to master broadcast feed, and escalate per league policy. "
            "Red regions on the heatmap are forensic highlights for review—not legal proof alone."
        )
    else:
        lines.append(
            "Next steps (demo): archive a hash for audit, keep chain-of-custody logs, and continue monitoring derivative clips."
        )
    if user_question and user_question.strip():
        lines.append(
            f"Regarding your question (“{user_question.strip()[:200]}”): "
            "connect with your MCR or compliance lead; this console does not replace legal or operational sign-off."
        )
    lines.append(
        "Tip: set GEMINI_API_KEY on the server to enable Google Gemini–powered narrative insights for judges and demos."
    )
    return "\n\n".join(lines)


def generate_insight(
    *,
    label: str,
    confidence: float,
    trust_score: int,
    filename: Optional[str] = None,
    user_question: Optional[str] = None,
    piracy_duplicate: Optional[bool] = None,
) -> tuple[str, Source]:
    key = config.gemini_api_key()
    if not key:
        return _fallback_text(
            label=label,
            confidence=confidence,
            trust_score=trust_score,
            filename=filename,
            user_question=user_question,
            piracy_duplicate=piracy_duplicate,
        ), "fallback"

    try:
        import google.generativeai as genai  # type: ignore[import-untyped]

        genai.configure(api_key=key)
        model = genai.GenerativeModel("gemini-1.5-flash")

        ctx = (
            f"You are SportShield Pro, an assistant for sports broadcast and rights teams.\n"
            f"Detection verdict: {label}. Model confidence: {confidence:.1f}%. Trust score: {trust_score}/100.\n"
            f"Filename (if any): {filename or 'unknown'}.\n"
            f"Possible duplicate/piracy flag in session: {piracy_duplicate}.\n\n"
            "Write 2 short paragraphs: (1) what this means operationally for a control room, "
            "(2) prudent next checks. Stay factual; note this is a demo pipeline unless told otherwise.\n"
        )
        if user_question and user_question.strip():
            ctx += f"User follow-up: {user_question.strip()[:500]}\n"

        resp = model.generate_content(
            ctx,
            generation_config={"max_output_tokens": 512, "temperature": 0.4},
        )
        text = (resp.text or "").strip()
        if not text:
            raise ValueError("empty gemini response")
        return text, "gemini"
    except Exception:
        return _fallback_text(
            label=label,
            confidence=confidence,
            trust_score=trust_score,
            filename=filename,
            user_question=user_question,
            piracy_duplicate=piracy_duplicate,
        ), "fallback"
