import { Link } from 'react-router-dom'

function BackToHome() {
  return (
    <Link to="/" className="text-gray-500 hover:text-black text-sm">
      ← Menu
    </Link>
  )
}

export default BackToHome
