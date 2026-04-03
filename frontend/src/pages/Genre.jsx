import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PageLoader, { useImagePreloader } from '../components/PageLoader'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN

const GENRES = {
  28: 'Action',
  12: 'Aventure',
  16: 'Animation',
  35: 'Comédie',
  80: 'Crime',
  99: 'Documentaire',
  18: 'Drame',
  10751: 'Familial',
  14: 'Fantastique',
  36: 'Histoire',
  27: 'Horreur',
  10402: 'Musique',
  9648: 'Mystère',
  10749: 'Romance',
  878: 'Science-Fiction',
  10770: 'Téléfilm',
  53: 'Thriller',
  10752: 'Guerre',
  37: 'Western',
}

function Genre() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [dataLoaded, setDataLoaded] = useState(false)
  const { ready, preload, setReady } = useImagePreloader()

  const genreName = GENRES[id] || 'Genre'

  const fetchMovies = useCallback(async (p) => {
    setDataLoaded(false)
    setReady(false)
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/movie?with_genres=${id}&sort_by=popularity.desc&language=fr-FR&page=${p}`,
        { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }
      )
      const data = await res.json()
      const results = data.results || []
      setMovies(results)
      setTotalPages(Math.min(data.total_pages || 1, 500))
      setDataLoaded(true)

      const urls = results
        .filter(m => m.poster_path)
        .slice(0, 10)
        .map(m => `https://image.tmdb.org/t/p/w342${m.poster_path}`)
      preload(urls)
    } catch {
      setDataLoaded(true)
      setReady(true)
    }
  }, [id])

  useEffect(() => {
    setPage(1)
  }, [id])

  useEffect(() => {
    fetchMovies(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page, fetchMovies])

  return (
    <PageLoader loading={!dataLoaded || !ready}>
      <div className="min-h-screen bg-[#0d0d0f]">
        <Navbar />

        <main className="pt-24 px-6 lg:px-16 pb-12">
          <h1 className="text-[#f0f0f0] text-2xl font-bold mb-8">{genreName}</h1>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 lg:gap-8">
            {movies.map(movie => (
              <div key={movie.id} onClick={() => navigate(`/film/${movie.id}`)} className="group cursor-pointer">
                {movie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                    alt={movie.title}
                    className="w-full rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full aspect-[2/3] rounded-xl flex items-center justify-center text-[#555566] text-xs" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    {movie.title}
                  </div>
                )}
                <p className="text-[#f0f0f0] text-[13px] font-medium mt-2 truncate">{movie.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[#e50914] text-[12px] font-medium">★ {movie.vote_average?.toFixed(1)}</span>
                  {movie.release_date && (
                    <span className="text-[#555566] text-[11px]">{new Date(movie.release_date).getFullYear()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl text-[13px] font-medium border-none cursor-pointer transition-all duration-200 disabled:opacity-30 disabled:cursor-default bg-[rgba(255,255,255,0.06)] text-[#a0a0b0] hover:text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.1)]"
              >
                Précédent
              </button>
              <span className="text-[#a0a0b0] text-[13px]">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 rounded-xl text-[13px] font-medium border-none cursor-pointer transition-all duration-200 disabled:opacity-30 disabled:cursor-default bg-[rgba(255,255,255,0.06)] text-[#a0a0b0] hover:text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.1)]"
              >
                Suivant
              </button>
            </div>
          )}
        </main>
      </div>
    </PageLoader>
  )
}

export default Genre
