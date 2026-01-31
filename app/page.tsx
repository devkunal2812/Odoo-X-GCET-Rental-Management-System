import Link from "next/link";
import { ShoppingCartIcon, HeartIcon, UserIcon } from "@heroicons/react/24/outline";

export default function Home() {
  return (
    <>
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
        <section className="text-white py-20" style={{ backgroundColor: "var(--deep-space-blue)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: "var(--eggshell)" }}>
              Rent Everything You Need
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto" style={{ color: "var(--dusty-denim)" }}>
              Discover thousands of products from trusted vendors. Rent by the hour, day, or week.
            </p>
            <Link
              href="/products"
              className="px-8 py-3 rounded-lg font-semibold text-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--dusty-denim)", color: "var(--ink-black)" }}
            >
              Browse Products
            </Link>
          </div>
        </section>

        {/* Featured Categories */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--ink-black)" }}>Popular Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[
                { name: "Electronics", image: "/api/placeholder/300/200", count: "150+ items" },
                { name: "Tools & Equipment", image: "/api/placeholder/300/200", count: "200+ items" },
                { name: "Party Supplies", image: "/api/placeholder/300/200", count: "80+ items" },
                { name: "Sports Equipment", image: "/api/placeholder/300/200", count: "120+ items" },
              ].map((category) => (
                <Link
                  key={category.name}
                  href={`/products?category=${category.name.toLowerCase()}`}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-48" style={{ backgroundColor: "var(--dusty-denim)" }}></div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg" style={{ color: "var(--ink-black)" }}>{category.name}</h3>
                    <p style={{ color: "var(--blue-slate)" }}>{category.count}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16" style={{ backgroundColor: "var(--dusty-denim)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--eggshell)" }}>How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Browse & Select",
                  description: "Find the perfect product from our wide selection of rental items."
                },
                {
                  step: "2",
                  title: "Choose Duration",
                  description: "Select your rental period - hourly, daily, or weekly options available."
                },
                {
                  step: "3",
                  title: "Rent & Enjoy",
                  description: "Complete your order and enjoy your rental. Return when you're done."
                }
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4"
                    style={{ backgroundColor: "var(--deep-space-blue)", color: "var(--eggshell)" }}>
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--eggshell)" }}>{item.title}</h3>
                  <p style={{ color: "var(--blue-slate)" }}>{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
    </>
  );
}