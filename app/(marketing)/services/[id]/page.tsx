import type { Metadata } from "next"
import { ServiceDetail } from "@/components/marketing/service-detail"
import { API_URL } from "@/lib/api"
import type { Service } from "@/lib/types"

type ServiceDetailPageProps = {
  params: Promise<{ id: string }>
}

async function getService(id: string): Promise<Service | null> {
  try {
    const response = await fetch(`${API_URL}/services/${encodeURIComponent(id)}`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(4000),
    })
    if (!response.ok) return null
    const data = (await response.json()) as { service?: Service }
    return data.service ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const service = await getService(id)

  if (!service) {
    return {
      title: "Salon service",
      description:
        "Explore considered hair, skin, and beauty rituals on the SalonBook menu.",
    }
  }

  return {
    title: service.serviceName,
    description: `${service.description} Book ${service.serviceName} at SalonBook — ${service.duration} minutes, from $${service.price}.`,
    openGraph: {
      title: `${service.serviceName} · SalonBook`,
      description: service.description,
      images: [{ url: service.image }],
    },
  }
}

export default function ServiceDetailPage() {
  return <ServiceDetail />
}
