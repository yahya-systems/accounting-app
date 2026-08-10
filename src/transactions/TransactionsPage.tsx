import { useEffect, useState, useCallback, Fragment } from 'react'
import type { Transaction, TransactionDetail, TransactionFilters as FiltersType } from '../libs/types'
import TransactionFilters from './components/TransactionFilters'
import TransactionForm, { type TransactionFormValues } from './components/TransactionForm'
import Modal from '../components/Modal'
import BackToHome from '../components/BackToHome'

const API_BASE = import.meta.env.VITE_URL

const STATUS_LABELS: Record<string, string> = {
  draft: 'Brouillon',
  posted: 'Comptabilisé',
}

function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [expandedDetail, setExpandedDetail] = useState<TransactionDetail | null>(null)
  const [expandedLoading, setExpandedLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async (filters?: FiltersType) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, value)
        })
      }
      const query = params.toString()
      const res = await fetch(`${API_BASE}/transactions${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error('Échec de la récupération des écritures')
      const data = await res.json()
      setTransactions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const handleCreate = async (values: TransactionFormValues) => {
    const res = await fetch(`${API_BASE}/transactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error?.[0]?.message ?? body?.error ?? 'Échec de la création de l\'écriture')
    }
    setCreateOpen(false)
    await fetchTransactions()
  }

  const fetchDetail = async (id: number) => {
    setExpandedLoading(true)
    setExpandedDetail(null)
    try {
      const res = await fetch(`${API_BASE}/transactions/${id}`)
      if (!res.ok) throw new Error('Échec du chargement de l\'écriture')
      const data = await res.json()
      setExpandedDetail(data)
    } catch {
      setExpandedDetail(null)
    } finally {
      setExpandedLoading(false)
    }
  }

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedDetail(null)
      return
    }
    setExpandedId(id)
    setActionError(null)
    await fetchDetail(id)
  }

  const handlePost = async (id: number) => {
    setActionError(null)
    const res = await fetch(`${API_BASE}/transactions/${id}/post`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setActionError(body?.error?.[0]?.message ?? body?.error ?? 'Échec de la comptabilisation de l\'écriture')
      return
    }
    await fetchTransactions()
    if (expandedId === id) await fetchDetail(id)
  }

  const handleReverse = async (id: number) => {
    setActionError(null)
    const res = await fetch(`${API_BASE}/transactions/${id}/reverse`, { method: 'POST' })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      setActionError(body?.error?.[0]?.message ?? body?.error ?? 'Échec de la contre-passation de l\'écriture')
      return
    }
    await fetchTransactions()
    if (expandedId === id) await fetchDetail(id)
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <BackToHome />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-black">Écritures</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 hover:border-black hover:text-black"
        >
          + Nouvelle écriture
        </button>
      </div>

      <TransactionFilters onSearch={fetchTransactions} />

      {loading && <p className="text-gray-400 text-sm">Chargement...</p>}
      {error && <p className="text-gray-800 text-sm">{error}</p>}

      {!loading && !error && (
        <table className="w-full text-sm border border-gray-200 border-collapse">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="py-2 px-3 font-normal border border-gray-200 w-6"></th>
              <th className="py-2 px-3 font-normal border border-gray-200">Date</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Titre</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Statut</th>
              <th className="py-2 px-3 font-normal border border-gray-200"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <Fragment key={tx.id}>
                <tr onClick={() => toggleExpand(tx.id)} className="cursor-pointer hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-400 border border-gray-200">
                    {expandedId === tx.id ? '▾' : '▸'}
                  </td>
                  <td className="py-2 px-3 text-gray-600 border border-gray-200">{tx.date}</td>
                  <td className="py-2 px-3 text-black border border-gray-200">
                    {tx.title || `Écriture n°${tx.id}`}
                  </td>
                  <td className="py-2 px-3 text-gray-600 border border-gray-200">{STATUS_LABELS[tx.status] || tx.status}</td>
                  <td className="py-2 px-3 text-right border border-gray-200" onClick={(e) => e.stopPropagation()}>
                    {tx.status === 'draft' && (
                      <button onClick={() => handlePost(tx.id)} className="text-gray-500 hover:text-black mr-3">
                        Comptabiliser
                      </button>
                    )}
                    {tx.status === 'posted' && !tx.reverses_entry_id && (
                      <button onClick={() => handleReverse(tx.id)} className="text-gray-500 hover:text-black">
                        Contre-passer
                      </button>
                    )}
                  </td>
                </tr>

                {expandedId === tx.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="py-3 px-4 border border-gray-200">
                      {expandedLoading && <p className="text-gray-400 text-xs">Chargement...</p>}

                      {!expandedLoading && expandedDetail && (
                        <div className="text-xs">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-black font-medium">
                              {expandedDetail.title || `Écriture n°${expandedDetail.id}`}
                            </span>
                            <span className="text-gray-400">#{expandedDetail.id}</span>
                            {expandedDetail.reverses_entry_id && (
                              <span className="text-gray-600 border border-gray-300 rounded px-1.5 py-0.5">
                                Contre-passe la n°{expandedDetail.reverses_entry_id}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3">
                            {expandedDetail.description || <span className="text-gray-400">Pas de description</span>}
                          </p>

                          {actionError && <p className="text-gray-800 mb-2">{actionError}</p>}

                          <table className="w-full border border-gray-200 border-collapse">
                            <thead>
                              <tr className="text-left text-gray-500 bg-white">
                                <th className="py-1 px-2 font-normal border border-gray-200">Compte</th>
                                <th className="py-1 px-2 font-normal border border-gray-200 text-right">Débit</th>
                                <th className="py-1 px-2 font-normal border border-gray-200 text-right">Crédit</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expandedDetail.lines.map((l) => (
                                <tr key={l.id} className="bg-white">
                                  <td className="py-1 px-2 text-gray-700 border border-gray-200">
                                    {l.account_name} {l.account_code ? `(${l.account_code})` : ''}
                                  </td>
                                  <td className="py-1 px-2 text-right text-gray-600 border border-gray-200">
                                    {Number(l.debit) > 0 ? Number(l.debit).toFixed(2) : ''}
                                  </td>
                                  <td className="py-1 px-2 text-right text-gray-600 border border-gray-200">
                                    {Number(l.credit) > 0 ? Number(l.credit).toFixed(2) : ''}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {!expandedLoading && !expandedDetail && (
                        <p className="text-gray-400 text-xs">Échec du chargement des détails de l'écriture</p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={5} className="py-4 text-gray-400 text-center border border-gray-200">
                  Aucune écriture trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle écriture">
        <TransactionForm onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>
    </div>
  )
}

export default TransactionsPage
