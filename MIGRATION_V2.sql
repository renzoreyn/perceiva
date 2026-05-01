-- Run this in Neon SQL Editor after the previous schema was applied
-- Adds: RecurringFreq enum, BudgetGoal table, Trip table, new transaction columns

-- New enum
DO $$ BEGIN
  CREATE TYPE "RecurringFreq" AS ENUM ('daily', 'weekly', 'monthly');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Trips table
CREATE TABLE IF NOT EXISTS "trips" (
  "id"           TEXT NOT NULL PRIMARY KEY,
  "userId"       TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "name"         TEXT NOT NULL,
  "description"  TEXT,
  "baseCurrency" "Currency" NOT NULL,
  "startDate"    TIMESTAMP,
  "endDate"      TIMESTAMP,
  "createdAt"    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "trips_userId_idx" ON "trips"("userId");

-- Budget goals table
CREATE TABLE IF NOT EXISTS "budget_goals" (
  "id"           TEXT NOT NULL PRIMARY KEY,
  "userId"       TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "category"     "Category" NOT NULL,
  "limitAmount"  DECIMAL(18,4) NOT NULL,
  "currency"     "Currency" NOT NULL,
  "period"       TEXT NOT NULL DEFAULT 'monthly',
  "createdAt"    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "category")
);

-- Add new columns to transactions (safe, uses IF NOT EXISTS pattern)
ALTER TABLE "transactions"
  ADD COLUMN IF NOT EXISTS "isRecurring"   BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "recurringFreq" "RecurringFreq",
  ADD COLUMN IF NOT EXISTS "tripId"        TEXT REFERENCES "trips"("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "transactions_userId_tripId_idx" ON "transactions"("userId", "tripId");
