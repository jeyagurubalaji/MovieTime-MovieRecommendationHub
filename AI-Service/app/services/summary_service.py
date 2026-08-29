import logging

from app.services import llm_client
from app.services.tmdb_client import tmdb_client

logger = logging.getLogger(__name__)

SUMMARY_SYSTEM_PROMPT = """You write short, punchy, original movie summaries for a movie discovery app. \
Given a movie's title and official synopsis, write a fresh 2-3 sentence summary in your own words that \
captures the hook and tone WITHOUT copying the original synopsis's exact phrasing. Do not include spoilers \
beyond what's in the given synopsis. No preamble - output only the summary."""

SPOILER_FREE_SYSTEM_PROMPT = """You summarize a batch of user reviews for a movie into a short, spoiler-free \
overview (3-4 sentences) of what viewers generally think - tone, standout elements (acting, pacing, \
visuals, etc.), and overall reception. Do not mention specific plot points, twists, or endings. Do not quote \
reviews verbatim - synthesize in your own words. No preamble - output only the summary."""


async def generate_movie_summary(movie_id: int) -> dict:
    movie = await tmdb_client.get_movie(movie_id)
    title = movie.get("title", "")
    overview = movie.get("overview", "")

    if not llm_client.is_available():
        return {
            "movie_id": movie_id,
            "title": title,
            "summary": overview or "No synopsis available.",
            "ai_powered": False,
        }

    try:
        summary = await llm_client.complete(
            system=SUMMARY_SYSTEM_PROMPT,
            user_message=f"Title: {title}\nOfficial synopsis: {overview}",
            max_tokens=200,
        )
        return {"movie_id": movie_id, "title": title, "summary": summary.strip(), "ai_powered": True}
    except Exception as e:
        logger.warning("AI summary generation failed, falling back to original overview: %s", e)
        return {"movie_id": movie_id, "title": title, "summary": overview or "No synopsis available.",
                 "ai_powered": False}


async def generate_spoiler_free_summary(reviews: list[dict]) -> dict:
    review_count = len(reviews)
    ratings = [r["rating"] for r in reviews if r.get("rating") is not None]
    avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else None

    if review_count == 0:
        return {
            "summary": "No reviews yet - be the first to share your thoughts.",
            "review_count": 0,
            "average_rating": None,
            "ai_powered": False,
        }

    if not llm_client.is_available():
        return {
            "summary": f"{review_count} review(s) so far, averaging {avg_rating}/10. "
                       f"Enable the AI service to get a synthesized, spoiler-free overview.",
            "review_count": review_count,
            "average_rating": avg_rating,
            "ai_powered": False,
        }

    try:
        review_text = "\n---\n".join(f"Rating: {r.get('rating', 'N/A')}/10\n{r['text']}" for r in reviews[:30])
        summary = await llm_client.complete(
            system=SPOILER_FREE_SYSTEM_PROMPT,
            user_message=review_text,
            max_tokens=250,
        )
        return {
            "summary": summary.strip(),
            "review_count": review_count,
            "average_rating": avg_rating,
            "ai_powered": True,
        }
    except Exception as e:
        logger.warning("Spoiler-free summary generation failed: %s", e)
        return {
            "summary": f"{review_count} review(s) so far, averaging {avg_rating}/10.",
            "review_count": review_count,
            "average_rating": avg_rating,
            "ai_powered": False,
        }
