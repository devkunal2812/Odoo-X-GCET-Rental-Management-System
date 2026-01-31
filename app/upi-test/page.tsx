"use client";

import React from 'react';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function UPITestPage() {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setIsLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const testMinimalUPI = async () => {
    if (!isLoaded) {
      alert('Razorpay not loaded yet');
      return;
    }

    // Create a minimal order
    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 10, // ₹10 test
          currency: 'INR',
          receipt: `minimal_test_${Date.now()}`
        })
      });

      const orderData = await response.json();

      if (!orderData.success) {
        alert('Failed to create order');
        return;
      }

      // Minimal Razorpay config - no custom display settings
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'UPI Test',
        description: 'Minimal UPI Test',
        order_id: orderData.order_id,
        handler: (response: any) => {
          alert('Payment Success: ' + response.razorpay_payment_id);
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        },
        // Only enable UPI - no other methods
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
          emi: false,
          paylater: false
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating payment');
    }
  };

  const testAllMethods = async () => {
    if (!isLoaded) {
      alert('Razorpay not loaded yet');
      return;
    }

    try {
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: 10,
          currency: 'INR',
          receipt: `all_methods_test_${Date.now()}`
        })
      });

      const orderData = await response.json();

      // Enable all methods with default Razorpay interface
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'All Methods Test',
        description: 'Test All Payment Methods',
        order_id: orderData.order_id,
        handler: (response: any) => {
          alert('Payment Success: ' + response.razorpay_payment_id);
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },
        theme: {
          color: '#3399cc'
        }
        // No method restrictions - let Razorpay show all available methods
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating payment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-center mb-6">UPI Diagnostic Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testMinimalUPI}
            disabled={!isLoaded}
            className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            Test UPI Only (₹10)
          </button>

          <button
            onClick={testAllMethods}
            disabled={!isLoaded}
            className="w-full py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
          >
            Test All Methods (₹10)
          </button>

          <div className="text-sm text-gray-600 mt-4">
            <p><strong>Expected:</strong> UPI & QR Code option should appear</p>
            <p><strong>Test UPI ID:</strong> success@razorpay</p>
            <p><strong>If UPI missing:</strong> Check Razorpay dashboard settings</p>
          </div>

          {!isLoaded && (
            <div className="text-center text-gray-500">
              Loading Razorpay...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}