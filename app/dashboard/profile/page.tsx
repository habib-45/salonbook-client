import type { Metadata } from "next"
import { ProfileView } from "@/components/dashboard/profile-view"

export const metadata: Metadata = {
  title: "My profile",
  description: "Update your SalonBook profile, contact details, and account photo.",
}

export default function ProfilePage() {
  return <ProfileView />
}
