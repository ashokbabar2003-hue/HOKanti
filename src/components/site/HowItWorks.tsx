import { ShoppingCart, Phone, MessageCircle, type LucideIcon } from "lucide-react";
import { useLang, type DictKey } from "@/contexts/LanguageContext";

const steps: { t: DictKey; d: DictKey; Icon: LucideIcon; label: string }[] = [
  { t: "how.s1.t", d: "how.s1.d", Icon: ShoppingCart, label: "Add to Cart" },
  { t: "how.s2.t", d: "how.s2.d", Icon: Phone, label: "Checkout" },
  { t: "how.s3.t", d: "how.s3.d", Icon: MessageCircle, label: "WhatsApp" },
];

export function HowItWorks() {
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";
  return (
    <section id="how" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span
            className={`${body} text-xs font-semibold uppercase tracking-[0.22em] text-terracotta`}
          >
            {t("how.eyebrow")}
          </span>
          <h2
            className={`mt-3 ${display} text-4xl font-700 leading-[1.1] text-foreground md:text-5xl`}
          >
            {t("how.title.1")} <span className="italic text-primary">{t("how.title.2")}</span>
          </h2>
        </div>
        <ol className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => {
            const Icon = s.Icon;
            return (
              <li
                key={i}
                className="group relative flex flex-col items-center rounded-3xl border-2 border-border/60 bg-card p-8 pt-12 text-center shadow-card transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
              >
                <span className="absolute -top-8 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-terracotta text-primary-foreground shadow-glow ring-4 ring-background">
                  <Icon className="h-7 w-7" strokeWidth={2.25} />
                </span>
                <span className="absolute -top-2 right-6 flex h-7 w-7 items-center justify-center rounded-full bg-sun font-display text-sm font-700 text-primary-foreground shadow-soft">
                  {i + 1}
                </span>
                <p className={`mt-2 ${display} text-lg leading-relaxed text-foreground`}>
                  {t(s.t)}
                </p>
                <p className={`mt-3 ${body} text-sm leading-relaxed text-muted-foreground`}>
                  {t(s.d)}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
