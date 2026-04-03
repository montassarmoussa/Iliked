import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'
import Navbar from '../components/Navbar'
import PageLoader, { useImagePreloader } from '../components/PageLoader'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

function Film() {
  const { id } = useParams()
  const castRef = useRef(null)
  const [castScrollLeft, setCastScrollLeft] = useState(0)
  const [movie, setMovie] = useState(null)
  const [credits, setCredits] = useState(null)
  const [providers, setProviders] = useState(null)
  const [status, setStatus] = useState({ like: null, in_watchlist: false, watched: false, rating: null })
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [userRating, setUserRating] = useState(0)
  const { ready, preload } = useImagePreloader()

  useEffect(() => {
    Promise.all([
      fetch(`https://api.themoviedb.org/3/movie/${id}?language=fr-FR`, { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/${id}/credits?language=fr-FR`, { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }).then(r => r.json()),
      fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers`, { headers: { Authorization: `Bearer ${TMDB_TOKEN}` } }).then(r => r.json()),
    ]).then(([movieData, creditsData, provData]) => {
      setMovie(movieData)
      setCredits(creditsData)
      setProviders(provData.results?.FR || provData.results?.US || null)

      // Précharger les images principales
      const urls = []
      if (movieData.backdrop_path) urls.push(BACKDROP_BASE + movieData.backdrop_path)
      if (movieData.poster_path) urls.push(IMAGE_BASE + movieData.poster_path)
      creditsData?.cast?.slice(0, 10).forEach(a => {
        if (a.profile_path) urls.push(IMAGE_BASE + a.profile_path)
      })
      preload(urls)
    })

    api.get(`/films/${id}/status`).then(r => {
      setStatus(r.data)
      if (r.data.rating) setUserRating(r.data.rating)
    }).catch(() => {})
    api.get(`/films/${id}/comments`).then(r => setComments(r.data)).catch(() => {})
  }, [id])

  const toggleLike = async (type) => {
    try {
      if (status.like === type) {
        await api.delete(`/films/${id}/like`)
        setStatus({ ...status, like: null })
      } else {
        await api.post(`/films/${id}/like`, { type })
        setStatus({ ...status, like: type })
      }
    } catch (error) {
      toast.error('Erreur : ' + (error.response?.data?.message || 'impossible'))
    }
  }

  const toggleWatched = async () => {
    try {
      if (status.watched) {
        await api.delete(`/films/${id}/watched`)
        setStatus({ ...status, watched: false, rating: null })
        setUserRating(0)
      } else {
        await api.post(`/films/${id}/watched`, { rating: null })
        setStatus({ ...status, watched: true })
        toast.success('Marqué comme vu')
      }
    } catch (error) {
      toast.error('Erreur : ' + (error.response?.data?.message || 'impossible'))
    }
  }

  const toggleWatchlist = async () => {
    if (status.in_watchlist) {
      await api.delete(`/films/${id}/watchlist`)
      setStatus({ ...status, in_watchlist: false })
      toast.success('Retiré de la watchlist')
    } else {
      await api.post(`/films/${id}/watchlist`)
      setStatus({ ...status, in_watchlist: true })
      toast.success('Ajouté à la watchlist')
    }
  }

  const handleRating = async (rating) => {
    setUserRating(rating)
    await api.post(`/films/${id}/watched`, { rating })
    setStatus({ ...status, watched: true, rating })
    toast.success(`Noté ${rating}/10`)
  }

  const handleComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const res = await api.post(`/films/${id}/comments`, { content: newComment })
      setComments([res.data, ...comments])
      setNewComment('')
    } catch (error) {
      if (error.response?.status === 422) {
        Object.values(error.response.data.errors).forEach(msgs => msgs.forEach(m => toast.error(m)))
      }
    }
  }

  const deleteComment = async (commentId) => {
    await api.delete(`/comments/${commentId}`)
    setComments(comments.filter(c => c.id !== commentId))
    toast.success('Commentaire supprimé')
  }

  const formatRuntime = (min) => {
    if (!min) return null
    const h = Math.floor(min / 60)
    const m = min % 60
    return `${h}h${m > 0 ? ` ${m}min` : ''}`
  }

  const inputStyle = { padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f0f0f0', fontSize: '13px', outline: 'none', width: '100%' }

  const director = movie ? credits?.crew?.find(c => c.job === 'Director') : null

  return (
    <PageLoader loading={!movie || !ready}>
      <div className="min-h-screen bg-[#0d0d0f]">
        <Navbar />

        {movie && (
          <>
            {/* Hero backdrop */}
            <div className="relative w-full h-[350px] lg:h-[550px] overflow-hidden">
              {movie.backdrop_path && (
                <img src={BACKDROP_BASE + movie.backdrop_path} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
              )}
              <div className="absolute bottom-0 left-0 w-full h-60" style={{ background: 'linear-gradient(to top, #0d0d0f, transparent)' }} />
            </div>

            <main className="relative -mt-60 z-10 px-6 lg:px-16 pb-12 max-w-[1100px] mx-auto">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Poster */}
                <div className="flex-shrink-0 flex justify-center lg:justify-start w-[260px] lg:w-[340px]">
                  <img src={IMAGE_BASE + movie.poster_path} alt={movie.title} className="w-full h-auto rounded-2xl shadow-[0_12px_50px_rgba(0,0,0,0.7)]" />
                </div>

                {/* Infos */}
                <div className="flex-1">
                  <h1 className="text-[#f0f0f0] text-2xl lg:text-3xl font-bold mb-2">{movie.title}</h1>
                  {movie.tagline && <p className="text-[#a0a0b0] text-sm italic mb-4">"{movie.tagline}"</p>}

                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <span className="text-[#e50914] text-sm font-semibold">★ {movie.vote_average?.toFixed(1)}</span>
                    <span className="text-[#a0a0b0] text-sm">{new Date(movie.release_date).getFullYear()}</span>
                    {formatRuntime(movie.runtime) && <span className="text-[#a0a0b0] text-sm">{formatRuntime(movie.runtime)}</span>}
                    {director && <span className="text-[#a0a0b0] text-sm">par {director.name}</span>}
                  </div>

                  {movie.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genres.map(g => (
                        <span key={g.id} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} className="text-[#f0f0f0] text-[12px] px-3 py-1 rounded-full">{g.name}</span>
                      ))}
                    </div>
                  )}

                  {movie.production_countries?.length > 0 && (
                    <p className="text-[#555566] text-[13px] mb-4">{movie.production_countries.map(c => c.name).join(', ')}</p>
                  )}

                  <p className="text-[#a0a0b0] text-[14px] leading-relaxed mb-6">{movie.overview}</p>

                  {/* Boutons actions */}
                  <div className="flex flex-wrap gap-3 mb-6">
                    <button onClick={toggleWatched} style={{ padding: '10px 20px', border: status.watched ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)', background: status.watched ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)' }} className={`rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 ${status.watched ? 'text-[#4ade80]' : 'text-[#a0a0b0] hover:text-[#f0f0f0]'}`}>
                      {status.watched ? '✓ Vu' : 'Vu'}
                    </button>
                    <button onClick={() => toggleLike('like')} style={{ padding: '10px 20px', border: status.like === 'like' ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.1)', background: status.like === 'like' ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.06)' }} className={`rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 ${status.like === 'like' ? 'text-[#e50914]' : 'text-[#a0a0b0] hover:text-[#f0f0f0]'}`}>
                      {status.like === 'like' ? '♥ Aimé' : '♥ J\'aime'}
                    </button>
                    <button onClick={() => toggleLike('dislike')} style={{ padding: '10px 20px', border: status.like === 'dislike' ? '1px solid #666' : '1px solid rgba(255,255,255,0.1)', background: status.like === 'dislike' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)' }} className={`rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 ${status.like === 'dislike' ? 'text-[#f0f0f0]' : 'text-[#a0a0b0] hover:text-[#f0f0f0]'}`}>
                      Pas pour moi
                    </button>
                    <button onClick={toggleWatchlist} style={{ padding: '10px 20px', border: status.in_watchlist ? '1px solid #60a5fa' : '1px solid rgba(255,255,255,0.1)', background: status.in_watchlist ? 'rgba(96,165,250,0.15)' : 'rgba(255,255,255,0.06)' }} className={`rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 ${status.in_watchlist ? 'text-[#60a5fa]' : 'text-[#a0a0b0] hover:text-[#f0f0f0]'}`}>
                      {status.in_watchlist ? '✓ À voir' : '+ À voir'}
                    </button>
                  </div>

                  {/* Note personnelle */}
                  <div className="mb-6">
                    <p className="text-[#a0a0b0] text-[12px] mb-2">Ta note :</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                        <button key={n} onClick={() => handleRating(n)} style={{ width: '32px', height: '32px', background: n <= userRating ? '#e50914' : 'rgba(255,255,255,0.06)', border: '1px solid ' + (n <= userRating ? '#e50914' : 'rgba(255,255,255,0.1)') }} className={`rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-200 ${n <= userRating ? 'text-white' : 'text-[#555566] hover:text-[#f0f0f0]'}`}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Plateformes */}
                  {providers && (providers.flatrate || providers.rent || providers.buy) && (
                    <div className="mb-6">
                      <p className="text-[#a0a0b0] text-[12px] mb-2">Où regarder :</p>
                      <div className="flex gap-3 flex-wrap">
                        {[...(providers.flatrate || []), ...(providers.rent || []), ...(providers.buy || [])].filter((p, i, arr) => arr.findIndex(x => x.provider_id === p.provider_id) === i).map(p => (
                          <a key={p.provider_id} href={providers.link} target="_blank" rel="noopener noreferrer" title={p.provider_name}>
                            <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-11 h-11 rounded-xl hover:scale-110 transition-transform" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Casting */}
              {credits?.cast?.length > 0 && (
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-[#f0f0f0] text-lg font-semibold">Casting</h2>
                    <div className="flex gap-2">
                      {castScrollLeft > 0 && (
                        <button onClick={() => { castRef.current.scrollBy({ left: -400, behavior: 'smooth' }); setTimeout(() => setCastScrollLeft(castRef.current.scrollLeft - 400), 300) }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', width: '36px', height: '36px' }} className="rounded-full flex items-center justify-center cursor-pointer text-[#a0a0b0] hover:text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.1)] transition-all">
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </button>
                      )}
                      <button onClick={() => { castRef.current.scrollBy({ left: 400, behavior: 'smooth' }); setTimeout(() => setCastScrollLeft(castRef.current.scrollLeft + 400), 300) }} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', width: '36px', height: '36px' }} className="rounded-full flex items-center justify-center cursor-pointer text-[#a0a0b0] hover:text-[#f0f0f0] hover:bg-[rgba(255,255,255,0.1)] transition-all">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </button>
                    </div>
                  </div>
                  <div ref={castRef} onScroll={() => setCastScrollLeft(castRef.current.scrollLeft)} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {credits.cast.slice(0, 20).map(actor => (
                      <div key={actor.id} className="flex-shrink-0 w-[100px] text-center">
                        {actor.profile_path ? (
                          <img src={IMAGE_BASE + actor.profile_path} alt={actor.name} className="w-[100px] h-[100px] rounded-full object-cover mx-auto mb-2" />
                        ) : (
                          <div className="w-[100px] h-[100px] rounded-full mx-auto mb-2 flex items-center justify-center text-[#555566]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <span className="text-2xl">{actor.name.charAt(0)}</span>
                          </div>
                        )}
                        <p className="text-[#f0f0f0] text-[12px] font-medium truncate">{actor.name}</p>
                        <p className="text-[#555566] text-[11px] truncate">{actor.character}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Commentaires */}
              <div className="mt-10">
                <h2 className="text-[#f0f0f0] text-lg font-semibold mb-4">Commentaires ({comments.length})</h2>

                <form onSubmit={handleComment} className="mb-6">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Partage ton avis sur ce film..."
                    rows={3}
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                  <button type="submit" style={{ padding: '10px 24px' }} className="mt-3 bg-[#e50914] text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-[#ff1a25] hover:shadow-[0_0_24px_rgba(229,9,20,0.3)]">
                    Publier
                  </button>
                </form>

                <div className="flex flex-col gap-4">
                  {comments.map(comment => (
                    <div key={comment.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <Link to={`/user/${comment.username}`}>
                          {comment.picture ? (
                            <img src={comment.picture} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#555566] text-sm" style={{ background: 'rgba(255,255,255,0.06)' }}>{comment.username?.charAt(0)}</div>
                          )}
                        </Link>
                        <div>
                          <Link to={`/user/${comment.username}`} className="text-[#f0f0f0] text-[13px] font-medium no-underline hover:text-[#e50914] transition-colors">@{comment.username}</Link>
                          <p className="text-[#555566] text-[11px]">{new Date(comment.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                      </div>
                      <p className="text-[#a0a0b0] text-[13px] leading-relaxed">{comment.content}</p>
                    </div>
                  ))}
                  {comments.length === 0 && <p className="text-[#555566] text-sm">Aucun commentaire pour le moment. Sois le premier !</p>}
                </div>
              </div>
            </main>
          </>
        )}
      </div>
    </PageLoader>
  )
}

export default Film
