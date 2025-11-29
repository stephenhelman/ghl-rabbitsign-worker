// src/handlers/webhook.js
import {
  withErrorHandling,
  jsonResponse,
  forwardJsonToBackend,
} from "../http.js";

export const handleRabbitsignWebhook = withErrorHandling(
  async (request, env, ctx, tenantId) => {
    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    const contentType = request.headers.get("content-type") || "";
    const rawText = await request.text();

    let body;

    if (contentType.includes("application/json")) {
      // Try to parse JSON, but don't die if it's empty/invalid
      if (!rawText || rawText.trim() === "") {
        body = {}; // empty JSON body
      } else {
        try {
          body = JSON.parse(rawText);
        } catch (err) {
          console.warn(
            "[webhook] Invalid JSON body from RabbitSign, wrapping as rawBody"
          );
          body = { rawBody: rawText };
        }
      }
    } else {
      // Not JSON – just wrap the text
      body = { rawBody: rawText, contentType };
    }

    const path = `/tenant/${encodeURIComponent(tenantId)}/webhooks/rabbitsign`;

    return forwardJsonToBackend({
      env,
      path,
      body,
    });
  }
);
