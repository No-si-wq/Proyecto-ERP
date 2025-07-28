/*
  Warnings:

  - A unique constraint covering the columns `[sku,storeId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- Eliminar la constraint existente
ALTER TABLE "Product" DROP CONSTRAINT IF EXISTS "Product_sku_key";

-- Crear la nueva constraint compuesta
ALTER TABLE "Product" ADD CONSTRAINT "Product_sku_storeId_key" UNIQUE ("sku", "storeId");
