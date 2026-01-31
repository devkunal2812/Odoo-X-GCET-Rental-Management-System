# Database Setup - Rental Management System

## ✅ Setup Complete

Your database has been successfully configured with a complete schema for the multi-vendor rental marketplace system.

## 📊 Database Schema Overview

The database includes the following main entities:

### User Management
- **User**: Core user accounts with role-based access (ADMIN, VENDOR, CUSTOMER)
- **VendorProfile**: Extended profile for vendors with company details
- **CustomerProfile**: Extended profile for customers with contact info

### Product Management
- **Product**: Rental products with vendor ownership
- **ProductPricing**: Flexible pricing per rental period (HOUR, DAY, WEEK)
- **Inventory**: Stock tracking for each product
- **Attribute**: Product attributes (Color, Size, etc.)
- **AttributeValue**: Values for each attribute
- **ProductVariant**: Product variants with SKU and price modifiers

### Order Management
- **SaleOrder**: Main order entity (Quotation → Confirmed → Invoiced)
- **SaleOrderLine**: Individual line items in orders
- **Reservation**: Time-based reservations to prevent overbooking

### Financial Management
- **Invoice**: Immutable financial documents
- **InvoiceLine**: Invoice line items
- **Payment**: Payment tracking with status

### Configuration
- **RentalPeriodConfig**: Rental period definitions
- **Coupon**: Discount coupons
- **AuditLog**: System audit trail

## 🔑 Test Credentials

The database has been seeded with test users:

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@rental.com       | admin123    |
| Vendor   | vendor@rental.com      | vendor123   |
| Customer | customer@rental.com    | customer123 |

## 📦 Sample Data

The seed includes:
- 3 test users (Admin, Vendor, Customer)
- 3 sample products (Camera, Party Tent, Delivery Service)
- 2 attributes (Color, Size) with values
- 4 rental period configs (Hourly, Daily, Weekly, Monthly)
- 1 active coupon (WELCOME10 - 10% off)

## 🛠️ Database Commands

### Run Migrations
```bash
npx prisma migrate dev
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Seed Database
```bash
npm run db:seed
```

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

### Open Prisma Studio (Database GUI)
```bash
npx prisma studio
```

## 🔍 Testing the Database

Test the database connection:
```bash
npm run dev
```

Then visit: http://localhost:3000/api/test

You should see a JSON response with database stats and sample data.

## 📁 Key Files

- `prisma/schema.prisma` - Database schema definition
- `prisma/seed.ts` - Seed data script
- `app/lib/prisma.ts` - Prisma client singleton
- `app/lib/db-utils.ts` - Database utility functions
- `.env` - Database connection string

## 🔐 Security Features

- Password hashing with bcrypt
- Role-based access control (RBAC)
- Audit logging for critical actions
- Cascade deletes for data integrity
- Unique constraints on emails, order numbers, etc.

## 🚀 Key Database Functions

The `app/lib/db-utils.ts` file includes:

- `checkAvailability()` - Prevent overbooking with reservation logic
- `generateOrderNumber()` - Auto-generate unique order numbers
- `generateInvoiceNumber()` - Auto-generate unique invoice numbers
- `createAuditLog()` - Log critical system actions
- `calculateRentalPrice()` - Calculate optimal rental pricing

## 📈 Database Indexes

Optimized indexes for:
- User email lookups
- Product vendor and published status
- Order status and dates
- Reservation date ranges
- Invoice dates and status
- Audit log queries

## 🔄 Migration to PostgreSQL

The schema is designed to work with both SQLite (dev) and PostgreSQL (prod).

To switch to PostgreSQL:

1. Update `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/rental_db"
```

2. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Run migrations:
```bash
npx prisma migrate dev
```

## 📝 Next Steps

Now that the database is set up, you can:

1. ✅ Build authentication APIs (`/api/auth/*`)
2. ✅ Create product management APIs (`/api/products/*`)
3. ✅ Implement order workflow APIs (`/api/orders/*`)
4. ✅ Build invoice and payment APIs (`/api/invoices/*`, `/api/payments/*`)
5. ✅ Add reporting endpoints (`/api/reports/*`)

Refer to `Backend.md` for the complete API specification.

## 🐛 Troubleshooting

### Prisma Client not found
```bash
npx prisma generate
```

### Migration conflicts
```bash
npx prisma migrate reset
npm run db:seed
```

### Database locked (SQLite)
Stop the dev server and try again.

## 📚 Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Database Schema Reference](./DatabaseScheme.md)
- [Backend API Specification](./Backend.md)
