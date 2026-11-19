export const SERVICE_CATEGORIES = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
] as const

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number]

export const CATEGORY_DETAILS = [
  {
    name: "Haircut & Styling",
    description: "Precision cuts, soft layers, and everyday polish.",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Hair Coloring",
    description: "Sun-washed balayage and rich, dimensional color.",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Hair Treatment",
    description: "Restorative rituals for stronger, silkier hair.",
    image:
      "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Facial & Skincare",
    description: "Glow-boosting facials tailored to your skin.",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Makeup",
    description: "Soft glam, bridal, and occasion-ready artistry.",
    image:
      "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Manicure & Pedicure",
    description: "Considered nail care in the season's best shades.",
    image:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
  },
  {
    name: "Spa & Massage",
    description: "Slow, restorative bodywork to release the week.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
  },
] as const

export const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
] as const

export const SALON = {
  name: "SalonBook",
  tagline: "Thoughtful beauty, beautifully booked.",
  email: "hello@salonbook.com",
  phone: "+1 (718) 555-0184",
  address: "24 Willow Lane, Brooklyn, NY 11201",
  hours: [
    { days: "Monday – Friday", time: "9:00 AM – 8:00 PM" },
    { days: "Saturday", time: "9:00 AM – 7:00 PM" },
    { days: "Sunday", time: "10:00 AM – 5:00 PM" },
  ],
  socials: [
    { label: "Instagram", href: "https://instagram.com" },
    { label: "Pinterest", href: "https://pinterest.com" },
    { label: "Facebook", href: "https://facebook.com" },
  ],
} as const

export const DEMO_ACCOUNTS = {
  customer: {
    label: "Demo customer",
    name: "Sofia Bennett",
    email: "customer@salonbook.com",
    password: "Customer123",
  },
  admin: {
    label: "Demo admin",
    name: "Amara Chen",
    email: "admin@salonbook.com",
    password: "Admin123",
  },
} as const

export const CURRENCY = "USD"
