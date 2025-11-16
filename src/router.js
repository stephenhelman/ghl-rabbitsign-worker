import { handleRabbitWebhook } from "./signedDocuments";

export async function handleRequest(request, env, ctx) {
  const url = new URL(request.url);
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
  if (pathname === "/prefill" && request.method === "POST") {
    return new Response("Prefill endpoint not implemented yet", {
      status: 501,
    });
  }

  return new Response("Not found", { status: 404 });
}
