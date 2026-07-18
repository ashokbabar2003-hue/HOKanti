import hamperImg from "@/assets/hamper.webp";
import { whatsappLink } from "@/lib/contact";
import { useLang, type DictKey } from "@/contexts/LanguageContext";

const occasions: DictKey[] = [
  "hampers.occ.diwali",
  "hampers.occ.haldi",
  "hampers.occ.wedding",
  "hampers.occ.return",
  "hampers.occ.corp",
];

export function Hampers() {
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";
  return (
    <section id="hampers" className="relative overflow-hidden bg-cream py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 md:grid-cols-2 lg:px-8">
        <div className="relative order-last md:order-first">
          <div
            className="absolute -inset-6 rounded-[2.5rem] bg-sun opacity-25 blur-3xl"
            aria-hidden
          />
          <img
            src={hamperImg}
            alt="Kanti gift hamper"
            width={1280}
            height={1280}
            loading="lazy"
            className="relative aspect-square w-full rounded-[2rem] object-cover shadow-glow"
          />
        </div>
        <div>
          <span
            className={`${body} text-xs font-semibold uppercase tracking-[0.22em] text-terracotta`}
          >
            {t("hampers.eyebrow")}
          </span>
          <h2
            className={`mt-3 ${display} text-4xl font-700 leading-[1.1] text-foreground md:text-5xl`}
          >
            {t("hampers.title.1")}{" "}
            <span className="italic text-primary">{t("hampers.title.2")}</span>
          </h2>
          <p className={`mt-5 ${body} text-lg leading-relaxed text-muted-foreground`}>
            {t("hampers.subtitle")}
          </p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            {occasions.map((o) => (
              <span
                key={o}
                className={`rounded-full border border-primary/20 bg-background px-4 py-2 ${body} text-sm font-medium text-primary`}
              >
                {t(o)}
              </span>
            ))}
          </div>
          <a
            href={whatsappLink(t("hampers.wa.msg"))}
            target="_blank"
            rel="noreferrer"
            className={`mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3.5 ${body} text-sm font-semibold text-primary-foreground shadow-glow transition hover:bg-primary/90 w-full sm:w-auto text-center`}
          >
            {t("hampers.cta")}
          </a>
        </div>
      </div>
    </section>
  );
}
