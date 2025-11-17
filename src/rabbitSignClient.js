//this files stores the logic that will be passed to the different handlers
// Handler/prefill
// Handler/folderDetails
import { buildRabbitPrefillPayload } from "./prefill/mapping";

// general use rabbit sign API request generator
const rabbitSignAPI = async (
  rabbitSignSecret,
  rabbitKeyId,
  { method, path, body = null }
) => {
  const upperMethod = method.toUpperCase();
  const url = `https://www.rabbitsign.com${path}`;

  // UTC time for header & signature
  const utc = new Date().toISOString().split(".")[0] + "Z";

  // Signature input: "METHOD {path} {utc} {KEY_SECRET}"
  const input = `${upperMethod} ${path} ${utc} ${rabbitSignSecret}`;
  const sigBuf = await crypto.subtle.digest(
    "SHA-512",
    new TextEncoder().encode(input)
  );
  const signature = [...new Uint8Array(sigBuf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();

  const headers = {
    "x-rabbitsign-api-time-utc": utc,
    "x-rabbitsign-api-key-id": rabbitKeyId,
    "x-rabbitsign-api-signature": signature,
    "User-Agent": "GHL-Worker/1.0",
  };

  let fetchOptions = { method: upperMethod, headers };

  if (body !== undefined && body !== null) {
    headers["Content-Type"] = "application/json";
    fetchOptions.body = JSON.stringify(body);
  }

  const resp = await fetch(url, fetchOptions);
  const data = await resp.json().catch((err) => ("rabbit sign API error", err));

  console.log("Rabbit Sign folder details", {
    path,
    status: resp.status,
    ok: resp.ok,
    data,
  });

  return {
    ok: resp.ok,
    status: resp.status,
    data,
  };
};

//function to create a rabbitsign contract folder
export const createFolderFromTemplate = async (
  templateId,
  body,
  date,
  typeLabel,
  rabbitSignSecret,
  rabbitKeyId
) => {
  const path = `/api/v1/folderFromTemplate/${templateId}`;

  const payload = buildRabbitPrefillPayload(body, date, typeLabel);

  return rabbitSignAPI(rabbitSignSecret, rabbitKeyId, {
    method: "POST",
    path,
    body: payload,
  });
};

export const getFolderDetails = async (env, folderId) => {
  if (!folderId) {
    throw new Error("folderId is required to fetch folder details");
  }

  const path = `/api/v1/folder/${folderId}`;

  return rabbitSignAPI(rabbitSignSecret, rabbitKeyId, {
    method: "GET",
    path,
  });
};

export const getDownloadLinkFromFolder = (data) => {
  if (!data || typeof data !== "object") return null;

  return (
    data.downloadUrl ||
    data.downloadURL ||
    data.pdfUrl ||
    data.pdfURL ||
    (Array.isArray(data.documents) && data.documents[0]?.downloadUrl) ||
    null
  );
};
