"use client"

import Link from "next/link"
import { Clock3, Mail, MapPin, Phone } from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { Logo } from "@/components/ui/logo"
import { SALON } from "@/lib/constants"

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.4" cy="6.7" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  )
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.2 3C7.2 3 4 6.3 4 10.2c0 2.4 1.3 4.4 3.4 5.2.3.1.5 0 .6-.3l.5-1.9c.1-.3 0-.5-.2-.7-.7-.8-1.1-1.8-1.1-3 0-2.9 2.2-5.5 5.6-5.5 3 0 4.9 1.8 4.9 4.5 0 3.4-1.5 5.8-3.8 5.8-1.2 0-2.1-1-1.8-2.2.4-1.5 1-3.1 1-4.1 0-1-.5-1.7-1.6-1.7-1.3 0-2.4 1.3-2.4 3.1 0 1.1.4 1.9.4 1.9l-1.4 6c-.3 1.3-.1 2.9 0 3.5 0 .2.3.2.4.1 0 0 1.8-2.3 2.3-4.3l.6-2.3c.4.7 1.4 1.3 2.5 1.3 3.4 0 5.8-3.1 5.8-7.1C19.7 5.8 16.7 3 12.2 3Z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14 8.5V6.9c0-.8.2-1.2 1.5-1.2H17V3h-2.7C11.5 3 10.5 4.4 10.5 7v1.5H8.8V12h1.7v9H14v-9h2.4l.4-3.5H14Z" />
    </svg>
  )
}

const socialIcons = {
  Instagram: InstagramIcon,
  Pinterest: PinterestIcon,
  Facebook: FacebookIcon,
}

export function Footer() {
  const { currentUser } = useStore()

  return (
    <footer id="visit" className="scroll-mt-24 bg-[#211916] text-paper">
      <div className="container-page pt-14 pb-10 sm:pt-20">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.35fr_0.65fr_1fr_1fr] lg:gap-10">
          <div>
            <Logo variant="light" />
            <p className="mt-5 max-w-xs text-sm leading-6 text-paper/60">
              A neighbourhood salon for considered hair, skin, and beauty rituals — made
              personal, never rushed.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {SALON.socials.map((social) => {
                const Icon = socialIcons[social.label as keyof typeof socialIcons]
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full border border-white/15 text-paper/70 transition hover:border-rose hover:bg-rose/10 hover:text-paper"
                  >
                    <Icon />
                  </a>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.18em] text-rose uppercase">
              Explore
            </p>
            <nav className="mt-5 flex flex-col gap-3 text-sm text-paper/65" aria-label="Footer navigation">
              <Link href="/" className="transition hover:text-paper">
                Home
              </Link>
              <Link href="/services" className="transition hover:text-paper">
                Browse services
              </Link>
              <Link href="/#story" className="transition hover:text-paper">
                Our story
              </Link>
              {currentUser ? (
                <Link href="/dashboard" className="transition hover:text-paper">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/signin" className="transition hover:text-paper">
                    Sign in
                  </Link>
                  <Link href="/signup" className="transition hover:text-paper">
                    Create account
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.18em] text-rose uppercase">
              Visit us
            </p>
            <ul className="mt-5 space-y-3.5 text-sm leading-6 text-paper/65">
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0 text-rose" />
                <span>{SALON.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${SALON.phone.replace(/[^+\d]/g, "")}`}
                  className="flex gap-2.5 transition hover:text-paper"
                >
                  <Phone className="mt-0.5 size-4 shrink-0 text-rose" />
                  {SALON.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SALON.email}`}
                  className="flex gap-2.5 transition hover:text-paper"
                >
                  <Mail className="mt-0.5 size-4 shrink-0 text-rose" />
                  {SALON.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-[0.65rem] font-bold tracking-[0.18em] text-rose uppercase">
              Opening hours
            </p>
            <ul className="mt-5 space-y-3 text-sm text-paper/65">
              {SALON.hours.map((entry) => (
                <li key={entry.days}>
                  <span className="block text-paper/85">{entry.days}</span>
                  <span className="inline-flex items-center gap-1.5 text-xs text-paper/50">
                    <Clock3 className="size-3" />
                    {entry.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-[0.6875rem] text-paper/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} SalonBook. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <span>Weddings & events</span>
            <span aria-hidden="true">·</span>
            <span>Gift cards</span>
            <span aria-hidden="true">·</span>
            <span>Privacy</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
