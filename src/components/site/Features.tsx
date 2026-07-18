import { MessageCircle, ShieldCheck, Gift, BadgePercent } from "lucide-react";
import { useLang, type DictKey } from "@/contexts/LanguageContext";

const items: { icon: typeof MessageCircle; titleKey: DictKey; descKey: DictKey }[] = [
  { icon: MessageCircle, titleKey: "feat.wa.title", descKey: "feat.wa.desc" },
  { icon: ShieldCheck, titleKey: "feat.secure.title", descKey: "feat.secure.desc" },
  { icon: Gift, titleKey: "feat.gift.title", descKey: "feat.gift.desc" },
  { icon: BadgePercent, titleKey: "feat.herbal.title", descKey: "feat.herbal.desc" },
];

export function Features() {
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";
  return (
    <section className="border-y border-border/60 bg-cream/60">
      <div className="mx-auto grid max-w-7xl gap-px overflow-hidden bg-border/60 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, titleKey, descKey }) => (
          <div key={titleKey} className="bg-cream/60 p-7">
            <Icon className="h-6 w-6 text-terracotta" strokeWidth={1.8} />
            <h3 className={`mt-4 ${display} text-lg font-600 text-foreground`}>{t(titleKey)}</h3>
            <p className={`mt-1 ${body} text-sm leading-relaxed text-muted-foreground`}>
              {t(descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
