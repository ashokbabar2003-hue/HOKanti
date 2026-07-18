import heroImg from "@/assets/products/ubtan-1.webp";
import heroVideo from "@/assets/kanti-hero.mp4";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLang } from "@/contexts/LanguageContext";
import { Link } from "@tanstack/react-router";

export function Hero() {
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  return (
    <section className="relative overflow-hidden">
      {/* Full-bleed background video */}
      <video
        src={heroVideo}
        poster={heroImg}
        autoPlay
        muted
        loop
        playsInline
        aria-label="Kanti herbal skincare"
        className="absolute inset-0 h-full w-full object-cover"
      />
      {/* Gradient overlay for text readability */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/30"
        aria-hidden
      />
      <div className="absolute inset-0 bg-hero-radial" aria-hidden />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 md:grid-cols-2 md:py-32 lg:px-8">
        <div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-primary backdrop-blur ${body}`}
          >
            <Sparkles className="h-3.5 w-3.5" /> {t("hero.badge")}
          </span>
          <h1
            className={`mt-6 ${display} text-[clamp(1.65rem,5.5vw,3.5rem)] font-700 leading-[1.1] text-foreground`}
          >
            {t("hero.title.1")}{" "}
            <span className="italic text-primary">{t("hero.title.beauty")}</span>
            {lang === "en" && (
              <>
                , <br />
                <span className="text-terracotta">
                  from {t("hero.title.tradition").toLowerCase()}
                </span>
                .
              </>
            )}
            {lang === "mr" && (
              <>
                ,<br />
                <span className="text-terracotta">{t("hero.title.tradition")}</span>.
              </>
            )}
          </h1>
          <p className={`mt-6 max-w-lg ${body} text-lg leading-relaxed text-muted-foreground`}>
            {t("hero.subtitle")}
          </p>
          <div className="mt-9 flex flex-col min-[390px]:flex-row items-stretch min-[390px]:items-center gap-4">
            <Link
              to="/"
              hash="products"
              className={`group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow transition hover:translate-y-[-1px] hover:bg-primary/90 w-full min-[390px]:w-auto ${body}`}
            >
              {t("hero.cta.shop")}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/"
              hash="hampers"
              className={`inline-flex items-center justify-center gap-2 rounded-full border border-primary/30 bg-background/60 px-7 py-3.5 text-sm font-semibold text-primary backdrop-blur transition hover:bg-background w-full min-[390px]:w-auto ${body}`}
            >
              {t("hero.cta.hampers")}
            </Link>
          </div>
          <div
            className={`mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-[clamp(0.7rem,1.5vw,0.75rem)] uppercase tracking-wider text-muted-foreground ${body}`}
          >
            <span>{t("hero.tag.herbal")}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>{t("hero.tag.handmade")}</span>
            <span className="h-1 w-1 rounded-full bg-muted-foreground/50" />
            <span>{t("hero.tag.cruelty")}</span>
          </div>
        </div>
        <div className="relative hidden md:block"></div>
      </div>
    </section>
  );
}
