# Perceiva

Perceiva is a personal finance tracker built around one idea: your brain lies to you about money when you spend across currencies.

Spending 165,000 IDR feels like a lot. Spending 3,980 AMD feels like almost nothing. Both are roughly $10 USD. That gap between how a number feels and what it actually represents is currency perception distortion, and it quietly wrecks budgets for anyone living or working across multiple currencies.

Perceiva corrects this by converting every transaction to your chosen base currency in real time, while preserving the original amount for context. You always see both the number you spent and what it actually cost you.

---

## Who it's for

- Expats and digital nomads living in a foreign currency
- Remote workers getting paid in one currency and spending in another
- Frequent travelers who lose track of real costs when hopping between countries
- Anyone who has looked at their bank statement and thought "wait, I spent how much?"

---

## What it does

**Real-time currency normalization.** Every transaction you log is instantly converted to your base currency using live exchange rates. The exchange rate at the time of the transaction is stored permanently, so your history stays accurate even as markets move.

**Monthly recap cards.** On the 1st of each month, Perceiva generates a recap of your previous month. It covers total income, spending, net balance, savings rate, top categories, and a currency distortion analysis that shows how perception may have affected your behavior.

**Budget goals.** Set monthly spending limits per category. Perceiva tracks your progress in real time and flags when you are approaching or over budget.

**Trip mode.** Create a trip, tag transactions to it, and get a clean per-trip breakdown. Useful for separating travel spending from your regular baseline.

**Spending velocity.** A live indicator on the dashboard that tells you whether you are spending faster or slower than last month at the same point in the billing cycle. Early warning before the recap arrives.

**Transaction search and filtering.** Filter by type, category, currency, or free-text search across descriptions. Export everything as CSV whenever you want your data out.

**Light and dark mode.** Full theme support with a circle-wipe transition animation when switching.

**Privacy by design.** No analytics, no behavioral tracking, no data selling. Your financial data is stored in an isolated database, hashed and secured, and never shared with anyone.

---

## Roadmap

These are the things we want to build next, roughly in order of priority.

**Multi-account support.** Right now everything lives under one bucket. The next step is letting users create named accounts like "Cash", "Bank", or "Card" and assign transactions to each. Gives a more accurate picture of where money actually lives, not just where it went.

**Recurring transaction automation.** Marked recurring transactions should auto-generate on their schedule without manual logging. Salary on the 1st, rent on the 5th, subscriptions whenever they hit. Log it once, let Perceiva handle the rest.

**Net worth snapshot.** A simple assets vs liabilities view tracked over time. Not just cash flow but a point-in-time picture of where you actually stand financially.

**Exchange rate history chart.** Show how the rates you have been transacting at compare to current rates. Useful for spotting whether you have consistently been converting at bad times.

**Shared expense splitting.** Two people traveling together, one pays, both log it. Perceiva tracks the split in normalized currency so there is no more back-and-forth trying to figure out who owes what across three different currencies.

**Weekly digest.** A lightweight optional summary delivered by email covering your week in spending. Self-hosted, no tracking pixels, just your numbers.

**More currencies.** The current six (USD, EUR, GBP, CNY, IDR, AMD) cover the most common use cases but the list should grow based on what users actually need.

**Mobile app.** The web app is mobile-responsive but a native app would let Perceiva pull transaction data directly from bank integrations and remove the manual logging step entirely. This is a longer-term goal.

---

## Tech

Next.js 14 with App Router, TypeScript, Tailwind CSS, Prisma ORM, PostgreSQL, Lucia v3 authentication, and live exchange rates via ExchangeRate-API. Deployed on Vercel with Neon for the database.

---

*Built for people who live between currencies and want to actually understand where their money goes.*