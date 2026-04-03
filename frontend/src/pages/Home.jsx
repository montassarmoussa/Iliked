import { useState, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MovieRow from '../components/MovieRow'
import PageLoader from '../components/PageLoader'

const GENRE_SECTIONS = [
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drame' },
  { id: 35, name: 'Comédie' },
  { id: 27, name: 'Horreur' },
  { id: 878, name: 'Science-Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 10749, name: 'Romance' },
  { id: 12, name: 'Aventure' },
  { id: 99, name: 'Documentaire' },
  { id: 14, name: 'Fantastique' },
]

function CategoryTitle({ to, children }) {
  return (
    <Link to={to} className="text-[#f0f0f0] text-lg font-bold px-6 lg:px-16 mb-4 no-underline flex items-center gap-2 group">
      {children}
      <svg className="w-4 h-4 text-[#555566] group-hover:text-[#e50914] transition-colors" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </Link>
  )
}

function Home() {
  const [ready, setReady] = useState(false)
  const loadedCount = useRef(0)

  // On attend que les 3 premières rows soient chargées
  const handleRowLoaded = useCallback(() => {
    loadedCount.current++
    if (loadedCount.current >= 3) setReady(true)
  }, [])

  return (
    <PageLoader loading={!ready}>
      <div className="min-h-screen bg-[#0d0d0f]">
        <Navbar />
        <main className="pt-20">
          {/* Dernières sorties */}
          <div className="mb-10">
            <CategoryTitle to="/category/now_playing">Dernières sorties</CategoryTitle>
            <MovieRow endpoint="movie/now_playing" direction="left" onLoaded={handleRowLoaded} />
          </div>

          {/* Les plus plébiscités */}
          <div className="mb-10">
            <CategoryTitle to="/category/popular">Les plus plébiscités</CategoryTitle>
            <MovieRow endpoint="discover/movie?with_genres=35&sort_by=popularity.desc" direction="right" onLoaded={handleRowLoaded} />
          </div>

          {/* Les mieux notés */}
          <div className="mb-10">
            <CategoryTitle to="/category/top_rated">Les mieux notés</CategoryTitle>
            <MovieRow endpoint="movie/top_rated" direction="left" onLoaded={handleRowLoaded} />
          </div>

          {/* Genres */}
          {GENRE_SECTIONS.map((genre, i) => (
            <div key={genre.id} className="mb-10">
              <CategoryTitle to={`/genre/${genre.id}`}>{genre.name}</CategoryTitle>
              <MovieRow endpoint={`discover/movie?with_genres=${genre.id}&sort_by=popularity.desc`} direction={i % 2 === 0 ? 'right' : 'left'} />
            </div>
          ))}
        </main>
      </div>
    </PageLoader>
  )
}

export default Home
