import { useState } from 'react'
import type { FixedAssetFilters as FiltersType } from '../../libs/types'

interface Props {
  onSearch: (filters: FiltersType) => void
}

function FixedAssetFilters({ onSearch }: Props) {
  const [filters, setFilters] = useState<FiltersType>({
    status: '',
    search: '',
    purchaseDateFrom: '',
    purchaseDateTo: '',
    costFrom: '',
    costTo: '',
    depreciationMethod: '',
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
          <option value="active">Actif</option>
          <option value="disposed">Cédé</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Méthode d'amortissement</label>
        <input
          value={filters.depreciationMethod}
          onChange={(e) => update('depreciationMethod', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
          placeholder="ex. straight_line"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Coût de</label>
        <input
          type="number"
          step="0.01"
          value={filters.costFrom}
          onChange={(e) => update('costFrom', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 w-28"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Coût à</label>
        <input
          type="number"
          step="0.01"
          value={filters.costTo}
          onChange={(e) => update('costTo', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1 w-28"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Acheté à partir du</label>
        <input
          type="date"
          value={filters.purchaseDateFrom}
          onChange={(e) => update('purchaseDateFrom', e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-gray-500">Acheté jusqu'au</label>
        <input
          type="date"
          value={filters.purchaseDateTo}
          onChange={(e) => update('purchaseDateTo', e.target.value)}
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

export default FixedAssetFilters
