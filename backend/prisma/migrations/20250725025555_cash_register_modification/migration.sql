/*
  Warnings:

  - You are about to drop the column `clave` on the `CashRegister` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `CashRegister` table. All the data in the column will be lost.
  - Added the required column `descripcion` to the `CashRegister` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formatoCFDI` to the `CashRegister` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formatoNota` to the `CashRegister` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numeroDeCaja` to the `CashRegister` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "CashRegister_clave_key";

-- AlterTable
ALTER TABLE "CashRegister" DROP COLUMN "clave",
DROP COLUMN "nombre",
ADD COLUMN     "descripcion" TEXT NOT NULL,
ADD COLUMN     "formatoCFDI" TEXT NOT NULL,
ADD COLUMN     "formatoNota" TEXT NOT NULL,
ADD COLUMN     "numeroDeCaja" INTEGER NOT NULL;
