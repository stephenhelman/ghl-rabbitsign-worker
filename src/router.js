import { handleHealth } from "./handlers.js/health.js";
import { handlePrefill } from "./handlers.js/prefill.js";
import { handleRabbitsignWebhook } from "./handlers.js/webhook.js";

export const handleRequest = async (request, env) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const type = pathname.split("/prefill/")[1];
  const method = request.method.toUpperCase();

  if (method === "GET" && pathname === "/health") {
    return handleHealth(request, env);
  }

  if (method === "POST" && pathname.startsWith("/prefill/")) {
    return handlePrefill(request, env, type);
  }

  if (method === "POST" && pathname === "/webhooks/rabbitsign") {
    return handleRabbitsignWebhook(request, env);
  }

  return new Response("Not found", { status: 404 });
};
