import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { GENRES } from '../constants/genres'
import { movieService } from '../services/movieService'
import MovieRow from '../components/MovieRow.jsx'

export default function Categories() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeGenreId = Number(searchParams.get('genre')) || GENRES[0].id
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    movieService
      .discoverByGenre(activeGenreId)
      .then((data) => setMovies(data.results || []))
      .finally(() => setLoading(false))
  }, [activeGenreId])

  const activeGenre = GENRES.find((g) => g.id === activeGenreId)

  return (
    <div className="page">
      <div className="container">
        <div style={{ padding: '32px 0 8px' }}>
          <span className="eyebrow">Browse</span>
          <h1 className="display" style={{ fontSize: 40, margin: '8px 0 0' }}>Categories</h1>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '24px 0 8px' }}>
          {GENRES.map((g) => (
            <button
              key={g.id}
              className={g.id === activeGenreId ? 'btn btn-primary' : 'btn btn-outline'}
              onClick={() => setSearchParams({ genre: g.id })}
            >
              {g.name}
            </button>
          ))}
        </div>

        <MovieRow title={activeGenre?.name || 'Movies'} movies={movies} loading={loading} />
      </div>
    </div>
  )
}
