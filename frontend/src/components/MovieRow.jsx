import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

// Bandeau défilant réutilisable — accepte un endpoint TMDB et une direction
function MovieRow({ endpoint, direction = 'left', onLoaded }) {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const pages = [1, 2, 3]
        const results = await Promise.all(
          pages.map((page) =>
            fetch(`https://api.themoviedb.org/3/${endpoint}${endpoint.includes('?') ? '&' : '?'}language=fr-FR&page=${page}`, {
              headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
            }).then((res) => res.json())
          )
        )

        const all = results
          .flatMap((r) => r.results)
          .filter((m) => m.backdrop_path)

        setMovies(all)

        // Précharger les premières images puis signaler que c'est prêt
        if (onLoaded) {
          const urls = all.slice(0, 6).map(m => IMAGE_BASE + m.backdrop_path)
          let loaded = 0
          if (urls.length === 0) { onLoaded(); return }
          urls.forEach(url => {
            const img = new Image()
            img.onload = img.onerror = () => { loaded++; if (loaded >= urls.length) onLoaded() }
            img.src = url
          })
          setTimeout(() => onLoaded(), 5000)
        }
      } catch (error) {
        console.error('Erreur TMDB:', error)
        if (onLoaded) onLoaded()
      }
    }

    fetchMovies()
  }, [endpoint])

  if (movies.length === 0) return null

  return (
    <div className="w-full h-[300px] overflow-hidden relative">
      <div className="absolute left-0 top-0 w-20 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #0d0d0f, transparent)' }} />
      <div className="absolute right-0 top-0 w-20 h-full z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #0d0d0f, transparent)' }} />

      <div className={`flex gap-3 h-full ${direction === 'left' ? 'animate-scroll-left' : 'animate-scroll-right'}`}>
        {[...movies, ...movies].map((movie, i) => (
          <div key={i} onClick={() => navigate(`/film/${movie.id}`)} className="relative h-full flex-shrink-0 w-[300px] lg:w-[420px] rounded-xl overflow-hidden group cursor-pointer">
            <img
              src={IMAGE_BASE + movie.backdrop_path}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 w-full p-4 flex flex-col justify-end" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)' }}>
              <h3 className="text-[#f0f0f0] text-sm font-semibold">{movie.title}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[#e50914] text-[12px] font-medium">★ {movie.vote_average?.toFixed(1)}</span>
                <span className="text-[#555566] text-[12px]">{new Date(movie.release_date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(229,9,20,0.1)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default MovieRow
