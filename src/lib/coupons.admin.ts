import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export interface CouponInput {
  code: string;
  name: string;
  description?: string | null;
  discount_type: "PERCENTAGE" | "FIXED" | "FINAL_PRICE";
  discount_value: number;
  minimum_order?: number;
  maximum_discount?: number | null;
  final_price?: number | null;
  free_shipping?: boolean;
  is_active?: boolean;
  usage_limit?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
}

export const listCouponsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const { data, error } = await supabaseAdmin
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return { success: true, coupons: data || [] };
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[Coupons Admin] Error listing coupons:", err);
    return { success: false, error: errMsg };
  }
});

export const createCouponAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: CouponInput) => {
    if (!data?.code || !data?.name || !data?.discount_type) {
      throw new Error("code, name, and discount_type are required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const normalizedCode = data.code.trim().toUpperCase();
      const { data: inserted, error } = await supabaseAdmin
        .from("coupons")
        .insert({
          ...data,
          code: normalizedCode,
          minimum_order: data.minimum_order || 0,
          usage_count: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, coupon: inserted };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[Coupons Admin] Error creating coupon:", err);
      return { success: false, error: errMsg };
    }
  });

export const updateCouponAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; updates: Partial<CouponInput> }) => {
    if (!data?.id) throw new Error("id is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      if (data.updates.code) {
        data.updates.code = data.updates.code.trim().toUpperCase();
      }
      const { data: updated, error } = await supabaseAdmin
        .from("coupons")
        .update({
          ...data.updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", data.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, coupon: updated };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[Coupons Admin] Error updating coupon:", err);
      return { success: false, error: errMsg };
    }
  });

export const deleteCouponAdmin = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => {
    if (!data?.id) throw new Error("id is required");
    return data;
  })
  .handler(async ({ data }) => {
    try {
      const { error } = await supabaseAdmin.from("coupons").delete().eq("id", data.id);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[Coupons Admin] Error deleting coupon:", err);
      return { success: false, error: errMsg };
    }
  });
