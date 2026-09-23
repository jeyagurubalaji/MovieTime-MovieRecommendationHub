import asyncio
import logging
import httpx
import urllib.parse
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional

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
from app.services import llm_client

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])

# Enhanced model that captures JSON body and handles naming mismatches
class TranslateRequest(BaseModel):
    text: Optional[str] = None
    q: Optional[str] = None
    inputs: Optional[str] = None
    target_lang: Optional[str] = Field(default="es", alias="target_language")
    source_lang: Optional[str] = Field(default="auto", alias="source_language")

    class Config:
        populate_by_name = True

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

# UPDATED: Added type parameter to support TV Shows
@router.get("/summarize/{movie_id}", response_model=SummarizeResponse)
async def summarize_movie(movie_id: int, type: str = "movie"):
    try:
        return await summary_service.generate_movie_summary(movie_id, type)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch movie data: {e}")

@router.post("/spoiler-free-summary", response_model=SpoilerFreeSummaryResponse)
async def spoiler_free_summary(request: SpoilerFreeSummaryRequest):
    reviews = [r.model_dump() for r in request.reviews]
    return await summary_service.generate_spoiler_free_summary(reviews)

# 1. Define a global semaphore to restrict outgoing Google requests to 2 at a time
TRANSLATE_SEMAPHORE = asyncio.Semaphore(2)

# --- TRANSLATION ENDPOINT ---
@router.post("/translate")
async def translate_text(request: TranslateRequest):
    content = request.text or request.q or request.inputs or ""
    if not content.strip():
        return {"translated_text": "", "translation": ""}

    target = request.target_lang or "es"
    source = request.source_lang or "auto"

    encoded_text = urllib.parse.quote(content)
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl={source}&tl={target}&dt=t&q={encoded_text}"

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }

    translated_str = content

    # 2. Require the semaphore before making the network call
    async with TRANSLATE_SEMAPHORE:
        try:
            async with httpx.AsyncClient(timeout=10.0, headers=headers) as client:
                for attempt in range(3):
                    response = await client.get(url)
                    if response.status_code == 200:
                        data = response.json()
                        translated_str = "".join([item[0] for item in data[0] if item and item[0]])
                        break
                    elif response.status_code == 429:
                        # Add a slight delay between queued retries
                        await asyncio.sleep(1.5 * (attempt + 1))
                    else:
                        break
        except Exception as e:
            logger.error(f"Translation error: {e}")

    return {
        "translation": translated_str,
        "translated_text": translated_str,
        "translation_text": translated_str,
        "text": translated_str,
    }