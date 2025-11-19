import { jsonResponse } from "../util/http";

export async function ghlRequest(ghlApiKey, { method, path, jsonBody }) {
  const GHL_BASE_URL = "https://services.leadconnectorhq.com";
  const url = `${GHL_BASE_URL}${path}`;
  const headers = {
    Authorization: `Bearer ${ghlApiKey}`,
    Version: "2021-07-28",
  };

  const options = {
    method: method.toUpperCase(),
    headers,
  };

  if (jsonBody !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(jsonBody);
  }

  const resp = await fetch(url, options);
  const text = await resp.text().catch(() => "");
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  console.log("GHL response", {
    path: url,
    status: resp.status,
    ok: resp.ok,
    data,
  });

  return jsonResponse({ ok: resp.ok, data }, resp.status);
}

export const updateOpportunityStage = async (
  payload,
  opportunityId,
  ghlApiKey
) => {
  const path = `/opportunities/${opportunityId}`;

  const moveResp = await ghlRequest(ghlApiKey, {
    method: "PUT",
    path,
    jsonBody: payload,
  });

  if (!moveResp.ok) {
    console.log(
      `GHL stage update failed ${moveResp.status}: ${JSON.stringify(
        moveResp.data
      )}`
    );
    return jsonResponse(
      {
        ok: false,
        error: `GHL stage update failed ${moveResp.status}: ${JSON.stringify(
          moveResp.data
        )}`,
      },
      502
    );
  }

  return jsonResponse(
    { ok: moveResp.ok, data: moveResp.data },
    moveResp.status
  );
};

export const createSignedDocumentRecord = async (
  locationId,
  contactId,
  folderId,
  opportunityId,
  type,
  title
) => {
  //payload mapper

  const [, propertyAddress] = title.split(/\s*-\s*/);
  const docPayload = {
    locationId: locationId,
    properties: {
      signed_documents: title,
      documenttype: type,
      signedpdfurl: downloadUrl,
      rabbitfolderid: folderId,
      property_address: propertyAddress,
      opportunityid: opportunityId,
      contactid: contactId,
      signed_pdf: "",
    },
  };

  const objectKey = env.SIGNED_DOCUMENT_OBJECT_KEY;

  const path = `/objects/${encodeURIComponent(objectKey)}/records`;

  const result = await ghlRequest(env, {
    method: "POST",
    path,
    jsonBody: docPayload,
  });

  return jsonResponse(
    {
      ok: result.ok,
      data: result.data,
    },
    result.status
  );
};
