// src/handlers/prefill.js
import { mapGhlToCtx } from "../mapping.js";
import {
  withErrorHandling,
  jsonResponse,
  forwardJsonToBackend,
} from "../http.js";

export const handlePrefill = withErrorHandling(async (request, env, type) => {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }

  const rawBody = await request.json();

  // Map GHL payload → canonical ctx
  const prefillCtx = mapGhlToCtx(rawBody, type);

  if (!prefillCtx.contractType || !prefillCtx.opportunityId) {
    return jsonResponse(
      {
        ok: false,
        error: "contractType and opportunityId are required in ctx",
      },
      400
    );
  }

  // Forward to backend /tenant/:tenantId/prefill
  const path = `/tenant/${encodeURIComponent(env.TENANT_ID)}/prefill`;

  return forwardJsonToBackend({
    env,
    path,
    body: prefillCtx,
  });
});
