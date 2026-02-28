const API_KEY = import.meta.env.VITE_TMDB_KEY
const BASE    = 'https://api.themoviedb.org/3'
export const IMG = 'https://image.tmdb.org/t/p/'

export const tmdb = async (path, params = {}) => {
  const qs  = new URLSearchParams({ api_key: API_KEY, ...params })
  const res = await fetch(`${BASE}/${path}?${qs}`)
  if (!res.ok) throw new Error(`TMDB ${res.status}`)
  return res.json()
}

export const poster   = (p, s = 'w342')   => p ? `${IMG}${s}${p}` : ''
export const backdrop = (p, s = 'w1280')  => p ? `${IMG}${s}${p}` : ''
export const profile  = (p, s = 'w185')   => p ? `${IMG}${s}${p}` : ''

export const fmtYear = (d) => d ? new Date(d).getFullYear() : ''
export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'

export const fmtRuntime = (m) => {
  if (!m) return ''
  const h = Math.floor(m / 60)
  const min = m % 60
  return h ? `${h}h ${min}m` : `${min}m`
}
