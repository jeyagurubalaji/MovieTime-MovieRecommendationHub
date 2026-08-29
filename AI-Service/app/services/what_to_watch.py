import logging

from app.core.genre_map import MOOD_GENRE_MAP
from app.services import llm_client
from app.services.tmdb_client import tmdb_client

logger = logging.getLogger(__name__)


def _runtime_bounds(minutes: int | None) -> dict:
    if minutes is None:
        return {}
    if minutes <= 100:
        return {"with_runtime.lte": minutes}
    return {}


async def what_to_watch_tonight(mood: str | None, time_available_minutes: int | None,
                                 with_company: str | None) -> dict:
    genre_ids = MOOD_GENRE_MAP.get((mood or "").lower(), MOOD_GENRE_MAP["happy"])

    params = {
        "with_genres": "|".join(str(g) for g in genre_ids),
        "sort_by": "vote_average.desc",
        **{"vote_count.gte": 200},
        **_runtime_bounds(time_available_minutes),
    }

    # Family-friendly bias if watching with family
    if with_company == "family":
        params["certification_country"] = "US"
        params["certification.lte"] = "PG-13"

    data = await tmdb_client.discover(**params)
    results = data.get("results", [])

    if not results:
        return {"pick": None, "reason": "Nothing matched those constraints tonight - try loosening a filter.",
                "alternatives": []}

    def to_summary(m):
        return {
            "id": m["id"],
            "title": m.get("title"),
            "overview": m.get("overview"),
            "poster_path": m.get("poster_path"),
            "release_date": m.get("release_date"),
            "vote_average": m.get("vote_average"),
        }

    top_pick = results[0]
    alternatives = [to_summary(m) for m in results[1:5]]

    reason = f"Highly-rated pick that fits the mood{f' and your {time_available_minutes}-minute window' if time_available_minutes else ''}."
    if llm_client.is_available():
        try:
            reason = await llm_client.complete(
                system="Write ONE short, specific sentence (under 30 words) explaining why this movie is a "
                       "good pick right now, given the mood/time/company context. No spoilers, no preamble.",
                user_message=(
                    f"Movie: {top_pick.get('title')}\n"
                    f"Overview: {top_pick.get('overview', '')[:300]}\n"
                    f"Mood: {mood or 'unspecified'}\n"
                    f"Time available: {time_available_minutes or 'unspecified'} minutes\n"
                    f"Watching with: {with_company or 'unspecified'}"
                ),
                max_tokens=80,
            )
            reason = reason.strip()
        except Exception as e:
            logger.warning("What-to-watch reasoning generation failed, using canned reason: %s", e)

    return {"pick": to_summary(top_pick), "reason": reason, "alternatives": alternatives}
