import { useState } from 'react'
import type { Account, AccountCategory } from '../../../lib/types'

const CATEGORIES: AccountCategory[] = ['asset', 'liability', 'equity', 'revenue', 'expense']

export interface AccountFormValues {
  name: string
  description: string
  code: string
  category: AccountCategory
}

interface Props {
  mode: 'create' | 'edit'
  initial?: Account
  onSubmit: (values: Partial<AccountFormValues>) => Promise<void>
  onCancel: () => void
}

function AccountForm({ mode, initial, onSubmit, onCancel }: Props) {
  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [code, setCode] = useState(initial?.code ?? '')
  const [category, setCategory] = useState<AccountCategory>(initial?.category ?? 'asset')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (mode === 'create') {
        await onSubmit({ name, description, code, category })
      } else {
        // edit only allows name/description per backend
        await onSubmit({ name, description })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-sm">
      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        />
      </div>

      {mode === 'create' && (
        <>
          <div className="flex flex-col gap-1">
            <label className="text-gray-500">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-gray-500">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AccountCategory)}
              className="border border-gray-300 rounded px-2 py-1"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

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
          disabled={submitting}
          className="bg-black text-white rounded px-3 py-1 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
        </button>
      </div>
    </form>
  )
}

export default AccountForm
