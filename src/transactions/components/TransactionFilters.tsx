import { useState } from 'react'
import type { TransactionFilters as FiltersType } from '../../libs/types.ts'

interface Props {
  onSearch: (filters: FiltersType) => void
}

function TransactionFilters({ onSearch }: Props) {
  const [filters, setFilters] = useState<FiltersType>({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: '',
    isReversal: '',
    reversesEntryId: '',
  })

  const update = (key: keyof FiltersType, value: string) => {
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
          placeholder="title or description"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Status</label>
        <select
          value={filters.status}
          onChange={(e) => update('status', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Any</option>
          <option value="draft">Draft</option>
          <option value="posted">Posted</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Reversal</label>
        <select
          value={filters.isReversal}
          onChange={(e) => update('isReversal', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Any</option>
          <option value="true">Reversals only</option>
          <option value="false">Non-reversals</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Date from</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update('dateFrom', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Date to</label>
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

export default TransactionFilters
