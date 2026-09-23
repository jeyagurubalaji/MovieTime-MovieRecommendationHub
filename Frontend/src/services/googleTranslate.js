import { SOURCE_LANGUAGE } from '../data/languages'

const CACHE_PREFIX = 'gt_cache::'
const CONCURRENCY = 4
const BACKEND_TRANSLATE_URL = 'http://localhost:8000/ai/translate'

const memoryCache = new Map()

function getLangCache(targetLang) {
  if (memoryCache.has(targetLang)) return memoryCache.get(targetLang)
  let stored = {}
  try {
    stored = JSON.parse(localStorage.getItem(CACHE_PREFIX + targetLang) || '{}')
  } catch {
    stored = {}
  }
  memoryCache.set(targetLang, stored)
  return stored
}

function persistLangCache(targetLang, cache) {
  try {
    localStorage.setItem(CACHE_PREFIX + targetLang, JSON.stringify(cache))
  } catch {}
}

async function translateOne(text, targetLang, sourceLang = 'auto') {
  try {
    const response = await fetch('http://localhost:8000/ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        target_language: targetLang,
        source_language: sourceLang
      }),
    });

    if (!response.ok) throw new Error('Translation backend failed');

    const data = await response.json();
    // Maps to the "translation" key returned by your FastAPI endpoint
    return data.translation || text;
  } catch (err) {
    console.warn('[Translation API Error]:', err);
    return text; // Fallback to English UI on failure
  }
}

async function runWithConcurrency(items, worker, concurrency) {
  const results = new Array(items.length)
  let cursor = 0
  async function runNext() {
    while (cursor < items.length) {
      const index = cursor++
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runNext))
  return results
}

export async function translateBatch(texts, targetLang, sourceLang = SOURCE_LANGUAGE) {
  const result = new Map()
  if (targetLang === sourceLang) {
    texts.forEach((t) => result.set(t, t))
    return result
  }

  const cache = getLangCache(targetLang)
  const unique = [...new Set(texts.filter((t) => t && t.trim()))]
  const toFetch = unique.filter((t) => !(t in cache))

  unique.forEach((t) => {
    if (t in cache) result.set(t, cache[t])
  })

  if (toFetch.length === 0) return result

  await runWithConcurrency(
    toFetch,
    async (text) => {
      try {
        const translated = await translateOne(text, targetLang, sourceLang)
        cache[text] = translated
        result.set(text, translated)
      } catch (err) {
        result.set(text, text)
      }
    },
    CONCURRENCY
  )

  persistLangCache(targetLang, cache)
  return result
}