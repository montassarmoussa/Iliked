import { useState, useEffect } from 'react'

const TMDB_TOKEN = import.meta.env.VITE_TMDB_TOKEN
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w300'

function MovieWall() {
  const [posters, setPosters] = useState([])

  useEffect(() => {
    const fetchPosters = async () => {
      try {
        const endpoints = [
          'discover/movie?with_genres=53&sort_by=popularity.desc&page=1',
          'discover/movie?with_genres=53&sort_by=popularity.desc&page=2',
          'discover/movie?with_genres=53&sort_by=popularity.desc&page=3',
          'discover/movie?with_genres=53&sort_by=popularity.desc&page=4',
          'discover/movie?with_genres=16&sort_by=popularity.desc&page=1',
          'discover/movie?with_genres=16&sort_by=popularity.desc&page=2',
          'discover/movie?with_genres=16&sort_by=popularity.desc&page=3',
          'discover/movie?with_genres=16&sort_by=popularity.desc&page=4',
          'discover/movie?with_genres=18&sort_by=popularity.desc&page=1',
          'discover/movie?with_genres=18&sort_by=popularity.desc&page=2',
          'discover/movie?with_genres=18&sort_by=popularity.desc&page=3',
          'discover/movie?with_genres=18&sort_by=popularity.desc&page=4',
          'movie/popular?page=1',
          'movie/popular?page=2',
          'movie/popular?page=3',
          'movie/popular?page=4',
        ]

        const results = await Promise.all(
          endpoints.map((endpoint) =>
            fetch(`https://api.themoviedb.org/3/${endpoint}&language=fr-FR`, {
              headers: { Authorization: `Bearer ${TMDB_TOKEN}` },
            }).then((res) => res.json())
          )
        )

        const seen = new Set()
        const allPosters = results
          .flatMap((r) => r.results)
          .filter((m) => {
            if (!m.poster_path || seen.has(m.poster_path)) return false
            seen.add(m.poster_path)
            return true
          })
          .sort(() => Math.random() - 0.5)
          .map((m) => IMAGE_BASE + m.poster_path)

        setPosters(allPosters)
      } catch (error) {
        console.error('Erreur TMDB:', error)
      }
    }

    fetchPosters()
  }, [])

  if (posters.length === 0) return null

  const columns = [[], [], [], [], [], []]
  posters.forEach((poster, i) => {
    columns[i % 6].push(poster)
  })

  return (
    <div className="fixed inset-0 flex gap-2 z-0 opacity-12 overflow-hidden pointer-events-none">
      {columns.map((col, colIndex) => (
        <div
          key={colIndex}
          className={`flex-1 flex flex-col gap-2 ${colIndex % 2 === 0 ? 'animate-scroll-up' : 'animate-scroll-down'}`}
        >
          {[...col, ...col].map((poster, i) => (
            <img key={i} src={poster} alt="" loading="lazy" className="w-full rounded-lg block" />
          ))}
        </div>
      ))}
    </div>
  )
}

export default MovieWall
