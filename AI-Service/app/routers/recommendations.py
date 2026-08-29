from fastapi import APIRouter, HTTPException

from app.schemas.schemas import (
    BecauseYouWatchedResponse,
    MovieSummary,
    PersonalizedRequest,
    RecommendationResponse,
)
from app.services import recommendation_engine as engine

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/{movie_id}/similar", response_model=RecommendationResponse)
async def similar(movie_id: int, page: int = 1):
    results = await engine.similar_movies(movie_id, page)
    return RecommendationResponse(source_movie_id=movie_id, reason="Similar movies", results=results)


@router.get("/{movie_id}/same-director", response_model=RecommendationResponse)
async def same_director(movie_id: int, page: int = 1):
    results, director_name = await engine.by_same_director(movie_id, page, exclude_id=movie_id)
    reason = f"More from {director_name}" if director_name else "Same director"
    return RecommendationResponse(source_movie_id=movie_id, reason=reason, results=results)


@router.get("/{movie_id}/same-actor", response_model=RecommendationResponse)
async def same_actor(movie_id: int, page: int = 1):
    results, actor_name = await engine.by_same_actor(movie_id, page, exclude_id=movie_id)
    reason = f"More with {actor_name}" if actor_name else "Same lead actor"
    return RecommendationResponse(source_movie_id=movie_id, reason=reason, results=results)


@router.get("/{movie_id}/same-genre", response_model=RecommendationResponse)
async def same_genre(movie_id: int, page: int = 1):
    results, genre_names = await engine.by_same_genre(movie_id, page, exclude_id=movie_id)
    reason = f"More {'/'.join(genre_names)}" if genre_names else "Same genre"
    return RecommendationResponse(source_movie_id=movie_id, reason=reason, results=results)


@router.get("/{movie_id}/because-you-watched", response_model=BecauseYouWatchedResponse)
async def because_you_watched(movie_id: int, page: int = 1):
    results, title = await engine.because_you_watched(movie_id, page)
    return BecauseYouWatchedResponse(source_movie_id=movie_id, source_title=title, results=results)


@router.post("/personalized", response_model=list[MovieSummary])
async def personalized(request: PersonalizedRequest):
    results = await engine.personalized(
        request.favorite_movie_ids,
        request.watched_movie_ids,
        request.recently_viewed_movie_ids,
        request.page,
    )
    return results


@router.get("/trending-in/{region}", response_model=list[MovieSummary])
async def trending_in(region: str, page: int = 1):
    if len(region) != 2:
        raise HTTPException(status_code=400, detail="region must be a 2-letter country code, e.g. US, IN, GB")
    return await engine.trending_in_country(region.upper(), page)
