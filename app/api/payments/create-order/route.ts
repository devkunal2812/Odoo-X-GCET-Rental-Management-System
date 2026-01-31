import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    // Razorpay expects amount in paise (smallest currency unit)
    // Round to ensure it's an integer
    const amountInPaise = Math.round(amount * 100);

    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      payment_capture: 1, // Auto capture payment
      notes: {
        upi_qr_enabled: 'true',
        payment_methods: 'card,netbanking,wallet,upi'
      }
    });

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}