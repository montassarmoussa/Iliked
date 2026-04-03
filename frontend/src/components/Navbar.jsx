import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import api from '../api'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN

function Navbar() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [results, setResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [mobileMenu, setMobileMenu] = useState(false)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const searchRef = useRef(null)

  useEffect(() => {
    api.get('/user').then((res) => setUser(res.data)).catch(() => {})
    api.get('/messages/unread-count').then(r => setUnreadMessages(r.data.count)).catch(() => {})
    const interval = setInterval(() => {
      api.get('/messages/unread-count').then(r => setUnreadMessages(r.data.count)).catch(() => {})
    }, 10000)
    return () => clearInterval(interval)
  }, [])

  // Recherche TMDB en live
  useEffect(() => {
    if (searchQuery.length < 2) { setResults([]); return }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(searchQuery)}&language=fr-FR`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
        })
        const data = await res.json()
        setResults(data.results?.slice(0, 8) || [])
        setShowResults(true)
      } catch {}
    }, 300)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  // Ferme les résultats quand on clique ailleurs
  useEffect(() => {
    const handleClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const goToFilm = (id) => {
    setShowResults(false)
    setSearchQuery('')
    navigate(`/film/${id}`)
  }

  return (
    <>
      <nav style={{ background: 'rgba(13,13,15,0.8)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="fixed top-0 left-0 w-full h-16 flex items-center justify-between px-6 lg:px-16 z-100">
        {/* Gauche */}
        <div className="flex items-center gap-4 lg:gap-8">
          <Link to="/home" className="no-underline text-xl font-extrabold">
            <Logo />
          </Link>
          <div className="hidden md:flex gap-6">
            <Link to="/home" className="text-[#a0a0b0] no-underline text-sm font-medium hover:text-[#f0f0f0] transition-colors">Films</Link>
            <Link to="/feed" className="text-[#a0a0b0] no-underline text-sm font-medium hover:text-[#f0f0f0] transition-colors">Feed</Link>
            <Link to="/random" className="text-[#a0a0b0] no-underline text-sm font-medium hover:text-[#f0f0f0] transition-colors">Aléatoire</Link>
            <Link to="/streaming" className="text-[#a0a0b0] no-underline text-sm font-medium hover:text-[#f0f0f0] transition-colors">Streaming</Link>
            <Link to="/friends" className="text-[#a0a0b0] no-underline text-sm font-medium hover:text-[#f0f0f0] transition-colors">Amis</Link>
            <Link to="/messages" className="text-[#a0a0b0] no-underline text-sm font-medium hover:text-[#f0f0f0] transition-colors relative">
              Messages
              {unreadMessages > 0 && (
                <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-[#e50914] rounded-full flex items-center justify-center text-white text-[9px] font-bold">{unreadMessages}</span>
              )}
            </Link>
          </div>
        </div>

        {/* Centre — Recherche */}
        <div ref={searchRef} className="flex-1 max-w-[400px] lg:max-w-[500px] mx-4 lg:mx-8 relative">
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} className="flex items-center gap-2.5 rounded-xl py-2 px-3.5">
            <svg className="w-4 h-4 text-[#a0a0b0] shrink-0" viewBox="0 0 24 24" fill="none"><path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <input
              type="text"
              placeholder="Rechercher un film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => results.length > 0 && setShowResults(true)}
              className="bg-transparent border-none outline-none text-[#f0f0f0] text-sm w-full placeholder:text-[#555566]"
            />
          </div>

          {/* Résultats de recherche */}
          {showResults && results.length > 0 && (
            <div style={{ background: 'rgba(20,20,25,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }} className="absolute top-full left-0 w-full mt-2 rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] max-h-[400px] overflow-y-auto">
              {results.map(movie => (
                <button key={movie.id} onClick={() => goToFilm(movie.id)} className="w-full flex items-center gap-3 p-3 text-left bg-transparent border-none cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`} alt="" className="w-10 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-14 rounded-lg flex-shrink-0 flex items-center justify-center text-[#555566]" style={{ background: 'rgba(255,255,255,0.06)' }}>?</div>
                  )}
                  <div className="min-w-0">
                    <p className="text-[#f0f0f0] text-[13px] font-medium truncate">{movie.title}</p>
                    <p className="text-[#555566] text-[12px]">{movie.release_date ? new Date(movie.release_date).getFullYear() : '—'} {movie.vote_average > 0 && `· ★ ${movie.vote_average.toFixed(1)}`}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Droite */}
        <div className="flex items-center gap-2">
          {/* Notification */}
          <button style={{ background: 'transparent' }} className="hidden md:flex border-none cursor-pointer p-2 rounded-xl text-[#a0a0b0] transition-all duration-200 hover:text-[#f0f0f0] items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M18 8C18 6.4087 17.3679 4.88258 16.2426 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.88258 2.63214 7.75736 3.75736C6.63214 4.88258 6 6.4087 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13.73 21C13.5542 21.3031 13.3019 21.5547 12.9982 21.7295C12.6946 21.9044 12.3504 21.9965 12 21.9965C11.6496 21.9965 11.3054 21.9044 11.0018 21.7295C10.6982 21.5547 10.4458 21.3031 10.27 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Avatar */}
          <Link to={user ? `/user/${user.username}` : '/profile/edit'} className="flex items-center justify-center w-9 h-9 rounded-full overflow-hidden ml-1 transition-all duration-200 hover:ring-2 hover:ring-[#e50914]" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
            {user?.picture ? (
              <img src={user.picture} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#a0a0b0]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            )}
          </Link>

          {/* Hamburger mobile */}
          <button onClick={() => setMobileMenu(!mobileMenu)} style={{ background: 'transparent' }} className="md:hidden border-none cursor-pointer p-2 text-[#a0a0b0]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none"><path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </nav>

      {/* Menu mobile */}
      {mobileMenu && (
        <div style={{ background: 'rgba(13,13,15,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }} className="fixed top-16 left-0 w-full z-90 md:hidden flex flex-col p-4 gap-4">
          <Link to="/home" onClick={() => setMobileMenu(false)} className="text-[#a0a0b0] no-underline text-base font-medium hover:text-[#f0f0f0] transition-colors">Films</Link>
          <Link to="/feed" onClick={() => setMobileMenu(false)} className="text-[#a0a0b0] no-underline text-base font-medium hover:text-[#f0f0f0] transition-colors">Feed</Link>
          <Link to="/random" onClick={() => setMobileMenu(false)} className="text-[#a0a0b0] no-underline text-base font-medium hover:text-[#f0f0f0] transition-colors">Aléatoire</Link>
          <Link to="/streaming" onClick={() => setMobileMenu(false)} className="text-[#a0a0b0] no-underline text-base font-medium hover:text-[#f0f0f0] transition-colors">Streaming</Link>
          <Link to="/friends" onClick={() => setMobileMenu(false)} className="text-[#a0a0b0] no-underline text-base font-medium hover:text-[#f0f0f0] transition-colors">Amis</Link>
          <Link to="/messages" onClick={() => setMobileMenu(false)} className="text-[#a0a0b0] no-underline text-base font-medium hover:text-[#f0f0f0] transition-colors">
            Messages {unreadMessages > 0 && <span className="text-[#e50914] font-bold">({unreadMessages})</span>}
          </Link>
        </div>
      )}
    </>
  )
}

export default Navbar
