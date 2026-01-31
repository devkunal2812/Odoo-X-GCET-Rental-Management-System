/*
  Warnings:

  - You are about to drop the column `period` on the `product_pricing` table. All the data in the column will be lost.
  - Added the required column `rentalPeriodId` to the `product_pricing` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_coupons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "validFrom" DATETIME NOT NULL,
    "validTo" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_coupons" ("code", "discountType", "id", "isActive", "validFrom", "validTo", "value") SELECT "code", "discountType", "id", "isActive", "validFrom", "validTo", "value" FROM "coupons";
DROP TABLE "coupons";
ALTER TABLE "new_coupons" RENAME TO "coupons";
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
CREATE TABLE "new_product_pricing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "rentalPeriodId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    CONSTRAINT "product_pricing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "product_pricing_rentalPeriodId_fkey" FOREIGN KEY ("rentalPeriodId") REFERENCES "rental_period_configs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_product_pricing" ("id", "price", "productId") SELECT "id", "price", "productId" FROM "product_pricing";
DROP TABLE "product_pricing";
ALTER TABLE "new_product_pricing" RENAME TO "product_pricing";
CREATE UNIQUE INDEX "product_pricing_productId_rentalPeriodId_key" ON "product_pricing"("productId", "rentalPeriodId");
CREATE TABLE "new_sale_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "couponId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'QUOTATION',
    "startDate" DATETIME,
    "endDate" DATETIME,
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalAmount" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sale_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sale_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sale_orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sale_orders" ("createdAt", "customerId", "endDate", "id", "orderDate", "orderNumber", "startDate", "status", "totalAmount", "updatedAt", "vendorId") SELECT "createdAt", "customerId", "endDate", "id", "orderDate", "orderNumber", "startDate", "status", "totalAmount", "updatedAt", "vendorId" FROM "sale_orders";
DROP TABLE "sale_orders";
ALTER TABLE "new_sale_orders" RENAME TO "sale_orders";
CREATE UNIQUE INDEX "sale_orders_orderNumber_key" ON "sale_orders"("orderNumber");
CREATE INDEX "sale_orders_status_orderDate_idx" ON "sale_orders"("status", "orderDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
