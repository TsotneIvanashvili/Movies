import { useNavigate } from 'react-router-dom'
import { poster, fmtYear } from '../api/tmdb'
import { useGenres } from '../context/GenreContext'

export default function MovieCard({ movie }) {
  const navigate = useNavigate()
  const genres   = useGenres()

  const genreNames = (movie.genre_ids || [])
    .slice(0, 3)
    .map(id => genres[id])
    .filter(Boolean)

  const rating = movie.vote_average?.toFixed(1)

  return (
    <article
      className="movie-card"
      onClick={() => navigate(`/movie/${movie.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/movie/${movie.id}`)}
      aria-label={`${movie.title} (${fmtYear(movie.release_date)})`}
    >
      {/* Poster image area */}
      <div className="card-img-wrap">
        {poster(movie.poster_path) ? (
          <img
            className="card-img"
            src={poster(movie.poster_path, 'w342')}
            alt={movie.title}
            loading="lazy"
          />
        ) : (
          <div className="card-no-img">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
              <rect x="2" y="2" width="20" height="20" rx="3"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </div>
        )}

        {/* Rating badge (always visible) */}
        <div className="card-badge">★ {rating}</div>

        {/* Hover overlay */}
        <div className="card-overlay">
          <div className="overlay-top">
            <div className="overlay-play">
              <svg viewBox="0 0 24 24" fill="white" width="22" height="22">
                <polygon points="5,3 19,12 5,21" />
              </svg>
            </div>
          </div>

          <div className="overlay-body">
            <h3 className="overlay-title">{movie.title}</h3>

            <div className="overlay-meta-row">
              <span className="overlay-rating">★ {rating}</span>
              <span className="overlay-year">{fmtYear(movie.release_date)}</span>
            </div>

            {genreNames.length > 0 && (
              <div className="overlay-genres">
                {genreNames.map(g => (
                  <span key={g} className="overlay-genre-tag">{g}</span>
                ))}
              </div>
            )}

            {movie.overview && (
              <p className="overlay-overview">{movie.overview}</p>
            )}

            <div className="overlay-cta">
              View Details
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12,5 19,12 12,19"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Card footer — always visible */}
      <div className="card-foot">
        <p className="card-foot-title">{movie.title}</p>
        <p className="card-foot-sub">
          <span className="card-foot-rating">★ {rating}</span>
          {fmtYear(movie.release_date) && <span className="card-foot-year">{fmtYear(movie.release_date)}</span>}
        </p>
      </div>
    </article>
  )
}
