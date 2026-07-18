import { supabase } from "@/integrations/supabase/client";

export interface Coupon {
  id?: string;
  code: string;
  discountType: "percentage" | "fixed" | "free_shipping";
  discountValue: number; // e.g., 99 for percentage, 500 for fixed
  isActive: boolean;
  minOrderAmount: number;
  maxDiscountAmount: number | null; // null means Unlimited
  expiryDate: string | null; // ISO date string or null
  finalPrice?: number | null;
  discount_type?: string;
}

export interface DbCoupon {
  id: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: "PERCENTAGE" | "FIXED" | "FINAL_PRICE";
  discount_value: number;
  minimum_order: number;
  maximum_discount: number | null;
  final_price: number | null;
  free_shipping: boolean;
  is_active: boolean;
  usage_limit: number | null;
  usage_count: number;
  valid_from: string | null;
  valid_until: string | null;
  created_at?: string;
  updated_at?: string;
}

// Coupons are driven entirely and exclusively by the PostgreSQL coupons table database schema.
// No in-memory fallback registry or development bypasses are permitted in production.

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  coupon?: Coupon;
}

export function mapDbCouponToCoupon(dbCoupon: DbCoupon): Coupon {
  let discountType: "percentage" | "fixed" | "free_shipping" = "percentage";
  if (dbCoupon.discount_type === "FIXED") {
    discountType = "fixed";
  } else if (dbCoupon.free_shipping) {
    discountType = "free_shipping";
  }

  return {
    id: dbCoupon.id,
    code: dbCoupon.code,
    discountType,
    discountValue: Number(dbCoupon.discount_value),
    isActive: dbCoupon.is_active,
    minOrderAmount: Number(dbCoupon.minimum_order),
    maxDiscountAmount: dbCoupon.maximum_discount ? Number(dbCoupon.maximum_discount) : null,
    expiryDate: dbCoupon.valid_until,
    finalPrice: dbCoupon.final_price ? Number(dbCoupon.final_price) : null,
    discount_type: dbCoupon.discount_type,
  };
}

export function validateCoupon(code: string, currentSubtotal: number): ValidationResult {
  // Client-side fail-safe if called directly: Enforce that coupon validation must always go through the DB
  return {
    isValid: false,
    error: "Coupon validation is temporarily unavailable. Please try again shortly.",
  };
}

export async function validateCouponDB(
  code: string,
  currentSubtotal: number,
  clientSupabaseInstance = supabase,
): Promise<ValidationResult & { dbCoupon?: DbCoupon }> {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) {
    return { isValid: false, error: "Please enter a coupon code." };
  }

  // Fetch from DB - Database is the absolute and ONLY source of truth
  try {
    const { data: dbCoupon, error } = await clientSupabaseInstance
      .from("coupons")
      .select("*")
      .eq("code", normalizedCode)
      .maybeSingle();

    if (error) {
      console.error("[Coupon System] Database is unavailable or query failed:", error);
      return {
        isValid: false,
        error: "Coupon validation is temporarily unavailable. Please try again shortly.",
      };
    }

    if (!dbCoupon) {
      // Coupon does not exist in the database
      return {
        isValid: false,
        error: "Invalid or expired coupon code.",
      };
    }

    if (!dbCoupon.is_active) {
      return { isValid: false, error: "This coupon is no longer active." };
    }

    const now = new Date();
    if (dbCoupon.valid_from && new Date(dbCoupon.valid_from) > now) {
      return { isValid: false, error: "This coupon is not active yet." };
    }

    if (dbCoupon.valid_until && new Date(dbCoupon.valid_until) < now) {
      return { isValid: false, error: "This coupon has expired." };
    }

    if (dbCoupon.usage_limit !== null && dbCoupon.usage_count >= dbCoupon.usage_limit) {
      return { isValid: false, error: "This coupon has reached its usage limit." };
    }

    if (currentSubtotal < Number(dbCoupon.minimum_order)) {
      return {
        isValid: false,
        error: `This coupon requires a minimum order amount of ₹${Number(dbCoupon.minimum_order).toFixed(2)}.`,
      };
    }

    const mapped = mapDbCouponToCoupon(dbCoupon as unknown as DbCoupon);
    return {
      isValid: true,
      coupon: mapped,
      dbCoupon: dbCoupon as unknown as DbCoupon,
    };
  } catch (err) {
    console.error("[Coupon System] Database connection exception:", err);
    return {
      isValid: false,
      error: "Coupon validation is temporarily unavailable. Please try again shortly.",
    };
  }
}

export function calculateDiscount(
  coupon: Coupon,
  subtotal: number,
  shippingFee: number,
): {
  discountAmount: number;
  isFreeShipping: boolean;
} {
  let discountAmount = 0;
  let isFreeShipping = false;

  // 1. FINAL_PRICE behaviour (like HOKTEST)
  if (coupon.finalPrice !== null && coupon.finalPrice !== undefined) {
    discountAmount = Math.max(0, subtotal + shippingFee - coupon.finalPrice);
    return {
      discountAmount,
      isFreeShipping: false,
    };
  }

  // 2. Standard behaviour
  if (coupon.discountType === "percentage" || coupon.discount_type === "PERCENTAGE") {
    discountAmount = (subtotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount !== null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else if (coupon.discountType === "fixed" || coupon.discount_type === "FIXED") {
    discountAmount = Math.min(coupon.discountValue, subtotal);
  } else if (coupon.discountType === "free_shipping") {
    isFreeShipping = true;
    discountAmount = shippingFee;
  }

  // Round discount to 2 decimal places as requested
  discountAmount = Math.round(discountAmount * 100) / 100;

  return {
    discountAmount,
    isFreeShipping,
  };
}
