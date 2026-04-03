// Logo iLiked — le point du deuxième "i" est un coeur SVG
function Logo() {
  return (
    <span className="inline-flex items-baseline">
      <span className="text-accent text-red-600">i</span>
      <span className="text-text-primary">L</span>
      <span className="relative inline-block">
        <span className="logo-i-bar">i</span>
        <svg className="logo-heart absolute w-2 h-2 top-0 left-1/2 -translate-x-1/2 transition-transform duration-400 ease-out" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(0 -1028.4)">
            <path d="m7 1031.4c-1.5355 0-3.0784 0.5-4.25 1.7-2.3431 2.4-2.2788 6.1 0 8.5l9.25 9.8 9.25-9.8c2.279-2.4 2.343-6.1 0-8.5-2.343-2.3-6.157-2.3-8.5 0l-0.75 0.8-0.75-0.8c-1.172-1.2-2.7145-1.7-4.25-1.7z" fill="#e50914"/>
          </g>
        </svg>
      </span>
      <span className="text-text-primary">ked</span>
    </span>
  )
}

export default Logo
