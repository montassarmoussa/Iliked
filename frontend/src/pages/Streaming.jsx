import Navbar from '../components/Navbar'

const PLATFORMS = [
  {
    category: 'Abonnements',
    sites: [
      { name: 'Netflix', url: 'https://www.netflix.com', logo: 'https://image.tmdb.org/t/p/original/pbpMk2JmcoNnQwN5JGpXngfoWtp.jpg', color: '#e50914', desc: 'Le plus grand catalogue de films et séries' },
      { name: 'Disney+', url: 'https://www.disneyplus.com', logo: 'https://image.tmdb.org/t/p/original/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg', color: '#0063e5', desc: 'Marvel, Star Wars, Pixar, Disney' },
      { name: 'Amazon Prime Video', url: 'https://www.primevideo.com', logo: 'https://image.tmdb.org/t/p/original/dQeAar5H991VYporEjUspolDarG.jpg', color: '#00a8e1', desc: 'Films, séries et contenus originaux' },
      { name: 'Apple TV+', url: 'https://tv.apple.com', logo: 'https://image.tmdb.org/t/p/original/6uhKBfmtzFqOcLousHwZuzcrScK.jpg', color: '#555555', desc: 'Contenus originaux Apple' },
      { name: 'Canal+', url: 'https://www.canalplus.com', logo: 'https://image.tmdb.org/t/p/original/ficPFpEfSAlADMEto4K4f5kNXoV.jpg', color: '#1a1a1a', desc: 'Cinéma, sport et séries' },
      { name: 'Paramount+', url: 'https://www.paramountplus.com', logo: 'https://image.tmdb.org/t/p/original/xbhHHa1YgtpwhC8lb1NQ3ACVcLd.jpg', color: '#0064ff', desc: 'Films Paramount et contenus exclusifs' },
      { name: 'Crunchyroll', url: 'https://www.crunchyroll.com', logo: 'https://image.tmdb.org/t/p/original/8Gt1iClBlzTeQs8WQm8UrCoIxnQ.jpg', color: '#f47521', desc: 'Le meilleur de l\'anime' },
    ]
  },
  {
    category: 'Gratuit (légal)',
    sites: [
      { name: 'Tubi', url: 'https://tubitv.com', logo: 'https://image.tmdb.org/t/p/original/4YSOkIIBOpsJrgqx2v7F6bqn1fm.jpg', color: '#fa382f', desc: 'Films et séries gratuits avec pubs' },
      { name: 'Pluto TV', url: 'https://pluto.tv', logo: 'https://image.tmdb.org/t/p/original/t6N57S17sdXRXmZDAkaRdGSVgT.jpg', color: '#2e0e56', desc: 'TV en direct et à la demande, gratuit' },
      { name: 'Plex', url: 'https://www.plex.tv', logo: 'https://image.tmdb.org/t/p/original/wBMhRMjJVgfIducuJMydXSae3hP.jpg', color: '#e5a00d', desc: 'Films gratuits et serveur média' },
      { name: 'Arte', url: 'https://www.arte.tv', logo: '', color: '#fa5a28', desc: 'Documentaires, films d\'auteur, culture' },
      { name: 'France.tv', url: 'https://www.france.tv', logo: '', color: '#0f4bff', desc: 'Replay et films gratuits France Télévisions' },
      { name: 'Molotov', url: 'https://www.molotov.tv', logo: '', color: '#1a1a2e', desc: 'TV en direct et replay gratuit' },
    ]
  },
  {
    category: 'Location / Achat',
    sites: [
      { name: 'Google Play Films', url: 'https://play.google.com/store/movies', logo: 'https://image.tmdb.org/t/p/original/tbEdFQDwx5LEVr8WpSeXQSIirVq.jpg', color: '#4285f4', desc: 'Location et achat de films' },
      { name: 'YouTube (Films)', url: 'https://www.youtube.com/feed/storefront', logo: 'https://image.tmdb.org/t/p/original/oIkQkEkwfmcG7IGpRR1NB8frZZM.jpg', color: '#ff0000', desc: 'Films à louer ou acheter sur YouTube' },
      { name: 'Rakuten TV', url: 'https://www.rakuten.tv', logo: 'https://image.tmdb.org/t/p/original/bKy2YjC0QxViAGMBBFL4bGC0Mf7.jpg', color: '#bf0000', desc: 'Location de films récents' },
    ]
  }
]

function Streaming() {
  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      <Navbar />

      <main className="pt-24 px-16 pb-12 max-w-[1100px] mx-auto">
        <h1 className="text-[#f0f0f0] text-3xl font-bold mb-2">Streaming</h1>
        <p className="text-[#a0a0b0] text-sm mb-10">Retrouve toutes les plateformes pour regarder tes films légalement.</p>

        {PLATFORMS.map((section) => (
          <div key={section.category} className="mb-10">
            <h2 className="text-[#f0f0f0] text-lg font-semibold mb-4">{section.category}</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {section.sites.map((site) => (
                <a
                  key={site.name}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  className="rounded-2xl p-5 flex items-start gap-4 no-underline transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] group"
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = site.color}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
                >
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ background: site.logo ? 'transparent' : site.color }}>
                    {site.logo ? (
                      <img src={site.logo} alt={site.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-white text-lg font-bold">{site.name.charAt(0)}</span>
                    )}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#f0f0f0] text-[15px] font-semibold group-hover:text-white transition-colors">{site.name}</h3>
                    <p className="text-[#555566] text-[12px] mt-1 leading-relaxed">{site.desc}</p>
                  </div>

                  {/* Flèche */}
                  <svg className="w-4 h-4 text-[#555566] group-hover:text-[#a0a0b0] transition-colors flex-shrink-0 mt-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              ))}
            </div>
          </div>
        ))}

        {/* Disclaimer */}
        <p className="text-[#333] text-[11px] text-center mt-8">
          iLiked n'héberge aucun contenu. Tous les liens redirigent vers les plateformes officielles.
        </p>
      </main>
    </div>
  )
}

export default Streaming
