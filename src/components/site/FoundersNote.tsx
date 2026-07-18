import { Quote } from "lucide-react";
import founderImg from "@/assets/products/ubtan-2.webp";
import { useLang } from "@/contexts/LanguageContext";

export function FoundersNote() {
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";
  return (
    <section id="founder" className="relative overflow-hidden bg-warm py-20 md:py-28">
      <div className="absolute inset-0 bg-hero-radial opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 sm:px-6 md:grid-cols-[1fr_1.4fr] lg:px-8">
        <div className="relative">
          <div
            className="absolute -inset-4 rounded-[2rem] bg-sun opacity-25 blur-2xl"
            aria-hidden
          />
          <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-card shadow-glow">
            <img
              src={founderImg}
              alt="Kanti — traditional ubtan preparation"
              width={800}
              height={1000}
              loading="lazy"
              className="aspect-[4/5] w-full object-cover"
            />
          </div>
        </div>
        <div>
          <span
            className={`${body} text-xs font-semibold uppercase tracking-[0.22em] text-terracotta`}
          >
            {t("founder.eyebrow")}
          </span>
          <h2
            className={`mt-3 ${display} text-4xl font-700 leading-[1.1] text-foreground md:text-5xl`}
          >
            <span className="italic text-primary">{t("founder.title")}</span>
          </h2>
          <Quote className="mt-6 h-8 w-8 text-primary/40" />
          <div className={`mt-3 space-y-4 ${body} text-base leading-relaxed text-foreground/85`}>
            <p>{t("founder.p1")}</p>
            <p>{t("founder.p2")}</p>
            <p className={`${display} text-lg italic text-foreground`}>{t("founder.quote")}</p>
          </div>
          <div className="mt-7 flex items-center gap-3">
            <div className="h-px w-10 bg-primary/40" />
            <p className={`${display} text-base font-600 text-foreground`}>
              {t("founder.signoff")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
