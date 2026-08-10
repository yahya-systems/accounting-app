import { useEffect, useState, Fragment } from 'react'
import { useParams, Link } from 'react-router-dom'
import type { AccountDetail, TransactionDetail } from '../libs/types'
import BackToHome from '../components/BackToHome'

const API_BASE = import.meta.env.VITE_URL

const CATEGORY_LABELS: Record<string, string> = {
  asset: 'Actif',
  liability: 'Passif',
  equity: 'Capitaux propres',
  revenue: 'Produits',
  expense: 'Charges',
}

function AccountDetailPage() {
  const { id } = useParams()
  const [account, setAccount] = useState<AccountDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [expandedLineId, setExpandedLineId] = useState<number | null>(null)
  const [expandedDetail, setExpandedDetail] = useState<TransactionDetail | null>(null)
  const [expandedLoading, setExpandedLoading] = useState(false)

  useEffect(() => {
    const fetchAccount = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/accounts/${id}`)
        if (!res.ok) {
          if (res.status === 404) throw new Error('Compte non trouvé')
          throw new Error('Échec de la récupération du compte')
        }
        const data = await res.json()
        setAccount(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue')
      } finally {
        setLoading(false)
      }
    }
    fetchAccount()
  }, [id])

  const toggleExpand = async (lineId: number, entryId: number) => {
    if (expandedLineId === lineId) {
      setExpandedLineId(null)
      setExpandedDetail(null)
      return
    }
    setExpandedLineId(lineId)
    setExpandedDetail(null)
    setExpandedLoading(true)
    try {
      const res = await fetch(`${API_BASE}/transactions/${entryId}`)
      if (!res.ok) throw new Error('Échec du chargement de l\'écriture')
      const data = await res.json()
      setExpandedDetail(data)
    } catch {
      setExpandedDetail(null)
    } finally {
      setExpandedLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6">
        <p className="text-gray-400 text-sm">Chargement...</p>
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="min-h-screen bg-white p-6">
        <Link to="/accounts" className="text-gray-500 hover:text-black text-sm">
          ← Retour aux comptes
        </Link>
        <p className="text-gray-800 text-sm mt-4">{error ?? 'Compte non trouvé'}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <BackToHome />
      <Link to="/accounts" className="text-gray-500 hover:text-black text-sm">
        ← Retour aux comptes
      </Link>

      <div className="mt-4 mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-medium text-black">{account.name}</h1>
          <span className="text-gray-400 text-sm">#{account.id}</span>
          <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
            {CATEGORY_LABELS[account.category] || account.category}
          </span>
          <span className="text-gray-600 text-xs border border-gray-300 rounded px-2 py-0.5">
            {account.is_active ? 'Actif' : 'Inactif'}
          </span>
        </div>

        <p className="text-gray-600 text-sm mt-2">
          {account.description || <span className="text-gray-400">Pas de description</span>}
        </p>

        <div className="flex gap-6 mt-3 text-xs text-gray-500">
          <span>Code : {account.code ?? '—'}</span>
          <span>Créé le : {new Date(account.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <h2 className="text-sm font-medium text-black mb-3">Historique des écritures</h2>

      <table className="w-full text-sm border border-gray-200 border-collapse">
        <thead>
          <tr className="text-left text-gray-500 bg-gray-50">
            <th className="py-2 px-3 font-normal border border-gray-200 w-6"></th>
            <th className="py-2 px-3 font-normal border border-gray-200">Date</th>
            <th className="py-2 px-3 font-normal border border-gray-200">Écriture</th>
            <th className="py-2 px-3 font-normal border border-gray-200 text-right">Débit</th>
            <th className="py-2 px-3 font-normal border border-gray-200 text-right">Crédit</th>
          </tr>
        </thead>
        <tbody>
          {account.journal_lines.map((line) => (
            <Fragment key={line.journal_line_id}>
              <tr
                onClick={() => toggleExpand(line.journal_line_id, line.journal_entry_id)}
                className="cursor-pointer hover:bg-gray-50"
              >
                <td className="py-2 px-3 text-gray-400 border border-gray-200">
                  {expandedLineId === line.journal_line_id ? '▾' : '▸'}
                </td>
                <td className="py-2 px-3 text-gray-600 border border-gray-200">{line.date}</td>
                <td className="py-2 px-3 text-black border border-gray-200">
                  {line.title || `Écriture n°${line.journal_entry_id}`}
                </td>
                <td className="py-2 px-3 text-right text-gray-600 border border-gray-200">
                  {Number(line.debit) > 0 ? Number(line.debit).toFixed(2) : ''}
                </td>
                <td className="py-2 px-3 text-right text-gray-600 border border-gray-200">
                  {Number(line.credit) > 0 ? Number(line.credit).toFixed(2) : ''}
                </td>
              </tr>

              {expandedLineId === line.journal_line_id && (
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
                          <Link
                            to={`/transactions/${expandedDetail.id}`}
                            className="text-gray-500 hover:text-black underline ml-auto"
                          >
                            Ouvrir →
                          </Link>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {expandedDetail.description || <span className="text-gray-400">Pas de description</span>}
                        </p>

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
          {account.journal_lines.length === 0 && (
            <tr>
              <td colSpan={5} className="py-4 text-gray-400 text-center border border-gray-200">
                Aucune écriture comptabilisée pour ce compte
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default AccountDetailPage
