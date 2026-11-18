"use client"

import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Clock3,
  Heart,
  Leaf,
  Quote,
  Scissors,
  Sparkles,
  Star,
} from "lucide-react"
import { useStore } from "@/components/providers/store-provider"
import { ButtonLink } from "@/components/ui/button"
import { ServiceGridSkeleton } from "@/components/ui/feedback"
import { SectionHeading } from "@/components/ui/section-heading"
import { ServiceCard } from "@/components/marketing/service-card"
import { CATEGORY_DETAILS } from "@/lib/constants"

const heroImage =
  "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1400&q=85"
const storyImage =
  "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1100&q=80"
const storyDetail =
  "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=800&q=80"
const ctaImage =
  "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80"

const clients = [
  {
    name: "Sofia B.",
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Maya P.",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
  },
  {
    name: "Elena R.",
    image:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=100&q=80",
  },
]

const testimonials = [
  {
    quote:
      "The most thoughtful haircut I've had in years. Amara listened, made a few suggestions, and somehow gave me the exact thing I couldn't describe.",
    name: "Sofia Bennett",
    detail: "Signature Cut & Style",
    image: clients[0].image,
    initials: "SB",
  },
  {
    quote:
      "My skin looked lit from within for a full week after the Glass Skin Facial. The space is calm, warm, and nothing ever feels rushed.",
    name: "Maya Patel",
    detail: "Glass Skin Facial",
    image: clients[1].image,
    initials: "MP",
  },
  {
    quote:
      "From the booking to the final blow-dry, everything felt considered. It's the one appointment I never let myself move.",
    name: "Elena Rodriguez",
    detail: "Luminous Balayage",
    image: clients[2].image,
    initials: "ER",
  },
]

const steps = [
  {
    number: "01",
    icon: Scissors,
    title: "Choose your ritual",
    description:
      "Browse our menu of hair, skin, makeup, nail, and spa services. Every detail is there to help you choose.",
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Pick your moment",
    description:
      "Choose a date and a time that feels good. Send your request and we'll take care of the rest.",
  },
  {
    number: "03",
    icon: Sparkles,
    title: "Arrive & unwind",
    description:
      "Come as you are. We'll welcome you with something warm and give you our full attention.",
  },
]

export function HomePage() {
  const { db, isHydrated } = useStore()
  const activeServices = db?.services.filter((service) => service.status === "active") ?? []
  const featured = activeServices.slice(0, 6)

  return (
    <>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute -top-28 -left-32 size-[420px] rounded-full bg-rose-light/60 blur-[100px]" />
        <div className="pointer-events-none absolute right-[-14rem] bottom-[-18rem] size-[520px] rounded-full bg-gold-light/70 blur-[130px]" />

        <div className="container-page relative grid items-center gap-12 py-12 sm:py-16 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16 lg:py-20 xl:gap-24">
          <div className="animate-fade-up max-w-[640px]">
            <div className="inline-flex items-center gap-3 rounded-full border border-sand/90 bg-white/55 py-1.5 pr-4 pl-2 backdrop-blur">
              <span className="flex -space-x-2">
                {clients.map((client) => (
                  <Image
                    key={client.name}
                    src={client.image}
                    alt=""
                    width={28}
                    height={28}
                    className="size-7 rounded-full border-2 border-cream object-cover"
                  />
                ))}
              </span>
              <span className="flex items-center gap-1 text-[0.6875rem] font-semibold text-ink-soft">
                <Star className="size-3 fill-gold text-gold" />
                4.9 · loved by 1,200+ guests
              </span>
            </div>

            <h1 className="mt-7 font-serif text-[3.6rem] leading-[0.91] tracking-[-0.045em] text-ink sm:text-[4.8rem] lg:text-[5.45rem] xl:text-[6rem]">
              Where beauty
              <br className="hidden sm:block" /> feels like a{" "}
              <span className="relative inline-block italic text-burgundy">
                ritual.
                <svg
                  viewBox="0 0 230 12"
                  fill="none"
                  className="absolute -bottom-1 left-0 w-full text-rose"
                  aria-hidden="true"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8.5C53 3.5 133 2 228 6"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-7 max-w-lg text-[0.9375rem] leading-7 text-ink-soft sm:text-base">
              Thoughtful hair, skin, and beauty rituals in the heart of Brooklyn. Come for
              the appointment — stay for the feeling of taking care of yourself.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/services" size="lg" className="group">
                Explore salon services
                <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </ButtonLink>
              <ButtonLink href="/#story" size="lg" variant="outline">
                Our philosophy
              </ButtonLink>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.6875rem] font-semibold text-ink-soft">
              <span className="inline-flex items-center gap-1.5">
                <Scissors className="size-3.5 text-burgundy" />
                Expert artistry
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Leaf className="size-3.5 text-sage" />
                Considered products
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Heart className="size-3.5 text-rose" />
                Unhurried care
              </span>
            </div>
          </div>

          <div className="animate-fade-up delay-150 relative mx-auto w-full max-w-[510px] lg:mr-2">
            <div
              className="absolute -top-5 -right-3 size-28 rounded-full border border-gold/30 sm:-right-7 sm:size-36"
              aria-hidden="true"
            />
            <div className="relative aspect-[4/4.8] overflow-hidden rounded-t-[13rem] rounded-b-[1.6rem] border border-white/70 bg-cream-deep shadow-[0_35px_80px_-38px_rgba(51,32,23,0.45)] sm:rounded-t-[16rem]">
              <Image
                src={heroImage}
                alt="The warm, light-filled interior of SalonBook"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/45 via-transparent to-transparent" />

              <div className="absolute top-5 left-5 rounded-full border border-white/40 bg-cream/85 px-3.5 py-1.5 text-[0.625rem] font-bold tracking-[0.13em] text-burgundy uppercase backdrop-blur">
                Brooklyn, NY
              </div>

              <div className="absolute right-4 bottom-4 left-4 rounded-2xl border border-white/30 bg-cream/92 p-4 backdrop-blur-md sm:right-5 sm:bottom-5 sm:left-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[0.625rem] font-bold tracking-[0.13em] text-gold uppercase">
                      Next opening
                    </p>
                    <p className="mt-1 font-serif text-[1.45rem] leading-none tracking-[-0.02em]">
                      Today, 2:30 PM
                    </p>
                  </div>
                  <Link
                    href="/services"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-burgundy text-cream transition hover:bg-burgundy-dark"
                    aria-label="Browse services"
                  >
                    <ArrowUpRight className="size-4" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="animate-soft-float absolute -top-3 -left-3 flex size-[5.5rem] flex-col items-center justify-center rounded-full border border-white/60 bg-burgundy text-center text-cream shadow-lg sm:-left-7 sm:size-24">
              <Sparkles className="size-3.5 text-rose" />
              <span className="mt-1 font-serif text-[1.55rem] leading-none">12+</span>
              <span className="mt-1 text-[0.5rem] font-bold tracking-[0.1em] uppercase opacity-75">
                Artists
              </span>
            </div>

            <div className="absolute -right-2 bottom-36 hidden w-[10rem] rounded-2xl border border-sand/80 bg-white/85 p-3.5 shadow-lg backdrop-blur sm:block">
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="size-2.5 fill-current" />
                ))}
              </div>
              <p className="mt-2 text-[0.6875rem] leading-4 text-ink-soft">
                “The calmest, most considered salon in Brooklyn.”
              </p>
            </div>
          </div>
        </div>

        <div className="container-page relative pb-12 lg:pb-16">
          <div className="grid grid-cols-2 gap-y-7 border-y border-sand/90 py-7 sm:grid-cols-4 sm:gap-0">
            {[
              { value: "1,200+", label: "Guests welcomed" },
              { value: "12", label: "Expert artists" },
              { value: "4.9 / 5", label: "Average rating" },
              { value: "Since 2018", label: "In Brooklyn" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={
                  index > 0
                    ? "sm:border-l sm:border-sand/90 sm:pl-8"
                    : undefined
                }
              >
                <p className="font-serif text-[1.9rem] leading-none tracking-[-0.03em] text-ink sm:text-[2.2rem]">
                  {stat.value}
                </p>
                <p className="mt-1.5 text-[0.625rem] font-bold tracking-[0.12em] text-ink-soft uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-sand/40 py-20 sm:py-24 lg:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="The salon menu"
            title={
              <>
                Rituals our guests
                <br className="hidden sm:block" /> keep <span className="italic text-burgundy">coming back to.</span>
              </>
            }
            description="Every service begins with a conversation and ends with you feeling more like yourself. Explore a few of our most-loved rituals."
            action={
              <ButtonLink href="/services" variant="outline">
                View all services
                <ArrowRight className="size-4" />
              </ButtonLink>
            }
          />

          <div className="mt-11">
            {!isHydrated ? (
              <ServiceGridSkeleton />
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((service, index) => (
                  <ServiceCard key={service.id} service={service} priority={index < 3} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-[#f3e9df] py-20 sm:py-24 lg:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="Find your moment"
            title={
              <>
                A ritual for every
                <br className="hidden sm:block" /> version of <span className="italic text-burgundy">you.</span>
              </>
            }
            description="From a quick polish to a full afternoon of care, explore the salon by category."
            action={
              <ButtonLink href="/services" variant="outline">
                Browse the full menu
                <ArrowUpRight className="size-4" />
              </ButtonLink>
            }
          />

          <div className="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_DETAILS.map((category, index) => {
              const count = activeServices.filter(
                (service) => service.category === category.name
              ).length

              return (
                <Link
                  key={category.name}
                  href={`/services?category=${encodeURIComponent(category.name)}`}
                  className="group relative isolate flex min-h-[18rem] overflow-hidden rounded-2xl border border-white/50 bg-cream-deep focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-4 focus-visible:ring-offset-[#f3e9df] focus-visible:outline-none sm:min-h-[19rem]"
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
                  <span className="absolute top-4 right-4 font-serif text-2xl text-white/45">
                    0{index + 1}
                  </span>
                  <div className="relative z-10 mt-auto p-5">
                    <p className="text-[0.625rem] font-bold tracking-[0.12em] text-rose uppercase">
                      {count > 0 ? `${count} ${count === 1 ? "ritual" : "rituals"}` : "Explore"}
                    </p>
                    <h3 className="mt-2 font-serif text-[1.7rem] leading-[1.02] tracking-[-0.025em] text-cream">
                      {category.name}
                    </h3>
                    <p className="mt-2 text-[0.6875rem] leading-5 text-cream/65">
                      {category.description}
                    </p>
                    <span className="mt-4 flex size-8 items-center justify-center rounded-full border border-white/30 text-cream transition group-hover:bg-cream group-hover:text-burgundy">
                      <ArrowUpRight className="size-3.5" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section id="story" className="scroll-mt-28 py-20 sm:py-24 lg:py-32">
        <div className="container-page grid items-center gap-14 lg:grid-cols-[0.95fr_1.05fr] lg:gap-20">
          <div className="relative mx-auto w-full max-w-[540px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-[10rem] rounded-b-[1.5rem]">
              <Image
                src={storyImage}
                alt="A stylist finishing a guest's hair at SalonBook"
                fill
                sizes="(max-width: 1024px) 90vw, 44vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-2 -bottom-10 w-[44%] overflow-hidden rounded-2xl border-[5px] border-cream bg-cream shadow-xl sm:-right-8 sm:w-[42%]">
              <div className="relative aspect-[4/5]">
                <Image
                  src={storyDetail}
                  alt="A guest having her makeup finished"
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="absolute top-8 -left-3 rounded-full border border-sand bg-cream/95 px-4 py-2 text-[0.625rem] font-bold tracking-[0.14em] text-burgundy uppercase shadow-sm sm:-left-6">
              Est. 2018 · Brooklyn
            </div>
            <div className="absolute -right-2 top-1/3 hidden size-24 flex-col items-center justify-center rounded-full bg-burgundy text-center text-cream shadow-lg sm:flex lg:-right-8">
              <Heart className="size-4 text-rose" />
              <span className="mt-1 text-[0.55rem] font-bold tracking-[0.1em] uppercase opacity-80">
                Care first
              </span>
            </div>
          </div>

          <div className="max-w-xl">
            <p className="eyebrow mb-4">Our philosophy</p>
            <h2 className="font-serif text-[2.5rem] leading-[1.04] tracking-[-0.04em] sm:text-[3.2rem] lg:text-[3.5rem]">
              More than an appointment.
              <br /> A pause that is{" "}
              <span className="italic text-burgundy">entirely yours.</span>
            </h2>
            <p className="mt-6 text-[0.9375rem] leading-7 text-ink-soft">
              SalonBook began with a simple idea: beauty should feel personal, not
              performative. We built a space where you can exhale, where every detail is
              considered, and where the person in the chair is always the priority.
            </p>

            <div className="mt-9 space-y-6">
              {[
                {
                  icon: Scissors,
                  title: "Artistry with intention",
                  text: "Our artists train continuously and listen closely. We want the result to feel like you — only more rested.",
                },
                {
                  icon: Leaf,
                  title: "Products we believe in",
                  text: "Thoughtfully selected, skin-kind formulas that make your hair and skin feel as good as they look.",
                },
                {
                  icon: Clock3,
                  title: "Time, unhurried",
                  text: "No double bookings, no rushing out the door. Your appointment is yours from start to finish.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-cream-deep text-burgundy">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold tracking-[-0.01em]">{item.title}</h3>
                    <p className="mt-1 text-[0.8125rem] leading-6 text-ink-soft">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <ButtonLink href="/services" size="md">
                Find your ritual
                <ArrowUpRight className="size-4" />
              </ButtonLink>
              <Link
                href="/#visit"
                className="inline-flex items-center gap-2 px-1 text-sm font-semibold text-ink-soft transition hover:text-burgundy"
              >
                Visit the salon
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-burgundy-dark py-20 text-cream sm:py-24 lg:py-28">
        <div className="container-page">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <p className="text-[0.6875rem] font-bold tracking-[0.18em] text-rose uppercase">
                How it works
              </p>
              <h2 className="mt-4 font-serif text-[2.5rem] leading-[1.04] tracking-[-0.04em] sm:text-[3.1rem]">
                Three small steps.
                <br />
                One lovely <span className="italic text-rose">pause.</span>
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-cream/55">
              Booking with us is simple. The hardest part is deciding which ritual to choose.
            </p>
          </div>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="group relative bg-burgundy-dark p-7 sm:p-9">
                <div className="flex items-start justify-between gap-4">
                  <span className="flex size-11 items-center justify-center rounded-full border border-white/15 text-rose">
                    <step.icon className="size-5" />
                  </span>
                  <span className="font-serif text-3xl italic text-white/20">
                    {step.number}
                  </span>
                </div>
                <h3 className="mt-10 font-serif text-[1.8rem] leading-none tracking-[-0.025em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.8125rem] leading-6 text-cream/55">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 lg:py-28">
        <div className="container-page">
          <SectionHeading
            eyebrow="Kind words"
            title={
              <>
                Notes from our
                <br className="hidden sm:block" /> <span className="italic text-burgundy">chairs.</span>
              </>
            }
            description="A few words from guests who have made SalonBook part of their rhythm."
            align="center"
          />

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <figure
                key={testimonial.name}
                className={`relative flex flex-col rounded-2xl border border-sand/80 p-6 sm:p-7 ${
                  index === 1 ? "bg-burgundy text-cream" : "bg-white/55 text-ink"
                }`}
              >
                <Quote
                  className={`size-7 ${index === 1 ? "text-rose" : "text-sand-dark"}`}
                  aria-hidden="true"
                />
                <blockquote
                  className={`mt-5 flex-1 font-serif text-[1.45rem] leading-[1.3] tracking-[-0.02em] ${
                    index === 1 ? "text-cream" : "text-ink"
                  }`}
                >
                  “{testimonial.quote}”
                </blockquote>
                <figcaption className="mt-7 flex items-center gap-3">
                  <Image
                    src={testimonial.image}
                    alt=""
                    width={40}
                    height={40}
                    className="size-10 rounded-full object-cover"
                  />
                  <div>
                    <p className={`text-xs font-bold ${index === 1 ? "text-cream" : "text-ink"}`}>
                      {testimonial.name}
                    </p>
                    <p
                      className={`mt-0.5 text-[0.625rem] tracking-[0.03em] ${
                        index === 1 ? "text-cream/55" : "text-ink-soft"
                      }`}
                    >
                      {testimonial.detail}
                    </p>
                  </div>
                  <div className="ml-auto flex gap-0.5 text-gold">
                    {Array.from({ length: 5 }).map((_, starIndex) => (
                      <Star key={starIndex} className="size-2.5 fill-current" />
                    ))}
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>

          <div className="mt-7 flex items-center justify-center gap-2 text-xs text-ink-soft">
            <span className="flex gap-0.5 text-gold">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="size-3 fill-current" />
              ))}
            </span>
            <span className="font-semibold text-ink">4.9</span>
            <span>from 380+ verified guests</span>
          </div>
        </div>
      </section>

      <section className="pb-20 sm:pb-24 lg:pb-28">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-ink text-cream sm:rounded-[2rem]">
            <Image
              src={ctaImage}
              alt=""
              fill
              sizes="100vw"
              className="object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#2a1b20]/95 via-[#3a2027]/80 to-[#2a1b20]/40" />
            <div className="relative z-10 flex flex-col items-start gap-8 px-6 py-12 sm:px-10 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-20">
              <div className="max-w-xl">
                <p className="text-[0.6875rem] font-bold tracking-[0.18em] text-rose uppercase">
                  Make time for yourself
                </p>
                <h2 className="mt-4 font-serif text-[2.8rem] leading-[1] tracking-[-0.04em] sm:text-[3.6rem] lg:text-[4rem]">
                  Your chair is <span className="italic text-rose">waiting.</span>
                </h2>
                <p className="mt-4 max-w-md text-sm leading-6 text-cream/60">
                  Browse the menu, choose a moment, and let us take care of the rest.
                  We can&apos;t wait to meet you.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row">
                <ButtonLink href="/services" variant="light" size="lg">
                  Book an appointment
                  <ArrowUpRight className="size-4" />
                </ButtonLink>
                <ButtonLink
                  href="/signup"
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-cream hover:border-white/60 hover:bg-white/10 hover:text-cream"
                >
                  Create an account
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
