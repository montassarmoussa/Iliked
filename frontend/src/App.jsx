import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import Auth from './pages/Auth'
import Setup from './pages/Setup'
import Home from './pages/Home'
import Profile from './pages/Profile'
import PublicProfile from './pages/PublicProfile'
import RandomMovie from './pages/RandomMovie'
import Streaming from './pages/Streaming'
import Film from './pages/Film'
import Feed from './pages/Feed'
import Friends from './pages/Friends'
import Genre from './pages/Genre'
import Category from './pages/Category'
import Messages from './pages/Messages'

// Composant principal : définit les routes de l'app
function App() {
  return (
    <>
      {/* ToastContainer global — persiste entre les changements de page */}
      <ToastContainer position="bottom-right" autoClose={2000} newestOnTop stacked hideProgressBar />

      {/* Définition des routes */}
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile/edit" element={<Profile />} />
        <Route path="/user/:username" element={<PublicProfile />} />
        <Route path="/random" element={<RandomMovie />} />
        <Route path="/streaming" element={<Streaming />} />
        <Route path="/film/:id" element={<Film />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/friends" element={<Friends />} />
        <Route path="/genre/:id" element={<Genre />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/messages" element={<Messages />} />
      </Routes>
    </>
  )
}

export default App
