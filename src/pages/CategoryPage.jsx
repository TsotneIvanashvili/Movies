import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { tmdb } from '../api/tmdb'
import MovieCard from '../components/MovieCard'

const CONFIG = {
  trending:    { endpoint: 'trending/movie/week', title: 'Trending This Week',   tag: 'Hot Right Now' },
  popular:     { endpoint: 'movie/popular',       title: 'Popular Movies',        tag: 'Fan Favorites' },
  'top-rated': { endpoint: 'movie/top_rated',     title: 'Top Rated Movies',      tag: "Critics' Choice" },
  upcoming:    { endpoint: 'movie/upcoming',       title: 'Upcoming Releases',     tag: 'Coming Soon' },
  'now-playing':{ endpoint: 'movie/now_playing',  title: 'Now Playing',           tag: 'In Cinemas' },
}

export default function CategoryPage() {
  const { type }  = useParams()
  const navigate  = useNavigate()
  const cfg       = CONFIG[type] || CONFIG.popular

  const [movies,  setMovies]  = useState([])
  const [page,    setPage]    = useState(1)
  const [total,   setTotal]   = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    setMovies([])
    setPage(1)
    setTotal(1)
  }, [type])

  useEffect(() => {
    setLoading(true)
    tmdb(cfg.endpoint, { page })
      .then(d => {
        setMovies(prev => page === 1 ? d.results : [...prev, ...d.results])
        setTotal(d.total_pages || 1)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [type, page])

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
          <span className="row-tag">{cfg.tag}</span>
          <h1 className="category-title">{cfg.title}</h1>
        </div>
      </div>

      <div className="category-grid">
        {movies.map(m => <MovieCard key={m.id} movie={m} />)}
        {loading && Array(8).fill(0).map((_, i) => (
          <div key={i} className="card-skeleton" />
        ))}
      </div>

      {!loading && page < total && (
        <div className="load-more-wrap">
          <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>
            Load More
          </button>
        </div>
      )}
    </div>
  )
}
