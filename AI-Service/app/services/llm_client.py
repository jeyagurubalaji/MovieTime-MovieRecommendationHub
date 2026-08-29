import json
import logging

from anthropic import Anthropic
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_client: Anthropic | None = Anthropic(api_key=settings.anthropic_api_key) if settings.ai_enabled else None


class LlmUnavailableError(Exception):
    """Raised when an LLM-backed feature is called without an API key configured."""


def is_available() -> bool:
    return _client is not None


async def complete(system: str, user_message: str, max_tokens: int = 700) -> str:
    """Single-turn completion. Raises LlmUnavailableError if no API key is set."""
    if _client is None:
        raise LlmUnavailableError("ANTHROPIC_API_KEY is not configured for the AI microservice.")

    response = _client.messages.create(
        model=settings.anthropic_model,
        max_tokens=max_tokens,
        system=system,
        messages=[{"role": "user", "content": user_message}],
    )
    return "".join(block.text for block in response.content if block.type == "text")


async def complete_json(system: str, user_message: str, max_tokens: int = 500) -> dict:
    """Ask the model for strict JSON and parse it. Raises LlmUnavailableError without a key."""
    text = await complete(
        system=system + "\n\nRespond with ONLY valid JSON. No markdown fences, no preamble.",
        user_message=user_message,
        max_tokens=max_tokens,
    )
    cleaned = text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(cleaned)


async def chat(system: str, history: list[dict], max_tokens: int = 700) -> str:
    """Multi-turn chat. `history` is a list of {"role": "user"|"assistant", "content": str}."""
    if _client is None:
        raise LlmUnavailableError("ANTHROPIC_API_KEY is not configured for the AI microservice.")

    response = _client.messages.create(
        model=settings.anthropic_model,
        max_tokens=max_tokens,
        system=system,
        messages=history,
    )
    return "".join(block.text for block in response.content if block.type == "text")
