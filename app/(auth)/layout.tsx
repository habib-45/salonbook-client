import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowUpRight, Star } from "lucide-react"
import { Logo } from "@/components/ui/logo"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh bg-cream lg:grid-cols-[1.02fr_0.98fr]">
      <aside className="relative hidden min-h-dvh overflow-hidden bg-burgundy-dark lg:block">
        <Image
          src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1400&q=85"
          alt="A stylist caring for a guest's hair at SalonBook"
          fill
          priority
          sizes="50vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#25151b]/95 via-[#25151b]/35 to-[#25151b]/30" />
        <div className="absolute inset-0 border-[1.5rem] border-burgundy-dark/15" />

        <div className="relative z-10 flex h-full flex-col justify-between p-10 xl:p-14">
          <div className="flex items-center justify-between gap-5">
            <Logo variant="light" />
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[0.6rem] font-bold tracking-[0.14em] text-cream/80 uppercase backdrop-blur">
              Brooklyn · Est. 2018
            </span>
          </div>

          <div className="max-w-md">
            <div className="mb-5 flex gap-1 text-gold">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3.5 fill-current" />
              ))}
            </div>
            <blockquote className="font-serif text-[2.8rem] leading-[1.04] tracking-[-0.035em] text-cream xl:text-[3.3rem]">
              “A little time for yourself isn&apos;t a luxury. It&apos;s a{" "}
              <span className="italic text-rose">rhythm.</span>”
            </blockquote>
            <p className="mt-5 text-[0.6875rem] font-bold tracking-[0.15em] text-cream/50 uppercase">
              The SalonBook philosophy
            </p>

            <div className="mt-10 flex items-center gap-4 border-t border-white/15 pt-6">
              <div className="flex -space-x-2">
                {[
                  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=80&q=80",
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80",
                  "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=80&q=80",
                ].map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt=""
                    width={34}
                    height={34}
                    className="size-[34px] rounded-full border-2 border-burgundy-dark object-cover"
                  />
                ))}
              </div>
              <p className="text-xs leading-5 text-cream/60">
                Trusted by <span className="font-semibold text-cream">1,200+ guests</span> who
                make time for themselves.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[0.65rem] text-cream/40">
            <span>24 Willow Lane, Brooklyn</span>
            <span className="inline-flex items-center gap-1">
              View the salon <ArrowUpRight className="size-3" />
            </span>
          </div>
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:justify-end">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-soft transition hover:text-ink"
          >
            <ArrowLeft className="size-3.5" />
            Back to salon
          </Link>
        </div>
        <div className="flex flex-1 items-start justify-center px-5 py-6 sm:px-8 sm:py-10 lg:items-center lg:px-12">
          <div className="w-full max-w-[26rem] animate-fade-up">{children}</div>
        </div>
        <div className="px-5 py-5 text-center text-[0.625rem] text-ink-soft/70 sm:px-8">
          © {new Date().getFullYear()} SalonBook · Thoughtful beauty, beautifully booked.
        </div>
      </div>
    </div>
  )
}
