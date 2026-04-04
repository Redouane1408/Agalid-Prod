-- Safe replacement for the failed migration `20260212225842_fix_quote_schema`
-- Ensures `Quote.totalDa` exists and is populated, then removes legacy `totalMad` if present.

ALTER TABLE "Quote"
ADD COLUMN IF NOT EXISTS "totalDa" INTEGER;

UPDATE "Quote"
SET "totalDa" = COALESCE("totalDa", "totalMad", 0);

ALTER TABLE "Quote"
ALTER COLUMN "totalDa" SET DEFAULT 0;

ALTER TABLE "Quote"
ALTER COLUMN "totalDa" SET NOT NULL;

ALTER TABLE "Quote"
DROP COLUMN IF EXISTS "totalMad";
