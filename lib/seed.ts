import type { Database } from "@/lib/types"
import { addDays, toDateInputValue } from "@/lib/utils"

const images = {
  hairCut:
    "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&q=80",
  hairColor:
    "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1200&q=80",
  hairTreatment:
    "https://images.unsplash.com/photo-1552693673-1bf958298935?auto=format&fit=crop&w=1200&q=80",
  facial:
    "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=80",
  makeup:
    "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=1200&q=80",
  nails:
    "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&q=80",
  massage:
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
  bridal:
    "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?auto=format&fit=crop&w=1200&q=80",
  scalp:
    "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&q=80",
  avatarAdmin:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  avatarSofia:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80",
  avatarMaya:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  avatarElena:
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=400&q=80",
  avatarNoah:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
}

function isoDaysAgo(days: number) {
  const date = new Date()
  date.setHours(10, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

export const seedDatabase = (): Database => {
  const createdAt = isoDaysAgo(120)

  return {
    users: [
      {
        id: "admin_1",
        name: "Amara Chen",
        email: "admin@salonbook.com",
        password: "Admin123",
        image: images.avatarAdmin,
        role: "admin",
        isBlocked: false,
        phone: "+1 (718) 555-0142",
        provider: "credentials",
        createdAt,
      },
      {
        id: "customer_1",
        name: "Sofia Bennett",
        email: "customer@salonbook.com",
        password: "Customer123",
        image: images.avatarSofia,
        role: "customer",
        isBlocked: false,
        phone: "+1 (347) 555-0198",
        provider: "credentials",
        createdAt: isoDaysAgo(84),
      },
      {
        id: "customer_2",
        name: "Maya Patel",
        email: "maya@example.com",
        password: "Customer123",
        image: images.avatarMaya,
        role: "customer",
        isBlocked: false,
        phone: "+1 (646) 555-0131",
        provider: "credentials",
        createdAt: isoDaysAgo(56),
      },
      {
        id: "customer_3",
        name: "Elena Rodriguez",
        email: "elena@example.com",
        password: "Customer123",
        image: images.avatarElena,
        role: "customer",
        isBlocked: false,
        phone: "+1 (917) 555-0127",
        provider: "credentials",
        createdAt: isoDaysAgo(38),
      },
      {
        id: "customer_4",
        name: "Noah Williams",
        email: "noah@example.com",
        password: "Customer123",
        image: images.avatarNoah,
        role: "customer",
        isBlocked: true,
        phone: "+1 (929) 555-0164",
        provider: "credentials",
        createdAt: isoDaysAgo(21),
      },
    ],
    services: [
      {
        id: "service_1",
        serviceName: "Signature Cut & Style",
        category: "Haircut & Styling",
        description:
          "A considered consultation, precision cut, and soft finish tailored to the way you wear your hair every day.",
        price: 65,
        duration: 60,
        image: images.hairCut,
        status: "active",
        createdAt: isoDaysAgo(90),
      },
      {
        id: "service_2",
        serviceName: "Luminous Balayage",
        category: "Hair Coloring",
        description:
          "Hand-painted dimension and a glossy toner for color that grows out beautifully and catches the light.",
        price: 180,
        duration: 150,
        image: images.hairColor,
        status: "active",
        createdAt: isoDaysAgo(88),
      },
      {
        id: "service_3",
        serviceName: "Silk Repair Ritual",
        category: "Hair Treatment",
        description:
          "A deeply nourishing bond-building treatment that restores softness, shine, and strength in one visit.",
        price: 140,
        duration: 120,
        image: images.hairTreatment,
        status: "active",
        createdAt: isoDaysAgo(75),
      },
      {
        id: "service_4",
        serviceName: "Glass Skin Facial",
        category: "Facial & Skincare",
        description:
          "A gentle resurfacing facial with hydrating massage and a cooling finish for your calmest, dewiest skin.",
        price: 95,
        duration: 75,
        image: images.facial,
        status: "active",
        createdAt: isoDaysAgo(67),
      },
      {
        id: "service_5",
        serviceName: "Soft Glam Session",
        category: "Makeup",
        description:
          "Skin-first makeup with a luminous finish, tailored for dinners, celebrations, or a night that deserves it.",
        price: 120,
        duration: 90,
        image: images.makeup,
        status: "active",
        createdAt: isoDaysAgo(54),
      },
      {
        id: "service_6",
        serviceName: "Milk & Rose Manicure",
        category: "Manicure & Pedicure",
        description:
          "A restoring hand ritual with cuticle care, a warm milk-and-rose soak, and your choice of seasonal color.",
        price: 55,
        duration: 60,
        image: images.nails,
        status: "active",
        createdAt: isoDaysAgo(49),
      },
      {
        id: "service_7",
        serviceName: "Aromatherapy Massage",
        category: "Spa & Massage",
        description:
          "Slow, intentional full-body massage with warm oils and breathwork to soften tension and settle the mind.",
        price: 110,
        duration: 90,
        image: images.massage,
        status: "active",
        createdAt: isoDaysAgo(43),
      },
      {
        id: "service_8",
        serviceName: "Bridal Beauty Atelier",
        category: "Makeup",
        description:
          "A complete bridal hair and makeup experience with a private consultation, trial notes, and wedding-day artistry.",
        price: 250,
        duration: 180,
        image: images.bridal,
        status: "active",
        createdAt: isoDaysAgo(35),
      },
      {
        id: "service_9",
        serviceName: "Scalp Detox Ritual",
        category: "Hair Treatment",
        description:
          "A clarifying scalp treatment with a soothing massage and lightweight hydration for a fresh, balanced finish.",
        price: 85,
        duration: 45,
        image: images.scalp,
        status: "inactive",
        createdAt: isoDaysAgo(30),
      },
    ],
    appointments: [
      {
        id: "appointment_1",
        serviceId: "service_1",
        customerId: "customer_1",
        appointmentDate: toDateInputValue(addDays(4)),
        timeSlot: "10:00 AM",
        message: "I would love a little extra time on styling tips for fine hair.",
        servicePrice: 65,
        paymentStatus: "unpaid",
        status: "confirmed",
        createdAt: isoDaysAgo(3),
      },
      {
        id: "appointment_2",
        serviceId: "service_3",
        customerId: "customer_1",
        appointmentDate: toDateInputValue(addDays(7)),
        timeSlot: "01:00 PM",
        message: "My ends have been feeling quite dry lately.",
        servicePrice: 140,
        paymentStatus: "unpaid",
        status: "pending",
        createdAt: isoDaysAgo(1),
      },
      {
        id: "appointment_3",
        serviceId: "service_7",
        customerId: "customer_1",
        appointmentDate: toDateInputValue(addDays(2)),
        timeSlot: "03:00 PM",
        message: "",
        servicePrice: 110,
        paymentStatus: "paid",
        status: "confirmed",
        createdAt: isoDaysAgo(8),
      },
      {
        id: "appointment_4",
        serviceId: "service_6",
        customerId: "customer_1",
        appointmentDate: toDateInputValue(addDays(-3)),
        timeSlot: "11:00 AM",
        message: "",
        servicePrice: 55,
        paymentStatus: "unpaid",
        status: "cancelled",
        createdAt: isoDaysAgo(12),
      },
      {
        id: "appointment_5",
        serviceId: "service_4",
        customerId: "customer_2",
        appointmentDate: toDateInputValue(addDays(5)),
        timeSlot: "02:00 PM",
        message: "I have sensitive skin and would prefer fragrance-free products.",
        servicePrice: 95,
        paymentStatus: "unpaid",
        status: "pending",
        createdAt: isoDaysAgo(2),
      },
      {
        id: "appointment_6",
        serviceId: "service_2",
        customerId: "customer_3",
        appointmentDate: toDateInputValue(addDays(1)),
        timeSlot: "10:00 AM",
        message: "Looking for a soft, natural balayage.",
        servicePrice: 180,
        paymentStatus: "paid",
        status: "confirmed",
        createdAt: isoDaysAgo(14),
      },
      {
        id: "appointment_7",
        serviceId: "service_5",
        customerId: "customer_4",
        appointmentDate: toDateInputValue(addDays(9)),
        timeSlot: "04:00 PM",
        message: "A soft glam look for an evening event.",
        servicePrice: 120,
        paymentStatus: "unpaid",
        status: "pending",
        createdAt: isoDaysAgo(1),
      },
      {
        id: "appointment_8",
        serviceId: "service_7",
        customerId: "customer_2",
        appointmentDate: toDateInputValue(addDays(6)),
        timeSlot: "05:00 PM",
        message: "",
        servicePrice: 110,
        paymentStatus: "unpaid",
        status: "cancelled",
        createdAt: isoDaysAgo(6),
      },
    ],
    transactions: [
      {
        id: "transaction_1",
        appointmentId: "appointment_3",
        customerId: "customer_1",
        amount: 110,
        currency: "USD",
        stripeSessionId: "cs_test_demo_8f2kb91a",
        status: "paid",
        createdAt: isoDaysAgo(2),
      },
      {
        id: "transaction_2",
        appointmentId: "appointment_6",
        customerId: "customer_3",
        amount: 180,
        currency: "USD",
        stripeSessionId: "cs_test_demo_4c7mn52p",
        status: "paid",
        createdAt: isoDaysAgo(5),
      },
      {
        id: "transaction_3",
        appointmentId: "appointment_8",
        customerId: "customer_2",
        amount: 110,
        currency: "USD",
        stripeSessionId: "cs_test_demo_0k9wa13r",
        status: "failed",
        createdAt: isoDaysAgo(4),
      },
    ],
  }
}
