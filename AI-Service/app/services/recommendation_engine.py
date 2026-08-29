from collections import Counter

from app.services.tmdb_client import tmdb_client


def _to_summary(m: dict) -> dict:
    return {
        "id": m["id"],
        "title": m.get("title"),
        "overview": m.get("overview"),
        "poster_path": m.get("poster_path"),
        "release_date": m.get("release_date"),
        "vote_average": m.get("vote_average"),
    }


async def similar_movies(movie_id: int, page: int = 1) -> list[dict]:
    data = await tmdb_client.get_similar(movie_id, page)
    return [_to_summary(m) for m in data.get("results", [])]


async def by_same_director(movie_id: int, page: int = 1, exclude_id: int | None = None) -> tuple[list[dict], str | None]:
    credits = await tmdb_client.get_credits(movie_id)
    director = next((c for c in credits.get("crew", []) if c.get("job") == "Director"), None)
    if not director:
        return [], None

    data = await tmdb_client.discover(with_crew=director["id"], page=page, sort_by="popularity.desc")
    results = [_to_summary(m) for m in data.get("results", []) if m["id"] != exclude_id]
    return results, director.get("name")


async def by_same_actor(movie_id: int, page: int = 1, exclude_id: int | None = None) -> tuple[list[dict], str | None]:
    credits = await tmdb_client.get_credits(movie_id)
    cast = credits.get("cast", [])
    if not cast:
        return [], None

    lead = min(cast, key=lambda c: c.get("order", 999))
    data = await tmdb_client.discover(with_cast=lead["id"], page=page, sort_by="popularity.desc")
    results = [_to_summary(m) for m in data.get("results", []) if m["id"] != exclude_id]
    return results, lead.get("name")


async def by_same_genre(movie_id: int, page: int = 1, exclude_id: int | None = None) -> tuple[list[dict], list[str]]:
    movie = await tmdb_client.get_movie(movie_id)
    genres = movie.get("genres", [])
    if not genres:
        return [], []

    genre_ids = ",".join(str(g["id"]) for g in genres)
    data = await tmdb_client.discover(with_genres=genre_ids, page=page, sort_by="vote_average.desc",
                                       **{"vote_count.gte": 100})
    results = [_to_summary(m) for m in data.get("results", []) if m["id"] != exclude_id]
    return results, [g["name"] for g in genres]


async def because_you_watched(movie_id: int, page: int = 1) -> tuple[list[dict], str]:
    """Blend 'similar' + 'same director' for a richer 'Because you watched X' row."""
    movie = await tmdb_client.get_movie(movie_id)
    title = movie.get("title", "that movie")

    similar = await similar_movies(movie_id, page)
    director_results, _ = await by_same_director(movie_id, page, exclude_id=movie_id)

    seen_ids = set()
    blended = []
    for m in similar + director_results:
        if m["id"] not in seen_ids:
            seen_ids.add(m["id"])
            blended.append(m)

    return blended[:20], title


async def personalized(favorite_ids: list[int], watched_ids: list[int],
                        recently_viewed_ids: list[int], page: int = 1) -> list[dict]:
    """
    Content-based personalization: look at genre frequency across the user's
    favorites/watched/recently-viewed, then discover movies skewed toward their
    top 2-3 genres, excluding anything they've already interacted with.
    """
    seed_ids = list(dict.fromkeys(favorite_ids + watched_ids + recently_viewed_ids))[:15]
    if not seed_ids:
        # Cold start: fall back to popular
        data = await tmdb_client.get_popular(page=page)
        return [_to_summary(m) for m in data.get("results", [])]

    genre_counter: Counter[int] = Counter()
    for mid in seed_ids:
        try:
            movie = await tmdb_client.get_movie(mid)
            for g in movie.get("genres", []):
                # Favorites count double - they're a stronger signal than "watched"
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
