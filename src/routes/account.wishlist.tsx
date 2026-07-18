import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { resolveProductImage } from "@/lib/productImages";
import { Heart, ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account/wishlist")({
  head: () => ({
    meta: [
      { title: "Your Wishlist — House Of Kanti" },
      {
        name: "description",
        content: "Your saved House Of Kanti favourites, ready to add to cart.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Your Wishlist — House Of Kanti" },
      { property: "og:description", content: "Your saved House Of Kanti favourites." },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.ai.studio/account/wishlist" }],
  }),
  component: WishlistPage,
});

type Row = {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    original_price: number | null;
    image_url: string | null;
    subtitle_en: string | null;
  } | null;
};

function WishlistPage() {
  const { user } = useAuth();
  const { add } = useCart();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!user) return;
    const { data } = await supabase
      .from("wishlist")
      .select("id, product:products(id, name, price, original_price, image_url, subtitle_en)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setItems((data ?? []) as Row[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function remove(id: string) {
    await supabase.from("wishlist").delete().eq("id", id);
    setItems((s) => s.filter((r) => r.id !== id));
  }

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card p-12 text-center">
        <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 font-display text-xl font-700">Your wishlist is empty</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tap the heart icon on any product to save it.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {items.map((r) =>
        r.product ? (
          <article
            key={r.id}
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card"
          >
            <button
              onClick={() => remove(r.id)}
              className="absolute right-3 top-3 z-10 rounded-full bg-background/90 p-2 text-foreground/70 shadow-soft transition hover:text-destructive"
              aria-label="Remove from wishlist"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="aspect-square overflow-hidden bg-cream">
              <img
                src={resolveProductImage(r.product.image_url)}
                alt={r.product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="p-5">
              <h3 className="font-display text-lg font-600 text-foreground">{r.product.name}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{r.product.subtitle_en}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display text-xl font-700 text-primary">
                  ₹{Number(r.product.price).toFixed(0)}
                </span>
                {r.product.original_price && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{Number(r.product.original_price).toFixed(0)}
                  </span>
                )}
              </div>
              <button
                onClick={() => {
                  add({
                    id: r.product!.id,
                    name: r.product!.name,
                    price: Number(r.product!.price),
                    image_url: r.product!.image_url,
                  });
                  toast.success("Added to cart");
                }}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingBag className="h-4 w-4" /> Add to cart
              </button>
            </div>
          </article>
        ) : null,
      )}
    </div>
  );
}
