import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { movieService, posterUrl } from '../services/movieService'

export default function PersonDetails() {
  const { id } = useParams()
  const [person, setPerson] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    movieService.personDetails(id)
      .then((data) => {
        setPerson(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="page container">
        <div className="skeleton" style={{ height: 400, borderRadius: 12, marginTop: 24 }} />
      </div>
    )
  }

  if (!person) {
    return (
      <div className="page container" style={{ paddingTop: 32 }}>
        <p>Person details not found.</p>
      </div>
    )
  }

  const rawCredits = person.combined_credits?.cast || person.credits?.cast || []

  // 1. Filter out talk shows, self-appearances, and missing poster items
  const filtered = rawCredits.filter((item) => {
    if (!item.poster_path) return false

    const character = (item.character || '').toLowerCase()
    const title = (item.title || item.name || '').toLowerCase()

    const isSelf =
      character.includes('self') ||
      character.includes('himself') ||
      character.includes('herself') ||
      character.includes('guest') ||
      character.includes('interviewee') ||
      character.includes('host') ||
      character.includes('uncredited')

    const isTalkShow =
      title.includes('tonight show') ||
      title.includes('late show') ||
      title.includes('late night') ||
      title.includes('kelly clarkson') ||
      title.includes('jimmy kimmel') ||
      title.includes('graham norton') ||
      title.includes('live with kelly') ||
      title.includes('today show') ||
      title.includes('good morning america')

    return !isSelf && !isTalkShow
  })

  // 2. Deduplicate titles by unique ID or Name so duplicate cards like Law & Order don't repeat
  const seenKeys = new Set()
  const credits = []

  for (const item of filtered) {
    const title = (item.title || item.name || '').trim().toLowerCase()
    const type = item.media_type || (item.first_air_date ? 'tv' : 'movie')
    const key = `${item.id}-${type}`
    const titleKey = `${title}-${type}`

    if (!seenKeys.has(key) && !seenKeys.has(titleKey)) {
      seenKeys.add(key)
      seenKeys.add(titleKey)
      credits.push(item)
    }
  }

  // 3. Sort by popularity
  credits.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))

  return (
    <div className="page container" style={{ paddingTop: 32, paddingBottom: 48 }}>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {/* Profile Picture & Metadata */}
        <div style={{ flexShrink: 0, width: 240 }}>
          {person.profile_path && (
            <div className="card" style={{ overflow: 'hidden' }}>
              <img
                src={posterUrl(person.profile_path, 'w500')}
                alt={person.name}
                style={{ width: '100%', display: 'block' }}
              />
            </div>
          )}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {person.known_for_department && (
              <p className="muted" style={{ fontSize: 14 }}>Known For: {person.known_for_department}</p>
            )}
            {person.birthday && (
              <p className="muted" style={{ fontSize: 14 }}>Born: {person.birthday}</p>
            )}
            {person.place_of_birth && (
              <p className="muted" style={{ fontSize: 14 }}>Place of Birth: {person.place_of_birth}</p>
            )}
          </div>
        </div>

        {/* Biography & Movies/Shows Grid */}
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 className="display" style={{ fontSize: 40, marginBottom: 16 }}>{person.name}</h1>
          {person.biography && (
            <p style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 720, marginBottom: 32 }}>
              {person.biography}
            </p>
          )}

          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Known For ({credits.length})</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 16
          }}>
            {credits.map((item) => {
              const title = item.title || item.name
              const date = item.release_date || item.first_air_date
              const type = item.media_type || (item.first_air_date ? 'tv' : 'movie')

              return (
                <Link
                  to={`/movie/${item.id}?type=${type}`}
                  key={`${item.id}-${type}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="card" style={{ overflow: 'hidden', aspectRatio: '2/3' }}>
                    <img
                      src={posterUrl(item.poster_path, 'w342')}
                      alt={title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6, lineHeight: 1.3 }}>
                    {title}
                  </div>
                  {item.character && (
                    <div className="muted" style={{ fontSize: 11 }}>as {item.character}</div>
                  )}
                  {date && (
                    <div className="muted" style={{ fontSize: 11 }}>{date.slice(0, 4)}</div>
                  )}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}