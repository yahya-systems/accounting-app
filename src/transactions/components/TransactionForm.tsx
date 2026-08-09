import { useEffect, useState } from 'react'
import type { Account } from '../../libs/types'

const API_BASE = 'http://localhost:3000/api'

interface AssetDraft {
  title: string
  description: string
  useful_life_months: string
  depreciation_method: string
}

interface LineDraft {
  account_id: string
  side: 'debit' | 'credit'
  amount: string
  hasAsset: boolean
  asset: AssetDraft
}

export interface TransactionFormValues {
  date: string
  title: string
  description: string
  journal_lines: {
    account_id: number
    debit: number
    credit: number
    asset?: {
      title: string
      description?: string
      cost: number
      useful_life_months: number
      depreciation_method: string
    }
  }[]
}

interface Props {
  onSubmit: (values: TransactionFormValues) => Promise<void>
  onCancel: () => void
}

function emptyAsset(): AssetDraft {
  return { title: '', description: '', useful_life_months: '', depreciation_method: 'straight_line' }
}

function emptyLine(): LineDraft {
  return { account_id: '', side: 'debit', amount: '', hasAsset: false, asset: emptyAsset() }
}

function TransactionForm({ onSubmit, onCancel }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [lines, setLines] = useState<LineDraft[]>([emptyLine(), emptyLine()])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch(`${API_BASE}/accounts?active=true`)
      .then((res) => res.json())
      .then(setAccounts)
      .catch(() => setAccounts([]))
  }, [])

  const updateLine = (index: number, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((l, i) => (i === index ? { ...l, ...patch } : l)))
  }

  const updateAsset = (index: number, patch: Partial<AssetDraft>) => {
    setLines((prev) =>
      prev.map((l, i) => (i === index ? { ...l, asset: { ...l.asset, ...patch } } : l))
    )
  }

  const addLine = () => setLines((prev) => [...prev, emptyLine()])
  const removeLine = (index: number) => setLines((prev) => prev.filter((_, i) => i !== index))

  const totalDebit = lines
    .filter((l) => l.side === 'debit')
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0)
  const totalCredit = lines
    .filter((l) => l.side === 'credit')
    .reduce((sum, l) => sum + (Number(l.amount) || 0), 0)
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005 && totalDebit > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!balanced) {
      setError('Total debits must equal total credits')
      return
    }
    if (lines.some((l) => !l.account_id || !l.amount)) {
      setError('Every line needs an account and an amount')
      return
    }
    const assetLinesInvalid = lines.some(
      (l) => l.hasAsset && (!l.asset.title || !l.asset.useful_life_months)
    )
    if (assetLinesInvalid) {
      setError('Asset lines need a title and useful life')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        date,
        title,
        description,
        journal_lines: lines.map((l) => ({
          account_id: Number(l.account_id),
          debit: l.side === 'debit' ? Number(l.amount) : 0,
          credit: l.side === 'credit' ? Number(l.amount) : 0,
          asset: l.hasAsset
            ? {
              title: l.asset.title,
              description: l.asset.description || undefined,
              cost: Number(l.amount), // must match the line amount, per backend validation
              useful_life_months: Number(l.asset.useful_life_months),
              depreciation_method: l.asset.depreciation_method || 'straight_line',
            }
            : undefined,
        })),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
          required
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Description</label>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-gray-500">Journal lines</label>
        {lines.map((line, i) => (
          <div key={i} className="border border-gray-200 rounded p-2 flex flex-col gap-2">
            <div className="flex gap-1.5 items-center">
              <select
                value={line.account_id}
                onChange={(e) => updateLine(i, { account_id: e.target.value })}
                className="border border-gray-300 rounded px-1.5 py-1 flex-1 min-w-0 text-xs"
              >
                <option value="">Select account</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} {a.code ? `(${a.code})` : ''}
                  </option>
                ))}
              </select>

              <select
                value={line.side}
                onChange={(e) => updateLine(i, { side: e.target.value as 'debit' | 'credit' })}
                className="border border-gray-300 rounded px-1.5 py-1 w-20 text-xs"
              >
                <option value="debit">Debit</option>
                <option value="credit">Credit</option>
              </select>

              <input
                type="number"
                step="0.01"
                min="0"
                value={line.amount}
                onChange={(e) => updateLine(i, { amount: e.target.value })}
                className="border border-gray-300 rounded px-1.5 py-1 w-20 text-xs"
                placeholder="0.00"
              />

              <button
                type="button"
                onClick={() => removeLine(i)}
                disabled={lines.length <= 2}
                className="text-gray-400 hover:text-black disabled:opacity-30 text-xs shrink-0"
              >
                ✕
              </button>
            </div>

            <label className="flex items-center gap-1.5 text-xs text-gray-500">
              <input
                type="checkbox"
                checked={line.hasAsset}
                onChange={(e) => updateLine(i, { hasAsset: e.target.checked })}
              />
              This line registers a fixed asset
            </label>

            {line.hasAsset && (
              <div className="flex flex-col gap-1.5 pl-4 border-l border-gray-200">
                <input
                  value={line.asset.title}
                  onChange={(e) => updateAsset(i, { title: e.target.value })}
                  placeholder="Asset title"
                  className="border border-gray-300 rounded px-1.5 py-1 text-xs"
                />
                <input
                  value={line.asset.description}
                  onChange={(e) => updateAsset(i, { description: e.target.value })}
                  placeholder="Asset description (optional)"
                  className="border border-gray-300 rounded px-1.5 py-1 text-xs"
                />
                <div className="flex gap-1.5">
                  <input
                    type="number"
                    min="1"
                    value={line.asset.useful_life_months}
                    onChange={(e) => updateAsset(i, { useful_life_months: e.target.value })}
                    placeholder="Useful life (months)"
                    className="border border-gray-300 rounded px-1.5 py-1 text-xs flex-1"
                  />
                  <input
                    value={line.asset.depreciation_method}
                    onChange={(e) => updateAsset(i, { depreciation_method: e.target.value })}
                    placeholder="Depreciation method"
                    className="border border-gray-300 rounded px-1.5 py-1 text-xs flex-1"
                  />
                </div>
                <p className="text-gray-400 text-xs">
                  Cost will be set to this line's amount ({line.amount || '0.00'}). Purchase date
                  will match the transaction date.
                </p>
              </div>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={addLine}
          className="text-gray-500 hover:text-black text-xs self-start"
        >
          + Add line
        </button>

        <div className="flex justify-between text-xs text-gray-500 border-t border-gray-200 pt-2">
          <span>Debit total: {totalDebit.toFixed(2)}</span>
          <span>Credit total: {totalCredit.toFixed(2)}</span>
          <span className={balanced ? 'text-gray-500' : 'text-gray-800 font-medium'}>
            {balanced ? 'Balanced' : 'Not balanced'}
          </span>
        </div>
      </div>

      {error && <p className="text-gray-800 text-xs">{error}</p>}

      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={onCancel}
          className="border border-gray-300 rounded px-3 py-1 text-gray-600 hover:text-black"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || !balanced}
          className="bg-black text-white rounded px-3 py-1 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Create'}
        </button>
      </div>
    </form>
  )
}

export default TransactionForm
