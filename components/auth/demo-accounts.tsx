"use client"

import { ShieldCheck, UserRound } from "lucide-react"
import { DEMO_ACCOUNTS } from "@/lib/constants"

export function DemoAccounts({
  onSelect,
}: {
  onSelect: (email: string, password: string) => void
}) {
  return (
    <div className="mt-6 rounded-2xl border border-sand/80 bg-surface/35 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[0.625rem] font-bold tracking-[0.13em] text-ink-soft uppercase">
          Demo accounts
        </p>
        <span className="text-[0.625rem] text-ink-soft/70">Tap to fill</span>
      </div>
      <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
        {(["customer", "admin"] as const).map((key) => {
          const account = DEMO_ACCOUNTS[key]
          const Icon = key === "admin" ? ShieldCheck : UserRound
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(account.email, account.password)}
              className="group flex items-start gap-2.5 rounded-xl border border-sand/70 bg-cream/60 p-2.5 text-left transition hover:border-sand-dark hover:bg-surface"
            >
              <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-cream-deep text-accent">
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.6875rem] font-bold capitalize">{key}</span>
                <span className="mt-0.5 block truncate text-[0.625rem] text-ink-soft">
                  {account.email}
                </span>
                <span className="mt-0.5 block text-[0.625rem] text-ink-soft/70">
                  {account.password}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
