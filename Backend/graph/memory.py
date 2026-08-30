"""
Thin wrapper around mem0 (cloud) so the graph nodes don't need to know
about the client directly.

    get_relevant_memories(user_id, query) -> str   # formatted for prompt injection
    save_turn(user_id, human_text, ai_text) -> None # persist a completed turn

Requires MEM0_API_KEY in the environment.
"""

import os
from typing import Optional
from mem0 import MemoryClient

_client: Optional[MemoryClient] = None


def _get_client() -> MemoryClient:
    global _client
    if _client is None:
        _client = MemoryClient(api_key=os.getenv("MEM0_API_KEY"))
    return _client


def get_relevant_memories(user_id: str, query: str, limit: int = 5) -> str:
    """Search mem0 for memories relevant to the current user message.
    Returns a bullet-point string ready to drop into the system prompt,
    or "" if nothing relevant / on error (never blocks the turn)."""
    if not query or not user_id:
        return ""

    try:
        results = _get_client().search(query, filters={"user_id": user_id}, limit=limit)
    except Exception as exc:  # noqa: BLE001
        print(f"[mem0] search failed: {exc}")
        return ""

    if not results:
        return ""

    lines = []
    for r in results:
        text = r.get("memory") if isinstance(r, dict) else None
        if text:
            lines.append(f"- {text}")

    return "\n".join(lines)


def save_turn(user_id: str, human_text: str, ai_text: str) -> None:
    """Persist one user/assistant exchange to mem0. Fire-and-forget:
    a mem0 failure should never break the chat flow."""
    if not user_id or (not human_text and not ai_text):
        return

    messages = []
    if human_text:
        messages.append({"role": "user", "content": human_text})
    if ai_text:
        messages.append({"role": "assistant", "content": ai_text})

    try:
        _get_client().add(messages, user_id=user_id)
    except Exception as exc:  # noqa: BLE001
        print(f"[mem0] save failed: {exc}")
