import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'
import Navbar from '../components/Navbar'

function Messages() {
  const [conversations, setConversations] = useState([])
  const [activeChat, setActiveChat] = useState(null) // friend object
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const pollRef = useRef(null)

  useEffect(() => {
    api.get('/user').then(r => setCurrentUser(r.data)).catch(() => {})
    loadConversations()
  }, [])

  // Polling des nouvelles conversations toutes les 5s
  useEffect(() => {
    pollRef.current = setInterval(() => {
      loadConversations()
      if (activeChat) loadMessages(activeChat.id, true)
    }, 5000)
    return () => clearInterval(pollRef.current)
  }, [activeChat])

  // Scroll en bas quand nouveaux messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadConversations = () => {
    api.get('/messages').then(r => setConversations(r.data)).catch(() => {})
  }

  const loadMessages = (friendId, silent = false) => {
    api.get(`/messages/${friendId}`).then(r => {
      setMessages(r.data)
      if (!silent) loadConversations()
    }).catch(() => {})
  }

  const openChat = (friend) => {
    setActiveChat(friend)
    loadMessages(friend.id)
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat || sending) return
    setSending(true)
    try {
      const res = await api.post(`/messages/${activeChat.id}`, { content: newMessage })
      setMessages(prev => [...prev, res.data])
      setNewMessage('')
      loadConversations()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur')
    }
    setSending(false)
  }

  const timeAgo = (date) => {
    const now = new Date()
    const d = new Date(date)
    const diff = Math.floor((now - d) / 1000)
    if (diff < 60) return "à l'instant"
    if (diff < 3600) return `${Math.floor(diff / 60)}min`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    if (diff < 604800) return `${Math.floor(diff / 86400)}j`
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread_count, 0)

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Navbar />

      <main className="pt-16 h-screen flex">
        {/* Sidebar conversations */}
        <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-[360px] lg:w-[400px] border-r border-[rgba(255,255,255,0.07)] h-full`}>
          {/* Header sidebar */}
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
            <h1 className="text-[#f0f0f0] text-lg font-bold">
              Messages
              {totalUnread > 0 && <span className="ml-2 text-[12px] font-semibold text-[#e50914]">({totalUnread})</span>}
            </h1>
          </div>

          {/* Liste conversations */}
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6">
                <svg className="w-12 h-12 mb-3 text-[#333]" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <p className="text-[#555566] text-sm text-center">Aucune conversation.</p>
                <Link to="/friends" className="mt-2 text-[#e50914] text-[13px] font-medium no-underline hover:underline">Ajouter des amis</Link>
              </div>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.friend.id}
                  onClick={() => openChat(conv.friend)}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-left bg-transparent border-none cursor-pointer transition-colors ${
                    activeChat?.id === conv.friend.id ? 'bg-[rgba(255,255,255,0.06)]' : 'hover:bg-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div style={{ border: '1px solid rgba(255,255,255,0.1)' }} className="w-11 h-11 rounded-full overflow-hidden">
                      {conv.friend.picture ? (
                        <img src={conv.friend.picture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#555566]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                          <span className="text-sm font-medium">{conv.friend.first_name?.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#e50914] rounded-full flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">{conv.unread_count}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-[13px] font-medium truncate ${conv.unread_count > 0 ? 'text-[#f0f0f0]' : 'text-[#a0a0b0]'}`}>
                        {conv.friend.first_name} {conv.friend.last_name}
                      </p>
                      {conv.last_message && (
                        <span className="text-[#555566] text-[11px] flex-shrink-0 ml-2">{timeAgo(conv.last_message.created_at)}</span>
                      )}
                    </div>
                    {conv.last_message ? (
                      <p className={`text-[12px] truncate mt-0.5 ${conv.unread_count > 0 ? 'text-[#a0a0b0] font-medium' : 'text-[#555566]'}`}>
                        {conv.last_message.sender_id === currentUser?.id ? 'Toi : ' : ''}{conv.last_message.content}
                      </p>
                    ) : (
                      <p className="text-[#555566] text-[12px] mt-0.5 italic">Aucun message</p>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Zone de chat */}
        <div className={`${!activeChat ? 'hidden md:flex' : 'flex'} flex-col flex-1 h-full`}>
          {activeChat ? (
            <>
              {/* Header chat */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-[rgba(255,255,255,0.07)]">
                {/* Bouton retour mobile */}
                <button onClick={() => setActiveChat(null)} className="md:hidden bg-transparent border-none cursor-pointer text-[#a0a0b0] p-1 hover:text-[#f0f0f0] transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>

                <Link to={`/user/${activeChat.username}`} className="flex items-center gap-3 no-underline">
                  <div style={{ border: '1px solid rgba(255,255,255,0.1)' }} className="w-9 h-9 rounded-full overflow-hidden">
                    {activeChat.picture ? (
                      <img src={activeChat.picture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#555566]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <span className="text-sm">{activeChat.first_name?.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-[#f0f0f0] text-[14px] font-medium">{activeChat.first_name} {activeChat.last_name}</p>
                    <p className="text-[#555566] text-[11px]">@{activeChat.username}</p>
                  </div>
                </Link>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1.5">
                {messages.length === 0 && (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-[#555566] text-sm">Envoie le premier message !</p>
                  </div>
                )}
                {messages.map((msg, i) => {
                  const isMe = msg.sender_id === currentUser?.id
                  const showTime = i === 0 || (new Date(msg.created_at) - new Date(messages[i - 1].created_at)) > 300000

                  return (
                    <div key={msg.id}>
                      {showTime && (
                        <p className="text-[#555566] text-[10px] text-center my-3">{formatTime(msg.created_at)}</p>
                      )}
                      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[75%] px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed ${
                            isMe
                              ? 'bg-[#e50914] text-white rounded-br-md'
                              : 'text-[#f0f0f0] rounded-bl-md'
                          }`}
                          style={!isMe ? { background: 'rgba(255,255,255,0.08)' } : {}}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input message */}
              <form onSubmit={sendMessage} className="px-5 py-3 border-t border-[rgba(255,255,255,0.07)]">
                <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }} className="flex items-center gap-3 rounded-xl px-4 py-2.5">
                  <input
                    type="text"
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="bg-transparent border-none outline-none text-[#f0f0f0] text-sm w-full placeholder:text-[#555566]"
                    autoFocus
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="bg-transparent border-none cursor-pointer text-[#e50914] p-1 hover:text-[#ff1a25] transition-colors disabled:text-[#555566] disabled:cursor-default"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </button>
                </div>
              </form>
            </>
          ) : (
            /* Placeholder quand aucune conversation sélectionnée */
            <div className="flex-1 flex flex-col items-center justify-center">
              <svg className="w-16 h-16 mb-4 text-[#222]" viewBox="0 0 24 24" fill="none"><path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <p className="text-[#555566] text-sm">Sélectionne une conversation</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default Messages
