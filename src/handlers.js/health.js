// src/handlers/health.js
import { jsonResponse } from "../http.js";

export const handleHealth = async (request, env) => {
  return jsonResponse(
    {
      ok: true,
      worker: "up",
      tenantId: env.TENANT_ID || null,
    },
    200
  );
};
