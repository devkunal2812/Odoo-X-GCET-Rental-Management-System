import Link from "next/link";
import { ShoppingCartIcon, HeartIcon, UserIcon } from "@heroicons/react/24/outline";

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--eggshell)" }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold" style={{ color: "var(--deep-space-blue)" }}>
                RentMarket
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/products" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                Products
              </Link>
              <Link href="/about" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                About Us
              </Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                Contact Us
              </Link>
              <Link href="/terms" className="font-medium" style={{ color: "var(--deep-space-blue)" }}>
                Terms & Conditions
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link href="/wishlist" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                <HeartIcon className="h-6 w-6" />
              </Link>
              <Link href="/cart" className="hover:opacity-80 transition-opacity relative" style={{ color: "var(--blue-slate)" }}>
                <ShoppingCartIcon className="h-6 w-6" />
                <span className="absolute -top-2 -right-2 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
                      style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  0
                </span>
              </Link>
              <Link href="/login" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
                <UserIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20" style={{ backgroundColor: "var(--deep-space-blue)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--eggshell)" }}>
            Terms & Conditions
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--dusty-denim)" }}>
            Please read these terms carefully before using RentMarket services.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="mb-8">
            <p className="text-sm mb-4" style={{ color: "var(--blue-slate)" }}>
              <strong>Last Updated:</strong> January 1, 2024
            </p>
            <p className="text-lg" style={{ color: "var(--blue-slate)" }}>
              Welcome to RentMarket. These Terms and Conditions ("Terms") govern your use of our rental marketplace platform and services.
            </p>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                1. Acceptance of Terms
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                By accessing or using RentMarket, you agree to be bound by these Terms. If you disagree with any part of these terms, you may not access our service.
              </p>
              <p style={{ color: "var(--blue-slate)" }}>
                These Terms apply to all visitors, users, customers, vendors, and others who access or use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                2. Description of Service
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                RentMarket is a multi-vendor rental marketplace that connects customers with vendors offering products for rent. We facilitate transactions but are not a party to the rental agreements between customers and vendors.
              </p>
              <ul className="list-disc list-inside space-y-2" style={{ color: "var(--blue-slate)" }}>
                <li>Product listings and availability are managed by individual vendors</li>
                <li>Rental terms, pricing, and policies are set by vendors</li>
                <li>We provide the platform, payment processing, and customer support</li>
                <li>All rental agreements are between customers and vendors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                3. User Accounts
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                To use certain features of our service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: "var(--blue-slate)" }}>
                <li>Providing accurate and complete information</li>
                <li>Maintaining the security of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
              <p style={{ color: "var(--blue-slate)" }}>
                You must be at least 18 years old to create an account and enter into rental agreements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                4. Rental Process
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--ink-black)" }}>For Customers:</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ color: "var(--blue-slate)" }}>
                    <li>Browse products and select rental periods</li>
                    <li>Submit rental requests (quotations)</li>
                    <li>Complete payment upon vendor confirmation</li>
                    <li>Arrange pickup/delivery with vendor</li>
                    <li>Return items in original condition</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--ink-black)" }}>For Vendors:</h3>
                  <ul className="list-disc list-inside space-y-1" style={{ color: "var(--blue-slate)" }}>
                    <li>List products with accurate descriptions</li>
                    <li>Respond to rental requests promptly</li>
                    <li>Maintain product quality and availability</li>
                    <li>Provide customer support for your rentals</li>
                    <li>Process returns and assess any damages</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                5. Payment Terms
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                All payments are processed through our secure payment system. By making a payment, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{ color: "var(--blue-slate)" }}>
                <li>Pay all charges associated with your rental</li>
                <li>Provide valid payment information</li>
                <li>Accept our refund and cancellation policies</li>
                <li>Pay any additional fees for damages or late returns</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                6. Cancellation and Refunds
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                Cancellation policies vary by vendor and are displayed on each product listing. Generally:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{ color: "var(--blue-slate)" }}>
                <li>Cancellations made 24+ hours before rental start may receive full refund</li>
                <li>Cancellations made less than 24 hours may incur fees</li>
                <li>No-shows or failure to pickup may result in full charge</li>
                <li>Refunds are processed within 5-7 business days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                7. Prohibited Uses
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                You may not use our service to:
              </p>
              <ul className="list-disc list-inside space-y-2" style={{ color: "var(--blue-slate)" }}>
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit harmful or malicious content</li>
                <li>Impersonate others or provide false information</li>
                <li>Interfere with the platform's operation</li>
                <li>Use products for illegal or unauthorized purposes</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                8. Liability and Insurance
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                RentMarket provides a platform for rentals but is not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-4" style={{ color: "var(--blue-slate)" }}>
                <li>Product quality, safety, or condition</li>
                <li>Vendor performance or reliability</li>
                <li>Damages or injuries from product use</li>
                <li>Disputes between customers and vendors</li>
              </ul>
              <p style={{ color: "var(--blue-slate)" }}>
                We recommend customers obtain appropriate insurance coverage for high-value rentals.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                9. Privacy Policy
              </h2>
              <p style={{ color: "var(--blue-slate)" }}>
                Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your information when you use our service. By using RentMarket, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                10. Modifications to Terms
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of the service after changes constitutes acceptance of the new Terms.
              </p>
              <p style={{ color: "var(--blue-slate)" }}>
                We will notify users of significant changes via email or platform notifications.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                11. Termination
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                We may terminate or suspend your account and access to the service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
              </p>
              <p style={{ color: "var(--blue-slate)" }}>
                You may terminate your account at any time by contacting customer support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4" style={{ color: "var(--deep-space-blue)" }}>
                12. Contact Information
              </h2>
              <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                If you have any questions about these Terms, please contact us:
              </p>
              <div style={{ color: "var(--blue-slate)" }}>
                <p>Email: legal@rentmarket.com</p>
                <p>Phone: +1 (555) 123-4567</p>
                <p>Address: 123 Innovation Drive, Tech City, TC 12345</p>
              </div>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t text-center" style={{ borderColor: "var(--dusty-denim)" }}>
            <p className="text-sm" style={{ color: "var(--blue-slate)" }}>
              By using RentMarket, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white py-12" style={{ backgroundColor: "var(--ink-black)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4" style={{ color: "var(--eggshell)" }}>RentMarket</h3>
              <p style={{ color: "var(--dusty-denim)" }}>
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Products</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>About Us</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Help Center</Link></li>
                <li><Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:opacity-80 transition-opacity" style={{ color: "var(--dusty-denim)" }}>Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Contact Info</h4>
              <div className="space-y-2" style={{ color: "var(--dusty-denim)" }}>
                <p>Email: support@rentmarket.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center" style={{ borderColor: "var(--blue-slate)", color: "var(--dusty-denim)" }}>
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}