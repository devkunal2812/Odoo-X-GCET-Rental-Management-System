import Link from "next/link";
import { 
  ShoppingCartIcon, 
  HeartIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CreditCardIcon,
  TruckIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";

export default function HelpPage() {
  const helpCategories = [
    {
      icon: QuestionMarkCircleIcon,
      title: "Getting Started",
      description: "Learn the basics of using RentMarket",
      articles: [
        "How to create an account",
        "Finding and renting products",
        "Understanding rental periods",
        "Setting up your profile"
      ]
    },
    {
      icon: CreditCardIcon,
      title: "Payments & Billing",
      description: "Payment methods, billing, and refunds",
      articles: [
        "Accepted payment methods",
        "Understanding charges",
        "Refund policy",
        "Billing disputes"
      ]
    },
    {
      icon: TruckIcon,
      title: "Delivery & Pickup",
      description: "Delivery options and pickup procedures",
      articles: [
        "Delivery areas and fees",
        "Pickup from vendor locations",
        "Scheduling deliveries",
        "Return procedures"
      ]
    },
    {
      icon: ShieldCheckIcon,
      title: "Safety & Insurance",
      description: "Product safety and damage protection",
      articles: [
        "Damage protection policy",
        "Reporting damaged items",
        "Safety guidelines",
        "Insurance coverage"
      ]
    },
    {
      icon: DocumentTextIcon,
      title: "Orders & Rentals",
      description: "Managing your orders and rentals",
      articles: [
        "Modifying rental periods",
        "Cancellation policy",
        "Order status tracking",
        "Rental extensions"
      ]
    },
    {
      icon: ChatBubbleLeftRightIcon,
      title: "Vendor Information",
      description: "Information for vendors and partners",
      articles: [
        "Becoming a vendor",
        "Vendor requirements",
        "Commission structure",
        "Vendor dashboard guide"
      ]
    }
  ];

  const popularArticles = [
    "How do I rent a product?",
    "What if a product is damaged during rental?",
    "How do I cancel or modify my rental?",
    "What payment methods do you accept?",
    "How does delivery and pickup work?",
    "How do I become a vendor?",
    "What is your refund policy?",
    "How do I contact customer support?"
  ];

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
            Help Center
          </h1>
          <p className="text-xl max-w-3xl mx-auto mb-8" style={{ color: "var(--dusty-denim)" }}>
            Find answers to your questions and get the help you need.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <MagnifyingGlassIcon className="h-6 w-6 absolute left-4 top-1/2 transform -translate-y-1/2" 
                                   style={{ color: "var(--blue-slate)" }} />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-4 rounded-lg text-lg border-2 focus:outline-none focus:ring-2 transition-colors"
                style={{ 
                  borderColor: "var(--dusty-denim)",
                  color: "var(--ink-black)",
                  backgroundColor: "var(--eggshell)"
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Help Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--ink-black)" }}>
            Browse by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {helpCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" 
                       style={{ backgroundColor: "var(--deep-space-blue)" }}>
                    <category.icon className="w-6 h-6" style={{ color: "var(--eggshell)" }} />
                  </div>
                  <h3 className="text-xl font-semibold" style={{ color: "var(--ink-black)" }}>
                    {category.title}
                  </h3>
                </div>
                <p className="mb-4" style={{ color: "var(--blue-slate)" }}>
                  {category.description}
                </p>
                <ul className="space-y-2">
                  {category.articles.map((article, articleIndex) => (
                    <li key={articleIndex}>
                      <Link 
                        href={`/help/article/${article.toLowerCase().replace(/\s+/g, '-')}`}
                        className="text-sm hover:opacity-80 transition-opacity"
                        style={{ color: "var(--deep-space-blue)" }}
                      >
                        → {article}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Articles */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12" style={{ color: "var(--ink-black)" }}>
            Popular Articles
          </h2>
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {popularArticles.map((article, index) => (
                <Link
                  key={index}
                  href={`/help/article/${article.toLowerCase().replace(/\s+/g, '-').replace(/\?/g, '')}`}
                  className="flex items-center p-4 rounded-lg border-2 hover:shadow-sm transition-all"
                  style={{ 
                    borderColor: "var(--dusty-denim)",
                    backgroundColor: "var(--eggshell)"
                  }}
                >
                  <QuestionMarkCircleIcon className="w-6 h-6 mr-3 flex-shrink-0" 
                                          style={{ color: "var(--deep-space-blue)" }} />
                  <span className="font-medium" style={{ color: "var(--ink-black)" }}>
                    {article}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <section className="text-center py-16 rounded-2xl" style={{ backgroundColor: "var(--dusty-denim)" }}>
          <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--eggshell)" }}>
            Still Need Help?
          </h2>
          <p className="text-lg mb-8" style={{ color: "var(--blue-slate)" }}>
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="px-8 py-3 rounded-lg font-semibold transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--deep-space-blue)", color: "var(--eggshell)" }}
            >
              Contact Support
            </Link>
            <Link 
              href="mailto:support@rentmarket.com"
              className="px-8 py-3 rounded-lg font-semibold border-2 transition-colors hover:opacity-90"
              style={{ borderColor: "var(--deep-space-blue)", color: "var(--deep-space-blue)", backgroundColor: "transparent" }}
            >
              Email Us
            </Link>
          </div>
          <div className="mt-6 text-sm" style={{ color: "var(--blue-slate)" }}>
            <p>📞 Phone: +1 (555) 123-4567</p>
            <p>🕒 Hours: Monday-Friday 9AM-6PM EST</p>
          </div>
        </section>

        {/* Quick Links */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8" style={{ color: "var(--ink-black)" }}>
            Quick Links
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Link 
              href="/terms"
              className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <DocumentTextIcon className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--deep-space-blue)" }} />
              <h3 className="font-semibold mb-2" style={{ color: "var(--ink-black)" }}>Terms & Conditions</h3>
              <p className="text-sm" style={{ color: "var(--blue-slate)" }}>Read our terms of service</p>
            </Link>
            <Link 
              href="/privacy"
              className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ShieldCheckIcon className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--deep-space-blue)" }} />
              <h3 className="font-semibold mb-2" style={{ color: "var(--ink-black)" }}>Privacy Policy</h3>
              <p className="text-sm" style={{ color: "var(--blue-slate)" }}>How we protect your data</p>
            </Link>
            <Link 
              href="/contact"
              className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--deep-space-blue)" }} />
              <h3 className="font-semibold mb-2" style={{ color: "var(--ink-black)" }}>Contact Us</h3>
              <p className="text-sm" style={{ color: "var(--blue-slate)" }}>Get in touch with our team</p>
            </Link>
            <Link 
              href="/about"
              className="text-center p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <QuestionMarkCircleIcon className="w-8 h-8 mx-auto mb-3" style={{ color: "var(--deep-space-blue)" }} />
              <h3 className="font-semibold mb-2" style={{ color: "var(--ink-black)" }}>About RentMarket</h3>
              <p className="text-sm" style={{ color: "var(--blue-slate)" }}>Learn more about us</p>
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