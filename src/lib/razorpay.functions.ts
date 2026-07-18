import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { calculateDiscount } from "@/lib/coupons";

/**
 * Create a Razorpay Order for an existing pending order in our DB.
 * Returns the Razorpay order id + public key id needed to launch checkout.
 */
export const createRazorpayOrder = createServerFn({ method: "POST" })
  .inputValidator((data: { orderId: string; couponCode?: string }) => {
    if (!data?.orderId || typeof data.orderId !== "string") {
      throw new Error("orderId is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    console.log(
      "[createRazorpayOrder] Initiating order creation for orderId:",
      data.orderId,
      "with coupon:",
      data.couponCode,
    );

    // Step 3: Print which environment variables are available
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("[createRazorpayOrder] Server Environment Check:", {
      RAZORPAY_KEY_ID_EXISTS: !!keyId,
      RAZORPAY_KEY_SECRET_EXISTS: !!keySecret,
      SUPABASE_URL_EXISTS: !!supabaseUrl,
      SUPABASE_SERVICE_ROLE_KEY_EXISTS: !!supabaseServiceRole,
      NODE_ENV: process.env.NODE_ENV,
    });

    if (!keyId || !keySecret) {
      console.error("[createRazorpayOrder] Razorpay keys not configured on backend");
      throw new Error("Razorpay keys not configured");
    }

    try {
      // Look up the order to get amount + order_number
      console.log("[createRazorpayOrder] Fetching order from DB...");
      const { data: order, error } = await supabaseAdmin
        .from("orders")
        .select(
          "id, order_number, total_amount, final_amount, notes, razorpay_order_id, payment_status",
        )
        .eq("id", data.orderId)
        .single();

      if (error) {
        console.error("[createRazorpayOrder] Database error fetching order:", error);
        throw new Error(`Order database fetch failed: ${error.message}`);
      }
      if (!order) {
        console.error("[createRazorpayOrder] Order not found in DB");
        throw new Error("Order not found");
      }

      console.log("[createRazorpayOrder] DB Order fetched successfully:", order);

      if (order.payment_status === "paid") {
        console.warn("[createRazorpayOrder] Order is already paid:", order.id);
        throw new Error("Order is already paid");
      }

      // Read already validated final_amount from the order's final_amount column (or fallback to total_amount)
      const finalAmount = Number(order.final_amount ?? order.total_amount);
      if (isNaN(finalAmount) || finalAmount <= 0) {
        console.error(
          "[createRazorpayOrder] Invalid order amount:",
          order.final_amount ?? order.total_amount,
        );
        throw new Error("Invalid order total amount");
      }

      console.log(
        "[createRazorpayOrder] Using database validated final_amount / total_amount directly:",
        finalAmount,
      );
      const expectedTotal = finalAmount;

      // If we already created a Razorpay order, reuse it
      if (order.razorpay_order_id) {
        console.log(
          "[createRazorpayOrder] Existing razorpay_order_id found in order record, reusing:",
          order.razorpay_order_id,
        );
        return {
          razorpayOrderId: order.razorpay_order_id,
          keyId,
          amount: Math.round(expectedTotal * 100),
          currency: "INR",
          orderNumber: order.order_number,
        };
      }

      const amountPaise = Math.round(expectedTotal * 100);
      const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      // Step 5: Verify the Razorpay Order API call parameters
      const rzpRequestPayload = {
        amount: amountPaise,
        currency: "INR",
        receipt: order.order_number,
        notes: { internal_order_id: order.id, order_number: order.order_number },
      };

      console.log(
        "[createRazorpayOrder] Step 5: Sending request to Razorpay Order API with parameters:",
        JSON.stringify(rzpRequestPayload, null, 2),
      );

      const res = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rzpRequestPayload),
      });

      // Step 4: Log the complete Razorpay API response
      console.log("[createRazorpayOrder] Step 4: Razorpay API Response Status:", res.status);
      const resText = await res.text();
      console.log("[createRazorpayOrder] Step 4: Razorpay API Response Body:", resText);

      if (!res.ok) {
        console.error(
          "[createRazorpayOrder] Razorpay order API call failed on Razorpay side:",
          res.status,
          resText,
        );
        throw new Error(
          JSON.stringify({
            message: "Failed to create payment order on Razorpay",
            status: res.status,
            body: resText,
          }),
        );
      }

      const rzpOrder = JSON.parse(resText) as { id: string };
      console.log(
        "[createRazorpayOrder] Successfully created Razorpay order. Order ID:",
        rzpOrder.id,
      );

      // Step 6: Verify database save
      console.log("[createRazorpayOrder] Step 6: Saving razorpay_order_id to orders table...");
      const { data: updatedOrders, error: updateError } = await supabaseAdmin
        .from("orders")
        .update({ razorpay_order_id: rzpOrder.id })
        .eq("id", order.id)
        .select();

      if (updateError) {
        console.error(
          "[createRazorpayOrder] Step 6: Failed to save razorpay_order_id to DB:",
          updateError,
        );
        throw new Error(
          `Database update failed to persist razorpay_order_id: ${updateError.message}`,
        );
      }

      console.log(
        "[createRazorpayOrder] Step 6: Successfully updated order in DB with razorpay_order_id:",
        updatedOrders,
      );

      return {
        razorpayOrderId: rzpOrder.id,
        keyId,
        amount: amountPaise,
        currency: "INR",
        orderNumber: order.order_number,
      };
    } catch (err: unknown) {
      console.error("[createRazorpayOrder] Caught fatal exception in handler:", err);
      throw err;
    }
  });

/**
 * Verify Razorpay payment signature client-returned after checkout.
 * Marks order as paid on success.
 */
export const verifyRazorpayPayment = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      orderId: string;
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }) => {
      if (
        !data?.orderId ||
        !data.razorpay_order_id ||
        !data.razorpay_payment_id ||
        !data.razorpay_signature
      ) {
        throw new Error("Missing payment verification fields");
      }
      return data;
    },
  )
  .handler(async ({ data }) => {
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) throw new Error("Razorpay secret not configured");

    // Fetch order to check if already paid or if order ID matches (replay & signature injection protection)
    const { data: order, error: fetchErr } = await supabaseAdmin
      .from("orders")
      .select("id, razorpay_order_id, payment_status")
      .eq("id", data.orderId)
      .single();
    if (fetchErr || !order) throw new Error("Order not found");

    if (order.payment_status === "paid") {
      return { success: true }; // Already paid and processed (e.g. by webhook)
    }

    if (order.razorpay_order_id !== data.razorpay_order_id) {
      throw new Error("Razorpay order ID mismatch");
    }

    const { createHmac, timingSafeEqual } = await import("node:crypto");

    const expected = createHmac("sha256", keySecret)
      .update(`${data.razorpay_order_id}|${data.razorpay_payment_id}`)
      .digest("hex");

    const a = Buffer.from(expected);
    const b = Buffer.from(data.razorpay_signature);
    const ok = a.length === b.length && timingSafeEqual(a, b);
    if (!ok) {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed" })
        .eq("id", data.orderId);
      throw new Error("Invalid payment signature");
    }

    const { error } = await supabaseAdmin
      .from("orders")
      .update({
        payment_status: "paid",
        status: "confirmed",
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
      })
      .eq("id", data.orderId);
    if (error) throw new Error("Failed to update order");

    // Send confirmation email
    try {
      const { sendOrderConfirmationEmail } = await import("@/lib/order-emails.functions");
      await sendOrderConfirmationEmail({ data: { orderId: data.orderId } });
    } catch (emailErr) {
      console.error("[verifyRazorpayPayment] Failed to send order confirmation email:", emailErr);
    }

    return { success: true };
  });
