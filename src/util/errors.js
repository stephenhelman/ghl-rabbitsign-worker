// src/errors.js
import { jsonResponse } from "./http.js";

export const withErrorHandling = (
  routeName,
  handler,
  { swallowError = false, successStatus = 200 } = {}
) => {
  return async function wrappedHandler(request, env, ctx) {
    const start = Date.now();

    try {
      const res = await handler(request, env, ctx);

      // If the handler returned a Response already, respect it
      if (res instanceof Response) {
        return res;
      }

      // Otherwise, wrap returned value in JSON
      return jsonResponse(res, successStatus);
    } catch (err) {
      const duration = Date.now() - start;
      const errorId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      console.error(`[route:${routeName}] errorId=${errorId}`, {
        message: err?.message,
        stack: err?.stack,
        durationMs: duration,
      });

      // For debugging only; don't send full stack to the outside world in prod
      const showDetails = env.DEBUG_ERRORS === "true";

      const errorBody = {
        ok: false,
        route: routeName,
        errorId,
        error: "Internal error",
        ...(showDetails && {
          details: String(err),
        }),
      };

      if (swallowError) {
        return jsonResponse(errorBody, successStatus);
      }

      return jsonResponse(errorBody, 500);
    }
  };
};
