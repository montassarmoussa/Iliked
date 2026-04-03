import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'
import Logo from '../components/Logo'

// Page de configuration du profil — affichée après la première inscription (sans navbar)
function Setup() {
  const navigate = useNavigate()
  const [preview, setPreview] = useState(null)
  const [form, setForm] = useState({
    username: '',
    city: '',
    country: '',
    picture: null,
  })

  useEffect(() => {
    api.get('/user').then(res => {
      setForm(prev => ({ ...prev, username: res.data.username || '' }))
    }).catch(() => {})
  }, [])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

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
      if (form.username) data.append('username', form.username)
      if (form.city) data.append('city', form.city)
      if (form.country) data.append('country', form.country)
      if (form.picture) data.append('picture', form.picture)

      await api.post('/user/setup', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Profil mis à jour !')
      navigate('/home')
    } catch (error) {
      if (error.response?.status === 422) {
        Object.values(error.response.data.errors).forEach((msgs) => msgs.forEach((m) => toast.error(m)))
      }
    }
  }

  const handleSkip = () => {
    navigate('/home')
  }

  const inputStyle = { padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f0f0f0', fontSize: '13px', outline: 'none', width: '100%', transition: 'all 0.3s ease' }
  const labelClass = "block text-[12px] font-medium text-[#a0a0b0] mb-1"

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      {/* Orbes flous */}
      <div className="absolute w-[600px] h-[600px] bg-[#e50914] rounded-full blur-[120px] opacity-12 -top-[200px] -right-[150px] z-0" />
      <div className="absolute w-[500px] h-[500px] bg-[#1a1a6e] rounded-full blur-[120px] opacity-15 -bottom-[150px] -left-[150px] z-0" />

      {/* Card */}
      <div
        style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)' }}
        className="relative z-1 w-full max-w-[480px] rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden py-10 px-12"
      >
        {/* Logo */}
        <div className="text-[20px] font-extrabold tracking-tight mb-6 text-center">
          <Logo />
        </div>

        <h1 className="text-[22px] font-bold mb-1 tracking-tight text-[#f0f0f0] text-center">Configure ton profil</h1>
        <p className="text-[#a0a0b0] text-[13px] text-center mb-8">Personnalise ton compte avant de commencer</p>

        <form onSubmit={handleSubmit}>
          {/* Photo de profil */}
          <div className="flex flex-col items-center mb-8">
            <label htmlFor="picture-upload" className="cursor-pointer group">
              <div
                style={{ border: '2px dashed rgba(255,255,255,0.15)' }}
                className="w-24 h-24 rounded-full overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:border-[#e50914]"
              >
                {preview ? (
                  <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-8 h-8 text-[#555566] group-hover:text-[#e50914] transition-colors" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 16.8V9.2C3 8.0799 3 7.51984 3.21799 7.09202C3.40973 6.71569 3.71569 6.40973 4.09202 6.21799C4.51984 6 5.0799 6 6.2 6H7.25464C7.37758 6 7.43905 6 7.49576 5.9935C7.79166 5.95961 8.05705 5.79559 8.21969 5.54609C8.25086 5.49827 8.27836 5.44328 8.33333 5.33333C8.44329 5.11342 8.49827 5.00346 8.56062 4.90782C8.8859 4.40882 9.41668 4.07333 10.0085 4.01723C10.1219 4.00553 10.2411 4.00277 10.48 4H13.52C13.7589 4.00277 13.8781 4.00553 13.9915 4.01723C14.5833 4.07333 15.1141 4.40882 15.4394 4.90782C15.5017 5.00346 15.5567 5.11342 15.6667 5.33333C15.7216 5.44328 15.7491 5.49827 15.7803 5.54609C15.943 5.79559 16.2083 5.95961 16.5042 5.9935C16.561 6 16.6224 6 16.7454 6H17.8C18.9201 6 19.4802 6 19.908 6.21799C20.2843 6.40973 20.5903 6.71569 20.782 7.09202C21 7.51984 21 8.0799 21 9.2V16.8C21 17.9201 21 18.4802 20.782 18.908C20.5903 19.2843 20.2843 19.5903 19.908 19.782C19.4802 20 18.9201 20 17.8 20H6.2C5.0799 20 4.51984 20 4.09202 19.782C3.71569 19.5903 3.40973 19.2843 3.21799 18.908C3 18.4802 3 17.9201 3 16.8Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
            </label>
            <input id="picture-upload" type="file" accept="image/*" onChange={handlePicture} className="hidden" />
            <p className="text-[11px] text-[#555566] mt-2">Clique pour ajouter une photo</p>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className={labelClass}>Nom d'utilisateur</label>
            <input type="text" name="username" placeholder="johndoe" value={form.username} onChange={handleChange} style={inputStyle} />
          </div>

          {/* Country + City */}
          <div className="flex gap-3">
            <div className="flex-1 mb-4">
              <label className={labelClass}>Pays <span className="text-[#555566]">(optionnel)</span></label>
              <input type="text" name="country" placeholder="France" value={form.country} onChange={handleChange} style={inputStyle} />
            </div>
            <div className="flex-1 mb-4">
              <label className={labelClass}>Ville <span className="text-[#555566]">(optionnel)</span></label>
              <input type="text" name="city" placeholder="Paris" value={form.city} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* Boutons */}
          <button type="submit" style={{ padding: '12px 0' }} className="w-full mt-4 bg-[#e50914] text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-[#ff1a25] hover:shadow-[0_0_24px_rgba(229,9,20,0.3)] hover:-translate-y-0.5 active:translate-y-0">
            Continuer
          </button>

          <button type="button" onClick={handleSkip} style={{ padding: '12px 0' }} className="w-full mt-3 bg-transparent text-[#a0a0b0] border border-[rgba(255,255,255,0.1)] rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:text-[#f0f0f0] hover:border-[rgba(255,255,255,0.2)]">
            Passer pour l'instant
          </button>
        </form>
      </div>
    </div>
  )
}

export default Setup
