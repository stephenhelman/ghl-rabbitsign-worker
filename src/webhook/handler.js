import { updateOpportunityStage } from "../api/ghlClient";
import { withErrorHandling } from "../util/errors";
import { jsonResponse } from "../util/http";
import { buildUpdateOpportunityPayload } from "./mapping";

//client - hosts the api call logic
//handlers - calls the api functions
//mapping - builds the payloads for the handlers to use

const updateOpportunityCore = async (pipelineId, stageId, opportunityId) => {
  if (!opportunityId || !stageId || !pipelineId) return false;

  const payload = buildUpdateOpportunityPayload(pipelineId, stageId);

  let updateResponse;
  try {
    updateResponse = await updateOpportunityStage(payload, opportunityId);
  } catch (err) {
    console.log("GHL update opportunity failed", err);
    return jsonResponse({ ok: false, error: e.message }, e.status);
  }

  return jsonResponse(
    { ok: true, data: updateResponse },
    updateResponse.status
  );
};

export const handleUpdateOpportunity = withErrorHandling(
  "/webhook/rabbitsign",
  updateOpportunityCore,
  {
    swallowError: true,
    successStatus: 200,
  }
);
