import httpx
from app.core.config import get_settings

settings = get_settings()


class TmdbClient:
    def __init__(self):
        self._client = httpx.AsyncClient(base_url=settings.tmdb_base_url, timeout=10.0)

    async def _get(self, path: str, params: dict | None = None) -> dict:
        params = params or {}
        params["api_key"] = settings.tmdb_api_key
        response = await self._client.get(path, params=params)
        response.raise_for_status()
        return response.json()

    async def get_movie(self, movie_id: int) -> dict:
        return await self._get(f"/movie/{movie_id}", {"append_to_response": "credits,videos"})

    async def get_credits(self, movie_id: int) -> dict:
        return await self._get(f"/movie/{movie_id}/credits")

    async def get_similar(self, movie_id: int, page: int = 1) -> dict:
        return await self._get(f"/movie/{movie_id}/similar", {"page": page})

    async def discover(self, **params) -> dict:
        clean = {k: v for k, v in params.items() if v is not None}
        return await self._get("/discover/movie", clean)

    async def search_movies(self, query: str, page: int = 1) -> dict:
        return await self._get("/search/movie", {"query": query, "page": page})

    async def get_popular(self, region: str | None = None, page: int = 1) -> dict:
        return await self._get("/movie/popular", {"region": region, "page": page})

    async def get_genres(self) -> dict:
        return await self._get("/genre/movie/list")

    async def close(self):
        await self._client.aclose()


tmdb_client = TmdbClient()
