import { useEffect, useState, useCallback, Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { FixedAsset, FixedAssetDetail, FixedAssetFilters as FiltersType, TransactionDetail } from '../libs/types'
import FixedAssetFilters from './components/FixedAssetFilters'
import BackToHome from '../components/BackToHome'

const API_BASE = import.meta.env.VITE_URL

const STATUS_LABELS: Record<string, string> = {
  active: 'Actif',
  disposed: 'Cédé',
  draft: 'Brouillon',
  posted: 'Comptabilisé',
}

const TYPE_LABELS: Record<string, string> = {
  purchase: 'Achat',
  depreciation: 'Amortissement',
  disposal: 'Cession',
}

function FixedAssetsPage() {
  const [assets, setAssets] = useState<FixedAsset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [expandedDetail, setExpandedDetail] = useState<FixedAssetDetail | null>(null)
  const [expandedLoading, setExpandedLoading] = useState(false)

  const [expandedTxId, setExpandedTxId] = useState<number | null>(null)
  const [expandedTx, setExpandedTx] = useState<TransactionDetail | null>(null)
  const [expandedTxLoading, setExpandedTxLoading] = useState(false)

  const fetchAssets = useCallback(async (filters?: FiltersType) => {
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
      const res = await fetch(`${API_BASE}/subledgers/fixed-assets${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error('Échec de la récupération des immobilisations')
      const data = await res.json()
      setAssets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  const toggleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null)
      setExpandedDetail(null)
      setExpandedTxId(null)
      setExpandedTx(null)
      return
    }
    setExpandedId(id)
    setExpandedDetail(null)
    setExpandedTxId(null)
    setExpandedTx(null)
    setExpandedLoading(true)
    try {
      const res = await fetch(`${API_BASE}/subledgers/fixed-assets/${id}`)
      if (!res.ok) throw new Error('Échec du chargement de l\'immobilisation')
      const data = await res.json()
      setExpandedDetail(data)
    } catch {
      setExpandedDetail(null)
    } finally {
      setExpandedLoading(false)
    }
  }

  const toggleTxExpand = async (entryId: number) => {
    if (expandedTxId === entryId) {
      setExpandedTxId(null)
      setExpandedTx(null)
      return
    }
    setExpandedTxId(entryId)
    setExpandedTx(null)
    setExpandedTxLoading(true)
    try {
      const res = await fetch(`${API_BASE}/transactions/${entryId}`)
      if (!res.ok) throw new Error('Échec du chargement de la transaction')
      const data = await res.json()
      setExpandedTx(data)
    } catch {
      setExpandedTx(null)
    } finally {
      setExpandedTxLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex items-center justify-between">
        <BackToHome />
      </div>

      <h1 className="text-xl font-medium text-black mt-4 mb-6">Immobilisations</h1>

      <FixedAssetFilters onSearch={fetchAssets} />

      {loading && <p className="text-gray-400 text-sm">Chargement...</p>}
      {error && <p className="text-gray-800 text-sm">{error}</p>}

      {!loading && !error && (
        <table className="w-full text-sm border border-gray-200 border-collapse">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="py-2 px-3 font-normal border border-gray-200 w-6"></th>
              <th className="py-2 px-3 font-normal border border-gray-200">Titre</th>
              <th className="py-2 px-3 font-normal border border-gray-200 text-right">Coût</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Acheté le</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Durée d'utilité</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Amortissement</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Statut</th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <Fragment key={asset.id}>
                <tr onClick={() => toggleExpand(asset.id)} className="cursor-pointer hover:bg-gray-50">
                  <td className="py-2 px-3 text-gray-400 border border-gray-200">
                    {expandedId === asset.id ? '▾' : '▸'}
                  </td>
                  <td className="py-2 px-3 text-black border border-gray-200">{asset.title}</td>
                  <td className="py-2 px-3 text-right text-gray-600 border border-gray-200">
                    {Number(asset.cost).toFixed(2)}
                  </td>
                  <td className="py-2 px-3 text-gray-600 border border-gray-200">{asset.purchase_date}</td>
                  <td className="py-2 px-3 text-gray-600 border border-gray-200">
                    {asset.useful_life_months} mois
                  </td>
                  <td className="py-2 px-3 text-gray-600 border border-gray-200">
                    {asset.depreciation_method}
                  </td>
                  <td className="py-2 px-3 text-gray-600 border border-gray-200">{STATUS_LABELS[asset.status] || asset.status}</td>
                </tr>

                {expandedId === asset.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="py-3 px-4 border border-gray-200">
                      {expandedLoading && <p className="text-gray-400 text-xs">Chargement...</p>}

                      {!expandedLoading && expandedDetail && (
                        <div className="text-xs">
                          <p className="text-gray-600 mb-3">
                            {expandedDetail.description || (
                              <span className="text-gray-400">Pas de description</span>
                            )}
                          </p>

                          <table className="w-full border border-gray-200 border-collapse">
                            <thead>
                              <tr className="text-left text-gray-500 bg-white">
                                <th className="py-1 px-2 font-normal border border-gray-200 w-6"></th>
                                <th className="py-1 px-2 font-normal border border-gray-200">Date</th>
                                <th className="py-1 px-2 font-normal border border-gray-200">Type</th>
                                <th className="py-1 px-2 font-normal border border-gray-200">Écriture</th>
                                <th className="py-1 px-2 font-normal border border-gray-200">Statut</th>
                              </tr>
                            </thead>
                            <tbody>
                              {expandedDetail.transactions.map((t) => (
                                <Fragment key={t.id}>
                                  <tr
                                    onClick={() => toggleTxExpand(t.journal_entry_id)}
                                    className="bg-white cursor-pointer hover:bg-gray-100"
                                  >
                                    <td className="py-1 px-2 text-gray-400 border border-gray-200">
                                      {expandedTxId === t.journal_entry_id ? '▾' : '▸'}
                                    </td>
                                    <td className="py-1 px-2 text-gray-600 border border-gray-200">{t.date}</td>
                                    <td className="py-1 px-2 text-gray-600 border border-gray-200">{TYPE_LABELS[t.type] || t.type}</td>
                                    <td className="py-1 px-2 text-gray-700 border border-gray-200">
                                      {t.title || `Écriture n°${t.journal_entry_id}`}
                                    </td>
                                    <td className="py-1 px-2 text-gray-600 border border-gray-200">{STATUS_LABELS[t.status] || t.status}</td>
                                  </tr>

                                  {expandedTxId === t.journal_entry_id && (
                                    <tr className="bg-gray-100">
                                      <td colSpan={5} className="py-2 px-3 border border-gray-200">
                                        {expandedTxLoading && (
                                          <p className="text-gray-400 text-xs">Chargement...</p>
                                        )}

                                        {!expandedTxLoading && expandedTx && (
                                          <div className="text-xs">
                                            <div className="flex items-center gap-3 mb-1">
                                              <span className="text-black font-medium">
                                                {expandedTx.title || `Écriture n°${expandedTx.id}`}
                                              </span>
                                              <span className="text-gray-400">#{expandedTx.id}</span>
                                              {expandedTx.reverses_entry_id && (
                                                <span className="text-gray-600 border border-gray-300 rounded px-1.5 py-0.5">
                                                  Contre-passe la n°{expandedTx.reverses_entry_id}
                                                </span>
                                              )}
                                              <Link
                                                to={`/transactions/${expandedTx.id}`}
                                                className="text-gray-500 hover:text-black underline ml-auto"
                                              >
                                                Ouvrir →
                                              </Link>
                                            </div>
                                            <p className="text-gray-600 mb-2">
                                              {expandedTx.description || (
                                                <span className="text-gray-400">Pas de description</span>
                                              )}
                                            </p>

                                            <table className="w-full border border-gray-200 border-collapse">
                                              <thead>
                                                <tr className="text-left text-gray-500 bg-white">
                                                  <th className="py-1 px-2 font-normal border border-gray-200">
                                                    Compte
                                                  </th>
                                                  <th className="py-1 px-2 font-normal border border-gray-200 text-right">
                                                    Débit
                                                  </th>
                                                  <th className="py-1 px-2 font-normal border border-gray-200 text-right">
                                                    Crédit
                                                  </th>
                                                </tr>
                                              </thead>
                                              <tbody>
                                                {expandedTx.lines.map((l) => (
                                                  <tr key={l.id} className="bg-white">
                                                    <td className="py-1 px-2 text-gray-700 border border-gray-200">
                                                      {l.account_name}{' '}
                                                      {l.account_code ? `(${l.account_code})` : ''}
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

                                        {!expandedTxLoading && !expandedTx && (
                                          <p className="text-gray-400 text-xs">
                                            Échec du chargement des détails de la transaction
                                          </p>
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </Fragment>
                              ))}
                              {expandedDetail.transactions.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-2 text-gray-400 text-center border border-gray-200">
                                    Aucune transaction
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {!expandedLoading && !expandedDetail && (
                        <p className="text-gray-400 text-xs">Échec du chargement des détails de l'immobilisation</p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-gray-400 text-center border border-gray-200">
                  Aucune immobilisation trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default FixedAssetsPage
