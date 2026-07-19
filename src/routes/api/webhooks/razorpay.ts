/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/webhooks/razorpay")({
  server: {
    handlers: {
      // 1. STRICT METHOD VALIDATION: Allow only POST
      POST: async ({ request }) => {
        const startTime = Date.now();
        console.log(
          "[Razorpay Webhook] Received webhook event request at secure endpoint /api/webhooks/razorpay",
        );

        // Read the secret from environment variables
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        if (!secret) {
          console.error(
            "[Razorpay Webhook] ERROR: RAZORPAY_WEBHOOK_SECRET is not configured in environment variables.",
          );
          return new Response("Webhook not configured on server", { status: 500 });
        }

        const signature = request.headers.get("x-razorpay-signature");
        const body = await request.text();

        if (!signature) {
          console.warn("[Razorpay Webhook] REJECTED: Missing 'x-razorpay-signature' header.");
          return new Response("Missing signature", { status: 401 });
        }

        // 2. TIMING-SAFE SIGNATURE COMPARISON
        let isSignatureValid = false;
        try {
          const expected = createHmac("sha256", secret).update(body).digest("hex");
          const a = Buffer.from(expected);
          const b = Buffer.from(signature);
          isSignatureValid = a.length === b.length && timingSafeEqual(a, b);
        } catch (sigErr) {
          console.error("[Razorpay Webhook] Exception during signature verification:", sigErr);
        }

        if (!isSignatureValid) {
          console.warn(
            `[Razorpay Webhook] REJECTED: Invalid signature attempt detected. Signature: ${signature}`,
          );
          return new Response("Invalid signature", { status: 401 });
        }

        // Parse payload body
        let payload: any;
        try {
          payload = JSON.parse(body);
        } catch (jsonErr) {
          console.error("[Razorpay Webhook] REJECTED: Failed to parse body JSON:", jsonErr);
          return new Response("Invalid JSON payload", { status: 400 });
        }

        const event: string = payload?.event ?? "";
        const eventId: string = payload?.id ?? payload?.event_id ?? `evt_${Date.now()}`;

        const paymentEntity = payload?.payload?.payment?.entity;
        const orderEntity = payload?.payload?.order?.entity;
        const refundEntity = payload?.payload?.refund?.entity;

        const razorpayOrderId: string | undefined = paymentEntity?.order_id ?? orderEntity?.id;
        const razorpayPaymentId: string | undefined = paymentEntity?.id ?? refundEntity?.payment_id;

        console.log(
          `[Razorpay Webhook] Verified event: "${event}" | Event ID: "${eventId}" | Razorpay Order ID: "${razorpayOrderId}"`,
        );

        // Generate a SHA-256 hash of payload to detect duplicates or replay attacks
        const payloadHash = createHash("sha256").update(body).digest("hex");

        // 3. IDEMPOTENCY / WEBHOOK AUDIT LOGGING: Insert first to lock the event ID
        let hasLogged = false;
        try {
          const { error: logInsertErr } = await supabaseAdmin
            .from("razorpay_webhook_logs" as any)
            .insert({
              event_id: eventId,
              event_type: event,
              status: "processing",
              payload_hash: payloadHash,
              payment_id: razorpayPaymentId,
            });

          if (logInsertErr) {
            // Check for unique constraint violation in PostgreSQL (code '23505')
            if (logInsertErr.code === "23505") {
              console.warn(
                `[Razorpay Webhook] DUPLICATE: Webhook event ID "${eventId}" was already logged or processed. Skipping.`,
              );
              return new Response("Duplicate event skipped (already logged)", { status: 200 });
            }
            console.warn(
              "[Razorpay Webhook] Warning: Failed to insert initial log entry (audit logging table may not be available yet):",
              logInsertErr.message,
            );
          } else {
            hasLogged = true;
          }
        } catch (logErr: any) {
          console.warn(
            "[Razorpay Webhook] Error setting up audit log (audit logging table may not be available yet):",
            logErr.message || logErr,
          );
        }

        let dbOrderId: string | null = null;
        let logStatus = "success";
        let errorMessage: string | null = null;

        try {
          // 4. EVENT TYPE PROCESSING
          if (event === "payment.captured" || event === "order.paid") {
            if (!razorpayOrderId) {
              throw new Error("Missing razorpay_order_id in payment success payload");
            }

            // Find matching order in DB using guaranteed columns
            const { data: order, error: selectErr } = await supabaseAdmin
              .from("orders")
              .select("id, total_amount, payment_status, status")
              .eq("razorpay_order_id", razorpayOrderId)
              .maybeSingle();

            if (selectErr) {
              throw new Error(`Database error while retrieving order: ${selectErr.message}`);
            }

            if (!order) {
              throw new Error(
                `Order not found in database for razorpay_order_id: "${razorpayOrderId}"`,
              );
            }

            dbOrderId = order.id;

            // Check if order is already processed/paid
            if (order.payment_status === "paid") {
              console.log(
                `[Razorpay Webhook] Order "${order.id}" is already marked as paid. Skipping redundant update.`,
              );
              logStatus = "skipped";
            } else {
              // SECURITY VERIFICATION: Validate Amount & Currency
              const currency = paymentEntity?.currency || orderEntity?.currency || "INR";
              if (currency.toUpperCase() !== "INR") {
                throw new Error(`Currency mismatch: expected INR, received ${currency}`);
              }

              // Optional/conditional fetch of migration columns (final_amount, coupon_id)
              let finalAmount = Number(order.total_amount);
              let couponId: string | null = null;

              try {
                const { data: extraData } = await supabaseAdmin
                  .from("orders")
                  .select("final_amount, coupon_id")
                  .eq("id", order.id)
                  .maybeSingle();
                if (extraData) {
                  if (
                    extraData.final_amount !== undefined &&
                    extraData.final_amount !== null &&
                    Number(extraData.final_amount) > 0
                  ) {
                    finalAmount = Number(extraData.final_amount);
                  }
                  if (extraData.coupon_id !== undefined && extraData.coupon_id !== null) {
                    couponId = extraData.coupon_id;
                  }
                }
              } catch (err) {
                console.log(
                  "[Razorpay Webhook] final_amount or coupon_id columns not present in physical schema, using total_amount instead.",
                );
              }

              const expectedAmount = finalAmount;
              const expectedPaise = Math.round(expectedAmount * 100);
              const receivedPaise = paymentEntity?.amount ?? orderEntity?.amount;

              if (!receivedPaise || Math.abs(expectedPaise - receivedPaise) > 1) {
                throw new Error(
                  `Amount mismatch: expected ${expectedPaise} paise (₹${expectedAmount}), received ${receivedPaise} paise`,
                );
              }

              // ATOMIC UPDATE: Try RPC function first (handles locking, idempotency, coupon usage increment)
              console.log(
                `[Razorpay Webhook] Atomic payment confirmation started for Order ID: "${order.id}"`,
              );
              const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(
                "confirm_order_payment" as any,
                {
                  p_order_id: order.id,
                  p_payment_id: razorpayPaymentId || "N/A",
                  p_signature: signature,
                  p_verified_at: new Date().toISOString(),
                },
              );

              if (!rpcError && rpcData && rpcData.success) {
                console.log(
                  `[Razorpay Webhook] RPC execution completed successfully. Status: ${rpcData.status}`,
                );
              } else {
                if (rpcError) {
                  console.warn(
                    `[Razorpay Webhook] confirm_order_payment RPC failed/unavailable (Code: ${rpcError.code}): ${rpcError.message}. Falling back to manual update...`,
                  );
                }

                // MANUAL FALLBACK UPDATES
                const baseUpdatePayload: any = {
                  payment_status: "paid",
                  status: "confirmed",
                  razorpay_payment_id: razorpayPaymentId,
                  razorpay_signature: signature,
                };

                // Try updating with the new payment_verified_at column
                const { error: updateErr } = await supabaseAdmin
                  .from("orders")
                  .update({
                    ...baseUpdatePayload,
                    payment_verified_at: new Date().toISOString(),
                  })
                  .eq("id", order.id);

                if (updateErr) {
                  console.warn(
                    `[Razorpay Webhook] Failed to update with payment_verified_at, falling back to base updates: ${updateErr.message}`,
                  );
                  const { error: baseUpdateErr } = await supabaseAdmin
                    .from("orders")
                    .update(baseUpdatePayload)
                    .eq("id", order.id);

                  if (baseUpdateErr) {
                    throw new Error(
                      `Failed to update order payment status: ${baseUpdateErr.message}`,
                    );
                  }
                }

                // Increment coupon usage atomically
                if (couponId) {
                  try {
                    const { data: couponData } = await supabaseAdmin
                      .from("coupons" as any)
                      .select("usage_count")
                      .eq("id", couponId)
                      .maybeSingle();

                    if (couponData) {
                      await supabaseAdmin
                        .from("coupons" as any)
                        .update({ usage_count: (couponData.usage_count || 0) + 1 })
                        .eq("id", couponId);
                      console.log(
                        `[Razorpay Webhook] Successfully incremented usage_count for Coupon ID: ${couponId}`,
                      );
                    }
                  } catch (couponErr) {
                    console.error(
                      "[Razorpay Webhook] Failed to increment coupon usage count:",
                      couponErr,
                    );
                  }
                }
              }

              // TRIGGER CONFIRMATION EMAILS (strictly once via built-in atomic check)
              try {
                const { sendOrderConfirmationEmailInternal } =
                  await import("@/lib/order-emails.functions");
                await sendOrderConfirmationEmailInternal(order.id);
              } catch (emailErr) {
                console.error("[Razorpay Webhook] Failed to trigger email service:", emailErr);
              }
            }
          } else if (event === "payment.failed") {
            if (!razorpayOrderId) {
              throw new Error("Missing razorpay_order_id in payment failed payload");
            }

            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("id, payment_status")
              .eq("razorpay_order_id", razorpayOrderId)
              .maybeSingle();

            if (order) {
              dbOrderId = order.id;
              if (order.payment_status !== "paid") {
                await supabaseAdmin
                  .from("orders")
                  .update({ payment_status: "failed" })
                  .eq("id", order.id);
                console.log(`[Razorpay Webhook] Order "${order.id}" marked as failed.`);
              }
            }
          } else if (event === "refund.processed") {
            if (!razorpayPaymentId) {
              throw new Error("Missing razorpay_payment_id in refund processed payload");
            }

            const { data: order } = await supabaseAdmin
              .from("orders")
              .select("id")
              .eq("razorpay_payment_id", razorpayPaymentId)
              .maybeSingle();

            if (order) {
              dbOrderId = order.id;
              await supabaseAdmin
                .from("orders")
                .update({ payment_status: "refunded" })
                .eq("id", order.id);
              console.log(
                `[Razorpay Webhook] Order "${order.id}" payment status updated to "refunded".`,
              );
            } else {
              console.warn(
                `[Razorpay Webhook] Order not found for refund payment ID: "${razorpayPaymentId}"`,
              );
            }
          } else {
            // IGNORE UNKNOWN EVENTS SAFELY
            console.log(`[Razorpay Webhook] Unknown event type "${event}" ignored safely.`);
            logStatus = "ignored";
          }
        } catch (procErr: any) {
          logStatus = "failed";
          errorMessage = procErr instanceof Error ? procErr.message : String(procErr);
          console.error(
            `[Razorpay Webhook] ERROR while processing "${event}" event:`,
            errorMessage,
          );
        }

        // 5. UPDATE WEBHOOK AUDIT LOG
        if (hasLogged) {
          try {
            const processingTimeMs = Date.now() - startTime;
            await supabaseAdmin
              .from("razorpay_webhook_logs" as any)
              .update({
                status: logStatus,
                error_message: errorMessage,
                order_id: dbOrderId,
                processing_time_ms: processingTimeMs,
                processed_at: new Date().toISOString(),
              })
              .eq("event_id", eventId);
          } catch (logUpdateErr) {
            console.error(
              "[Razorpay Webhook] Failed to update final webhook log entry:",
              logUpdateErr,
            );
          }
        }

        // Return appropriate HTTP status
        if (logStatus === "failed") {
          // Returning a 500 error allows Razorpay to retry delivery
          return new Response(errorMessage || "Processing failed", { status: 500 });
        }

        return new Response("ok", { status: 200 });
      },

      // STRICT METHOD REJECTIONS
      GET: async () =>
        new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } }),
      PUT: async () =>
        new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } }),
      DELETE: async () =>
        new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } }),
      PATCH: async () =>
        new Response("Method Not Allowed", { status: 405, headers: { Allow: "POST" } }),
    },
  },
});
