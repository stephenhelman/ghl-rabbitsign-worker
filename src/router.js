import { handlePrefill } from "./handlers.js/prefill.js";
import { handleRabbitsignWebhook } from "./handlers.js/webhook.js";
import { jsonResponse } from "./http.js";

export const handleRequest = async (request, env, ctx) => {
  const url = new URL(request.url);
  const { pathname } = url;
  const method = request.method.toUpperCase();

  const segments = pathname.split("/").filter(Boolean);
  // e.g. /tenant/operation_profit/prefill => ["tenant","operation_profit","prefill"]

  if (segments[0] === "tenant" && segments.length >= 3) {
    const tenantId = segments[1];
    const action = segments[2];

    if (method === "POST" && action === "prefill") {
      const contractType = segments[3];
      return handlePrefill(request, tenantId, contractType);
    }

    if (
      method === "POST" &&
      action === "webhooks" &&
      segments[3] === "rabbitsign"
    ) {
      return handleRabbitsignWebhook(request, tenantId, ctx);
    }

    return jsonResponse({ ok: false, error: "Unknown tenant route" }, 404);
  }

  return jsonResponse({ ok: false, error: "Not found" }, 404);
};
