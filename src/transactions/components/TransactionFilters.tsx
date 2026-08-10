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
        <label className="text-gray-500">Recherche</label>
        <input
          value={filters.search}
          onChange={(e) => update('search', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
          placeholder="titre ou description"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Statut</label>
        <select
          value={filters.status}
          onChange={(e) => update('status', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Tous</option>
          <option value="draft">Brouillon</option>
          <option value="posted">Comptabilisé</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Contre-passation</label>
        <select
          value={filters.isReversal}
          onChange={(e) => update('isReversal', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Tous</option>
          <option value="true">Contre-passations uniquement</option>
          <option value="false">Non contre-passées</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Date du</label>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => update('dateFrom', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Date au</label>
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
        Rechercher
      </button>
    </form>
  )
}

export default TransactionFilters
