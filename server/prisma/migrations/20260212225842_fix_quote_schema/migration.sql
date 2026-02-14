/*
  Warnings:

  - You are about to drop the column `totalMad` on the `Quote` table. All the data in the column will be lost.
  - Added the required column `totalDa` to the `Quote` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quote" DROP COLUMN "totalMad",
ADD COLUMN     "totalDa" INTEGER NOT NULL;
