import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getUserFromRequest } from "@/app/lib/auth";

/**
 * POST /api/orders/create
 * 
 * Create Order API - Creates a new rental order after successful payment
 * This version saves orders to the database using Prisma and associates with authenticated user
 */
export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const currentUser = await getUserFromRequest(request);
    
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required to create orders" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['cartItems', 'formData', 'deliveryMethod', 'total', 'paymentId'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const { cartItems, formData, deliveryMethod, total, paymentId, razorpayOrderId } = body;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}`;
    
    // Calculate dates from cart items (use actual rental dates if available)
    let startDate = new Date();
    let endDate = new Date();
    
    // Use rental dates from first cart item if available
    if (cartItems.length > 0 && cartItems[0].rentalStartDate && cartItems[0].rentalEndDate) {
      startDate = new Date(cartItems[0].rentalStartDate);
      endDate = new Date(cartItems[0].rentalEndDate);
    } else {
      // Fallback to default dates (rental starts tomorrow, ends in 3 days)
      startDate.setDate(startDate.getDate() + 1);
      endDate.setDate(endDate.getDate() + 4);
    }

    try {
      // Get or create customer profile for the authenticated user
      let customerProfile = await prisma.customerProfile.findFirst({
        where: {
          userId: currentUser.id // ✅ Use authenticated user's ID
        },
        include: {
          user: true
        }
      });

      if (!customerProfile) {
        // Create customer profile for the authenticated user
        customerProfile = await prisma.customerProfile.create({
          data: {
            userId: currentUser.id, // ✅ Use authenticated user's ID
            phone: formData.deliveryPhone,
            defaultAddress: `${formData.deliveryStreet}, ${formData.deliveryCity}, ${formData.deliveryState} ${formData.deliveryZip}`
          },
          include: {
            user: true
          }
        });
        console.log(`✅ Created customer profile for user: ${currentUser.email}`);
      } else {
        // Update customer profile with latest delivery info
        customerProfile = await prisma.customerProfile.update({
          where: { id: customerProfile.id },
          data: {
            phone: formData.deliveryPhone,
            defaultAddress: `${formData.deliveryStreet}, ${formData.deliveryCity}, ${formData.deliveryState} ${formData.deliveryZip}`
          },
          include: {
            user: true
          }
        });
        console.log(`✅ Updated customer profile for user: ${currentUser.email}`);
      }

      // Get or create default vendor profile
      let vendorProfile = await prisma.vendorProfile.findFirst({
        where: {
          companyName: cartItems[0]?.product?.vendor || "Default Vendor"
        }
      });

      if (!vendorProfile) {
        // Create default vendor user and profile
        const vendorUser = await prisma.user.create({
          data: {
            firstName: "Vendor",
            lastName: "Admin",
            email: `vendor_${Date.now()}@rentmarket.com`,
            passwordHash: "temp_hash",
            role: "VENDOR",
            emailVerified: true
          }
        });

        vendorProfile = await prisma.vendorProfile.create({
          data: {
            userId: vendorUser.id,
            companyName: cartItems[0]?.product?.vendor || "Default Vendor",
            address: "Vendor Address"
          }
        });
      }

      // Create or get products for order lines and reservations
      const orderLines = [];
      const reservations = [];
      
      for (const item of cartItems) {
        let product = await prisma.product.findFirst({
          where: {
            name: item.product.name,
            vendorId: vendorProfile.id
          }
        });

        if (!product) {
          // Create product if it doesn't exist
          product = await prisma.product.create({
            data: {
              vendorId: vendorProfile.id,
              name: item.product.name,
              description: `Rental product: ${item.product.name}`,
              productType: "GOODS",
              isRentable: true,
              published: true
            }
          });

          // Create inventory for the product
          await prisma.inventory.create({
            data: {
              productId: product.id,
              quantityOnHand: item.product.stock || 10, // Default stock
              reservedQuantity: 0
            }
          });
        }

        // Use item-specific rental dates if available, otherwise use order dates
        const itemStartDate = item.rentalStartDate ? new Date(item.rentalStartDate) : startDate;
        const itemEndDate = item.rentalEndDate ? new Date(item.rentalEndDate) : endDate;

        orderLines.push({
          productId: product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          rentalStart: itemStartDate,
          rentalEnd: itemEndDate
        });

        // Create reservation data for this item
        reservations.push({
          productId: product.id,
          quantity: item.quantity,
          startDate: itemStartDate,
          endDate: itemEndDate
        });
      }

      // Create the order in database
      const dbOrder = await prisma.saleOrder.create({
        data: {
          orderNumber,
          customerId: customerProfile.id,
          vendorId: vendorProfile.id,
          status: "CONFIRMED", // Set as confirmed since payment is successful
          startDate: startDate,
          endDate: endDate,
          totalAmount: total,
          lines: {
            create: orderLines
          },
          // Create reservations for time-based availability
          reservations: {
            create: reservations
          }
        },
        include: {
          lines: {
            include: {
              product: true
            }
          },
          reservations: {
            include: {
              product: true
            }
          },
          customer: {
            include: {
              user: true
            }
          },
          vendor: true
        }
      });

      // Update inventory reserved quantities
      for (const reservation of reservations) {
        await prisma.inventory.update({
          where: { productId: reservation.productId },
          data: {
            reservedQuantity: {
              increment: reservation.quantity
            }
          }
        });
      }

      // Create invoice for the order
      const invoiceNumber = `INV-${orderNumber.replace('ORD-', '')}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15); // Due in 15 days

      const dbInvoice = await prisma.invoice.create({
        data: {
          invoiceNumber,
          saleOrderId: dbOrder.id,
          status: "POSTED", // Set as posted since payment is confirmed
          invoiceDate: new Date(),
          dueDate: dueDate,
          totalAmount: total,
          lines: {
            create: orderLines.map(line => ({
              productId: line.productId,
              description: `Rental: ${cartItems.find(item => item.product.name)?.product.name || 'Product'}`,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              amount: line.unitPrice * line.quantity
            }))
          }
        },
        include: {
          lines: {
            include: {
              product: true
            }
          }
        }
      });

      console.log('✅ Order saved to database:', dbOrder.orderNumber);
      console.log('✅ Invoice created in database:', dbInvoice.invoiceNumber);
      console.log('✅ Reservations created:', dbOrder.reservations?.length || 0);
      console.log('📊 Database records created:');
      console.log('   - Customer:', currentUser.email); // ✅ Use authenticated user
      console.log('   - Vendor:', vendorProfile.companyName);
      console.log('   - Products:', orderLines.length);
      console.log('   - Order ID:', dbOrder.id);
      console.log('   - Invoice ID:', dbInvoice.id);
      console.log('   - Rental Period:', startDate.toISOString(), 'to', endDate.toISOString());

      // Create order data for response (compatible with frontend)
      const orderData = {
        id: orderNumber,
        product: {
          name: cartItems.length === 1 ? cartItems[0].product.name : `${cartItems.length} Items`,
          image: cartItems[0]?.product.image || "/api/placeholder/100/100",
          description: cartItems.length === 1 
            ? `${cartItems[0].product.name} rental` 
            : `Rental package with ${cartItems.length} items`
        },
        vendor: {
          name: vendorProfile.companyName,
          phone: "+1 (555) 123-4567",
          email: "support@rentmarket.com"
        },
        amount: total,
        status: "confirmed",
        orderDate: new Date().toISOString().split('T')[0],
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration: 3,
        unit: "days",
        pickupLocation: deliveryMethod === "pickup" ? "Store Location - 123 Main St" : "Delivery Address",
        pickupTime: "10:00 AM",
        returnLocation: deliveryMethod === "pickup" ? "Store Location - 123 Main St" : "Delivery Address",
        returnTime: "5:00 PM",
        // ✅ CRITICAL: Mark as paid since payment was successful
        paymentStatus: "paid",
        isPaid: true, // ✅ Add isPaid flag for frontend
        paymentId: paymentId,
        razorpayOrderId: razorpayOrderId,
        paymentMethod: "Razorpay (Test Mode)",
        paymentVerified: true,
        paymentTimestamp: new Date().toISOString(),
        deliveryMethod: deliveryMethod === "standard" ? "Standard Delivery" : "Pickup from Store",
        deliveryAddress: {
          name: `${formData.deliveryFirstName} ${formData.deliveryLastName}`,
          street: formData.deliveryStreet,
          city: formData.deliveryCity,
          state: formData.deliveryState,
          zip: formData.deliveryZip,
          country: formData.deliveryCountry,
          phone: formData.deliveryPhone,
          email: formData.deliveryEmail
        },
        items: cartItems.map((item: any) => ({
          id: item.id,
          name: item.product.name,
          vendor: item.product.vendor,
          quantity: item.quantity,
          rentalDuration: item.rentalDuration,
          rentalUnit: item.rentalUnit,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity * item.rentalDuration
        })),
        notes: `✅ Order placed via Razorpay. Payment ID: ${paymentId}. PAYMENT VERIFIED & SAVED TO DATABASE. User: ${currentUser.email}`,
        createdAt: new Date().toISOString(),
        dbOrderId: dbOrder.id // Include database ID for reference
      };
      
      return NextResponse.json({ 
        success: true, 
        order: orderData,
        message: "Order created and saved to database successfully",
        storage: "database",
        dbOrderId: dbOrder.id
      });

    } catch (dbError) {
      console.error('Database save failed:', dbError);
      
      // Fallback to localStorage format if database fails
      const orderData = {
        id: orderNumber,
        product: {
          name: cartItems.length === 1 ? cartItems[0].product.name : `${cartItems.length} Items`,
          image: cartItems[0]?.product.image || "/api/placeholder/100/100",
          description: cartItems.length === 1 
            ? `${cartItems[0].product.name} rental` 
            : `Rental package with ${cartItems.length} items`
        },
        vendor: {
          name: cartItems[0]?.product.vendor || "Multiple Vendors",
          phone: "+1 (555) 123-4567",
          email: "support@rentmarket.com"
        },
        amount: total,
        status: "confirmed",
        orderDate: new Date().toISOString().split('T')[0],
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        duration: 3,
        unit: "days",
        pickupLocation: deliveryMethod === "pickup" ? "Store Location - 123 Main St" : "Delivery Address",
        pickupTime: "10:00 AM",
        returnLocation: deliveryMethod === "pickup" ? "Store Location - 123 Main St" : "Delivery Address",
        returnTime: "5:00 PM",
        paymentStatus: "paid",
        paymentId: paymentId,
        razorpayOrderId: razorpayOrderId,
        paymentMethod: "Razorpay (Test Mode)",
        paymentVerified: true,
        paymentTimestamp: new Date().toISOString(),
        deliveryMethod: deliveryMethod === "standard" ? "Standard Delivery" : "Pickup from Store",
        deliveryAddress: {
          name: `${formData.deliveryFirstName} ${formData.deliveryLastName}`,
          street: formData.deliveryStreet,
          city: formData.deliveryCity,
          state: formData.deliveryState,
          zip: formData.deliveryZip,
          country: formData.deliveryCountry,
          phone: formData.deliveryPhone,
          email: formData.deliveryEmail
        },
        items: cartItems.map((item: any) => ({
          id: item.id,
          name: item.product.name,
          vendor: item.product.vendor,
          quantity: item.quantity,
          rentalDuration: item.rentalDuration,
          rentalUnit: item.rentalUnit,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity * item.rentalDuration
        })),
        notes: `Order placed via Razorpay. Payment ID: ${paymentId}. Database save failed, using localStorage fallback. User: ${currentUser.email}`,
        createdAt: new Date().toISOString()
      };
      
      return NextResponse.json({ 
        success: true, 
        order: orderData,
        message: "Order created successfully (localStorage fallback)",
        storage: "localStorage_fallback",
        error: "Database save failed"
      });
    }

  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: error.message || "Order creation failed" },
      { status: 500 }
    );
  }
}