-- CreateTable
CREATE TABLE "system_settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "pickupDate" DATETIME,
    "actualReturnDate" DATETIME,
    "lateFee" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "sale_orders_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sale_orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sale_orders_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sale_orders" ("couponId", "createdAt", "customerId", "discount", "endDate", "id", "orderDate", "orderNumber", "startDate", "status", "totalAmount", "updatedAt", "vendorId") SELECT "couponId", "createdAt", "customerId", "discount", "endDate", "id", "orderDate", "orderNumber", "startDate", "status", "totalAmount", "updatedAt", "vendorId" FROM "sale_orders";
DROP TABLE "sale_orders";
ALTER TABLE "new_sale_orders" RENAME TO "sale_orders";
CREATE UNIQUE INDEX "sale_orders_orderNumber_key" ON "sale_orders"("orderNumber");
CREATE INDEX "sale_orders_status_orderDate_idx" ON "sale_orders"("status", "orderDate");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings"("key");
