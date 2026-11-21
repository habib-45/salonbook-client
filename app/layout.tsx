import type { Metadata } from "next"
import { Cormorant_Garamond, Manrope } from "next/font/google"
import { AppProviders } from "@/components/providers/app-providers"
import "./globals.css"

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  ),
  title: {
    default: "SalonBook — Thoughtful beauty, beautifully booked",
    template: "%s · SalonBook",
  },
  description:
    "Discover considered hair, skin, and beauty rituals at SalonBook in Brooklyn. Browse services, request an appointment, and make time for yourself.",
  keywords: [
    "salon booking",
    "hair salon Brooklyn",
    "facial",
    "makeup",
    "manicure",
    "spa",
    "appointment booking",
  ],
  openGraph: {
    title: "SalonBook — Thoughtful beauty, beautifully booked",
    description:
      "A neighbourhood salon for considered hair, skin, and beauty rituals. Browse the menu and reserve your moment.",
    type: "website",
    siteName: "SalonBook",
  },
}

const themeScript = `(function(){try{var key="salonbook-theme";var stored=localStorage.getItem(key);var theme=stored==="light"||stored==="dark"||stored==="system"?stored:"system";var dark=theme==="dark"||(theme==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var root=document.documentElement;root.classList.toggle("dark",dark);root.style.colorScheme=dark?"dark":"light";}catch(error){}})();`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}
