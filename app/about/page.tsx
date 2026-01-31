import Link from "next/link";
import { ShoppingCartIcon, HeartIcon, UserIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export default function AboutPage() {
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
              <Link href="/about" className="font-medium" style={{ color: "var(--deep-space-blue)" }}>
                About Us
              </Link>
              <Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: "var(--blue-slate)" }}>
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
            About RentMarket
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--dusty-denim)" }}>
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
              <h2 className="text-3xl font-bold mb-6" style={{ color: "var(--ink-black)" }}>Our Story</h2>
              <p className="text-lg mb-4" style={{ color: "var(--blue-slate)" }}>
                RentMarket was founded with a simple vision: to create a sustainable economy where people can access what they need without the burden of ownership. We believe that sharing resources benefits everyone - consumers save money, vendors grow their businesses, and our planet benefits from reduced waste.
              </p>
              <p className="text-lg mb-6" style={{ color: "var(--blue-slate)" }}>
                Our platform connects trusted vendors with customers looking for everything from professional equipment to party supplies, tools, and recreational gear. Every rental tells a story of smart consumption and community connection.
              </p>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "var(--deep-space-blue)" }}>500+</div>
                  <div className="text-sm" style={{ color: "var(--blue-slate)" }}>Vendors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "var(--deep-space-blue)" }}>10,000+</div>
                  <div className="text-sm" style={{ color: "var(--blue-slate)" }}>Products</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold" style={{ color: "var(--deep-space-blue)" }}>50,000+</div>
                  <div className="text-sm" style={{ color: "var(--blue-slate)" }}>Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="h-96 rounded-lg" style={{ backgroundColor: "var(--dusty-denim)" }}></div>
          </div>
        </section>

        {/* Our Mission */}
        <section className="mb-16 text-center">
          <h2 className="text-3xl font-bold mb-8" style={{ color: "var(--ink-black)" }}>Our Mission</h2>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl mb-8" style={{ color: "var(--blue-slate)" }}>
              To revolutionize how people access products by creating the world's most trusted and comprehensive rental marketplace, fostering sustainable consumption while empowering local businesses.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
                     style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  <CheckCircleIcon className="w-8 h-8" style={{ color: "var(--eggshell)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--ink-black)" }}>Sustainability</h3>
                <p style={{ color: "var(--blue-slate)" }}>
                  Reducing waste through shared economy principles
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
                     style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  <CheckCircleIcon className="w-8 h-8" style={{ color: "var(--eggshell)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--ink-black)" }}>Accessibility</h3>
                <p style={{ color: "var(--blue-slate)" }}>
                  Making products available to everyone, regardless of budget
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" 
                     style={{ backgroundColor: "var(--deep-space-blue)" }}>
                  <CheckCircleIcon className="w-8 h-8" style={{ color: "var(--eggshell)" }} />
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--ink-black)" }}>Community</h3>
                <p style={{ color: "var(--blue-slate)" }}>
                  Supporting local vendors and building connections
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How We Work */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--ink-black)" }}>How We Work</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--deep-space-blue)" }}>For Customers</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--deep-space-blue)" }} />
                  <span style={{ color: "var(--blue-slate)" }}>Browse thousands of products from verified vendors</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--deep-space-blue)" }} />
                  <span style={{ color: "var(--blue-slate)" }}>Choose flexible rental periods (hourly, daily, weekly)</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--deep-space-blue)" }} />
                  <span style={{ color: "var(--blue-slate)" }}>Secure payment processing and insurance coverage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--deep-space-blue)" }} />
                  <span style={{ color: "var(--blue-slate)" }}>24/7 customer support and dispute resolution</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--deep-space-blue)" }}>For Vendors</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--deep-space-blue)" }} />
                  <span style={{ color: "var(--blue-slate)" }}>Easy-to-use dashboard for inventory management</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--deep-space-blue)" }} />
                  <span style={{ color: "var(--blue-slate)" }}>Automated order processing and invoicing</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--deep-space-blue)" }} />
                  <span style={{ color: "var(--blue-slate)" }}>Marketing tools and analytics to grow your business</span>
                </li>
                <li className="flex items-start">
                  <CheckCircleIcon className="w-5 h-5 mt-1 mr-3 flex-shrink-0" style={{ color: "var(--deep-space-blue)" }} />
                  <span style={{ color: "var(--blue-slate)" }}>Competitive commission rates and fast payouts</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--ink-black)" }}>Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: "Sarah Johnson", role: "CEO & Founder", bio: "Former tech executive with 15 years in marketplace platforms" },
              { name: "Michael Chen", role: "CTO", bio: "Full-stack engineer passionate about sustainable technology solutions" },
              { name: "Emily Rodriguez", role: "Head of Operations", bio: "Operations expert focused on vendor success and customer satisfaction" }
            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="w-32 h-32 rounded-full mx-auto mb-4" style={{ backgroundColor: "var(--dusty-denim)" }}></div>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "var(--ink-black)" }}>{member.name}</h3>
                <p className="font-medium mb-2" style={{ color: "var(--deep-space-blue)" }}>{member.role}</p>
                <p className="text-sm" style={{ color: "var(--blue-slate)" }}>{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center py-16 rounded-2xl" style={{ backgroundColor: "var(--dusty-denim)" }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--eggshell)" }}>Ready to Get Started?</h2>
          <p className="text-lg mb-8" style={{ color: "var(--blue-slate)" }}>
            Join thousands of customers and vendors who trust RentMarket for their rental needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products"
              className="px-8 py-3 rounded-lg font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--deep-space-blue)", color: "var(--eggshell)" }}
            >
              Browse Products
            </Link>
            <Link 
              href="/contact"
              className="px-8 py-3 rounded-lg font-semibold border-2 transition-colors hover:opacity-90"
              style={{ borderColor: "var(--deep-space-blue)", color: "var(--deep-space-blue)", backgroundColor: "transparent" }}
            >
              Become a Vendor
            </Link>
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