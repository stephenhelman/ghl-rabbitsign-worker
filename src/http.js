export const jsonResponse = (data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const withErrorHandling = (handler) => {
  return async (request, env, type, tenantId) => {
    try {
      return await handler(request, env, type, tenantId);
    } catch (err) {
      console.error("[worker error]", err);
      return jsonResponse(
        {
          ok: false,
          error: "Worker internal error",
        },
        500
      );
    }
  };
};

export const forwardJsonToBackend = async ({
  env,
  path,
  body,
  method = "POST",
}) => {
  const url = `${env.BACKEND_URL}${path}`;

  const resp = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const text = await resp.text();

  return new Response(text, {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("content-type") || "application/json",
    },
  });
};
