import type { Metadata } from "next"
import { ServiceDetail } from "@/components/marketing/service-detail"
import { seedDatabase } from "@/lib/seed"

type ServiceDetailPageProps = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: ServiceDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const service = seedDatabase().services.find((item) => item.id === id)

  if (!service) {
    return {
      title: "Service not found",
      description:
        "This salon service may have been moved or is no longer part of the SalonBook menu.",
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
