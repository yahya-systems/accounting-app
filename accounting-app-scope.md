# Personal/Small-Business Accounting Ledger — v1 Scope

## Core (non-negotiable)

- **Chart of accounts** — flat list, 5 types (Asset, Liability, Equity, Revenue, Expense), each with a debit-normal or credit-normal behavior
- **Journal entries** — dated, with a description, `status: draft | posted`
- **Journal lines** — belong to an entry, reference one account, hold either a debit or credit amount (never both)
- **Balance validation** — enforced at insert time: `sum(debit) == sum(credit)` per entry, wrapped in a single DB transaction
- **Immutability** — posted entries are never updated or deleted; corrections happen via reversing entries

## Derived (queries, no new tables)

- Account balance (sum of its lines)
- Trial balance (all accounts, one screen)
- Balance sheet (Assets = Liabilities + Equity, at a date)
- Income statement (Revenue − Expenses, over a date range)

## One subledger, to prove the pattern generalizes

- **Fixed assets** — description, cost, purchase date, useful life, depreciation method
- Linked to journal entries via a join table (`asset_transactions`), tagged by type (purchase / depreciation / disposal)
- "Generate depreciation entry" — autofill a draft transaction from the asset's stored rate, user reviews and posts

## Opening balances

- Just a normal journal entry, dated as the ledger's start, with an "Opening Balance Equity" account as the plug

## Explicitly out of scope for v1 (future supersets, same pattern, add later)

- Invoicing / Accounts Receivable
- Bills / Accounts Payable
- Payroll
- Multi-user auth/roles, period locking
- Multi-currency
- Tax filing/report generation beyond raw account balances
- Bank statement import/reconciliation

## Stack

- Postgres (local dev, learning it properly)
- Node.js/TypeScript backend
- Plain web frontend to start (Electron wrapper optional, later)

## Architectural principles established

- The core ledger (`journal_entries` + `journal_lines`) is the single source of truth — deliberately generic, knows nothing about "what" was bought, only monetary value and account category
- Everything else (subledgers, tags, budgets) is a satellite table pointing **back** at `journal_entries`/`journal_lines` via foreign key — never the reverse
- Account balances are always **computed** (summed from history), never stored as a mutable running total
- Every relationship flows from specific → general (children point to parents); nothing holds an embedded list of its children
- Posted entries are permanent; corrections are new reversing entries, never edits or deletes
- Backups matter more here than in most apps — the append-only design keeps backups conceptually simple and trustworthy
