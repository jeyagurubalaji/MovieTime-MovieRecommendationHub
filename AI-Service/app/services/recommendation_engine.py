from collections import Counter
import logging

from app.services.tmdb_client import tmdb_client

logger = logging.getLogger(__name__)

def _to_summary(m: dict) -> dict:
    # Auto-detect TV shows if TMDB omits the media_type flag
    detected_type = m.get("media_type")
    if not detected_type:
        detected_type = "tv" if "first_air_date" in m or ("name" in m and "title" not in m) else "movie"

    return {
        "id": m["id"],
        "title": m.get("title") or m.get("name") or "",
        "overview": m.get("overview"),
        "poster_path": m.get("poster_path"),
        "release_date": m.get("release_date") or m.get("first_air_date"),
        "vote_average": m.get("vote_average"),
        "media_type": detected_type, # Keeps the TV flag intact for the frontend
    }

async def similar_movies(movie_id: int, page: int = 1, media_type: str = "movie") -> list[dict]:
    try:
        endpoint = f"/{media_type}/{movie_id}/similar"
        data = await tmdb_client._get(endpoint, {"page": page})
        return [_to_summary(m) for m in data.get("results", [])]
    except Exception as e:
        logger.warning(f"Failed to fetch similar for {movie_id}: {e}")
        return []

async def by_same_director(movie_id: int, page: int = 1, media_type: str = "movie", exclude_id: int | None = None) -> tuple[list[dict], str | None]:
    try:
        endpoint = f"/{media_type}/{movie_id}/credits"
        credits = await tmdb_client._get(endpoint)

        job_title = "Director" if media_type == "movie" else "Creator"
        director = next((c for c in credits.get("crew", []) if c.get("job") == job_title), None)

        if not director:
            return [], None

        data = await tmdb_client._get(f"/discover/{media_type}", {"with_crew": director["id"], "page": page, "sort_by": "popularity.desc"})
        results = [_to_summary(m) for m in data.get("results", []) if m["id"] != exclude_id]
        return results, director.get("name")
    except Exception as e:
        logger.warning(f"Failed to fetch by_same_director for {movie_id}: {e}")
        return [], None

async def by_same_actor(movie_id: int, page: int = 1, media_type: str = "movie", exclude_id: int | None = None) -> tuple[list[dict], str | None]:
    try:
        endpoint = f"/{media_type}/{movie_id}/credits"
        credits = await tmdb_client._get(endpoint)

        cast = credits.get("cast", [])
        if not cast:
            return [], None

        lead = min(cast, key=lambda c: c.get("order", 999))
        data = await tmdb_client._get(f"/discover/{media_type}", {"with_cast": lead["id"], "page": page, "sort_by": "popularity.desc"})
        results = [_to_summary(m) for m in data.get("results", []) if m["id"] != exclude_id]
        return results, lead.get("name")
    except Exception as e:
        logger.warning(f"Failed to fetch by_same_actor for {movie_id}: {e}")
        return [], None

async def by_same_genre(movie_id: int, page: int = 1, media_type: str = "movie", exclude_id: int | None = None) -> tuple[list[dict], list[str]]:
    try:
        movie = await tmdb_client.get_movie(movie_id, media_type)
        genres = movie.get("genres", [])
        if not genres:
            return [], []

        genre_ids = ",".join(str(g["id"]) for g in genres)
        params = {
            "with_genres": genre_ids,
            "page": page,
            "sort_by": "vote_average.desc",
            "vote_count.gte": 100
        }

        data = await tmdb_client._get(f"/discover/{media_type}", params)
        results = [_to_summary(m) for m in data.get("results", []) if m["id"] != exclude_id]
        return results, [g["name"] for g in genres]
    except Exception as e:
        logger.warning(f"Failed to fetch by_same_genre for {movie_id}: {e}")
        return [], []

async def because_you_watched(movie_id: int, page: int = 1, media_type: str = "movie") -> tuple[list[dict], str]:
    try:
        movie = await tmdb_client.get_movie(movie_id, media_type)
        title = movie.get("title") or movie.get("name") or "that title"

        similar = await similar_movies(movie_id, page, media_type)
        director_results, _ = await by_same_director(movie_id, page, media_type, exclude_id=movie_id)

        seen_ids = set()
        blended = []
        for m in similar + director_results:
            if m["id"] not in seen_ids:
                seen_ids.add(m["id"])
                blended.append(m)

        return blended[:20], title
    except Exception as e:
        logger.warning(f"Failed to fetch because_you_watched for {movie_id}: {e}")
        return [], "Unknown Title"

async def personalized(favorite_ids: list[int], watched_ids: list[int],
                        recently_viewed_ids: list[int], page: int = 1) -> list[dict]:
    seed_ids = list(dict.fromkeys(favorite_ids + watched_ids + recently_viewed_ids))[:15]
    if not seed_ids:
        data = await tmdb_client.get_popular(page=page)
        return [_to_summary(m) for m in data.get("results", [])]

    genre_counter: Counter[int] = Counter()
    for mid in seed_ids:
        try:
            movie = await tmdb_client.get_movie(mid, "movie")
            for g in movie.get("genres", []):
                weight = 2 if mid in favorite_ids else 1
                genre_counter[g["id"]] += weight
        except Exception:
            continue

    if not genre_counter:
        data = await tmdb_client.get_popular(page=page)
        return [_to_summary(m) for m in data.get("results", [])]

    top_genres = [str(gid) for gid, _ in genre_counter.most_common(3)]
    data = await tmdb_client.discover(with_genres=",".join(top_genres), page=page, sort_by="popularity.desc")

    exclude = set(seed_ids)
    return [_to_summary(m) for m in data.get("results", []) if m["id"] not in exclude]

async def trending_in_country(region: str, page: int = 1) -> list[dict]:
    data = await tmdb_client.get_popular(region=region, page=page)
    return [_to_summary(m) for m in data.get("results", [])]