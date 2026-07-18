import { createFileRoute } from "@tanstack/react-router";
import ogImage from "@/assets/og-image.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Scale, FileText, ShoppingBag, ShieldAlert, Heart } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export const Route = createFileRoute("/terms-and-conditions")({
  head: () => ({
    meta: [
      { title: "Terms and Conditions — House Of Kanti" },
      {
        name: "description",
        content:
          "Read the terms and conditions for using the House Of Kanti website and purchasing our handcrafted natural skincare products.",
      },
      { property: "og:title", content: "Terms and Conditions — House Of Kanti" },
      {
        property: "og:description",
        content:
          "Read the terms and conditions for using the House Of Kanti website and purchasing our handcrafted natural skincare products.",
      },
      { property: "og:url", content: "https://houseofkanti.shop/terms-and-conditions" },
      { property: "og:image", content: `https://houseofkanti.shop${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: `https://houseofkanti.shop${ogImage}` },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.shop/terms-and-conditions" }],
  }),
  component: TermsAndConditionsPage,
});

function TermsAndConditionsPage() {
  const { lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  return (
    <div className={`min-h-screen bg-background ${body}`}>
      <Header />
      <main id="terms-main">
        {/* Banner */}
        <section className="relative overflow-hidden bg-warm py-16 md:py-20" id="terms-hero">
          <div className="absolute inset-0 bg-hero-radial opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              Agreement of Service
            </span>
            <h1
              className={`mt-3 ${display} text-4xl font-700 leading-tight text-foreground md:text-5xl`}
            >
              Terms and Conditions
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
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8" id="terms-content">
          <div className="prose prose-stone max-w-none space-y-8 text-foreground/95">
            <div className="rounded-2xl bg-cream p-6 border border-border/40 flex items-start gap-4">
              <Scale className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h2 className={`${display} text-lg font-600 text-foreground`}>
                  Terms of Website Use
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  By visiting, accessing, or placing orders on https://houseofkanti.shop, you agree
                  to comply with and be bound by the following Terms and Conditions, which together
                  with our Privacy Policy govern House Of Kanti's relationship with you.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <FileText className="h-5 w-5 shrink-0" /> 1. Eligibility & User Accounts
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                To purchase items or create an account, you must be at least 18 years of age or
                accessing under the supervision of a parent or guardian. You are solely responsible
                for protecting your account credentials and password. All information provided to us
                must be accurate and truthful. Providing incorrect shipping details can result in
                non-delivery, for which we hold no liability.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <ShoppingBag className="h-5 w-5 shrink-0" /> 2. Ordering, Pricing & Payments
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                All prices listed on House Of Kanti are in Indian Rupees (INR) and are inclusive of
                applicable taxes unless stated otherwise.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  <strong className="text-foreground">Order Placement:</strong> When you place an
                  order, you will receive an automatic unique order number. This order serves as an
                  offer to purchase, subject to product availability and pricing validation.
                </li>
                <li>
                  <strong className="text-foreground">Secure Payments:</strong> We offer secure
                  online payment modes via Credit Card, Debit Card, Net Banking, and UPI powered by
                  Razorpay. Additionally, Cash on Delivery (COD) is available for selected PIN
                  codes.
                </li>
                <li>
                  <strong className="text-foreground">Price Protection:</strong> We employ real-time
                  pricing verification. If any price tampering or malicious coupon application is
                  detected at checkout, your order will be flagged and canceled.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <Heart className="h-5 w-5 shrink-0" /> 3. Herbal Products Disclaimer
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                House Of Kanti specializes in handcrafted, small-batch Ayurvedic skincare products,
                including Ubtan, Face Packs, Kumkumadi Oils, and Ancient Glow Soaps.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  <strong className="text-foreground">Natural Variations:</strong> Since we use
                  organic clays, fresh botanicals, and herbal extracts, subtle variations in color,
                  consistency, or fragrance are completely natural and are not deemed defects.
                </li>
                <li>
                  <strong className="text-foreground">Patch Test Requirement:</strong> Although our
                  items are paraben-free, chemical-free, and natural, certain individuals may
                  experience herbal sensitivities. We strongly urge you to read ingredients
                  thoroughly and perform a 24-hour patch test before applying products widely.
                </li>
                <li>
                  <strong className="text-foreground">No Medical Claims:</strong> Our descriptions
                  are based on traditional Ayurvedic remedies and references. They do not constitute
                  professional medical advice or attempt to cure specific chronic dermatological
                  pathologies.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <ShieldAlert className="h-5 w-5 shrink-0" /> 4. Intellectual Property
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                All contents visible on this website, including logo, text descriptions, images,
                formulas, and visual media are the intellectual property of House Of Kanti. You are
                strictly prohibited from replicating, modifying, republishing, or distributing any
                materials from this domain for commercial use without express prior written consent
                from us.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                5. Limitation of Liability
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                House Of Kanti, its founders, and affiliates shall not be held liable for any
                direct, indirect, incidental, or consequential damages resulting from the use or
                inability to use our products, packaging, website, or services. We do not guarantee
                uninterrupted server runtimes or error-free access, though we maintain every
                safeguard to secure the platform.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                6. Governing Law & Jurisdiction
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                These terms shall be governed by, interpreted, and enforced in accordance with the
                laws of India. Any disputes or litigation arising out of or in connection with the
                purchase of goods, website usage, or general policies shall be subject to the
                exclusive jurisdiction of the competent courts in Pune, Maharashtra, India.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                7. Contact & Support
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                For complete support, grievances, or queries regarding our terms of service, please
                reach out to us:
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
