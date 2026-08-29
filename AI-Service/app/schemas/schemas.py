from pydantic import BaseModel, Field


class MovieSummary(BaseModel):
    id: int
    title: str
    overview: str | None = None
    poster_path: str | None = None
    release_date: str | None = None
    vote_average: float | None = None


class DescriptionSearchRequest(BaseModel):
    description: str = Field(..., min_length=3, max_length=500,
                              examples=["a funny sci-fi movie with time travel"])
    page: int = 1


class DescriptionSearchResponse(BaseModel):
    interpreted_filters: dict
    explanation: str
    results: list[MovieSummary]
    ai_powered: bool


class MoodRequest(BaseModel):
    mood: str = Field(..., examples=["happy", "sad", "excited", "relaxed"])
    page: int = 1


class MoodResponse(BaseModel):
    mood: str
    message: str
    results: list[MovieSummary]


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    reply: str
    suggested_movies: list[MovieSummary] = []
    ai_powered: bool


class WhatToWatchRequest(BaseModel):
    mood: str | None = None
    time_available_minutes: int | None = None
    with_company: str | None = Field(default=None, examples=["alone", "partner", "family", "friends"])


class WhatToWatchResponse(BaseModel):
    pick: MovieSummary | None
    reason: str
    alternatives: list[MovieSummary]


class SummarizeResponse(BaseModel):
    movie_id: int
    title: str
    summary: str
    ai_powered: bool


class ReviewInput(BaseModel):
    rating: float
    text: str


class SpoilerFreeSummaryRequest(BaseModel):
    reviews: list[ReviewInput]


class SpoilerFreeSummaryResponse(BaseModel):
    summary: str
    review_count: int
    average_rating: float | None
    ai_powered: bool


class RecommendationResponse(BaseModel):
    source_movie_id: int
    reason: str
    results: list[MovieSummary]


class PersonalizedRequest(BaseModel):
    favorite_movie_ids: list[int] = []
    watched_movie_ids: list[int] = []
    recently_viewed_movie_ids: list[int] = []
    page: int = 1


class BecauseYouWatchedResponse(BaseModel):
    source_movie_id: int
    source_title: str
    results: list[MovieSummary]
