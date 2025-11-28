// src/handlers/prefill.js
import {
  withErrorHandling,
  forwardJsonToBackend,
  jsonResponse,
} from "../http.js";

export const handlePrefill = withErrorHandling(
  async (request, env, contractTypeFromPath) => {
    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    const rawBody = await request.json();

    const path = `/tenant/${encodeURIComponent(env.TENANT_ID)}/prefill`;

    return forwardJsonToBackend({
      env,
      path,
      body: { ...rawBody, contractTypeFromPath },
    });
  }
);
