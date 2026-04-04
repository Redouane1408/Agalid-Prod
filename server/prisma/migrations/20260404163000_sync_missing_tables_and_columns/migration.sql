-- Bring the production database in sync with the current Prisma schema.

-- OwnerSettings: make array columns non-null and add missing settings columns with defaults.
ALTER TABLE "OwnerSettings"
ALTER COLUMN "services" SET DEFAULT '{}'::text[];

UPDATE "OwnerSettings" SET "services" = '{}'::text[] WHERE "services" IS NULL;

ALTER TABLE "OwnerSettings"
ALTER COLUMN "services" SET NOT NULL;

ALTER TABLE "OwnerSettings"
ALTER COLUMN "requiredFields" SET DEFAULT '{}'::text[];

UPDATE "OwnerSettings" SET "requiredFields" = '{}'::text[] WHERE "requiredFields" IS NULL;

ALTER TABLE "OwnerSettings"
ALTER COLUMN "requiredFields" SET NOT NULL;

ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "defaultSystemEfficiency" DOUBLE PRECISION NOT NULL DEFAULT 0.85;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "defaultPanelAreaM2" DOUBLE PRECISION NOT NULL DEFAULT 2.2;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "defaultPanelPowerKw" DOUBLE PRECISION NOT NULL DEFAULT 0.55;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "minimumPanelCount" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "inverterSizingSafetyFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.1;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "quoteValidityDays" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "installationBaseCostDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "installationCostPerPanelDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "structureCostPerPanelDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "cablingCostPerKwDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "protectionCostDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "transportCostDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "maintenanceCostDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "shadingCostPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "marginPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "taxPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "roofTypeMultipliers" JSONB;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "clientTypeMultipliers" JSONB;
ALTER TABLE "OwnerSettings" ADD COLUMN IF NOT EXISTS "businessRules" JSONB;

-- Product: add images array column used by the current schema.
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "images" TEXT[] NOT NULL DEFAULT '{}'::text[];

-- Quote: add missing breakdown fields + snapshot used by current code.
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "hardwareSubtotalDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "installationSubtotalDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "marginSubtotalDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "taxSubtotalDa" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Quote" ADD COLUMN IF NOT EXISTS "calculationSnapshot" JSONB;

-- QuoteItem: create table and constraints used by current code.
CREATE TABLE IF NOT EXISTS "QuoteItem" (
  "id" SERIAL NOT NULL,
  "quoteId" INTEGER NOT NULL,
  "productId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "QuoteItem_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'QuoteItem_quoteId_fkey'
  ) THEN
    ALTER TABLE "QuoteItem"
      ADD CONSTRAINT "QuoteItem_quoteId_fkey"
      FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'QuoteItem_productId_fkey'
  ) THEN
    ALTER TABLE "QuoteItem"
      ADD CONSTRAINT "QuoteItem_productId_fkey"
      FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'QuoteItem_quoteId_idx'
  ) THEN
    CREATE INDEX "QuoteItem_quoteId_idx" ON "QuoteItem"("quoteId");
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i' AND c.relname = 'QuoteItem_productId_idx'
  ) THEN
    CREATE INDEX "QuoteItem_productId_idx" ON "QuoteItem"("productId");
  END IF;
END$$;
