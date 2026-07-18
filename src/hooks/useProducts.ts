import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Product = {
  id: string;
  slug: string;
  name: string;
  subtitle_mr: string | null;
  subtitle_en: string | null;
  description: string | null;
  seo_description: string | null;
  price: number;
  original_price: number | null;
  image_url: string | null;
  in_stock: boolean;
  variants: ProductVariant[] | null;
};

export type ProductVariant = {
  label: string;
  packaging: string;
  size: string;
  price: number;
};

export function useProducts() {
  const [data, setData] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    supabase
      .from("products")
      .select("*")
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (active) {
          setData((data ?? []) as Product[]);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  return { products: data, loading };
}
