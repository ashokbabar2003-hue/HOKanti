import {
  Heart,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Sprout,
  ShieldCheck,
  HandHeart,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useProducts, type Product, type ProductVariant } from "@/hooks/useProducts";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/hooks/useWishlist";
import { resolveProductImages } from "@/lib/productImages";
import { useLang } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { ProductReviews } from "./ProductReviews";

function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [idx, setIdx] = useState(0);
  const count = images.length;
  const go = (next: number) => setIdx((next + count) % count);
  return (
    <div className="relative aspect-square overflow-hidden bg-cream">
      <img
        src={images[idx]}
        alt={alt}
        width={800}
        height={800}
        loading="lazy"
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      {count > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => {
              e.stopPropagation();
              go(idx - 1);
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-soft hover:bg-background"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => {
              e.stopPropagation();
              go(idx + 1);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-soft hover:bg-background"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to image ${i + 1}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIdx(i);
                }}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-foreground" : "w-1.5 bg-foreground/40"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function ProductCard({ p }: { p: Product }) {
  const { add } = useCart();
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const navigate = useNavigate();
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  const variants: ProductVariant[] = useMemo(
    () => (Array.isArray(p.variants) && p.variants.length ? p.variants : []),
    [p.variants],
  );
  const [variantIdx, setVariantIdx] = useState(0);
  const selected = variants[variantIdx];
  const currentPrice = selected ? Number(selected.price) : Number(p.price);
  const currentName = selected && variants.length > 1 ? `${p.name} — ${selected.label}` : p.name;

  const wished = has(p.id);
  const subtitle = lang === "mr" ? p.subtitle_mr || p.subtitle_en : p.subtitle_en || p.subtitle_mr;

  return (
    <article className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card transition hover:-translate-y-1 hover:shadow-glow">
      <div className="relative">
        <ProductGallery images={resolveProductImages(p.slug, p.image_url)} alt={p.name} />
        <button
          onClick={async () => {
            if (!user) {
              toast.info(t("products.toast.loginfav"));
              navigate({ to: "/auth", search: { redirect: "/" } });
              return;
            }
            await toggle(p.id);
            toast.success(wished ? t("products.toast.wishrm") : t("products.toast.wishadd"));
          }}
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 text-foreground/70 shadow-soft transition hover:text-terracotta"
          aria-label="wishlist"
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-terracotta text-terracotta" : ""}`} />
        </button>
        {p.original_price && (
          <span
            className={`absolute left-4 top-4 z-10 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground shadow-soft ${body}`}
          >
            {Math.round((1 - currentPrice / Number(p.original_price)) * 100)}%{" "}
            {t("products.discount")}
          </span>
        )}
      </div>
      <div className="p-6">
        <h3 className={`${display} text-xl font-600 text-foreground`}>{p.name}</h3>
        <p className={`mt-1 ${body} text-sm text-muted-foreground`}>{subtitle}</p>
        {selected && (
          <p
            className={`mt-1 ${body} text-xs font-semibold uppercase tracking-wider text-terracotta`}
          >
            {selected.size}
          </p>
        )}

        {variants.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {variants.map((v, i) => (
              <button
                key={v.label}
                type="button"
                onClick={() => setVariantIdx(i)}
                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${body} ${
                  i === variantIdx
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:border-primary/60"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-2xl font-700 text-primary">
            ₹{currentPrice.toFixed(0)}
          </span>
          {p.original_price && Number(p.original_price) > currentPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ₹{Number(p.original_price).toFixed(0)}
            </span>
          )}
        </div>
        <button
          onClick={() => {
            add({
              id: variants.length > 1 ? `${p.id}::${selected!.label}` : p.id,
              name: currentName,
              price: currentPrice,
              image_url: p.image_url,
            });
            toast.success(t("products.toast.added"));
          }}
          className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-glow ring-2 ring-terracotta/30 transition hover:brightness-110 hover:ring-terracotta/50 ${body}`}
        >
          <ShoppingBag className="h-4 w-4" /> {t("products.add")}
        </button>
        <ul
          className={`mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 border-t border-border/50 pt-4 ${body} text-[11px] font-medium text-muted-foreground`}
        >
          <li className="inline-flex items-center gap-1">
            <Leaf className="h-3.5 w-3.5 text-primary" /> {t("products.tag.natural")}
          </li>
          <li className="inline-flex items-center gap-1">
            <Sprout className="h-3.5 w-3.5 text-primary" /> {t("products.tag.vegan")}
          </li>
          <li className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" /> {t("products.tag.cruelty")}
          </li>
          <li className="inline-flex items-center gap-1">
            <HandHeart className="h-3.5 w-3.5 text-primary" /> {t("products.tag.handmade")}
          </li>
        </ul>
        <ProductReviews productId={p.id} />
      </div>
    </article>
  );
}

export function Products() {
  const { products, loading } = useProducts();
  const { t, lang } = useLang();
  const display = lang === "mr" ? "font-marathi-display" : "font-display";
  const body = lang === "mr" ? "font-marathi" : "font-sans";

  return (
    <section id="products" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span
              className={`${body} text-xs font-semibold uppercase tracking-[0.22em] text-terracotta`}
            >
              {t("products.eyebrow")}
            </span>
            <h2
              className={`mt-3 ${display} text-4xl font-700 leading-[1.1] text-foreground md:text-5xl`}
            >
              {t("products.title.1")}{" "}
              <span className="italic text-primary">{t("products.title.2")}</span>
            </h2>
            <p className={`mt-3 max-w-xl ${body} text-muted-foreground`}>
              {t("products.subtitle")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] animate-pulse rounded-3xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
