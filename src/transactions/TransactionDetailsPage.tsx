import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { TransactionDetail } from '../libs/types.ts'
import BackToHome from '../components/BackToHome'

const API_BASE = 'http://localhost:3000/api'

function TransactionDetailPage() {
  const { id } = useParams()
  const [tx, setTx] = useState<TransactionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchTx = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`)
      if (!res.ok) {
        if (res.status === 404) throw new Error('Transaction not found')
        throw new Error('Failed to fetch transaction')
      }
      const data = await res.json()
      setTx(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTx()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handlePost = async () => {
    if (!tx) return
    setActionError(null)
    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/transactions/${tx.id}/post`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error?.[0]?.message ?? body?.error ?? 'Failed to post transaction')
      }
      await fetchTx()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReverse = async () => {
    if (!tx) return
    setActionError(null)
    setActionLoading(true)
    try {
      const res = await fetch(`${API_BASE}/transactions/${tx.id}/reverse`, { method: 'POST' })
      if (!res.ok) {
        const body = await res.json().catch(() => null)
        throw new Error(body?.error?.[0]?.message ?? body?.error ?? 'Failed to reverse transaction')
      }
      await fetchTx()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    )
  }

  if (error || !tx) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="flex items-center justify-between">
          <Link to="/transactions" className="text-gray-500 hover:text-black text-sm">
            ← Back to Transactions
          </Link>
          <BackToHome />
        </div>
        <p className="text-gray-800 text-sm mt-4">{error ?? 'Transaction not found'}</p>
      </div>
    )
  }

  const totalDebit = tx.lines.reduce((sum, l) => sum + Number(l.debit), 0)
  const totalCredit = tx.lines.reduce((sum, l) => sum + Number(l.credit), 0)

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center justify-between">
        <Link to="/transactions" className="text-gray-500 hover:text-black text-sm">
          ← Back to Transactions
        </Link>
        <BackToHome />
      </div>

      <div className="mt-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium text-black">{tx.title || `Entry #${tx.id}`}</h1>
          <span className="text-gray-400 text-sm">#{tx.id}</span>
          <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
            {tx.status}
          </span>
          {tx.reverses_entry_id && (
            <Link
              to={`/transactions/${tx.reverses_entry_id}`}
              className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5 hover:border-black hover:text-black"
            >
              Reverses #{tx.reverses_entry_id}
            </Link>
          )}
        </div>

        <p className="text-gray-600 text-sm mt-2">
          {tx.description || <span className="text-gray-400">No description</span>}
        </p>

        <div className="flex gap-6 mt-3 text-xs text-gray-500">
          <span>Date: {tx.date}</span>
          {tx.posted_at && <span>Posted: {new Date(tx.posted_at).toLocaleString()}</span>}
          <span>Created: {new Date(tx.created_at).toLocaleString()}</span>
        </div>

        <div className="flex gap-2 mt-4">
          {tx.status === 'draft' && (
            <button
              onClick={handlePost}
              disabled={actionLoading}
              className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 hover:border-black hover:text-black disabled:opacity-50"
            >
              Post
            </button>
          )}
          {tx.status === 'posted' && !tx.reverses_entry_id && (
            <button
              onClick={handleReverse}
              disabled={actionLoading}
              className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 hover:border-black hover:text-black disabled:opacity-50"
            >
              Reverse
            </button>
          )}
        </div>

        {actionError && <p className="text-gray-800 text-xs mt-2">{actionError}</p>}
      </div>

      <h2 className="text-sm font-medium text-black mb-3">Journal Lines</h2>

      <table className="w-full text-sm border border-gray-200 border-collapse">
        <thead>
          <tr className="text-left text-gray-500 bg-gray-50">
            <th className="py-2 px-3 font-normal border border-gray-200">Account</th>
            <th className="py-2 px-3 font-normal border border-gray-200 text-right">Debit</th>
            <th className="py-2 px-3 font-normal border border-gray-200 text-right">Credit</th>
          </tr>
        </thead>
        <tbody>
          {tx.lines.map((l) => (
            <tr key={l.id}>
              <td className="py-2 px-3 text-gray-700 border border-gray-200">
                <Link to={`/accounts/${l.account_id}`} className="text-black hover:underline">
                  {l.account_name} {l.account_code ? `(${l.account_code})` : ''}
                </Link>
              </td>
              <td className="py-2 px-3 text-right text-gray-600 border border-gray-200">
                {Number(l.debit) > 0 ? Number(l.debit).toFixed(2) : ''}
              </td>
              <td className="py-2 px-3 text-right text-gray-600 border border-gray-200">
                {Number(l.credit) > 0 ? Number(l.credit).toFixed(2) : ''}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-gray-50 font-medium">
            <td className="py-2 px-3 text-gray-700 border border-gray-200">Total</td>
            <td className="py-2 px-3 text-right text-gray-700 border border-gray-200">
              {totalDebit.toFixed(2)}
            </td>
            <td className="py-2 px-3 text-right text-gray-700 border border-gray-200">
              {totalCredit.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default TransactionDetailPage
