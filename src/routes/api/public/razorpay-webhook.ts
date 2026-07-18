import { createFileRoute } from "@tanstack/react-router";
import { Route as CanonicalRoute } from "../webhooks/razorpay";

/**
 * Legacy Webhook Endpoint: /api/public/razorpay-webhook
 *
 * DEPRECATED: Please use the canonical endpoint /api/webhooks/razorpay instead.
 * To avoid duplicate code maintenance, this route delegates completely to the canonical route handlers.
 */
export const Route = createFileRoute("/api/public/razorpay-webhook")({
  server: {
    handlers: CanonicalRoute.options.server?.handlers,
  },
});
