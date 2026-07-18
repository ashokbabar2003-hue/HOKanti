import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/diagnostics")({
  server: {
    handlers: {
      GET: async () => {
        const envVars = [
          "RAZORPAY_KEY_ID",
          "RAZORPAY_KEY_SECRET",
          "SUPABASE_URL",
          "SUPABASE_ANON_KEY",
          "SUPABASE_SERVICE_ROLE_KEY",
          "SMTP_HOST",
          "SMTP_USER",
          "SMTP_PASS",
          "RESEND_API_KEY",
        ];

        const results = envVars.map((name) => {
          const value = process.env[name];
          return {
            name,
            present: typeof value === "string" && value.trim().length > 0,
          };
        });

        return new Response(JSON.stringify(results), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        });
      },
    },
  },
});
