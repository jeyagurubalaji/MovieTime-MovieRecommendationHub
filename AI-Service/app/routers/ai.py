from fastapi import APIRouter, HTTPException

from app.schemas.schemas import (
    ChatRequest,
    ChatResponse,
    DescriptionSearchRequest,
    DescriptionSearchResponse,
    MoodRequest,
    MoodResponse,
    SpoilerFreeSummaryRequest,
    SpoilerFreeSummaryResponse,
    SummarizeResponse,
    WhatToWatchRequest,
    WhatToWatchResponse,
)
from app.services import chatbot, description_search, mood_service, summary_service, what_to_watch

router = APIRouter(prefix="/ai", tags=["ai"])


@router.post("/search-by-description", response_model=DescriptionSearchResponse)
async def search_by_description(request: DescriptionSearchRequest):
    result = await description_search.search_by_description(request.description, request.page)
    return result


@router.post("/mood", response_model=MoodResponse)
async def mood_recommendations(request: MoodRequest):
    return await mood_service.recommend_for_mood(request.mood, request.page)


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    history = [{"role": m.role, "content": m.content} for m in request.history]
    result = await chatbot.chat(request.message, history)
    return result


@router.post("/what-to-watch-tonight", response_model=WhatToWatchResponse)
async def what_to_watch_tonight_endpoint(request: WhatToWatchRequest):
    return await what_to_watch.what_to_watch_tonight(
        request.mood, request.time_available_minutes, request.with_company
    )


@router.get("/summarize/{movie_id}", response_model=SummarizeResponse)
async def summarize_movie(movie_id: int):
    try:
        return await summary_service.generate_movie_summary(movie_id)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch movie data: {e}")


@router.post("/spoiler-free-summary", response_model=SpoilerFreeSummaryResponse)
async def spoiler_free_summary(request: SpoilerFreeSummaryRequest):
    reviews = [r.model_dump() for r in request.reviews]
    return await summary_service.generate_spoiler_free_summary(reviews)
