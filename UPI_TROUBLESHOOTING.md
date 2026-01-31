# UPI QR Code Troubleshooting Guide

## Issue: UPI/QR Code option not showing in Razorpay checkout

### Possible Causes & Solutions

#### 1. Razorpay Dashboard Settings
**Most Likely Cause**: UPI needs to be enabled in your Razorpay dashboard.

**Solution**:
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Go to **Settings** → **Payment Methods**
3. Ensure **UPI** is enabled
4. Check if **UPI QR Code** is specifically enabled
5. Save settings and test again

#### 2. Test vs Live Mode
**Check**: Make sure you're in the correct mode (Test/Live)
- Test keys: `rzp_test_*`
- Live keys: `rzp_live_*`

#### 3. Account Verification
**Issue**: UPI might require account verification
**Solution**: Complete KYC verification in Razorpay dashboard

#### 4. Minimum Amount Restrictions
**Issue**: UPI might have minimum amount limits
**Solution**: Test with amounts ≥ ₹1

#### 5. Browser/Device Issues
**Try**:
- Clear browser cache
- Try different browser
- Test on mobile device
- Disable ad blockers

### Quick Test Steps

#### Test 1: Basic UPI Check
1. Go to `/test-payment` page
2. Click "Test UPI QR Payment"
3. Look for "UPI & QR Code" option
4. If not visible, check dashboard settings

#### Test 2: Console Debugging
1. Open browser console (F12)
2. Trigger payment
3. Look for any Razorpay errors
4. Check if UPI methods are loaded

#### Test 3: Different Configuration
Try this minimal config in checkout:
```javascript
const options = {
  key: orderData.key_id,
  amount: orderData.amount,
  currency: orderData.currency,
  name: 'RentMarket',
  description: 'Test Payment',
  order_id: orderData.order_id,
  handler: (response) => console.log(response),
  method: {
    upi: true
  }
};
```

### Expected UPI Options
When working correctly, you should see:
- **UPI & QR Code** section at the top
- QR code for scanning
- UPI ID input field
- Popular UPI apps (GPay, PhonePe, Paytm)

### Contact Razorpay Support
If UPI still doesn't appear:
1. Contact Razorpay support with your account details
2. Ask them to enable UPI for your test account
3. Verify your account has UPI permissions

### Alternative: Force UPI Display
If dashboard settings are correct but UPI still doesn't show, try:
1. Remove all `config` options
2. Use only `method: { upi: true }`
3. Let Razorpay use default UPI interface

### Test Credentials Reminder
- **Test UPI ID**: success@razorpay
- **Test Amount**: Any amount ≥ ₹1
- **Test Phone**: Use Indian mobile number format