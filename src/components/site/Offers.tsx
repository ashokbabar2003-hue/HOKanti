import facemaskOffer from "@/assets/offers/facemask-offer.webp";
import hamperOffer from "@/assets/hamper.webp";
import { Sparkles } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { Link } from "@tanstack/react-router";

export function Offers() {
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";
  return (
    <section id="offers" className="relative bg-warm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className={`inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary ${body}`}
          >
            <Sparkles className="h-3.5 w-3.5" /> {t("offers.eyebrow")}
          </span>
          <h2
            className={`mt-4 ${display} text-4xl font-700 leading-[1.1] text-foreground md:text-5xl`}
          >
            {t("offers.title.1")} <span className="italic text-primary">{t("offers.title.2")}</span>
          </h2>
          <p className={`mt-3 ${body} text-muted-foreground`}>{t("offers.subtitle")}</p>
        </div>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          <Link
            to="/"
            hash="products"
            className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow"
          >
            <img
              src={facemaskOffer}
              alt="Kanti Herbal Summer Face Mask intro offer"
              loading="lazy"
              className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </Link>
          <Link
            to="/"
            hash="hampers"
            className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow"
          >
            <img
              src={hamperOffer}
              alt="Kanti gift hamper — flat 25% off"
              loading="lazy"
              className="w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
