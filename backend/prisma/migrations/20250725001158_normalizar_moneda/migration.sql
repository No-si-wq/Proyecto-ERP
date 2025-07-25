/*
  Warnings:

  - You are about to drop the column `moneda` on the `payment_methods` table. All the data in the column will be lost.
  - Made the column `monedaId` on table `payment_methods` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "payment_methods" DROP CONSTRAINT "payment_methods_monedaId_fkey";

-- AlterTable
ALTER TABLE "payment_methods" DROP COLUMN "moneda",
ALTER COLUMN "monedaId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_monedaId_fkey" FOREIGN KEY ("monedaId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
