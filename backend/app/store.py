"""In-memory demo stores for blockchain simulation and piracy tracking."""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Dict, Optional, Set


@dataclass
class ChainEntry:
    tx_id: str
    timestamp: float
    media_hash: str
    filename: str


class BlockchainSim:
    def __init__(self) -> None:
        self._registry: Dict[str, ChainEntry] = {}

    def register(self, media_hash: str, filename: str) -> ChainEntry:
        if media_hash in self._registry:
            return self._registry[media_hash]
        tx = f"0x{uuid.uuid4().hex}"
        entry = ChainEntry(tx_id=tx, timestamp=time.time(), media_hash=media_hash, filename=filename)
        self._registry[media_hash] = entry
        return entry

    def verify(self, media_hash: str) -> tuple[str, Optional[ChainEntry]]:
        if media_hash in self._registry:
            return "verified", self._registry[media_hash]
        return "not_registered", None

    def mismatch(self, registered_hash: str, uploaded_hash: str) -> bool:
        return registered_hash != uploaded_hash


class PiracyTracker:
    """First upload = original; repeat hash = possible piracy."""

    def __init__(self) -> None:
        self._seen: Set[str] = set()
        self._first_name: Dict[str, str] = {}

    def check(self, media_hash: str, filename: str) -> dict:
        if media_hash not in self._seen:
            self._seen.add(media_hash)
            self._first_name[media_hash] = filename
            return {"duplicate": False, "message": "First occurrence recorded."}
        return {
            "duplicate": True,
            "message": "⚠️ Possible Piracy Detected",
            "detail": f"Same content as earlier upload: {self._first_name.get(media_hash, 'unknown')}",
        }

    def reset(self) -> None:
        self._seen.clear()
        self._first_name.clear()


blockchain = BlockchainSim()
piracy = PiracyTracker()
