import { createFileRoute } from "@tanstack/react-router";
import ogImage from "@/assets/og-image.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Info, HelpCircle } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { ProductSafety } from "@/components/site/ProductSafety";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — House Of Kanti" },
      {
        name: "description",
        content:
          "Read House Of Kanti's product information and medical disclaimer. Learn about skin variations, patch tests, and Ayurvedic remedial guidance.",
      },
      { property: "og:title", content: "Disclaimer — House Of Kanti" },
      {
        property: "og:description",
        content:
          "Read House Of Kanti's product information and medical disclaimer. Learn about skin variations and patch tests.",
      },
      { property: "og:url", content: "https://houseofkanti.shop/disclaimer" },
      { property: "og:image", content: `https://houseofkanti.shop${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:image", content: `https://houseofkanti.shop${ogImage}` },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.shop/disclaimer" }],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  const { lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  return (
    <div className={`min-h-screen bg-background ${body}`}>
      <Header />
      <main id="disclaimer-main">
        {/* Banner */}
        <section className="relative overflow-hidden bg-warm py-16 md:py-20" id="disclaimer-hero">
          <div className="absolute inset-0 bg-hero-radial opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              Usage & Medical Guidelines
            </span>
            <h1
              className={`mt-3 ${display} text-4xl font-700 leading-tight text-foreground md:text-5xl`}
            >
              Disclaimer
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
        <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8" id="disclaimer-content">
          <div className="prose prose-stone max-w-none space-y-8 text-foreground/95">
            <div className="rounded-2xl bg-cream p-6 border border-border/40 flex items-start gap-4">
              <Info className="h-6 w-6 text-primary shrink-0 mt-1" />
              <div>
                <h2 className={`${display} text-lg font-600 text-foreground`}>
                  Educational & Remedial Clarification
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  The descriptions, ingredients profiles, and general historical Ayurvedic
                  references on https://houseofkanti.shop are offered purely for informational and
                  educational purposes. By visiting this site, you acknowledge and agree to the
                  guidelines detailed below.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                1. Educational Purposes Only
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                The product information, traditional Ayurvedic benefits, and general skincare advice
                provided by House Of Kanti do not constitute professional medical advice, clinical
                diagnosis, or specialized treatment. Our statements have not been evaluated by any
                governmental health authority.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                2. No Medical Claims
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                Our cosmetic products (including herbal Ubtans, Kumkumadi Oils, Face Packs, and
                hand-milled Soaps) are not formulated, designed, or licensed to diagnose, treat,
                prevent, or cure any dermatological disease, chronic skin conditions, or systemic
                illnesses. Please do not substitute our remedies for qualified medical supervision
                or treatment.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                3. Individual Variation & Results
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                Because skin types, genetic compositions, environmental exposures, and lifestyle
                factors vary drastically between individuals, we cannot guarantee identical results.
                Actual skin outcomes, texture improvements, and glow retention will differ from user
                to user. Testimonials, product reviews, and customer experiences reflect personal
                results and do not represent guaranteed benchmarks.
              </p>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                4. Physician Consultation & Product Safety
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                If you have active skin pathologies, extreme sensitivity, acne vulgaris, dermatitis,
                psoriasis, or are currently under a clinical dermatological prescription, we
                strongly advise you to consult a licensed physician or dermatologist before
                incorporating new herbal products into your daily care routine.
              </p>

              {/* Injecting the reusable safety card */}
              <div className="my-6">
                <ProductSafety />
              </div>
            </div>

            <div className="space-y-4">
              <h2
                className={`${display} text-2xl font-600 text-primary border-b border-border/60 pb-2`}
              >
                5. Contact & Support
              </h2>
              <p className="text-sm md:text-base leading-relaxed">
                If you wish to clarify any ingredient, formulation, or product safety query, please
                contact our support desk:
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
