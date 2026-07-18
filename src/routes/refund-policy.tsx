import { createFileRoute } from "@tanstack/react-router";
import ogImage from "@/assets/og-image.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RefreshCw, CheckCircle, AlertOctagon, Undo2, CreditCard } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Return and Refund Policy — House Of Kanti" },
      {
        name: "description",
        content:
          "Understand House Of Kanti's return, exchange, and refund rules. Read about our damaged products policy, cancellation window, and timelines.",
      },
      { property: "og:title", content: "Return and Refund Policy — House Of Kanti" },
      {
        property: "og:description",
        content:
          "Understand House Of Kanti's return, exchange, and refund rules. Read about our damaged products policy, cancellation window, and timelines.",
      },
      { property: "og:url", content: "https://houseofkanti.shop/refund-policy" },
      { property: "og:image", content: `https://houseofkanti.shop${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: `https://houseofkanti.shop${ogImage}` },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.shop/refund-policy" }],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  const { lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  return (
    <div className={`min-h-screen bg-background ${body}`}>
      <Header />
      <main id="refund-main">
        {/* Banner */}
        <section className="relative overflow-hidden bg-warm py-16 md:py-20" id="refund-hero">
          <div className="absolute inset-0 bg-hero-radial opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              Refund & Exchange Policies
            </span>
            <h1
              className={`mt-3 ${display} text-4xl font-700 leading-tight text-foreground md:text-5xl`}
            >
              Refund & Return Policy
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
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8" id="refund-content">
          <div className="prose prose-stone max-w-none space-y-8 text-foreground/95">
            <div className="rounded-2xl bg-cream p-6 border border-border/40 flex items-start gap-4">
              <RefreshCw className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h2 className={`${display} text-lg font-600 text-foreground`}>
                  Customer First Promise
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Our skincare range is freshly handcrafted, biological, and pure. We want you to
                  love your self-care rituals, but if any error occurs with your delivery, we are
                  here to rectify it swiftly and fairly.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <Undo2 className="h-5 w-5 shrink-0" /> 1. Cancellations
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                You can cancel your order within{" "}
                <strong className="text-foreground">12 hours</strong> of placing it or before the
                order gets packed and dispatched — whichever is earlier.
              </p>
              <p className="text-sm md:text-base leading-relaxed">
                To request a cancellation, contact us at{" "}
                <a href="mailto:support@houseofkanti.shop" className="text-primary hover:underline">
                  support@houseofkanti.shop
                </a>{" "}
                with your unique order number. Once canceled, online pre-paid amounts will be
                reversed to the original card or bank account.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <CheckCircle className="h-5 w-5 shrink-0" /> 2. Returns & Exchanges Window
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                Due to the natural, hygienic, and biological characteristics of our cosmetic
                skincare products (Ubtans, Soaps, Oils),{" "}
                <strong className="text-foreground">
                  we do not accept returns or exchanges for used or opened items
                </strong>
                .
              </p>
              <p className="text-sm md:text-base leading-relaxed">
                Returns or free replacements are strictly limited to the following exceptions within{" "}
                <strong className="text-foreground">7 days</strong> of delivery:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>You received a damaged or completely leaking bottle or jar.</li>
                <li>The product received has expired or has a broken safety seal.</li>
                <li>
                  You received an incorrect item (e.g., Kumkumadi Oil instead of Kumkumadi Gel).
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <AlertOctagon className="h-5 w-5 shrink-0" /> 3. Damaged Products Reporting
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                If you receive a damaged, defective, incorrect, or missing item, please contact us
                within 24 hours of delivery and provide clear photographs and, where possible, an
                unboxing video to help us investigate your claim.
              </p>
              <p className="text-sm md:text-base leading-relaxed">
                Email details of your claim along with your Order ID to{" "}
                <a
                  href="mailto:support@houseofkanti.shop"
                  className="text-primary hover:underline font-semibold"
                >
                  support@houseofkanti.shop
                </a>
                . Upon validation, we will dispatch a brand-new replacement at zero cost, or issue a
                full refund to you.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                4. Policy Exclusions
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                We do not issue refunds, returns, or replacements for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  Products purchased during special promotional seasonal sales or custom clearance.
                </li>
                <li>
                  Personal sensory preferences (e.g. you do not prefer the earthy aroma of natural
                  turmeric/sandalwood, or the color changed slightly over time). Since our
                  ingredients are 100% natural, color/scent fluctuations are organic.
                </li>
                <li>
                  Customized Herbal Gift Hampers assembled specifically for your corporate or
                  wedding return gifts.
                </li>
                <li>
                  Issues caused due to client-side storage, such as keeping products in direct humid
                  conditions, causing natural oxidation.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <CreditCard className="h-5 w-5 shrink-0" /> 5. Refund Processing Timelines
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                Once a refund has been approved by our audit team:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  <strong className="text-foreground">Online Pre-Paid Orders:</strong> The refund is
                  reversed directly via our partner Razorpay to your original bank, card, or UPI
                  account. It typically reflects in your statement within{" "}
                  <strong className="text-foreground">5 to 7 business days</strong> depending on
                  your banking institution.
                </li>
                <li>
                  <strong className="text-foreground">Cash on Delivery (COD):</strong> We will ask
                  you to share your UPI ID or bank account details securely via support email. Once
                  received, the refund is initiated via secure bank transfer within{" "}
                  <strong className="text-foreground">3 to 5 business days</strong>.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                6. Contact Customer Care
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                If you need any guidance or want to check refund progress:
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
