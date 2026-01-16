-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('Particulier', 'Entreprise', 'Industrie', 'Administration');

-- CreateTable
CREATE TABLE "ClientRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "clientType" "ClientType" NOT NULL,
    "monthlyConsumption" INTEGER NOT NULL,
    "householdSize" INTEGER NOT NULL,
    "energyUsagePattern" TEXT NOT NULL,
    "appliances" TEXT[],
    "roofArea" INTEGER NOT NULL,
    "roofType" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "peakSunHours" DOUBLE PRECISION NOT NULL,
    "hasShading" BOOLEAN NOT NULL,
    "budget" INTEGER NOT NULL,
    "notes" TEXT,

    CONSTRAINT "ClientRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestId" INTEGER NOT NULL,
    "totalMad" INTEGER NOT NULL,
    "panelCount" INTEGER NOT NULL,
    "systemKw" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OwnerSettings" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "services" TEXT[],
    "displayQuoteOnSite" BOOLEAN NOT NULL DEFAULT true,
    "sendEmailQuote" BOOLEAN NOT NULL DEFAULT true,
    "sendWhatsappQuote" BOOLEAN NOT NULL DEFAULT true,
    "requiredFields" TEXT[],

    CONSTRAINT "OwnerSettings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Quote" ADD CONSTRAINT "Quote_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "ClientRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
