import { useEffect, useState, useCallback, Fragment } from 'react'
import { Link } from 'react-router-dom'
import type { FixedAsset, FixedAssetDetail, FixedAssetFilters as FiltersType, TransactionDetail } from '../libs/types'
import FixedAssetFilters from './components/FixedAssetFilters'
import BackToHome from '../components/BackToHome'

const API_BASE = import.meta.env.VITE_URL

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
      if (!res.ok) throw new Error('Failed to fetch fixed assets')
      const data = await res.json()
      setAssets(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
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
      if (!res.ok) throw new Error('Failed to load asset')
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
      if (!res.ok) throw new Error('Failed to load transaction')
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

      <h1 className="text-xl font-medium text-black mt-4 mb-6">Fixed Assets</h1>

      <FixedAssetFilters onSearch={fetchAssets} />

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error && <p className="text-gray-800 text-sm">{error}</p>}

      {!loading && !error && (
        <table className="w-full text-sm border border-gray-200 border-collapse">
          <thead>
            <tr className="text-left text-gray-500 bg-gray-50">
              <th className="py-2 px-3 font-normal border border-gray-200 w-6"></th>
              <th className="py-2 px-3 font-normal border border-gray-200">Title</th>
              <th className="py-2 px-3 font-normal border border-gray-200 text-right">Cost</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Purchased</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Useful life</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Depreciation</th>
              <th className="py-2 px-3 font-normal border border-gray-200">Status</th>
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
                    {asset.useful_life_months} mo
                  </td>
                  <td className="py-2 px-3 text-gray-600 border border-gray-200">
                    {asset.depreciation_method}
                  </td>
                  <td className="py-2 px-3 text-gray-600 border border-gray-200">{asset.status}</td>
                </tr>

                {expandedId === asset.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="py-3 px-4 border border-gray-200">
                      {expandedLoading && <p className="text-gray-400 text-xs">Loading...</p>}

                      {!expandedLoading && expandedDetail && (
                        <div className="text-xs">
                          <p className="text-gray-600 mb-3">
                            {expandedDetail.description || (
                              <span className="text-gray-400">No description</span>
                            )}
                          </p>

                          <table className="w-full border border-gray-200 border-collapse">
                            <thead>
                              <tr className="text-left text-gray-500 bg-white">
                                <th className="py-1 px-2 font-normal border border-gray-200 w-6"></th>
                                <th className="py-1 px-2 font-normal border border-gray-200">Date</th>
                                <th className="py-1 px-2 font-normal border border-gray-200">Type</th>
                                <th className="py-1 px-2 font-normal border border-gray-200">Entry</th>
                                <th className="py-1 px-2 font-normal border border-gray-200">Status</th>
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
                                    <td className="py-1 px-2 text-gray-600 border border-gray-200">{t.type}</td>
                                    <td className="py-1 px-2 text-gray-700 border border-gray-200">
                                      {t.title || `Entry #${t.journal_entry_id}`}
                                    </td>
                                    <td className="py-1 px-2 text-gray-600 border border-gray-200">{t.status}</td>
                                  </tr>

                                  {expandedTxId === t.journal_entry_id && (
                                    <tr className="bg-gray-100">
                                      <td colSpan={5} className="py-2 px-3 border border-gray-200">
                                        {expandedTxLoading && (
                                          <p className="text-gray-400 text-xs">Loading...</p>
                                        )}

                                        {!expandedTxLoading && expandedTx && (
                                          <div className="text-xs">
                                            <div className="flex items-center gap-3 mb-1">
                                              <span className="text-black font-medium">
                                                {expandedTx.title || `Entry #${expandedTx.id}`}
                                              </span>
                                              <span className="text-gray-400">#{expandedTx.id}</span>
                                              {expandedTx.reverses_entry_id && (
                                                <span className="text-gray-600 border border-gray-300 rounded px-1.5 py-0.5">
                                                  Reverses #{expandedTx.reverses_entry_id}
                                                </span>
                                              )}
                                              <Link
                                                to={`/transactions/${expandedTx.id}`}
                                                className="text-gray-500 hover:text-black underline ml-auto"
                                              >
                                                Open →
                                              </Link>
                                            </div>
                                            <p className="text-gray-600 mb-2">
                                              {expandedTx.description || (
                                                <span className="text-gray-400">No description</span>
                                              )}
                                            </p>

                                            <table className="w-full border border-gray-200 border-collapse">
                                              <thead>
                                                <tr className="text-left text-gray-500 bg-white">
                                                  <th className="py-1 px-2 font-normal border border-gray-200">
                                                    Account
                                                  </th>
                                                  <th className="py-1 px-2 font-normal border border-gray-200 text-right">
                                                    Debit
                                                  </th>
                                                  <th className="py-1 px-2 font-normal border border-gray-200 text-right">
                                                    Credit
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
                                            Failed to load transaction details
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
                                    No transactions
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {!expandedLoading && !expandedDetail && (
                        <p className="text-gray-400 text-xs">Failed to load asset details</p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={7} className="py-4 text-gray-400 text-center border border-gray-200">
                  No fixed assets found
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
