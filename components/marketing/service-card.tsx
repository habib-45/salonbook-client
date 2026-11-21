import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, Clock3 } from "lucide-react"
import type { Service } from "@/lib/types"
import { formatCurrency, formatDuration } from "@/lib/utils"

export function ServiceCard({ service, priority = false }: { service: Service; priority?: boolean }) {
  return (
    <Link
      href={`/services/${service.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-sand/80 bg-surface/55 shadow-[0_18px_50px_-42px_rgba(52,37,28,0.5)] transition duration-300 hover:-translate-y-1 hover:border-sand-dark hover:bg-surface hover:shadow-[0_26px_60px_-35px_rgba(52,37,28,0.35)] focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-4 focus-visible:ring-offset-cream focus-visible:outline-none"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-cream-deep">
        <Image
          src={service.image}
          alt={service.serviceName}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-700 group-hover:scale-[1.035]"
        />
        <span className="absolute top-3.5 left-3.5 rounded-full border border-white/50 bg-cream/90 px-3 py-1 text-[0.625rem] font-bold tracking-[0.06em] text-accent uppercase backdrop-blur-md">
          {service.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-serif text-[1.55rem] leading-[1.1] tracking-[-0.03em] text-ink">
            {service.serviceName}
          </h3>
          <span className="shrink-0 pt-1 text-sm font-bold text-accent">
            {formatCurrency(service.price)}
          </span>
        </div>

        <p className="mt-2.5 line-clamp-2 text-[0.8125rem] leading-6 text-ink-soft">
          {service.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <span className="inline-flex items-center gap-1.5 text-[0.6875rem] font-medium text-ink-soft">
            <Clock3 className="size-3.5 text-gold" />
            {formatDuration(service.duration)}
          </span>
          <span className="inline-flex items-center gap-1 text-[0.6875rem] font-bold tracking-[0.06em] text-ink uppercase">
            View details
            <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}
