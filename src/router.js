import { handleRabbitWebhook } from "./signedDocuments";
import { handlePrefillRequest } from "./prefill/handler.js";

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

  // RabbitSign webhook endpoint TODO
  if (pathname === "/webhook/rabbitsign" && request.method === "POST") {
    const body = await request.json();
    return handleRabbitWebhook(body, env, ctx);
  }

  // prefill endpoint TODO
  if (pathname.startsWith("/prefill/") && method === "POST") {
    return handlePrefillRequest(request, env);
  }

  return new Response("Not found", { status: 404 });
}
