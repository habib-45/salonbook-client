# 💇 SalonBook – Salon Appointment Booking Platform

A responsive, modern, and editorial salon booking experience built with **Next.js 16, React 19, TypeScript, and Tailwind CSS v4**.

SalonBook allows guests to discover salon services, customers to request and manage appointments, and administrators to manage services, appointments, customers, and payments through a dedicated dashboard.

The client is connected to a separate **SalonBook API** built with Express.js, MongoDB, Better Auth, Stripe, and ImgBB.

---

## 🌐 Live Links

| Service | URL |
|---|---|
| Live Client | [SalonBook Client](https://salonbook-client-sandy.vercel.app/) |
| Live API | [SalonBook API](https://salonbook-api-mu.vercel.app/) |
| API Health | [API Health Check](https://salonbook-api-mu.vercel.app/api/health) |
| Local Client | http://localhost:3000 |
| Local API | http://localhost:5000 |

## 📂 GitHub Repositories

| Repository | URL |
|---|---|
| Client | [salonbook-client](https://github.com/habib-45/salonbook-client) |
| Server | [serside-9](https://github.com/habib-45/serside-9) |

## ✨ Features

### 🌍 Public Experience

- Modern editorial-style homepage.
- Featured salon services.
- Service search by name.
- Category-based service filtering.
- Sorting by price and duration.
- Customer registration and login.
- Google Sign-In integration.
- Light and Dark theme.
- Responsive navigation and mobile menu.
- Accessible UI controls and toast notifications.

### 👤 Customer Dashboard

- Personalized customer dashboard.
- Appointment statistics and upcoming visits.
- Book salon appointments.
- View appointment status.
- Filter appointments by status and payment.
- Cancel pending appointments.
- Secure Stripe Checkout.
- Payment confirmation and receipts.
- Customer profile management.
- Profile photo upload.
- Service availability and booking form.

### 🛠️ Admin Dashboard

- Admin dashboard with salon statistics.
- Create, edit, and delete services.
- Activate or pause services.
- Approve pending appointments.
- Cancel pending or confirmed appointments.
- Search and filter customers.
- Block and unblock customers.
- View payment transactions.
- Filter paid and failed transactions.
- Export transaction reports as CSV.
- Admin profile management.

### 🔐 Authentication & Security

- Better Auth JWT authentication.
- Email and password authentication.
- Google authentication.
- Role-based access control.
- Protected customer and admin routes.
- Server-side JWT verification.
- Blocked-user protection.
- Secure API communication.
- Stripe webhook signature verification.

### 💳 Payment System

- Stripe Checkout integration.
- Secure hosted payment page.
- Payment status verification.
- Automatic payment confirmation through Stripe webhooks.
- Transaction history and receipts.

---

## 🧰 Technology Stack

### Frontend

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Lucide React
- Google Identity Services

### Backend

- Node.js
- Express.js 5
- MongoDB
- Better Auth
- JWT Authentication

### Payment & Storage

- Stripe Checkout
- ImgBB Image Upload

### Deployment & Tools

- Vercel
- GitHub
- npm

---

## 📁 Project Structure

```text
salonbook-client/
│
├── app/
│   ├── (public)/
│   ├── (auth)/
│   ├── dashboard/
│   ├── services/
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── auth/
│   ├── dashboard/
│   ├── marketing/
│   ├── providers/
│   └── ui/
│
├── docs/
│
├── lib/
│   ├── api.ts
│   ├── google.ts
│   ├── selectors.ts
│   ├── types.ts
│   └── utils.ts
│
├── public/
├── .env.example
├── .gitignore
├── next.config.ts
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

- Node.js 20 or newer
- npm
- MongoDB (configured through the backend)
- SalonBook API

### 1. Clone the Repository

```bash
git clone https://github.com/habib-45/salonbook-client.git
```

### 2. Navigate to the Project

```bash
cd salonbook-client
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the project root.

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

`NEXT_PUBLIC_API_URL` must include the `/api` prefix.

### 5. Run Development Server

```bash
npm run dev
```

Open your browser:

http://localhost:3000

### 6. Build for Production

```bash
npm run build
```

---

## 🔑 Demo Accounts

The following demo accounts are provided by the backend seed data.

| Role | Name | Email | Password |
|---|---|---|---|
| Customer | Sofia Bennett | customer@salonbook.com | Customer123 |
| Admin | Amara Chen | admin@salonbook.com | Admin123 |
| Google Demo | Ava Thompson | ava.google@salonbook.com | Google Sign-In |
| Blocked Customer | Noah Williams | noah@example.com | Customer123 |

The demo environment also includes active and paused services, different appointment statuses, and paid and failed transactions.

---

## 📌 Application Routes

| Route | Access | Description |
|---|---|---|
| `/` | Public | Homepage |
| `/services` | Public | Browse salon services |
| `/services/[id]` | Signed In | Service details and booking |
| `/signin` | Public | User login |
| `/signup` | Public | Customer registration |
| `/dashboard` | Customer/Admin | Dashboard overview |
| `/dashboard/appointments` | Customer | Appointment management |
| `/dashboard/payments/[id]` | Customer | Stripe checkout |
| `/dashboard/payments/[id]/success` | Customer | Payment confirmation |
| `/dashboard/payments/[id]/cancel` | Customer | Checkout cancellation |
| `/dashboard/profile` | Customer/Admin | Profile settings |
| `/dashboard/admin` | Admin | Admin overview |
| `/dashboard/admin/services` | Admin | Service management |
| `/dashboard/admin/appointments` | Admin | Appointment management |
| `/dashboard/admin/users` | Admin | Customer management |
| `/dashboard/admin/transactions` | Admin | Transaction reports |

---

## 🔌 Backend API Integration

SalonBook Client communicates with a separate Express.js backend.

**Backend Repository:** [serside-9](https://github.com/habib-45/serside-9)

Backend responsibilities include:

- User registration and authentication.
- Google authentication.
- JWT verification.
- Salon service management.
- Appointment management.
- Customer management.
- Stripe payment processing.
- ImgBB image uploads.
- Transaction management.

---

## 🔐 How Authentication Works

1. The client sends login or registration requests to the API.
2. The Express backend delegates credential verification to Better Auth.
3. The API returns a JWT and safe user information.
4. The client stores the authentication token under `salonbook.token`.
5. The token is sent with protected API requests using the Bearer authorization header.
6. The backend verifies the JWT and checks user roles and blocked status.
7. Protected pages enforce customer and admin access.

Google Sign-In uses Google Identity Services and backend token verification.

---

## 💳 Payment Workflow

1. Customer books a salon appointment.
2. Admin confirms the appointment.
3. Customer selects **Pay Securely**.
4. Backend creates a Stripe Checkout Session.
5. Customer completes payment through Stripe.
6. Stripe sends a verified webhook to the backend.
7. Backend updates the payment and appointment status.
8. Customer can view the payment receipt.

Card details are handled by Stripe, not stored in the client application.

---

## 🌙 Theme Support

SalonBook supports three theme preferences:

- Light Mode
- Dark Mode
- System Theme

The selected theme is stored locally, and an early theme initialization script helps prevent incorrect theme flashing on page load.

---

## 🧪 Quality Checks

Run the following commands before deployment:

```bash
npm run typecheck
npm run lint
npm run build
```

---

## 🚀 Deployment

The frontend is deployed using Vercel.

### Frontend Deployment

1. Push the client project to GitHub.
2. Import the repository into Vercel.
3. Configure the required environment variables.
4. Set the production API URL.
5. Deploy the application.

Production environment:

```env
NEXT_PUBLIC_API_URL=https://salonbook-api-mu.vercel.app/api
NEXT_PUBLIC_APP_URL=https://salonbook-client-sandy.vercel.app
```

### Backend Deployment

The backend is maintained separately in the `serside-9` repository.

Configure MongoDB, Better Auth, Stripe, ImgBB, Google authentication, and client origin variables in the backend deployment.

---

## 🔒 Security Notes

- Never expose backend secrets in frontend environment variables.
- Never commit `.env` files.
- Keep sensitive credentials on the backend.
- Verify authentication tokens on the server.
- Enforce role-based authorization on protected endpoints.
- Verify Stripe webhook signatures before updating payment records.
- Change demo passwords before real-world production use.

---

## 👨‍💻 Author

**Habib**

- GitHub: [habib-45](https://github.com/habib-45)
- Project: SalonBook – Salon Appointment Booking Platform

---

⭐ If you find this project interesting, consider giving the repository a star!

**Built with ❤️ by Habib**