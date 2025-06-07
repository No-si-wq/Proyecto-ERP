/*
  Warnings:

  - Added the required column `rtn` to the `Client` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rtn` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Client" ADD COLUMN     "rtn" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Supplier" ADD COLUMN     "rtn" TEXT NOT NULL;
