import logging

from app.core.genre_map import GENRE_IDS
from app.services import llm_client
from app.services.tmdb_client import tmdb_client

logger = logging.getLogger(__name__)

# CHANGED: Instruct the AI to detect 'media_type', alongside the exact year, language, and actor filters.
SYSTEM_PROMPT = """You are a movie and TV search assistant for MovieTime. Given a free-text description of \
what someone wants to watch, extract structured search filters.

Return JSON with these fields:
- "media_type": return "tv" if they mention series, show, season, or tv. Otherwise, return "movie".
- "genres": array of genre names from this exact list (lowercase): action, adventure, animation, comedy, \
crime, documentary, drama, family, fantasy, history, horror, music, mystery, romance, science fiction, \
thriller, war, western. Include only genres clearly implied. Can be empty.
- "keywords": a short (2-4 word) plain-language search phrase capturing the core concept. Empty string if none.
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
        "keywords": "",
        "year": None,
        "language": None,
        "actor": None,
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

    # 1. Determine media type explicitly
    media_type = filters.get("media_type")
    if media_type not in ["movie", "tv"]:
        media_type = "movie"

    # 2. Build strict discovery parameters
    discover_params: dict = {"page": page, "sort_by": "popularity.desc"}

    genre_ids = [str(GENRE_IDS[g]) for g in filters.get("genres", []) if g in GENRE_IDS]
    if genre_ids:
        discover_params["with_genres"] = ",".join(genre_ids)

    if filters.get("year"):
        if media_type == "tv":
            discover_params["first_air_date_year"] = filters["year"]
        else:
            discover_params["primary_release_year"] = filters["year"]

    if filters.get("language"):
        discover_params["with_original_language"] = filters["language"]

    actor_name = filters.get("actor")
    if actor_name:
        try:
            person_search = await tmdb_client._get("/search/person", {"query": actor_name})
            if person_search and person_search.get("results"):
                discover_params["with_cast"] = person_search["results"][0]["id"]
        except Exception as e:
            logger.warning(f"Failed to resolve actor {actor_name}: {e}")

    results: list[dict] = []
    has_strict_filters = bool(actor_name or filters.get("year") or filters.get("language") or genre_ids)

    # 3. Route to the correct TMDB endpoint based on media_type
    if has_strict_filters:
        try:
            data = await tmdb_client.discover(media_type=media_type, **discover_params)
            results = data.get("results", [])
        except Exception as e:
            logger.warning(f"Discover API failed: {e}")

    keyword_text = filters.get("keywords") or ""
    if not results and keyword_text:
        try:
            search_data = await tmdb_client.search_movies(keyword_text, page, media_type=media_type)
            results = search_data.get("results", [])
        except Exception:
            pass

    if not results:
        try:
            search_data = await tmdb_client.search_movies(description, page, media_type=media_type)
            results = search_data.get("results", [])
        except Exception:
            pass

    # 4. Map TV and Movie fields uniformly so React cards don't break
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