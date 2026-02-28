import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/category/trending', label: 'Trending' },
  { to: '/category/popular', label: 'Popular' },
  { to: '/category/top-rated', label: 'Top Rated' },
  { to: '/category/upcoming', label: 'Upcoming' },
]

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false)
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [searchOpen,  setSearchOpen]  = useState(false)
  const [query,       setQuery]       = useState('')
  const inputRef  = useRef(null)
  const navigate  = useNavigate()
  const location  = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // close mobile menu on route change
  useEffect(() => { setMenuOpen(false) }, [location])

  const openSearch = () => {
    setSearchOpen(true)
    setMenuOpen(false)
    setTimeout(() => inputRef.current?.focus(), 50)
  }
  const closeSearch = () => { setSearchOpen(false); setQuery('') }

  const handleSearch = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`)
      closeSearch()
    }
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
      <div className="nav-wrap">

        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeSearch}>
          CINE<span>VERSE</span>
        </Link>

        {/* Desktop nav links */}
        <div className={`nav-links${menuOpen ? ' open' : ''}`}>
          {LINKS.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Inline search */}
        {searchOpen && (
          <form className="nav-search-form" onSubmit={handleSearch}>
            <svg className="ns-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              ref={inputRef}
              className="ns-input"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search movies..."
            />
            <button type="button" className="ns-cancel" onClick={closeSearch}>✕</button>
          </form>
        )}

        {/* Right actions */}
        <div className="nav-right">
          <button
            className={`nav-icon-btn${searchOpen ? ' active' : ''}`}
            onClick={searchOpen ? closeSearch : openSearch}
            aria-label="Search"
          >
            {searchOpen
              ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            }
          </button>

          <button
            className={`nav-burger${menuOpen ? ' open' : ''}`}
            onClick={() => { setMenuOpen(v => !v); setSearchOpen(false) }}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>

      </div>
    </nav>
  )
}
