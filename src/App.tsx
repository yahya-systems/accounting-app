import './App.css'
import HomePage from './homepage/main'
import AccountsPage from './accounts/main.tsx'
import AccountDetailPage from './accounts/AccountDetailsPage.tsx'
import TransactionsPage from './transactions/TransactionsPage.tsx'
import FixedAssetsPage from './fixed-assets/FixedAssetsPage.tsx'
import TransactionDetailPage from './transactions/TransactionDetailsPage.tsx'
import { Routes, Route } from 'react-router-dom'

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/accounts" element={<AccountsPage />} />
      <Route path="/accounts/:id" element={<AccountDetailPage />} />
      <Route path="/transactions" element={<TransactionsPage />} />
      <Route path="/fixed-assets" element={<FixedAssetsPage />} />
      <Route path="/transactions/:id" element={<TransactionDetailPage />} />
    </Routes>
  )
}

export default App
