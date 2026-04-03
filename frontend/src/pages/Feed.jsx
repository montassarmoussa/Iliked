import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'
import Navbar from '../components/Navbar'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const POSTER_SM = 'https://image.tmdb.org/t/p/w154'

// Composant récursif pour les commentaires imbriqués style Reddit
function CommentThread({ comment, allComments, postId, depth, timeAgo, onLike, onReply, onDelete, currentUserId, newComments, setNewComments, inputStyle }) {
  const [showReply, setShowReply] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const replies = allComments.filter(c => c.parent_id === comment.id)
  const replyKey = `reply-${comment.id}`
  const maxDepth = 4

  return (
    <div className="relative">
      {/* Ligne verticale de connexion style Reddit */}
      {depth > 0 && (
        <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'rgba(255,255,255,0.08)', marginLeft: '-12px' }} />
      )}

      <div style={{ marginLeft: depth > 0 ? '24px' : '0' }}>
        {/* Commentaire */}
        <div className="flex gap-2.5 py-2">
          <Link to={`/user/${comment.username}`} className="flex-shrink-0">
            {comment.user_picture ? (
              <img src={comment.user_picture} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[#555566] text-[10px]" style={{ background: 'rgba(255,255,255,0.06)' }}>{comment.username?.charAt(0).toUpperCase()}</div>
            )}
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-[12px]">
              <Link to={`/user/${comment.username}`} className="text-[#f0f0f0] font-semibold no-underline hover:text-[#e50914]">@{comment.username}</Link>
              <span className="text-[#555566] ml-2">{timeAgo(comment.created_at)}</span>
            </p>
            <p className="text-[#a0a0b0] text-[13px] mt-0.5 leading-relaxed">{comment.content}</p>

            {/* Actions du commentaire */}
            <div className="flex items-center gap-4 mt-1.5">
              {/* Like commentaire */}
              <button onClick={() => onLike(postId, comment.id)} style={{ background: 'transparent' }} className={`border-none cursor-pointer flex items-center gap-1 text-[11px] font-medium transition-colors ${comment.liked ? 'text-[#e50914]' : 'text-[#555566] hover:text-[#e50914]'}`}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill={comment.liked ? '#e50914' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                {comment.likes_count > 0 && comment.likes_count}
              </button>

              {/* Répondre */}
              {depth < maxDepth && (
                <button onClick={() => setShowReply(!showReply)} style={{ background: 'transparent' }} className="border-none cursor-pointer text-[11px] font-medium text-[#555566] hover:text-[#60a5fa] transition-colors">
                  Répondre
                </button>
              )}

              {/* Réduire les réponses */}
              {replies.length > 0 && (
                <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'transparent' }} className="border-none cursor-pointer text-[11px] font-medium text-[#555566] hover:text-[#a0a0b0] transition-colors">
                  {collapsed ? `+ ${replies.length} réponse${replies.length > 1 ? 's' : ''}` : 'Réduire'}
                </button>
              )}

              {/* Supprimer — uniquement si c'est le owner du commentaire */}
              {currentUserId === comment.user_id && (
                <button onClick={() => onDelete(postId, comment.id)} style={{ background: 'transparent' }} className="border-none cursor-pointer text-[11px] font-medium text-[#555566] hover:text-[#e50914] transition-colors">
                  Supprimer
                </button>
              )}
            </div>

            {/* Input réponse */}
            {showReply && (
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newComments[replyKey] || ''}
                  onChange={(e) => setNewComments(prev => ({ ...prev, [replyKey]: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') { onReply(postId, comment.id, replyKey); setShowReply(false) } }}
                  placeholder={`Répondre à @${comment.username}...`}
                  style={{ ...inputStyle, fontSize: '11px', padding: '6px 10px' }}
                  autoFocus
                />
                <button onClick={() => { onReply(postId, comment.id, replyKey); setShowReply(false) }} style={{ padding: '6px 12px' }} className="bg-[#e50914] text-white border-none rounded-lg text-[11px] font-semibold cursor-pointer shrink-0 hover:bg-[#ff1a25] transition-colors">
                  Envoyer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Réponses imbriquées (récursif) */}
        {!collapsed && replies.map(reply => (
          <CommentThread
            key={reply.id}
            comment={reply}
            allComments={allComments}
            postId={postId}
            depth={depth + 1}
            timeAgo={timeAgo}
            onLike={onLike}
            onReply={onReply}
            onDelete={onDelete}
            currentUserId={currentUserId}
            newComments={newComments}
            setNewComments={setNewComments}
            inputStyle={inputStyle}
          />
        ))}
      </div>
    </div>
  )
}

function Feed() {
  const [currentUser, setCurrentUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [filmCache, setFilmCache] = useState({})
  const [newPost, setNewPost] = useState('')
  const [filmSearch, setFilmSearch] = useState('')
  const [filmResults, setFilmResults] = useState([])
  const [selectedFilm, setSelectedFilm] = useState(null)
  const [expandedComments, setExpandedComments] = useState({})
  const [commentsCache, setCommentsCache] = useState({})
  const [newComments, setNewComments] = useState({})
  const [likedPosts, setLikedPosts] = useState({})
  const [activeTab, setActiveTab] = useState('pour-vous')

  // Charge le user courant
  useEffect(() => {
    api.get('/user').then(r => setCurrentUser(r.data)).catch(() => {})
  }, [])

  // Charge les posts selon l'onglet
  useEffect(() => {
    const endpoint = activeTab === 'abonnements' ? '/posts/following' : '/posts'
    api.get(endpoint).then(r => setPosts(r.data)).catch(() => {})
  }, [activeTab])

  // Charge les statuts liked pour chaque post
  useEffect(() => {
    if (!posts.length) return
    posts.forEach(post => {
      api.get(`/posts/${post.id}/status`).then(r => {
        setLikedPosts(prev => ({ ...prev, [post.id]: r.data.liked }))
      }).catch(() => {})
    })
  }, [posts])

  // Fetch les infos TMDB des films liés aux posts
  useEffect(() => {
    if (!posts.length) return
    const filmIds = posts.filter(p => p.film_id).map(p => p.film_id)
    const uniqueIds = [...new Set(filmIds)]
    const missing = uniqueIds.filter(id => !filmCache[id])
    if (!missing.length) return

    Promise.all(
      missing.map(id =>
        fetch(`https://api.themoviedb.org/3/movie/${id}?language=fr-FR`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
        }).then(r => r.json()).catch(() => null)
      )
    ).then(results => {
      const newCache = { ...filmCache }
      results.filter(Boolean).forEach(m => { newCache[m.id] = m })
      setFilmCache(newCache)
    })
  }, [posts])

  // Recherche de film pour lier au post
  useEffect(() => {
    if (filmSearch.length < 2) { setFilmResults([]); return }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(filmSearch)}&language=fr-FR`, {
          headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
        })
        const data = await res.json()
        setFilmResults(data.results?.slice(0, 5) || [])
      } catch {}
    }, 300)
    return () => clearTimeout(timeout)
  }, [filmSearch])

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

  // Créer un post
  const handleCreatePost = async (e) => {
    e.preventDefault()
    if (!newPost.trim()) return
    try {
      const res = await api.post('/posts', {
        content: newPost,
        film_id: selectedFilm?.id || null,
      })
      setPosts([res.data, ...posts])
      setNewPost('')
      setSelectedFilm(null)
      setFilmSearch('')
      if (selectedFilm) {
        setFilmCache(prev => ({ ...prev, [selectedFilm.id]: selectedFilm }))
      }
    } catch (error) {
      toast.error('Erreur lors de la publication')
    }
  }

  // Supprimer un post
  const handleDeletePost = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`)
      setPosts(posts.filter(p => p.id !== postId))
      toast.success('Post supprimé')
    } catch {}
  }

  // Like / unlike un post
  const togglePostLike = async (postId) => {
    const isLiked = likedPosts[postId]
    try {
      if (isLiked) {
        const res = await api.delete(`/posts/${postId}/like`)
        setLikedPosts(prev => ({ ...prev, [postId]: false }))
        setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: res.data.likes_count } : p))
      } else {
        const res = await api.post(`/posts/${postId}/like`)
        setLikedPosts(prev => ({ ...prev, [postId]: true }))
        setPosts(posts.map(p => p.id === postId ? { ...p, likes_count: res.data.likes_count } : p))
      }
    } catch {}
  }

  // Toggle commentaires
  const toggleComments = async (postId) => {
    if (expandedComments[postId]) {
      setExpandedComments(prev => ({ ...prev, [postId]: false }))
      return
    }
    try {
      const res = await api.get(`/posts/${postId}/comments`)
      setCommentsCache(prev => ({ ...prev, [postId]: res.data }))
      setExpandedComments(prev => ({ ...prev, [postId]: true }))
    } catch {}
  }

  // Ajouter un commentaire ou une réponse
  const handleAddComment = async (postId, parentId = null, replyKey = null) => {
    const key = replyKey || postId
    const content = newComments[key]
    if (!content?.trim()) return
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content, parent_id: parentId })
      setCommentsCache(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), res.data]
      }))
      setNewComments(prev => ({ ...prev, [key]: '' }))
      setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p))
    } catch {}
  }

  // Like / unlike un commentaire
  const toggleCommentLike = async (postId, commentId) => {
    const comments = commentsCache[postId] || []
    const comment = comments.find(c => c.id === commentId)
    if (!comment) return

    try {
      if (comment.liked) {
        const res = await api.delete(`/post-comments/${commentId}/like`)
        setCommentsCache(prev => ({
          ...prev,
          [postId]: prev[postId].map(c => c.id === commentId ? { ...c, liked: false, likes_count: res.data.likes_count } : c)
        }))
      } else {
        const res = await api.post(`/post-comments/${commentId}/like`)
        setCommentsCache(prev => ({
          ...prev,
          [postId]: prev[postId].map(c => c.id === commentId ? { ...c, liked: true, likes_count: res.data.likes_count } : c)
        }))
      }
    } catch {}
  }

  // Supprimer un commentaire
  const handleDeleteComment = async (postId, commentId) => {
    try {
      await api.delete(`/post-comments/${commentId}`)
      setCommentsCache(prev => ({
        ...prev,
        [postId]: prev[postId].filter(c => c.id !== commentId && c.parent_id !== commentId)
      }))
      setPosts(posts.map(p => p.id === postId ? { ...p, comments_count: Math.max(0, p.comments_count - 1) } : p))
      toast.success('Commentaire supprimé')
    } catch {}
  }

  const inputStyle = { padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f0f0f0', fontSize: '13px', outline: 'none', width: '100%' }

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Navbar />

      <main className="pt-24 px-4 lg:px-8 pb-12 flex justify-center">
        <div className="w-full max-w-[750px]">
          <h1 className="text-[#f0f0f0] text-2xl font-bold mb-4">Feed</h1>

          {/* Onglets */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <button
              onClick={() => setActiveTab('pour-vous')}
              style={{ padding: '10px 0', background: activeTab === 'pour-vous' ? 'rgba(255,255,255,0.08)' : 'transparent', borderRadius: '10px' }}
              className={`flex-1 border-none cursor-pointer text-sm font-medium transition-all duration-300 ${activeTab === 'pour-vous' ? 'text-[#f0f0f0]' : 'text-[#555566] hover:text-[#a0a0b0]'}`}
            >
              Pour vous
            </button>
            <button
              onClick={() => setActiveTab('abonnements')}
              style={{ padding: '10px 0', background: activeTab === 'abonnements' ? 'rgba(255,255,255,0.08)' : 'transparent', borderRadius: '10px' }}
              className={`flex-1 border-none cursor-pointer text-sm font-medium transition-all duration-300 ${activeTab === 'abonnements' ? 'text-[#f0f0f0]' : 'text-[#555566] hover:text-[#a0a0b0]'}`}
            >
              Abonnements
            </button>
          </div>

          {/* Créer un post */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="p-5 mb-6">
            <form onSubmit={handleCreatePost}>
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Partage ton avis, une anecdote, une recommandation..."
                rows={3}
                style={{ ...inputStyle, resize: 'none', marginBottom: '12px' }}
              />

              {/* Film sélectionné */}
              {selectedFilm && (
                <div className="flex items-center gap-3 mb-3 p-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {selectedFilm.poster_path && (
                    <img src={POSTER_SM + selectedFilm.poster_path} alt="" className="w-8 h-12 rounded-lg object-cover" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[#f0f0f0] text-[13px] font-medium truncate">{selectedFilm.title}</p>
                    <p className="text-[#555566] text-[11px]">{selectedFilm.release_date ? new Date(selectedFilm.release_date).getFullYear() : ''}</p>
                  </div>
                  <button type="button" onClick={() => { setSelectedFilm(null); setFilmSearch('') }} style={{ background: 'transparent' }} className="border-none cursor-pointer text-[#555566] hover:text-[#e50914] text-lg p-1">x</button>
                </div>
              )}

              {/* Recherche film */}
              {!selectedFilm && (
                <div className="relative mb-3">
                  <input
                    type="text"
                    value={filmSearch}
                    onChange={(e) => setFilmSearch(e.target.value)}
                    placeholder="Lier un film (optionnel)..."
                    style={{ ...inputStyle, fontSize: '12px' }}
                  />
                  {filmResults.length > 0 && (
                    <div style={{ background: 'rgba(20,20,25,0.95)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)' }} className="absolute top-full left-0 w-full mt-1 rounded-xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-10">
                      {filmResults.map(film => (
                        <button key={film.id} onClick={() => { setSelectedFilm(film); setFilmResults([]); setFilmSearch('') }} className="w-full flex items-center gap-3 p-2.5 text-left bg-transparent border-none cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors">
                          {film.poster_path ? (
                            <img src={`https://image.tmdb.org/t/p/w92${film.poster_path}`} alt="" className="w-8 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-8 h-12 rounded-lg flex items-center justify-center text-[#555566]" style={{ background: 'rgba(255,255,255,0.06)' }}>?</div>
                          )}
                          <div>
                            <p className="text-[#f0f0f0] text-[12px] font-medium">{film.title}</p>
                            <p className="text-[#555566] text-[11px]">{film.release_date ? new Date(film.release_date).getFullYear() : ''}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button type="submit" style={{ padding: '10px 24px' }} className="bg-[#e50914] text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-[#ff1a25] hover:shadow-[0_0_24px_rgba(229,9,20,0.3)]">
                Publier
              </button>
            </form>
          </div>

          {/* Liste des posts */}
          <div className="flex flex-col gap-4">
            {posts.map(post => {
              const film = post.film_id ? filmCache[post.film_id] : null
              const isLiked = likedPosts[post.id]
              const comments = commentsCache[post.id] || []
              const isExpanded = expandedComments[post.id]

              return (
                <div key={post.id} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="overflow-hidden">

                  {/* Header */}
                  <div className="flex items-center gap-3 p-4 pb-2">
                    <Link to={`/user/${post.username}`}>
                      {post.user_picture ? (
                        <img src={post.user_picture} alt="" className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[#555566] text-sm font-semibold" style={{ background: 'rgba(255,255,255,0.06)' }}>{post.username?.charAt(0).toUpperCase()}</div>
                      )}
                    </Link>
                    <div className="flex-1">
                      <Link to={`/user/${post.username}`} className="text-[#f0f0f0] text-[14px] font-semibold no-underline hover:text-[#e50914] transition-colors">@{post.username}</Link>
                      <p className="text-[#555566] text-[11px]">{timeAgo(post.created_at)}</p>
                    </div>
                    {/* Menu */}
                    <button onClick={() => handleDeletePost(post.id)} style={{ background: 'transparent' }} className="border-none cursor-pointer text-[#555566] hover:text-[#e50914] transition-colors p-1">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M3 6H5H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6M8 6V4C8 2.89543 8.89543 2 10 2H14C15.1046 2 16 2.89543 16 4V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>

                  {/* Contenu */}
                  <div className="px-4 pb-3">
                    <p className="text-[#f0f0f0] text-[14px] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                  </div>

                  {/* Film lié */}
                  {film && (
                    <Link to={`/film/${film.id}`} className="flex gap-3 mx-4 mb-3 p-3 no-underline hover:bg-[rgba(255,255,255,0.03)] transition-colors" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                      {film.poster_path && (
                        <img src={POSTER_SM + film.poster_path} alt="" className="w-14 h-20 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[#f0f0f0] text-[14px] font-semibold">{film.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[#e50914] text-[12px] font-medium">★ {film.vote_average?.toFixed(1)}</span>
                          <span className="text-[#555566] text-[12px]">{film.release_date ? new Date(film.release_date).getFullYear() : ''}</span>
                        </div>
                        {film.genres && <p className="text-[#555566] text-[11px] mt-1 truncate">{film.genres.map(g => g.name).join(', ')}</p>}
                      </div>
                    </Link>
                  )}

                  {/* Actions — like, commenter, partager */}
                  <div className="flex items-center gap-6 px-4 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {/* Like */}
                    <button onClick={() => togglePostLike(post.id)} style={{ background: 'transparent' }} className={`border-none cursor-pointer flex items-center gap-1.5 text-[13px] font-medium transition-colors ${isLiked ? 'text-[#e50914]' : 'text-[#555566] hover:text-[#e50914]'}`}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill={isLiked ? '#e50914' : 'none'}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {post.likes_count > 0 && post.likes_count}
                    </button>

                    {/* Commentaire */}
                    <button onClick={() => toggleComments(post.id)} style={{ background: 'transparent' }} className="border-none cursor-pointer flex items-center gap-1.5 text-[13px] font-medium text-[#555566] hover:text-[#60a5fa] transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      {post.comments_count > 0 && post.comments_count}
                    </button>

                    {/* Partager */}
                    <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/feed`); toast.success('Lien copié') }} style={{ background: 'transparent' }} className="border-none cursor-pointer flex items-center gap-1.5 text-[13px] font-medium text-[#555566] hover:text-[#4ade80] transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"><path d="M4 12V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 6L12 2L8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 2V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>

                  {/* Section commentaires expandable */}
                  {isExpanded && (
                    <div className="px-4 pb-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      {/* Commentaires racines (sans parent) */}
                      {comments.filter(c => !c.parent_id).length > 0 && (
                        <div className="flex flex-col gap-1 pt-3 mb-3">
                          {comments.filter(c => !c.parent_id).map(comment => (
                            <CommentThread
                              key={comment.id}
                              comment={comment}
                              allComments={comments}
                              postId={post.id}
                              depth={0}
                              timeAgo={timeAgo}
                              onLike={toggleCommentLike}
                              onReply={handleAddComment}
                              onDelete={handleDeleteComment}
                              currentUserId={currentUser?.id}
                              newComments={newComments}
                              setNewComments={setNewComments}
                              inputStyle={inputStyle}
                            />
                          ))}
                        </div>
                      )}

                      {/* Ajouter un commentaire racine */}
                      <div className="flex gap-2 pt-2">
                        <input
                          type="text"
                          value={newComments[post.id] || ''}
                          onChange={(e) => setNewComments(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          placeholder="Écrire un commentaire..."
                          style={{ ...inputStyle, fontSize: '12px', padding: '8px 12px' }}
                        />
                        <button onClick={() => handleAddComment(post.id)} style={{ padding: '8px 16px' }} className="bg-[#e50914] text-white border-none rounded-xl text-[12px] font-semibold cursor-pointer shrink-0 hover:bg-[#ff1a25] transition-colors">
                          Envoyer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {posts.length === 0 && (
              <p className="text-[#555566] text-sm text-center mt-10">Aucun post pour le moment. Sois le premier à partager !</p>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Feed
