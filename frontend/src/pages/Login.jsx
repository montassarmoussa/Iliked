import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'

// Page de connexion — appelle POST /api/login
function Login() {
  const navigate = useNavigate()

  // State du formulaire
  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  // Met à jour le state quand l'utilisateur tape dans un champ
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Appel à l'API Laravel
      const response = await api.post('/login', form)

      // Sauvegarde du token dans le localStorage
      localStorage.setItem('token', response.data.token)

      // Notification de succès
      toast.success('Connexion réussie !')

      // Redirection vers la page d'accueil après un court délai (pour voir le toast)
      setTimeout(() => navigate('/'), 3000)
    } catch (error) {
      // Affiche chaque erreur en toast
      if (error.response?.status === 422) {
        const errors = error.response.data.errors
        Object.values(errors).forEach((messages) => {
          messages.forEach((message) => toast.error(message))
        })
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">Iliked</div>
        <h1>Bon retour</h1>
        <p className="subtitle">Connecte-toi pour continuer</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="john@exemple.com" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" name="password" placeholder="Ton mot de passe" value={form.password} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary">Se connecter</button>
        </form>

        <p className="auth-footer">
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
