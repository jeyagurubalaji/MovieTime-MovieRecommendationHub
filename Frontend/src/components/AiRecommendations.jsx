import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import MovieRow from './MovieRow.jsx'
import { recommendationService } from '../services/aiService'
import { movieService } from '../services/movieService'

const EXCLUDED_GENRES = [10767, 10763, 10764, 99];

// GLOBAL SORT: Forces the newest released movies/shows to the very front
const sortByNewest = (a, b) => {
  const dateA = new Date(a.release_date || a.first_air_date || '1970-01-01');
  const dateB = new Date(b.release_date || b.first_air_date || '1970-01-01');
  if (dateB.getTime() === dateA.getTime()) {
    return (b.popularity || 0) - (a.popularity || 0); // Fallback to popularity if released same day
  }
  return dateB - dateA;
};

export default function AiRecommendations({ movieId }) {
  const [searchParams] = useSearchParams()
  const mediaType = searchParams.get('type') || 'movie'

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
      .becauseYouWatched(movieId, mediaType)
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

    movieService.details(movieId, mediaType).then(movieData => {

      const director = mediaType === 'tv'
        ? (movieData.created_by?.[0] || movieData.credits?.crew?.find(c => c.job === 'Creator' || c.job === 'Series Director'))
        : movieData.credits?.crew?.find((c) => c.job === 'Director');

      if (director) {
        movieService.personDetails(director.id).then(personData => {
          const credits = (personData.combined_credits?.crew || [])
            .filter(c => c.id !== Number(movieId))
            .filter(c => c.job === 'Director' || c.job === 'Creator' || c.job === 'Series Director' || c.department === 'Directing')
            .filter(c => !(c.genre_ids && c.genre_ids.some(id => EXCLUDED_GENRES.includes(id))));

          const uniqueCredits = Array.from(new Map(credits.map(c => [c.id, c])).values());
          const sortedCredits = uniqueCredits.sort(sortByNewest).slice(0, 20);

          setRows((r) => ({ ...r, sameDirector: { title: `MORE FROM ${director.name.toUpperCase()}`, movies: sortedCredits, loading: false } }))
        }).catch(() => setRows((r) => ({ ...r, sameDirector: { ...r.sameDirector, loading: false } })));
      } else {
        setRows((r) => ({ ...r, sameDirector: { ...r.sameDirector, loading: false } }))
      }

      const leadActor = movieData.credits?.cast?.[0];
      if (leadActor) {
        movieService.personDetails(leadActor.id).then(personData => {
          const credits = (personData.combined_credits?.cast || [])
            .filter(c => c.id !== Number(movieId))
            .filter(c => !(c.genre_ids && c.genre_ids.some(id => EXCLUDED_GENRES.includes(id))))
            .filter(c => {
              const charName = (c.character || '').toLowerCase();
              return !charName.includes('self') &&
                     !charName.includes('himself') &&
                     !charName.includes('herself') &&
                     !charName.includes('guest');
            });

          const uniqueCredits = Array.from(new Map(credits.map(c => [c.id, c])).values());
          const sortedCredits = uniqueCredits.sort(sortByNewest).slice(0, 20);

          setRows((r) => ({ ...r, sameActor: { title: `MORE WITH ${leadActor.name.toUpperCase()}`, movies: sortedCredits, loading: false } }))
        }).catch(() => setRows((r) => ({ ...r, sameActor: { ...r.sameActor, loading: false } })));
      } else {
        setRows((r) => ({ ...r, sameActor: { ...r.sameActor, loading: false } }))
      }
    }).catch(() => {
      setRows((r) => ({
        ...r,
        sameDirector: { ...r.sameDirector, loading: false },
        sameActor: { ...r.sameActor, loading: false }
      }))
    })

    recommendationService
      .sameGenre(movieId, mediaType)
      .then((data) =>
        setRows((r) => ({ ...r, sameGenre: { title: data.reason, movies: data.results, loading: false } }))
      )
      .catch(() => setRows((r) => ({ ...r, sameGenre: { ...r.sameGenre, loading: false } })))
  }, [movieId, mediaType])

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