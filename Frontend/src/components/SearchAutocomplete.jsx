import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { movieService, posterUrl } from '../services/movieService'

export default function SearchAutocomplete() {
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState([])
  const [people, setPeople] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const wrapperRef = useRef(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search effect
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setMovies([])
      setPeople([])
      setIsOpen(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(() => {
      Promise.all([
        movieService.searchMovies(query, 1).catch(() => ({ results: [] })),
        movieService.searchPeople(query, 1).catch(() => ({ results: [] }))
      ]).then(([movieRes, peopleRes]) => {
        setMovies(movieRes.results?.slice(0, 4) || [])
        setPeople(peopleRes.results?.slice(0, 3) || [])
        setLoading(false)
        setIsOpen(true)
      })
    }, 300) // 300ms debounce

    return () => clearTimeout(timer)
  }, [query])

  const handleSelectMovie = (id) => {
    setIsOpen(false)
    setQuery('')
    navigate(`/movie/${id}`)
  }

  const handleSelectPerson = (id) => {
    setIsOpen(false)
    setQuery('')
    navigate(`/person/${id}`)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      setIsOpen(false)
      navigate(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <div ref={wrapperRef} style={{ position: 'relative', width: '240px', maxWidth: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true)
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search movies, actors..."
          style={{
            width: '100%',
            padding: '6px 12px 6px 32px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            background: 'var(--surface-raised)',
            color: 'var(--text)',
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
        />
        <span style={{ position: 'absolute', left: '10px', fontSize: '12px', opacity: 0.6 }}>
          🔍
        </span>
      </div>

      {isOpen && (movies.length > 0 || people.length > 0 || loading) && (
        <div
          className="card"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 1000,
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px 0'
          }}
        >
          {loading && (
            <div style={{ padding: '10px 16px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Searching...
            </div>
          )}

          {!loading && movies.length > 0 && (
            <div>
              <div className="eyebrow" style={{ padding: '4px 16px', fontSize: '10px', opacity: 0.7 }}>
                Movies & Shows
              </div>
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  onClick={() => handleSelectMovie(movie.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-raised)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <img
                    src={posterUrl(movie.poster_path, 'w92') || 'https://via.placeholder.com/32x48'}
                    alt={movie.title || movie.name}
                    style={{ width: '28px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.title || movie.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {(movie.release_date || movie.first_air_date || '').slice(0, 4)} ★ {movie.vote_average?.toFixed(1) || 'N/A'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && people.length > 0 && (
            <div style={{ marginTop: movies.length > 0 ? '6px' : 0, borderTop: movies.length > 0 ? '1px solid var(--border)' : 'none', paddingTop: movies.length > 0 ? '6px' : 0 }}>
              <div className="eyebrow" style={{ padding: '4px 16px', fontSize: '10px', opacity: 0.7 }}>
                Actors & Directors
              </div>
              {people.map((person) => (
                <div
                  key={person.id}
                  onClick={() => handleSelectPerson(person.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 16px',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-raised)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <img
                    src={posterUrl(person.profile_path, 'w92') || 'https://via.placeholder.com/32x32'}
                    alt={person.name}
                    style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '50%' }}
                  />
                  <div style={{ overflow: 'hidden' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {person.name}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {person.known_for_department || 'Artist'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}