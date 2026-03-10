# 🕌 HabiTrack AI

**AI-Assisted Spiritual Mentorship Management System**

A production-ready, SaaS-style platform for managing spiritual mentorship relationships with AI-powered guidance, daily progress tracking, and comprehensive analytics.

---

## ✨ Features

- **Role-Based System** – Admin, Murabbi (Mentor), Salik (Student) with RBAC
- **Daily Report Tracking** – Dynamic task templates with completion tracking
- **Performance Analytics** – Charts, streaks, 40-day rolling averages, performance rings
- **AI Spiritual Guide** – GROQ-powered chatbot for guidance and habit advice
- **40-Day (Chilla) Summaries** – AI-generated summary reports editable by Murabbi
- **Notification Engine** – Deadline reminders, missed report alerts, motivational messages
- **Premium UI** – Islamic-inspired design, Framer Motion animations, glassmorphism effects

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + ShadCN UI |
| Icons | Lucide Icons |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| AI | GROQ LLM API (Llama 3.3) |
| Charts | Recharts |
| Validation | Zod |
| Testing | Vitest |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase project ([supabase.com](https://supabase.com))
- GROQ API key ([console.groq.com](https://console.groq.com))

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GROQ_API_KEY=your-groq-api-key
```

### 3. Database Setup

Run the SQL schema in your Supabase SQL Editor:

```
supabase/schema.sql
```

This creates all tables, indexes, RLS policies, and triggers.

### 4. Create Admin User

In your Supabase dashboard:
1. Go to **Authentication → Users → Add User**
2. Create the admin user with email/password
3. Go to **Table Editor → profiles**
4. Update the user's `role` to `admin`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Run Tests

```bash
npx vitest run
```

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── admin/          # Admin pages (6)
│   │   ├── murabbi/        # Murabbi pages (6)
│   │   └── salik/          # Salik pages (5)
│   ├── api/                # API route handlers
│   │   ├── admin/          # Admin-only routes
│   │   ├── ai/             # AI chat & summary
│   │   ├── notifications/  # Notification CRUD
│   │   ├── reports/        # Daily report submission
│   │   └── templates/      # Task template CRUD
│   └── login/              # Auth page
├── components/
│   ├── layout/             # Sidebar, Navbar
│   ├── shared/             # Reusable components
│   └── ui/                 # ShadCN UI components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── services/           # Performance, AI, Notifications
│   ├── supabase/           # Client factories
│   └── validations.ts      # Zod schemas
└── types/                  # TypeScript definitions
```

## 🎨 Design System

- **Palette**: Soft cream, sage green, warm slate (Islamic-inspired)
- **Components**: ShadCN UI with custom theming
- **Animations**: Framer Motion (subtle, professional)
- **Charts**: Recharts with gradient fills
- **Typography**: Geist Sans & Mono

## 📦 Deployment 

Deploy to Vercel:

```bash
npx vercel
```

Set environment variables in your Vercel dashboard.

## 📄 License

MIT
