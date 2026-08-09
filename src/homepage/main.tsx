import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex justify-end gap-6 p-6 border-b border-gray-200">
        <Link to="/accounts" className="text-gray-600 hover:text-black transition-colors">
          Accounts
        </Link>
        <Link to="/transactions" className="text-gray-600 hover:text-black transition-colors">
          Transactions
        </Link>
        <Link to="/fixed-assets" className="text-gray-600 hover:text-black transition-colors">
          Fixed Assets
        </Link>
      </nav>

      <div className="p-6">
        <h1 className="text-xl font-medium text-black">Accounting App</h1>
      </div>
    </div>
  )
}

export default HomePage
