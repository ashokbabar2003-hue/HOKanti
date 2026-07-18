import { createFileRoute } from "@tanstack/react-router";
import ogImage from "@/assets/og-image.jpg";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Sparkles, Leaf, Flower2, Sun, Droplets, HeartHandshake } from "lucide-react";
import { useLang, type DictKey } from "@/contexts/LanguageContext";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About House Of Kanti — Our Story & Ingredients" },
      {
        name: "description",
        content:
          "Discover House Of Kanti — our Ayurvedic philosophy, vision, hero ingredients (saffron, sandalwood, turmeric, rose) and signature collection.",
      },
      { property: "og:title", content: "About House Of Kanti — Where Purity Meets Glow" },
      {
        property: "og:description",
        content:
          "Holistic Ayurvedic skincare crafted with purity, authenticity and mindful self-care.",
      },
      { property: "og:url", content: "https://houseofkanti.ai.studio/about" },
      { property: "og:image", content: `https://houseofkanti.ai.studio${ogImage}` },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "About House Of Kanti — Where Purity Meets Glow" },
      { name: "twitter:image", content: `https://houseofkanti.ai.studio${ogImage}` },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.ai.studio/about" }],
  }),
  component: AboutPage,
});

const heroes: { icon: typeof Sun; nameKey: DictKey; descKey: DictKey }[] = [
  { icon: Sun, nameKey: "about.hero.saffron.name", descKey: "about.hero.saffron.desc" },
  { icon: Leaf, nameKey: "about.hero.sandal.name", descKey: "about.hero.sandal.desc" },
  { icon: Sparkles, nameKey: "about.hero.turmeric.name", descKey: "about.hero.turmeric.desc" },
  { icon: Flower2, nameKey: "about.hero.rose.name", descKey: "about.hero.rose.desc" },
  { icon: Droplets, nameKey: "about.hero.clay.name", descKey: "about.hero.clay.desc" },
];

const collection: { titleKey: DictKey; bKey: DictKey; rKey: DictKey }[] = [
  { titleKey: "about.coll.ubtan.title", bKey: "about.coll.ubtan.b", rKey: "about.coll.ubtan.r" },
  { titleKey: "about.coll.pack.title", bKey: "about.coll.pack.b", rKey: "about.coll.pack.r" },
  { titleKey: "about.coll.oil.title", bKey: "about.coll.oil.b", rKey: "about.coll.oil.r" },
  { titleKey: "about.coll.salt.title", bKey: "about.coll.salt.b", rKey: "about.coll.salt.r" },
];

const pillars: { tKey: DictKey; dKey: DictKey }[] = [
  { tKey: "about.pillar1.t", dKey: "about.pillar1.d" },
  { tKey: "about.pillar2.t", dKey: "about.pillar2.d" },
  { tKey: "about.pillar3.t", dKey: "about.pillar3.d" },
];

function AboutPage() {
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";
  return (
    <div className={`min-h-screen bg-background ${body}`}>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-warm py-20 md:py-28">
          <div className="absolute inset-0 bg-hero-radial opacity-60" aria-hidden />
          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              {t("about.eyebrow")}
            </span>
            <h1
              className={`mt-3 ${display} text-4xl font-700 leading-[1.05] text-foreground md:text-6xl`}
            >
              {t("about.hero.title.1")}{" "}
              <span className="italic text-primary">{t("about.hero.title.purity")}</span>{" "}
              {t("about.hero.title.2")}
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-foreground/80 md:text-lg">
              {t("about.hero.p1")}
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-muted-foreground">
              {t("about.hero.p2.a")} <em>“{lang === "mr" ? "कांती" : "Kanti"}”</em>{" "}
              {t("about.hero.p2.b")}{" "}
              <span className="font-semibold text-foreground">{t("about.hero.pillars")}</span>
            </p>
          </div>
        </section>

        {/* Vision & Mission */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-card">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                {t("about.vision.eyebrow")}
              </span>
              <h2 className={`mt-2 ${display} text-2xl font-700 text-foreground md:text-3xl`}>
                {t("about.vision.title")}
              </h2>
              <p className="mt-3 text-foreground/80">{t("about.vision.desc")}</p>
            </div>
            <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-card">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                {t("about.mission.eyebrow")}
              </span>
              <h2 className={`mt-2 ${display} text-2xl font-700 text-foreground md:text-3xl`}>
                {t("about.mission.title")}
              </h2>
              <p className="mt-3 text-foreground/80">{t("about.mission.desc")}</p>
            </div>
          </div>
        </section>

        {/* Brand story */}
        <section className="bg-cream/50 py-16 md:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              {t("about.story.eyebrow")}
            </span>
            <h2 className={`mt-3 ${display} text-3xl font-700 text-foreground md:text-4xl`}>
              {t("about.story.title")}
            </h2>
            <div className="mt-6 space-y-4 text-foreground/80">
              <p>{t("about.story.p1")}</p>
              <p>{t("about.story.p2")}</p>
            </div>
          </div>
        </section>

        {/* Hero ingredients */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              {t("about.heroes.eyebrow")}
            </span>
            <h2 className={`mt-3 ${display} text-3xl font-700 text-foreground md:text-4xl`}>
              {t("about.heroes.title.1")}{" "}
              <span className="italic text-primary">{t("about.heroes.title.hero")}</span>{" "}
              {t("about.heroes.title.2")}
            </h2>
            <p className="mt-3 text-muted-foreground">{t("about.heroes.subtitle")}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {heroes.map(({ icon: Icon, nameKey, descKey }) => (
              <div
                key={nameKey}
                className="group rounded-3xl border border-border/60 bg-card p-7 shadow-card transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-glow"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-6 w-6" strokeWidth={1.8} />
                </div>
                <h3 className={`mt-5 ${display} text-xl font-600 text-foreground`}>{t(nameKey)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t(descKey)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Signature collection */}
        <section className="bg-warm py-16 md:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
                {t("about.coll.eyebrow")}
              </span>
              <h2 className={`mt-3 ${display} text-3xl font-700 text-foreground md:text-4xl`}>
                {t("about.coll.title")}
              </h2>
            </div>
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {collection.map((c) => (
                <div
                  key={c.titleKey}
                  className="rounded-3xl border border-border/60 bg-card p-8 shadow-card"
                >
                  <h3 className={`${display} text-2xl font-700 text-foreground`}>
                    {t(c.titleKey)}
                  </h3>
                  <p className="mt-3 text-sm">
                    <span className="font-semibold text-foreground">
                      {t("about.coll.benefits")}{" "}
                    </span>
                    <span className="text-foreground/80">{t(c.bKey)}</span>
                  </p>
                  <p className="mt-2 text-sm">
                    <span className="font-semibold text-foreground">{t("about.coll.ritual")} </span>
                    <span className="text-foreground/80">{t(c.rKey)}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modern necessity */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-terracotta">
              {t("about.modern.eyebrow")}
            </span>
            <h2 className={`mt-3 ${display} text-3xl font-700 text-foreground md:text-4xl`}>
              {t("about.modern.title.1")}{" "}
              <span className="italic text-primary">{t("about.modern.title.ayur")}</span>
              {t("about.modern.title.2")}
            </h2>
            <p className="mt-4 text-muted-foreground">{t("about.modern.subtitle")}</p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {pillars.map((p) => (
              <div
                key={p.tKey}
                className="rounded-3xl border border-border/60 bg-card p-7 shadow-card"
              >
                <HeartHandshake className="h-6 w-6 text-terracotta" strokeWidth={1.8} />
                <h3 className={`mt-4 ${display} text-lg font-600 text-foreground`}>{t(p.tKey)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t(p.dKey)}</p>
              </div>
            ))}
          </div>
          <p className={`mt-12 text-center ${display} text-xl italic text-primary md:text-2xl`}>
            {t("about.tagline")}
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
