import logging

import httpx
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.routers import ai, recommendations
from app.services.tmdb_client import tmdb_client

logging.basicConfig(level=logging.INFO)
settings = get_settings()

app = FastAPI(
    title="MovieTime AI Service",
    description="AI recommendations, chatbot, natural-language search, and summaries for MovieTime.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ai.router)
app.include_router(recommendations.router)


@app.exception_handler(httpx.HTTPStatusError)
async def tmdb_error_handler(request: Request, exc: httpx.HTTPStatusError):
    status = exc.response.status_code
    if status in (401, 403):
        detail = "TMDB API key is missing or invalid. Set TMDB_API_KEY in the AI service environment."
    else:
        detail = f"TMDB request failed with status {status}."
    logging.getLogger(__name__).warning("TMDB error: %s", detail)
    return JSONResponse(status_code=502, content={"detail": detail})


@app.exception_handler(httpx.RequestError)
async def tmdb_network_error_handler(request: Request, exc: httpx.RequestError):
    logging.getLogger(__name__).warning("TMDB network error: %s", exc)
    return JSONResponse(status_code=502, content={"detail": "Could not reach TMDB. Check network/API connectivity."})


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "ai_enabled": settings.ai_enabled,
        "tmdb_configured": settings.tmdb_api_key != "your-tmdb-api-key",
    }


@app.on_event("shutdown")
async def shutdown():
    await tmdb_client.close()
