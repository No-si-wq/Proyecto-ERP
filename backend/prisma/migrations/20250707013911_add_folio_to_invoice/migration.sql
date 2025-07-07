/*
  Warnings:

  - A unique constraint covering the columns `[folio]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `folio` to the `Invoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invoice"
ADD COLUMN "folio" TEXT NOT NULL DEFAULT '';

