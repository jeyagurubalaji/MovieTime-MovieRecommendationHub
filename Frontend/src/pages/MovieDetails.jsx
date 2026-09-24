import { useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { movieService, posterUrl, backdropUrl } from '../services/movieService'
import ReviewSection from '../components/ReviewSection.jsx'
import AiRecommendations from '../components/AiRecommendations.jsx'
import LibraryActions from '../components/LibraryActions.jsx'
import { aiService } from '../services/aiService'
import { libraryService } from '../services/libraryService'
import { useAuth } from '../context/AuthContext.jsx'

function formatRuntime(minutes) {
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

function formatMoney(amount) {
  if (!amount) return '—'
  return `$${amount.toLocaleString()}`
}

export default function MovieDetails() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const mediaType = searchParams.get('type') || 'movie'

  const { isAuthenticated } = useAuth()
  const [movie, setMovie] = useState(null)
  const [providers, setProviders] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [activeTrailer, setActiveTrailer] = useState(null)
  const [aiSummary, setAiSummary] = useState(null)

  useEffect(() => {
    setLoading(true)

    Promise.all([
      movieService.details(id, mediaType),
      movieService.watchProviders(id, mediaType).catch(() => null)
    ]).then(([movieData, providerData]) => {
      setMovie(movieData)

      if (providerData && providerData.results && providerData.results.IN) {
        setProviders(providerData.results.IN)
      } else {
        setProviders(null)
      }

      setLoading(false)
      if (isAuthenticated && movieData) {
        libraryService.trackRecentlyViewed(movieData, mediaType).catch(() => {})
      }
    }).catch(() => {
      setLoading(false)
    })

    setAiSummary({ loading: true })

    aiService.summarize(id, mediaType)
      .then((data) => {
        setAiSummary((prev) => {
          if (prev && prev.ai_powered && !data.ai_powered) {
            return prev
          }
          return data
        })
      })
      .catch(() => setAiSummary(null))
  }, [id, mediaType, isAuthenticated])

  if (loading) {
    return (
      <div className="page container">
        <div className="skeleton" style={{ height: 400, borderRadius: 12, marginTop: 24 }} />
      </div>
    )
  }

  if (!movie) return null

  // Safely extract crew, cast, and videos with optional chaining and array fallbacks
  const videoResults = movie.videos?.results || []
  const trailers = videoResults.filter(
    (v) => v && v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')
  )
  const officialTrailer = trailers.find((t) => t.type === 'Trailer') || trailers[0]

  const crewList = movie.credits?.crew || []
  const castList = movie.credits?.cast || []

  const creatorOrDirector = mediaType === 'tv'
    ? (movie.created_by?.[0] || crewList.find((c) => c.job === 'Creator'))
    : crewList.find((c) => c.job === 'Director')

  const writers = crewList.filter((c) => c.department === 'Writing').slice(0, 3)
  const producers = crewList.filter((c) => c.job === 'Producer').slice(0, 3)

  // Filter out actors that do not have a profile picture
  const mainCast = castList.filter((c) => c && c.profile_path)

  const displayTitle = movie.title || movie.name
  const displayDate = movie.release_date || movie.first_air_date
  const displayRuntime = movie.runtime || (movie.episode_run_time ? movie.episode_run_time[0] : null)

  return (
    <div className="page">
      <div
        style={{
          position: 'relative',
          height: 420,
          backgroundImage: movie.backdrop_path
            ? `linear-gradient(180deg, rgba(11,14,26,0.3), var(--bg) 92%), url(${backdropUrl(movie.backdrop_path)})`
            : 'linear-gradient(180deg, var(--surface-raised), var(--bg))',
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
        }}
      />

      <div className="container" style={{ marginTop: -220, position: 'relative' }}>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flexShrink: 0, width: 260 }}>
            {movie.poster_path && (
              <div className="card" style={{ overflow: 'hidden' }}>
                <img
                  src={posterUrl(movie.poster_path, 'w500')}
                  alt={displayTitle}
                  style={{ width: '100%', display: 'block' }}
                />
              </div>
            )}

            {officialTrailer && (
              <button
                className="btn btn-primary btn-block"
                style={{ marginTop: 14 }}
                onClick={() => {
                  setActiveTrailer(officialTrailer)
                  setShowTrailer(true)
                }}
              >
                ▶ Play Trailer
              </button>
            )}

            <LibraryActions movie={movie} />

            {providers && providers.flatrate && providers.flatrate.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>Streaming Now</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {providers.flatrate.map(provider => (
                    <img
                      key={provider.provider_id}
                      src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                      alt={provider.provider_name}
                      title={provider.provider_name}
                      style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: 280, paddingTop: 24 }}>
            <span className="eyebrow">{movie.genres?.map((g) => g.name).join(' · ')}</span>

            <h1 className="display" style={{ fontSize: 44, margin: '8px 0 12px' }}>
              {displayTitle}
            </h1>

            <div
              style={{
                display: 'flex',
                gap: 20,
                flexWrap: 'wrap',
                marginBottom: 20,
                fontSize: 14,
              }}
            >
              <span>
                ★ <strong>{movie.vote_average?.toFixed(1)}</strong>{' '}
                <span className="muted">({movie.vote_count?.toLocaleString()} votes)</span>
              </span>

              {mediaType === 'tv' && movie.number_of_seasons ? (
                <span className="muted">
                  {movie.number_of_seasons} Season{movie.number_of_seasons > 1 ? 's' : ''} • {movie.number_of_episodes} Episodes
                </span>
              ) : formatRuntime(displayRuntime) ? (
                <span className="muted">{formatRuntime(displayRuntime)}</span>
              ) : (
                <span className="muted">—</span>
              )}

              <span className="muted">{displayDate?.slice(0, 4)}</span>
              <span className="muted">{movie.original_language?.toUpperCase()}</span>
              {mediaType === 'tv' && movie.status && (
                <span className="muted">({movie.status})</span>
              )}
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 640 }}>{movie.overview}</p>

            {aiSummary && (aiSummary.ai_powered || aiSummary.loading) && (
              <div
                className="card"
                style={{
                  padding: 16,
                  marginTop: 16,
                  maxWidth: 640,
                  borderColor: 'var(--gold-dim)',
                }}
              >
                <span className="eyebrow">🤖 AI Take</span>
                <p style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  margin: '8px 0 0',
                  color: aiSummary.loading ? 'var(--gold-dim)' : 'inherit'
                }}>
                  {aiSummary.loading ? 'Analyzing plot themes...' : aiSummary.summary}
                </p>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: 16,
                marginTop: 28,
                maxWidth: 640,
              }}
            >
              {creatorOrDirector && (
                <div>
                  <div className="eyebrow">{mediaType === 'tv' ? 'Creator' : 'Director'}</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>{creatorOrDirector.name}</div>
                </div>
              )}

              {writers.length > 0 && (
                <div>
                  <div className="eyebrow">Writers</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>
                    {writers.map((w) => w.name).join(', ')}
                  </div>
                </div>
              )}

              {producers.length > 0 && (
                <div>
                  <div className="eyebrow">Producers</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>
                    {producers.map((p) => p.name).join(', ')}
                  </div>
                </div>
              )}

              {movie.budget > 0 && (
                <div>
                  <div className="eyebrow">Budget</div>
                  <div style={{ fontSize: 14, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    {formatMoney(movie.budget)}
                  </div>
                </div>
              )}

              {movie.revenue > 0 && (
                <div>
                  <div className="eyebrow">Revenue</div>
                  <div style={{ fontSize: 14, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    {formatMoney(movie.revenue)}
                  </div>
                </div>
              )}

              {mediaType === 'tv' && movie.networks?.length > 0 ? (
                <div>
                  <div className="eyebrow">Network</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>
                    {movie.networks[0].name}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="eyebrow">Production</div>
                  <div style={{ fontSize: 14, marginTop: 4 }}>
                    {movie.production_companies?.[0]?.name || '—'}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {mainCast.length > 0 && (
          <section style={{ marginTop: 48 }}>
            <div className="section-heading">
              <h2>Cast</h2>
            </div>

            <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
              {mainCast.map((actor) => (
                <Link
                  to={`/person/${actor.id}`}
                  key={actor.id}
                  style={{
                    flexShrink: 0,
                    width: 120,
                    textAlign: 'center',
                    textDecoration: 'none',
                    color: 'inherit'
                  }}
                >
                  <div className="card" style={{ overflow: 'hidden', aspectRatio: '2/3', cursor: 'pointer' }}>
                    <img
                      src={posterUrl(actor.profile_path, 'w185')}
                      alt={actor.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>

                  <div style={{ fontSize: 12, fontWeight: 600, marginTop: 6 }}>
                    {actor.name}
                  </div>

                  <div className="muted" style={{ fontSize: 11 }}>
                    {actor.character}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="film-strip-divider" style={{ margin: '48px 0' }} />

        <ReviewSection movieId={movie.id} />

        <div className="film-strip-divider" style={{ margin: '48px 0' }} />

        <AiRecommendations movieId={movie.id} />
      </div>

      {showTrailer && activeTrailer && (
        <div
          onClick={() => setShowTrailer(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.85)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 900 }}
          >
            <div style={{ position: 'relative', paddingTop: '56.25%' }}>
              <iframe
                src={`https://www.youtube.com/embed/${activeTrailer.key}?autoplay=1`}
                title={activeTrailer.name}
                allow="autoplay; encrypted-media"
                allowFullScreen
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  borderRadius: 8,
                }}
              />
            </div>

            {trailers.length > 1 && (
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  marginTop: 12,
                  flexWrap: 'wrap',
                }}
              >
                {trailers.map((t) => (
                  <button
                    key={t.key}
                    className="btn btn-outline"
                    style={{ fontSize: 12, padding: '6px 12px' }}
                    onClick={() => setActiveTrailer(t)}
                  >
                    {t.type}: {t.name.slice(0, 24)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}