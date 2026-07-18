import { createFileRoute, Link } from "@tanstack/react-router";
import { useCart } from "@/contexts/CartContext";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { resolveProductImage } from "@/lib/productImages";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Coupon } from "@/lib/coupons";
import { OrderSummary } from "@/components/site/OrderSummary";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — House Of Kanti" },
      {
        name: "description",
        content: "Review the Ayurvedic skincare items in your House Of Kanti cart before checkout.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Your Cart — House Of Kanti" },
      {
        property: "og:description",
        content: "Review the items in your House Of Kanti cart before checkout.",
      },
      { property: "og:url", content: "https://houseofkanti.ai.studio/cart" },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.ai.studio/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove, total, count } = useCart();

  // Coupon state with persistence in localStorage
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sk_applied_coupon_v1");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (_) {
          return null;
        }
      }
    }
    return null;
  });

  // Read latest coupon state from localStorage when page is focused or mounted
  useEffect(() => {
    const handleFocus = () => {
      const saved = localStorage.getItem("sk_applied_coupon_v1");
      if (saved) {
        try {
          setAppliedCoupon(JSON.parse(saved));
        } catch (_) {
          setAppliedCoupon(null);
        }
      } else {
        setAppliedCoupon(null);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const handleApplyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
    localStorage.setItem("sk_applied_coupon_v1", JSON.stringify(coupon));
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("sk_applied_coupon_v1");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-700 text-foreground">Your cart</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {count} item{count === 1 ? "" : "s"}
        </p>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border/80 bg-card p-16 text-center">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 font-display text-xl font-700">Your cart is empty</h2>
            <Link
              to="/"
              className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_360px]">
            <ul className="space-y-4">
              {items.map((it) => (
                <li
                  key={it.id}
                  className="flex gap-4 rounded-2xl border border-border/60 bg-card p-4 shadow-card"
                >
                  <img
                    src={resolveProductImage(it.image_url)}
                    alt={it.name}
                    className="h-24 w-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-display text-lg font-600 text-foreground">{it.name}</h3>
                        <div className="mt-1 font-display text-lg font-700 text-primary">
                          ₹{Number(it.price).toFixed(0)}
                        </div>
                      </div>
                      <button
                        onClick={() => remove(it.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center gap-2">
                      <button
                        onClick={() => setQty(it.id, it.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{it.quantity}</span>
                      <button
                        onClick={() => setQty(it.id, it.quantity + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-muted"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-card">
              <OrderSummary
                items={items}
                total={total}
                appliedCoupon={appliedCoupon}
                onApplyCoupon={handleApplyCoupon}
                onRemoveCoupon={handleRemoveCoupon}
                actionButton={
                  <Link
                    to="/checkout"
                    className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                  >
                    Proceed to checkout
                  </Link>
                }
              />
            </aside>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
