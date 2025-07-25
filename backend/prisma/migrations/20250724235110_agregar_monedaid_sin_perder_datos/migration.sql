-- AlterTable
ALTER TABLE "payment_methods" ADD COLUMN     "monedaId" INTEGER;

-- AddForeignKey
ALTER TABLE "payment_methods" ADD CONSTRAINT "payment_methods_monedaId_fkey" FOREIGN KEY ("monedaId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;
