import { handleRequest } from "./routes/router.js";

export default {
  async fetch(request, env, ctx) {
    try {
      return await handleRequest(request, env, ctx);
    } catch (err) {
      console.error("Unhandled error in Worker:", err);
      return new Response("Internal error", { status: 500 });
    }
  },
};
