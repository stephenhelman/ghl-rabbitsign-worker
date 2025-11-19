import { resolveConfig } from "../config/config.js";
import { jsonResponse } from "../util/http.js";
import { parseBodyForKVData, saveContractMapping } from "../util/kvStore.js";
import { createFolderFromTemplate } from "../api/rabbitSignClient.js";
import { withErrorHandling } from "../util/errors.js";
import { confirmBody, formatContractType } from "../util/util";

const prefillCore = async (request, env) => {
  const url = new URL(request.url);
  const type = (url.pathname.split("/")[2] || "").toLowerCase();

  const { templateMap, rabbitKeyId, rabbitSignSecret } = resolveConfig(env);

  // 1. Confirm the body exists
  const body = confirmBody(request);

  // 2. Resolve template ID for this contract type from TEMPLATE_CONFIG_JSON
  const templateId = templateMap[type];
  if (!templateId) {
    return jsonResponse(
      {
        ok: false,
        error: `No template configured for contract type "${type}". Check TEMPLATE_CONFIG_JSON.`,
      },
      400
    );
  }

  // 3. Get the information that we will need for our KV
  const opportunityData = parseBodyForKVData(body);

  // 4. Start setting up the payload to send to Rabbit Sign
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(now.getDate()).padStart(2, "0")}`;
  const typeLabel = formatContractType(type);
  const title = `${typeLabel} - ${
    body.customData.propertyAddress || "No Address"
  }`;

  // 5. Send the request to create a folder
  let folderResult;
  try {
    folderResult = await createFolderFromTemplate(
      templateId,
      body,
      date,
      title,
      rabbitSignSecret,
      rabbitKeyId
    );
  } catch (err) {
    console.error("RabbitSign prefill error:", err);
    return jsonResponse(
      { ok: false, error: "Failed to create RabbitSign folder" },
      502
    );
  }

  const folderId = folderResult.data.folderId;

  // 6. Save KV mapping so webhook can find everything later
  const savedKv = await saveContractMapping(env, folderId, {
    ...opportunityData,
    type,
    title,
  });

  // 7. Return success + folder info
  return jsonResponse({
    ok: true,
    data: savedKv,
  });
};

export const handlePrefillRequest = withErrorHandling("prefill", prefillCore, {
  swallowError: true,
  successStatus: 200,
});
