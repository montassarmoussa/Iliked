import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'
import Navbar from '../components/Navbar'

function Friends() {
  const [tab, setTab] = useState('friends') // friends | search | pending
  const [friends, setFriends] = useState([])
  const [pending, setPending] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const searchTimeout = useRef(null)

  useEffect(() => {
    loadFriends()
    loadPending()
  }, [])

  const loadFriends = () => {
    api.get('/friends').then(r => setFriends(r.data)).catch(() => {})
  }

  const loadPending = () => {
    api.get('/friends/pending').then(r => setPending(r.data)).catch(() => {})
  }

  // Recherche live
  useEffect(() => {
    if (searchQuery.length < 2) { setSearchResults([]); return }
    clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await api.get(`/friends/search?q=${encodeURIComponent(searchQuery)}`)
        setSearchResults(res.data)
      } catch {}
      setLoading(false)
    }, 300)
    return () => clearTimeout(searchTimeout.current)
  }, [searchQuery])

  const sendRequest = async (userId) => {
    try {
      const res = await api.post(`/friends/request/${userId}`)
      toast.success(res.data.message)
      // Met a jour le statut dans les résultats
      setSearchResults(prev => prev.map(u =>
        u.id === userId ? { ...u, friendship_status: res.data.status || 'pending', is_sender: true } : u
      ))
      if (res.data.status === 'accepted') loadFriends()
    } catch (e) {
      toast.error(e.response?.data?.message || 'Erreur')
    }
  }

  const acceptRequest = async (userId) => {
    try {
      await api.post(`/friends/accept/${userId}`)
      toast.success('Demande acceptée !')
      loadPending()
      loadFriends()
    } catch {
      toast.error('Erreur')
    }
  }

  const rejectRequest = async (userId) => {
    try {
      await api.post(`/friends/reject/${userId}`)
      toast.success('Demande refusée.')
      loadPending()
    } catch {
      toast.error('Erreur')
    }
  }

  const removeFriend = async (userId) => {
    if (!window.confirm('Retirer cet ami ?')) return
    try {
      await api.delete(`/friends/${userId}`)
      toast.success('Ami retiré.')
      loadFriends()
    } catch {
      toast.error('Erreur')
    }
  }

  const UserCard = ({ user, actions }) => (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px' }} className="flex items-center gap-4 p-4">
      <Link to={`/user/${user.username}`} className="flex items-center gap-4 flex-1 min-w-0 no-underline">
        <div style={{ border: '1px solid rgba(255,255,255,0.1)' }} className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          {user.picture ? (
            <img src={user.picture} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#555566]" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[#f0f0f0] text-[14px] font-medium truncate">{user.first_name} {user.last_name}</p>
          <p className="text-[#a0a0b0] text-[12px]">@{user.username}</p>
        </div>
      </Link>
      <div className="flex gap-2 flex-shrink-0">
        {actions}
      </div>
    </div>
  )

  const friendActionButton = (status, isSender, userId) => {
    if (status === 'accepted') {
      return <span className="text-[#4ade80] text-[12px] font-medium px-3 py-1.5 rounded-lg" style={{ background: 'rgba(74,222,128,0.1)' }}>Amis</span>
    }
    if (status === 'pending' && isSender) {
      return <span className="text-[#a0a0b0] text-[12px] font-medium px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>En attente</span>
    }
    if (status === 'pending' && !isSender) {
      return (
        <>
          <button onClick={(e) => { e.preventDefault(); acceptRequest(userId) }} className="bg-[#e50914] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[#ff1a25] transition-colors">
            Accepter
          </button>
          <button onClick={(e) => { e.preventDefault(); rejectRequest(userId) }} className="bg-transparent text-[#a0a0b0] text-[12px] font-medium px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] cursor-pointer hover:text-[#f0f0f0] transition-colors">
            Refuser
          </button>
        </>
      )
    }
    return (
      <button onClick={(e) => { e.preventDefault(); sendRequest(userId) }} className="bg-[#e50914] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[#ff1a25] transition-colors">
        Ajouter
      </button>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Navbar />

      <main className="pt-24 px-4 lg:px-8 pb-12 flex justify-center">
        <div className="w-full max-w-[600px]">

          <h1 className="text-[#f0f0f0] text-2xl font-bold mb-6">Amis</h1>

          {/* Onglets */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {[
              { key: 'friends', label: 'Mes amis', count: friends.length },
              { key: 'search', label: 'Rechercher' },
              { key: 'pending', label: 'Demandes', count: pending.length },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex-1 py-2.5 rounded-lg text-[13px] font-medium border-none cursor-pointer transition-all duration-200 ${
                  tab === t.key
                    ? 'bg-[#e50914] text-white'
                    : 'bg-transparent text-[#a0a0b0] hover:text-[#f0f0f0]'
                }`}
              >
                {t.label}
                {t.count > 0 && <span className="ml-1.5 text-[11px] opacity-70">({t.count})</span>}
              </button>
            ))}
          </div>

          {/* Tab: Mes amis */}
          {tab === 'friends' && (
            <div className="flex flex-col gap-3">
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-3 text-[#333]" viewBox="0 0 24 24" fill="none"><path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 11C11.2091 11 13 9.20914 13 7C13 4.79086 11.2091 3 9 3C6.79086 3 5 4.79086 5 7C5 9.20914 6.79086 11 9 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <p className="text-[#555566] text-sm">Aucun ami pour le moment.</p>
                  <button onClick={() => setTab('search')} className="mt-3 text-[#e50914] text-[13px] font-medium bg-transparent border-none cursor-pointer hover:underline">
                    Rechercher des amis
                  </button>
                </div>
              ) : (
                friends.map(user => (
                  <UserCard key={user.id} user={user} actions={
                    <button onClick={() => removeFriend(user.id)} className="bg-transparent text-[#a0a0b0] text-[12px] font-medium px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] cursor-pointer hover:text-[#e50914] hover:border-[#e50914] transition-colors">
                      Retirer
                    </button>
                  } />
                ))
              )}
            </div>
          )}

          {/* Tab: Rechercher */}
          {tab === 'search' && (
            <div>
              <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} className="flex items-center gap-2.5 rounded-xl py-3 px-4 mb-5">
                <svg className="w-4.5 h-4.5 text-[#a0a0b0] shrink-0" viewBox="0 0 24 24" fill="none"><path d="M21 21L16.65 16.65M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <input
                  type="text"
                  placeholder="Rechercher par nom ou pseudo..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-[#f0f0f0] text-sm w-full placeholder:text-[#555566]"
                  autoFocus
                />
              </div>

              {loading && <p className="text-[#555566] text-sm text-center">Recherche...</p>}

              <div className="flex flex-col gap-3">
                {searchResults.map(user => (
                  <UserCard key={user.id} user={user} actions={
                    friendActionButton(user.friendship_status, user.is_sender, user.id)
                  } />
                ))}
              </div>

              {searchQuery.length >= 2 && !loading && searchResults.length === 0 && (
                <p className="text-[#555566] text-sm text-center mt-6">Aucun utilisateur trouvé.</p>
              )}
            </div>
          )}

          {/* Tab: Demandes en attente */}
          {tab === 'pending' && (
            <div className="flex flex-col gap-3">
              {pending.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-12 h-12 mx-auto mb-3 text-[#333]" viewBox="0 0 24 24" fill="none"><path d="M22 12H16L14 15H10L8 12H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M5.45 5.11L2 12V18C2 18.5304 2.21071 19.0391 2.58579 19.4142C2.96086 19.7893 3.46957 20 4 20H20C20.5304 20 21.0391 19.7893 21.4142 19.4142C21.7893 19.0391 22 18.5304 22 18V12L18.55 5.11C18.3844 4.77679 18.1292 4.49637 17.813 4.30028C17.4967 4.10419 17.1321 4.0002 16.76 4H7.24C6.86792 4.0002 6.50326 4.10419 6.18704 4.30028C5.87083 4.49637 5.61558 4.77679 5.45 5.11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <p className="text-[#555566] text-sm">Aucune demande en attente.</p>
                </div>
              ) : (
                pending.map(user => (
                  <UserCard key={user.id} user={user} actions={
                    <>
                      <button onClick={() => acceptRequest(user.id)} className="bg-[#e50914] text-white text-[12px] font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer hover:bg-[#ff1a25] transition-colors">
                        Accepter
                      </button>
                      <button onClick={() => rejectRequest(user.id)} className="bg-transparent text-[#a0a0b0] text-[12px] font-medium px-3 py-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] cursor-pointer hover:text-[#f0f0f0] transition-colors">
                        Refuser
                      </button>
                    </>
                  } />
                ))
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

export default Friends
