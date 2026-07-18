import { createFileRoute, useNavigate } from "@tanstack/react-router";

const checkoutHead = () => ({
  meta: [
    { title: "Checkout — House Of Kanti" },
    {
      name: "description",
      content: "Complete your House Of Kanti order securely with Razorpay or WhatsApp checkout.",
    },
    { name: "robots", content: "noindex, follow" },
    { property: "og:title", content: "Checkout — House Of Kanti" },
    { property: "og:description", content: "Secure checkout for your House Of Kanti order." },
    { property: "og:url", content: "https://houseofkanti.ai.studio/checkout" },
  ],
  links: [{ rel: "canonical", href: "https://houseofkanti.ai.studio/checkout" }],
});
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { whatsappLink } from "@/lib/contact";
import { toast } from "sonner";
import {
  CheckCircle2,
  MessageCircle,
  Copy,
  Calendar,
  ShieldCheck,
  Clock,
  Download,
  ArrowRight,
} from "lucide-react";
import { createRazorpayOrder, verifyRazorpayPayment } from "@/lib/razorpay.functions";
import { sendOrderConfirmationEmail } from "@/lib/order-emails.functions";
import { calculateDiscount, Coupon } from "@/lib/coupons";
import { OrderSummary } from "@/components/site/OrderSummary";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

function getBaseProductId(cartItemId: string) {
  const match = cartItemId.match(/^[0-9a-fA-F-]{36}/);
  return match ? match[0] : cartItemId;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

export const Route = createFileRoute("/checkout")({
  head: checkoutHead,
  component: CheckoutPage,
});

type Address = {
  id: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  is_default: boolean;
};

function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { items, total, clear } = useCart();

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

  const shippingFee = total >= 999 || total === 0 ? 0 : 80;

  // Calculate discount and final payable amounts
  const { discountAmount, isFreeShipping } = appliedCoupon
    ? calculateDiscount(appliedCoupon, total, shippingFee)
    : { discountAmount: 0, isFreeShipping: false };

  const finalShippingFee = isFreeShipping ? 0 : shippingFee;
  const grandTotal = Math.max(0, total - discountAmount + finalShippingFee);

  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cod">("online");
  const [success, setSuccess] = useState<{
    orderNumber: string;
    waUrl: string;
    paymentStatus?: string;
    estimatedProcessing?: string;
    items?: {
      id: string;
      name: string;
      price: number;
      quantity: number;
      image_url?: string;
    }[];
    total?: number;
    discount?: number;
    shipping?: number;
    grandTotal?: number;
    shippingAddr?: {
      full_name: string;
      phone: string;
      line1: string;
      line2?: string | null;
      city: string;
      state: string;
      pincode: string;
    } | null;
    couponCode?: string;
  } | null>(null);

  // Inline new-address form
  const [newAddr, setNewAddr] = useState({
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });
  const [showNew, setShowNew] = useState(false);

  const handleApplyCoupon = (coupon: Coupon) => {
    setAppliedCoupon(coupon);
    localStorage.setItem("sk_applied_coupon_v1", JSON.stringify(coupon));
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("sk_applied_coupon_v1");
  };

  useEffect(() => {
    if (!authLoading && !user) navigate({ to: "/auth", search: { redirect: "/checkout" } });
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false })
      .then(({ data }) => {
        const list = (data ?? []) as Address[];
        setAddresses(list);
        if (list.length === 0) setShowNew(true);
        else setSelected(list[0].id);
      });
  }, [user]);

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (items.length === 0) return toast.error("Your cart is empty");

    let shipping: Address | null = addresses.find((a) => a.id === selected) ?? null;

    setPlacing(true);
    try {
      if (showNew) {
        const { data, error } = await supabase
          .from("addresses")
          .insert({ ...newAddr, user_id: user.id, is_default: addresses.length === 0 })
          .select()
          .single();
        if (error) throw error;
        shipping = data as Address;
      }
      if (!shipping) throw new Error("Please select a shipping address");

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, "0");
      const randSuffix = Math.floor(1000 + Math.random() * 9000); // 4-digit random number to prevent collisions
      const orderNumber = `kanti-${pad(now.getDate())}${pad(now.getMonth() + 1)}${now.getFullYear()}${pad(now.getHours())}${pad(now.getMinutes())}-${randSuffix}`;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const orderPayload: any = {
        user_id: user.id,
        order_number: orderNumber,
        total_amount: grandTotal,
        status: "pending",
        payment_method: paymentMethod,
        notes: notes, // Store plain user notes directly
        shipping_full_name: shipping.full_name,
        shipping_phone: shipping.phone,
        shipping_line1: shipping.line1,
        shipping_line2: shipping.line2,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_pincode: shipping.pincode,
        // Coupon snapshotted fields
        coupon_id: appliedCoupon ? appliedCoupon.id || null : null,
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        coupon_type: appliedCoupon
          ? appliedCoupon.discount_type || appliedCoupon.discountType
          : null,
        coupon_value: appliedCoupon ? appliedCoupon.discountValue : null,
        discount_percentage:
          appliedCoupon &&
          (appliedCoupon.discountType === "percentage" ||
            appliedCoupon.discount_type === "PERCENTAGE")
            ? appliedCoupon.discountValue
            : 0,
        discount_amount: discountAmount,
        original_amount: total + finalShippingFee,
        shipping_amount: finalShippingFee,
        tax_amount: 0,
        final_amount: grandTotal,
        customer_email_sent: false,
        admin_email_sent: false,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let order: any = null;
      // Insert directly into the orders table with the relational columns
      const insertResult = await supabase.from("orders").insert(orderPayload).select().single();
      if (insertResult.error) {
        console.error("Order insertion failed:", insertResult.error);
        throw insertResult.error;
      }
      order = insertResult.data;

      const orderItems = items.map((it) => ({
        order_id: order.id,
        product_id: getBaseProductId(it.id),
        product_name: it.name,
        product_image: it.image_url,
        unit_price: it.price,
        quantity: it.quantity,
      }));

      const { error: ierr } = await supabase.from("order_items").insert(orderItems);
      if (ierr) throw ierr;

      // Build WhatsApp message helper with complete breakdown of Subtotal, Discount, Shipping, and final Payable Amount
      const buildWaUrl = (paid: boolean) => {
        const lines = items
          .map((it) => `• ${it.name} × ${it.quantity} — ₹${(it.price * it.quantity).toFixed(0)}`)
          .join("\n");
        const payLabel =
          paymentMethod === "cod" ? "COD" : paid ? "Paid Online ✅" : "Online (pending)";
        const shipLine = finalShippingFee === 0 ? "Free" : `₹${finalShippingFee.toFixed(2)}`;
        const couponLine = appliedCoupon
          ? `\n*Coupon applied:* ${appliedCoupon.code} (-₹${discountAmount.toFixed(2)})`
          : "";
        const addr = shipping!;
        const msg = `*New Kanti order ${order.order_number}*\n\n${lines}\n\n*Subtotal:* ₹${total.toFixed(2)}${couponLine}\n*Shipping:* ${shipLine}\n*Total:* ₹${grandTotal.toFixed(2)}\n*Payment:* ${payLabel}\n\n*Ship to:*\n${addr.full_name}\n${addr.line1}${addr.line2 ? ", " + addr.line2 : ""}\n${addr.city}, ${addr.state} — ${addr.pincode}\n📞 ${addr.phone}${notes ? `\n\n*Notes:* ${notes}` : ""}`;
        return whatsappLink(msg);
      };

      if (paymentMethod === "cod") {
        const waUrl = buildWaUrl(false);
        try {
          await sendOrderConfirmationEmail({ data: { orderId: order.id } });
        } catch (emailErr) {
          console.error("Failed to trigger COD order confirmation email:", emailErr);
        }
        if (typeof window !== "undefined") window.open(waUrl, "_blank", "noopener,noreferrer");
        clear();
        localStorage.removeItem("sk_applied_coupon_v1"); // Clean up coupon on order success
        setSuccess({
          orderNumber: order.order_number,
          waUrl,
          paymentStatus: "Cash on Delivery (Pending)",
          estimatedProcessing: "1-2 Business Days",
          items: [...items],
          total,
          discount: discountAmount,
          shipping: finalShippingFee,
          grandTotal,
          shippingAddr: shipping!,
          couponCode: appliedCoupon?.code,
        });
        return;
      }

      // Online payment via Razorpay
      const ok = await loadRazorpayScript();
      if (!ok) throw new Error("Failed to load payment gateway");

      // Pass the coupon code to backend so that the server checks and applies the same discount securely
      const rzp = await createRazorpayOrder({
        data: {
          orderId: order.id,
          couponCode: appliedCoupon?.code,
        },
      });

      await new Promise<void>((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: rzp.keyId,
          amount: rzp.amount,
          currency: rzp.currency,
          name: "Kanti Herbal",
          description: `Order ${rzp.orderNumber}`,
          order_id: rzp.razorpayOrderId,
          prefill: {
            name: shipping!.full_name,
            contact: shipping!.phone,
            email: user.email ?? "",
          },
          theme: { color: "#3a5a40" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async (response: any) => {
            try {
              await verifyRazorpayPayment({
                data: {
                  orderId: order.id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
              });
              const waUrl = buildWaUrl(true);
              if (typeof window !== "undefined")
                window.open(waUrl, "_blank", "noopener,noreferrer");
              clear();
              localStorage.removeItem("sk_applied_coupon_v1"); // Clean up coupon on payment success
              setSuccess({
                orderNumber: order.order_number,
                waUrl,
                paymentStatus: "Paid Online (Razorpay)",
                estimatedProcessing: "1-2 Business Days",
                items: [...items],
                total,
                discount: discountAmount,
                shipping: finalShippingFee,
                grandTotal,
                shippingAddr: shipping!,
                couponCode: appliedCoupon?.code,
              });
              resolve();
            } catch (err) {
              reject(err);
            }
          },
          modal: {
            ondismiss: () => {
              toast.error("Payment cancelled. Your order is saved as pending.");
              reject(new Error("Payment cancelled"));
            },
          },
        });
        checkout.open();
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Order failed");
    } finally {
      setPlacing(false);
    }
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="mx-auto max-w-7xl px-4 py-20 text-center text-muted-foreground">
          Loading…
        </div>
      </div>
    );
  }

  if (success) {
    const handlePrint = () => {
      if (typeof window !== "undefined") {
        window.print();
      }
    };

    const handleCopy = () => {
      if (typeof navigator !== "undefined" && success.orderNumber) {
        navigator.clipboard.writeText(success.orderNumber);
        toast.success("Order number copied to clipboard!");
      }
    };

    return (
      <div className="min-h-screen bg-[#faf9f6]">
        {/* Printable Invoice Block (Hidden on screen, visible on print) */}
        <div className="hidden print:block bg-white text-black p-10 font-sans max-w-3xl mx-auto">
          <div className="border-b-2 border-primary/20 pb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-[#1e3522]">HOUSE OF KANTI</h1>
              <p className="text-xs italic text-[#c5a880] tracking-widest mt-1">
                WHERE PURITY MEETS GLOW
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                support@houseofkanti.shop • +91 88060 18688 • Pune, Maharashtra, India
              </p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-[#1e3522]">INVOICE / RECEIPT</h2>
              <p className="text-sm font-medium mt-1">Invoice #: {success.orderNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Date:{" "}
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 my-8 text-sm">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mb-2">
                SHIPPING ADDRESS
              </h3>
              <p className="font-semibold text-[#1e3522]">{success.shippingAddr?.full_name}</p>
              <p className="text-muted-foreground">{success.shippingAddr?.line1}</p>
              {success.shippingAddr?.line2 && (
                <p className="text-muted-foreground">{success.shippingAddr?.line2}</p>
              )}
              <p className="text-muted-foreground">
                {success.shippingAddr?.city}, {success.shippingAddr?.state} —{" "}
                {success.shippingAddr?.pincode}
              </p>
              <p className="text-muted-foreground mt-1">Phone: {success.shippingAddr?.phone}</p>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mb-2">
                ORDER METADATA
              </h3>
              <p className="text-muted-foreground">
                <span className="font-semibold">Payment Status:</span> {success.paymentStatus}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold">Processing:</span> {success.estimatedProcessing}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold">Support:</span> support@houseofkanti.shop
              </p>
            </div>
          </div>

          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mb-3">
            ITEMS SUMMARY
          </h3>
          <table className="w-full text-sm border-collapse mb-8">
            <thead>
              <tr className="border-b-2 border-muted text-muted-foreground font-semibold">
                <th className="text-left py-2 font-medium">Product Item Name</th>
                <th className="text-center py-2 font-medium w-16">Qty</th>
                <th className="text-right py-2 font-medium w-28">Unit Price</th>
                <th className="text-right py-2 font-medium w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {success.items?.map((item, idx) => (
                <tr key={idx} className="border-b border-muted/50">
                  <td className="py-3 font-medium text-[#1e3522]">{item.name}</td>
                  <td className="py-3 text-center text-muted-foreground">{item.quantity}</td>
                  <td className="py-3 text-right text-muted-foreground">
                    ₹{item.price.toFixed(2)}
                  </td>
                  <td className="py-3 text-right font-semibold text-[#1e3522]">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end mt-4 text-sm">
            <div className="w-64 space-y-2 border-t pt-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Items Subtotal:</span>
                <span>₹{success.total?.toFixed(2)}</span>
              </div>
              {success.couponCode && (
                <div className="flex justify-between text-red-600">
                  <span>Discount ({success.couponCode}):</span>
                  <span>-₹{success.discount?.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping:</span>
                <span>{success.shipping === 0 ? "Free" : `₹${success.shipping?.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#1e3522] border-t-2 border-[#1e3522] pt-2">
                <span>Total Amount Paid:</span>
                <span>₹{success.grandTotal?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-muted/50 mt-12 pt-6 text-center text-xs text-muted-foreground">
            <p className="font-semibold text-[#1e3522]">THANK YOU FOR YOUR PURCHASE!</p>
            <p className="mt-1">
              This is a computer-generated confirmation invoice. No physical signature is required.
            </p>
          </div>
        </div>

        {/* Regular UI Screen Block (Hidden when printing) */}
        <div className="print:hidden min-h-screen flex flex-col justify-between">
          <Header />
          <main className="flex-grow mx-auto max-w-2xl px-4 py-12 sm:px-6">
            <div className="rounded-3xl border border-border/40 bg-card p-8 md:p-10 shadow-card text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#1e3522]" />

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 shadow-sm border border-emerald-100">
                <CheckCircle2 className="h-9 w-9" />
              </div>

              <h1 className="mt-6 font-display text-3xl font-700 tracking-tight text-foreground md:text-4xl">
                Order Placed Successfully!
              </h1>
              <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
                Thank you for shopping with us. Your order is safely logged and we have sent
                confirmation emails to your address.
              </p>

              {/* Order Info Panel */}
              <div className="mt-8 rounded-2xl bg-[#faf9f6] border border-border/60 p-5 text-left space-y-4">
                <div className="flex items-center justify-between border-b border-border/50 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Order Number
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-base font-bold text-[#1e3522]">
                        {success.orderNumber}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition cursor-pointer"
                        title="Copy Order Number"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Estimated Delivery
                    </span>
                    <p className="text-sm font-semibold text-foreground flex items-center gap-1 justify-end">
                      <Clock className="h-3.5 w-3.5 text-[#c5a880]" /> 1-2 Business Days
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm pt-1">
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Payment Status
                    </span>
                    <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                      <ShieldCheck className="h-3 w-3" /> {success.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      Receipt & Documentation
                    </span>
                    <button
                      onClick={handlePrint}
                      className="mt-1 text-xs font-semibold text-primary hover:underline flex items-center gap-1 text-[#1e3522] cursor-pointer"
                    >
                      <Download className="h-3 w-3" /> Download Printable Invoice
                    </button>
                  </div>
                </div>
              </div>

              {/* Items Summary Dropdown */}
              <div className="mt-6 border-t border-border/40 pt-6">
                <div className="flex justify-between items-center text-sm font-semibold mb-3">
                  <span className="text-muted-foreground">Items Ordered</span>
                  <span className="text-foreground">{success.items?.length || 0} items</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2.5 pr-2">
                  {success.items?.map((it, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between text-xs py-1 border-b border-border/30 last:border-0"
                    >
                      <span className="text-muted-foreground truncate max-w-[280px] text-left">
                        {it.name}{" "}
                        <span className="text-foreground/80 font-medium">× {it.quantity}</span>
                      </span>
                      <span className="font-mono text-foreground font-semibold">
                        ₹{(it.price * it.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center border-t border-border/30 pt-3 mt-3 text-sm font-bold text-[#1e3522]">
                  <span>Total Amount Paid:</span>
                  <span className="font-mono text-base">₹{success.grandTotal?.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <a
                  href={success.waUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white hover:opacity-95 transition shadow-sm"
                >
                  <MessageCircle className="h-4 w-4 fill-white" /> Complete WhatsApp Enquiry
                </a>
                <button
                  onClick={handlePrint}
                  className="rounded-full border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4 text-muted-foreground" /> Invoice
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2.5 justify-center border-t border-border/40 pt-4 text-xs">
                <button
                  onClick={() => navigate({ to: "/account/orders" })}
                  className="text-muted-foreground hover:text-foreground font-semibold transition flex items-center justify-center gap-1 cursor-pointer"
                >
                  View My Order History <ArrowRight className="h-3 w-3" />
                </button>
                <span className="hidden sm:inline text-border">|</span>
                <button
                  onClick={() => navigate({ to: "/" })}
                  className="text-[#c5a880] hover:opacity-80 font-semibold transition cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-700 text-foreground">Checkout</h1>

        <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
              <h2 className="font-display text-xl font-700 text-foreground">Shipping address</h2>

              {addresses.length > 0 && !showNew && (
                <ul className="mt-4 space-y-3">
                  {addresses.map((a) => (
                    <li key={a.id}>
                      <label
                        className={`flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${selected === a.id ? "border-primary bg-primary/5" : "border-border"}`}
                      >
                        <input
                          type="radio"
                          name="addr"
                          checked={selected === a.id}
                          onChange={() => setSelected(a.id)}
                          className="mt-1"
                        />
                        <div className="text-sm">
                          <div className="font-display text-base font-700 text-foreground">
                            {a.full_name}
                          </div>
                          <div className="text-muted-foreground">
                            {a.line1}
                            {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} — {a.pincode} ·{" "}
                            {a.phone}
                          </div>
                        </div>
                      </label>
                    </li>
                  ))}
                </ul>
              )}

              {!showNew && (
                <button
                  type="button"
                  onClick={() => setShowNew(true)}
                  className="mt-4 text-sm font-semibold text-primary hover:underline"
                >
                  + Use a new address
                </button>
              )}

              {showNew && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Full name"
                    required
                    value={newAddr.full_name}
                    onChange={(v) => setNewAddr({ ...newAddr, full_name: v })}
                  />
                  <Input
                    placeholder="Phone"
                    required
                    value={newAddr.phone}
                    onChange={(v) => setNewAddr({ ...newAddr, phone: v })}
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Address line 1"
                    required
                    value={newAddr.line1}
                    onChange={(v) => setNewAddr({ ...newAddr, line1: v })}
                  />
                  <Input
                    className="sm:col-span-2"
                    placeholder="Address line 2 (optional)"
                    value={newAddr.line2}
                    onChange={(v) => setNewAddr({ ...newAddr, line2: v })}
                  />
                  <Input
                    placeholder="City"
                    required
                    value={newAddr.city}
                    onChange={(v) => setNewAddr({ ...newAddr, city: v })}
                  />
                  <Input
                    placeholder="State"
                    required
                    value={newAddr.state}
                    onChange={(v) => setNewAddr({ ...newAddr, state: v })}
                  />
                  <Input
                    placeholder="Pincode"
                    required
                    value={newAddr.pincode}
                    onChange={(v) => setNewAddr({ ...newAddr, pincode: v })}
                  />
                  {addresses.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setShowNew(false)}
                      className="text-left text-sm font-medium text-muted-foreground hover:text-foreground sm:col-span-2"
                    >
                      ← Use a saved address
                    </button>
                  )}
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
              <h2 className="font-display text-xl font-700 text-foreground">Order notes</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Any special instructions?"
                className="mt-3 w-full rounded-lg border border-border bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-primary"
              />
            </section>

            <section className="rounded-3xl border border-border/60 bg-card p-6 shadow-card">
              <h2 className="font-display text-xl font-700 text-foreground">Payment</h2>
              <div className="mt-3 space-y-2">
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${paymentMethod === "online" ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "online"}
                    onChange={() => setPaymentMethod("online")}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <div className="font-display text-base font-700 text-foreground">
                      Pay Online
                    </div>
                    <div className="text-muted-foreground">
                      UPI, Cards, NetBanking & Wallets via Razorpay
                    </div>
                  </div>
                </label>
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <input
                    type="radio"
                    name="pm"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-1"
                  />
                  <div className="text-sm">
                    <div className="font-display text-base font-700 text-foreground">
                      Cash on Delivery
                    </div>
                    <div className="text-muted-foreground">Pay in cash when your order arrives</div>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <aside className="h-fit rounded-3xl border border-border/60 bg-card p-6 shadow-card">
            <OrderSummary
              items={items}
              total={total}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              showItemsList={true}
              actionButton={
                <button
                  type="submit"
                  disabled={placing || items.length === 0}
                  className="w-full inline-flex items-center justify-center rounded-full bg-primary py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 cursor-pointer"
                >
                  {placing
                    ? "Processing…"
                    : paymentMethod === "online"
                      ? `Pay ₹${grandTotal.toFixed(2)}`
                      : "Place order (COD)"}
                </button>
              }
            />
          </aside>
        </form>
      </main>
      <Footer />
    </div>
  );
}

function Input({
  className = "",
  value,
  onChange,
  ...rest
}: { value: string; onChange: (v: string) => void; className?: string } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  return (
    <input
      {...rest}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`block w-full rounded-lg border border-border bg-transparent px-3.5 py-2.5 text-sm outline-none focus:border-primary ${className}`}
    />
  );
}
