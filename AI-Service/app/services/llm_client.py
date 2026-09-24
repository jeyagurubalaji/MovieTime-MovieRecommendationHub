import json
import logging
import os
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()
logger = logging.getLogger(__name__)

api_key = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=api_key) if api_key else None

GROQ_MODEL = "openai/gpt-oss-20b"

class LlmUnavailableError(Exception):
    """Raised when an LLM-backed feature is called but the client is missing."""

def is_available() -> bool:
    return client is not None

async def complete(system: str, user_message: str, max_tokens: int = 700) -> str:
    try:
        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_message}
            ],
            model=GROQ_MODEL,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content or ""
    except Exception as e:
        logger.error("Groq completion error: %s", e)
        return '{"reply": "I am experiencing high traffic right now. Let us talk about another movie!", "movie_titles": []}'

async def complete_json(system: str, user_message: str, max_tokens: int = 500) -> dict:
    try:
        response = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system + "\n\nRespond with ONLY valid JSON."},
                {"role": "user", "content": user_message}
            ],
            model=GROQ_MODEL,
            max_tokens=max_tokens,
            response_format={"type": "json_object"}
        )
        text = response.choices[0].message.content or "{}"
        return json.loads(text)
    except Exception as e:
        logger.error("Groq JSON parsing error: %s", e)
        return {"reply": "Sorry, an error occurred while processing data.", "movie_titles": []}

async def chat(system: str, history: list[dict], max_tokens: int = 700) -> str:
    # Append a strict JSON instruction to the system prompt
    messages = [{"role": "system", "content": system + "\n\nRespond with ONLY valid JSON."}] + history
    try:
        response = await client.chat.completions.create(
            messages=messages,
            model=GROQ_MODEL,
            max_tokens=max_tokens,
            response_format={"type": "json_object"}
        )
        return response.choices[0].message.content or "{}"
    except Exception as e:
        logger.error("Groq chat error: %s", e)
        return '{"reply": "Sorry, I hit a temporary traffic snag. Try asking me about a different movie or genre!", "movie_titles": []}'