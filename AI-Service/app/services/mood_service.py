import logging

from app.core.genre_map import MOOD_GENRE_MAP
from app.services import llm_client
from app.services.tmdb_client import tmdb_client

logger = logging.getLogger(__name__)

MOOD_MESSAGES = {
    "happy": "Riding a good mood - here's more of that feel-good energy.",
    "sad": "Something to sit with, or something to help you feel better - your call.",
    "excited": "Buckle up. Here's what matches that energy.",
    "relaxed": "Easy, low-stakes watching for a slow evening.",
    "scared": "For when you want your pulse up.",
    "romantic": "Setting the mood, one way or another.",
    "nostalgic": "A little bit of warmth from the past.",
    "thoughtful": "Something with more to chew on.",
}


async def recommend_for_mood(mood: str, page: int = 1) -> dict:
    key = mood.strip().lower()
    genre_ids = MOOD_GENRE_MAP.get(key)

    if not genre_ids:
        # Unknown mood label - default to a broadly appealing blend
        genre_ids = MOOD_GENRE_MAP["happy"]
        key = "happy"

    data = await tmdb_client.discover(
        with_genres="|".join(str(g) for g in genre_ids),  # OR semantics
        sort_by="popularity.desc",
        page=page,
        **{"vote_count.gte": 50},
    )
    results = data.get("results", [])

    message = MOOD_MESSAGES.get(key, f"Picks for feeling {key}.")
    if llm_client.is_available():
        try:
            message = await llm_client.complete(
                system="Write ONE short, warm sentence (under 20 words) introducing movie picks for someone "
                       "in this mood. No preamble, just the sentence.",
                user_message=f"Mood: {mood}",
                max_tokens=60,
            )
            message = message.strip()
        except Exception as e:
            logger.warning("Mood message generation failed, using canned message: %s", e)

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

    return {"mood": mood, "message": message, "results": summaries}
