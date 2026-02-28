import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { tmdb, backdrop, fmtYear } from '../api/tmdb'
import { useGenres } from '../context/GenreContext'

export default function Hero() {
  const [movies,  setMovies]  = useState([])
  const [idx,     setIdx]     = useState(0)
  const [visible, setVisible] = useState(false)
  const genres   = useGenres()
  const navigate = useNavigate()

  useEffect(() => {
    tmdb('trending/movie/week')
      .then(d => {
        setMovies(d.results.filter(m => m.backdrop_path).slice(0, 7))
        setTimeout(() => setVisible(true), 150)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!movies.length) return
    const t = setInterval(() => {
      setVisible(false)
      setTimeout(() => setIdx(i => (i + 1) % movies.length), 300)
      setTimeout(() => setVisible(true), 400)
    }, 8000)
    return () => clearInterval(t)
  }, [movies])

  const go = useCallback((i) => {
    setVisible(false)
    setTimeout(() => { setIdx(i); setVisible(true) }, 300)
  }, [])

  if (!movies.length) return <div className="hero-skeleton" />

  const m = movies[idx]

  return (
    <section className="hero">
      {/* Backdrop */}
      <div
        className="hero-backdrop"
        style={{ backgroundImage: `url(${backdrop(m.backdrop_path, 'original')})` }}
      />
      <div className="hero-grad" />

      {/* Content */}
      <div className={`hero-content${visible ? ' visible' : ''}`}>
        <span className="hero-badge">
          <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          Trending #{idx + 1}
        </span>

        <h1 className="hero-title">{m.title}</h1>

        <div className="hero-meta-row">
          <span className="hero-rating">★ {m.vote_average?.toFixed(1)}</span>
          <span className="hero-sep">•</span>
          <span>{fmtYear(m.release_date)}</span>
          {(m.genre_ids || []).slice(0, 2).map(id => genres[id]).filter(Boolean).map(g => (
            <span key={g}><span className="hero-sep">•</span>{g}</span>
          ))}
        </div>

        <p className="hero-overview">{m.overview}</p>

        <div className="hero-btns">
          <button className="btn-primary" onClick={() => navigate(`/movie/${m.id}`)}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <polygon points="5,3 19,12 5,21" />
            </svg>
            Watch Trailer
          </button>
          <button className="btn-ghost" onClick={() => navigate(`/movie/${m.id}`)}>
            More Info
          </button>
        </div>
      </div>

      {/* Slide dots */}
      <div className="hero-dots">
        {movies.map((_, i) => (
          <button
            key={i}
            className={`hero-dot-btn${i === idx ? ' active' : ''}`}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Scroll hint */}
      <div className="hero-scroll-hint">
        <span>Scroll</span>
        <div className="scroll-mouse"><div className="scroll-wheel" /></div>
      </div>
    </section>
  )
}
