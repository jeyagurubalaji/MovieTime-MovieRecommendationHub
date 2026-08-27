import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { movieService, posterUrl } from '../services/movieService'
import MovieCard from '../components/MovieCard.jsx'
import FilterPanel from '../components/FilterPanel.jsx'
import { aiService } from '../services/aiService'

const TABS = [
  { key: 'ai', label: '✨ Describe It' },
  { key: 'title', label: 'Title' },
  { key: 'actor', label: 'Actor' },
  { key: 'director', label: 'Director' },
  { key: 'genre', label: 'Genre / Filters' },
]

function AiDescriptionSearch() {
  const [description, setDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!description.trim()) return
    setLoading(true)
    setSearched(true)
    try {
      const data = await aiService.searchByDescription(description)
      setResult(data)
    } catch {
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder='Try: "a funny sci-fi movie with time travel" or "something dark and moody like a heist gone wrong"'
          rows={3}
          style={{
            width: '100%', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
            padding: '14px 16px', color: 'var(--text)', fontSize: 14, resize: 'vertical', fontFamily: 'inherit',
          }}
        />
        <button type="submit" className="btn btn-primary" style={{ marginTop: 10 }} disabled={loading}>
          {loading ? 'Thinking…' : 'Find Movies'}
        </button>
      </form>

      {result && (
        <>
          <div className="card" style={{ padding: '14px 18px', marginBottom: 20, borderColor: 'var(--gold-dim)' }}>
            <span className="eyebrow">🤖 {result.ai_powered ? 'AI Interpreted' : 'Keyword Match'}</span>
            <p style={{ margin: '6px 0 0', fontSize: 14 }}>{result.explanation}</p>
          </div>

          {result.results.length === 0 ? (
            <p className="muted">Nothing matched — try describing it differently.</p>
          ) : (
            <div className="movie-row">
              {result.results.map((m) => <MovieCard key={m.id} movie={m} />)}
            </div>
          )}
        </>
      )}

      {!result && searched && !loading && (
        <p className="muted">Couldn't reach the AI service. Try the other search tabs instead.</p>
      )}
    </div>
  )
}

function PersonResults({ people, jobFilter }) {
  const [selected, setSelected] = useState(null)
  const [filmography, setFilmography] = useState([])
  const [loading, setLoading] = useState(false)

  const selectPerson = async (person) => {
    setSelected(person)
    setLoading(true)
    const details = await movieService.personDetails(person.id)
    let credits = details.movie_credits?.cast || []
    if (jobFilter) {
      credits = (details.movie_credits?.crew || []).filter((c) => c.job === jobFilter)
    }
    setFilmography(credits.sort((a, b) => (b.popularity || 0) - (a.popularity || 0)))
    setLoading(false)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 12, marginBottom: 20 }}>
        {people.map((p) => (
          <button
            key={p.id}
            onClick={() => selectPerson(p)}
            style={{
              flexShrink: 0, width: 110, textAlign: 'center', background: 'none', border: 'none', padding: 0,
              opacity: selected?.id === p.id ? 1 : 0.75,
            }}
          >
            <div className="card" style={{ overflow: 'hidden', aspectRatio: '2/3', borderColor: selected?.id === p.id ? 'var(--gold)' : undefined }}>
              {p.profile_path ? (
                <img src={posterUrl(p.profile_path, 'w185')} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>👤</div>
              )}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>{p.name}</div>
          </button>
        ))}
      </div>

      {selected && (
        <>
          <div className="section-heading"><h2>{selected.name}'s Movies</h2></div>
          {loading ? (
            <p className="muted">Loading filmography…</p>
          ) : filmography.length === 0 ? (
            <p className="muted">No {jobFilter ? jobFilter.toLowerCase() + ' credits' : 'movies'} found for this person.</p>
          ) : (
            <div className="movie-row">
              {filmography.slice(0, 18).map((m) => <MovieCard key={`${m.id}-${m.credit_id || m.job}`} movie={m} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default function Search() {
  const [activeTab, setActiveTab] = useState('title')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const [filters, setFilters] = useState({ sortBy: 'popularity.desc' })
  const [filterResults, setFilterResults] = useState([])
  const [filterLoading, setFilterLoading] = useState(false)

  const handleSearch = async (e) => {
    e?.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setSearched(true)
    if (activeTab === 'title') {
      const data = await movieService.searchMovies(query)
      setResults(data.results || [])
    } else if (activeTab === 'actor' || activeTab === 'director') {
      const data = await movieService.searchPeople(query)
      setPeople(data.results || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    if (activeTab !== 'genre') return
    setFilterLoading(true)
    movieService
      .filter(filters)
      .then((data) => setFilterResults(data.results || []))
      .finally(() => setFilterLoading(false))
  }, [activeTab, filters])

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">Discover</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>Smart Search</h1>
        </div>

        <div style={{ display: 'flex', gap: 10, margin: '24px 0 20px', borderBottom: '1px solid var(--border)', paddingBottom: 4 }}>
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => { setActiveTab(t.key); setSearched(false); setResults([]); setPeople([]) }}
              className={activeTab === t.key ? 'btn btn-primary' : 'btn btn-outline'}
              style={{ padding: '8px 16px', fontSize: 13 }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'ai' ? (
          <AiDescriptionSearch />
        ) : activeTab !== 'genre' ? (
          <>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  activeTab === 'title' ? 'Search by movie title…' :
                  activeTab === 'actor' ? 'Search by actor name…' : 'Search by director name…'
                }
                style={{
                  flex: 1, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8,
                  padding: '12px 16px', color: 'var(--text)', fontSize: 14,
                }}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>

            {loading && <p className="muted">Searching…</p>}

            {!loading && searched && activeTab === 'title' && results.length === 0 && (
              <p className="muted">No movies found for "{query}".</p>
            )}
            {!loading && activeTab === 'title' && results.length > 0 && (
              <div className="movie-row">
                {results.map((m) => <MovieCard key={m.id} movie={m} />)}
              </div>
            )}

            {!loading && searched && (activeTab === 'actor' || activeTab === 'director') && people.length === 0 && (
              <p className="muted">No people found for "{query}".</p>
            )}
            {!loading && (activeTab === 'actor' || activeTab === 'director') && people.length > 0 && (
              <PersonResults people={people} jobFilter={activeTab === 'director' ? 'Director' : null} />
            )}
          </>
        ) : (
          <>
            <FilterPanel filters={filters} onChange={setFilters} />
            <div className="section-heading"><h2>Results</h2></div>
            {filterLoading ? (
              <p className="muted">Loading…</p>
            ) : filterResults.length === 0 ? (
              <p className="muted">No movies match these filters.</p>
            ) : (
              <div className="movie-row">
                {filterResults.map((m) => <MovieCard key={m.id} movie={m} />)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
