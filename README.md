<div align="center">
  <br/>
  <h1>Perceiva</h1>
  <p><strong>See your money in its real value.</strong></p>
  <p>A privacy-first personal finance tracker that corrects currency perception distortion.</p>
  <br/>
</div>

---

## What is Perceiva?

When you live or spend across multiple currencies, your brain misjudges value based on the numbers it sees — not what those numbers actually represent. Spending 165,000 IDR feels like a lot. Spending 3,980 AMD feels like nothing. Both equal roughly **$10 USD**. This psychological mismatch quietly drives overspending — and most people never realize it.

Perceiva strips the illusion away. Every transaction is converted to your base currency at the moment of entry, using live exchange rates, and the original amount is preserved for context. You see what every purchase actually costs — not how it feels.

---

## Core Features

**Currency Normalization**  
Every transaction is instantly converted to your chosen base currency at the live exchange rate. The original amount and currency are preserved alongside the conversion. Exchange rate snapshots are stored per transaction for historical accuracy — your records stay truthful even as markets move.

**Multi-Currency Support**  
Supports USD, EUR, GBP, CNY, IDR, and AMD — covering the most common multi-currency living patterns for expats, remote workers, and frequent travelers.

**Monthly Recap Cards**  
On the first of each month, Perceiva generates a calm, reflective recap of your previous month. This includes total income, total spending, net balance, savings rate, top spending categories, and a currency distortion analysis — showing how perception may have affected your behavior. No gamification, no alarms. Just honest reflection.

**Behavioral Insights**  
The recap identifies patterns: weekend vs. weekday spending ratios, transaction frequency, and month-over-month changes in income, spending, and net balance.

**Fast Transaction Entry**  
Add transactions in seconds via a focused modal. Category and description are optional — the core data (amount, currency, type) is all that's required.

**Category & Currency Breakdown**  
Dashboard charts and breakdowns show where your money goes, organized by category and currency, all normalized to a single base.

---

## Privacy & Security

Perceiva is built privacy-first by design, not as an afterthought.

- No analytics tools — no Google Analytics, no behavioral tracking scripts
- No data selling, ever — your financial data is not a product
- No cross-user data visibility — all queries are strictly isolated to the authenticated user
- Passwords hashed with bcrypt (cost factor 12)
- Lucia v3 session management with secure, HttpOnly cookies
- All environment secrets accessed via server-side environment variables only
- Content Security Policy headers configured on all routes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | Radix UI primitives + Lucide icons |
| Charts | Recharts |
| Auth | Lucia v3 |
| ORM | Prisma |
| Database | PostgreSQL |
| Currency Rates | ExchangeRate-API v6 |
| Deployment | Vercel |

---

## Setup

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (locally or via [Neon](https://neon.tech) / [Supabase](https://supabase.com))
- A free [ExchangeRate-API](https://app.exchangerate-api.com) account for the currency API key

### 1. Clone and install

```bash
git clone https://github.com/youruser/perceiva.git
cd perceiva
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the values:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/perceiva"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
CURRENCY_API_KEY="your-exchangerate-api-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
CRON_SECRET="generate-with-openssl-rand-base64-32"
```

To generate secrets:
```bash
openssl rand -base64 32
```

### 3. Set up the database

```bash
# Push schema to the database
npm run db:push

# Or create a tracked migration
npm run db:migrate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment (Vercel)

### Database

For production, use a managed PostgreSQL provider:
- **[Neon](https://neon.tech)** — serverless PostgreSQL, generous free tier, ideal for Vercel
- **[Supabase](https://supabase.com)** — PostgreSQL with additional tooling, free tier available

### Deploy steps

1. Push the repository to GitHub
2. Import the repo in the [Vercel dashboard](https://vercel.com/new)
3. Add environment variables in Vercel project settings:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon or Supabase PostgreSQL connection string |
| `AUTH_SECRET` | `openssl rand -base64 32` |
| `CURRENCY_API_KEY` | Your ExchangeRate-API v6 key |
| `NEXT_PUBLIC_APP_URL` | `https://your-domain.vercel.app` |
| `CRON_SECRET` | `openssl rand -base64 32` |

4. Set build command: `npm run build` (runs `prisma generate` automatically)
5. Deploy

The `vercel.json` file configures a monthly cron job that auto-generates recap cards on the 1st of each month at 06:00 UTC.

---

## Exchange Rate API

Perceiva uses [ExchangeRate-API v6](https://v6.exchangerate-api.com) for live rates.

- Free tier: 1,500 requests/month
- Rates are cached in memory for 1 hour — typical usage is ~720 requests/month
- Rate snapshots are stored per transaction at creation time — historical accuracy is preserved even if rates move

Alternative providers (drop-in, adjust the URL in `lib/currency.ts`):
- [Fixer.io](https://fixer.io)
- [CurrencyAPI](https://currencyapi.com)

---

## Project Structure

```
perceiva/
├── app/
│   ├── (auth)/login/          ← Login page
│   ├── (auth)/register/       ← Registration page
│   ├── (dashboard)/
│   │   ├── dashboard/         ← Main dashboard
│   │   ├── transactions/      ← Transaction list
│   │   ├── insights/          ← Monthly recap
│   │   └── settings/          ← Account settings
│   ├── api/cron/              ← Monthly recap cron endpoint
│   ├── layout.tsx
│   └── page.tsx               ← Landing page
├── components/
│   ├── auth/                  ← AuthForm
│   ├── dashboard/             ← DashboardClient
│   ├── insights/              ← InsightsClient
│   ├── landing/               ← LandingPage
│   ├── layout/                ← Sidebar
│   ├── settings/              ← SettingsClient
│   └── transactions/          ← AddTransactionModal, TransactionsClient
├── lib/
│   ├── auth.ts                ← Lucia session management
│   ├── currency.ts            ← Exchange rates + conversion
│   ├── prisma.ts              ← Prisma singleton
│   ├── utils.ts               ← Shared utilities
│   └── validations.ts         ← Zod schemas
├── prisma/
│   └── schema.prisma          ← Database schema
├── server/actions/
│   ├── auth.actions.ts        ← register, login, logout
│   ├── recap.actions.ts       ← Monthly recap generation
│   └── transaction.actions.ts ← CRUD + dashboard queries
├── middleware.ts              ← Route protection
└── vercel.json                ← Cron job config
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production (includes prisma generate) |
| `npm run start` | Start production server |
| `npm run db:push` | Push Prisma schema to database (no migration file) |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:studio` | Open Prisma Studio (visual DB browser) |
| `npm run lint` | Run ESLint |

---

*Perceiva — built for clarity, not complexity.*
