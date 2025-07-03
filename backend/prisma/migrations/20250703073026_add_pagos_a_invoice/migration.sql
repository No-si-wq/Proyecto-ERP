-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "cambio" DOUBLE PRECISION,
ADD COLUMN     "formasPago" JSONB,
ADD COLUMN     "importeRecibido" DOUBLE PRECISION;
