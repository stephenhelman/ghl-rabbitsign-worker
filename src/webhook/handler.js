import { updateOpportunityStage } from "../api/ghlClient";
import { resolveConfig } from "../config/config";
import { withErrorHandling } from "../util/errors";
import { jsonResponse } from "../util/http";
import { getContractMapping } from "../util/kvStore";
import { confirmBody, parseHookRequest } from "../util/util";
import { buildUpdateOpportunityPayload } from "./mapping";
import { runStep } from "./flowUtils";

//client - hosts the api call logic
//handlers - calls the api functions
//mapping - builds the payloads for the handlers to use
const rabbitWebhookCore = async (request, env) => {
  const { ghlApiKey, locationId, contractSigned, disposition, pipelineId } =
    resolveConfig(env);

  const body = confirmBody(request);
  const { folderId, eventName, signerEmail } = parseHookRequest(body);

  if (eventName !== "SIGNER_SIGNED") {
    console.log("Ignoring webhook: eventName not SIGNER_SIGNED");
    return jsonResponse(
      {
        ok: true,
        error: "Ignoring webhook: eventName not SIGNER_SIGNED",
      },
      200
    );
  }

  const signerLower = signerEmail.toLowerCase().trim();

  const mapping = await getContractMapping(env, folderId);
  if (!mapping) {
    console.warn("No KV mapping for folderId", folderId);
    return jsonResponse({ ok: true, skipped: true, reason: "No mapping" }, 200);
  }

  const { opportunityId, sellerEmail, buyerEmail, contactId, type, title } =
    mapping;

  if (sellerEmail && signerLower === sellerEmail) {
    const payload = buildUpdateOpportunityPayload(pipelineId, contractSigned);
    return await runStep(
      "seller-signed-update",
      updateOpportunityStage(payload, opportunityId, ghlApiKey)
    );
  }
  if (buyerEmail && signerLower === buyerEmail) {
    const payload = buildUpdateOpportunityPayload(
      pipelineId,
      disposition,
      ghlApiKey
    );
    await runStep("all-parties-signed-update", updateOpportunityStage(payload));
    return;
  }
};

export const handleRabbitWebhook = withErrorHandling(
  "/webhook/rabbitsign",
  rabbitWebhookCore,
  {
    swallowError: true,
    successStatus: 200,
  }
);
