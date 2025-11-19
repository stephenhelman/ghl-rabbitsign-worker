import { handlePrefillRequest } from "../prefill/handler.js";
import { handleRabbitWebhook } from "../webhook/handler.js";
import { handleTestUpload } from "../test/handler.js";

export async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
  const method = request.method;
  const { pathname } = url;

  if (pathname === "/health") {
    return new Response(
      JSON.stringify({ ok: true, worker: "ghl-rabbitsign", env: "dev" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  if (pathname === "/webhook/rabbitsign" && request.method === "POST") {
    return handleRabbitWebhook(request, env, ctx);
  }

  // prefill endpoint TODO
  if (pathname.startsWith("/prefill/") && method === "POST") {
    return handlePrefillRequest(request, env);
  }

  if (pathname === "/test-worker" && method === "GET") {
    return handleTestUpload(request, env, ctx);
  }

  return new Response("Not found", { status: 404 });
}
