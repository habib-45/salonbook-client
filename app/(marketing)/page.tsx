import type { Metadata } from "next"
import { HomePage } from "@/components/marketing/home-page"

export const metadata: Metadata = {
  title: "SalonBook — Thoughtful beauty, beautifully booked",
  description:
    "Browse considered hair, skin, makeup, nail, and spa rituals at SalonBook. Request an appointment online and make time for yourself.",
}

export default function Page() {
  return <HomePage />
}
