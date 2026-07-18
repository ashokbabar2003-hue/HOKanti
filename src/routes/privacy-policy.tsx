import { createFileRoute } from "@tanstack/react-router";
import ogImage from "@/assets/og-image.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ShieldCheck, Eye, Database, Cookie, UserCheck } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — House Of Kanti" },
      {
        name: "description",
        content:
          "Learn how House Of Kanti collects, protects, and uses your personal information. Read our complete privacy and cookie policy.",
      },
      { property: "og:title", content: "Privacy Policy — House Of Kanti" },
      {
        property: "og:description",
        content: "Learn how House Of Kanti collects, protects, and uses your personal information.",
      },
      { property: "og:url", content: "https://houseofkanti.shop/privacy-policy" },
      { property: "og:image", content: `https://houseofkanti.shop${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: `https://houseofkanti.shop${ogImage}` },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.shop/privacy-policy" }],
  }),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const { lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  return (
    <div className={`min-h-screen bg-background ${body}`}>
      <Header />
      <main id="privacy-policy-main">
        {/* Banner */}
        <section
          className="relative overflow-hidden bg-warm py-16 md:py-20"
          id="privacy-policy-hero"
        >
          <div className="absolute inset-0 bg-hero-radial opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              Legal & Transparency
            </span>
            <h1
              className={`mt-3 ${display} text-4xl font-700 leading-tight text-foreground md:text-5xl`}
            >
              Privacy Policy
            </h1>
            <div className="mx-auto mt-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6 text-sm text-muted-foreground">
              <p>
                <strong className="text-foreground/80">Effective Date:</strong> 15 July 2026
              </p>
              <span className="hidden sm:inline text-border">•</span>
              <p>
                <strong className="text-foreground/80">Last Updated:</strong> 15 July 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section
          className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8"
          id="privacy-policy-content"
        >
          <div className="prose prose-stone max-w-none space-y-8 text-foreground/95">
            <div className="rounded-2xl bg-cream p-6 border border-border/40 flex items-start gap-4">
              <ShieldCheck className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h2 className={`${display} text-lg font-600 text-foreground`}>Our Commitment</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  At House Of Kanti, we value your trust and respect your privacy. This policy
                  details how we collect, handle, protect, and use your personal data when you visit
                  our website (https://houseofkanti.shop) and purchase our handcrafted herbal
                  skincare and wellness products.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <Eye className="h-5 w-5 shrink-0" /> 1. Information We Collect
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                To serve you effectively, we collect necessary personal information across various
                interactions on our platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  <strong className="text-foreground">Identity & Contact Data:</strong> Includes
                  your full name, email address, delivery addresses, phone number, and billing
                  details provided during checkout or account registration.
                </li>
                <li>
                  <strong className="text-foreground">Order & Transaction Data:</strong> Includes
                  product purchase history, order numbers, amounts paid, payment choices, and
                  customer support queries.
                </li>
                <li>
                  <strong className="text-foreground">Technical & Usage Data:</strong> IP addresses,
                  browser types, device profiles, page-load analytics, and cookie files necessary
                  for session management.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <Database className="h-5 w-5 shrink-0" /> 2. How We Use Your Information
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                We use your personal data strictly for operational, customer care, and regulatory
                purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  Processing, packing, and dispatching your orders of Ubtans, Face Packs, Kumkumadi
                  Oils, Ancient Glow Soaps, and Gift Hampers.
                </li>
                <li>Secure payment processing via our payment gateway partner, Razorpay.</li>
                <li>
                  Providing automated notifications regarding order numbers, tracking links, and
                  delivery status updates.
                </li>
                <li>
                  Maintaining and securing your customer account, wishlist, and preferred shipping
                  addresses in our secure Supabase database.
                </li>
                <li>
                  Complying with statutory tax, invoicing, and e-commerce regulations in India.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <Cookie className="h-5 w-5 shrink-0" /> 3. Cookies and Cart Persistence
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                Cookies are tiny files stored on your browser. House Of Kanti uses cookies to
                improve your user experience and maintain your shopping states:
              </p>
              <p className="text-sm md:text-base leading-relaxed">
                Specifically, we utilize client-side local storage and cookies to remember products
                inside your Cart and items in your Wishlist, as well as preserving active session
                states. You can block or disable cookies via your browser settings, though doing so
                will clear your cart items upon refreshing the page.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <UserCheck className="h-5 w-5 shrink-0" /> 4. Sharing Information with Partners
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                House Of Kanti does not sell, lease, or rent your personal data. We only share
                information with certified service providers who enable our operations,
                specifically:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  <strong className="text-foreground">Supabase:</strong> For secure database
                  hosting, user authentication, and profile records.
                </li>
                <li>
                  <strong className="text-foreground">Razorpay:</strong> To process secure online
                  transactions. We do not store credit card/UPI passwords or raw payment
                  credentials. Razorpay secures transactions using standard PCI-DSS protocols.
                </li>
                <li>
                  <strong className="text-foreground">Logistics & Delivery Partners:</strong>{" "}
                  Sharing your address, name, and phone number so they can deliver your parcels.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                5. Security and Data Protection
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                We use industry-standard security measures including HTTPS (SSL/TLS), secure payment
                processing via certified partners, controlled system access, and reasonable
                administrative and technical safeguards to protect your personal information.
                However, please understand that no electronic storage or transmission over the
                internet is 100% secure.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                6. Your Rights and Choices
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                We are committed to protecting your personal information and handling it responsibly
                in accordance with applicable Indian data protection laws. You maintain full rights
                to access, correct, or request the deletion of your personal details held on our
                website. To request data erasure, rectification, or restrict processing, please
                email us at{" "}
                <a
                  href="mailto:support@houseofkanti.shop"
                  className="text-primary hover:underline font-medium"
                >
                  support@houseofkanti.shop
                </a>
                .
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                7. Contact Information
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                If you have questions, grievances, or wish to clarify our privacy operations, you
                can reach us at:
              </p>
              <div className="bg-cream/40 rounded-xl p-5 border border-border/60 space-y-1.5 text-sm md:text-base">
                <p>
                  <strong className="text-foreground">Business Name:</strong> House Of Kanti
                </p>
                <p>
                  <strong className="text-foreground">Support Email:</strong>{" "}
                  <a
                    href="mailto:support@houseofkanti.shop"
                    className="text-primary hover:underline"
                  >
                    support@houseofkanti.shop
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Phone Support:</strong>{" "}
                  <a href="tel:+918806018688" className="text-primary hover:underline">
                    +91 88060 18688
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">WhatsApp Support:</strong>{" "}
                  <a
                    href="https://wa.me/918806018688"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    +91 88060 18688
                  </a>
                </p>
                <p>
                  <strong className="text-foreground">Business Hours:</strong> Monday – Saturday
                  (10:00 AM – 7:00 PM IST)
                </p>
                <p>
                  <strong className="text-foreground">Location:</strong> Pune, Maharashtra, India
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
