import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../api'

// Page d'inscription — appelle POST /api/register
function Register() {
  const navigate = useNavigate()

  // State du formulaire
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
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
      const response = await api.post('/register', form)

      // Sauvegarde du token dans le localStorage
      localStorage.setItem('token', response.data.token)

      // Notification de succès
      toast.success('Inscription réussie !')

      // Redirection vers la page d'accueil après un court délai (pour voir le toast)
      setTimeout(() => navigate('/'), 3000)
    } catch (error) {
      // Affiche chaque erreur de validation en toast
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
        <h1>Créer un compte</h1>
        <p className="subtitle">Rejoins la communauté cinéma</p>

        <form onSubmit={handleSubmit}>
          {/* Prénom + Nom sur la même ligne */}
          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input type="text" name="first_name" placeholder="John" value={form.first_name} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Nom</label>
              <input type="text" name="last_name" placeholder="Doe" value={form.last_name} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input type="text" name="username" placeholder="johndoe" value={form.username} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input type="email" name="email" placeholder="john@exemple.com" value={form.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input type="password" name="password" placeholder="8 caractères minimum" value={form.password} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input type="password" name="password_confirmation" placeholder="Confirmer" value={form.password_confirmation} onChange={handleChange} />
          </div>

          <button type="submit" className="btn-primary">S'inscrire</button>
        </form>

        <p className="auth-footer">
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
