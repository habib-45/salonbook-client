"use client"

import * as React from "react"
import {
  ArrowUpRight,
  BadgeDollarSign,
  CalendarDays,
  Copy,
  Download,
  ReceiptText,
  Search,
  TrendingUp,
  Wallet,
  X,
  XCircle,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { useToast } from "@/components/providers/toast-provider"
import { Avatar } from "@/components/ui/avatar"
import { Button, ButtonLink } from "@/components/ui/button"
import { DashboardSkeleton, EmptyState } from "@/components/ui/feedback"
import { Select } from "@/components/ui/form-field"
import { StatusBadge } from "@/components/ui/status-badge"
import { PageHeader, StatCard } from "@/components/dashboard/ui"
import { getTransactionsNewest } from "@/lib/selectors"
import type { TransactionStatus } from "@/lib/types"
import {
  cn,
  formatCurrency,
  formatDate,
  formatDateTime,
  truncateMiddle,
} from "@/lib/utils"

type StatusFilter = "all" | TransactionStatus

function csvCell(value: string | number) {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function AdminTransactions() {
  const { db } = useStore()
  const toast = useToast()

  const [query, setQuery] = React.useState("")
  const [filter, setFilter] = React.useState<StatusFilter>("all")

  if (!db) return <DashboardSkeleton />

  const transactions = getTransactionsNewest(db)
  const paid = transactions.filter((transaction) => transaction.status === "paid")
  const failed = transactions.filter((transaction) => transaction.status === "failed")
  const revenue = paid.reduce((total, transaction) => total + transaction.amount, 0)
  const average = paid.length > 0 ? revenue / paid.length : 0

  const term = query.trim().toLowerCase()
  const visible = transactions.filter((transaction) => {
    const matchesStatus = filter === "all" || transaction.status === filter
    const matchesTerm =
      !term ||
      transaction.customer?.name.toLowerCase().includes(term) ||
      transaction.customer?.email.toLowerCase().includes(term) ||
      transaction.service?.serviceName.toLowerCase().includes(term) ||
      transaction.stripeSessionId.toLowerCase().includes(term) ||
      transaction.id.toLowerCase().includes(term)
    return matchesStatus && matchesTerm
  })

  const hasFilters = Boolean(term) || filter !== "all"

  const clearFilters = () => {
    setQuery("")
    setFilter("all")
  }

  const exportCsv = () => {
    const header = [
      "Transaction ID",
      "Stripe session",
      "Customer",
      "Email",
      "Service",
      "Appointment date",
      "Amount",
      "Currency",
      "Status",
      "Paid at",
    ]
    const rows = visible.map((transaction) => [
      transaction.id,
      transaction.stripeSessionId,
      transaction.customer?.name ?? "",
      transaction.customer?.email ?? "",
      transaction.service?.serviceName ?? "",
      transaction.appointment?.appointmentDate ?? "",
      transaction.amount,
      transaction.currency,
      transaction.status,
      transaction.createdAt,
    ])
    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `salonbook-transactions-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    toast.success("Report exported", `${visible.length} transactions saved as a CSV file.`)
  }

  const copySession = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      toast.success("Session ID copied", "The Stripe session ID is on your clipboard.")
    } catch {
      toast.error("Could not copy", "Please select and copy the session ID manually.")
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Transaction report"
        title="Every payment, accounted for."
        description="Review successful and failed payments, search by guest or service, and export the filtered report for your records."
        actions={
          <>
            <ButtonLink href="/dashboard/admin/appointments" variant="outline">
              <CalendarDays className="size-4" />
              Appointments
            </ButtonLink>
            <Button onClick={exportCsv} disabled={visible.length === 0}>
              <Download className="size-4" />
              Export CSV
            </Button>
          </>
        }
      />

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BadgeDollarSign}
          label="Paid revenue"
          value={formatCurrency(revenue)}
          detail={`${paid.length} successful ${paid.length === 1 ? "payment" : "payments"}`}
          tone="sage"
        />
        <StatCard
          icon={TrendingUp}
          label="Average payment"
          value={formatCurrency(average)}
          detail="Across successful checkouts"
          tone="gold"
        />
        <StatCard
          icon={ReceiptText}
          label="Transactions"
          value={transactions.length}
          detail="All checkout records"
          tone="neutral"
        />
        <StatCard
          icon={XCircle}
          label="Failed payments"
          value={failed.length}
          detail={
            failed.length ? "Review in the table below" : "No failed checkouts recorded"
          }
          tone="rose"
        />
      </div>

      <div className="mt-6 rounded-2xl border border-sand/80 bg-surface/55 p-3.5 shadow-[0_18px_50px_-42px_rgba(52,37,28,0.45)] sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search transactions</span>
            <Search className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-soft" />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer, service, transaction, or session ID…"
              className="input-field h-11 pl-10"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-ink-soft transition hover:bg-cream-deep hover:text-ink"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </label>

          <Select
            aria-label="Filter by payment status"
            value={filter}
            onChange={(event) => setFilter(event.target.value as StatusFilter)}
            className="h-11 bg-surface/70 sm:w-[180px]"
          >
            <option value="all">All transactions</option>
            <option value="paid">Paid only</option>
            <option value="failed">Failed only</option>
          </Select>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-soft">
          Showing <span className="font-bold text-ink">{visible.length}</span>{" "}
          {visible.length === 1 ? "transaction" : "transactions"}
          {filter !== "all" ? ` · ${filter}` : ""}
        </p>
        {hasFilters ? (
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-1.5 rounded-full border border-sand bg-surface/50 px-3 py-1.5 text-[0.6875rem] font-semibold text-ink-soft transition hover:border-sand-dark hover:text-ink"
          >
            <X className="size-3" />
            Clear filters
          </button>
        ) : null}
      </div>

      <div className="mt-4">
        {visible.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No transactions found"
            description="Try a different customer, service, session ID, or payment status."
            action={
              hasFilters ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear filters
                </Button>
              ) : null
            }
            className="min-h-[320px]"
          />
        ) : (
          <>
            <div className="surface-card hidden overflow-hidden lg:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-sand/80 bg-cream-deep/35">
                      {["Transaction", "Customer", "Service", "Date", "Amount", "Status"].map(
                        (heading) => (
                          <th
                            key={heading}
                            scope="col"
                            className={cn(
                              "px-5 py-3 text-[0.5625rem] font-bold tracking-[0.13em] text-ink-soft uppercase",
                              heading === "Amount" && "text-right"
                            )}
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/70">
                    {visible.map((transaction) => (
                      <tr key={transaction.id} className="transition hover:bg-surface/45">
                        <td className="px-5 py-3.5">
                          <p className="max-w-[160px] truncate text-xs font-semibold">
                            {transaction.id}
                          </p>
                          <button
                            type="button"
                            onClick={() => copySession(transaction.stripeSessionId)}
                            className="mt-1 inline-flex max-w-[190px] items-center gap-1.5 truncate text-[0.625rem] text-ink-soft transition hover:text-accent"
                            title="Copy Stripe session ID"
                          >
                            <Copy className="size-2.5 shrink-0" />
                            {truncateMiddle(transaction.stripeSessionId, 14, 4)}
                          </button>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar
                              src={transaction.customer?.image}
                              name={transaction.customer?.name ?? "Customer"}
                              size={30}
                            />
                            <div className="min-w-0">
                              <p className="max-w-[150px] truncate text-xs font-semibold">
                                {transaction.customer?.name ?? "Customer"}
                              </p>
                              <p className="max-w-[190px] truncate text-[0.625rem] text-ink-soft">
                                {transaction.customer?.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="max-w-[180px] truncate text-xs">
                            {transaction.service?.serviceName ?? "Salon service"}
                          </p>
                          <p className="mt-0.5 text-[0.625rem] text-ink-soft">
                            {transaction.appointment
                              ? `Visit ${formatDate(transaction.appointment.appointmentDate)}`
                              : "Appointment removed"}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-[0.6875rem] text-ink-soft">
                          {formatDateTime(transaction.createdAt)}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <p className="text-sm font-bold text-accent">
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </p>
                          <p className="mt-0.5 text-[0.5625rem] text-ink-soft">
                            {transaction.currency}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={transaction.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-sand/80 bg-cream-deep/25 px-5 py-3.5">
                <p className="text-[0.6875rem] text-ink-soft">
                  Filtered total:{" "}
                  <span className="font-bold text-ink">
                    {formatCurrency(
                      visible
                        .filter((transaction) => transaction.status === "paid")
                        .reduce((total, transaction) => total + transaction.amount, 0)
                    )}
                  </span>
                </p>
                <p className="text-[0.625rem] text-ink-soft/70">
                  Stripe records only
                </p>
              </div>
            </div>

            <div className="space-y-3.5 lg:hidden">
              {visible.map((transaction) => (
                <div key={transaction.id} className="surface-card overflow-hidden p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <Avatar
                        src={transaction.customer?.image}
                        name={transaction.customer?.name ?? "Customer"}
                        size={36}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                          {transaction.customer?.name ?? "Customer"}
                        </p>
                        <p className="truncate text-[0.625rem] text-ink-soft">
                          {transaction.customer?.email}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={transaction.status} className="shrink-0" />
                  </div>

                  <div className="mt-3 rounded-xl bg-cream-deep/50 px-3 py-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold">
                          {transaction.service?.serviceName ?? "Salon service"}
                        </p>
                        <p className="mt-0.5 text-[0.625rem] text-ink-soft">
                          {formatDateTime(transaction.createdAt)}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-accent">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3 text-[0.625rem] text-ink-soft">
                    <button
                      type="button"
                      onClick={() => copySession(transaction.stripeSessionId)}
                      className="inline-flex items-center gap-1.5 hover:text-accent"
                    >
                      <Copy className="size-3" />
                      {truncateMiddle(transaction.stripeSessionId, 12, 4)}
                    </button>
                    <span className="inline-flex items-center gap-1">
                      <ArrowUpRight className="size-3" />
                      {transaction.id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="mt-5 flex flex-col items-center justify-center gap-1.5 text-center text-[0.625rem] leading-5 text-ink-soft/75 sm:flex-row">
        <Wallet className="size-3" />
        <span>
          Payments are recorded only after Stripe confirms them. Exported reports reflect
          your SalonBook transaction history.
        </span>
      </div>
    </>
  )
}
