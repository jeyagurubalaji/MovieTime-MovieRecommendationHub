import logging

from app.core.genre_map import GENRE_IDS
from app.services import llm_client
from app.services.tmdb_client import tmdb_client

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a movie and TV search assistant for MovieTime. Given a free-text description of \
what someone wants to watch, extract structured search filters.

Return JSON with these fields:
- "media_type": return "tv" if they mention series, show, season, or tv. Otherwise, return "movie".
- "genres": array of genre names from this exact list (lowercase): action, adventure, animation, comedy, \
crime, documentary, drama, family, fantasy, history, horror, music, mystery, romance, science fiction, \
thriller, war, western. Include only genres clearly implied. Can be empty.
- "keywords": a short (2-4 word) plain-language search phrase capturing the specific person, title, or subject (e.g. "barack obama", "michael jackson", "batman"). Empty string if none.
- "year": exact 4-digit release year if mentioned, else null.
- "language": 2-letter ISO 639-1 language code if a specific language/region is mentioned (e.g. 'ta' for Tamil), else null.
- "actor": full name of an actor or director if mentioned, else null.
- "explanation": one friendly sentence (under 25 words) explaining what you're searching for.
"""

def _rule_based_fallback(description: str) -> dict:
    lower = description.lower()
    matched_genres = [name for name in GENRE_IDS if name in lower]
    is_tv = any(word in lower for word in ["tv", "series", "show", "season"])
    return {
        "media_type": "tv" if is_tv else "movie",
        "genres": matched_genres[:3],
        "keywords": description.strip(),
        "year": None,
        "language": None,
        "actor": None,
        "explanation": "Searching by the terms mentioned in your description.",
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

    # 1. Determine media type explicitly
    media_type = filters.get("media_type")
    if media_type not in ["movie", "tv"]:
        media_type = "movie"

    # 2. Extract potential text search query
    keyword_text = filters.get("keywords") or ""
    actor_name = filters.get("actor") or ""

    primary_query = keyword_text or actor_name or description.strip()

    results: list[dict] = []

    # 3. Direct text search only — NO generic discover fallback
    if primary_query:
        try:
            search_data = await tmdb_client.search_movies(primary_query, page, media_type=media_type)
            results = search_data.get("results", [])
        except Exception as e:
            logger.warning(f"Text search failed for '{primary_query}': {e}")

    # Check alternate media type if initial media_type yielded no results
    if not results and primary_query:
        alt_type = "tv" if media_type == "movie" else "movie"
        try:
            search_data = await tmdb_client.search_movies(primary_query, page, media_type=alt_type)
            results = search_data.get("results", [])
            if results:
                media_type = alt_type
        except Exception:
            pass

    # 4. Map TV and Movie fields uniformly
    summaries = []
    for m in results:
        ret_type = m.get("media_type") or media_type
        summaries.append({
            "id": m["id"],
            "title": m.get("title") or m.get("name"),
            "overview": m.get("overview"),
            "poster_path": m.get("poster_path"),
            "release_date": m.get("release_date") or m.get("first_air_date"),
            "vote_average": m.get("vote_average"),
            "media_type": ret_type
        })

    return {
        "interpreted_filters": filters,
        "explanation": filters.get("explanation", "Here's what matched your description."),
        "results": summaries,
        "ai_powered": ai_powered,
    }