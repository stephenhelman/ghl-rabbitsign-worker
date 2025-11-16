const GHL_BASE_URL = "https://services.leadconnectorhq.com";

async function ghlRequest(env, { method, path, jsonBody }) {
  const url = `${GHL_BASE_URL}${path}`;
  const headers = {
    Authorization: `Bearer ${env.GHL_API_KEY}`,
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

  return { ok: resp.ok, status: resp.status, data };
}

export async function createSignedDocumentRecord(env, payload) {
  const { signedDocObjectId } = payload.config;
  const url = `/objects/${signedDocObjectId}/records`;

  return ghlRequest(env, {
    method: "POST",
    path: url,
    jsonBody: {
      locationId: payload.config.locationId,
      properties: payload.properties,
    },
  });
}
