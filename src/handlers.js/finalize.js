// src/handlers/prefill.js
import {
  withErrorHandling,
  forwardJsonToBackend,
  jsonResponse,
} from "../http.js";

export const handleFinalize = withErrorHandling(
  async (request, env, ctx, tenantId) => {
    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    const rawBody = await request.json();

    const path = `/tenant/${encodeURIComponent(tenantId)}/finalize`;

    return forwardJsonToBackend({
      env,
      path,
      body: rawBody,
    });
  }
);
