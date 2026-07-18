import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useWishlist() {
  const { user } = useAuth();
  const [productIds, setProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setProductIds(new Set());
      return;
    }
    setLoading(true);
    const { data } = await supabase.from("wishlist").select("product_id").eq("user_id", user.id);
    setProductIds(new Set((data ?? []).map((r) => r.product_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggle = async (productId: string) => {
    if (!user) return { error: "auth" as const };
    if (productIds.has(productId)) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", productId);
      setProductIds((s) => {
        const n = new Set(s);
        n.delete(productId);
        return n;
      });
    } else {
      await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId });
      setProductIds((s) => new Set(s).add(productId));
    }
    return { error: null };
  };

  return { productIds, toggle, loading, refresh, has: (id: string) => productIds.has(id) };
}
