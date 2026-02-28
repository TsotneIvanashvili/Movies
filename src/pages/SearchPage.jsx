import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { tmdb } from '../api/tmdb'
import MovieCard from '../components/MovieCard'

export default function SearchPage() {
  const [searchParams] = useSearchParams()
  const q         = searchParams.get('q') || ''
  const navigate  = useNavigate()

  const [movies,  setMovies]  = useState([])
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMovies([])
    setPage(1)
    setTotal(0)
  }, [q])

  useEffect(() => {
    if (!q) return
    setLoading(true)
    tmdb('search/movie', { query: q, page, include_adult: false })
      .then(d => {
        setMovies(prev => page === 1 ? d.results : [...prev, ...d.results])
        setTotal(d.total_results || 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [q, page])

  return (
    <div className="category-page">
      <div className="category-hero">
        <button className="mp-back-btn" onClick={() => navigate(-1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div>
          <span className="row-tag">Search Results</span>
          <h1 className="category-title">
            "{q}" <span className="search-count">{total.toLocaleString()} results</span>
          </h1>
        </div>
      </div>

      {!loading && movies.length === 0 && q && (
        <div className="no-results">
          <div className="no-results-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="60" height="60">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <h3>No results found for "{q}"</h3>
          <p>Try a different search term or browse categories below.</p>
          <button className="btn-primary" onClick={() => navigate('/')}>Go Home</button>
        </div>
      )}

      <div className="category-grid">
        {movies.map(m => <MovieCard key={m.id} movie={m} />)}
        {loading && Array(8).fill(0).map((_, i) => (
          <div key={i} className="card-skeleton" />
        ))}
      </div>

      {!loading && movies.length > 0 && movies.length < total && (
        <div className="load-more-wrap">
          <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
