"use client";

import React from 'react';
import { useRazorpay } from '../../lib/useRazorpay';

export default function TestPaymentPage() {
  const { isLoaded, createOrder, verifyPayment, openRazorpay } = useRazorpay();

  const handleTestPayment = async () => {
    if (!isLoaded) {
      alert('Payment system is loading. Please try again.');
      return;
    }

    try {
      // Create order with Razorpay
      const orderData = await createOrder(100, `test_receipt_${Date.now()}`);
      
      if (!orderData.success) {
        throw new Error('Failed to create payment order');
      }

      // Configure Razorpay options for UPI testing
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RentMarket Test',
        description: 'Test UPI QR Payment',
        order_id: orderData.order_id,
        handler: async (response: any) => {
          console.log('Payment successful:', response);
          alert('Payment successful! Check console for details.');
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999',
        },
        theme: {
          color: '#37353E',
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        config: {
          display: {
            blocks: {
              upi: {
                name: 'UPI & QR Code',
                instruments: [
                  { method: 'upi' }
                ]
              },
              card: {
                name: 'Cards',
                instruments: [
                  { method: 'card' }
                ]
              }
            },
            sequence: ['block.upi', 'block.card'],
            preferences: {
              show_default_blocks: true
            }
          }
        },
        modal: {
          ondismiss: () => {
            console.log('Payment cancelled by user');
          },
        },
      };

      // Open Razorpay checkout
      openRazorpay(options);
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to initiate payment. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">Test UPI QR Payment</h1>
        
        <div className="text-center mb-6">
          <p className="text-secondary-600 mb-4">
            Test the UPI QR code functionality with Google Pay, PhonePe, or any UPI app.
          </p>
          <p className="text-lg font-semibold text-primary-600">
            Test Amount: ₹100
          </p>
        </div>

        <button
          onClick={handleTestPayment}
          disabled={!isLoaded}
          className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
            !isLoaded
              ? 'bg-secondary-300 text-secondary-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700'
          }`}
        >
          {!isLoaded ? 'Loading Payment System...' : 'Test UPI QR Payment'}
        </button>

        <div className="mt-6 text-xs text-secondary-500">
          <p className="mb-2"><strong>Test UPI ID:</strong> success@razorpay</p>
          <p className="mb-2"><strong>Test Card:</strong> 4111 1111 1111 1111</p>
          <p><strong>Note:</strong> This is a test environment. No real money will be charged.</p>
        </div>
      </div>
    </div>
  );
}