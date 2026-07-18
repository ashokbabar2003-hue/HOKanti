import { Leaf, Sparkles, HandHeart, FlaskConical, ShieldCheck, Recycle } from "lucide-react";
import { useLang, type DictKey } from "@/contexts/LanguageContext";
import rotatingVideo from "@/assets/kanti-hero.mp4";
import productUbtan from "@/assets/product-ubtan.webp";

const reasons: { icon: typeof Leaf; t: DictKey; d: DictKey }[] = [
  { icon: Leaf, t: "why.r1.t", d: "why.r1.d" },
  { icon: HandHeart, t: "why.r2.t", d: "why.r2.d" },
  { icon: FlaskConical, t: "why.r3.t", d: "why.r3.d" },
  { icon: ShieldCheck, t: "why.r4.t", d: "why.r4.d" },
  { icon: Recycle, t: "why.r5.t", d: "why.r5.d" },
  { icon: Sparkles, t: "why.r6.t", d: "why.r6.d" },
];

export function WhyKanti() {
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";
  return (
    <section id="why-kanti" className="relative overflow-hidden bg-cream/40 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="relative">
            <div
              className="absolute -inset-6 rounded-[2.5rem] bg-sun opacity-20 blur-3xl"
              aria-hidden
            />
            <div className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-glow">
              <video
                src={rotatingVideo}
                poster={productUbtan}
                autoPlay
                muted
                loop
                playsInline
                aria-label="Kanti product 360 rotation"
                className="aspect-square w-full object-cover"
              />
            </div>
          </div>
          <div className="text-center md:text-left">
            <span
              className={`${body} text-xs font-semibold uppercase tracking-[0.22em] text-terracotta`}
            >
              {t("why.eyebrow")}
            </span>
            <h2
              className={`mt-3 ${display} text-4xl font-700 leading-[1.1] text-foreground md:text-5xl`}
            >
              {t("why.title.1")} <span className="italic text-primary">{t("why.title.2")}</span>
            </h2>
            <p className={`mt-4 ${body} text-muted-foreground`}>{t("why.subtitle")}</p>
          </div>
        </div>
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reasons.map(({ icon: Icon, t: tk, d: dk }) => (
            <div
              key={tk}
              className="group rounded-3xl border border-border/60 bg-card p-7 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h3 className={`mt-5 ${display} text-xl font-600 text-foreground`}>{t(tk)}</h3>
              <p className={`mt-2 ${body} text-sm leading-relaxed text-muted-foreground`}>
                {t(dk)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
