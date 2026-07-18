import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { resolveProductImage } from "@/lib/productImages";
import { Package } from "lucide-react";

export const Route = createFileRoute("/account/orders")({
  head: () => ({
    meta: [
      { title: "Your Orders — House Of Kanti" },
      { name: "description", content: "Track and review your past House Of Kanti orders." },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Your Orders — House Of Kanti" },
      { property: "og:description", content: "Track your House Of Kanti orders." },
    ],
    links: [{ rel: "canonical", href: "https://houseofkanti.ai.studio/account/orders" }],
  }),
  component: OrdersPage,
});

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  created_at: string;
  order_items: {
    id: string;
    product_name: string;
    product_image: string | null;
    quantity: number;
    unit_price: number;
  }[];
};

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("orders")
      .select(
        "id, order_number, status, total_amount, created_at, order_items(id, product_name, product_image, quantity, unit_price)",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setOrders((data ?? []) as OrderRow[]);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <div className="text-muted-foreground">Loading…</div>;

  if (orders.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border/80 bg-card p-12 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-4 font-display text-xl font-700">No orders yet</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Browse the shop and place your first order.
        </p>
        <Link
          to="/"
          className="mt-5 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
        >
          Shop now
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((o) => (
        <article key={o.id} className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="font-display text-lg font-700 text-foreground">{o.order_number}</div>
              <div className="text-xs text-muted-foreground">
                {new Date(o.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
            <div className="text-right">
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColor(o.status)}`}
              >
                {o.status}
              </span>
              <div className="mt-1 font-display text-lg font-700 text-primary">
                ₹{Number(o.total_amount).toFixed(0)}
              </div>
            </div>
          </header>
          <ul className="mt-4 space-y-3 border-t border-border/60 pt-4">
            {o.order_items.map((it) => (
              <li key={it.id} className="flex items-center gap-3">
                <img
                  src={resolveProductImage(it.product_image)}
                  alt={it.product_name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{it.product_name}</div>
                  <div className="text-xs text-muted-foreground">
                    Qty {it.quantity} · ₹{Number(it.unit_price).toFixed(0)}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function statusColor(s: string) {
  switch (s) {
    case "pending":
      return "bg-accent text-accent-foreground";
    case "shipped":
      return "bg-primary/15 text-primary";
    case "delivered":
      return "bg-herb/15 text-herb";
    case "cancelled":
      return "bg-destructive/15 text-destructive";
    default:
      return "bg-muted text-foreground";
  }
}
