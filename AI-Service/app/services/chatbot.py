import logging

from app.services import llm_client
from app.services.tmdb_client import tmdb_client

logger = logging.getLogger(__name__)

CHAT_SYSTEM_PROMPT = """You are the MovieTime AI assistant - warm, concise, genuinely knowledgeable about \
film. You help people decide what to watch, answer questions about movies, and hold a natural conversation.

When you want to recommend specific movies, respond with JSON only, no other text:
{"reply": "<your conversational reply, 2-4 sentences>", "movie_titles": ["Exact Title", "Exact Title 2"]}

"movie_titles" should contain 0-5 REAL movie titles (exact, correctly spelled) that support your reply. \
Use an empty array if you're just chatting, answering a factual question, or asking a clarifying question \
rather than recommending something to watch."""

FALLBACK_REPLY = (
    "I'm not fully wired up to an AI model right now (no API key configured), but I can still help you "
    "search - try the Smart Search or Mood picker instead, or ask again once the AI service has a key."
)


async def _resolve_titles(titles: list[str]) -> list[dict]:
    resolved = []
    for title in titles[:5]:
        try:
            data = await tmdb_client.search_movies(title, page=1)
            results = data.get("results", [])
            if results:
                m = results[0]
                resolved.append({
                    "id": m["id"],
                    "title": m.get("title"),
                    "overview": m.get("overview"),
                    "poster_path": m.get("poster_path"),
                    "release_date": m.get("release_date"),
                    "vote_average": m.get("vote_average"),
                })
        except Exception:
            continue
    return resolved


async def chat(message: str, history: list[dict]) -> dict:
    if not llm_client.is_available():
        return {"reply": FALLBACK_REPLY, "suggested_movies": [], "ai_powered": False}

    try:
        conversation = history + [{"role": "user", "content": message}]
        raw = await llm_client.chat(CHAT_SYSTEM_PROMPT, conversation)
        cleaned = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()

        import json
        parsed = json.loads(cleaned)
        reply = parsed.get("reply", raw)
        titles = parsed.get("movie_titles", [])
        suggested = await _resolve_titles(titles) if titles else []

        return {"reply": reply, "suggested_movies": suggested, "ai_powered": True}
    except Exception as e:
        logger.warning("Chat completion/parsing failed: %s", e)
        return {
            "reply": "Sorry, I had trouble processing that. Could you rephrase?",
            "suggested_movies": [],
            "ai_powered": True,
        }
