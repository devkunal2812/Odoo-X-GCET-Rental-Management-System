/*
  Warnings:

  - Added the required column `updatedAt` to the `coupons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `vendorId` to the `coupons` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_coupons" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "discountType" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "validFrom" DATETIME NOT NULL,
    "validTo" DATETIME NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "maxUses" INTEGER,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "coupons_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Assign existing coupons to the first vendor (TechRent Pro)
INSERT INTO "new_coupons" ("id", "code", "vendorId", "discountType", "value", "validFrom", "validTo", "isActive", "maxUses", "usedCount", "createdAt", "updatedAt") 
SELECT "id", "code", 'b3740c25-49df-4560-af9d-5c34a83570a6', "discountType", "value", "validFrom", "validTo", "isActive", "maxUses", "usedCount", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP 
FROM "coupons";

DROP TABLE "coupons";
ALTER TABLE "new_coupons" RENAME TO "coupons";
CREATE UNIQUE INDEX "coupons_code_key" ON "coupons"("code");
CREATE INDEX "coupons_vendorId_isActive_idx" ON "coupons"("vendorId", "isActive");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
