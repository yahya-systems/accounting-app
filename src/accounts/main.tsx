import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import type { Account, AccountFilters as AccountFiltersType } from '../libs/types.ts'
import AccountFilters from './components/AccountFilters'
import BackToHome from '../components/BackToHome.tsx'
import AccountForm, { type AccountFormValues } from './components/AccountForm'
import Modal from '../components/Modal'

const API_BASE = 'http://localhost:3000/api'

function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Account | null>(null)

  const fetchAccounts = useCallback(async (filters?: AccountFiltersType) => {
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
      const res = await fetch(`${API_BASE}/accounts${query ? `?${query}` : ''}`)
      if (!res.ok) throw new Error('Failed to fetch accounts')
      const data = await res.json()
      setAccounts(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleCreate = async (values: Partial<AccountFormValues>) => {
    const res = await fetch(`${API_BASE}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error?.[0]?.message ?? body?.error ?? 'Failed to create account')
    }
    setCreateOpen(false)
    await fetchAccounts()
  }

  const handleEdit = async (values: Partial<AccountFormValues>) => {
    if (!editing) return
    const res = await fetch(`${API_BASE}/accounts/${editing.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error?.[0]?.message ?? body?.error ?? 'Failed to update account')
    }
    setEditing(null)
    await fetchAccounts()
  }

  const toggleActive = async (account: Account) => {
    const res = await fetch(`${API_BASE}/accounts/${account.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !account.is_active }),
    })
    if (!res.ok) return
    await fetchAccounts()
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <BackToHome />
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-medium text-black">Accounts</h1>
        <button
          onClick={() => setCreateOpen(true)}
          className="border border-gray-300 rounded px-3 py-1 text-sm text-gray-700 hover:border-black hover:text-black"
        >
          + New Account
        </button>
      </div>

      <AccountFilters onSearch={fetchAccounts} />

      {loading && <p className="text-gray-400 text-sm">Loading...</p>}
      {error && <p className="text-gray-800 text-sm">{error}</p>}

      {!loading && !error && (
        <table className="w-full text-sm border-t border-gray-200">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-200">
              <th className="py-2 font-normal">Name</th>
              <th className="py-2 font-normal">Code</th>
              <th className="py-2 font-normal">Category</th>
              <th className="py-2 font-normal">Status</th>
              <th className="py-2 font-normal">Created</th>
              <th className="py-2 font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id} className="border-b border-gray-100">
                <td className="py-2">
                  <Link to={`/accounts/${account.id}`} className="text-black hover:underline">
                    {account.name}
                  </Link>
                </td>
                <td className="py-2 text-gray-600">{account.code}</td>
                <td className="py-2 text-gray-600">{account.category}</td>
                <td className="py-2 text-gray-600">{account.is_active ? 'Active' : 'Inactive'}</td>
                <td className="py-2 text-gray-600">
                  {new Date(account.created_at).toLocaleDateString()}
                </td>
                <td className="py-2 text-right">
                  ...
                </td>
              </tr>
            ))}
            {accounts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-4 text-gray-400 text-center">
                  No accounts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )
      }

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="New Account">
        <AccountForm mode="create" onSubmit={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Edit Account">
        {editing && (
          <AccountForm mode="edit" initial={editing} onSubmit={handleEdit} onCancel={() => setEditing(null)} />
        )}
      </Modal>
    </div >
  )
}

export default AccountsPage
