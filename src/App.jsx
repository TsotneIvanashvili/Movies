import { BrowserRouter, Routes, Route } from 'react-router-dom'
import GenreProvider from './context/GenreContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import MoviePage from './pages/MoviePage'
import CategoryPage from './pages/CategoryPage'
import SearchPage from './pages/SearchPage'

export default function App() {
  return (
    <BrowserRouter>
      <GenreProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/category/:type" element={<CategoryPage />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
        <Footer />
      </GenreProvider>
    </BrowserRouter>
  )
}
