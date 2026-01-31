"use client";

import React, { useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import {
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from "@heroicons/react/24/outline";

const faqData = [
  {
    question: "How do I rent a product?",
    answer: "Browse our products, select your rental period, submit a request, and complete payment once approved by the vendor."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and bank transfers for rental payments."
  },
  {
    question: "How does delivery work?",
    answer: "Delivery options vary by vendor. Some offer free delivery within certain areas, while others may charge a fee."
  },
  {
    question: "What if a product is damaged during rental?",
    answer: "Report any damage immediately. Depending on the vendor's policy, you may be responsible for repair costs."
  },
  {
    question: "Can I cancel my rental?",
    answer: "Cancellation policies vary by vendor. Check the specific policy on each product listing before booking."
  },
  {
    question: "How do I become a vendor?",
    answer: "Contact our team through the vendor application form. We'll review your application and guide you through the setup process."
  }
];

const popularArticles = [
  "Getting Started with RentMarket",
  "Understanding Rental Policies",
  "Payment and Billing Guide",
  "Vendor Guidelines and Best Practices",
  "Safety and Insurance Information",
  "Troubleshooting Common Issues"
];

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredFaqs = faqData.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-secondary-50">
      <Header />
      
      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-secondary-900 mb-4">
              Help Center
            </h1>
            <p className="text-lg text-secondary-600 mb-8">
              Find answers to common questions and get the help you need
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-secondary-400" />
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Quick Help Categories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <QuestionMarkCircleIcon className="w-12 h-12 mx-auto mb-4 text-primary-600" />
              <h3 className="text-xl font-semibold mb-2 text-secondary-900">Getting Started</h3>
              <p className="text-secondary-600 mb-4">
                New to RentMarket? Learn the basics of renting and listing products.
              </p>
              <Link 
                href="#faq" 
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                View FAQ →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 text-primary-600" />
              <h3 className="text-xl font-semibold mb-2 text-secondary-900">Policies & Terms</h3>
              <p className="text-secondary-600 mb-4">
                Understand our rental policies, terms of service, and guidelines.
              </p>
              <Link 
                href="/terms" 
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                Read Terms →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto mb-4 text-primary-600" />
              <h3 className="text-xl font-semibold mb-2 text-secondary-900">Contact Support</h3>
              <p className="text-secondary-600 mb-4">
                Need personal assistance? Our support team is here to help.
              </p>
              <Link 
                href="/contact" 
                className="text-primary-600 font-medium hover:text-primary-700"
              >
                Get Help →
              </Link>
            </div>
          </div>

          {/* FAQ Section */}
          <section id="faq" className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-secondary-900">
              Frequently Asked Questions
            </h2>
            <div className="max-w-4xl mx-auto space-y-4">
              {filteredFaqs.map((faq, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-secondary-200">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-secondary-50 transition-colors"
                  >
                    <span className="font-semibold text-secondary-900">{faq.question}</span>
                    {expandedFaq === index ? (
                      <ChevronUpIcon className="w-5 h-5 text-secondary-500" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-secondary-500" />
                    )}
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4">
                      <p className="text-secondary-700">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Popular Articles */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-secondary-900">
              Popular Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
              {popularArticles.map((article, index) => (
                <Link
                  key={index}
                  href="#"
                  className="flex items-center p-4 rounded-lg border-2 hover:shadow-sm transition-all border-secondary-300 bg-white"
                >
                  <QuestionMarkCircleIcon className="w-6 h-6 mr-3 flex-shrink-0 text-primary-600" />
                  <span className="font-medium text-secondary-900">
                    {article}
                  </span>
                </Link>
              ))}
            </div>
          </section>

          {/* Contact Support */}
          <section className="text-center py-16 rounded-2xl bg-secondary-400">
            <h2 className="text-3xl font-bold mb-4 text-white">
              Still Need Help?
            </h2>
            <p className="text-lg mb-8 text-secondary-100">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/contact"
                className="px-8 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-primary-700 text-white"
              >
                Contact Support
              </Link>
              <Link 
                href="mailto:support@rentmarket.com"
                className="px-8 py-3 rounded-lg font-semibold border-2 transition-colors hover:opacity-90 border-primary-700 text-primary-700 bg-transparent"
              >
                Email Us
              </Link>
            </div>
            <div className="mt-6 text-sm text-secondary-100">
              <p>📞 Phone: +1 (555) 123-4567</p>
              <p>🕒 Hours: Monday-Friday 9AM-6PM EST</p>
            </div>
          </section>

          {/* Quick Links */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-secondary-900">
              Quick Links
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Link 
                href="/terms"
                className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <DocumentTextIcon className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                <h3 className="font-semibold mb-2 text-secondary-900">Terms & Conditions</h3>
                <p className="text-sm text-secondary-600">Read our terms of service</p>
              </Link>
              <Link 
                href="/privacy"
                className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <ShieldCheckIcon className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                <h3 className="font-semibold mb-2 text-secondary-900">Privacy Policy</h3>
                <p className="text-sm text-secondary-600">How we protect your data</p>
              </Link>
              <Link 
                href="/contact"
                className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                <h3 className="font-semibold mb-2 text-secondary-900">Contact Us</h3>
                <p className="text-sm text-secondary-600">Get in touch with our team</p>
              </Link>
              <Link 
                href="/about"
                className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <QuestionMarkCircleIcon className="w-8 h-8 mx-auto mb-3 text-primary-600" />
                <h3 className="font-semibold mb-2 text-secondary-900">About RentMarket</h3>
                <p className="text-sm text-secondary-600">Learn more about us</p>
              </Link>
            </div>
          </section>
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