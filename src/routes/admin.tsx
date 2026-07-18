import { createFileRoute } from "@tanstack/react-router";
import React, { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import {
  Ticket,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RefreshCw,
  Settings,
  Calendar,
  Percent,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Info,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  listCouponsAdmin,
  createCouponAdmin,
  updateCouponAdmin,
  deleteCouponAdmin,
  CouponInput,
} from "@/lib/coupons.admin";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Voucher Management Portal — House Of Kanti" },
      {
        name: "description",
        content: "Administrative dashboard for House of Kanti voucher and coupon management.",
      },
    ],
  }),
  component: AdminCouponsDashboard,
});

interface DbCoupon {
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
  created_at: string;
}

function AdminCouponsDashboard() {
  const [coupons, setCoupons] = useState<DbCoupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED" | "FINAL_PRICE">(
    "PERCENTAGE",
  );
  const [discountValue, setDiscountValue] = useState<string>("0");
  const [minimumOrder, setMinimumOrder] = useState<string>("0");
  const [maximumDiscount, setMaximumDiscount] = useState<string>("");
  const [finalPrice, setFinalPrice] = useState<string>("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [usageLimit, setUsageLimit] = useState<string>("");
  const [validUntil, setValidUntil] = useState<string>("");

  // Edit states
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDiscountValue, setEditDiscountValue] = useState("0");
  const [editMinimumOrder, setEditMinimumOrder] = useState("0");
  const [editMaximumDiscount, setEditMaximumDiscount] = useState("");
  const [editFinalPrice, setEditFinalPrice] = useState("");
  const [editUsageLimit, setEditUsageLimit] = useState("");
  const [editValidUntil, setEditValidUntil] = useState("");

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listCouponsAdmin();
      if (res.success && res.coupons) {
        setCoupons(res.coupons as DbCoupon[]);
      } else {
        toast.error(res.error || "Failed to load coupons.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error connecting to server function.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      toast.error("Please provide both a coupon code and a coupon name.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CouponInput = {
        code: code.trim().toUpperCase(),
        name: name.trim(),
        description: description.trim() || null,
        discount_type: discountType,
        discount_value: parseFloat(discountValue) || 0,
        minimum_order: parseFloat(minimumOrder) || 0,
        maximum_discount: maximumDiscount.trim() ? parseFloat(maximumDiscount) : null,
        final_price:
          discountType === "FINAL_PRICE" && finalPrice.trim() ? parseFloat(finalPrice) : null,
        free_shipping: freeShipping,
        is_active: true,
        usage_limit: usageLimit.trim() ? parseInt(usageLimit, 10) : null,
        valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      };

      const res = await createCouponAdmin({ data: payload });
      if (res.success) {
        toast.success(`Coupon ${payload.code} created successfully!`);
        // Reset Form
        setCode("");
        setName("");
        setDescription("");
        setDiscountType("PERCENTAGE");
        setDiscountValue("0");
        setMinimumOrder("0");
        setMaximumDiscount("");
        setFinalPrice("");
        setFreeShipping(false);
        setUsageLimit("");
        setValidUntil("");
        // Reload
        fetchCoupons();
      } else {
        toast.error(res.error || "Failed to create coupon.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await updateCouponAdmin({
        data: {
          id,
          updates: { is_active: !currentStatus },
        },
      });
      if (res.success) {
        toast.success(`Coupon status updated successfully.`);
        // Local update
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, is_active: !currentStatus } : c)),
        );
      } else {
        toast.error(res.error || "Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating coupon state.");
    }
  };

  const handleStartEdit = (coupon: DbCoupon) => {
    setEditingId(coupon.id);
    setEditName(coupon.name);
    setEditDescription(coupon.description || "");
    setEditDiscountValue(String(coupon.discount_value));
    setEditMinimumOrder(String(coupon.minimum_order));
    setEditMaximumDiscount(coupon.maximum_discount ? String(coupon.maximum_discount) : "");
    setEditFinalPrice(coupon.final_price ? String(coupon.final_price) : "");
    setEditUsageLimit(coupon.usage_limit ? String(coupon.usage_limit) : "");
    setEditValidUntil(coupon.valid_until ? coupon.valid_until.substring(0, 16) : "");
  };

  const handleSaveEdit = async (id: string) => {
    setSubmitting(true);
    try {
      const coupon = coupons.find((c) => c.id === id);
      if (!coupon) return;

      const updates: Partial<CouponInput> = {
        name: editName.trim(),
        description: editDescription.trim() || null,
        discount_value: parseFloat(editDiscountValue) || 0,
        minimum_order: parseFloat(editMinimumOrder) || 0,
        maximum_discount: editMaximumDiscount.trim() ? parseFloat(editMaximumDiscount) : null,
        final_price:
          coupon.discount_type === "FINAL_PRICE" && editFinalPrice.trim()
            ? parseFloat(editFinalPrice)
            : null,
        usage_limit: editUsageLimit.trim() ? parseInt(editUsageLimit, 10) : null,
        valid_until: editValidUntil ? new Date(editValidUntil).toISOString() : null,
      };

      const res = await updateCouponAdmin({
        data: { id, updates },
      });

      if (res.success) {
        toast.success("Coupon changes saved successfully!");
        setEditingId(null);
        fetchCoupons();
      } else {
        toast.error(res.error || "Failed to update coupon.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating coupon.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (
      !confirm(
        `Are you absolutely sure you want to delete coupon ${code}? This action cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      const res = await deleteCouponAdmin({ data: { id } });
      if (res.success) {
        toast.success(`Coupon ${code} has been deleted.`);
        setCoupons((prev) => prev.filter((c) => c.id !== id));
      } else {
        toast.error(res.error || "Failed to delete coupon.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting coupon.");
    }
  };

  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "—";
    return `₹${Number(val).toFixed(2)}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never (Unlimited)";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col font-sans">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                <Ticket className="h-7 w-7" />
              </div>
              <h1 className="text-3xl font-display font-semibold text-[#1e3522]">
                Voucher & Coupon Management
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
              Control your customer checkout promotions. Create percentage discounts, fixed
              reductions, or test vouchers with dynamic custom rules stored in the database.
            </p>
          </div>
          <button
            onClick={fetchCoupons}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-full bg-white border border-border hover:bg-neutral-50 transition cursor-pointer self-start"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh Database
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Coupon Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm sticky top-24">
              <div className="flex items-center gap-2 border-b border-border pb-4 mb-5">
                <Plus className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-display font-medium text-[#1e3522]">
                  Create New Coupon
                </h2>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. FESTIVE50"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="block w-full rounded-xl border border-border px-4 py-2.5 text-sm uppercase font-bold outline-none focus:border-primary"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Codes will be normalized to uppercase.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Coupon Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="E.G. Diwali Festive Offer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Optional details..."
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="block w-full rounded-xl border border-border px-4 py-2 text-sm outline-none focus:border-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => {
                        const val = e.target.value as "PERCENTAGE" | "FIXED" | "FINAL_PRICE";
                        setDiscountType(val);
                        if (val === "FINAL_PRICE") {
                          setDiscountValue("0");
                        }
                      }}
                      className="block w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none bg-white focus:border-primary"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                      <option value="FINAL_PRICE">Final Price Lock (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      {discountType === "PERCENTAGE"
                        ? "Percentage Value"
                        : discountType === "FIXED"
                          ? "Reduction Amount"
                          : "Not Applicable"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      disabled={discountType === "FINAL_PRICE"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="block w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary disabled:bg-neutral-50 disabled:text-neutral-400"
                    />
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {discountType === "FINAL_PRICE" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 bg-amber-50 rounded-xl border border-amber-100 space-y-2"
                    >
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-amber-800 mb-1">
                          Target Final Price (₹) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="e.g. 1.00 or 9.00"
                          value={finalPrice}
                          onChange={(e) => setFinalPrice(e.target.value)}
                          className="block w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-500 font-medium"
                        />
                      </div>
                      <p className="text-[10px] text-amber-700 flex items-start gap-1">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>
                          Sets total payable amount to exactly this price. Excellent for dynamic
                          test overrides.
                        </span>
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Min Order (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={minimumOrder}
                      onChange={(e) => setMinimumOrder(e.target.value)}
                      className="block w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Max Discount (₹)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Unlimited"
                      value={maximumDiscount}
                      onChange={(e) => setMaximumDiscount(e.target.value)}
                      className="block w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      placeholder="Unlimited"
                      value={usageLimit}
                      onChange={(e) => setUsageLimit(e.target.value)}
                      className="block w-full rounded-xl border border-border px-4 py-2.5 text-sm outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      type="datetime-local"
                      value={validUntil}
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="block w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-primary text-neutral-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-neutral-50 p-3 rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setFreeShipping((prev) => !prev)}
                    className="shrink-0 transition-colors"
                  >
                    {freeShipping ? (
                      <ToggleRight className="h-8 w-8 text-primary" />
                    ) : (
                      <ToggleLeft className="h-8 w-8 text-neutral-400" />
                    )}
                  </button>
                  <div>
                    <span className="block text-sm font-semibold text-neutral-800">
                      Free Shipping
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Force shipping fees to ₹0.00 when applied.
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/95 disabled:opacity-50 transition cursor-pointer"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                  Create Coupon Code
                </button>
              </form>
            </div>
          </div>

          {/* List and CRUD Column */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-border p-6 shadow-sm min-h-[500px]">
              <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
                <h2 className="text-xl font-display font-medium text-[#1e3522] flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Existing Coupons ({coupons.length})
                </h2>
                <div className="text-xs font-mono text-muted-foreground bg-neutral-50 border border-border px-2.5 py-1 rounded-full">
                  Supabase Live Sync
                </div>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm font-medium">Fetching active coupons from Supabase...</p>
                </div>
              ) : coupons.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center gap-4 text-muted-foreground">
                  <Ticket className="h-14 w-14 text-neutral-200 stroke-[1.5]" />
                  <div>
                    <p className="text-base font-semibold text-[#1e3522]">No Coupons Found</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                      The coupons table is empty. Create a coupon in the left column or refresh
                      database.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {coupons.map((coupon) => {
                    const isEditing = editingId === coupon.id;
                    const isExpired =
                      coupon.valid_until && new Date(coupon.valid_until) < new Date();

                    return (
                      <motion.div
                        key={coupon.id}
                        layout
                        className={`rounded-2xl border p-5 transition-all ${
                          coupon.is_active && !isExpired
                            ? "bg-white border-border hover:shadow-md"
                            : "bg-neutral-50/50 border-neutral-100"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-mono text-base font-bold bg-[#1e3522]/10 text-[#1e3522] px-3 py-1 rounded-lg">
                                {coupon.code}
                              </span>
                              <span className="text-sm font-semibold text-neutral-800">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    className="border border-border rounded px-2 py-0.5 max-w-[200px]"
                                  />
                                ) : (
                                  coupon.name
                                )}
                              </span>

                              {/* Status Badges */}
                              {coupon.is_active && !isExpired ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CheckCircle2 className="h-3 w-3" /> Active
                                </span>
                              ) : isExpired ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                                  <XCircle className="h-3 w-3" /> Expired
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full border border-neutral-200">
                                  <XCircle className="h-3 w-3" /> Disabled
                                </span>
                              )}

                              {coupon.free_shipping && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                                  Free Ship
                                </span>
                              )}
                            </div>

                            {/* Description */}
                            <p className="text-xs text-muted-foreground">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editDescription}
                                  onChange={(e) => setEditDescription(e.target.value)}
                                  className="w-full border border-border rounded px-2 py-0.5"
                                  placeholder="Description"
                                />
                              ) : (
                                coupon.description || "No description provided."
                              )}
                            </p>

                            {/* Rules metadata */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 text-xs text-neutral-600 border-t border-neutral-100/60 mt-3">
                              <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                                  Type & Value
                                </span>
                                <span className="font-semibold text-neutral-800">
                                  {coupon.discount_type === "PERCENTAGE" ? (
                                    <>
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={editDiscountValue}
                                          onChange={(e) => setEditDiscountValue(e.target.value)}
                                          className="w-14 border border-border rounded px-1"
                                        />
                                      ) : (
                                        coupon.discount_value
                                      )}
                                      % Off
                                    </>
                                  ) : coupon.discount_type === "FIXED" ? (
                                    <>
                                      Flat{" "}
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={editDiscountValue}
                                          onChange={(e) => setEditDiscountValue(e.target.value)}
                                          className="w-14 border border-border rounded px-1"
                                        />
                                      ) : (
                                        formatCurrency(coupon.discount_value)
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-amber-700 font-bold">Price Lock</span>
                                  )}
                                </span>
                              </div>

                              <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                                  Min Order / Cap
                                </span>
                                <span className="font-semibold text-neutral-800">
                                  Min:{" "}
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      value={editMinimumOrder}
                                      onChange={(e) => setEditMinimumOrder(e.target.value)}
                                      className="w-14 border border-border rounded px-1"
                                    />
                                  ) : (
                                    formatCurrency(coupon.minimum_order)
                                  )}
                                  {coupon.maximum_discount && (
                                    <span className="block text-[10px] font-normal text-muted-foreground">
                                      Cap:{" "}
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          value={editMaximumDiscount}
                                          onChange={(e) => setEditMaximumDiscount(e.target.value)}
                                          className="w-14 border border-border rounded px-1"
                                        />
                                      ) : (
                                        formatCurrency(coupon.maximum_discount)
                                      )}
                                    </span>
                                  )}
                                </span>
                              </div>

                              <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                                  Usage / Limit
                                </span>
                                <span className="font-semibold text-neutral-800">
                                  {coupon.usage_count} /{" "}
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      value={editUsageLimit}
                                      onChange={(e) => setEditUsageLimit(e.target.value)}
                                      className="w-14 border border-border rounded px-1"
                                      placeholder="No Limit"
                                    />
                                  ) : coupon.usage_limit !== null ? (
                                    coupon.usage_limit
                                  ) : (
                                    "∞"
                                  )}
                                </span>
                              </div>

                              <div>
                                <span className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">
                                  Target Final Price
                                </span>
                                <span className="font-semibold text-neutral-800">
                                  {coupon.discount_type === "FINAL_PRICE" ? (
                                    isEditing ? (
                                      <input
                                        type="number"
                                        value={editFinalPrice}
                                        onChange={(e) => setEditFinalPrice(e.target.value)}
                                        className="w-16 border border-border rounded px-1"
                                      />
                                    ) : (
                                      formatCurrency(coupon.final_price)
                                    )
                                  ) : (
                                    "N/A"
                                  )}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>Valid until: </span>
                              <span className="font-medium text-neutral-700">
                                {isEditing ? (
                                  <input
                                    type="datetime-local"
                                    value={editValidUntil}
                                    onChange={(e) => setEditValidUntil(e.target.value)}
                                    className="border border-border rounded px-2 py-0.5 text-xs"
                                  />
                                ) : (
                                  formatDate(coupon.valid_until)
                                )}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex sm:flex-col items-center justify-end gap-2.5 sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-neutral-100">
                            {/* Toggle status switch */}
                            <button
                              type="button"
                              onClick={() => handleToggleActive(coupon.id, coupon.is_active)}
                              className="mr-auto sm:mr-0 text-neutral-400 hover:text-primary transition-colors cursor-pointer"
                              title={coupon.is_active ? "Deactivate" : "Activate"}
                            >
                              {coupon.is_active ? (
                                <ToggleRight className="h-8 w-8 text-primary" />
                              ) : (
                                <ToggleLeft className="h-8 w-8 text-neutral-400" />
                              )}
                            </button>

                            <div className="flex gap-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(coupon.id)}
                                    className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 hover:bg-emerald-100 transition cursor-pointer"
                                    title="Save changes"
                                  >
                                    <Check className="h-4 w-4 font-bold" />
                                  </button>
                                  <button
                                    onClick={() => setEditingId(null)}
                                    className="p-2 bg-neutral-50 text-neutral-500 rounded-xl border border-border hover:bg-neutral-100 transition cursor-pointer"
                                    title="Cancel"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(coupon)}
                                    className="p-2 text-neutral-500 bg-neutral-50 rounded-xl border border-border hover:bg-neutral-100 hover:text-neutral-700 transition cursor-pointer"
                                    title="Edit coupon properties"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(coupon.id, coupon.code)}
                                    className="p-2 text-rose-500 bg-rose-50 rounded-xl border border-rose-100 hover:bg-rose-100 hover:text-rose-700 transition cursor-pointer"
                                    title="Delete coupon"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
