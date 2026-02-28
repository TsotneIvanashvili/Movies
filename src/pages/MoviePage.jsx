import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tmdb, backdrop, poster, profile, fmtDate, fmtYear, fmtRuntime } from '../api/tmdb'
import MovieRow from '../components/MovieRow'

export default function MoviePage() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const [movie,   setMovie]   = useState(null)
  const [videos,  setVideos]  = useState([])
  const [cast,    setCast]    = useState([])
  const [crew,    setCrew]    = useState([])
  const [loading, setLoading] = useState(true)
  const [trailerModal, setTrailerModal] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setLoading(true)
    setMovie(null)
    setVideos([])
    setCast([])

    Promise.all([
      tmdb(`movie/${id}`),
      tmdb(`movie/${id}/videos`),
      tmdb(`movie/${id}/credits`),
    ])
      .then(([details, vids, creds]) => {
        setMovie(details)
        setVideos(vids.results || [])
        setCast((creds.cast || []).slice(0, 16))
        setCrew((creds.crew || []).filter(c => ['Director', 'Producer', 'Screenplay', 'Writer'].includes(c.job)).slice(0, 6))
        document.title = `${details.title} — CineVerse`
        setLoading(false)
      })
      .catch(() => setLoading(false))

    return () => { document.title = 'CineVerse' }
  }, [id])

  const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube')
    || videos.find(v => v.site === 'YouTube')

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Loading movie...</p>
      </div>
    )
  }

  if (!movie) {
    return (
      <div className="page-error">
        <h2>Movie not found</h2>
        <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  const director = crew.find(c => c.job === 'Director')

  return (
    <div className="movie-page">

      {/* ── BACKDROP HERO ── */}
      <div
        className="mp-hero"
        style={{ backgroundImage: backdrop(movie.backdrop_path, 'original') ? `url(${backdrop(movie.backdrop_path, 'original')})` : 'none' }}
      >
        <div className="mp-hero-grad" />
        <button className="mp-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
      </div>

      {/* ── MAIN INFO SECTION ── */}
      <div className="mp-main">
        {/* Poster */}
        <div className="mp-poster-col">
          <img
            className="mp-poster"
            src={poster(movie.poster_path, 'w500')}
            alt={movie.title}
          />
          {trailer && (
            <button className="mp-watch-btn" onClick={() => setTrailerModal(true)}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              Watch Trailer
            </button>
          )}
          {!trailer && (
            <div className="mp-no-trailer">No trailer available</div>
          )}
        </div>

        {/* Details */}
        <div className="mp-details-col">
          {/* Genres */}
          <div className="mp-genres">
            {movie.genres?.map(g => (
              <span key={g.id} className="mp-genre-tag">{g.name}</span>
            ))}
          </div>

          <h1 className="mp-title">{movie.title}</h1>
          {movie.original_title && movie.original_title !== movie.title && (
            <p className="mp-original-title">{movie.original_title}</p>
          )}
          {movie.tagline && <p className="mp-tagline">"{movie.tagline}"</p>}

          {/* Meta row */}
          <div className="mp-meta-row">
            <div className="mp-score">
              <svg viewBox="0 0 24 24" fill="#f5c518" width="18" height="18">
                <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
              </svg>
              <span className="mp-score-val">{movie.vote_average?.toFixed(1)}</span>
              <span className="mp-vote-count">/ 10 · {movie.vote_count?.toLocaleString()} votes</span>
            </div>
            <div className="mp-meta-pills">
              {fmtDate(movie.release_date) && <span className="mp-pill">{fmtDate(movie.release_date)}</span>}
              {movie.runtime > 0 && <span className="mp-pill">{fmtRuntime(movie.runtime)}</span>}
              {movie.status && <span className={`mp-pill mp-status ${movie.status === 'Released' ? 'released' : ''}`}>{movie.status}</span>}
            </div>
          </div>

          {/* Overview */}
          <div className="mp-section-label">Overview</div>
          <p className="mp-overview">{movie.overview || 'No description available.'}</p>

          {/* Crew */}
          {crew.length > 0 && (
            <div className="mp-crew">
              {director && (
                <div className="mp-crew-item">
                  <span className="mp-crew-role">Director</span>
                  <span className="mp-crew-name">{director.name}</span>
                </div>
              )}
              {crew.filter(c => c.job !== 'Director').slice(0, 3).map(c => (
                <div key={`${c.id}-${c.job}`} className="mp-crew-item">
                  <span className="mp-crew-role">{c.job}</span>
                  <span className="mp-crew-name">{c.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Extra facts */}
          <div className="mp-facts">
            {movie.budget > 0 && (
              <div className="mp-fact">
                <span className="mp-fact-label">Budget</span>
                <span>${movie.budget.toLocaleString()}</span>
              </div>
            )}
            {movie.revenue > 0 && (
              <div className="mp-fact">
                <span className="mp-fact-label">Revenue</span>
                <span>${movie.revenue.toLocaleString()}</span>
              </div>
            )}
            {movie.original_language && (
              <div className="mp-fact">
                <span className="mp-fact-label">Language</span>
                <span>{movie.original_language.toUpperCase()}</span>
              </div>
            )}
            {movie.production_countries?.length > 0 && (
              <div className="mp-fact">
                <span className="mp-fact-label">Country</span>
                <span>{movie.production_countries.map(c => c.name).join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── EMBEDDED TRAILER ── */}
      {trailer && (
        <div className="mp-trailer-wrap">
          <h2 className="mp-section-title">Official Trailer</h2>
          <div className="mp-embed">
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?rel=0&modestbranding=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={`${movie.title} — Trailer`}
            />
          </div>
        </div>
      )}

      {/* ── CAST ── */}
      {cast.length > 0 && (
        <div className="mp-cast-wrap">
          <h2 className="mp-section-title">Cast</h2>
          <div className="cast-track">
            {cast.map(c => (
              <div key={`${c.id}-${c.character}`} className="cast-card">
                <div className="cast-photo-wrap">
                  {profile(c.profile_path) ? (
                    <img
                      className="cast-photo"
                      src={profile(c.profile_path, 'w185')}
                      alt={c.name}
                    />
                  ) : (
                    <div className="cast-no-photo">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="28" height="28">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M20 21a8 8 0 10-16 0"/>
                      </svg>
                    </div>
                  )}
                </div>
                <p className="cast-name">{c.name}</p>
                <p className="cast-char">{c.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SIMILAR / RECOMMENDED ── */}
      <div className="mp-more">
        <MovieRow
          title="Similar Movies"
          tag="You May Also Like"
          endpoint={`movie/${id}/similar`}
        />
        <MovieRow
          title="Recommended"
          tag="Based on This Movie"
          endpoint={`movie/${id}/recommendations`}
        />
      </div>

      {/* ── TRAILER MODAL ── */}
      {trailerModal && trailer && (
        <div className="trailer-modal-overlay" onClick={() => setTrailerModal(false)}>
          <div className="trailer-modal-box" onClick={e => e.stopPropagation()}>
            <button className="trailer-modal-close" onClick={() => setTrailerModal(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <div className="mp-embed">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title="Trailer"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
