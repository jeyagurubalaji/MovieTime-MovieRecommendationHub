import MovieCard from './MovieCard.jsx'

export default function MovieRow({ title, movies, loading, error }) {
  return (
    <section>
      <div className="section-heading">
        <h2>{title}</h2>
      </div>

      {error && <p className="muted">Couldn't load {title.toLowerCase()} right now.</p>}

      {loading ? (
        <div className="movie-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ aspectRatio: '2/3', borderRadius: 10 }} />
          ))}
        </div>
      ) : (
        <div className="movie-row">
          {movies?.slice(0, 12).map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  )
}
