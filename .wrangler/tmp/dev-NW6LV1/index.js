var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/http.js
var jsonResponse = /* @__PURE__ */ __name((data, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}, "jsonResponse");
var withErrorHandling = /* @__PURE__ */ __name((handler) => {
  return async (request, env, type) => {
    try {
      return await handler(request, env, type);
    } catch (err) {
      console.error("[worker error]", err);
      return jsonResponse(
        {
          ok: false,
          error: "Worker internal error"
        },
        500
      );
    }
  };
}, "withErrorHandling");
var forwardJsonToBackend = /* @__PURE__ */ __name(async ({
  env,
  path,
  // e.g. `/tenant/${TENANT_ID}/prefill`
  body,
  method = "POST"
}) => {
  const url = `${env.BACKEND_URL}${path}`;
  console.log(url);
  const resp = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const text = await resp.text();
  return new Response(text, {
    status: resp.status,
    headers: {
      "Content-Type": resp.headers.get("content-type") || "application/json"
    }
  });
}, "forwardJsonToBackend");

// src/handlers.js/health.js
var handleHealth = /* @__PURE__ */ __name(async (request, env) => {
  return jsonResponse(
    {
      ok: true,
      worker: "up",
      tenantId: env.TENANT_ID || null
    },
    200
  );
}, "handleHealth");

// src/mapping.js
var mapGhlToCtx = /* @__PURE__ */ __name((ghlPayload, type) => {
  const customData = ghlPayload.customData;
  const userData = ghlPayload.userData;
  return {
    contractType: type,
    opportunityId: ghlPayload.id,
    seller: {
      ghlContactId: ghlPayload.contact_id,
      fullName: ghlPayload.full_name,
      email: ghlPayload.email,
      phone: ghlPayload.phone
    },
    // Buyer may be optional for some flows
    buyer: {
      fullName: `${userData.firstName} ${userData.lastName}`,
      email: userData.email,
      phone: userData.phone
    },
    property: {
      propertyAddress: ghlPayload.address1,
      propertyCity: ghlPayload.city,
      propertyState: ghlPayload.state,
      propertyZip: ghlPayload.postal_code
    },
    deal: {
      purchasePrice: customData.purchasePrice,
      earnestMoney: customData.earnestMoney,
      titleCompany: customData.titleCompany,
      optionPeriod: customData.optionPeriod,
      inspectionPeriod: customData.inspectionPeriod || customData.optionPeriod,
      closingDate: customData.closingDate
    }
  };
}, "mapGhlToCtx");

// src/handlers.js/prefill.js
var handlePrefill = withErrorHandling(async (request, env, type) => {
  if (request.method !== "POST") {
    return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
  }
  const rawBody = await request.json();
  const prefillCtx = mapGhlToCtx(rawBody, type);
  if (!prefillCtx.contractType || !prefillCtx.opportunityId) {
    return jsonResponse(
      {
        ok: false,
        error: "contractType and opportunityId are required in ctx"
      },
      400
    );
  }
  const path = `/tenant/${encodeURIComponent(env.TENANT_ID)}/prefill`;
  return forwardJsonToBackend({
    env,
    path,
    body: prefillCtx
  });
});

// src/handlers.js/webhook.js
var handleRabbitsignWebhook = withErrorHandling(
  async (request, env) => {
    if (request.method !== "POST") {
      return jsonResponse({ ok: false, error: "Method not allowed" }, 405);
    }
    const body = await request.json();
    const path = `/tenant/${encodeURIComponent(
      env.TENANT_ID
    )}/webhooks/rabbitsign`;
    return forwardJsonToBackend({
      env,
      path,
      body
    });
  }
);

// src/router.js
var handleRequest = /* @__PURE__ */ __name(async (request, env) => {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const type = pathname.split("/prefill/")[1];
  const method = request.method.toUpperCase();
  if (method === "GET" && pathname === "/health") {
    return handleHealth(request, env);
  }
  if (method === "POST" && pathname.startsWith("/prefill/")) {
    return handlePrefill(request, env, type);
  }
  if (method === "POST" && pathname === "/webhooks/rabbitsign") {
    return handleRabbitsignWebhook(request, env);
  }
  return new Response("Not found", { status: 404 });
}, "handleRequest");

// src/index.js
var src_default = {
  fetch: /* @__PURE__ */ __name((request, env) => handleRequest(request, env), "fetch")
};

// ../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-zSCxAg/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = src_default;

// ../../../../opt/homebrew/lib/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-zSCxAg/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
