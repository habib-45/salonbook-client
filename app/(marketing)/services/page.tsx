import type { Metadata } from "next"
import { ServicesBrowser } from "@/components/marketing/services-browser"

export const metadata: Metadata = {
  title: "Browse services",
  description:
    "Explore SalonBook's full menu of hair, skin, makeup, nail, and spa services. Search, filter by category, and sort by price.",
}

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>
}) {
  const params = await searchParams
  const category = Array.isArray(params.category) ? params.category[0] : params.category

  return (
    <ServicesBrowser
      key={category ?? "all"}
      initialCategory={category ?? ""}
    />
  )
}
