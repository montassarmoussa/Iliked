import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'
import Logo from '../components/Logo'
import MovieWall from '../components/MovieWall'

function Auth() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(true)
  const [heartExpand, setHeartExpand] = useState(false)
  const [heartStyle, setHeartStyle] = useState({})

  const [registerForm, setRegisterForm] = useState({
    first_name: '', last_name: '', username: '', email: '', password: '', password_confirmation: '',
  })

  const [loginForm, setLoginForm] = useState({ email: '', password: '' })

  const handleRegisterChange = (e) => setRegisterForm({ ...registerForm, [e.target.name]: e.target.value })
  const handleLoginChange = (e) => setLoginForm({ ...loginForm, [e.target.name]: e.target.value })

  const triggerHeartTransition = (destination) => {
    const activePanel = document.querySelector(isRegister ? '.register-panel' : '.login-panel')
    const heart = activePanel?.querySelector('.logo-heart')
    if (heart) {
      const rect = heart.getBoundingClientRect()
      setHeartStyle({ top: rect.top + rect.height / 2, left: rect.left + rect.width / 2 })
    }
    setHeartExpand(true)
    setTimeout(() => navigate(destination), 1500)
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/register', registerForm)
      localStorage.setItem('token', response.data.token)
      toast.success('Inscription réussie !')
      triggerHeartTransition('/setup')
    } catch (error) {
      if (error.response?.status === 422) {
        Object.values(error.response.data.errors).forEach((msgs) => msgs.forEach((m) => toast.error(m)))
      }
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/login', loginForm)
      localStorage.setItem('token', response.data.token)
      toast.success('Connexion réussie !')
      triggerHeartTransition('/home')
    } catch (error) {
      if (error.response?.status === 422) {
        Object.values(error.response.data.errors).forEach((msgs) => msgs.forEach((m) => toast.error(m)))
      }
    }
  }

  // Classes réutilisées
  const inputStyle = { padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f0f0f0', fontSize: '13px', outline: 'none', width: '100%', transition: 'all 0.3s ease' }
  const labelClass = "block text-[12px] font-medium text-[#a0a0b0] mb-1"

  return (
    <div className="min-h-screen flex items-center justify-center p-5 relative overflow-hidden">
      {/* Orbes flous */}
      <div className="absolute w-[600px] h-[600px] bg-accent rounded-full blur-[120px] opacity-12 -top-[200px] -right-[150px] z-0" />
      <div className="absolute w-[500px] h-[500px] bg-[#1a1a6e] rounded-full blur-[120px] opacity-15 -bottom-[150px] -left-[150px] z-0" />

      <MovieWall />

      {/* Coeur plein écran */}
      {heartExpand && (
        <div className="fixed z-[9999] -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ top: `${heartStyle.top}px`, left: `${heartStyle.left}px` }}>
          <svg className="w-2 h-2 block animate-heart-grow" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0 -1028.4)">
              <path d="m7 1031.4c-1.5355 0-3.0784 0.5-4.25 1.7-2.3431 2.4-2.2788 6.1 0 8.5l9.25 9.8 9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-0.75 0.8-0.75-0.8c-1.172-1.2-2.7145-1.7-4.25-1.7z" fill="#e50914"/>
            </g>
          </svg>
        </div>
      )}

      {/* Container principal */}
      <div style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.1)' }} className={`relative z-1 flex flex-col lg:flex-row w-full max-w-[960px] min-h-[640px] rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.5)] overflow-hidden ${isRegister ? '' : 'login-active'}`}>

        {/* Panel inscription */}
        <div className={`register-panel w-full lg:w-1/2 py-10 px-8 lg:px-16 flex flex-col justify-center items-center transition-opacity duration-400 ${!isRegister ? 'opacity-0 pointer-events-none absolute lg:static' : ''}`}>
          <div className="w-full max-w-[340px]">
          <div className="text-[20px] font-extrabold tracking-tight mb-6 text-center [&:hover_.logo-heart]:scale-180">
            <Logo />
          </div>
          <h1 className="text-[22px] font-bold mb-1 tracking-tight text-[#f0f0f0] text-center">Créer un compte</h1>
          <p className="text-[#a0a0b0] text-[13px] text-center">Rejoins la communauté cinéma</p>

          <form onSubmit={handleRegister}>
            <div className="flex gap-3 mt-5">
              <div className="flex-1 mb-3">
                <label className={labelClass}>Prénom</label>
                <input type="text" name="first_name" placeholder="John" value={registerForm.first_name} onChange={handleRegisterChange} style={inputStyle} />
              </div>
              <div className="flex-1 mb-3">
                <label className={labelClass}>Nom</label>
                <input type="text" name="last_name" placeholder="Doe" value={registerForm.last_name} onChange={handleRegisterChange} style={inputStyle} />
              </div>
            </div>
            <div className="mb-3">
              <label className={labelClass}>Nom d'utilisateur</label>
              <input type="text" name="username" placeholder="johndoe" value={registerForm.username} onChange={handleRegisterChange} style={inputStyle} />
            </div>
            <div className="mb-3">
              <label className={labelClass}>Email</label>
              <input type="email" name="email" placeholder="john@exemple.com" value={registerForm.email} onChange={handleRegisterChange} style={inputStyle} />
            </div>
            <div className="mb-3">
              <label className={labelClass}>Mot de passe</label>
              <input type="password" name="password" placeholder="8 caractères minimum" value={registerForm.password} onChange={handleRegisterChange} style={inputStyle} />
            </div>
            <div className="mb-3">
              <label className={labelClass}>Confirmer le mot de passe</label>
              <input type="password" name="password_confirmation" placeholder="Confirmer" value={registerForm.password_confirmation} onChange={handleRegisterChange} style={inputStyle} />
            </div>
            <button type="submit" style={{ padding: '12px 0', marginTop: '28px' }} className="w-full bg-[#e50914] text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-[#ff1a25] hover:shadow-[0_0_24px_rgba(229,9,20,0.3)] hover:-translate-y-0.5 active:translate-y-0">S'inscrire</button>
          </form>

          <p className="text-center mt-5 text-[13px] text-[#a0a0b0]">
            Déjà un compte ? <button type="button" onClick={() => setIsRegister(false)} className="bg-transparent border-none text-[#e50914] text-[13px] font-medium cursor-pointer p-0 hover:text-[#ff1a25] transition-colors">Se connecter</button>
          </p>
          </div>
        </div>

        {/* Panel connexion */}
        <div className={`login-panel w-full lg:w-1/2 py-10 px-8 lg:px-16 flex flex-col justify-center items-center transition-opacity duration-400 ${isRegister ? 'opacity-0 pointer-events-none absolute lg:static' : ''}`}>
          <div className="w-full max-w-[340px]">
          <div className="text-[20px] font-extrabold tracking-tight mb-6 text-center [&:hover_.logo-heart]:scale-180">
            <Logo />
          </div>
          <h1 className="text-[22px] font-bold mb-1 tracking-tight text-[#f0f0f0] text-center">Bon retour</h1>
          <p className="text-[#a0a0b0] text-[13px] mb-5 text-center">Connecte-toi pour continuer</p>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label className={labelClass}>Email</label>
              <input type="email" name="email" placeholder="john@exemple.com" value={loginForm.email} onChange={handleLoginChange} style={inputStyle} />
            </div>
            <div className="mb-3">
              <label className={labelClass}>Mot de passe</label>
              <input type="password" name="password" placeholder="Ton mot de passe" value={loginForm.password} onChange={handleLoginChange} style={inputStyle} />
            </div>
            <button type="submit" style={{ padding: '12px 0', marginTop: '28px' }} className="w-full bg-[#e50914] text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-[#ff1a25] hover:shadow-[0_0_24px_rgba(229,9,20,0.3)] hover:-translate-y-0.5 active:translate-y-0">Se connecter</button>
          </form>

          <p className="text-center mt-5 text-[13px] text-[#a0a0b0]">
            Pas encore de compte ? <button type="button" onClick={() => setIsRegister(true)} className="bg-transparent border-none text-[#e50914] text-[13px] font-medium cursor-pointer p-0 hover:text-[#ff1a25] transition-colors">S'inscrire</button>
          </p>
          </div>
        </div>

        {/* Overlay visuel — slide */}
        <div className={`hidden lg:flex absolute top-0 right-0 w-1/2 h-full items-center justify-center p-12 z-10 transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${isRegister ? 'translate-x-0' : '-translate-x-full'}`}>
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2000 1500" preserveAspectRatio="xMidYMid slice">
            <rect fill="#0d0d0f" width="2000" height="1500"/>
            <defs>
              <radialGradient id="rad" gradientUnits="objectBoundingBox">
                <stop offset="0" stopColor="#e50914"/><stop offset="1" stopColor="#0d0d0f"/>
              </radialGradient>
              <linearGradient id="lin" gradientUnits="userSpaceOnUse" x1="0" y1="750" x2="1550" y2="750">
                <stop offset="0" stopColor="#800000"/><stop offset="1" stopColor="#0d0d0f"/>
              </linearGradient>
              <path id="s" fill="url(#lin)" d="M1549.2 51.6c-5.4 99.1-20.2 197.6-44.2 293.6c-24.1 96-57.4 189.4-99.3 278.6c-41.9 89.2-92.4 174.1-150.3 253.3c-58 79.2-123.4 152.6-195.1 219c-71.7 66.4-149.6 125.8-232.2 177.2c-82.7 51.4-170.1 94.7-260.7 129.1c-90.6 34.4-184.4 60-279.5 76.3C192.6 1495 96.1 1502 0 1500c96.1-2.1 191.8-13.3 285.4-33.6c93.6-20.2 185-49.5 272.5-87.2c87.6-37.7 171.3-83.8 249.6-137.3c78.4-53.5 151.5-114.5 217.9-181.7c66.5-67.2 126.4-140.7 178.6-218.9c52.3-78.3 96.9-161.4 133-247.9c36.1-86.5 63.8-176.2 82.6-267.6c18.8-91.4 28.6-184.4 29.6-277.4c0.3-27.6 23.2-48.7 50.8-48.4s49.5 21.8 49.2 49.5c0 0.7 0 1.3-0.1 2L1549.2 51.6z"/>
              <g id="g">
                <use href="#s" transform="scale(0.12) rotate(60)"/><use href="#s" transform="scale(0.2) rotate(10)"/>
                <use href="#s" transform="scale(0.25) rotate(40)"/><use href="#s" transform="scale(0.3) rotate(-20)"/>
                <use href="#s" transform="scale(0.4) rotate(-30)"/><use href="#s" transform="scale(0.5) rotate(20)"/>
                <use href="#s" transform="scale(0.6) rotate(60)"/><use href="#s" transform="scale(0.7) rotate(10)"/>
                <use href="#s" transform="scale(0.835) rotate(-40)"/><use href="#s" transform="scale(0.9) rotate(40)"/>
                <use href="#s" transform="scale(1.05) rotate(25)"/><use href="#s" transform="scale(1.2) rotate(8)"/>
                <use href="#s" transform="scale(1.333) rotate(-60)"/><use href="#s" transform="scale(1.45) rotate(-30)"/>
                <use href="#s" transform="scale(1.6) rotate(10)"/>
              </g>
            </defs>
            <g transform="translate(560 0)">
              <g>
                <circle fill="url(#rad)" r="3000"/>
                <g opacity="0.5">
                  <circle fill="url(#rad)" r="2000"/><circle fill="url(#rad)" r="1800"/>
                  <circle fill="url(#rad)" r="1700"/><circle fill="url(#rad)" r="1651"/>
                  <circle fill="url(#rad)" r="1450"/><circle fill="url(#rad)" r="1250"/>
                  <circle fill="url(#rad)" r="1175"/><circle fill="url(#rad)" r="900"/>
                  <circle fill="url(#rad)" r="750"/><circle fill="url(#rad)" r="500"/>
                  <circle fill="url(#rad)" r="380"/><circle fill="url(#rad)" r="250"/>
                </g>
                <g className={`svg-curves ${isRegister ? '' : 'rotated'}`}>
                  <use href="#g" transform="rotate(10)"/>
                  <use href="#g" transform="rotate(120)"/>
                  <use href="#g" transform="rotate(240)"/>
                </g>
                <circle fillOpacity="0.19" fill="url(#rad)" r="3000"/>
              </g>
            </g>
          </svg>

          <div className="relative z-1 text-center">
            <h2 className="text-[26px] font-bold mb-4 tracking-tight leading-snug">{isRegister ? 'Découvre. Note. Partage.' : 'Tu nous as manqué.'}</h2>
            <p className="text-text-secondary text-[15px] leading-relaxed">{isRegister
              ? 'Crée tes listes, partage tes avis et explore le cinéma avec une communauté passionnée.'
              : 'Retrouve tes listes, tes reviews et ta communauté.'
            }</p>
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full text-center py-4 text-[13px] text-text-secondary z-2 flex items-center justify-center gap-1.5">
        Moussa Montassar — fait avec
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0 -1028.4)">
            <path d="m7 1031.4c-1.5355 0-3.0784 0.5-4.25 1.7-2.3431 2.4-2.2788 6.1 0 8.5l9.25 9.8 9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-0.75 0.8-0.75-0.8c-1.172-1.2-2.7145-1.7-4.25-1.7z" fill="#e50914"/>
          </g>
        </svg>
        — Tous droits réservés © {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default Auth
