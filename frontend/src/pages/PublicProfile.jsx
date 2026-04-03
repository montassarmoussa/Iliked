import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'
import Navbar from '../components/Navbar'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w200'
const POSTER_SM = 'https://image.tmdb.org/t/p/w92'

// Grille de posters
function FilmGrid({ filmIds, emptyText }) {
  const [films, setFilms] = useState([])

  useEffect(() => {
    if (!filmIds?.length) return
    Promise.all(
      filmIds.slice(0, 12).map((id) =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?language=fr-FR`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
        }).then(r => r.json()).catch(() => null)
      )
    ).then(results => setFilms(results.filter(Boolean)))
  }, [filmIds])

  if (!filmIds?.length) return <p className="text-[#555566] text-sm">{emptyText}</p>

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
      {films.map(film => (
        <Link key={film.id} to={`/film/${film.id}`} className="group">
          {film.poster_path ? (
            <img src={IMAGE_BASE + film.poster_path} alt={film.title} className="w-full rounded-xl transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <div className="w-full aspect-[2/3] rounded-xl flex items-center justify-center text-[#555566] text-xs" style={{ background: 'rgba(255,255,255,0.06)' }}>{film.title}</div>
          )}
          <p className="text-[#a0a0b0] text-[11px] mt-1 truncate">{film.title}</p>
        </Link>
      ))}
    </div>
  )
}

// Feed d'activité — une ligne par action avec mini poster
function ActivityFeed({ feed, username }) {
  const [filmCache, setFilmCache] = useState({})

  useEffect(() => {
    if (!feed?.length) return
    const uniqueIds = [...new Set(feed.map(f => f.film_id))]
    Promise.all(
      uniqueIds.map(id =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?language=fr-FR`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
        }).then(r => r.json()).catch(() => null)
      )
    ).then(results => {
      const cache = {}
      results.filter(Boolean).forEach(m => { cache[m.id] = m })
      setFilmCache(cache)
    })
  }, [feed])

  const timeAgo = (date) => {
    const now = new Date()
    const d = new Date(date)
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return 'à l\'instant'
    if (diff < 3600) return `il y a ${Math.floor(diff / 60)}min`
    if (diff < 86400) return `il y a ${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `il y a ${Math.floor(diff / 86400)}j`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const actionLabel = (item) => {
    switch (item.action) {
      case 'liked': return 'a aimé'
      case 'disliked': return 'n\'a pas aimé'
      case 'watched': return item.rating ? `a noté ${item.rating}/10` : 'a vu'
      case 'watchlist': return 'veut voir'
      case 'commented': return 'a commenté'
      default: return ''
    }
  }

  const actionColor = (action) => {
    switch (action) {
      case 'liked': return '#e50914'
      case 'watched': return '#4ade80'
      case 'watchlist': return '#60a5fa'
      case 'commented': return '#a78bfa'
      case 'disliked': return '#666'
      default: return '#a0a0b0'
    }
  }

  if (!feed?.length) return <p className="text-[#555566] text-sm">Aucune activité pour le moment.</p>

  return (
    <div className="flex flex-col gap-1">
      {feed.map((item, i) => {
        const film = filmCache[item.film_id]
        if (!film) return null
        return (
          <Link key={i} to={`/film/${item.film_id}`} className="flex items-center gap-3 py-2.5 px-3 rounded-xl no-underline hover:bg-[rgba(255,255,255,0.03)] transition-colors">
            {/* Mini poster */}
            {film.poster_path ? (
              <img src={POSTER_SM + film.poster_path} alt="" className="w-8 h-12 rounded-lg object-cover flex-shrink-0" />
            ) : (
              <div className="w-8 h-12 rounded-lg flex-shrink-0 flex items-center justify-center text-[#555566] text-[10px]" style={{ background: 'rgba(255,255,255,0.06)' }}>?</div>
            )}

            {/* Action */}
            <div className="flex-1 min-w-0">
              <p className="text-[13px]">
                <span className="text-[#f0f0f0] font-medium">@{username}</span>
                {' '}
                <span style={{ color: actionColor(item.action) }}>{actionLabel(item)}</span>
                {' '}
                <span className="text-[#f0f0f0] font-medium">{film.title}</span>
              </p>
              {item.action === 'commented' && item.content && (
                <p className="text-[#555566] text-[12px] truncate mt-0.5">"{item.content}"</p>
              )}
            </div>

            {/* Temps */}
            <span className="text-[#555566] text-[11px] flex-shrink-0">{timeAgo(item.created_at)}</span>
          </Link>
        )
      })}
    </div>
  )
}

function PublicProfile() {
  const { username } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [followStatus, setFollowStatus] = useState({ is_following: false, followers_count: 0, following_count: 0 })
  const [friendStatus, setFriendStatus] = useState({ status: null, is_sender: false })

  useEffect(() => {
    api.get(`/user/${username}`)
      .then((res) => {
        setProfile(res.data)
        // Charge le follow status
        if (!res.data.is_owner) {
          api.get(`/users/${res.data.id}/follow-status`)
            .then(r => setFollowStatus(r.data))
            .catch(() => {})
          api.get(`/friends/status/${res.data.id}`)
            .then(r => setFriendStatus(r.data))
            .catch(() => {})
        } else {
          setFollowStatus({
            is_following: false,
            followers_count: res.data.stats?.followers_count || 0,
            following_count: res.data.stats?.following_count || 0,
          })
        }
      })
      .catch(() => setNotFound(true))
  }, [username])

  const handleFriendAction = async () => {
    if (!profile) return
    try {
      if (friendStatus.status === 'accepted') {
        if (!window.confirm('Retirer cet ami ?')) return
        await api.delete(`/friends/${profile.id}`)
        setFriendStatus({ status: null, is_sender: false })
        toast.success('Ami retiré.')
      } else if (friendStatus.status === 'pending' && !friendStatus.is_sender) {
        await api.post(`/friends/accept/${profile.id}`)
        setFriendStatus({ status: 'accepted', is_sender: false })
        toast.success('Demande acceptée !')
      } else if (friendStatus.status === 'pending' && friendStatus.is_sender) {
        return // déjà en attente
      } else {
        const res = await api.post(`/friends/request/${profile.id}`)
        setFriendStatus({ status: res.data.status || 'pending', is_sender: true })
        toast.success(res.data.message)
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur')
    }
  }

  const toggleFollow = async () => {
    if (!profile) return
    try {
      if (followStatus.is_following) {
        await api.delete(`/users/${profile.id}/follow`)
        setFollowStatus(prev => ({ ...prev, is_following: false, followers_count: prev.followers_count - 1 }))
      } else {
        await api.post(`/users/${profile.id}/follow`)
        setFollowStatus(prev => ({ ...prev, is_following: true, followers_count: prev.followers_count + 1 }))
      }
    } catch {}
  }

  const handleLogout = async () => {
    try { await api.post('/logout') } catch {}
    localStorage.removeItem('token')
    navigate('/')
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Es-tu sûr de vouloir supprimer ton compte ? Cette action est irréversible.')) return
    try {
      await api.delete('/user')
      localStorage.removeItem('token')
      toast.success('Compte supprimé.')
      navigate('/')
    } catch {
      toast.error('Erreur lors de la suppression.')
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0d0d0f]">
        <Navbar />
        <div className="pt-24 flex flex-col items-center justify-center">
          <h1 className="text-[#f0f0f0] text-2xl font-bold">Utilisateur introuvable</h1>
          <p className="text-[#a0a0b0] text-sm mt-2">@{username} n'existe pas.</p>
        </div>
      </div>
    )
  }

  if (!profile) return null

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Navbar />

      <main className="pt-24 px-4 lg:px-8 pb-12 flex justify-center">
        <div className="w-full max-w-[700px]">

          {/* Header profil */}
          <div className="flex flex-col items-center mb-8">
            <div style={{ border: '2px solid rgba(255,255,255,0.1)' }} className="w-28 h-28 rounded-full overflow-hidden">
              {profile.picture ? (
                <img src={profile.picture} alt={profile.username} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#555566]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </div>

            <h1 className="text-[#f0f0f0] text-xl font-bold mt-4">{profile.first_name} {profile.last_name}</h1>
            <p className="text-[#a0a0b0] text-sm">@{profile.username}</p>

            {profile.is_owner && profile.email && (
              <p className="text-[#555566] text-[13px] mt-1">{profile.email}</p>
            )}

            {(profile.city || profile.country) && (
              <p className="text-[#555566] text-[13px] mt-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {[profile.city, profile.country].filter(Boolean).join(', ')}
              </p>
            )}

            <p className="text-[#555566] text-[12px] mt-2">
              Membre depuis {new Date(profile.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </p>

            {/* Stats */}
            {profile.stats && (
              <div className="flex gap-5 mt-4 flex-wrap justify-center">
                <div className="text-center">
                  <p className="text-[#f0f0f0] text-lg font-bold">{followStatus.followers_count}</p>
                  <p className="text-[#555566] text-[11px]">Abonnés</p>
                </div>
                <div className="text-center">
                  <p className="text-[#f0f0f0] text-lg font-bold">{followStatus.following_count}</p>
                  <p className="text-[#555566] text-[11px]">Abonnements</p>
                </div>
                <div className="text-center">
                  <p className="text-[#f0f0f0] text-lg font-bold">{profile.stats.watched_count}</p>
                  <p className="text-[#555566] text-[11px]">Films vus</p>
                </div>
                <div className="text-center">
                  <p className="text-[#f0f0f0] text-lg font-bold">{profile.stats.likes_count}</p>
                  <p className="text-[#555566] text-[11px]">Aimés</p>
                </div>
                <div className="text-center">
                  <p className="text-[#f0f0f0] text-lg font-bold">{profile.stats.watchlist_count}</p>
                  <p className="text-[#555566] text-[11px]">À voir</p>
                </div>
              </div>
            )}

            {/* Boutons actions profil */}
            <div className="flex gap-3 mt-4">
              {profile.is_owner ? (
                <Link to="/profile/edit" style={{ padding: '8px 24px', border: '1px solid rgba(255,255,255,0.1)' }} className="rounded-xl text-[13px] text-[#a0a0b0] font-medium no-underline transition-all duration-300 hover:text-[#f0f0f0] hover:border-[rgba(255,255,255,0.2)]">
                  Modifier mon profil
                </Link>
              ) : (
                <>
                  <button
                    onClick={toggleFollow}
                    style={{ padding: '8px 24px', border: followStatus.is_following ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
                    className={`rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-300 ${followStatus.is_following ? 'bg-transparent text-[#a0a0b0] hover:text-[#e50914] hover:border-[#e50914]' : 'bg-[#e50914] text-white hover:bg-[#ff1a25]'}`}
                  >
                    {followStatus.is_following ? 'Abonné' : 'Suivre'}
                  </button>
                  <button
                    onClick={handleFriendAction}
                    disabled={friendStatus.status === 'pending' && friendStatus.is_sender}
                    style={{ padding: '8px 24px', border: friendStatus.status === 'accepted' ? '1px solid rgba(74,222,128,0.3)' : friendStatus.status === 'pending' && friendStatus.is_sender ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
                    className={`rounded-xl text-[13px] font-semibold cursor-pointer transition-all duration-300 ${
                      friendStatus.status === 'accepted'
                        ? 'bg-transparent text-[#4ade80] hover:text-[#e50914] hover:border-[#e50914]'
                        : friendStatus.status === 'pending' && friendStatus.is_sender
                          ? 'bg-transparent text-[#555566] cursor-default'
                          : friendStatus.status === 'pending' && !friendStatus.is_sender
                            ? 'bg-[#4ade80] text-[#0d0d0f] hover:bg-[#22c55e]'
                            : 'bg-transparent text-[#a0a0b0] border border-[rgba(255,255,255,0.1)] hover:text-[#f0f0f0] hover:border-[rgba(255,255,255,0.2)]'
                    }`}
                  >
                    {friendStatus.status === 'accepted' ? 'Ami' : friendStatus.status === 'pending' && friendStatus.is_sender ? 'Demande envoyée' : friendStatus.status === 'pending' && !friendStatus.is_sender ? 'Accepter' : 'Ajouter en ami'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Feed d'activité récente */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="p-6 mb-4">
            <h2 className="text-[#f0f0f0] text-[15px] font-semibold mb-4">Activité récente</h2>
            <ActivityFeed feed={profile.feed} username={profile.username} />
          </div>

          {/* Films vus */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="p-6 mb-4">
            <h2 className="text-[#f0f0f0] text-[15px] font-semibold mb-4">Films vus</h2>
            <FilmGrid filmIds={profile.watched} emptyText="Aucun film vu pour le moment." />
          </div>

          {/* Films aimés */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="p-6 mb-4">
            <h2 className="text-[#f0f0f0] text-[15px] font-semibold mb-4">Films aimés</h2>
            <FilmGrid filmIds={profile.likes} emptyText="Aucun film aimé pour le moment." />
          </div>

          {/* À voir */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="p-6 mb-4">
            <h2 className="text-[#f0f0f0] text-[15px] font-semibold mb-4">À voir</h2>
            <FilmGrid filmIds={profile.watchlist} emptyText="Aucun film dans la watchlist." />
          </div>

          {/* Reviews */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="p-6 mb-4">
            <h2 className="text-[#f0f0f0] text-[15px] font-semibold mb-4">Reviews ({profile.reviews?.length || 0})</h2>
            {profile.reviews?.length > 0 ? (
              <div className="flex flex-col gap-3">
                {profile.reviews.map(review => (
                  <Link key={review.id} to={`/film/${review.film_id}`} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }} className="p-4 no-underline hover:bg-[rgba(255,255,255,0.05)] transition-colors block">
                    <p className="text-[#a0a0b0] text-[13px] leading-relaxed">{review.content}</p>
                    <p className="text-[#555566] text-[11px] mt-2">{new Date(review.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-[#555566] text-sm">Aucune review pour le moment.</p>
            )}
          </div>

          {/* Zone danger */}
          {profile.is_owner && (
            <div style={{ background: 'rgba(229,9,20,0.05)', border: '1px solid rgba(229,9,20,0.15)', borderRadius: '16px' }} className="p-6 mt-2">
              <h2 className="text-[#f0f0f0] text-[15px] font-semibold mb-3">Zone dangereuse</h2>
              <button onClick={handleLogout} style={{ padding: '10px 0' }} className="w-full mb-3 bg-transparent text-[#a0a0b0] border border-[rgba(255,255,255,0.1)] rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:text-[#f0f0f0] hover:border-[rgba(255,255,255,0.2)]">
                Se déconnecter
              </button>
              <button onClick={handleDeleteAccount} style={{ padding: '10px 0' }} className="w-full bg-transparent text-[#e50914] border border-[rgba(229,9,20,0.3)] rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-[#e50914] hover:text-white">
                Supprimer mon compte
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default PublicProfile
