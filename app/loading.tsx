import { PageLoader } from "@/components/ui/feedback"

export default function Loading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-cream">
      <PageLoader label="Preparing something lovely…" />
    </div>
  )
}
