import { useEffect, useState } from 'react'
import MovieRow from './MovieRow.jsx'
import { recommendationService } from '../services/aiService'

export default function AiRecommendations({ movieId }) {
  const [rows, setRows] = useState({
    becauseYouWatched: { title: null, movies: [], loading: true },
    sameDirector: { title: 'More From the Director', movies: [], loading: true },
    sameActor: { title: 'More With the Lead Actor', movies: [], loading: true },
    sameGenre: { title: 'More Like This', movies: [], loading: true },
  })

  useEffect(() => {
    setRows((r) => ({
      becauseYouWatched: { ...r.becauseYouWatched, loading: true },
      sameDirector: { ...r.sameDirector, loading: true },
      sameActor: { ...r.sameActor, loading: true },
      sameGenre: { ...r.sameGenre, loading: true },
    }))

    recommendationService
      .becauseYouWatched(movieId)
      .then((data) =>
        setRows((r) => ({
          ...r,
          becauseYouWatched: {
            title: `Because You Watched "${data.source_title}"`,
            movies: data.results,
            loading: false,
          },
        }))
      )
      .catch(() => setRows((r) => ({ ...r, becauseYouWatched: { ...r.becauseYouWatched, loading: false } })))

    recommendationService
      .sameDirector(movieId)
      .then((data) =>
        setRows((r) => ({ ...r, sameDirector: { title: data.reason, movies: data.results, loading: false } }))
      )
      .catch(() => setRows((r) => ({ ...r, sameDirector: { ...r.sameDirector, loading: false } })))

    recommendationService
      .sameActor(movieId)
      .then((data) =>
        setRows((r) => ({ ...r, sameActor: { title: data.reason, movies: data.results, loading: false } }))
      )
      .catch(() => setRows((r) => ({ ...r, sameActor: { ...r.sameActor, loading: false } })))

    recommendationService
      .sameGenre(movieId)
      .then((data) =>
        setRows((r) => ({ ...r, sameGenre: { title: data.reason, movies: data.results, loading: false } }))
      )
      .catch(() => setRows((r) => ({ ...r, sameGenre: { ...r.sameGenre, loading: false } })))
  }, [movieId])

  const visibleRows = Object.values(rows).filter((r) => r.loading || r.movies.length > 0)

  if (visibleRows.length === 0) return null

  return (
    <div style={{ marginTop: 20 }}>
      {visibleRows.map((row, i) => (
        <MovieRow key={i} title={row.title || 'Recommended'} movies={row.movies} loading={row.loading} />
      ))}
    </div>
  )
}
