"use client";

import React from "react";
import Link from "next/link";
import Header from "../../components/Header";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Terms & Conditions
            </h1>
            <p className="text-lg text-secondary-600">
              Last updated: January 1, 2024
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                1. Acceptance of Terms
              </h2>
              <p className="mb-4 text-secondary-700">
                By accessing and using RentMarket, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                2. Description of Service
              </h2>
              <p className="mb-4 text-secondary-700">
                RentMarket is a multi-vendor rental marketplace that connects customers with vendors offering products for rent. We facilitate transactions but are not a party to the rental agreements between customers and vendors.
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Product listings and availability are managed by individual vendors</li>
                <li>Rental terms, pricing, and policies are set by vendors</li>
                <li>We provide the platform and payment processing services</li>
                <li>Customer support and dispute resolution assistance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                3. User Accounts
              </h2>
              <p className="mb-4 text-secondary-700">
                To use certain features of our service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 text-secondary-700">
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
              <p className="text-secondary-700">
                You must be at least 18 years old to create an account and enter into rental agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                4. Rental Process
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-secondary-900">For Customers:</h3>
                  <ul className="list-disc list-inside space-y-1 text-secondary-700">
                    <li>Browse products and select rental periods</li>
                    <li>Submit rental requests (quotations)</li>
                    <li>Review and accept vendor terms</li>
                    <li>Complete payment and rental agreement</li>
                    <li>Arrange pickup/delivery as specified</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2 text-secondary-900">For Vendors:</h3>
                  <ul className="list-disc list-inside space-y-1 text-secondary-700">
                    <li>List products with accurate descriptions</li>
                    <li>Respond to rental requests promptly</li>
                    <li>Maintain product quality and availability</li>
                    <li>Provide clear rental terms and policies</li>
                    <li>Handle product delivery/pickup</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                5. Payment Terms
              </h2>
              <p className="mb-4 text-secondary-700">
                All payments are processed through our secure payment system. By making a payment, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Pay all charges associated with your rental</li>
                <li>Provide valid payment information</li>
                <li>Accept our payment processing terms</li>
                <li>Pay any applicable taxes and fees</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                6. Cancellation and Refunds
              </h2>
              <p className="mb-4 text-secondary-700">
                Cancellation policies vary by vendor and are displayed on each product listing. Generally:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Cancellations made 24+ hours before rental start may receive full refund</li>
                <li>Cancellations made less than 24 hours may incur fees</li>
                <li>No-shows or late cancellations may forfeit full payment</li>
                <li>Refund processing may take 3-5 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                7. Prohibited Uses
              </h2>
              <p className="mb-4 text-secondary-700">
                You may not use our service to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-secondary-700">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious content</li>
                <li>Engage in fraudulent activities</li>
                <li>Harass or harm other users</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                8. Liability and Insurance
              </h2>
              <p className="mb-4 text-secondary-700">
                RentMarket provides a platform for rentals but is not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4 text-secondary-700">
                <li>Product quality, safety, or condition</li>
                <li>Vendor performance or reliability</li>
                <li>Loss or damage to rented items</li>
                <li>Disputes between customers and vendors</li>
              </ul>
              <p className="text-secondary-700">
                We recommend customers obtain appropriate insurance coverage for high-value rentals.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                9. Privacy Policy
              </h2>
              <p className="text-secondary-700">
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service. By using RentMarket, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                10. Modifications to Terms
              </h2>
              <p className="mb-4 text-secondary-700">
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of the service after changes constitutes acceptance of the new Terms.
              </p>
              <p className="text-secondary-700">
                We will notify users of significant changes via email or platform notifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                11. Termination
              </h2>
              <p className="mb-4 text-secondary-700">
                We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
              <p className="text-secondary-700">
                You may terminate your account at any time by contacting customer support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-primary-700">
                12. Contact Information
              </h2>
              <p className="mb-4 text-secondary-700">
                If you have any questions about these Terms, please contact us:
              </p>
              <div className="text-secondary-700">
                <p>Email: legal@rentmarket.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Business Ave, Suite 100, City, State 12345</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t text-center border-secondary-300">
            <p className="text-sm text-secondary-600">
              By using RentMarket, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12 bg-secondary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">RentMarket</h3>
              <p className="text-secondary-300">
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:opacity-80 transition-opacity text-secondary-300">Products</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-opacity text-secondary-300">About Us</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity text-secondary-300">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:opacity-80 transition-opacity text-secondary-300">Help Center</Link></li>
                <li><Link href="/terms" className="hover:opacity-80 transition-opacity text-secondary-300">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:opacity-80 transition-opacity text-secondary-300">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Info</h4>
              <div className="space-y-2 text-secondary-300">
                <p>Email: support@rentmarket.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center border-secondary-700 text-secondary-300">
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}