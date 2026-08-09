export type AccountCategory = 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'

export interface Account {
  id: number
  name: string
  description: string | null
  code: string | null
  category: AccountCategory
  is_active: boolean
  created_at: string
}

export interface AccountFilters {
  search?: string
  category?: AccountCategory | ''
  active?: 'true' | 'false' | ''
  codeFrom?: string
  codeTo?: string
  dateFrom?: string
  dateTo?: string
}

export interface AccountJournalLine {
  journal_line_id: number
  journal_entry_id: number
  date: string
  title: string | null
  status: 'draft' | 'posted'
  debit: string
  credit: string
}

export interface AccountDetail extends Account {
  journal_lines: AccountJournalLine[]
}

export interface JournalLineDetail {
  id: number
  account_id: number
  account_name: string
  account_code: string | null
  debit: string
  credit: string
}

export interface TransactionDetail {
  id: number
  date: string
  title: string | null
  description: string | null
  status: 'draft' | 'posted'
  posted_at: string | null
  reverses_entry_id: number | null
  created_at: string
  lines: JournalLineDetail[]
}

export interface JournalLineDetail {
  id: number
  account_id: number
  account_name: string
  account_code: string | null
  debit: string
  credit: string
}

export interface Transaction {
  id: number
  date: string
  title: string | null
  description: string | null
  status: 'draft' | 'posted'
  posted_at: string | null
  reverses_entry_id: number | null
  created_at: string
}

export interface TransactionDetail extends Transaction {
  lines: JournalLineDetail[]
}

export interface TransactionFilters {
  status?: 'draft' | 'posted' | ''
  dateFrom?: string
  dateTo?: string
  search?: string
  isReversal?: 'true' | 'false' | ''
  reversesEntryId?: string
}

export interface AssetTransaction {
  id: number
  journal_entry_id: number
  type: 'purchase' | 'depreciation' | 'disposal'
  created_at: string
  date: string
  title: string | null
  status: 'draft' | 'posted'
}

export interface FixedAsset {
  id: number
  title: string
  description: string | null
  cost: string
  purchase_date: string
  useful_life_months: number
  depreciation_method: string
  status: 'active' | 'disposed'
  created_at: string
}

export interface FixedAssetDetail extends FixedAsset {
  transactions: AssetTransaction[]
}

export interface FixedAssetFilters {
  status?: 'active' | 'disposed' | ''
  search?: string
  purchaseDateFrom?: string
  purchaseDateTo?: string
  costFrom?: string
  costTo?: string
  depreciationMethod?: string
}
