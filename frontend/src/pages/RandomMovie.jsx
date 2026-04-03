import { useState } from 'react'
import Navbar from '../components/Navbar'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'
const BACKDROP_BASE = 'https://image.tmdb.org/t/p/original'

const GENRES = [
  { id: '', name: 'Tous les genres' },
  { id: 28, name: 'Action' },
  { id: 12, name: 'Aventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comédie' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drame' },
  { id: 14, name: 'Fantastique' },
  { id: 27, name: 'Horreur' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science-Fiction' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerre' },
  { id: 37, name: 'Western' },
  { id: 99, name: 'Documentaire' },
  { id: 10402, name: 'Musique' },
]

const COUNTRIES = [
  { id: '', name: 'Tous les pays' },
  { id: 'FR', name: 'France' },
  { id: 'US', name: 'États-Unis' },
  { id: 'GB', name: 'Royaume-Uni' },
  { id: 'JP', name: 'Japon' },
  { id: 'KR', name: 'Corée du Sud' },
  { id: 'IN', name: 'Inde' },
  { id: 'DE', name: 'Allemagne' },
  { id: 'ES', name: 'Espagne' },
  { id: 'IT', name: 'Italie' },
]

const STREAMING = [
  { id: '', name: 'Toutes les plateformes' },
  { id: 8, name: 'Netflix' },
  { id: 337, name: 'Disney+' },
  { id: 119, name: 'Amazon Prime Video' },
  { id: 350, name: 'Apple TV+' },
  { id: 381, name: 'Canal+' },
  { id: 531, name: 'Paramount+' },
  { id: 283, name: 'Crunchyroll' },
  { id: 73, name: 'Tubi (gratuit)' },
  { id: 300, name: 'Pluto TV (gratuit)' },
]

function RandomMovie() {
  const [selectedMovie, setSelectedMovie] = useState(null)
  const [movieDetails, setMovieDetails] = useState(null)
  const [providers, setProviders] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [tempMovie, setTempMovie] = useState(null)

  // Filtres
  const [genre, setGenre] = useState('')
  const [country, setCountry] = useState('')
  const [yearFrom, setYearFrom] = useState('')
  const [yearTo, setYearTo] = useState('')
  const [platform, setPlatform] = useState('')
  const [blockbuster, setBlockbuster] = useState(false)

  const selectStyle = { padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f0f0f0', fontSize: '13px', outline: 'none', width: '100%', appearance: 'none', cursor: 'pointer' }

  // Construit l'URL TMDB discover avec les filtres
  const buildUrl = (page) => {
    let url = `https://api.themoviedb.org/3/discover/movie?language=fr-FR&page=${page}&sort_by=popularity.desc`
    if (genre) url += `&with_genres=${genre}`
    if (country) url += `&with_origin_country=${country}`
    if (yearFrom) url += `&primary_release_date.gte=${yearFrom}-01-01`
    if (yearTo) url += `&primary_release_date.lte=${yearTo}-12-31`
    else if (yearFrom) url += `&primary_release_date.lte=${yearFrom}-12-31`
    if (platform) url += `&with_watch_providers=${platform}&watch_region=FR`
    if (blockbuster) url += `&vote_count.gte=5000&with_original_language=en`
    return url
  }

  // Récupère les détails complets
  const fetchDetails = async (movieId) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?language=fr-FR`, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
      })
      return await res.json()
    } catch {
      return null
    }
  }

  // Récupère les plateformes
  const fetchProviders = async (movieId) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}/watch/providers`, {
        headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
      })
      const data = await res.json()
      return data.results?.FR || data.results?.US || null
    } catch {
      return null
    }
  }

  // Lance la roulette
  const handleRandom = async () => {
    if (spinning) return
    setSpinning(true)
    setSelectedMovie(null)
    setMovieDetails(null)
    setProviders(null)

    try {
      // Fetch plusieurs pages au hasard pour avoir de la variété
      const randomPage = Math.floor(Math.random() * 20) + 1
      const pages = [randomPage, randomPage + 1, randomPage + 2]
      const results = await Promise.all(
        pages.map((page) =>
          fetch(buildUrl(page), {
            headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
          }).then((res) => res.json())
        )
      )

      const allMovies = results
        .flatMap((r) => r.results || [])
        .filter((m) => m.poster_path && m.backdrop_path)

      if (allMovies.length === 0) {
        setSpinning(false)
        setSelectedMovie(null)
        return
      }

      // Animation roulette
      let count = 0
      const total = 18
      const interval = setInterval(() => {
        const idx = Math.floor(Math.random() * allMovies.length)
        setTempMovie(allMovies[idx])
        count++

        if (count >= total) {
          clearInterval(interval)
          const finalMovie = allMovies[Math.floor(Math.random() * allMovies.length)]
          setTempMovie(null)
          setSelectedMovie(finalMovie)

          // Fetch détails + providers en parallèle
          Promise.all([fetchDetails(finalMovie.id), fetchProviders(finalMovie.id)]).then(([details, prov]) => {
            setMovieDetails(details)
            setProviders(prov)
            setSpinning(false)
          })
        }
      }, 130)
    } catch {
      setSpinning(false)
    }
  }

  const formatRuntime = (min) => {
    if (!min) return null
    const h = Math.floor(min / 60)
    const m = min % 60
    return `${h}h${m > 0 ? ` ${m}min` : ''}`
  }

  const displayMovie = spinning ? tempMovie : selectedMovie

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
          {/* Backdrop */}
          {displayMovie && (
            <img
              src={BACKDROP_BASE + displayMovie.backdrop_path}
              alt=""
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${spinning ? 'opacity-15' : 'opacity-25'}`}
            />
          )}
          {!displayMovie && (
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(229,9,20,0.1) 0%, #0d0d0f 70%)' }} />
          )}
          <div className="absolute bottom-0 left-0 w-full h-60 z-10" style={{ background: 'linear-gradient(to top, #0d0d0f, transparent)' }} />

          <div className="relative z-20 w-full max-w-[900px] px-8">

            {/* Avant sélection — filtres + bouton */}
            {!selectedMovie && !spinning && (
              <div className="flex flex-col items-center text-center">
                <h1 className="text-[#f0f0f0] text-4xl font-bold mb-3">Film aléatoire</h1>
                <p className="text-[#a0a0b0] text-base mb-8 max-w-[450px]">Tu ne sais pas quoi regarder ? Choisis tes critères et laisse le hasard faire.</p>

                {/* Filtres */}
                <div className="w-full max-w-[550px] mb-8">
                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-[12px] font-medium text-[#a0a0b0] mb-1">Genre</label>
                      <select value={genre} onChange={(e) => setGenre(e.target.value)} style={selectStyle}>
                        {GENRES.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-[12px] font-medium text-[#a0a0b0] mb-1">Pays</label>
                      <select value={country} onChange={(e) => setCountry(e.target.value)} style={selectStyle}>
                        {COUNTRIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-3 mb-3">
                    <div className="flex-1">
                      <label className="block text-[12px] font-medium text-[#a0a0b0] mb-1">Année (de)</label>
                      <input type="number" placeholder="ex: 2000" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} min="1900" max="2026" style={selectStyle} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[12px] font-medium text-[#a0a0b0] mb-1">Année (à)</label>
                      <input type="number" placeholder="ex: 2010" value={yearTo} onChange={(e) => setYearTo(e.target.value)} min="1900" max="2026" style={selectStyle} />
                    </div>
                  </div>

                  {/* Plateforme de streaming */}
                  <div className="mb-4">
                    <label className="block text-[12px] font-medium text-[#a0a0b0] mb-1">Plateforme</label>
                    <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={selectStyle}>
                      {STREAMING.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>

                  {/* Blockbuster toggle */}
                  <button
                    type="button"
                    onClick={() => setBlockbuster(!blockbuster)}
                    style={{ border: blockbuster ? '1px solid #e50914' : '1px solid rgba(255,255,255,0.1)', background: blockbuster ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.06)', padding: '10px 20px' }}
                    className={`w-full rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 ${blockbuster ? 'text-[#e50914]' : 'text-[#a0a0b0] hover:text-[#f0f0f0]'}`}
                  >
                    Blockbusters uniquement {blockbuster ? '(activé)' : ''}
                  </button>
                </div>

                <button
                  onClick={handleRandom}
                  style={{ padding: '16px 48px' }}
                  className="bg-[#e50914] text-white border-none rounded-2xl text-base font-semibold cursor-pointer transition-all duration-300 hover:bg-[#ff1a25] hover:shadow-[0_0_30px_rgba(229,9,20,0.4)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  Lancer
                </button>
              </div>
            )}

            {/* Pendant la roulette */}
            {spinning && displayMovie && (
              <div className="flex flex-col items-center">
                <img
                  src={IMAGE_BASE + displayMovie.poster_path}
                  alt=""
                  className="w-[200px] rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.6)] opacity-60 scale-90 transition-all duration-100"
                />
              </div>
            )}

            {/* Film sélectionné — fiche complète */}
            {!spinning && selectedMovie && movieDetails && (
              <div className="flex gap-10 items-start">
                <div className="flex-shrink-0">
                  <img
                    src={IMAGE_BASE + selectedMovie.poster_path}
                    alt={selectedMovie.title}
                    className="w-[260px] rounded-2xl shadow-[0_12px_50px_rgba(0,0,0,0.7)]"
                  />
                </div>

                <div className="flex-1 pt-2">
                  <h2 className="text-[#f0f0f0] text-3xl font-bold mb-2">{movieDetails.title}</h2>

                  {movieDetails.tagline && (
                    <p className="text-[#a0a0b0] text-sm italic mb-4">"{movieDetails.tagline}"</p>
                  )}

                  <div className="flex items-center gap-4 mb-4 flex-wrap">
                    <span className="text-[#e50914] text-sm font-semibold">★ {movieDetails.vote_average?.toFixed(1)}</span>
                    <span className="text-[#a0a0b0] text-sm">{new Date(movieDetails.release_date).getFullYear()}</span>
                    {formatRuntime(movieDetails.runtime) && (
                      <span className="text-[#a0a0b0] text-sm">{formatRuntime(movieDetails.runtime)}</span>
                    )}
                    {movieDetails.vote_count > 5000 && (
                      <span style={{ background: 'rgba(229,9,20,0.15)', border: '1px solid rgba(229,9,20,0.3)' }} className="text-[#e50914] text-[11px] px-2 py-0.5 rounded-full font-medium">Blockbuster</span>
                    )}
                  </div>

                  {movieDetails.genres?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movieDetails.genres.map((g) => (
                        <span key={g.id} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)' }} className="text-[#f0f0f0] text-[12px] px-3 py-1 rounded-full">{g.name}</span>
                      ))}
                    </div>
                  )}

                  {movieDetails.production_countries?.length > 0 && (
                    <p className="text-[#555566] text-[13px] mb-4">
                      {movieDetails.production_countries.map((c) => c.name).join(', ')}
                    </p>
                  )}

                  <p className="text-[#a0a0b0] text-[14px] leading-relaxed mb-6">{movieDetails.overview || 'Aucune description disponible.'}</p>

                  {/* Plateformes */}
                  {providers && (
                    <div className="mb-6">
                      {providers.flatrate && (
                        <div className="mb-3">
                          <p className="text-[#a0a0b0] text-[12px] mb-2">Disponible en streaming :</p>
                          <div className="flex gap-3">
                            {providers.flatrate.map((p) => (
                              <a key={p.provider_id} href={providers.link} target="_blank" rel="noopener noreferrer" title={p.provider_name}>
                                <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-11 h-11 rounded-xl hover:scale-110 transition-transform" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {providers.rent && (
                        <div className="mb-3">
                          <p className="text-[#a0a0b0] text-[12px] mb-2">En location :</p>
                          <div className="flex gap-3">
                            {providers.rent.map((p) => (
                              <a key={p.provider_id} href={providers.link} target="_blank" rel="noopener noreferrer" title={p.provider_name}>
                                <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-11 h-11 rounded-xl hover:scale-110 transition-transform" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {providers.buy && (
                        <div className="mb-3">
                          <p className="text-[#a0a0b0] text-[12px] mb-2">À l'achat :</p>
                          <div className="flex gap-3">
                            {providers.buy.map((p) => (
                              <a key={p.provider_id} href={providers.link} target="_blank" rel="noopener noreferrer" title={p.provider_name}>
                                <img src={`https://image.tmdb.org/t/p/original${p.logo_path}`} alt={p.provider_name} className="w-11 h-11 rounded-xl hover:scale-110 transition-transform" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                      {!providers.flatrate && !providers.rent && !providers.buy && (
                        <p className="text-[#555566] text-[13px]">Pas encore disponible en streaming en France.</p>
                      )}
                    </div>
                  )}

                  {/* Boutons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleRandom}
                      style={{ padding: '12px 36px' }}
                      className="bg-[#e50914] text-white border-none rounded-xl text-sm font-semibold cursor-pointer transition-all duration-300 hover:bg-[#ff1a25] hover:shadow-[0_0_24px_rgba(229,9,20,0.3)] hover:-translate-y-0.5 active:translate-y-0"
                    >
                      Relancer
                    </button>
                    <button
                      onClick={() => { setSelectedMovie(null); setMovieDetails(null); setProviders(null) }}
                      style={{ padding: '12px 24px', border: '1px solid rgba(255,255,255,0.1)' }}
                      className="bg-transparent text-[#a0a0b0] rounded-xl text-sm font-medium cursor-pointer transition-all duration-300 hover:text-[#f0f0f0] hover:border-[rgba(255,255,255,0.2)]"
                    >
                      Modifier les filtres
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Aucun résultat */}
            {!spinning && selectedMovie === null && movieDetails === null && providers === null && tempMovie === null && false}
          </div>
        </div>
      </main>
    </div>
  )
}

export default RandomMovie
