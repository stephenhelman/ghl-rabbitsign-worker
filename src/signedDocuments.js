import { resolveConfig } from "./config.js";
import { getContractMapping, deleteContractMapping } from "./kvStore.js";
/* import { getFinalPdfUrl } from "./rabbitSignClient.js"; */
import { createSignedDocumentRecord } from "./ghlClient.js";

export async function handleRabbitWebhook(body, env, ctx) {
  const config = resolveConfig(env);

  // 1) Extract folderId and status from RabbitSign webhook payload
  const folderId = body?.folderId || body?.folder_id;
  const status = body?.status || body?.event;

  if (!folderId) {
    console.warn("Webhook missing folderId", body);
    return new Response("Missing folderId", { status: 400 });
  }

  // You can gate on status here (e.g. only continue when signed)
  console.log("RabbitSign webhook:", { folderId, status });

  // 2) Load mapping from KV
  const mapping = await getContractMapping(env, folderId);
  if (!mapping) {
    console.warn("No KV mapping for folderId", folderId);
    return new Response("No mapping", { status: 200 });
  }

  // 3) Get final PDF URL (we'll implement real RabbitSign call later)
  const signedPdfUrl = await getFinalPdfUrl(env, folderId);

  // 4) Build title and properties for Signed Document custom object
  const type = mapping.type || "contract";
  const propertyAddress = mapping.propertyAddress || "Unknown address";
  const title = `${type} - ${propertyAddress}`;

  const properties = {
    // Required primary property:
    "custom_objects.signed_documents.signed_documents": title,

    documentType: type,
    status: "signed",
    signedAt: new Date().toISOString(),
    signedPdfUrl,
    rabbitFolderId: folderId,
    ghlOpportunityId: mapping.opportunityId || null,
    propertyAddress,
    sellerContactId: mapping.sellerContactId || null,
    buyerContactId: mapping.buyerContactId || null,
  };

  // 5) Create Signed Document record in GHL
  const ghlResp = await createSignedDocumentRecord(env, {
    config,
    properties,
  });

  if (!ghlResp.ok) {
    console.error("Failed to create Signed Document record", ghlResp);
    return new Response("Failed to create Signed Document", { status: 502 });
  }

  // 6) Optionally delete KV mapping now that it's done
  await deleteContractMapping(env, folderId);

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
