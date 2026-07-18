import { createFileRoute } from "@tanstack/react-router";
import ogImage from "@/assets/og-image.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Truck, Clock, MapPin, AlertCircle, PhoneCall } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({
    meta: [
      { title: "Shipping Policy — House Of Kanti" },
      {
        name: "description",
        content:
          "Check shipping charges, delivery times, and order tracking details across India for House Of Kanti skincare products.",
      },
      { property: "og:title", content: "Shipping Policy — House Of Kanti" },
      {
        property: "og:description",
        content:
          "Check shipping charges, delivery times, and order tracking details across India for House Of Kanti skincare products.",
      },
      { property: "og:url", content: "https://houseofkanti.shop/shipping-policy" },
      { property: "og:image", content: `https://houseofkanti.shop${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: `https://houseofkanti.shop${ogImage}` },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.shop/shipping-policy" }],
  }),
  component: ShippingPolicyPage,
});

function ShippingPolicyPage() {
  const { lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  return (
    <div className={`min-h-screen bg-background ${body}`}>
      <Header />
      <main id="shipping-main">
        {/* Banner */}
        <section className="relative overflow-hidden bg-warm py-16 md:py-20" id="shipping-hero">
          <div className="absolute inset-0 bg-hero-radial opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              Logistics & Delivery
            </span>
            <h1
              className={`mt-3 ${display} text-4xl font-700 leading-tight text-foreground md:text-5xl`}
            >
              Shipping Policy
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
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8" id="shipping-content">
          <div className="prose prose-stone max-w-none space-y-8 text-foreground/95">
            <div className="rounded-2xl bg-cream p-6 border border-border/40 flex items-start gap-4">
              <Truck className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h2 className={`${display} text-lg font-600 text-foreground`}>
                  Safe & Reliable Delivery
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  At House Of Kanti, each order is packed with utmost care using eco-conscious
                  materials. We partner with India's leading courier networks (such as Shiprocket,
                  Delhivery, Blue Dart, and DTDC) to deliver fresh skincare right to your doorstep.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <MapPin className="h-5 w-5 shrink-0" /> 1. Delivery Zones & Coverages
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                Currently, we ship exclusively{" "}
                <strong className="text-foreground">all over India</strong>, covering over 19,000
                PIN codes across states and union territories. At this moment, we do not support
                direct international checkouts. For international corporate gifts or bulk hampers,
                please reach out to us manually.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <Clock className="h-5 w-5 shrink-0" /> 2. Shipping Charges
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                Our shipping prices are transparently displayed during checkout:
              </p>
              <div className="bg-cream/30 border border-border/60 rounded-xl overflow-hidden text-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-cream border-b border-border/60 font-semibold text-foreground">
                      <th className="p-3">Order Total</th>
                      <th className="p-3">Shipping Charge</th>
                      <th className="p-3">Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/40">
                      <td className="p-3">₹999 and above</td>
                      <td className="p-3 font-semibold text-primary">FREE Shipping</td>
                      <td className="p-3">Express Delivery</td>
                    </tr>
                    <tr>
                      <td className="p-3">Below ₹999</td>
                      <td className="p-3">₹80</td>
                      <td className="p-3">Standard Delivery</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">
                *Cash on Delivery (COD) carries a convenience fee of ₹50 to cover additional
                logistics fees.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                3. Dispatch & Delivery Timelines
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                We craft our products (like Ubtan, face oil, ancient glow soaps) in small, hygienic
                hand-made batches. This affects our processing times:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  <strong className="text-foreground">Processing Time:</strong> Orders are
                  dispatched within <strong className="text-foreground">24 to 48 hours</strong> of
                  payment confirmation.
                </li>
                <li>
                  <strong className="text-foreground">Metro Cities:</strong> Typically delivered
                  within <strong className="text-foreground">2 to 4 business days</strong> after
                  shipment.
                </li>
                <li>
                  <strong className="text-foreground">Rest of India:</strong> Typically delivered
                  within <strong className="text-foreground">4 to 7 business days</strong> after
                  shipment.
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <AlertCircle className="h-5 w-5 shrink-0" /> 4. Shipping Delays & Tracking
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                While we process and ship all parcels within 48 hours, delays can occasionally occur
                due to weather anomalies, festival spikes, regional restrictions, or courier routing
                issues.
              </p>
              <p className="text-sm md:text-base leading-relaxed">
                Once dispatched, we will send your tracking link and details via your registered
                email or phone. You can trace your package progress in real-time. If your package
                does not arrive within 8 business days, kindly write to us immediately.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                5. Customer Responsibility
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                To guarantee smooth and punctual deliveries:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>
                  Verify your full shipping address, landmark, and exact PIN code during checkout.
                </li>
                <li>
                  Ensure a reachable mobile number is provided so the courier agent can reach you
                  upon arrival.
                </li>
                <li>Ensure someone is available to collect or sign for the package.</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary flex items-center gap-2.5 border-b border-border/60 pb-2`}
              >
                <PhoneCall className="h-5 w-5 shrink-0" /> 6. Need Shipping Help?
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                If you need to change a shipping address (only possible before dispatch) or resolve
                delivery exceptions, please contact our support team immediately:
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
