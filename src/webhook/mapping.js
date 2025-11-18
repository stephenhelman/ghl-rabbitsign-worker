export const buildUpdateOpportunityPayload = (pipelineId, stageId) => {
  return {
    pipelineId: pipelineId,
    pipelineStageId: stageId,
    status: "open",
  };
};
