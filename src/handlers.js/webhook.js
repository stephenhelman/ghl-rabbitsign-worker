// src/handlers/webhook.js
import {
  withErrorHandling,
  jsonResponse,
  forwardJsonToBackend,
} from "../http.js";

export const handleRabbitsignWebhook = withErrorHandling(
  async (request, env) => {
    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    const body = await request.json();

    const path = `/tenant/${encodeURIComponent(
      env.TENANT_ID
    )}/webhooks/rabbitsign`;

    return forwardJsonToBackend({
      env,
      path,
      body,
    });
  }
);
