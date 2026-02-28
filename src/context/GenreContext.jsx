import { createContext, useContext, useState, useEffect } from 'react'
import { tmdb } from '../api/tmdb'

const GenreCtx = createContext({})
export const useGenres = () => useContext(GenreCtx)

export default function GenreProvider({ children }) {
  const [genres, setGenres] = useState({})

  useEffect(() => {
    tmdb('genre/movie/list')
      .then(d => {
        const map = {}
        d.genres.forEach(g => { map[g.id] = g.name })
        setGenres(map)
      })
      .catch(() => {})
  }, [])

  return <GenreCtx.Provider value={genres}>{children}</GenreCtx.Provider>
}
