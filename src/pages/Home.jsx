import { useEffect, useState } from 'react'
import Hero from '../components/Hero'
import MovieRow from '../components/MovieRow'
import { tmdb, backdrop } from '../api/tmdb'
import { useReveal } from '../hooks/useReveal'

function ParallaxBanner() {
  const [bg, setBg]   = useState('')
  const ref           = useReveal()

  useEffect(() => {
    tmdb('movie/now_playing')
      .then(d => {
        const m = d.results.find(m => m.backdrop_path)
        if (m) setBg(backdrop(m.backdrop_path, 'original'))
      })
      .catch(() => {})

    const el = document.getElementById('parallax-bg')
    const onScroll = () => {
      if (!el) return
      const rect = el.closest('.parallax-banner')?.getBoundingClientRect()
      if (!rect) return
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height)
      el.style.transform = `translateY(${(progress - 0.5) * 80}px)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div ref={ref} className="parallax-banner reveal">
      <div
        id="parallax-bg"
        className="parallax-bg"
        style={bg ? { backgroundImage: `url(${bg})` } : {}}
      />
      <div className="parallax-overlay" />
      <div className="parallax-text">
        <h2>Thousands of Movies.<br />One Destination.</h2>
        <p>Discover blockbusters, hidden gems, and everything in between.</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="home">
      <Hero />

      <MovieRow
        title="Trending This Week"
        tag="Hot Right Now"
        endpoint="trending/movie/week"
        seeAllPath="/category/trending"
      />

      <MovieRow
        title="Popular Movies"
        tag="Fan Favorites"
        endpoint="movie/popular"
        seeAllPath="/category/popular"
      />

      <ParallaxBanner />

      <MovieRow
        title="Top Rated"
        tag="Critics' Choice"
        endpoint="movie/top_rated"
        seeAllPath="/category/top-rated"
      />

      <MovieRow
        title="Upcoming Releases"
        tag="Coming Soon"
        endpoint="movie/upcoming"
        seeAllPath="/category/upcoming"
      />

      <MovieRow
        title="Now Playing"
        tag="In Cinemas"
        endpoint="movie/now_playing"
        seeAllPath="/category/now-playing"
      />
    </main>
  )
}
