import { createFileRoute } from "@tanstack/react-router";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

// In-memory sliding window IP rate limiter (stores timestamps per IP)
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000; // 1 hour in milliseconds

  let timestamps = rateLimitMap.get(ip) || [];

  // Keep only timestamps within the last hour
  timestamps = timestamps.filter((t) => t > oneHourAgo);

  if (timestamps.length >= 5) {
    rateLimitMap.set(ip, timestamps);
    return true; // Rate limit exceeded
  }

  // Record this request
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return false; // Under limit
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json();
          const { name, email, phone, subject, message, turnstileToken, userId } = body;

          console.log("SERVER TOKEN", turnstileToken);
          console.log("SERVER LENGTH", turnstileToken?.length);

          if (!name || !email || !message) {
            return new Response(
              JSON.stringify({ error: "Missing required fields (name, email, message)" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          // Server-side email format validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            return new Response(JSON.stringify({ error: "Invalid email address format." }), {
              status: 400,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Get client info (IP and User Agent)
          const userAgent = request.headers.get("user-agent") || "Unknown";
          const ip =
            request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            request.headers.get("x-real-ip") ||
            "Unknown";

          // 1. Server-side Rate Limiting (5 submissions per IP per hour)
          if (ip !== "Unknown" && checkRateLimit(ip)) {
            console.warn(`[Contact API] Rate limit exceeded for IP: ${ip}`);
            return new Response(
              JSON.stringify({
                error:
                  "Too many inquiries have been submitted from your network. Please try again later.",
              }),
              { status: 429, headers: { "Content-Type": "application/json" } },
            );
          }

          // 2. Production Spam Protection (Cloudflare Turnstile)
          const isDevelopment = process.env.NODE_ENV !== "production";
          const isBypassEnabled = process.env.SKIP_TURNSTILE === "true" && isDevelopment;

          let isSpamPassed = false;
          const receivedToken = !!turnstileToken;
          const tokenLength = turnstileToken ? turnstileToken.length : 0;
          const secretDefined = !!process.env.TURNSTILE_SECRET_KEY;
          const remoteIp = ip;
          let cloudflareHttpStatus: number | null = null;
          let cloudflareResponse: unknown = null;
          let caughtException: string | null = null;

          if (isBypassEnabled) {
            console.log("[Turnstile] Development bypass enabled.");
            console.log(
              "=====================================\n" +
                "TURNSTILE DEVELOPMENT BYPASS ENABLED\n" +
                "Cloudflare verification is NOT running.\n" +
                "=====================================",
            );
            isSpamPassed = true;
          } else {
            if (!turnstileToken) {
              return new Response(
                JSON.stringify({ error: "Spam verification check is missing. Please try again." }),
                { status: 400, headers: { "Content-Type": "application/json" } },
              );
            }

            const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
            if (!turnstileSecret) {
              console.error("[Contact API] TURNSTILE_SECRET_KEY is not configured.");
              return new Response(
                JSON.stringify({ error: "TURNSTILE_SECRET_KEY is not configured." }),
                { status: 500, headers: { "Content-Type": "application/json" } },
              );
            }

            try {
              const formData = new URLSearchParams();
              formData.append("secret", turnstileSecret);
              formData.append("response", turnstileToken);
              if (ip !== "Unknown") {
                formData.append("remoteip", ip);
              }

              const cfResponse = await fetch(
                "https://challenges.cloudflare.com/turnstile/v0/siteverify",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                  body: formData.toString(),
                },
              );

              cloudflareHttpStatus = cfResponse.status;
              const cfResult = await cfResponse.json();
              cloudflareResponse = cfResult;

              if (cfResult && cfResult.success) {
                isSpamPassed = true;
              } else {
                console.warn("[Contact API] Turnstile validation failed. Response:", cfResult);
              }
            } catch (cfErr: unknown) {
              console.error("[Contact API] Turnstile exception:", cfErr);
              if (cfErr instanceof Error) {
                caughtException = `${cfErr.message}\nStack: ${cfErr.stack}`;
              } else {
                caughtException = String(cfErr);
              }
            }

            if (!isSpamPassed) {
              return new Response(
                JSON.stringify({
                  receivedToken,
                  tokenLength,
                  secretDefined,
                  remoteIp,
                  cloudflareHttpStatus,
                  cloudflareResponse,
                  caughtException,
                }),
                {
                  status: 400,
                  headers: { "Content-Type": "application/json" },
                },
              );
            }
          }

          let dbSaved = false;
          let dbErrorMsg: string | null = null;

          // 3. Save to Supabase contact_messages table (including ip_address and user_agent)
          try {
            const insertData: {
              name: string;
              email: string;
              phone: string | null;
              subject: string;
              message: string;
              status: string;
              ip_address: string;
              user_agent: string;
              user_id?: string;
            } = {
              name,
              email,
              phone: phone || null,
              subject: subject || "No Subject",
              message,
              status: "unread",
              ip_address: ip,
              user_agent: userAgent,
            };

            if (userId) {
              insertData.user_id = userId;
            }

            let { error: dbError } = await supabaseAdmin
              .from("contact_messages")
              .insert(insertData);

            // If the column does not exist or another database issue occurs with user_id, try without user_id
            if (dbError && userId) {
              console.warn(
                "[Contact API] Insert with user_id failed, retrying without user_id column:",
                dbError,
              );
              delete insertData.user_id;
              // Prepend user_id info to the message so it's not lost
              insertData.message = `[User ID: ${userId}]\n\n${message}`;
              const retryResult = await supabaseAdmin.from("contact_messages").insert(insertData);
              dbError = retryResult.error;
            }

            if (dbError) {
              console.error("[Contact API] Supabase Insert Error:", dbError);
              dbErrorMsg = dbError.message;
            } else {
              dbSaved = true;
            }
          } catch (err: unknown) {
            console.error("[Contact API] Database save exception:", err);
            dbErrorMsg = err instanceof Error ? err.message : String(err);
          }

          // 4. Prepare and send notification email to Admin via SMTP (e.g. Hostinger Business Email)
          let emailSent = false;
          let emailErrorMsg: string | null = null;
          let adminProviderResponse: string | null = null;
          let adminEmailDuration = 0;

          const host = process.env.SMTP_HOST || "smtp.hostinger.com";
          const port = parseInt(process.env.SMTP_PORT || "465", 10);
          const user = process.env.SMTP_USER || "support@houseofkanti.shop";
          const pass = process.env.SMTP_PASS;

          if (!pass) {
            emailErrorMsg = "SMTP_PASS is not configured in environment variables.";
            console.warn("[Contact API] Skip sending email: SMTP_PASS is missing.");
          } else {
            const startTime = Date.now();
            try {
              const transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: {
                  user,
                  pass,
                },
              });

              const subjectLine = `New Contact Form Submission - ${subject || "No Subject"}`;
              const submittedAt = new Date().toISOString();

              const emailBody = `New Contact Form Submission

------------------------------------
Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Subject: ${subject || "No Subject"}
Message: ${message}
${userId ? `User ID: ${userId}` : ""}

Submitted At: ${submittedAt}
User IP: ${ip}
Browser/User Agent: ${userAgent}
------------------------------------`;

              const info = await transporter.sendMail({
                from: `"${name}" <${user}>`,
                replyTo: email,
                to: "support@houseofkanti.shop",
                subject: subjectLine,
                text: emailBody,
              });

              adminProviderResponse = info.response || "No response details";
              emailSent = true;
              adminEmailDuration = Date.now() - startTime;

              console.log("[Email Audit] Admin Support Email Sent Successfully:", {
                recipient: "support@houseofkanti.shop",
                subject: subjectLine,
                providerResponse: adminProviderResponse,
                success: true,
                executionTimeMs: adminEmailDuration,
              });
            } catch (err: unknown) {
              adminEmailDuration = Date.now() - startTime;
              emailErrorMsg = err instanceof Error ? err.message : String(err);
              console.error("[Email Audit] Admin Support Email Failed:", {
                recipient: "support@houseofkanti.shop",
                subject: `New Contact Form Submission - ${subject || "No Subject"}`,
                providerResponse: null,
                success: false,
                error: emailErrorMsg,
                executionTimeMs: adminEmailDuration,
              });
            }
          }

          // 5. Customer Auto-reply Email (Decoupled from DB saved status, depends only on SMTP configuration)
          let customerEmailSent = false;
          let customerEmailError: string | null = null;
          let customerProviderResponse: string | null = null;
          let customerEmailDuration = 0;

          if (pass) {
            const startTime = Date.now();
            try {
              const transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: {
                  user,
                  pass,
                },
              });

              // Create plain text fallback
              const plainTextBody = `Hello ${name},

Thank you for contacting House Of Kanti.

We have successfully received your inquiry.

Our support team will review your message and respond within one business day.

If your inquiry is urgent, you may also contact us on WhatsApp:
+91 88060 18688

Website:
https://houseofkanti.shop

Warm Regards,

House Of Kanti
support@houseofkanti.shop`;

              // Create beautiful mobile responsive HTML body
              const htmlBody = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>We've received your inquiry – House Of Kanti</title>
</head>
<body style="margin: 0; padding: 0; background-color: #faf9f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #333333;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #faf9f6; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Card Container -->
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e5dfd9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background-color: #1a1a1a; padding: 30px 20px; border-bottom: 3px solid #c5a880;">
              <h1 style="margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 26px; font-weight: 300; letter-spacing: 0.15em; color: #ffffff; text-transform: uppercase;">House Of Kanti</h1>
              <p style="margin: 5px 0 0 0; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; color: #c5a880;">Premium Ayurvedic Skincare</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #333333;">Hello <strong>${name}</strong>,</p>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #555555;">Thank you for contacting House Of Kanti.</p>
              
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #555555;">We have successfully received your inquiry. Our support team will review your message and respond within one business day.</p>
              
              <!-- Highlighted CTA Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0; background-color: #f6f3ee; border-left: 4px solid #c5a880; border-radius: 4px; padding: 20px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #1a1a1a;">Need an Urgent Response?</p>
                    <p style="margin: 0 0 15px 0; font-size: 14px; line-height: 1.5; color: #555555;">If your inquiry is urgent, you may connect with our support team immediately on WhatsApp:</p>
                    <a href="https://wa.me/918806018688?text=Hello%20House%20of%20Kanti" target="_blank" style="display: inline-block; background-color: #25d366; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      Chat on WhatsApp (+91 88060 18688)
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #555555;">In the meantime, feel free to browse our full Ayurveda collection on our website: <a href="https://houseofkanti.shop" target="_blank" style="color: #c5a880; text-decoration: underline; font-weight: 500;">houseofkanti.shop</a></p>
              
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #777777;">Warm Regards,</p>
              <p style="margin: 5px 0 0 0; font-size: 15px; font-weight: 600; color: #1a1a1a;">House Of Kanti</p>
              <p style="margin: 2px 0 0 0; font-size: 13px; color: #777777;"><a href="mailto:support@houseofkanti.shop" style="color: #777777; text-decoration: none;">support@houseofkanti.shop</a></p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #faf9f6; padding: 25px 20px; border-top: 1px solid #f0eae4;">
              <p style="margin: 0; font-size: 12px; color: #999999; line-height: 1.5;">&copy; 2026 House Of Kanti. All Rights Reserved.</p>
              <p style="margin: 5px 0 0 0; font-size: 11px; color: #b3a79d; letter-spacing: 0.05em;">Pure Ingredients • Holistic Wellness • Timeless Beauty</p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

              const info = await transporter.sendMail({
                from: `"House Of Kanti" <${user}>`,
                to: email,
                subject: "We've received your inquiry – House Of Kanti",
                text: plainTextBody,
                html: htmlBody,
              });

              customerProviderResponse = info.response || "No response details";
              customerEmailSent = true;
              customerEmailDuration = Date.now() - startTime;

              console.log("[Email Audit] Customer Acknowledgement Email Sent Successfully:", {
                recipient: email,
                subject: "We've received your inquiry – House Of Kanti",
                providerResponse: customerProviderResponse,
                success: true,
                executionTimeMs: customerEmailDuration,
              });
            } catch (err: unknown) {
              customerEmailDuration = Date.now() - startTime;
              customerEmailError = err instanceof Error ? err.message : String(err);
              console.error("[Email Audit] Customer Acknowledgement Email Failed:", {
                recipient: email,
                subject: "We've received your inquiry – House Of Kanti",
                providerResponse: null,
                success: false,
                error: customerEmailError,
                executionTimeMs: customerEmailDuration,
              });
            }
          }

          // Determine appropriate status code and response
          // Submission succeeds if EITHER DB write OR Admin email is successful
          const status = dbSaved || emailSent ? 200 : 500;

          return new Response(
            JSON.stringify({
              success: dbSaved || emailSent,
              dbSaved,
              dbError: dbErrorMsg,
              emailSent,
              emailError: emailErrorMsg,
              customerEmailSent,
              customerEmailError,
              emailConfigured: !!pass,
            }),
            { status, headers: { "Content-Type": "application/json" } },
          );
        } catch (err: unknown) {
          console.error("[Contact API] Global exception:", err);
          return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
