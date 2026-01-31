"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  UserIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon
} from "@heroicons/react/24/outline";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    inquiryType: "general"
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", formData);
    alert("Thank you for your message! We'll get back to you soon.");
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      inquiryType: "general"
    });
  };

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
              <Link href="/contact" className="font-medium" style={{ color: "var(--deep-space-blue)" }}>
                Contact Us
              </Link>
              <Link href="/terms" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
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
            Contact Us
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--dusty-denim)" }}>
            We're here to help! Get in touch with our team for support, partnerships, or any questions about RentMarket.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--ink-black)" }}>Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" 
                     style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  <PhoneIcon className="w-6 h-6" style={{ color: "var(--eggshell)" }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--ink-black)" }}>Phone</h3>
                  <p style={{ color: "var(--blue-slate)" }}>+1 (555) 123-4567</p>
                  <p className="text-sm" style={{ color: "var(--blue-slate)" }}>Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" 
                     style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  <EnvelopeIcon className="w-6 h-6" style={{ color: "var(--eggshell)" }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--ink-black)" }}>Email</h3>
                  <p style={{ color: "var(--blue-slate)" }}>support@rentmarket.com</p>
                  <p className="text-sm" style={{ color: "var(--blue-slate)" }}>We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" 
                     style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  <MapPinIcon className="w-6 h-6" style={{ color: "var(--eggshell)" }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--ink-black)" }}>Address</h3>
                  <p style={{ color: "var(--blue-slate)" }}>
                    123 Innovation Drive<br />
                    Tech City, TC 12345<br />
                    United States
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" 
                     style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  <ClockIcon className="w-6 h-6" style={{ color: "var(--eggshell)" }} />
                </div>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: "var(--ink-black)" }}>Business Hours</h3>
                  <p style={{ color: "var(--blue-slate)" }}>
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: "var(--dusty-denim)" }}>
              <h3 className="font-semibold mb-4" style={{ color: "var(--eggshell)" }}>Quick Help</h3>
              <div className="space-y-3">
                <Link 
                  href="/help" 
                  className="block text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--blue-slate)" }}
                >
                  → Visit our Help Center
                </Link>
                <Link 
                  href="/login" 
                  className="block text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--blue-slate)" }}
                >
                  → Vendor Partnership Inquiry
                </Link>
                <Link 
                  href="/terms" 
                  className="block text-sm hover:opacity-80 transition-opacity"
                  style={{ color: "var(--blue-slate)" }}
                >
                  → Terms & Conditions
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6" style={{ color: "var(--ink-black)" }}>Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink-black)" }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink-black)" }}>
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                      style={{ 
                        borderColor: "var(--dusty-denim)",
                        color: "var(--ink-black)",
                        backgroundColor: "var(--eggshell)"
                      }}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink-black)" }}>
                    Inquiry Type
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => handleInputChange("inquiryType", e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      borderColor: "var(--dusty-denim)",
                      color: "var(--ink-black)",
                      backgroundColor: "var(--eggshell)"
                    }}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="customer-support">Customer Support</option>
                    <option value="vendor-partnership">Vendor Partnership</option>
                    <option value="technical-issue">Technical Issue</option>
                    <option value="billing">Billing Question</option>
                    <option value="feedback">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink-black)" }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{ 
                      borderColor: "var(--dusty-denim)",
                      color: "var(--ink-black)",
                      backgroundColor: "var(--eggshell)"
                    }}
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--ink-black)" }}>
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors resize-vertical"
                    style={{ 
                      borderColor: "var(--dusty-denim)",
                      color: "var(--ink-black)",
                      backgroundColor: "var(--eggshell)"
                    }}
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: "var(--deep-space-blue)" }}
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--ink-black)" }}>
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                question: "How do I rent a product?",
                answer: "Simply browse our products, select your rental period, add to cart, and checkout. You'll receive confirmation and pickup/delivery details."
              },
              {
                question: "What if a product is damaged during rental?",
                answer: "All rentals are covered by our protection plan. Report any damage immediately and we'll handle the resolution process."
              },
              {
                question: "How do I become a vendor?",
                answer: "Contact us through this form or email partnerships@rentmarket.com. We'll guide you through our vendor onboarding process."
              },
              {
                question: "What payment methods do you accept?",
                answer: "We accept all major credit cards, PayPal, and bank transfers. Payment is processed securely through our platform."
              },
              {
                question: "Can I cancel or modify my rental?",
                answer: "Yes, you can cancel or modify rentals up to 24 hours before the start date. Check our cancellation policy for details."
              },
              {
                question: "Do you offer delivery and pickup?",
                answer: "Many vendors offer delivery and pickup services. You can also choose to collect items directly from vendor locations."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold mb-3" style={{ color: "var(--deep-space-blue)" }}>
                  {faq.question}
                </h3>
                <p style={{ color: "var(--blue-slate)" }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
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