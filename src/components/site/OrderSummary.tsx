import React, { useState, useEffect } from "react";
import { Ticket, CheckCircle2, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { Coupon, validateCouponDB, calculateDiscount } from "@/lib/coupons";

export interface OrderSummaryProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image_url?: string;
  }>;
  total: number; // Subtotal
  appliedCoupon: Coupon | null;
  onApplyCoupon: (coupon: Coupon) => void;
  onRemoveCoupon: () => void;
  showItemsList?: boolean;
  actionButton?: React.ReactNode;
}

export function OrderSummary({
  items,
  total,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  showItemsList = false,
  actionButton,
}: OrderSummaryProps) {
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // Sync coupon input when coupon changes/clears
  useEffect(() => {
    if (!appliedCoupon) {
      setCouponCode("");
    } else {
      setCouponCode(appliedCoupon.code);
    }
    setCouponError(null);
  }, [appliedCoupon]);

  const handleApply = async () => {
    setCouponError(null);
    setCouponLoading(true);

    try {
      const result = await validateCouponDB(couponCode, total);
      setCouponLoading(false);

      if (result.isValid && result.coupon) {
        onApplyCoupon(result.coupon);
        toast.success("Coupon Applied Successfully!");
      } else {
        const errorMsg = result.error || "Invalid or expired coupon code.";
        setCouponError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      setCouponLoading(false);
      const errorMsg = "Failed to validate coupon. Please try again.";
      setCouponError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleRemove = () => {
    onRemoveCoupon();
    setCouponCode("");
    setCouponError(null);
    toast.success("Coupon removed successfully.");
  };

  // Pricing calculations
  const shipping = total >= 999 || total === 0 ? 0 : 80;
  const { discountAmount, isFreeShipping } = appliedCoupon
    ? calculateDiscount(appliedCoupon, total, shipping)
    : { discountAmount: 0, isFreeShipping: false };
  const finalShippingFee = isFreeShipping ? 0 : shipping;
  const grandTotal = Math.max(0, total - discountAmount + finalShippingFee);

  return (
    <div className="space-y-6">
      {/* Optional Items List for Checkout page */}
      {showItemsList && items.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Items in Order
          </h3>
          <ul className="divide-y divide-border/40">
            {items.map((it) => (
              <li
                key={it.id}
                className="py-2.5 flex justify-between gap-3 text-sm text-muted-foreground"
              >
                <span className="font-medium text-foreground">
                  {it.name} <span className="text-xs text-muted-foreground">× {it.quantity}</span>
                </span>
                <span className="text-foreground font-semibold">
                  ₹{(it.price * it.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-border/60 my-4" />
        </div>
      )}

      {/* Voucher / Coupon Code Section */}
      <div id="coupon-container" className="border-b border-border/60 pb-5">
        <span className="block font-display text-sm font-semibold text-foreground mb-2.5 flex items-center gap-1.5">
          <Ticket className="h-4 w-4 text-primary shrink-0" />
          Voucher / Coupon Code
        </span>

        {!appliedCoupon ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                id="coupon-input"
                type="text"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={(e) => {
                  setCouponCode(e.target.value);
                  setCouponError(null);
                }}
                className="block flex-1 rounded-full border border-border bg-transparent px-4 py-2 text-sm outline-none focus:border-primary uppercase placeholder:normal-case font-medium"
                disabled={couponLoading}
              />
              <button
                id="coupon-apply-btn"
                type="button"
                onClick={handleApply}
                disabled={couponLoading || !couponCode.trim()}
                className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 min-w-[80px] transition-all cursor-pointer"
              >
                {couponLoading ? "Applying…" : "Apply"}
              </button>
            </div>
            {couponError && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-xs text-destructive pl-2 font-semibold"
              >
                {couponError}
              </motion.p>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl bg-primary/5 border border-primary/20 p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-primary flex items-center gap-1">
                ✓ Coupon Applied
              </span>
              <button
                id="coupon-remove-btn"
                type="button"
                onClick={handleRemove}
                className="text-xs font-bold text-destructive hover:underline flex items-center gap-1 cursor-pointer bg-destructive/10 px-3 py-1.5 rounded-full"
              >
                Remove Coupon
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm border-t border-primary/10 pt-2 text-muted-foreground">
              <div>
                Coupon: <span className="font-bold text-foreground">{appliedCoupon.code}</span>
              </div>
              <div className="text-right">
                Discount:{" "}
                <span className="font-bold text-primary">-₹{discountAmount.toFixed(2)}</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pricing Breakdown Section */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-700 text-foreground">Order Summary</h3>
        <div className="space-y-2.5 text-sm">
          {/* Subtotal */}
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="text-foreground font-medium">₹{total.toFixed(2)}</span>
          </div>

          {/* Shipping */}
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Shipping</span>
            <span className="text-foreground font-medium">
              {finalShippingFee === 0 ? "Free" : `₹${finalShippingFee.toFixed(2)}`}
            </span>
          </div>

          {/* Discount */}
          <div
            className={`flex items-center justify-between ${discountAmount > 0 ? "text-primary font-semibold" : "text-muted-foreground"}`}
          >
            <span>Discount</span>
            <span>{discountAmount > 0 ? `-₹${discountAmount.toFixed(2)}` : "₹0.00"}</span>
          </div>

          {shipping > 0 && !isFreeShipping && (
            <p className="text-xs text-muted-foreground pt-1">
              Add ₹{(999 - total).toFixed(0)} more for free delivery (orders above ₹999).
            </p>
          )}
          {finalShippingFee === 0 && total > 0 && (
            <p className="text-xs text-primary font-medium pt-1">You've unlocked free delivery!</p>
          )}

          <div className="my-3 h-px bg-border" />

          {/* Final Payable */}
          <div className="flex items-center justify-between font-display text-base font-700 text-foreground pt-1">
            <span>Final Payable</span>
            <span className="text-primary font-bold text-lg">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      {actionButton && <div className="pt-2">{actionButton}</div>}
    </div>
  );
}
