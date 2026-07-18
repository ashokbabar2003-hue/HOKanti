import { createServerFn } from "@tanstack/react-start";
import nodemailer from "nodemailer";
import path from "node:path";
import fs from "node:fs";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// Get SMTP Credentials
const host = process.env.SMTP_HOST || "smtp.hostinger.com";
const port = parseInt(process.env.SMTP_PORT || "465", 10);
const user = process.env.SMTP_USER || "support@houseofkanti.shop";
const pass = process.env.SMTP_PASS;

/**
 * Server function to trigger sending order confirmation emails.
 * Uses a robust atomic database locking mechanism to prevent duplicate sends.
 */
export const sendOrderConfirmationEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { orderId: string }) => {
    if (!data?.orderId || typeof data.orderId !== "string") {
      throw new Error("orderId is required");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { orderId } = data;
    console.log("[Email System] Request to send confirmation emails for order:", orderId);

    if (!pass) {
      console.warn("[Email System] SMTP_PASS is not configured. Email sending skipped.");
      return { success: false, error: "SMTP credentials not configured on server" };
    }

    try {
      // 1. ATOMIC LOCKING CHECK
      // Attempt to set email status to sending. If it is already true, this update will affect 0 rows,
      // meaning another thread/webhook is already handling or has completed this send.
      const { data: updatedRows, error: lockErr } = await supabaseAdmin
        .from("orders")
        .update({
          customer_email_sent: true,
          admin_email_sent: true,
          customer_email_sent_at: new Date().toISOString(),
          admin_email_sent_at: new Date().toISOString(),
        })
        .eq("id", orderId)
        .or("customer_email_sent.eq.false,customer_email_sent.is.null") // only lock if it hasn't been sent/locked yet (either false or null)
        .select();

      if (lockErr) {
        console.error("[Email System] Lock database update error:", lockErr);
        // Fallback safety check: if table update failed (e.g. columns don't exist yet), we still proceed to send, but log it.
        console.warn(
          "[Email System] DB lock columns might not exist. Falling back to un-locked fetch...",
        );
      } else if (updatedRows && updatedRows.length === 0) {
        console.log(
          "[Email System] Lock acquired by another thread or emails already sent. Skipping duplicate send.",
        );
        return { success: true, message: "Emails already processed" };
      }

      // 2. FETCH COMPLETE ORDER DETAILS
      const { data: order, error: orderErr } = await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (orderErr || !order) {
        console.error("[Email System] Failed to fetch order:", orderErr);
        return { success: false, error: "Order not found" };
      }

      // Fetch order items
      const { data: orderItems, error: itemsErr } = await supabaseAdmin
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsErr || !orderItems || orderItems.length === 0) {
        console.error("[Email System] Failed to fetch order items:", itemsErr);
        return { success: false, error: "Order items not found" };
      }

      // 3. FETCH CUSTOMER EMAIL FROM AUTH
      let customerEmail = "";
      try {
        const { data: userData, error: userErr } = await supabaseAdmin.auth.admin.getUser(
          order.user_id,
        );
        if (userErr) {
          console.error("[Email System] Error fetching user auth record:", userErr);
        } else {
          customerEmail = userData?.user?.email || "";
        }
      } catch (authErr) {
        console.error("[Email System] Auth exception:", authErr);
      }

      if (!customerEmail) {
        console.warn(
          "[Email System] Customer email could not be retrieved from auth. Defaulting to shipping phone logic.",
        );
        // If we can't find email, let's check if the notes had any contact email or just use admin alert.
      }

      // 4. PARSE COUPONS AND PRICES DIRECTLY FROM COLUMNS (NO JSON FALLBACK)
      const notesText = order.notes || "";
      const couponCode = order.coupon_code || null;
      const discountAmount = Number(order.discount_amount || 0);
      const discountPercentage = Number(order.discount_percentage || 0);
      let originalAmount = Number(order.original_amount || 0);
      const finalAmount = Number(order.final_amount ?? order.total_amount);

      // Calculations
      const itemsSubtotal = orderItems.reduce(
        (acc, item) => acc + item.unit_price * item.quantity,
        0,
      );
      if (!originalAmount || originalAmount === 0) {
        originalAmount = itemsSubtotal;
      }

      const computedShipping = Math.max(0, finalAmount - (itemsSubtotal - discountAmount));
      const formattedDate = new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const paymentMethodDisplay =
        order.payment_method === "cod" ? "Cash On Delivery (COD)" : "Paid Online";
      const paymentStatusDisplay = order.payment_status?.toUpperCase() || "PENDING";
      const orderStatusDisplay = order.status?.toUpperCase() || "RECEIVED";

      // 5. EMBED BRAND LOGO IF EXISTS
      const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 10000, // 10 seconds connection timeout
        greetingTimeout: 10000, // 10 seconds greeting timeout
        socketTimeout: 15000, // 15 seconds socket timeout
      });

      // Robust helper with 2 retries for transient SMTP failures
      async function sendWithRetry(
        mailOptions: nodemailer.SendMailOptions,
        maxRetries = 2,
      ): Promise<unknown> {
        let attempts = 0;
        while (attempts <= maxRetries) {
          try {
            return await transporter.sendMail(mailOptions);
          } catch (err) {
            attempts++;
            if (attempts > maxRetries) {
              throw err;
            }
            console.warn(
              `[Email System] SMTP send attempt ${attempts} failed. Retrying in 1 second... Error:`,
              err,
            );
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      }

      const emailLogoPath = path.join(process.cwd(), "src/assets/email_logo.png");
      const emailLogoExists = fs.existsSync(emailLogoPath);
      const mailAttachments = emailLogoExists
        ? [
            {
              filename: "email_logo.png",
              path: emailLogoPath,
              cid: "email_logo",
            },
          ]
        : [];

      // 6. BUILD CUSTOMER HTML EMAIL
      const itemsRowsHtml = orderItems
        .map(
          (item) => `
        <tr style="border-bottom: 1px solid #e5dfd9;">
          <td style="padding: 12px 8px; font-size: 14px; color: #333333; line-height: 1.4;">
            <strong>${item.product_name}</strong>
          </td>
          <td style="padding: 12px 8px; font-size: 14px; color: #555555; text-align: center;">
            ${item.quantity}
          </td>
          <td style="padding: 12px 8px; font-size: 14px; color: #555555; text-align: right; font-family: monospace;">
            ₹${item.unit_price.toFixed(2)}
          </td>
          <td style="padding: 12px 8px; font-size: 14px; color: #333333; text-align: right; font-weight: 600; font-family: monospace;">
            ₹${(item.unit_price * item.quantity).toFixed(2)}
          </td>
        </tr>
      `,
        )
        .join("");

      const customerHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation – House Of Kanti</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #333333;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f6; padding: 30px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card Wrapper -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5dfd9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(48, 48, 48, 0.05);">
          
          <!-- Elegant Forest Green Header -->
          <tr>
            <td align="center" style="background-color: #1e3522; padding: 35px 20px; border-bottom: 3px solid #c5a880;">
              <div style="text-align: center; margin-bottom: 20px;">
                <img src="cid:email_logo" alt="House Of Kanti Logo" style="width: 200px; max-width: 100%; height: auto; display: inline-block; border: none; outline: none; text-decoration: none;" />
              </div>
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 28px; font-weight: 300; letter-spacing: 0.15em; color: #ffffff; text-transform: uppercase;">House Of Kanti</h1>
              <p style="margin: 4px 0 0 0; font-family: Georgia, serif; font-size: 12px; font-style: italic; letter-spacing: 0.15em; color: #c5a880;">Where Purity Meets Glow</p>
              <h2 style="margin: 15px 0 0 0; font-family: Georgia, serif; font-size: 20px; font-weight: 300; letter-spacing: 0.1em; color: #ffffff; text-transform: uppercase;">Order Confirmation</h2>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 35px 25px;">
              <h2 style="margin: 0 0 15px 0; font-family: Georgia, serif; font-size: 22px; font-weight: 400; color: #1e3522;">Thank You For Your Order!</h2>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 1.6; color: #444444;">
                Thank you for choosing <strong>House Of Kanti</strong>. We have successfully received your order and it is now being processed with maximum care.
              </p>
              
              <!-- STEPPER STATUS -->
              <h3 style="margin: 25px 0 12px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #888888; border-bottom: 1px solid #e5dfd9; padding-bottom: 6px;">
                Order Tracking Status
              </h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px;">
                <tr>
                  <td align="center" style="width: 20%; padding: 4px;">
                    <div style="background-color: #1e3522; color: #ffffff; width: 24px; height: 24px; border-radius: 50%; line-height: 24px; font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 6px;">✓</div>
                    <span style="font-size: 10px; font-weight: bold; color: #1e3522; display: block;">Received</span>
                  </td>
                  <td align="center" style="width: 20%; padding: 4px;">
                    <div style="background-color: #c5a880; color: #ffffff; width: 24px; height: 24px; border-radius: 50%; line-height: 24px; font-size: 11px; font-weight: bold; text-align: center; margin-bottom: 6px;">•</div>
                    <span style="font-size: 10px; font-weight: bold; color: #c5a880; display: block;">Processing</span>
                  </td>
                  <td align="center" style="width: 20%; padding: 4px;">
                    <div style="background-color: #f0eae4; color: #aaaaaa; width: 24px; height: 24px; border-radius: 50%; line-height: 24px; font-size: 11px; text-align: center; margin-bottom: 6px;">3</div>
                    <span style="font-size: 10px; color: #888888; display: block;">Packed</span>
                  </td>
                  <td align="center" style="width: 20%; padding: 4px;">
                    <div style="background-color: #f0eae4; color: #aaaaaa; width: 24px; height: 24px; border-radius: 50%; line-height: 24px; font-size: 11px; text-align: center; margin-bottom: 6px;">4</div>
                    <span style="font-size: 10px; color: #888888; display: block;">Shipped</span>
                  </td>
                  <td align="center" style="width: 20%; padding: 4px;">
                    <div style="background-color: #f0eae4; color: #aaaaaa; width: 24px; height: 24px; border-radius: 50%; line-height: 24px; font-size: 11px; text-align: center; margin-bottom: 6px;">5</div>
                    <span style="font-size: 10px; color: #888888; display: block;">Delivered</span>
                  </td>
                </tr>
              </table>

              <!-- ORDER METADATA BOX -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f6; border: 1px solid #e5dfd9; border-radius: 12px; padding: 18px; margin-bottom: 30px;">
                <tr>
                  <td style="width: 50%; padding-bottom: 12px; vertical-align: top;">
                    <span style="font-size: 11px; color: #888888; text-transform: uppercase; display: block;">Order Number</span>
                    <strong style="font-size: 14px; color: #1e3522; font-family: monospace;">${order.order_number}</strong>
                  </td>
                  <td style="width: 50%; padding-bottom: 12px; vertical-align: top;">
                    <span style="font-size: 11px; color: #888888; text-transform: uppercase; display: block;">Order Date</span>
                    <strong style="font-size: 13px; color: #333333;">${formattedDate}</strong>
                  </td>
                </tr>
                <tr>
                  <td style="width: 50%; vertical-align: top;">
                    <span style="font-size: 11px; color: #888888; text-transform: uppercase; display: block;">Payment Method</span>
                    <strong style="font-size: 13px; color: #333333;">${paymentMethodDisplay}</strong>
                  </td>
                  <td style="width: 50%; vertical-align: top;">
                    <span style="font-size: 11px; color: #888888; text-transform: uppercase; display: block;">Payment Status</span>
                    <strong style="font-size: 13px; color: ${order.payment_status === "paid" ? "#2e7d32" : "#c62828"};">${paymentStatusDisplay}</strong>
                  </td>
                </tr>
              </table>

              <!-- SHIPPING ADDRESS -->
              <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #888888; border-bottom: 1px solid #e5dfd9; padding-bottom: 6px;">
                Shipping Address
              </h3>
              <p style="margin: 0 0 30px 0; font-size: 14px; line-height: 1.5; color: #555555;">
                <strong>${order.shipping_full_name}</strong><br />
                ${order.shipping_line1}<br />
                ${order.shipping_line2 ? `${order.shipping_line2}<br />` : ""}
                ${order.shipping_city}, ${order.shipping_state} — ${order.shipping_pincode}<br />
                📞 Phone: ${order.shipping_phone}
              </p>

              <!-- ORDER ITEMS TABLE -->
              <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #888888; border-bottom: 1px solid #e5dfd9; padding-bottom: 6px;">
                Order Items
              </h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 25px; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: #faf9f6; border-bottom: 2px solid #e5dfd9;">
                    <th align="left" style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #888888; font-weight: 600;">Product</th>
                    <th align="center" style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #888888; font-weight: 600; width: 10%;">Qty</th>
                    <th align="right" style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #888888; font-weight: 600; width: 20%;">Price</th>
                    <th align="right" style="padding: 10px 8px; font-size: 11px; text-transform: uppercase; color: #888888; font-weight: 600; width: 20%;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsRowsHtml}
                </tbody>
              </table>

              <!-- FINANCIAL BREAKDOWN -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px; border-collapse: collapse;">
                <tr>
                  <td style="width: 50%; padding: 4px 0;"></td>
                  <td align="right" style="padding: 4px 0; font-size: 14px; color: #777777; width: 30%;">Subtotal:</td>
                  <td align="right" style="padding: 4px 8px; font-size: 14px; color: #333333; font-weight: 500; width: 20%; font-family: monospace;">
                    ₹${itemsSubtotal.toFixed(2)}
                  </td>
                </tr>
                ${
                  couponCode
                    ? `
                <tr>
                  <td style="padding: 4px 0;"></td>
                  <td align="right" style="padding: 4px 0; font-size: 14px; color: #777777;">
                    Discount (${couponCode}):
                  </td>
                  <td align="right" style="padding: 4px 8px; font-size: 14px; color: #c62828; font-weight: 500; font-family: monospace;">
                    -₹${discountAmount.toFixed(2)}
                  </td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 4px 0;"></td>
                  <td align="right" style="padding: 4px 0; font-size: 14px; color: #777777;">Shipping:</td>
                  <td align="right" style="padding: 4px 8px; font-size: 14px; color: #333333; font-weight: 500; font-family: monospace;">
                    ${computedShipping === 0 ? "Free" : `₹${computedShipping.toFixed(2)}`}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #e5dfd9; font-size: 16px;">
                  <td style="padding: 12px 0 0 0;"></td>
                  <td align="right" style="padding: 12px 0 0 0; font-weight: bold; color: #1e3522;">Amount Paid:</td>
                  <td align="right" style="padding: 12px 8px 0 0; font-weight: bold; color: #1e3522; font-family: monospace; font-size: 18px;">
                    ₹${finalAmount.toFixed(2)}
                  </td>
                </tr>
              </table>

              <!-- PAYMENT TRANSACTION DETAILS -->
              ${
                order.payment_method === "online" && order.razorpay_payment_id
                  ? `
              <h3 style="margin: 0 0 10px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #888888; border-bottom: 1px solid #e5dfd9; padding-bottom: 6px;">
                Transaction Details
              </h3>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="font-size: 13px; color: #555555; line-height: 1.5; margin-bottom: 30px;">
                <tr>
                  <td style="width: 40%; font-weight: 500;">Payment Gateway ID:</td>
                  <td style="font-family: monospace; font-size: 12px;">${order.razorpay_payment_id}</td>
                </tr>
                <tr>
                  <td style="font-weight: 500;">Razorpay Order ID:</td>
                  <td style="font-family: monospace; font-size: 12px;">${order.razorpay_order_id || "N/A"}</td>
                </tr>
                <tr>
                  <td style="font-weight: 500;">Status:</td>
                  <td><span style="color: #2e7d32; font-weight: bold;">SUCCESSFUL</span></td>
                </tr>
              </table>
              `
                  : ""
              }

              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #555555; text-align: center;">
                If you have any questions, reply to this email or connect with us on WhatsApp.
              </p>
            </td>
          </tr>
          
          <!-- Elegant Footer Banner -->
          <tr>
            <td align="center" style="background-color: #faf9f6; padding: 30px 20px; border-top: 1px solid #f0eae4; text-align: center;">
              <h4 style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #1e3522; letter-spacing: 0.05em;">House Of Kanti</h4>
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #888888;">
                <a href="https://houseofkanti.shop" target="_blank" style="color: #1e3522; text-decoration: underline;">houseofkanti.shop</a> • 
                <a href="mailto:support@houseofkanti.shop" style="color: #1e3522; text-decoration: underline;">support@houseofkanti.shop</a> • 
                <a href="tel:+918806018688" style="color: #1e3522; text-decoration: underline;">+91 88060 18688</a>
              </p>
              <p style="margin: 0 0 15px 0; font-size: 12px; color: #888888;">
                Follow us on Instagram: <a href="https://instagram.com/houseofkanti" target="_blank" style="color: #c5a880; font-weight: bold; text-decoration: none;">@houseofkanti</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #b3a79d; letter-spacing: 0.05em; text-transform: uppercase;">
                Pure Ingredients • Holistic Wellness • Timeless Beauty
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

      // 7. BUILD ADMIN HTML EMAIL
      const adminHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>[Admin] New Order Alert #${order.order_number}</title>
</head>
<body style="margin: 0; padding: 20px; background-color: #faf9f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #333333;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e5dfd9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(48, 48, 48, 0.05);">
    <div style="background-color: #1e3522; color: #ffffff; padding: 35px 20px; text-align: center; border-bottom: 3px solid #c5a880;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="cid:email_logo" alt="House Of Kanti Logo" style="width: 200px; max-width: 100%; height: auto; display: inline-block; border: none; outline: none; text-decoration: none;" />
      </div>
      <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 24px; font-weight: 300; letter-spacing: 0.1em; text-transform: uppercase; color: #ffffff;">House Of Kanti</h1>
      <p style="margin: 4px 0 15px 0; font-family: Georgia, serif; font-size: 11px; font-style: italic; letter-spacing: 0.1em; color: #c5a880;">Where Purity Meets Glow</p>
      <h2 style="margin: 0; font-size: 18px; font-weight: 600; letter-spacing: 0.05em; color: #ffffff;">🚨 NEW ORDER RECEIVED</h2>
      <p style="margin: 5px 0 0 0; font-size: 13px; color: #c5a880; font-family: monospace;">Order: ${order.order_number}</p>
    </div>
    <div style="padding: 25px;">
      
      <!-- Customer Information -->
      <h2 style="font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em;">Customer & Shipping Details</h2>
      <table style="width: 100%; font-size: 14px; margin-bottom: 20px; line-height: 1.5;">
        <tr>
          <td style="width: 35%; font-weight: bold; color: #4b5563;">Name:</td>
          <td>${order.shipping_full_name}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #4b5563;">Email:</td>
          <td>${customerEmail || "N/A (Anonymous / Not in Auth)"}</td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #4b5563;">Phone:</td>
          <td><a href="tel:${order.shipping_phone}" style="color: #2563eb; text-decoration: none;">${order.shipping_phone}</a></td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #4b5563; vertical-align: top;">Shipping Address:</td>
          <td>
            ${order.shipping_line1}<br />
            ${order.shipping_line2 ? `${order.shipping_line2}<br />` : ""}
            ${order.shipping_city}, ${order.shipping_state} — ${order.shipping_pincode}
          </td>
        </tr>
        <tr>
          <td style="font-weight: bold; color: #4b5563;">Notes:</td>
          <td style="background-color: #fffbeb; padding: 6px; border-radius: 4px; font-style: italic;">${notesText || "None"}</td>
        </tr>
      </table>

      <!-- Order Items -->
      <h2 style="font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em;">Order Items Table</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; text-align: left;">
            <th style="padding: 8px;">Product</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Unit Price</th>
            <th style="padding: 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${orderItems
            .map(
              (item) => `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="padding: 8px;"><strong>${item.product_name}</strong></td>
              <td style="padding: 8px; text-align: center;">${item.quantity}</td>
              <td style="padding: 8px; text-align: right; font-family: monospace;">₹${item.unit_price.toFixed(2)}</td>
              <td style="padding: 8px; text-align: right; font-weight: bold; font-family: monospace;">₹${(item.unit_price * item.quantity).toFixed(2)}</td>
            </tr>
          `,
            )
            .join("")}
        </tbody>
      </table>

      <!-- Financial Totals -->
      <h2 style="font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em;">Financial Breakdown</h2>
      <table style="width: 100%; font-size: 14px; margin-bottom: 25px;">
        <tr>
          <td style="width: 60%;">Items Subtotal:</td>
          <td style="text-align: right; font-family: monospace;">₹${itemsSubtotal.toFixed(2)}</td>
        </tr>
        ${
          couponCode
            ? `
        <tr>
          <td>Coupon Applied (${couponCode}):</td>
          <td style="text-align: right; color: #dc2626; font-family: monospace;">-₹${discountAmount.toFixed(2)}</td>
        </tr>
        `
            : ""
        }
        <tr>
          <td>Shipping Charge:</td>
          <td style="text-align: right; font-family: monospace;">${computedShipping === 0 ? "Free" : `₹${computedShipping.toFixed(2)}`}</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb; font-weight: bold; font-size: 16px;">
          <td style="padding-top: 10px; color: #111827;">Grand Total:</td>
          <td style="text-align: right; padding-top: 10px; color: #059669; font-family: monospace;">₹${finalAmount.toFixed(2)}</td>
        </tr>
      </table>

      <!-- System/Payment references -->
      <h2 style="font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em;">System & Payment Metadata</h2>
      <table style="width: 100%; font-size: 12px; color: #6b7280; font-family: monospace; line-height: 1.5;">
        <tr>
          <td style="width: 35%; font-weight: bold;">Internal Order ID:</td>
          <td>${order.id}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Payment Method:</td>
          <td>${order.payment_method.toUpperCase()}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Payment Status:</td>
          <td style="font-weight: bold; color: ${order.payment_status === "paid" ? "#059669" : "#dc2626"};">${paymentStatusDisplay}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Razorpay Order ID:</td>
          <td>${order.razorpay_order_id || "N/A"}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Razorpay Payment ID:</td>
          <td>${order.razorpay_payment_id || "N/A"}</td>
        </tr>
        <tr>
          <td style="font-weight: bold;">Notification Trigger:</td>
          <td>Auto-Generated Server Email</td>
        </tr>
      </table>

    </div>
  </div>
</body>
</html>`;

      // 8. SEND EMAILS VIA SMTP TRANSPORTER
      const subjectLine = `House Of Kanti - Order Confirmation [Order #${order.order_number}]`;

      // A. Send to customer (if email is available)
      let customerEmailSent = false;
      let customerError: string | null = null;
      if (customerEmail) {
        try {
          const info = await sendWithRetry({
            from: `"House Of Kanti" <${user}>`,
            to: customerEmail,
            subject: subjectLine,
            html: customerHtml,
            attachments: mailAttachments,
          });
          customerEmailSent = true;
          console.log(
            "[Email System] Confirmation email sent to customer (via retry-ready sender):",
            customerEmail,
            info.messageId,
          );
        } catch (cErr: unknown) {
          const errMsg = cErr instanceof Error ? cErr.message : String(cErr);
          customerError = errMsg;
          console.error(
            "[Email System] Failed to send confirmation email to customer after retries:",
            customerEmail,
            cErr,
          );
        }
      } else {
        customerError = "Customer email not available in auth.";
      }

      // B. Send notification to admin
      let adminEmailSent = false;
      let adminError: string | null = null;
      try {
        const info = await sendWithRetry({
          from: `"House Of Kanti Billing" <${user}>`,
          to: "support@houseofkanti.shop",
          subject: `[Admin Alert] New Order #${order.order_number} (${paymentMethodDisplay})`,
          html: adminHtml,
          attachments: mailAttachments,
        });
        adminEmailSent = true;
        console.log(
          "[Email System] Alert email sent to admin support@houseofkanti.shop (via retry-ready sender):",
          info.messageId,
        );
      } catch (aErr: unknown) {
        const errMsg = aErr instanceof Error ? aErr.message : String(aErr);
        adminError = errMsg;
        console.error("[Email System] Failed to send alert email to admin after retries:", aErr);
      }

      // 9. UPDATE DATABASE SENT STATUS
      // Gather any errors to store
      const errorsList = [];
      if (customerError) errorsList.push(`Customer: ${customerError}`);
      if (adminError) errorsList.push(`Admin: ${adminError}`);
      const combinedError = errorsList.length > 0 ? errorsList.join(" | ") : null;

      // Create payload dynamically
      const directPayload = {
        customer_email_sent: customerEmailSent,
        customer_email_sent_at: customerEmailSent ? new Date().toISOString() : null,
        admin_email_sent: adminEmailSent,
        admin_email_sent_at: adminEmailSent ? new Date().toISOString() : null,
        email_error: combinedError,
      };

      const { error: finalUpdateErr } = await supabaseAdmin
        .from("orders")
        .update(directPayload)
        .eq("id", orderId);

      if (finalUpdateErr) {
        console.error(
          "[Email System] Failed to save final email statuses to order record:",
          finalUpdateErr.message,
        );
      }

      return {
        success: customerEmailSent || adminEmailSent,
        customerEmailSent,
        adminEmailSent,
        error: combinedError,
      };
    } catch (globalErr: unknown) {
      console.error("[Email System] Critical exception inside handler:", globalErr);
      const errMsg = globalErr instanceof Error ? globalErr.message : String(globalErr);
      return { success: false, error: errMsg };
    }
  });
