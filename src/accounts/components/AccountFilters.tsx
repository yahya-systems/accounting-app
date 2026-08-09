import { useState } from 'react'
import type { AccountFilters as AccountFiltersType } from '../../../lib/types'

interface Props {
  onSearch: (filters: AccountFiltersType) => void
}

const CATEGORIES = ['asset', 'liability', 'equity', 'revenue', 'expense'] as const

function AccountFilters({ onSearch }: Props) {
  const [filters, setFilters] = useState<AccountFiltersType>({
    search: '',
    category: '',
    active: '',
    codeFrom: '',
    codeTo: '',
    dateFrom: '',
    dateTo: '',
  })

  const update = (key: keyof AccountFiltersType, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(filters)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 items-end mb-4 text-sm">
      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Search</label>
        <input
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
          placeholder="name or description"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Category</label>
        <select
          value={filters.category}
          onChange={(e) => update('category', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Any</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Active</label>
        <select
          value={filters.active}
          onChange={(e) => update('active', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Any</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Code from</label>
        <input
          value={filters.codeFrom}
          onChange={(e) => update('codeFrom', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 w-24"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Code to</label>
        <input
          value={filters.codeTo}
          onChange={(e) => update('codeTo', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 w-24"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Created from</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update('dateFrom', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Created to</label>
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => update('dateTo', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <button
        type="submit"
        className="border border-gray-300 rounded px-3 py-1 text-gray-700 hover:border-black hover:text-black"
      >
        Search
      </button>
    </form>
  )
}

export default AccountFilters
