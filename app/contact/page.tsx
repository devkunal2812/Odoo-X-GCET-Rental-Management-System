"use client";

import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { 
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
    <div className="min-h-screen bg-secondary-50">
      <Header currentPage="contact" />

      {/* Hero Section */}
      <section className="py-20 bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Contact Us
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-secondary-200">
            We're here to help! Get in touch with our team for support, partnerships, or any questions about RentMarket.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-8 text-secondary-900">Get in Touch</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-primary-600">
                  <PhoneIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-secondary-900">Phone</h3>
                  <p className="text-secondary-600">+1 (555) 123-4567</p>
                  <p className="text-sm text-secondary-600">Mon-Fri 9AM-6PM EST</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-primary-600">
                  <EnvelopeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-secondary-900">Email</h3>
                  <p className="text-secondary-600">support@rentmarket.com</p>
                  <p className="text-sm text-secondary-600">We'll respond within 24 hours</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-primary-600">
                  <MapPinIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-secondary-900">Address</h3>
                  <p className="text-secondary-600">
                    123 Innovation Drive<br />
                    Tech City, TC 12345<br />
                    United States
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4 bg-primary-600">
                  <ClockIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1 text-secondary-900">Business Hours</h3>
                  <p className="text-secondary-600">
                    Monday - Friday: 9:00 AM - 6:00 PM<br />
                    Saturday: 10:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Contact Options */}
            <div className="mt-8 p-6 rounded-lg bg-secondary-700">
              <h3 className="font-semibold mb-4 text-white">Quick Help</h3>
              <div className="space-y-3">
                <Link 
                  href="/help" 
                  className="block text-sm hover:opacity-80 transition-opacity text-secondary-200"
                >
                  → Visit our Help Center
                </Link>
                <Link 
                  href="/login" 
                  className="block text-sm hover:opacity-80 transition-opacity text-secondary-200"
                >
                  → Vendor Partnership Inquiry
                </Link>
                <Link 
                  href="/terms" 
                  className="block text-sm hover:opacity-80 transition-opacity text-secondary-200"
                >
                  → Terms & Conditions
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-secondary-900">Send us a Message</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-secondary-900">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full px-4 py-3 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-900">
                    Inquiry Type
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) => handleInputChange("inquiryType", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white"
                  >
                    <option value="general" className="text-secondary-900 bg-white">General Inquiry</option>
                    <option value="customer-support" className="text-secondary-900 bg-white">Customer Support</option>
                    <option value="vendor-partnership" className="text-secondary-900 bg-white">Vendor Partnership</option>
                    <option value="technical-issue" className="text-secondary-900 bg-white">Technical Issue</option>
                    <option value="billing" className="text-secondary-900 bg-white">Billing Question</option>
                    <option value="feedback" className="text-secondary-900 bg-white">Feedback</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-900">
                    Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors text-secondary-900 bg-white"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-secondary-900">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={6}
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    className="w-full px-4 py-3 border-2 border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-vertical text-secondary-900 bg-white"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors hover:opacity-90 bg-primary-600"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-secondary-900">
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
                <h3 className="font-semibold mb-3 text-primary-600">
                  {faq.question}
                </h3>
                <p className="text-secondary-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-secondary-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 text-white">RentMarket</h3>
              <p className="text-secondary-400">
                Your trusted marketplace for renting everything you need.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/products" className="hover:opacity-80 transition-opacity text-secondary-400">Products</Link></li>
                <li><Link href="/about" className="hover:opacity-80 transition-opacity text-secondary-400">About Us</Link></li>
                <li><Link href="/contact" className="hover:opacity-80 transition-opacity text-secondary-400">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="hover:opacity-80 transition-opacity text-secondary-400">Help Center</Link></li>
                <li><Link href="/terms" className="hover:opacity-80 transition-opacity text-secondary-400">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:opacity-80 transition-opacity text-secondary-400">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Contact Info</h4>
              <div className="space-y-2 text-secondary-400">
                <p>Email: support@rentmarket.com</p>
                <p>Phone: (555) 123-4567</p>
              </div>
            </div>
          </div>
          <div className="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-400">
            <p>&copy; 2024 RentMarket. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
