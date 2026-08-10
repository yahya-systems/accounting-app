import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { TransactionDetail } from '../libs/types.ts'
import BackToHome from '../components/BackToHome'

const API_BASE = import.meta.env.VITE_URL

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  posted: 'Comptabilisé',
}

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
        if (res.status === 404) throw new Error('Écriture non trouvée')
        throw new Error('Échec de la récupération de l\'écriture')
      }
      const data = await res.json()
      setTx(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
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
        throw new Error(body?.error?.[0]?.message ?? body?.error ?? 'Échec de la comptabilisation de l\'écriture')
      }
      await fetchTx()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Une erreur est survenue')
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
        throw new Error(body?.error?.[0]?.message ?? body?.error ?? 'Échec de la contre-passation de l\'écriture')
      }
      await fetchTx()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    )
  }

  if (error || !tx) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="flex items-center justify-between">
          <Link to="/transactions" className="text-gray-500 hover:text-black text-sm">
            ← Retour aux écritures
          </Link>
          <BackToHome />
        </div>
        <p className="text-gray-800 text-sm mt-4">{error ?? 'Écriture non trouvée'}</p>
      </div>
    )
  }

  const totalDebit = tx.lines.reduce((sum, l) => sum + Number(l.debit), 0)
  const totalCredit = tx.lines.reduce((sum, l) => sum + Number(l.credit), 0)

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center justify-between">
        <Link to="/transactions" className="text-gray-500 hover:text-black text-sm">
          ← Retour aux écritures
        </Link>
        <BackToHome />
      </div>

      <div className="mt-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium text-black">{tx.title || `Écriture n°${tx.id}`}</h1>
          <span className="text-gray-400 text-sm">#{tx.id}</span>
          <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
            {STATUS_LABELS[tx.status] || tx.status}
          </span>
          {tx.reverses_entry_id && (
            <Link
              to={`/transactions/${tx.reverses_entry_id}`}
              className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5 hover:border-black hover:text-black"
            >
              Contre-passe la n°{tx.reverses_entry_id}
            </Link>
          )}
        </div>

        <p className="text-gray-600 text-sm mt-2">
          {tx.description || <span className="text-gray-400">Pas de description</span>}
        </p>

        <div className="flex gap-6 mt-3 text-xs text-gray-500">
          <span>Date : {tx.date}</span>
          {tx.posted_at && <span>Comptabilisé le : {new Date(tx.posted_at).toLocaleString('fr-FR')}</span>}
          <span>Créé le : {new Date(tx.created_at).toLocaleString('fr-FR')}</span>
        </div>

        <div className="flex gap-2 mt-4">
          {tx.status === 'draft' && (
            <button
              onClick={handlePost}
              disabled={actionLoading}
              className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 hover:border-black hover:text-black disabled:opacity-50"
            >
              Comptabiliser
            </button>
          )}
          {tx.status === 'posted' && !tx.reverses_entry_id && (
            <button
              onClick={handleReverse}
              disabled={actionLoading}
              className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 hover:border-black hover:text-black disabled:opacity-50"
            >
              Contre-passer
            </button>
          )}
        </div>

        {actionError && <p className="text-gray-800 text-xs mt-2">{actionError}</p>}
      </div>

      <h2 className="text-sm font-medium text-black mb-3">Lignes d'écriture</h2>

      <table className="w-full text-sm border border-gray-200 border-collapse">
        <thead>
          <tr className="text-left text-gray-500 bg-gray-50">
            <th className="py-2 px-3 font-normal border border-gray-200">Compte</th>
            <th className="py-2 px-3 font-normal border border-gray-200 text-right">Débit</th>
            <th className="py-2 px-3 font-normal border border-gray-200 text-right">Crédit</th>
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
