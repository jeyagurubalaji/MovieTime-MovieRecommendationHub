import logging

from app.core.genre_map import GENRE_IDS
from app.services import llm_client
from app.services.tmdb_client import tmdb_client

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a movie search assistant for MovieTime. Given a free-text description of \
what someone wants to watch, extract structured search filters.

Return JSON with these fields:
- "genres": array of genre names from this exact list (lowercase): action, adventure, animation, comedy, \
crime, documentary, drama, family, fantasy, history, horror, music, mystery, romance, science fiction, \
thriller, war, western. Include only genres clearly implied. Can be empty.
- "keywords": a short (2-4 word) plain-language search phrase capturing the core concept (e.g. "time travel", \
"heist", "high school"). Empty string if nothing specific.
- "min_year": integer or null - only set if the person mentions an era/decade/recency.
- "explanation": one friendly sentence (under 25 words) explaining what you're searching for.
"""


def _rule_based_fallback(description: str) -> dict:
    lower = description.lower()
    matched_genres = [name for name in GENRE_IDS if name in lower]
    return {
        "genres": matched_genres[:3],
        "keywords": "",
        "min_year": None,
        "explanation": "Searching by the genres and terms mentioned in your description.",
    }


async def search_by_description(description: str, page: int = 1) -> dict:
    ai_powered = llm_client.is_available()

    if ai_powered:
        try:
            filters = await llm_client.complete_json(SYSTEM_PROMPT, description)
        except Exception as e:
            logger.warning("LLM description parsing failed, falling back to rules: %s", e)
            filters = _rule_based_fallback(description)
            ai_powered = False
    else:
        filters = _rule_based_fallback(description)

    genre_ids = [str(GENRE_IDS[g]) for g in filters.get("genres", []) if g in GENRE_IDS]

    discover_params: dict = {"page": page, "sort_by": "popularity.desc"}
    if genre_ids:
        discover_params["with_genres"] = ",".join(genre_ids)
    if filters.get("min_year"):
        discover_params["primary_release_year.gte"] = filters["min_year"]

    keyword_text = filters.get("keywords") or ""
    results: list[dict] = []

    if keyword_text:
        # Ground the keyword in a real TMDB text search rather than trusting the LLM's
        # phrasing to match a discover filter directly.
        search_data = await tmdb_client.search_movies(keyword_text, page)
        results = search_data.get("results", [])

    if not results and genre_ids:
        data = await tmdb_client.discover(**discover_params)
        results = data.get("results", [])

    if not results:
        # Last resort: search on the raw description itself
        search_data = await tmdb_client.search_movies(description, page)
        results = search_data.get("results", [])

    summaries = [
        {
            "id": m["id"],
            "title": m.get("title"),
            "overview": m.get("overview"),
            "poster_path": m.get("poster_path"),
            "release_date": m.get("release_date"),
            "vote_average": m.get("vote_average"),
        }
        for m in results
    ]

    return {
        "interpreted_filters": filters,
        "explanation": filters.get("explanation", "Here's what matched your description."),
        "results": summaries,
        "ai_powered": ai_powered,
    }
