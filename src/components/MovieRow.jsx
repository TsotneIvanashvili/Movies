import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { tmdb } from '../api/tmdb'
import MovieCard from './MovieCard'
import { useReveal } from '../hooks/useReveal'

function SkeletonCard() {
  return <div className="card-skeleton" />
}

export default function MovieRow({ title, tag, endpoint, params = {}, seeAllPath }) {
  const [movies,  setMovies]  = useState([])
  const [loading, setLoading] = useState(true)
  const trackRef = useRef(null)
  const navigate = useNavigate()
  const sectionRef = useReveal()

  useEffect(() => {
    setLoading(true)
    tmdb(endpoint, params)
      .then(d => { setMovies(d.results || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [endpoint])

  const scroll = (dir) => trackRef.current?.scrollBy({ left: dir * 720, behavior: 'smooth' })

  return (
    <section ref={sectionRef} className="row-section reveal">
      <div className="row-header">
        <div>
          {tag && <span className="row-tag">{tag}</span>}
          <h2 className="row-title">{title}</h2>
        </div>
        {seeAllPath && (
          <button className="see-all-btn" onClick={() => navigate(seeAllPath)}>
            See All
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>

      <div className="row-wrap">
        <button className="row-nav prev" onClick={() => scroll(-1)} aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="row-track" ref={trackRef}>
          {loading
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : movies.map(m => <MovieCard key={m.id} movie={m} />)
          }
        </div>

        <button className="row-nav next" onClick={() => scroll(1)} aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </section>
  )
}
