import { useState, useEffect, useCallback } from 'react'

function PageLoader({ loading, children }) {
  const [show, setShow] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    if (!loading) {
      // Petit délai minimum pour éviter un flash
      const timer = setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => setShow(false), 400)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [loading])

  return (
    <>
      {show && (
        <div
          className={`fixed inset-0 z-[9999] bg-[#0d0d0f] flex flex-col items-center justify-center transition-opacity duration-400 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}
        >
          <svg className="w-10 h-10 mb-4 animate-pulse" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(0 -1028.4)">
              <path d="m7 1031.4c-1.5355 0-3.0784 0.5-4.25 1.7-2.3431 2.4-2.2788 6.1 0 8.5l9.25 9.8 9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-0.75 0.8-0.75-0.8c-1.172-1.2-2.7145-1.7-4.25-1.7z" fill="#e50914"/>
            </g>
          </svg>
          <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <div className={show ? 'opacity-0' : 'opacity-100 transition-opacity duration-400'}>
        {children}
      </div>
    </>
  )
}

// Hook pour précharger des images et savoir quand elles sont prêtes
export function useImagePreloader(urls) {
  const [ready, setReady] = useState(false)

  const preload = useCallback((imageUrls) => {
    if (!imageUrls || imageUrls.length === 0) {
      setReady(true)
      return
    }

    let loaded = 0
    const total = imageUrls.length

    imageUrls.forEach(url => {
      const img = new Image()
      img.onload = img.onerror = () => {
        loaded++
        if (loaded >= total) setReady(true)
      }
      img.src = url
    })

    // Timeout de sécurité — on affiche quand même après 5s
    setTimeout(() => setReady(true), 5000)
  }, [])

  return { ready, preload, setReady }
}

export default PageLoader
