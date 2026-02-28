import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <Link to="/" className="footer-logo">CINE<span>VERSE</span></Link>
        <div className="footer-links">
          <Link to="/category/trending">Trending</Link>
          <Link to="/category/popular">Popular</Link>
          <Link to="/category/top-rated">Top Rated</Link>
          <Link to="/category/upcoming">Upcoming</Link>
        </div>
        <p className="footer-copy">
          Powered by{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer">TMDb API</a>
          {' '}· © 2026 CineVerse
        </p>
      </div>
    </footer>
  )
}
