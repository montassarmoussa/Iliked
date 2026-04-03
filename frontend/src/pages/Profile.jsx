import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'
import Navbar from '../components/Navbar'

function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    email: '',
    username: '',
    first_name: '',
    last_name: '',
    city: '',
    country: '',
    age: '',
    sexe: '',
    picture: null,
  })

  // Charge les données du user
  useEffect(() => {
    api.get('/user').then((res) => {
      const u = res.data
      setUser(u)
      setForm({
        email: u.email || '',
        username: u.username || '',
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        city: u.city || '',
        country: u.country || '',
        age: u.age || '',
        sexe: u.sexe || '',
        picture: null,
      })
      if (u.picture) setPreview(u.picture)
    }).catch(() => navigate('/'))
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handlePicture = (e) => {
    const file = e.target.files[0]
    if (file) {
      setForm({ ...form, picture: file })
      setPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = new FormData()
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== '') data.append(key, val)
      })

      const res = await api.post('/user/setup', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser(res.data.user)
      toast.success('Profil mis à jour !')
    } catch (error) {
      if (error.response?.status === 422) {
        Object.values(error.response.data.errors).forEach((msgs) => msgs.forEach((m) => toast.error(m)))
      }
    }
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

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } catch {}
    localStorage.removeItem('token')
    navigate('/')
  }

  const inputStyle = { padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f0f0f0', fontSize: '13px', outline: 'none', width: '100%', transition: 'all 0.3s ease' }
  const labelClass = "block text-[12px] font-medium text-[#a0a0b0] mb-1"

  if (!user) return null

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Navbar />

      <main className="pt-24 px-4 pb-12 flex justify-center">
        <div className="w-full max-w-[520px]">

          {/* Header profil */}
          <div className="flex flex-col items-center mb-10">
            <label htmlFor="profile-pic" className="cursor-pointer group relative">
              <div style={{ border: '2px solid rgba(255,255,255,0.1)' }} className="w-28 h-28 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:border-[#e50914]">
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#555566]" style={{ background: 'rgba(255,255,255,0.06)' }}>
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              {/* Overlay sombre + icône stylo au hover */}
              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'rgba(0,0,0,0.6)' }}>
                <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </label>
            <input id="profile-pic" type="file" accept="image/*" onChange={handlePicture} className="hidden" />
            <h1 className="text-[#f0f0f0] text-xl font-bold mt-4">{user.username}</h1>
            <p className="text-[#a0a0b0] text-sm">{user.email}</p>
          </div>

          {/* Formulaire */}
          <form onSubmit={handleSubmit}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="p-6 mb-6">
              <h2 className="text-[#f0f0f0] text-[15px] font-semibold mb-5">Informations personnelles</h2>

              {/* Email avec icône stylo */}
              <div className="mb-4">
                <label className={labelClass}>
                  Email
                  <button type="button" onClick={() => { const el = document.getElementById('email-input'); el.focus(); el.select() }} className="bg-transparent border-none cursor-pointer text-[#555566] hover:text-[#e50914] transition-colors p-0 ml-1.5 align-middle inline-flex">
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87891 20 1.87891C20.5626 1.87891 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1213 3.43762 22.1213 4.00023C22.1213 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </label>
                <input id="email-input" type="email" name="email" value={form.email} onChange={handleChange} style={inputStyle} />
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className={labelClass}>Prénom</label>
                  <input type="text" name="first_name" value={form.first_name} onChange={handleChange} style={inputStyle} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Nom</label>
                  <input type="text" name="last_name" value={form.last_name} onChange={handleChange} style={inputStyle} />
                </div>
              </div>

              <div className="mb-4">
                <label className={labelClass}>Nom d'utilisateur</label>
                <input type="text" name="username" value={form.username} onChange={handleChange} style={inputStyle} />
              </div>

              <div className="flex gap-3 mb-4">
                <div className="flex-1">
                  <label className={labelClass}>Âge <span className="text-[#555566]">(optionnel)</span></label>
                  <input type="number" name="age" value={form.age} onChange={handleChange} style={inputStyle} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Sexe <span className="text-[#555566]">(optionnel)</span></label>
                  <select name="sexe" value={form.sexe} onChange={handleChange} style={inputStyle}>
                    <option value="">—</option>
                    <option value="homme">Homme</option>
                    <option value="femme">Femme</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Pays <span className="text-[#555566]">(optionnel)</span></label>
                  <input type="text" name="country" value={form.country} onChange={handleChange} style={inputStyle} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Ville <span className="text-[#555566]">(optionnel)</span></label>
                  <input type="text" name="city" value={form.city} onChange={handleChange} style={inputStyle} />
                </div>
              </div>
            </div>

            <button type="submit" style={{ padding: '12px 0' }} className="w-full bg-[#e50914] text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-[#ff1a25] hover:shadow-[0_0_24px_rgba(229,9,20,0.3)] hover:-translate-y-0.5 active:translate-y-0">
              Sauvegarder
            </button>
          </form>

          {/* Section amis */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px' }} className="p-6 mt-6">
            <h2 className="text-[#f0f0f0] text-[15px] font-semibold mb-3">Amis</h2>
            <p className="text-[#555566] text-sm">Bientôt disponible — tu pourras voir ta liste d'amis ici.</p>
          </div>

          {/* Zone danger */}
          <div style={{ background: 'rgba(229,9,20,0.05)', border: '1px solid rgba(229,9,20,0.15)', borderRadius: '16px' }} className="p-6 mt-6">
            <h2 className="text-[#f0f0f0] text-[15px] font-semibold mb-3">Zone dangereuse</h2>

            <button onClick={handleLogout} style={{ padding: '10px 0' }} className="w-full mb-3 bg-transparent text-[#a0a0b0] border border-[rgba(255,255,255,0.1)] rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:text-[#f0f0f0] hover:border-[rgba(255,255,255,0.2)]">
              Se déconnecter
            </button>

            <button onClick={handleDeleteAccount} style={{ padding: '10px 0' }} className="w-full bg-transparent text-[#e50914] border border-[rgba(229,9,20,0.3)] rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:bg-[#e50914] hover:text-white">
              Supprimer mon compte
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}

export default Profile
