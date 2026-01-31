# Razorpay Integration Guide

## Overview
This project integrates Razorpay for secure payment processing in the rental marketplace checkout flow.

## Features
- Real-time payment processing with Razorpay
- **UPI QR Code support for Google Pay, PhonePe, Paytm, and other UPI apps**
- Secure payment verification
- Support for all major payment methods (Cards, UPI, Net Banking, Wallets)
- Mobile-responsive checkout flow
- Payment success/failure handling

## Configuration

### Environment Variables
Add these to your `.env` file:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_SANmaYZqw27vky"
RAZORPAY_KEY_SECRET="BfIJmflkl2O2nEkhBFeXm1eN"
```

### Test Credentials
- **Test Key ID**: `rzp_test_SANmaYZqw27vky`
- **Test Key Secret**: `BfIJmflkl2O2nEkhBFeXm1eN`

## UPI QR Code Payment

### How it works
1. User clicks "Pay with Razorpay"
2. Razorpay checkout opens with UPI option prominently displayed
3. User selects UPI payment method
4. QR code is generated for scanning
5. User scans QR code with Google Pay, PhonePe, Paytm, or any UPI app
6. Payment is completed in the UPI app
7. Success/failure is handled automatically

### Supported UPI Apps
- Google Pay (GPay)
- PhonePe
- Paytm
- BHIM
- Amazon Pay
- Any UPI-enabled banking app

## Checkout Flow

1. **Step 1: Delivery Information**
   - Customer enters delivery address
   - Selects delivery method (Standard/Pickup)
   - Optional separate billing address

2. **Step 2: Review Order**
   - Review cart items and delivery details
   - Confirm order summary

3. **Step 3: Payment with Razorpay**
   - Secure payment processing
   - Real-time payment verification
   - Success/failure handling

## API Endpoints

### Create Payment Order
- **Endpoint**: `POST /api/payments/create-order`
- **Purpose**: Creates a Razorpay order for payment
- **Request Body**:
  ```json
  {
    "amount": 600,
    "currency": "INR",
    "receipt": "receipt_123456"
  }
  ```

### Verify Payment
- **Endpoint**: `POST /api/payments/verify`
- **Purpose**: Verifies payment signature for security
- **Request Body**:
  ```json
  {
    "razorpay_order_id": "order_xxx",
    "razorpay_payment_id": "pay_xxx",
    "razorpay_signature": "signature_xxx"
  }
  ```

## Test Payment Details

### Test Card Numbers
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Test UPI Payment
- **Success UPI ID**: success@razorpay
- **Failure UPI ID**: failure@razorpay

### QR Code Testing
1. Go to `/test-payment` page for quick UPI testing
2. Click "Test UPI QR Payment"
3. Select UPI option in Razorpay checkout
4. Use test UPI ID: `success@razorpay`
5. Or scan QR code with any UPI app (will show test payment)

### Test Net Banking
- Use any test bank credentials provided by Razorpay

## Security Features
- Payment signature verification
- Secure API key handling
- HTTPS-only transactions
- No card details stored locally

## Currency
All payments are processed in Indian Rupees (INR).

## Support
For Razorpay-related issues, refer to:
- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Test Cards](https://razorpay.com/docs/payments/payments/test-card-upi-details/)