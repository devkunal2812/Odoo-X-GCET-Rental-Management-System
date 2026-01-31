import * as React from "react";
import Link from "next/link";
import Header from "../../components/Header";
import { CheckCircleIcon } from "@heroicons/react/24/outline";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-secondary-50">
      <Header currentPage="about" />

      {/* Hero Section */}
      <section className="py-20 bg-secondary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            About RentMarket
          </h1>
          <p className="text-xl max-w-3xl mx-auto text-secondary-200">
            Connecting people with the things they need, when they need them, through our trusted multi-vendor rental marketplace.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Our Story */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6 text-secondary-900">Our Story</h2>
              <p className="text-lg mb-4 text-secondary-700">
                RentMarket was founded with a simple vision: to create a sustainable economy where people can access what they need without the burden of ownership. We believe that sharing resources benefits everyone - consumers save money, vendors grow their businesses, and our planet benefits from reduced waste.
              </p>
              <p className="text-lg mb-6 text-secondary-700">
                Our platform connects trusted vendors with customers looking for everything from professional equipment to party supplies, tools, and recreational gear. Every rental tells a story of smart consumption and community connection.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">500+</div>
                  <div className="text-sm text-secondary-600">Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">10,000+</div>
                  <div className="text-sm text-secondary-600">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600">50,000+</div>
                  <div className="text-sm text-secondary-600">Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="h-96 rounded-lg bg-secondary-300"></div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-8 text-secondary-900">Our Mission</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl mb-8 text-secondary-700">
              To revolutionize how people access products by creating the world's most trusted and comprehensive rental marketplace, fostering sustainable consumption while empowering local businesses.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary-600">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-secondary-900">Sustainability</h3>
                <p className="text-secondary-600">
                  Reducing waste through shared economy principles
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary-600">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-secondary-900">Accessibility</h3>
                <p className="text-secondary-600">
                  Making products available to everyone, regardless of budget
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-primary-600">
                  <CheckCircleIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-secondary-900">Community</h3>
                <p className="text-secondary-600">
                  Supporting local vendors and building connections
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-secondary-900">How We Work</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary-700">For Customers</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                  <span className="text-secondary-700">Browse thousands of products from verified vendors</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                  <span className="text-secondary-700">Choose flexible rental periods (hourly, daily, weekly)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                  <span className="text-secondary-700">Secure payment processing and insurance coverage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                  <span className="text-secondary-700">24/7 customer support and dispute resolution</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4 text-primary-700">For Vendors</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                  <span className="text-secondary-700">Easy-to-use dashboard for inventory management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                  <span className="text-secondary-700">Automated order processing and invoicing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                  <span className="text-secondary-700">Marketing tools and analytics to grow your business</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0 text-primary-600" />
                  <span className="text-secondary-700">Competitive commission rates and fast payouts</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12 text-secondary-900">Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "CEO & Founder", bio: "Former tech executive with 15 years in marketplace platforms" },
              { name: "Michael Chen", role: "CTO", bio: "Full-stack engineer passionate about sustainable technology solutions" },
              { name: "Emily Rodriguez", role: "Head of Operations", bio: "Operations expert focused on vendor success and customer satisfaction" }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-secondary-400"></div>
                <h3 className="text-lg font-semibold mb-1 text-secondary-900">{member.name}</h3>
                <p className="font-medium mb-2 text-primary-700">{member.role}</p>
                <p className="text-sm text-secondary-600">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 rounded-2xl bg-secondary-400">
          <h2 className="text-3xl font-bold mb-4 text-white">Ready to Get Started?</h2>
          <p className="text-lg mb-8 text-secondary-100">
            Join thousands of customers and vendors who trust RentMarket for their rental needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className="px-8 py-3 rounded-lg font-semibold transition-colors hover:opacity-90 bg-primary-700 text-white"
            >
              Browse Products
            </Link>
            <Link 
              href="/contact"
              className="px-8 py-3 rounded-lg font-semibold border-2 transition-colors hover:opacity-90 border-primary-700 text-primary-700 bg-transparent"
            >
              Become a Vendor
            </Link>
          </div>
        </section>
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
